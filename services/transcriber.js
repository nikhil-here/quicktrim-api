// services/transcriber.js
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { parse } = require('subtitle');
const { v4: uuidv4 } = require('uuid');
const { TranscriptionCue, TranscribeResponse } = require('./transcribeResponse');

function formatDate() {
  // Format current date as YYYYMMDD_HHmmss.
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}_${hours}${minutes}${seconds}`;
}

function transcribeAudio(audioPath, model = 'base', language) {
  return new Promise((resolve, reject) => {
    const outputFormat = 'srt';
    const outputDir = 'transcribe'; // renamed output directory

    // Ensure the output directory exists.
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Use the input file's basename to determine the original output file name.
    const inputFileBase = path.parse(audioPath).name;
    const originalOutputFile = path.join(outputDir, `${inputFileBase}.${outputFormat}`);

    // Generate a new filename that contains a UUID and timestamp.
    const newFileName = `${uuidv4()}_${formatDate()}.${outputFormat}`;
    const newOutputFile = path.join(outputDir, newFileName);

    // Prepare arguments for the Whisper CLI.
    const args = [
      audioPath,
      '--model', model,
      '--output_format', outputFormat,
      '--output_dir', outputDir,
    ];

    if (language) {
      args.push('--language', language);
    }

    const whisper = spawn('whisper', args);

    whisper.stdout.on('data', (data) => {
      process.stdout.write(`[Whisper STDOUT] ${data}`);
    });

    whisper.stderr.on('data', (data) => {
      process.stderr.write(`[Whisper STDERR] ${data}`);
    });

    whisper.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error('Whisper transcription failed.'));
      }

      // After transcription completes, rename the generated srt file.
      fs.access(originalOutputFile, fs.constants.F_OK, (err) => {
        if (err) {
          return reject(new Error('Output transcription file not found.'));
        }

        fs.rename(originalOutputFile, newOutputFile, (err) => {
          if (err) {
            return reject(new Error('Failed to rename transcription file.'));
          }

          // Parse the newly renamed transcription file into JSON.
          const transcriptionResponse = new TranscribeResponse();
          const readStream = fs.createReadStream(newOutputFile, 'utf8');
          const transcriptionParser = readStream.pipe(parse());

          transcriptionParser.on('data', (entry) => {
            if (entry.type === 'cue') {
              const cue = new TranscriptionCue(
                Math.floor(entry.data.start),
                Math.floor(entry.data.end),
                entry.data.text.trim()
              );
              transcriptionResponse.addCue(cue);
            }
          });

          transcriptionParser.on('end', () => {
            resolve(transcriptionResponse);
          });

          transcriptionParser.on('error', () => {
            reject(new Error('Error parsing transcription file.'));
          });
        });
      });
    });

    whisper.on('error', () => {
      reject(new Error('Error executing whisper command.'));
    });
  });
}

module.exports = { transcribeAudio };
