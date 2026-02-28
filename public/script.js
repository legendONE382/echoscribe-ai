// ========================================
// USER ID & INIT
// ========================================
let userId = localStorage.getItem("userId") || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
localStorage.setItem("userId", userId);
let recordedBlob = null;

// ========================================
// DOM ELEMENTS
// ========================================
const uploadForm = document.getElementById("uploadForm");
const uploadBtn = document.querySelector('button[type="submit"]');
const audioFile = document.getElementById("audioFile");
const progress = document.getElementById("progress");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");
const results = document.getElementById("results");
const panelBody = document.getElementById("panelBody");

const sidebarUpload = document.getElementById("sidebarUploadBtn");
const copyBtn = document.getElementById("copyBtn");
const downloadBtn = document.getElementById("downloadBtn");
const regenBtn = document.getElementById("regenBtn");
const transcriptArea = document.getElementById("transcript");
const professionSelect = document.getElementById("professionSelect");
const toneSelect = document.getElementById("toneSelect");
const libraryBtn = document.getElementById("libraryBtn");
const transcriptPane = document.getElementById("transcriptPane");
const themes = document.getElementById("themes");

// ========================================
// INITIALIZATION
// ========================================
document.addEventListener("DOMContentLoaded", () => {
  // Load saved preferences
  const savedProfession = localStorage.getItem("userProfession") || "coaching";
  if (professionSelect) professionSelect.value = savedProfession;
  if (toneSelect) toneSelect.value = localStorage.getItem("userTone") || "professional";

  // Set up profession change
  if (professionSelect) {
    professionSelect.addEventListener("change", async (e) => {
      const profession = e.target.value;
      localStorage.setItem("userProfession", profession);
      await fetch("/profession", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, profession }),
      }).catch(console.error);
    });
  }

  // Set up tone change
  if (toneSelect) {
    toneSelect.addEventListener("change", (e) => {
      localStorage.setItem("userTone", e.target.value);
    });
  }

  // Library button
  if (libraryBtn) {
    libraryBtn.addEventListener("click", () => {
      window.location.href = `/library?userId=${userId}`;
    });
  }

  // Sidebar upload
  if (sidebarUpload && audioFile) {
    sidebarUpload.addEventListener("click", () => audioFile.click());
  }

  // Upload form
  if (uploadForm) {
    uploadForm.addEventListener("submit", handleUpload);
  }

  // Copy button
  if (copyBtn) {
    copyBtn.addEventListener("click", copyAllContent);
  }

  // Download button
  if (downloadBtn) {
    downloadBtn.addEventListener("click", downloadContent);
  }

  // Regen button
  if (regenBtn) {
    regenBtn.addEventListener("click", regenerateContent);
  }

  // Voice recorder
  setupVoiceRecorder();

  // Fetch usage
  fetchUsage();
  setInterval(fetchUsage, 30000);
});

// ========================================
// FILE UPLOAD
// ========================================
async function handleUpload(e) {
  e.preventDefault();
  if (!audioFile?.files[0]) {
    alert("Please select an audio file");
    return;
  }

  const formData = new FormData();
  formData.append("audio", audioFile.files[0]);

  progress.style.display = "block";
  progressText.textContent = "📊 Transcribing audio...";
  progressFill.style.width = "25%";

  try {
    // Transcribe
    const tRes = await fetch(`/transcribe?userId=${userId}`, {
      method: "POST",
      body: formData,
    });

    if (!tRes.ok) throw new Error("Transcription failed");

    const tData = await tRes.json();
    transcriptArea.textContent = tData.transcript || "";
    transcriptPane.style.display = "block";

    progressText.textContent = "🤖 Generating content...";
    progressFill.style.width = "65%";

    // Get selected platforms
    const platforms = Array.from(document.querySelectorAll('.platform-checkboxes input:checked')).map(el => el.value);
    if (platforms.length === 0) {
      alert("Please select at least one platform");
      progress.style.display = "none";
      return;
    }

    // Generate content
    const tone = toneSelect?.value || "professional";
    const cRes = await fetch(`/generate-content?userId=${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transcript: tData.transcript,
        tone,
        platforms
      }),
    });

    if (!cRes.ok) throw new Error("Content generation failed");

    const cData = await cRes.json();
    displayResults(cData);

    progressFill.style.width = "100%";
    progressText.textContent = "✅ Complete!";
    setTimeout(() => (progress.style.display = "none"), 1500);
  } catch (err) {
    console.error(err);
    alert(`Error: ${err.message}`);
    progress.style.display = "none";
  } finally {
    audioFile.value = "";
  }
}

// ========================================
// CONTENT GENERATION
// ========================================
function displayResults(data) {
  try {
    results.style.display = "block";

    // Display themes
    if (themes && data.themes) {
      themes.innerHTML = "";
      data.themes.forEach((t) => {
        const li = document.createElement("li");
        li.textContent = t;
        themes.appendChild(li);
      });
    }

    // Display platform content
    if (data.platforms && Object.keys(data.platforms).length > 0) {
      renderPlatformTabs(data.platforms);
    }
  } catch (err) {
    console.error("displayResults error", err);
  }
}

function renderPlatformTabs(platforms) {
  const platformTabs = document.getElementById("platformTabs");
  if (!platformTabs) return;

  platformTabs.innerHTML = "";
  panelBody.innerHTML = "";

  Object.entries(platforms).forEach(([platform, content], idx) => {
    const tab = document.createElement("button");
    tab.className = `tab ${idx === 0 ? "active" : ""}`;
    tab.textContent = platform.charAt(0).toUpperCase() + platform.slice(1);
    tab.onclick = () => {
      document.querySelectorAll("#platformTabs button").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".platform-content").forEach(c => c.style.display = "none");
      tab.classList.add("active");
      document.getElementById(`content-${platform}`).style.display = "block";
    };
    platformTabs.appendChild(tab);

    const contentDiv = document.createElement("div");
    contentDiv.id = `content-${platform}`;
    contentDiv.className = "platform-content asset-box content-draft";
    contentDiv.style.display = idx === 0 ? "block" : "none";
    contentDiv.textContent = content;
    panelBody.appendChild(contentDiv);
  });
}

function copyAllContent() {
  const allContent = document.querySelectorAll(".platform-content");
  let text = "";
  allContent.forEach((el, idx) => {
    if (el.style.display !== "none") {
      text += `[${el.id.replace("content-", "").toUpperCase()}]\n${el.textContent}\n\n`;
    }
  });

  if (!text) {
    alert("No content to copy");
    return;
  }

  navigator.clipboard.writeText(text).then(() => {
    copyBtn.textContent = "✅ Copied!";
    setTimeout(() => (copyBtn.textContent = "📋 Copy All"), 2000);
  }).catch(() => alert("Copy failed"));
}

function downloadContent() {
  const allContent = document.querySelectorAll(".platform-content");
  let text = `EchoScribe - Generated Content\nCreated: ${new Date().toLocaleString()}\n\n`;
  
  allContent.forEach((el) => {
    text += `=== ${el.id.replace("content-", "").toUpperCase()} ===\n${el.textContent}\n\n`;
  });

  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `echoscribe-${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

async function regenerateContent() {
  if (!transcriptArea.textContent) {
    alert("No transcript to regenerate");
    return;
  }

  progress.style.display = "block";
  progressText.textContent = "🔄 Regenerating...";
  progressFill.style.width = "40%";

  try {
    const platforms = Array.from(document.querySelectorAll('.platform-checkboxes input:checked')).map(el => el.value);
    const tone = toneSelect?.value || "professional";

    const resp = await fetch(`/generate-content?userId=${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transcript: transcriptArea.textContent,
        tone,
        platforms
      }),
    });

    if (!resp.ok) throw new Error("Regeneration failed");

    const data = await resp.json();
    displayResults(data);

    progressFill.style.width = "100%";
    progressText.textContent = "✅ Regenerated!";
    setTimeout(() => (progress.style.display = "none"), 1500);
  } catch (err) {
    alert("Regeneration failed");
    progress.style.display = "none";
  }
}

// ========================================
// VOICE RECORDER
// ========================================
let mediaRecorder;
let recordedChunks = [];

function setupVoiceRecorder() {
  const startBtn = document.getElementById("erbStart");
  const stopBtn = document.getElementById("erbStop");
  const audioOut = document.getElementById("erbAudio");
  const useBtn = document.getElementById("useRecordingBtn");

  if (!startBtn || !stopBtn) return;

  startBtn.onclick = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordedChunks = [];
      mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        recordedBlob = new Blob(recordedChunks, { type: "audio/webm" });
        audioOut.src = URL.createObjectURL(recordedBlob);
        useBtn.style.display = "block";
      };

      mediaRecorder.start();
      startBtn.style.display = "none";
      stopBtn.style.display = "block";
    } catch (err) {
      alert("Microphone access denied");
    }
  };

  stopBtn.onclick = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      startBtn.style.display = "block";
      stopBtn.style.display = "none";
    }
  };

  if (useBtn) {
    useBtn.onclick = () => {
      if (recordedBlob) {
        const file = new File([recordedBlob], "recording.webm", { type: "audio/webm" });
        const dt = new DataTransfer();
        dt.items.add(file);
        audioFile.files = dt.files;
        document.getElementById('fileName').textContent = `✓ Recording ready`;
        uploadForm.dispatchEvent(new Event("submit"));
      }
    };
  }
}

// ========================================
// USAGE METER
// ========================================
async function fetchUsage() {
  try {
    const response = await fetch("/usage");
    if (!response.ok) return;
    const data = await response.json();
    updateUsageMeter(data);
  } catch (err) {
    console.error("Usage fetch error:", err);
  }
}

function updateUsageMeter(data) {
  const bar = document.getElementById("usage-fill");
  const text = document.getElementById("usage-text");
  if (!bar || !text) return;

  const pct = data.usage || 0;
  bar.style.width = `${pct}%`;
  
  if (data.remainingMinutes >= 0) {
    text.textContent = `${data.usedMinutes}/${data.freeLimit} min used • ${Math.max(0, data.remainingMinutes)} remaining`;
  }
}
