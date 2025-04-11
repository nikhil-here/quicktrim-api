# QuickTrim Transcription API

QuickTrim Transcription API is a Node.js service that leverages OpenAI's Whisper CLI to convert audio files into transcriptions in SRT format. This guide explains the basics of Whisper and demonstrates how we invoke it from Node.js.

## Table of Contents

- [Overview](#overview)
- [How OpenAI Whisper CLI Works](#how-openai-whisper-cli-works)
- [Installation & Usage](#how-openai-whisper-cli-works)

## Overview

The service exposes a `/transcribe` API endpoint that:
1. Receives an audio file upload.
2. Invokes OpenAI's Whisper CLI to transcribe the audio file into an SRT file.
3. Parses the SRT file into a structured JSON response containing transcription cues (start time, end time, and the transcription text).

## How OpenAI Whisper CLI Works

[OpenAI's Whisper CLI](https://github.com/openai/whisper) is a Python-based command-line tool for speech recognition. When supplied with an audio file, it processes the audio and outputs a transcription in a chosen format—in our case, SRT. We are using Node.js's built-in `child_process` library to run the Whisper CLI command. This allows our Node.js server to execute CLI commands (like Whisper) directly and then use the produced output for further processing. 

Here is a concise code snippet showing how we invoke the Whisper CLI using Node.js:

```js
const { spawn } = require('child_process');

const args = [
  audioPath,               // Path to the input audio file.
  '--model', model,        // Selected transcription model (e.g., base).
  '--output_format', 'srt',// Set output format to SRT.
  '--output_dir', outputDir// Specify the directory for generated files.
];

if (language) {
  args.push('--language', language); // Optionally specify a language.
}

const whisper = spawn('whisper', args);
```

## Installation & Usage

### Starting the Server
```
git clone https://github.com/nikhil-here/quicktrim-api
cd quicktrim-api
npm install 
node index.js
```

### Testing the Transcription API
```
curl -X POST http://localhost:3000/transcribe \
  -F "audio=@/path/to/your/audiofile.mp3" \
  -F "model=base" \
  -F "language=en"
```

### Response
```
{
  "transcriptions": [
    {
      "start": 1,
      "end": 3,
      "transcription": "Hello, welcome to the transcription service."
    },
    {
      "start": 4,
      "end": 6,
      "transcription": "This is an example transcription cue."
    }
  ]
}
```
