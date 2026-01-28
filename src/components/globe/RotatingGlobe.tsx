import { useEffect, useState, useMemo, memo } from "react";
import { motion } from "framer-motion";

interface UserDot {
  id: number;
  lon: number; // longitude -180 to 180
  lat: number; // latitude -90 to 90
  brightness: number; // 0.5 to 1
  pulseDelay: number;
}

interface RotatingGlobeProps {
  size?: number;
  className?: string;
}

// Realistic continent paths (SVG path data) - scaled to fit 100x100 viewBox
const continentPaths = [
  // North America - distinctive shape with Alaska, Canada, USA, Mexico
  "M 12 18 L 14 16 L 18 15 L 22 14 L 24 16 L 26 15 L 28 17 L 30 16 L 32 18 L 30 20 L 32 22 L 34 24 L 33 26 L 35 28 L 34 30 L 36 32 L 35 34 L 33 36 L 30 38 L 28 40 L 26 42 L 24 41 L 22 43 L 20 42 L 18 40 L 16 38 L 14 36 L 12 34 L 10 32 L 8 28 L 10 24 L 8 22 L 10 20 Z",
  // South America - elongated with Brazil bulge
  "M 28 46 L 32 44 L 36 46 L 38 50 L 40 54 L 39 58 L 38 62 L 36 66 L 34 70 L 32 74 L 30 76 L 28 74 L 26 70 L 25 66 L 24 62 L 25 58 L 26 54 L 27 50 Z",
  // Europe - irregular with Scandinavian peninsula, British Isles, Iberian peninsula
  "M 48 18 L 46 16 L 48 14 L 50 15 L 52 14 L 54 16 L 56 15 L 58 17 L 60 16 L 62 18 L 60 20 L 62 22 L 60 24 L 58 26 L 56 28 L 54 30 L 52 28 L 50 30 L 48 28 L 46 26 L 48 24 L 46 22 L 48 20 Z",
  // Africa - large landmass with horn of Africa, distinctive shape
  "M 50 32 L 54 30 L 58 32 L 62 34 L 66 36 L 68 40 L 66 44 L 68 48 L 66 52 L 64 56 L 60 60 L 56 62 L 52 60 L 48 58 L 46 54 L 48 50 L 46 46 L 48 42 L 46 38 L 48 34 Z",
  // Asia - massive landmass with distinctive shape including India, Southeast Asia
  "M 62 12 L 66 10 L 70 12 L 74 10 L 78 12 L 82 10 L 86 12 L 90 14 L 92 18 L 90 22 L 92 26 L 90 30 L 88 34 L 84 36 L 80 38 L 76 40 L 72 42 L 68 44 L 70 48 L 68 52 L 64 50 L 62 46 L 64 42 L 62 38 L 64 34 L 62 30 L 64 26 L 62 22 L 64 18 L 62 14 Z",
  // India subcontinent
  "M 72 42 L 76 44 L 78 48 L 76 52 L 74 56 L 72 54 L 70 50 L 72 46 Z",
  // Australia - distinctive shape with indent on north
  "M 82 54 L 86 52 L 90 54 L 94 56 L 96 60 L 94 64 L 92 68 L 88 70 L 84 68 L 80 66 L 78 62 L 80 58 Z",
  // Indonesia/Southeast Asia islands
  "M 80 46 L 84 48 L 88 46 L 92 48 L 90 50 L 86 52 L 82 50 L 78 48 Z",
  // Greenland
  "M 36 8 L 40 6 L 44 8 L 46 12 L 44 16 L 40 18 L 36 16 L 34 12 Z",
  // Japan
  "M 90 28 L 92 26 L 94 28 L 93 32 L 91 34 L 89 32 L 90 30 Z",
  // UK/Ireland
  "M 44 20 L 46 18 L 48 20 L 47 24 L 45 22 Z",
  // Madagascar
  "M 68 56 L 70 54 L 72 56 L 71 60 L 69 62 L 67 60 Z",
];

// Generate user dots with proper spherical distribution
function generateUserDots(count: number): UserDot[] {
  const dots: UserDot[] = [];
  for (let i = 0; i < count; i++) {
    // Use golden angle for better distribution
    const theta = (i * 137.508 * Math.PI) / 180;
    const y = 1 - (i / (count - 1)) * 2; // -1 to 1
    const radius = Math.sqrt(1 - y * y);
    
    const lon = (theta * 180) / Math.PI % 360 - 180;
    const lat = Math.asin(y) * (180 / Math.PI);
    
    dots.push({
      id: i,
      lon: lon + (Math.random() - 0.5) * 40,
      lat: lat + (Math.random() - 0.5) * 20,
      brightness: 0.5 + Math.random() * 0.5,
      pulseDelay: Math.random() * 4,
    });
  }
  return dots;
}

// Convert lat/lon to 2D coordinates with rotation
function projectPoint(
  lon: number,
  lat: number,
  rotation: number,
  size: number
): { x: number; y: number; visible: boolean; depth: number } {
  const lonRad = ((lon + rotation) * Math.PI) / 180;
  const latRad = (lat * Math.PI) / 180;
  
  const x = Math.cos(latRad) * Math.sin(lonRad);
  const y = -Math.sin(latRad);
  const z = Math.cos(latRad) * Math.cos(lonRad);
  
  const radius = size / 2 - 4;
  const projX = size / 2 + x * radius;
  const projY = size / 2 + y * radius;
  
  return {
    x: projX,
    y: projY,
    visible: z > -0.2, // Show dots slightly past the edge for smoother transitions
    depth: z,
  };
}

// Memoized to prevent re-renders when parent components update
function RotatingGlobeComponent({ size = 256, className = "" }: RotatingGlobeProps) {
  const [rotation, setRotation] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [highlightedDot, setHighlightedDot] = useState<number | null>(null);
  
  const userDots = useMemo(() => generateUserDots(32), []);
  
  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);
  
  // Rotation animation
  useEffect(() => {
    if (prefersReducedMotion) return;
    
    let animationFrame: number;
    let lastTime = performance.now();
    
    const animate = (currentTime: number) => {
      const delta = currentTime - lastTime;
      lastTime = currentTime;
      setRotation((prev) => (prev + delta * 0.015) % 360);
      animationFrame = requestAnimationFrame(animate);
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [prefersReducedMotion]);
  
  // Highlight random dot every ~6 seconds
  useEffect(() => {
    if (prefersReducedMotion) return;
    
    const interval = setInterval(() => {
      const randomDot = Math.floor(Math.random() * userDots.length);
      setHighlightedDot(randomDot);
      setTimeout(() => setHighlightedDot(null), 2000);
    }, 6000);
    
    return () => clearInterval(interval);
  }, [userDots.length, prefersReducedMotion]);
  
  const projectedDots = userDots.map((dot) => ({
    ...dot,
    ...projectPoint(dot.lon, dot.lat, rotation, size),
  }));
  
  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-full"
        style={{ overflow: "hidden" }}
      >
        <defs>
          {/* Spherical shading gradient */}
          <radialGradient id="globeShading" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="hsl(174, 72%, 56%)" stopOpacity="0.25" />
            <stop offset="50%" stopColor="hsl(174, 72%, 56%)" stopOpacity="0.12" />
            <stop offset="100%" stopColor="hsl(220, 20%, 4%)" stopOpacity="0.6" />
          </radialGradient>
          
          {/* Continent gradient */}
          <linearGradient id="continentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(174, 72%, 60%)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="hsl(174, 72%, 45%)" stopOpacity="0.3" />
          </linearGradient>
          
          {/* Globe clip mask */}
          <clipPath id="globeClip">
            <circle cx={size / 2} cy={size / 2} r={size / 2 - 2} />
          </clipPath>
          
          {/* Dot glow filter */}
          <filter id="dotGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* Ocean background */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 2}
          fill="url(#globeShading)"
          stroke="hsl(174, 72%, 56%)"
          strokeOpacity="0.2"
          strokeWidth="1"
        />
        
        {/* Globe content with clip */}
        <g clipPath="url(#globeClip)">
          {/* Continents - transform based on rotation */}
          <g
            style={{
              transform: `translateX(${-rotation * 0.8}px)`,
              transition: prefersReducedMotion ? "none" : undefined,
            }}
          >
            {/* Render continents twice for seamless wrap */}
            {[0, 1].map((offset) => (
              <g key={offset} transform={`translate(${offset * 280 - 140}, 0)`}>
                {continentPaths.map((path, i) => (
                  <path
                    key={`${offset}-${i}`}
                    d={path}
                    fill="url(#continentGradient)"
                    transform={`scale(${size / 100})`}
                  />
                ))}
              </g>
            ))}
          </g>
          
          {/* Grid lines */}
          <g opacity="0.15">
            {/* Latitude lines */}
            {[-60, -30, 0, 30, 60].map((lat) => {
              const y = size / 2 - (lat / 90) * (size / 2 - 8);
              const xRadius = Math.cos((lat * Math.PI) / 180) * (size / 2 - 8);
              return (
                <ellipse
                  key={lat}
                  cx={size / 2}
                  cy={y}
                  rx={xRadius}
                  ry={xRadius * 0.3}
                  fill="none"
                  stroke="hsl(174, 72%, 56%)"
                  strokeWidth="0.5"
                />
              );
            })}
            
            {/* Longitude lines */}
            {[0, 30, 60, 90, 120, 150].map((lon) => (
              <ellipse
                key={lon}
                cx={size / 2}
                cy={size / 2}
                rx={Math.sin((lon * Math.PI) / 180) * (size / 2 - 8)}
                ry={size / 2 - 8}
                fill="none"
                stroke="hsl(174, 72%, 56%)"
                strokeWidth="0.5"
                style={{
                  transform: `rotate(${rotation * 0.5}deg)`,
                  transformOrigin: "center",
                }}
              />
            ))}
          </g>
          
          {/* User dots */}
          {projectedDots
            .filter((dot) => dot.visible)
            .sort((a, b) => a.depth - b.depth) // Render back-to-front
            .map((dot) => {
              const isHighlighted = highlightedDot === dot.id;
              const opacity = 0.3 + dot.depth * 0.5 + (isHighlighted ? 0.3 : 0);
              const dotSize = 3 + dot.brightness * 2 + (isHighlighted ? 2 : 0);
              
              return (
                <circle
                  key={dot.id}
                  cx={dot.x}
                  cy={dot.y}
                  r={dotSize}
                  fill="hsl(174, 72%, 56%)"
                  opacity={opacity * dot.brightness}
                  filter={isHighlighted ? "url(#dotGlow)" : undefined}
                  style={{
                    animation: prefersReducedMotion
                      ? undefined
                      : `pulse-dot ${2 + dot.pulseDelay}s ease-in-out infinite`,
                    animationDelay: `${dot.pulseDelay}s`,
                  }}
                />
              );
            })}
        </g>
        
        {/* Outer glow ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 1}
          fill="none"
          stroke="hsl(174, 72%, 56%)"
          strokeOpacity="0.3"
          strokeWidth="2"
        />
      </svg>
      
      {/* CSS for dot pulse animation */}
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// Export memoized version to prevent unnecessary re-renders from parent
const RotatingGlobe = memo(RotatingGlobeComponent);
RotatingGlobe.displayName = 'RotatingGlobe';
export default RotatingGlobe;
