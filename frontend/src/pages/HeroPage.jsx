import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const TOTAL_FRAMES = 23;

export default function HeroPage() {
  const navigate = useNavigate();
  const [frameIndex, setFrameIndex] = useState(1);
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef(null);

  // Preload frames to avoid flicker
  useEffect(() => {
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = `/hero-frames/ezgif-frame-${String(i).padStart(3, '0')}.jpg`;
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const scrollTop = window.scrollY;
      const scrollHeight = containerRef.current.scrollHeight - window.innerHeight;
      
      // Calculate progress from 0 to 1
      const progress = Math.min(1, Math.max(0, scrollTop / (scrollHeight || 1)));
      setScrollProgress(progress);
      
      // Map progress to frame index (1 to 23)
      const currentFrame = Math.min(
        TOTAL_FRAMES,
        Math.max(1, Math.ceil(progress * TOTAL_FRAMES))
      );
      setFrameIndex(currentFrame);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run once at start
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Format frame filename
  const getFrameSrc = (index) => {
    const paddedIndex = String(index).padStart(3, '0');
    return `/hero-frames/ezgif-frame-${paddedIndex}.jpg`;
  };

  const showButton = scrollProgress > 0.85;

  return (
    <div 
      ref={containerRef}
      style={{ 
        minHeight: '260vh', // Provides scroll space
        backgroundColor: '#000000', 
        color: '#ffffff',
        fontFamily: 'var(--font-body)',
        position: 'relative'
      }}
    >
      {/* Fixed Frame Viewer */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#000000',
          zIndex: 1,
          overflow: 'hidden'
        }}
      >
        {/* Render the image frame */}
        <img 
          src={getFrameSrc(frameIndex)} 
          alt="Cinematic Intro" 
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain', // Fits the video aspect ratio perfectly
            transition: 'opacity 0.1s ease-out'
          }} 
        />
        
        {/* Subtle overlay gradient to keep it premium and dark */}
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.8) 100%)',
            pointerEvents: 'none'
          }} 
        />
      </div>

      {/* Interactive HUD Overlay */}
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 10,
          pointerEvents: 'none', // Allow scrolling through the HUD
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '40px'
        }}
      >
        {/* Top bar (Empty to keep focus on frames) */}
        <div></div>

        {/* Bottom bar: Contains either Scroll Down or Go to Dashboard */}
        <div 
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100px',
            marginBottom: '20px',
            position: 'relative'
          }}
        >
          {/* Scroll Down Indicator */}
          <div 
            style={{
              position: 'absolute',
              opacity: scrollProgress < 0.2 ? 1 - scrollProgress * 5 : 0,
              pointerEvents: 'none',
              transition: 'opacity 0.4s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span 
              style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '3px',
                color: 'rgba(255, 255, 255, 0.5)'
              }}
            >
              Scroll Down
            </span>
            <div 
              style={{
                width: '2px',
                height: '40px',
                background: 'linear-gradient(to bottom, rgba(255,255,255,0.5), transparent)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div 
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '50%',
                  background: '#ffffff',
                  animation: 'scrollIndicatorAnim 2s infinite ease-in-out'
                }}
              />
            </div>
          </div>

          {/* Go to Dashboard Button */}
          <div 
            style={{
              position: 'absolute',
              pointerEvents: showButton ? 'auto' : 'none',
              opacity: showButton ? 1 : 0,
              transform: showButton ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(0)',
              transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <button
              onClick={() => navigate('/dashboard')}
              className="animate-pulse-glow"
              style={{
                background: '#ffffff',
                color: '#000000',
                border: 'none',
                padding: '16px 36px',
                fontSize: '15px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '2px',
                cursor: 'pointer',
                boxShadow: '0 10px 30px rgba(255,255,255,0.15)',
                borderRadius: '0px', // Flat premium design
                transition: 'all 0.3s ease',
                outline: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#e5e5e5';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Global CSS injection for custom animation */}
      <style>{`
        @keyframes scrollIndicatorAnim {
          0% { transform: translateY(-100%); }
          50% { transform: translateY(100%); }
          100% { transform: translateY(200%); }
        }
      `}</style>
    </div>
  );
}
