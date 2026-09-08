// ========== MOBILE MENU ==========
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('show');

  if (sidebar.classList.contains('show')) {
    document.addEventListener('click', closeSidebarOnClickOutside);
  } else {
    document.removeEventListener('click', closeSidebarOnClickOutside);
  }
}

function closeSidebarOnClickOutside(e) {
  const sidebar = document.getElementById('sidebar');
  const menuToggle = document.getElementById('menuToggle');

  if (window.innerWidth <= 768) {
    if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
      sidebar.classList.remove('show');
      document.removeEventListener('click', closeSidebarOnClickOutside);
    }
  }
}

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

// ========== AUTH HEADERS ==========
function getAuthHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken || ''}`
  };
}

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
  professionSelect.value = localStorage.getItem('profession') || 'coaching';
  toneSelect.value = localStorage.getItem('tone') || 'professional';

  professionSelect.addEventListener('change', (e) => {
    localStorage.setItem('profession', e.target.value);
    fetch('/profession', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, profession: e.target.value })
    }).catch(err => console.error('❌ Profession update failed:', err));
  });

  toneSelect.addEventListener('change', (e) => {
    localStorage.setItem('tone', e.target.value);
  });
});

// ========== FILE UPLOAD ==========
audioFile.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  handleUpload(file);
});

async function handleUpload(file) {
  const formData = new FormData();
  formData.append('audio', file);

  showLoading(true);
  transcriptArea.style.display = 'none';

  try {
    const res = await fetch('/transcribe', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken}` },
      body: formData
    });

    if (!res.ok) throw new Error(`Server error: ${res.status}`);

    const data = await res.json();
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

  setTimeout(() => {
    if (recordedBlob) {
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

  const platformChecks = document.querySelectorAll('input[name="platform"]:checked');
  const platforms = Array.from(platformChecks).map(el => el.value);

  if (platforms.length === 0) {
    alert('Please select at least one platform');
    return;
  }

  const tone = toneSelect.value;

  showLoading(true);
  panelBody.innerHTML = '<p style="text-align: center; color: #888; padding: 40px 0;">Generating content…</p>';

  try {
    const res = await fetch('/generate-content', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ transcript: lastTranscript, tone, platforms })
    });

    if (!res.ok) throw new Error(`Server error: ${res.status}`);

    const data = await res.json();
    lastPlatforms = data.platforms || {};
    displayResults(lastPlatforms);

  } catch (err) {
    console.error('❌ Generation failed:', err);
    panelBody.innerHTML = '<p style="color: #f44; text-align: center; padding: 40px 0;">Error generating content. Please try again.</p>';
  } finally {
    showLoading(false);
  }
}

// ========== DISPLAY RESULTS ==========
function displayResults(platforms) {
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

  if (platformList.length > 0) {
    switchTab(platformList[0], platformTabs.firstChild);
  }

  actionButtons.style.display = 'flex';
}

function switchTab(platform, tabEl) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  tabEl.classList.add('active');

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

  if (!content) {
    alert('No content to copy');
    return;
  }

  navigator.clipboard.writeText(content).then(() => {
    copyBtn.textContent = '✅ Copied!';
    setTimeout(() => { copyBtn.textContent = '📋 Copy'; }, 2000);
  }).catch(err => console.error('Copy failed:', err));
});

downloadBtn.addEventListener('click', () => {
  const content = Array.from(document.querySelectorAll('.platform-text'))
    .map(el => el.textContent)
    .join('\n\n---\n\n');

  if (!content) {
    alert('No content to download');
    return;
  }

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `content_${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
});

regenerateBtn.addEventListener('click', generateContent);

// ========== HELPERS ==========
function showLoading(show) {
  loadingArea.style.display = show ? 'block' : 'none';
  generateBtn.disabled = show;
  generateBtn.textContent = show ? '⏳ Processing…' : '✨ Generate Content';
}
