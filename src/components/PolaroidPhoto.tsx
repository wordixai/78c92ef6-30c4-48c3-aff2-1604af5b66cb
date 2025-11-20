import { useState, useEffect, useRef } from 'react';

interface PolaroidPhotoProps {
  id: string;
  imageData: string;
  isEjecting: boolean;
  onEjected: (imageData: string) => void;
  position: { x: number; y: number };
  rotation: number;
  onPositionChange: (position: { x: number; y: number }) => void;
}

const PolaroidPhoto = ({
  id,
  imageData,
  isEjecting,
  onEjected,
  position,
  rotation,
  onPositionChange
}: PolaroidPhotoProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(isEjecting ? 0 : 1);
  const [blur, setBlur] = useState(isEjecting ? 20 : 0);
  const [translateY, setTranslateY] = useState(isEjecting ? 100 : 0);
  const photoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEjecting) {
      // Ejection animation
      setTimeout(() => setTranslateY(0), 50);

      // Develop animation - from blurry to clear
      const developInterval = setInterval(() => {
        setBlur(prev => Math.max(0, prev - 0.5));
        setOpacity(prev => Math.min(1, prev + 0.025));
      }, 50);

      // Complete ejection after animation
      setTimeout(() => {
        clearInterval(developInterval);
        setBlur(0);
        setOpacity(1);
        onEjected(imageData);
      }, 3000);

      return () => clearInterval(developInterval);
    }
  }, [isEjecting, imageData, onEjected]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEjecting) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    onPositionChange({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const style: React.CSSProperties = isEjecting
    ? {
        position: 'absolute',
        bottom: '350px',
        left: '50%',
        transform: `translateX(-50%) translateY(${translateY}px)`,
        transition: 'transform 2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        zIndex: 100
      }
    : {
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: `rotate(${rotation}deg)`,
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: isDragging ? 1000 : 10
      };

  return (
    <div
      ref={photoRef}
      style={style}
      onMouseDown={handleMouseDown}
      className="select-none"
    >
      <div
        className="bg-background p-3 pb-12 rounded-sm shadow-2xl"
        style={{
          width: '220px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.2)',
          backgroundColor: 'hsl(var(--photo-border))'
        }}
      >
        <div className="relative w-full aspect-square bg-muted overflow-hidden">
          <img
            src={imageData}
            alt="Polaroid"
            className="w-full h-full object-cover"
            style={{
              filter: `blur(${blur}px)`,
              opacity: opacity,
              transition: 'filter 0.1s, opacity 0.1s'
            }}
          />
          {isEjecting && (
            <div
              className="absolute inset-0 bg-gradient-to-b from-white/80 to-transparent pointer-events-none"
              style={{ opacity: Math.max(0, 1 - opacity) }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PolaroidPhoto;
