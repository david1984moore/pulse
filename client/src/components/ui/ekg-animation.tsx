import { useState, useEffect } from 'react';

interface EkgAnimationProps {
  isActive: boolean;
  duration?: number; // Duration in milliseconds
  color?: string;
  width?: number;
  height?: number;
}

export function EkgAnimation({ 
  isActive,
  duration = 2000, // 2 seconds for a more visible effect
  color = '#3b82f6', // Default blue color
  width = 100,
  height = 25
}: EkgAnimationProps) {
  const [showAnimation, setShowAnimation] = useState(false);
  
  useEffect(() => {
    if (isActive) {
      setShowAnimation(true);
      // Use duration * 1.5 to match the tail animation duration
      const timer = setTimeout(() => {
        setShowAnimation(false);
      }, duration * 1.5);
      
      return () => clearTimeout(timer);
    }
  }, [isActive, duration]);
  
  if (!showAnimation) return null;
  
  // More realistic EKG signal points (QRS complex)
  const points = [
    [0, height/2],                      // Start with flat line (isoelectric)
    [width*0.3, height/2],              // Flat line continues
    [width*0.35, height/2 - height*0.1], // Q wave (small dip)
    [width*0.4, height/2 - height*0.6],  // R wave (tall spike)
    [width*0.45, height/2 + height*0.2], // S wave (downward deflection)
    [width*0.5, height/2],               // Back to baseline
    [width*0.55, height/2 - height*0.1], // T wave (small bump)
    [width*0.6, height/2],               // Back to baseline
    [width*0.85, height/2],              // Flat line continues
    [width, height/2]                    // End with flat line
  ].map(point => point.join(',')).join(' ');
  
  // Create dual-phase animation effect with more visible trace
  // First keyframes control the leading point (pen)
  // Second keyframes control the tail completion
  const animationStyles = `
    @keyframes drawLeadingPoint {
      0% {
        stroke-dasharray: 10, ${width * 3}; /* Larger leading dot (10px) */
        stroke-dashoffset: ${width * 3};
      }
      25% {
        stroke-dasharray: 10, ${width * 3}; /* Keep larger dot (10px) */
        stroke-dashoffset: ${width * 2.5}; /* Slower at beginning */
      }
      50% {
        stroke-dasharray: 10, ${width * 3}; /* Keep larger dot (10px) */
        stroke-dashoffset: ${width * 1.8}; /* Speed up before peak */
      }
      70% {
        stroke-dasharray: 10, ${width * 3}; /* Keep larger dot (10px) */
        stroke-dashoffset: ${width * 1.0}; /* Faster at peak */
      }
      /* Slow down towards the end */
      80% {
        stroke-dasharray: 10, ${width * 3}; /* Keep larger dot (10px) */
        stroke-dashoffset: ${width * 0.7}; /* Starting to slow down */
      }
      90% {
        stroke-dasharray: 10, ${width * 3}; /* Keep larger dot (10px) */
        stroke-dashoffset: ${width * 0.4}; /* Even slower */
      }
      95% {
        stroke-dasharray: 10, ${width * 3}; /* Keep larger dot (10px) */
        stroke-dashoffset: ${width * 0.2}; /* Very slow at the end */
      }
      100% {
        stroke-dasharray: 10, ${width * 3}; /* Keep larger dot (10px) */
        stroke-dashoffset: 0; /* Leading point completes */
      }
    }
    
    @keyframes completeTail {
      0%, 80% {
        /* Keep dash array unchanged until lead point is almost at end (80%) */
        stroke-dasharray: 10, ${width * 3}; /* Match the 10px dot size */
      }
      95% {
        /* Start the tail very late, when lead is almost done */
        stroke-dasharray: 10, ${width * 3}; /* Match the 10px dot size */
      }
      100% {
        stroke-dasharray: 0, 0; /* Tail catches up and completes */
      }
    }
    
    /* Two-phase animation to keep the entire trace visible - entire path + final trace */
    @keyframes maintainPathVisibility {
      0%, 100% {
        visibility: visible;
        opacity: 1;
        stroke-opacity: 1;
        fill-opacity: 1;
      }
    }
    
    .animate-draw {
      stroke-linecap: round;
      stroke-linejoin: round;
      animation: 
        drawLeadingPoint ${duration}ms cubic-bezier(0.25, 0.1, 0.25, 1) forwards,
        completeTail ${duration * 1.5}ms cubic-bezier(0.25, 0.1, 0.5, 1) forwards,
        maintainPathVisibility ${duration * 1.5}ms linear forwards; /* Keep visible until tail finishes */
    }
  `;
  
  return (
    <div
      className="ekg-animation"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        display: 'inline-block',
        position: 'relative',
        marginLeft: '8px',
      }}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-draw"
        />
      </svg>

      <style dangerouslySetInnerHTML={{ __html: animationStyles }} />
    </div>
  );
}