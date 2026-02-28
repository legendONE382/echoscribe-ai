// ========== USER & STATE ==========
let userId = localStorage.getItem('userId') || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
localStorage.setItem('userId', userId);
let recordedBlob = null;
let lastTranscript = '';
let lastPlatforms = {};

// ========== DOM ELEMENTS ==========
const audioFile = document.getElementById('audioFile');
const recordBtn = document.getElementById('recordBtn');
const stopRecordBtn = document.getElementById('stopRecordBtn');
const audioPlayback = document.getElementById('audioPlayback');
const transcriptArea = document.getElementById('transcriptArea');
const transcriptText = document.getElementById('transcriptText');
const generateBtn = document.getElementById('generateBtn');
const loadingArea = document.getElementById('loadingArea');
const platformTabs = document.getElementById('platformTabs');
const panelBody = document.getElementById('panelBody');
const actionButtons = document.getElementById('actionButtons');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const regenerateBtn = document.getElementById('regenerateBtn');
const professionSelect = document.getElementById('profession');
const toneSelect = document.getElementById('tone');

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
  // Load saved preferences
  professionSelect.value = localStorage.getItem('profession') || 'coaching';
  toneSelect.value = localStorage.getItem('tone') || 'professional';

  // Update profession on change
  professionSelect.addEventListener('change', (e) => {
    localStorage.setItem('profession', e.target.value);
    fetch('/profession', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, profession: e.target.value })
    }).catch(err => console.error('❌ Profession update failed:', err));
  });

  // Persist tone selection
  toneSelect.addEventListener('change', (e) => {
    localStorage.setItem('tone', e.target.value);
  });
});

// ========== FILE UPLOAD ==========
audioFile.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  console.log(`📤 File selected: ${file.name}`);
  handleUpload(file);
});

async function handleUpload(file) {
  const formData = new FormData();
  formData.append('audio', file);
  
  showLoading(true);
  transcriptArea.style.display = 'none';
  
  try {
    console.log('🚀 Uploading and transcribing...');
    const res = await fetch('/transcribe', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken}` },
      body: formData
    });
    
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    
    const data = await res.json();
    console.log('✅ Transcription complete');
    
    lastTranscript = data.transcript || '';
    transcriptText.textContent = lastTranscript;
    transcriptArea.style.display = 'block';
    
  } catch (err) {
    console.error('❌ Upload failed:', err);
    transcriptText.textContent = 'Error: Failed to transcribe. Please try again.';
    transcriptArea.style.display = 'block';
  } finally {
    showLoading(false);
  }
}

// ========== VOICE RECORDING ==========
let recorder;
let mediaStream;

recordBtn.addEventListener('click', async () => {
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recorder = new MediaRecorder(mediaStream);
    const chunks = [];
    
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
      recordedBlob = new Blob(chunks, { type: 'audio/webm' });
      const url = URL.createObjectURL(recordedBlob);
      audioPlayback.src = url;
      audioPlayback.style.display = 'block';
    };
    
    recorder.start();
    recordBtn.style.display = 'none';
    stopRecordBtn.style.display = 'block';
    console.log('🎤 Recording started...');
  } catch (err) {
    console.error('❌ Microphone access denied:', err);
    alert('Microphone access denied. Please allow microphone access.');
  }
});

stopRecordBtn.addEventListener('click', () => {
  if (recorder) {
    recorder.stop();
    mediaStream.getTracks().forEach(track => track.stop());
  }
  recordBtn.style.display = 'block';
  stopRecordBtn.style.display = 'none';
  
  // Use the recording
  setTimeout(() => {
    if (recordedBlob) {
      console.log('📝 Using recorded audio');
      handleUpload(new File([recordedBlob], 'recording.webm', { type: 'audio/webm' }));
    }
  }, 500);
});

// ========== CONTENT GENERATION ==========
generateBtn.addEventListener('click', generateContent);

async function generateContent() {
  if (!lastTranscript) {
    alert('No transcript available');
    return;
  }
  
  // Get selected platforms
  const platformChecks = document.querySelectorAll('input[name="platform"]:checked');
  const platforms = Array.from(platformChecks).map(el => el.value);
  
  if (platforms.length === 0) {
    alert('Please select at least one platform');
    return;
  }
  
  const tone = toneSelect.value;
  
  showLoading(true);
  panelBody.innerHTML = '<p style="text-align: center; color: #888;">Generating content...</p>';
  
  try {
    console.log(`🤖 Generating content for: ${platforms.join(', ')}`);
    const res = await fetch('/generate-content', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ transcript: lastTranscript, tone, platforms })
    });
    
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    
    const data = await res.json();
    console.log('✅ Content generation complete');
    
    lastPlatforms = data.platforms || {};
    displayResults(lastPlatforms);
    
  } catch (err) {
    console.error('❌ Generation failed:', err);
    panelBody.innerHTML = '<p style="color: #f44;">Error generating content. Please try again.</p>';
  } finally {
    showLoading(false);
  }
}

// ========== DISPLAY RESULTS ==========
function displayResults(platforms) {
  // Create tabs
  platformTabs.innerHTML = '';
  panelBody.innerHTML = '';
  
  const platformList = Object.keys(platforms);
  
  platformList.forEach((platform, idx) => {
    const tab = document.createElement('button');
    tab.className = `tab ${idx === 0 ? 'active' : ''}`;
    tab.textContent = platform.charAt(0).toUpperCase() + platform.slice(1);
    tab.onclick = () => switchTab(platform, tab);
    platformTabs.appendChild(tab);
  });
  
  // Display first platform content
  if (platformList.length > 0) {
    switchTab(platformList[0], platformTabs.firstChild);
  }
  
  actionButtons.style.display = 'flex';
}

function switchTab(platform, tabEl) {
  // Update active tab
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  tabEl.classList.add('active');
  
  // Display content
  const content = lastPlatforms[platform] || '';
  panelBody.innerHTML = `
    <div class="content-section">
      <div class="platform-title">${platform.toUpperCase()}</div>
      <div class="platform-text">${content}</div>
    </div>
  `;
}

// ========== ACTIONS ==========
copyBtn.addEventListener('click', () => {
  const content = Array.from(document.querySelectorAll('.platform-text'))
    .map(el => el.textContent)
    .join('\n\n---\n\n');
  
  navigator.clipboard.writeText(content).then(() => {
    console.log('✅ Copied to clipboard');
    alert('Content copied to clipboard!');
  }).catch(err => console.error('Copy failed:', err));
});

downloadBtn.addEventListener('click', () => {
  const content = Array.from(document.querySelectorAll('.platform-text'))
    .map(el => el.textContent)
    .join('\n\n---\n\n');
  
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `content_${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  console.log('✅ Content downloaded');
});

regenerateBtn.addEventListener('click', generateContent);

// ========== HELPERS ==========
function showLoading(show) {
  loadingArea.style.display = show ? 'block' : 'none';
  generateBtn.disabled = show;
}
