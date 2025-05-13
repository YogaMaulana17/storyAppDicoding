let stream = null;

export async function initCamera(videoElement, facingMode = "environment") {
  if (stream) {
    stopCamera();
  }

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode },
      audio: false,
    });
    videoElement.srcObject = stream;
  } catch (error) {
    console.error("Gagal membuka kamera:", error);
  }
}

export function stopCamera() {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
    stream = null;
  }
}

export async function capturePhoto(videoElement) {
  const canvas = document.createElement("canvas");
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, "image/jpeg");
  });
}

export async function switchCamera(videoElement, currentFacingMode) {
  const newFacingMode = currentFacingMode === "user" ? "environment" : "user";
  await initCamera(videoElement, newFacingMode);
  return { facingMode: newFacingMode };
}
