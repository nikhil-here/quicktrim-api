// index.js
const express = require('express');
const multer = require('multer');
const { transcribeAudio } = require('./services/transcriber');
const { exec } = require('child_process');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    const audioPath = req.file.path;
    const model = req.body.model || 'base';
    const language = req.body.language; // optional

    const response = await transcribeAudio(audioPath, model, language);
    res.json(response.toJSON());
  } catch (error) {
    console.error('Error in transcription:', error);
    res.status(500).json({ error: error.message });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);

  // Retrieve and log the private IP address using the en0 network interface.
  exec('ipconfig getifaddr en0', (error, stdout) => {
    if (error) {
      console.error('Error retrieving private IP address:', error);
      return;
    }
    const privateIP = stdout.trim();
    console.log('Server private IP:', privateIP);
  });
});
