import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useScanStore from '../store/useScanStore';

export default function Scanner() {
  const navigate = useNavigate();
  const setScanResult = useScanStore(state => state.setScanResult);
  const isAnalyzing = useScanStore(state => state.isAnalyzing);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [hasCameraError, setHasCameraError] = useState(false);
  const [cameraActive, setCameraActive] = useState(true);

  useEffect(() => {
    let stream = null;
    const startCamera = async () => {
      try {
        if (cameraActive) {
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        }
      } catch (err) {
        console.error("Camera access denied or unavailable", err);
        setHasCameraError(true);
      }
    };
    
    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraActive]);

  const handleCapture = async () => {
    let imageUrl = null;
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      imageUrl = canvas.toDataURL('image/jpeg', 0.8);
    }

    if (imageUrl) {
      await setScanResult(imageUrl);
      navigate('/scan-results');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const imageUrl = event.target?.result;
        if (imageUrl) {
          await setScanResult(imageUrl);
          navigate('/scan-results');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <main className="relative h-screen w-full bg-black flex flex-col items-center justify-center">
        <div className="absolute inset-0 z-0 bg-black">
          {hasCameraError ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-white/50 px-8 text-center">
              <span className="material-symbols-outlined text-4xl mb-2" data-icon="videocam_off">videocam_off</span>
              <p>Camera access denied. Please allow camera permissions.</p>
            </div>
          ) : cameraActive ? (
            <video 
              ref={videoRef}
              autoPlay 
              playsInline 
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white/50">
              <span className="material-symbols-outlined text-4xl mb-4" data-icon="image">image</span>
              <p>Click the upload button to select an image from your device</p>
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Close Button */}
        <button 
          onClick={() => navigate('/dashboard')}
          className="fixed top-6 left-6 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 transition-all"
        >
          <span className="material-symbols-outlined text-white text-xl" data-icon="close">close</span>
        </button>

        {/* Mode Toggle & Upload Button */}
        <div className="fixed top-6 right-6 z-50 flex gap-3">
          {hasCameraError && (
            <button
              onClick={() => setCameraActive(false)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-label-bold text-sm transition-all"
            >
              Upload Instead
            </button>
          )}
          {!hasCameraError && (
            <button
              onClick={() => setCameraActive(!cameraActive)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 transition-all"
              title={cameraActive ? "Switch to upload" : "Switch to camera"}
            >
              <span className="material-symbols-outlined text-white text-xl" data-icon={cameraActive ? "photo_library" : "camera_front"}>
                {cameraActive ? "photo_library" : "camera_front"}
              </span>
            </button>
          )}
        </div>

        {/* Main Action Buttons */}
        <div className="fixed bottom-8 z-50 flex gap-4 items-center">
          {/* Upload Button */}
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg transition-all active:scale-95"
            title="Upload from device"
          >
            <span className="material-symbols-outlined text-white text-2xl" data-icon="image">image</span>
          </button>

          {/* Capture Button (Camera) */}
          {cameraActive && !hasCameraError && (
            <button 
              onClick={handleCapture} 
              disabled={isAnalyzing}
              className="relative group"
            >
              <div className="absolute inset-[-8px] border-2 border-white/20 rounded-full scale-100 group-active:scale-90 transition-transform"></div>
              <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all ${isAnalyzing ? 'bg-electric-blue animate-pulse' : 'bg-safety-orange group-active:scale-95'}`}>
                {isAnalyzing ? (
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mb-1"></div>
                    <span className="text-white text-[8px] font-bold">AI</span>
                  </div>
                ) : (
                  <span className="material-symbols-outlined text-white text-3xl" data-icon="camera" data-weight="fill" style={{ 'fontVariationSettings': '\'FILL\' 1' }}>camera</span>
                )}
              </div>
            </button>
          )}

          {/* Capture Button (File Upload) */}
          {!cameraActive && (
            <button 
              onClick={() => fileInputRef.current?.click()} 
              disabled={isAnalyzing}
              className="relative group"
            >
              <div className="absolute inset-[-8px] border-2 border-white/20 rounded-full scale-100 group-active:scale-90 transition-transform"></div>
              <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all ${isAnalyzing ? 'bg-electric-blue animate-pulse' : 'bg-safety-orange group-active:scale-95'}`}>
                {isAnalyzing ? (
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mb-1"></div>
                    <span className="text-white text-[8px] font-bold">AI</span>
                  </div>
                ) : (
                  <span className="material-symbols-outlined text-white text-3xl" data-icon="upload_file" data-weight="fill" style={{ 'fontVariationSettings': '\'FILL\' 1' }}>upload_file</span>
                )}
              </div>
            </button>
          )}
        </div>

        {/* Hidden File Input */}
        <input 
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Status Bar */}
        <div className="fixed bottom-32 left-0 right-0 z-40 flex justify-center px-4">
          <div className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 text-center">
            <p className="text-sm text-white font-label-bold">
              {cameraActive ? "📷 Camera Mode" : "📁 Upload Mode"}
            </p>
            <p className="text-xs text-white/70 mt-1">
              {cameraActive ? "Tap the orange button to capture" : "Tap the orange button to select image"}
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
