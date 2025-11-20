import { useRef, useState, useEffect } from 'react';
import { Camera } from 'lucide-react';
import PolaroidPhoto from './PolaroidPhoto';

interface Photo {
  id: string;
  imageData: string;
  position: { x: number; y: number };
  rotation: number;
}

const PolaroidCamera = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [ejectedPhoto, setEjectedPhoto] = useState<string | null>(null);
  const [isEjecting, setIsEjecting] = useState(false);

  useEffect(() => {
    startCamera();
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('无法访问摄像头，请确保已授予权限');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || isEjecting) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL('image/png');
    setEjectedPhoto(imageData);
    setIsEjecting(true);

    // 触发快门音效（可选）
    const audio = new Audio('data:audio/wav;base64,UklGRhIAAABXQVZFZm10IBAAAAABAAEA');
    audio.play().catch(() => {});
  };

  const onPhotoEjected = (imageData: string) => {
    const newPhoto: Photo = {
      id: Date.now().toString(),
      imageData,
      position: { x: 120, y: window.innerHeight - 420 },
      rotation: Math.random() * 10 - 5
    };
    setPhotos(prev => [...prev, newPhoto]);
    setEjectedPhoto(null);
    setIsEjecting(false);
  };

  const updatePhotoPosition = (id: string, position: { x: number; y: number }) => {
    setPhotos(prev =>
      prev.map(photo => (photo.id === id ? { ...photo, position } : photo))
    );
  };

  return (
    <>
      {/* Camera positioned at bottom left */}
      <div className="fixed bottom-8 left-8 z-50">
        <div className="relative">
          {/* Camera Body */}
          <div
            className="relative w-80 h-96 rounded-2xl shadow-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, hsl(var(--camera-body)), hsl(25 15% 18%))',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)'
            }}
          >
            {/* Top section with ejection slot */}
            <div className="h-16 bg-gradient-to-b from-black/30 to-transparent relative">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-48 h-1 bg-black/50 rounded-full"></div>
              {/* Photo ejection slot */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-56 h-2 bg-black/70"></div>
            </div>

            {/* Viewfinder */}
            <div className="mx-6 mt-4 relative">
              <div
                className="w-full aspect-square bg-black rounded-lg overflow-hidden shadow-inner relative"
                style={{
                  boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.8)'
                }}
              >
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {!isStreaming && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                    <Camera className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              {/* Viewfinder frame */}
              <div className="absolute inset-0 pointer-events-none rounded-lg"
                style={{
                  boxShadow: 'inset 0 0 0 3px rgba(0,0,0,0.3)'
                }}
              ></div>
            </div>

            {/* Camera brand/logo */}
            <div className="absolute top-20 right-4">
              <div className="text-xs font-bold tracking-widest text-muted/40 rotate-90 origin-center">
                INSTANT
              </div>
            </div>

            {/* Shutter button */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
              <button
                onClick={capturePhoto}
                disabled={!isStreaming || isEjecting}
                className="relative w-20 h-20 rounded-full transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
                style={{
                  background: 'linear-gradient(145deg, hsl(var(--camera-accent)), hsl(185 50% 35%))',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.4), inset 0 2px 5px rgba(255,255,255,0.2)'
                }}
              >
                <div className="absolute inset-2 rounded-full bg-gradient-to-b from-white/20 to-transparent"></div>
                <div className="absolute inset-3 rounded-full border-4 border-white/30"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Camera className="w-8 h-8 text-white drop-shadow-lg" />
                </div>
              </button>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-4 left-4 w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="absolute bottom-4 right-4 text-[10px] text-muted/30 font-mono">SX-70</div>
          </div>

          {/* Ejecting Photo */}
          {ejectedPhoto && (
            <PolaroidPhoto
              imageData={ejectedPhoto}
              isEjecting={true}
              onEjected={onPhotoEjected}
              position={{ x: 0, y: 0 }}
              rotation={0}
              id="ejecting"
              onPositionChange={() => {}}
            />
          )}
        </div>
      </div>

      {/* Photo Wall - dropped photos */}
      {photos.map(photo => (
        <PolaroidPhoto
          key={photo.id}
          id={photo.id}
          imageData={photo.imageData}
          position={photo.position}
          rotation={photo.rotation}
          isEjecting={false}
          onEjected={() => {}}
          onPositionChange={(pos) => updatePhotoPosition(photo.id, pos)}
        />
      ))}

      {/* Hidden canvas for capturing */}
      <canvas ref={canvasRef} className="hidden" />
    </>
  );
};

export default PolaroidCamera;
