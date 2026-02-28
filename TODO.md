# TODO List for Voice-to-Content Engine Features

## Content Snippet Selection
- [ ] Add event listeners for text selection in `public/script.js`
- [ ] Create a popup menu with options "Turn selection into LinkedIn Post" and "Generate Tweet thread from selection"
- [ ] Implement logic to send selected text to the backend for processing
- [ ] Update `server.js` to handle the new endpoint for processing selected text
- [ ] Modify content generation logic to handle snippet-based requests

## Tone of Voice Customization
- [ ] Add a dropdown menu in `public/index.html` for selecting the tone of voice
- [ ] Update `public/script.js` to send the selected tone to the backend
- [ ] Modify the system prompt in `server.js` to include the selected tone

## Frictionless Importing
- [ ] Update `server.js` to handle URL imports using yt-dlp or a similar library
- [ ] Add a new endpoint `/import-url` to process the URL and extract the audio
- [ ] Install yt-dlp or a similar library for handling URL imports

## Speaker Diarization
- [ ] Update `server.js` to include speaker diarization logic
- [ ] Use a specific Hugging Face model or add-on for diarization
- [ ] Modify `public/script.js` to display speaker labels in the transcript

## Transparent Quota Management
- [ ] Update `server.js` to track usage and calculate the usage percentage
- [ ] Add a new endpoint `/usage` to return the usage meter
- [ ] Modify `public/index.html` to display the usage meter
- [ ] Update `public/script.js` to fetch and display the usage data

## Testing
- [ ] Test each feature individually to ensure it works correctly
- [ ] Integrate all features and test the full flow: upload -> transcribe -> generate content with new features
- [ ] Gather user feedback and make any necessary adjustments
