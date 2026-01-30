import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { saveGuestPhotos } from "@/lib/guestPhotos";
import { saveAuthenticatedScan } from "@/lib/saveAuthenticatedScan";
import { useAuth } from "@/contexts/AuthContext";
import { checkHasPaid } from "@/lib/accessState";

type ScanStep = "front" | "front_confirm" | "side" | "side_confirm" | "saving";
type ScanMode = "onboarding" | "newScan";

interface ScanFlowProps {
  mode: ScanMode;
  onComplete?: () => void;
  onBack?: () => void;
}

export function ScanFlow({ mode, onComplete, onBack }: ScanFlowProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<ScanStep>("front");
  const [frontPhoto, setFrontPhoto] = useState<string | null>(null);
  const [sidePhoto, setSidePhoto] = useState<string | null>(null);
  const [currentCapture, setCurrentCapture] = useState<string | null>(null);
  const [cameraStatus, setCameraStatus] = useState<"idle" | "requesting" | "active" | "error">("idle");
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canUseCamera = !!(navigator.mediaDevices?.getUserMedia);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Save photos - ONLY uploads to Supabase if user has paid
  useEffect(() => {
    if (step === "saving" && frontPhoto && sidePhoto) {
      console.log("💾 [ScanFlow] Both photos captured, processing...");
      
      if (mode === "onboarding") {
        // ONBOARDING MODE: Save to localStorage for later processing (after payment)
        console.log("🔄 [ScanFlow] Onboarding mode - saving to localStorage (NO upload)");
        const saved = saveGuestPhotos({
          frontPhotoBase64: frontPhoto,
          sidePhotoBase64: sidePhoto,
        });

        if (saved) {
          console.log("✅ [ScanFlow] Photos saved to localStorage");
          if (onComplete) {
            onComplete();
          }
        } else {
          console.error("❌ [ScanFlow] Failed to save photos to localStorage");
        }
      } else {
        // NEW SCAN MODE: Only save to database if user has PAID
        const processScan = async () => {
          if (user) {
            // Check if user has paid before attempting upload
            const hasPaid = await checkHasPaid();
            
            if (!hasPaid) {
              // User is authenticated but NOT paid - save to localStorage and redirect to paywall
              console.warn("🚫 [ScanFlow] User not paid - saving to localStorage, redirecting to paywall");
              const saved = saveGuestPhotos({
                frontPhotoBase64: frontPhoto,
                sidePhotoBase64: sidePhoto,
              });
              
              if (saved) {
                console.log("✅ [ScanFlow] Photos saved to localStorage (waiting for payment)");
              }
              
              setTimeout(() => {
                navigate("/paywall");
              }, 500);
              return;
            }
            
            // User has paid - proceed with saving to database
            console.log("🚀 [ScanFlow] User paid - saving directly to database");
            
            const result = await saveAuthenticatedScan(frontPhoto, sidePhoto);
            
            if (result.success) {
              console.log("✅ [ScanFlow] Scan saved successfully, redirecting to dashboard...");
              setTimeout(() => {
                navigate("/dashboard");
              }, 500);
            } else {
              console.error("❌ [ScanFlow] Failed to save scan:", result.error);
              
              // If blocked due to payment, redirect to paywall
              if (result.error === "PAYMENT_REQUIRED") {
                console.warn("🚫 [ScanFlow] Payment required - redirecting to paywall");
                navigate("/paywall");
                return;
              }
              
              alert(`Failed to save scan: ${result.error}`);
              setStep("front");
              setFrontPhoto(null);
              setSidePhoto(null);
            }
          } else {
            // Unauthenticated user - save to localStorage and redirect to paywall
            console.log("🚀 [ScanFlow] Unauthenticated user - saving to localStorage");
            const saved = saveGuestPhotos({
              frontPhotoBase64: frontPhoto,
              sidePhotoBase64: sidePhoto,
            });

            if (saved) {
              console.log("✅ [ScanFlow] Photos saved to localStorage");
              if (onComplete) {
                onComplete();
              }
              setTimeout(() => {
                navigate("/paywall");
              }, 500);
            } else {
              console.error("❌ [ScanFlow] Failed to save photos to localStorage");
            }
          }
        };
        
        processScan();
      }
    }
  }, [step, frontPhoto, sidePhoto, mode, user, onComplete, navigate]);

  const startCamera = async () => {
    setCameraStatus("requesting");
    console.log("📷 [Camera] Starting camera...");
    
    try {
      let mediaStream: MediaStream;
      
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("📷 [Camera] getUserMedia not supported");
        setCameraStatus("error");
        return;
      }
      
      try {
        // Try with ideal resolution and front camera
        console.log("📷 [Camera] Trying with ideal settings...");
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 720 },
            height: { ideal: 720 }
          },
          audio: false,
        });
      } catch (e1) {
        console.warn("📷 [Camera] Ideal settings failed, trying fallback 1...", e1);
        // Fallback: try without resolution constraints
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" },
            audio: false,
          });
        } catch (e2) {
          console.warn("📷 [Camera] Fallback 1 failed, trying fallback 2...", e2);
          // Final fallback: any video source
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }
      }
      
      console.log("📷 [Camera] Got media stream:", mediaStream);
      console.log("📷 [Camera] Video tracks:", mediaStream.getVideoTracks());
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        console.log("📷 [Camera] Setting video srcObject...");
        videoRef.current.srcObject = mediaStream;
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          console.log("📷 [Camera] Video metadata loaded");
        };
        
        try {
          await videoRef.current.play();
          console.log("📷 [Camera] Video playing successfully");
        } catch (playError) {
          console.error("📷 [Camera] Video play failed:", playError);
          // Try to play again after a short delay
          setTimeout(async () => {
            try {
              await videoRef.current?.play();
              console.log("📷 [Camera] Video playing after retry");
            } catch (retryError) {
              console.error("📷 [Camera] Video play retry failed:", retryError);
            }
          }, 100);
        }
      } else {
        console.error("📷 [Camera] videoRef.current is null!");
      }
      
      setCameraStatus("active");
      console.log("📷 [Camera] Camera status set to active");
      
    } catch (err) {
      console.error("📷 [Camera] Camera error:", err);
      setCameraStatus("error");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraStatus("idle");
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) {
      console.error("📸 [Capture] Video or canvas ref is null");
      return;
    }

    console.log("📸 [Capture] Starting capture...", {
      videoWidth: video.videoWidth,
      videoHeight: video.videoHeight,
      readyState: video.readyState
    });

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("📸 [Capture] Could not get canvas context");
      return;
    }

    // Mirror the image horizontally (since video is mirrored for selfie view)
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    
    // Compress image to reduce size (quality 0.7 = good balance)
    const photoData = canvas.toDataURL("image/jpeg", 0.7);
    
    console.log("📸 [Capture] Photo captured:", {
      width: canvas.width,
      height: canvas.height,
      sizeKB: Math.round(photoData.length / 1024)
    });

    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraStatus("idle");

    setCurrentCapture(photoData);
    if (step === "front") {
      setStep("front_confirm");
    } else if (step === "side") {
      setStep("side_confirm");
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      
      // If image is very large, compress it
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Max dimension 1920px
        const maxDim = 1920;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = (height * maxDim) / width;
            width = maxDim;
          } else {
            width = (width * maxDim) / height;
            height = maxDim;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.7);
        
        console.log("📤 Upload processed:", {
          originalKB: Math.round(result.length / 1024),
          compressedKB: Math.round(compressed.length / 1024),
          dimensions: `${width}x${height}`
        });
        
        setCurrentCapture(compressed);
        if (step === "front") {
          setStep("front_confirm");
        } else if (step === "side") {
          setStep("side_confirm");
        }
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleUsePhoto = () => {
    if (step === "front_confirm") {
      console.log("✅ Front photo confirmed");
      setFrontPhoto(currentCapture);
      setCurrentCapture(null);
      setStep("side");
    } else if (step === "side_confirm") {
      console.log("✅ Side photo confirmed");
      setSidePhoto(currentCapture);
      setCurrentCapture(null);
      setStep("saving");
    }
  };

  const handleRetakePhoto = () => {
    setCurrentCapture(null);
    if (step === "front_confirm") {
      setStep("front");
    } else if (step === "side_confirm") {
      setStep("side");
    }
    setCameraStatus("idle");
  };

  if (step === "front_confirm" || step === "side_confirm") {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col p-4">
        <div className="flex-1 flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-2">
            {step === "front_confirm" ? "Front photo" : "Side photo"}
          </h1>
          <p className="text-muted-foreground mb-8">Does this look good?</p>
          
          <div className="w-64 h-80 rounded-3xl overflow-hidden border border-border mb-8">
            {currentCapture && (
              <img 
                src={currentCapture} 
                alt={step === "front_confirm" ? "Front" : "Side"} 
                className="w-full h-full object-cover" 
              />
            )}
          </div>

          <div className="space-y-3 w-full max-w-sm">
            <Button onClick={handleUsePhoto} className="w-full py-6">
              Use this photo
            </Button>
            <Button onClick={handleRetakePhoto} variant="outline" className="w-full py-6">
              Retake photo
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "saving") {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">
            Saving photos...
          </h2>
          <p className="text-muted-foreground">
            Your photos are being saved securely
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {onBack && step === "front" && (
        <button onClick={onBack} className="p-4">
          <ArrowLeft className="w-6 h-6" />
        </button>
      )}

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-2">
          {step === "front" ? "Front photo" : "Side profile photo"}
        </h1>
        <p className="text-muted-foreground text-center mb-8 max-w-xs">
          {step === "front" 
            ? "Take a clear photo of your face, looking straight at the camera."
            : "Turn your head sideways to capture your profile."}
        </p>

        <div className="relative w-64 h-80 rounded-3xl bg-surface/50 border border-border overflow-hidden mb-4">
          {/* Video element always rendered, hidden when not active */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ 
              display: cameraStatus === "active" && stream ? "block" : "none",
              transform: "scaleX(-1)" // Mirror effect for selfie camera
            }}
            className="absolute inset-0 w-full h-full object-cover z-10"
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {cameraStatus === "active" && stream ? null : cameraStatus === "requesting" ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-0">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm text-muted-foreground text-center">
                Requesting camera permission...
              </p>
            </div>
          ) : cameraStatus === "error" ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-0">
              <Camera className="w-12 h-12 text-destructive mb-3" />
              <p className="text-sm text-destructive text-center font-medium mb-2">
                Camera access denied
              </p>
              <p className="text-xs text-muted-foreground text-center">
                Please enable camera permissions in your browser settings or use the upload option.
              </p>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center z-0">
              <Camera className="w-12 h-12 text-muted-foreground/30" />
            </div>
          )}

          {cameraStatus !== "active" && (
            <>
              <button
                onClick={handleUploadClick}
                className="absolute bottom-3 left-3 z-10 px-3 py-2 bg-black/50 backdrop-blur-sm text-white text-xs rounded-lg flex items-center gap-2 hover:bg-black/70 transition-colors"
              >
                <Upload className="w-3 h-3" />
                Upload
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {step === "front" ? (
            <>
              <div className="px-3 py-1.5 rounded-full bg-surface/50 text-sm text-muted-foreground">
                Head straight
              </div>
              <div className="px-3 py-1.5 rounded-full bg-surface/50 text-sm text-muted-foreground">
                Neutral expression
              </div>
            </>
          ) : (
            <>
              <div className="px-3 py-1.5 rounded-full bg-surface/50 text-sm text-muted-foreground">
                Full side view
              </div>
              <div className="px-3 py-1.5 rounded-full bg-surface/50 text-sm text-muted-foreground">
                Jawline visible
              </div>
            </>
          )}
        </div>

        <div className="space-y-3 w-full max-w-sm">
          {canUseCamera && cameraStatus === "idle" && (
            <Button onClick={startCamera} className="w-full py-6">
              <Camera className="w-5 h-5 mr-2" />
              Start camera
            </Button>
          )}
          
          {cameraStatus === "requesting" && (
            <Button disabled className="w-full py-6 opacity-70">
              <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Requesting permission...
            </Button>
          )}
          
          {cameraStatus === "active" && (
            <>
              <Button onClick={capturePhoto} className="w-full py-6">
                <Camera className="w-5 h-5 mr-2" />
                Take photo
              </Button>
              <Button onClick={stopCamera} variant="outline" className="w-full py-6">
                Stop camera
              </Button>
            </>
          )}
          
          {cameraStatus === "error" && (
            <Button onClick={startCamera} variant="outline" className="w-full py-6">
              <Camera className="w-5 h-5 mr-2" />
              Try again
            </Button>
          )}
          
          {!canUseCamera && (
            <div className="text-center p-4 bg-surface/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Camera not available. Please use the upload option.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
