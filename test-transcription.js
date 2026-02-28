const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function testTranscription() {
  try {
    const audioPath = path.join(__dirname, 'uploads', 'sample.mp3');
    if (!fs.existsSync(audioPath)) {
      console.error('Error: sample.mp3 not found in uploads directory.');
      return;
    }

    const FormData = require('form-data');
    const form = new FormData();
    form.append('audio', fs.createReadStream(audioPath));

    console.log('Testing /transcribe endpoint with sample.mp3...');
    const response = await axios.post('http://localhost:3002/transcribe', form, {
      headers: {
        ...form.getHeaders()
      },
      maxContentLength: 200 * 1024 * 1024,
      maxBodyLength: 200 * 1024 * 1024
    });

    console.log('Response status:', response.status);
    console.log('Transcript:', response.data.transcript);

  } catch (error) {
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testTranscription();
