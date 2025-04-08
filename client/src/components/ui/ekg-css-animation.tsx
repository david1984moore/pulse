import React, { useState, useEffect, useRef } from 'react';

/**
 * EkgCssAnimation - A simple, CSS-based ECG animation guaranteed to run once
 * when the active prop changes to true
 * 
 * This component uses CSS animations rather than JS to ensure reliable completion
 * and prevent issues with animation cycles being cut short or never running.
 */
export default function EkgCssAnimation({
  lineColor = "rgba(255, 255, 255, 0.9)",
  width = 500,
  height = 200,
  strokeWidth = 2,
  active = false
}) {
  // Keep track if animation has started
  const [isAnimating, setIsAnimating] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Calculate baseline Y position (horizontal line)
  const baselineY = height / 2;
  
  // Define a classical ECG waveform path with proper P, QRS, and T waves
  // Ensures all waves properly return to the horizontal baseline
  const ekgPath = `
    M 0,${baselineY}
    
    H ${width * 0.1}
    
    C ${width * 0.12},${baselineY} ${width * 0.14},${baselineY - height * 0.05} ${width * 0.16},${baselineY}
    
    H ${width * 0.24}
    
    L ${width * 0.26},${baselineY + height * 0.06}
    L ${width * 0.28},${baselineY - height * 0.28}
    L ${width * 0.3},${baselineY + height * 0.15}
    L ${width * 0.32},${baselineY}
    
    H ${width * 0.38}
    
    C ${width * 0.42},${baselineY - height * 0.12} ${width * 0.46},${baselineY - height * 0.15} ${width * 0.5},${baselineY}
    
    H ${width}
  `;
  
  // Start animation when active prop changes to true
  useEffect(() => {
    if (active) {
      // Small delay to ensure DOM is fully ready
      const timer = setTimeout(() => {
        setIsAnimating(true);
      }, 50);
      
      // Ensure animation state is cleaned up completely
      const cleanupTimer = setTimeout(() => {
        setIsAnimating(false);
      }, 4000); // Give enough time for all animations to finish
      
      return () => {
        clearTimeout(timer);
        clearTimeout(cleanupTimer);
      };
    } else {
      setIsAnimating(false);
    }
  }, [active]);
  
  // Calculate the path length for stroke-dasharray/offset
  const mainPathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(1500); // Default estimate
  
  useEffect(() => {
    if (mainPathRef.current) {
      try {
        const actualLength = mainPathRef.current.getTotalLength();
        if (actualLength > 0) {
          setPathLength(actualLength);
        }
      } catch (e) {
        // Fallback if getTotalLength is not supported
        console.log("Using estimated path length");
      }
    }
  }, []);
  
  return (
    <div className="ekg-css-animation" style={{ width, height, position: 'relative' }}>
      <svg 
        ref={svgRef}
        width="100%" 
        height="100%" 
        viewBox={`0 0 ${width} ${height}`}
        style={{ overflow: 'visible' }}
      >
        {/* Shadow/glow effect */}
        <path
          d={ekgPath}
          fill="none"
          stroke={lineColor.replace(')', ', 0.3)')}
          strokeWidth={strokeWidth + 4}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            filter: 'blur(8px)',
            opacity: isAnimating ? 0.7 : 0,
            strokeDasharray: pathLength,
            strokeDashoffset: isAnimating ? 0 : pathLength,
            transition: isAnimating ? `stroke-dashoffset 3.5s linear, opacity 0.1s linear` : 'none'
          }}
        />
        
        {/* Main ECG trace */}
        <path
          ref={mainPathRef}
          d={ekgPath}
          fill="none"
          stroke={lineColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: pathLength,
            strokeDashoffset: isAnimating ? 0 : pathLength,
            transition: isAnimating ? `stroke-dashoffset 3.5s linear` : 'none',
            opacity: isAnimating ? 1 : 0
          }}
        />
        
        {/* Lead dot that draws the trace */}
        {isAnimating && (
          <circle
            r={strokeWidth * 1.5}
            fill="white"
            style={{
              filter: `drop-shadow(0 0 ${strokeWidth * 2}px ${lineColor})`,
            }}
          >
            <animateMotion
              dur="3.5s"
              path={ekgPath}
              repeatCount="1"
              fill="freeze"
            />
            <animate 
              attributeName="opacity"
              values="0.8;0.8;1;0.8;0.8;0"
              keyTimes="0;0.25;0.3;0.4;0.99;1"
              dur="3.5s"
              repeatCount="1"
              fill="freeze"
            />
            <animate
              attributeName="r"
              values={`${strokeWidth * 1.5};${strokeWidth * 1.5};${strokeWidth * 2.5};${strokeWidth * 1.5};${strokeWidth * 1.5}`}
              keyTimes="0;0.25;0.3;0.4;1"
              dur="3.5s"
              repeatCount="1"
              fill="freeze"
            />
          </circle>
        )}
        
        {/* Special eraser circle that follows the line and erases it */}
        {isAnimating && (
          <circle
            r={strokeWidth * 4}
            fill="none"
            stroke="white"
            strokeWidth={strokeWidth * 6}
            style={{
              filter: 'blur(2px)',
              mixBlendMode: 'difference',
              position: 'relative'
            }}
            opacity="0" // Start invisible
          >
            {/* Start this eraser when the first dot is almost done */}
            <animateMotion
              dur="3.5s"
              path={ekgPath}
              begin="2.5s" // Start when lead dot is almost done
              repeatCount="1"
              fill="freeze"
            />
            <animate 
              attributeName="opacity"
              values="0;0.95;0.95;0"
              keyTimes="0;0.1;0.9;1"
              dur="3.5s"
              begin="2.5s"
              repeatCount="1"
              fill="freeze"
            />
          </circle>
        )}
        
        {/* Identical lead dot that follows after the eraser to "draw" the path again */}
        {isAnimating && (
          <circle
            r={strokeWidth * 1.5}
            fill="white"
            style={{
              filter: `drop-shadow(0 0 ${strokeWidth * 2}px ${lineColor})`,
              position: 'relative'
            }}
            opacity="0" // Start invisible
          >
            {/* Start this dot after the eraser */}
            <animateMotion
              dur="3.5s"
              path={ekgPath}
              begin="2.6s" // Slightly after eraser
              repeatCount="1"
              fill="freeze"
            />
            <animate 
              attributeName="opacity"
              values="0;0.9;0.9;0"
              keyTimes="0;0.1;0.9;1"
              dur="3.5s"
              begin="2.6s"
              repeatCount="1"
              fill="freeze"
            />
            <animate
              attributeName="r"
              values={`${strokeWidth * 1.5};${strokeWidth * 1.5};${strokeWidth * 2};${strokeWidth * 1.5}`}
              keyTimes="0;0.4;0.5;1"
              dur="3.5s"
              begin="2.6s"
              repeatCount="1"
              fill="freeze"
            />
          </circle>
        )}
      </svg>
    </div>
  );
}