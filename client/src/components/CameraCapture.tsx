import { useRef, useState } from 'react';
import './CameraCapture.css';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onCancel: () => void;
}

export function CameraCapture({ onCapture, onCancel }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasCamera, setHasCamera] = useState(false);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Use back camera on mobile
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setHasCamera(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Could not access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setHasCamera(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    stopCamera();
    onCapture(imageData);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      onCapture(imageData);
    };
    reader.readAsDataURL(file);
  };

  const handleCancel = () => {
    stopCamera();
    onCancel();
  };

  return (
    <div className="camera-capture">
      <div className="camera-header">
        <button onClick={handleCancel} className="btn-icon">
          ✕
        </button>
        <h2>Capture Food</h2>
        <div style={{ width: '40px' }} />
      </div>

      <div className="camera-container">
        {hasCamera ? (
          <>
            <video ref={videoRef} autoPlay playsInline className="camera-video" />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </>
        ) : (
          <div className="camera-placeholder">
            <p>Camera not started</p>
          </div>
        )}
      </div>

      <div className="camera-controls">
        {!hasCamera ? (
          <>
            <button onClick={startCamera} className="btn btn-primary">
              Start Camera
            </button>
            <label className="btn btn-outline">
              Choose from Gallery
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </label>
          </>
        ) : (
          <button onClick={capturePhoto} className="btn-capture">
            <div className="capture-button" />
          </button>
        )}
      </div>
    </div>
  );
}
