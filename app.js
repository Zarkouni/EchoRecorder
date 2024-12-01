const recordBtn = document.getElementById('recordBtn');
const echoBtn = document.getElementById('echoBtn');
const saveBtn = document.getElementById('saveBtn');
const audioPlayback = document.getElementById('audioPlayback');

let mediaRecorder;
let audioChunks = [];
let audioContext;
let audioBuffer;

// بدء التسجيل
recordBtn.addEventListener('click', async () => {
  if (!mediaRecorder || mediaRecorder.state === 'inactive') {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      const audioURL = URL.createObjectURL(audioBlob);
      audioPlayback.src = audioURL;

      // تحويل الصوت إلى AudioBuffer
      const reader = new FileReader();
      reader.onload = async () => {
        const arrayBuffer = reader.result;
        audioContext = new AudioContext();
        audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        echoBtn.disabled = false;
        saveBtn.disabled = false;
      };
      reader.readAsArrayBuffer(audioBlob);
    };

    audioChunks = [];
    mediaRecorder.start();
    recordBtn.textContent = 'إيقاف التسجيل';
  } else {
    mediaRecorder.stop();
    recordBtn.textContent = 'بدء التسجيل';
  }
});

// إضافة تأثير الصدى
echoBtn.addEventListener('click', () => {
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;

  const delay = audioContext.createDelay();
  delay.delayTime.value = 0.3;

  const gain = audioContext.createGain();
  gain.gain.value = 0.5;

  source.connect(delay);
  delay.connect(gain);
  gain.connect(audioContext.destination);

  source.connect(audioContext.destination);
  source.start();
});

// حفظ الصوت
saveBtn.addEventListener('click', () => {
  const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(audioBlob);
  link.download = 'recorded_audio.webm';
  link.click();
});