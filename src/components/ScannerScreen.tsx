import React, { useState, useRef, useEffect } from "react";
import { Camera, RefreshCw, X, Shield, Keyboard, Zap, Sparkles, FileUp, Loader2, AlertCircle, Check } from "lucide-react";

interface ScannerScreenProps {
  onBack: () => void;
  onVerify: (code: string) => void;
}

export default function ScannerScreen({ onBack, onVerify }: ScannerScreenProps) {
  const [manualInput, setManualInput] = useState("");
  const [useVirtualScan, setUseVirtualScan] = useState(true); // true = live camera stream, false = manual text key-in
  
  // Camera & Image processing states
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [detectedLabel, setDetectedLabel] = useState<string | null>(null);

  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);

  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Auto-manage camera cycles based on selected screen tab mode
  useEffect(() => {
    if (useVirtualScan) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [useVirtualScan]);

  const startCamera = async () => {
    setCameraError(null);
    setServerError(null);
    setDetectedLabel(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      // Request live environment facing video
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false
      });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn("Webcam access failed or denied in sandbox context:", err);
      setCameraError(
        "Camera stream is blocked by default in some sandboxed iframe previews. To enable full camera capture, please click the 'Open in new tab' button at the top-right of your screen, or drag/drop any product image below, or tap an interactive hotkey!"
      );
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const resizeImage = (base64Str: string, maxDim = 800): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.8));
        } else {
          resolve(base64Str);
        }
      };
      img.onerror = () => {
        resolve(base64Str);
      };
    });
  };

  const handleCaptureSnapshot = async () => {
    if (!videoRef.current || !cameraActive) return;
    
    setIsProcessingImage(true);
    setServerError(null);
    setDetectedLabel("Capturing camera frame snapshot...");

    try {
      const canvas = document.createElement("canvas");
      let width = videoRef.current.videoWidth || 640;
      let height = videoRef.current.videoHeight || 480;
      const MAX_DIM = 800;
      if (width > MAX_DIM || height > MAX_DIM) {
        if (width > height) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        await parseImageWithGemini(dataUrl);
      }
    } catch (err) {
      console.error("Snapshot frame fetch error:", err);
      setServerError("Failed to capture snapshot from active camera. Try selecting an image file directly.");
      setIsProcessingImage(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setServerError("Incorrect file format. Please upload a structured image (PNG, JPG, or WEBP).");
      return;
    }

    setIsProcessingImage(true);
    setServerError(null);
    setDetectedLabel(`Reading file: ${file.name}...`);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        try {
          const resizedString = await resizeImage(base64String, 800);
          await parseImageWithGemini(resizedString);
        } catch (resizeErr) {
          console.error("Resize failed, using raw base64 instead:", resizeErr);
          await parseImageWithGemini(base64String);
        }
      };
      reader.onerror = () => {
        setServerError("Could not read local image file bytes.");
        setIsProcessingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Local file reading failed:", err);
      setServerError("Image load failed. Please attempt with another container photo.");
      setIsProcessingImage(false);
    }
  };

  const parseImageWithGemini = async (base64Image: string) => {
    try {
      setDetectedLabel("Compiling multimodal image & decoding digits...");
      const resp = await fetch("/api/scan-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ image: base64Image })
      });

      if (!resp.ok) {
        const errPayload = await resp.json();
        throw new Error(errPayload.error || "Server scanning error.");
      }

      const decoded = await resp.json();
      const code = decoded.result?.code;
      const detectedText = decoded.result?.detectedText;

      if (code && code !== "null" && code !== "undefined") {
        setDetectedLabel(`Decoded successfully: ${detectedText || "Reg ID"} (${code})`);
        setTimeout(() => {
          onVerify(code);
        }, 1250);
      } else {
        throw new Error("No clear barcode, GTIN, or NAFDAC code recognized in the picture. Try setting a clear focus, lighting, or type manual numbers.");
      }
    } catch (err: any) {
      console.error("Deciphering failed:", err);
      setServerError(err.message || "Decoding error.");
      setIsProcessingImage(false);
    }
  };

  // Drag and drop events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleSubmitManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      onVerify(manualInput.trim());
    }
  };

  const handleSimulateScan = (code: string) => {
    setIsProcessingImage(true);
    setServerError(null);
    setDetectedLabel("Initializing simulated scanner validation...");
    setTimeout(() => {
      onVerify(code);
    }, 800);
  };

  const interactiveSimulateProducts = [
    { name: "🏆 Emzor Paracetamol Tab", code: "6151100010254" },
    { name: "🥛 Peak Cream Milk Powder", code: "8711300125862" },
    { name: "☠️ My Pikin Toxicity Syrup", code: "6159987410299" },
    { name: "🧪 Mega-Glow Banned Cosmetic", code: "6151245789654" }
  ];

  return (
    <div className="w-full min-h-screen bg-gray-950 text-white pb-24 relative flex flex-col justify-between">
      {/* Top Header navbar */}
      <header className="flex items-center justify-between px-5 py-4 bg-gray-900 border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1 px-2.5 bg-brand-green-600 rounded-lg text-[10px] font-bold font-mono tracking-wider text-white animate-pulse">
            LIVE DECODER
          </div>
          <span className="text-sm font-semibold text-gray-300">Intelligent Scanner Portal</span>
        </div>
        <button 
          onClick={onBack}
          className="p-1.5 text-gray-400 hover:text-white bg-gray-800 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      {/* Main Viewport Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-5 relative overflow-y-auto max-w-lg mx-auto w-full space-y-5">
        
        {useVirtualScan ? (
          /* Live stream camera window with hologram corners */
          <div className="w-full aspect-square max-w-[320px] rounded-2xl border-2 border-emerald-500/30 bg-gray-900/40 backdrop-blur-md relative flex flex-col items-center justify-center overflow-hidden shadow-2xl">
            {cameraActive ? (
              <video 
                ref={videoRef}
                autoPlay 
                playsInline 
                muted
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="p-4 text-center z-10 px-6">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 mx-auto mb-3">
                  <Camera className="w-6 h-6 animate-pulse" />
                </div>
                <p className="text-xs font-bold text-amber-300 uppercase tracking-widest font-heading">Webcam stream unactivated</p>
                <p className="text-[10px] text-gray-400 mt-1.5 leading-relaxed">
                  {cameraError || "Activating video lenses..."}
                </p>
              </div>
            )}

            {/* Scanning beam line animation */}
            {cameraActive && !isProcessingImage && (
              <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-scan-beam z-15"></div>
            )}

            {/* Hologram aesthetic corners */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-500 rounded-tl-xl z-20 pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-500 rounded-tr-xl z-20 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-500 rounded-bl-xl z-20 pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-500 rounded-br-xl z-20 pointer-events-none"></div>

            {/* Capture overlay state */}
            {isProcessingImage && (
              <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-4 z-30 text-center">
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-2" />
                <p className="text-xs font-mono text-emerald-300 font-bold uppercase tracking-wider">AI DECODING IN PROGRESS...</p>
                <p className="text-[10px] text-gray-400 mt-1 max-w-[200px]">{detectedLabel || "Compiling image snapshot"}</p>
              </div>
            )}

            {/* Live Camera Button Overlay */}
            {cameraActive && !isProcessingImage && (
              <div className="absolute bottom-3 left-0 right-0 text-center z-30">
                <button
                  type="button"
                  onClick={handleCaptureSnapshot}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold font-sans tracking-wide rounded-full shadow-lg transition-transform active:scale-95 flex items-center gap-1.5 mx-auto cursor-pointer border border-emerald-400/40"
                >
                  <Zap className="w-3.5 h-3.5 fill-white" />
                  Capture & Scan Frame
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Manual Text entry form */
          <div className="w-full max-w-[320px] p-5.5 bg-gray-900 border border-gray-800 rounded-2xl relative">
            <div className="flex items-center gap-2 mb-4 text-emerald-400">
              <Keyboard className="w-5 h-5 flex-shrink-0" />
              <h3 className="font-bold text-sm tracking-wide text-white">Manual Identification</h3>
            </div>
            
            <form onSubmit={handleSubmitManual} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider">NAFDAC Reg. or Barcode Value</label>
                <input
                  type="text"
                  placeholder="e.g. 8711300125862 or 04-2198"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  className="w-full mt-1.5 p-3.5 bg-gray-950 border border-gray-800 rounded-xl text-white text-sm font-mono focus:outline-none focus:border-emerald-500 text-center uppercase tracking-widest placeholder-gray-600"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-brand-green-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-brand-green-700 transition-colors cursor-pointer"
              >
                Scan Database Log
              </button>
            </form>
          </div>
        )}

        {/* Drag and Drop Product Image Uploader Fallback */}
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`w-full max-w-[320px] p-5 border-2 border-dashed rounded-2xl text-center transition-all cursor-pointer ${
            isDragging 
              ? "border-emerald-500 bg-emerald-950/20 text-emerald-300" 
              : "border-gray-800 bg-gray-900/40 hover:border-gray-700 text-gray-400 hover:text-gray-300"
          }`}
        >
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <FileUp className="w-6.5 h-6.5 mx-auto mb-2 text-gray-500" />
          <p className="text-xs font-bold text-gray-200">Flexible Image File Uploader</p>
          <p className="text-[10px] text-gray-500 mt-1">Drag & drop or click to upload container photo</p>
        </div>

        {/* Error notification display */}
        {serverError && (
          <div className="w-full max-w-[320px] p-3 bg-red-950/60 border border-red-900 text-red-100 rounded-xl flex gap-2 text-left animate-fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-red-400">Decoding Issue</p>
              <p className="text-[10px] leading-normal opacity-90 mt-0.5">{serverError}</p>
            </div>
          </div>
        )}

        {/* Decoder Status Display */}
        {detectedLabel && !serverError && (
          <div className="w-full max-w-[320px] p-3 bg-brand-green-950/50 border border-brand-green-900/60 text-brand-green-200 rounded-xl flex gap-2 text-left animate-fade-in">
            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Lense Status</p>
              <p className="text-[10px] leading-normal opacity-90 mt-0.5">{detectedLabel}</p>
            </div>
          </div>
        )}

        {/* Hotkeys selector under viewfinder */}
        <div className="w-full max-w-[320px] bg-gray-900/50 border border-gray-800 rounded-2xl p-4 shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-widest">Interactive Barcode Hotkeys</h4>
          </div>
          <p className="text-[10.5px] text-gray-400 leading-normal mb-3">
            Simulate immediately an automatic lens snapshot detection for verified or dangerous goods to test database responses:
          </p>

          <div className="flex flex-col gap-2 w-full">
            {interactiveSimulateProducts.map((p) => (
              <button
                key={p.code}
                onClick={() => handleSimulateScan(p.code)}
                disabled={isProcessingImage}
                className="w-full flex items-center justify-between p-2 px-3 bg-gray-950 hover:bg-emerald-950/40 border border-gray-800 hover:border-emerald-700 disabled:opacity-50 rounded-xl text-left transition-all cursor-pointer"
              >
                <span className="text-[10px] font-bold text-white truncate max-w-[160px]">{p.name}</span>
                <span className="text-[9px] text-emerald-400 font-mono font-bold shrink-0">{p.code}</span>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Flexible Mode Switch tab footer controls */}
      <footer className="p-4 bg-gray-900 border-t border-gray-800 shrink-0 mt-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 max-w-lg mx-auto w-full">
          <div className="text-left text-[10.5px] text-gray-400">
            <span className="font-bold block text-white flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-brand-green-500 fill-brand-green-500/15" />
              Secure Sandbox Sandcast
            </span>
            Compliant WebRTC Secure Sandbox
          </div>
          
          <button
            onClick={() => setUseVirtualScan(!useVirtualScan)}
            className="flex items-center gap-2 px-3.5 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-bold tracking-wider transition-colors cursor-pointer border border-gray-700"
          >
            <RefreshCw className="w-3 h-3 text-emerald-400" />
            {useVirtualScan ? "Switch to Manual Mode" : "Switch to Camera Link"}
          </button>
        </div>
      </footer>
    </div>
  );
}
