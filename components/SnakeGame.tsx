
import React, { useRef, useEffect, useState } from 'react';

// Configuration
const SPEED = 2.5;
const TURN_SPEED = 0.15;
const TAIL_LENGTH = 20; // Shorter start
const GROWTH_PER_FOOD = 10; // Grow by 10 segments per food
const SEGMENT_SPACING = 4;
const SNAKE_WIDTH = 4;
const SNAKE_COLOR = '#6466f1'; // Solid Purple
const FOOD_COLOR = '#fbbf24';  // Solid Amber

interface Point {
  x: number;
  y: number;
}

export const SnakeGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Game State Refs
  const pos = useRef<Point>({ x: 0, y: 0 });
  const angle = useRef<number>(0); 
  const targetAngle = useRef<number>(0);
  const history = useRef<Point[]>([]); 
  const food = useRef<Point>({ x: 0, y: 0 });
  const score = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);
  
  // State for UI
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(false); // Ref for the loop to access current state
  const [headPos, setHeadPos] = useState({ x: 0, y: 0 }); // For bubble positioning

  // Dimensions
  const width = useRef(window.innerWidth);
  const height = useRef(window.innerHeight);

  const startGame = () => {
    setIsPlaying(true);
    isPlayingRef.current = true;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle Resize
    const handleResize = () => {
      if (containerRef.current) {
        width.current = containerRef.current.clientWidth;
        height.current = containerRef.current.clientHeight;
        canvas.width = width.current;
        canvas.height = height.current;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    const spawnFood = () => {
      const margin = 20;
      food.current = {
        x: margin + Math.random() * (width.current - 2 * margin),
        y: margin + Math.random() * (height.current - 2 * margin)
      };
    };

    // Initialization
    const initGame = (fullReset = false) => {
      // Start at Bottom RIGHT, very low (10px padding from bottom for radius)
      // Snake is 4px wide, head radius 3. So 30px is safe margin.
      const startX = width.current > 0 ? width.current - 50 : 300;
      const startY = height.current > 0 ? height.current - 30 : 500;

      pos.current = { x: startX, y: startY };
      
      // IMPORTANT: Update React state immediately so bubble moves to start
      setHeadPos({ ...pos.current });
      
      // Face LEFT (Math.PI)
      angle.current = Math.PI;
      targetAngle.current = angle.current;
      
      history.current = [];
      // Create initial tail extending to the RIGHT (behind the head)
      for(let i=0; i<TAIL_LENGTH * SEGMENT_SPACING; i++) {
          history.current.push({ x: pos.current.x + (i * SPEED), y: pos.current.y });
      }
      
      score.current = 0;
      spawnFood();
      
      if (fullReset) {
        setIsPlaying(false);
        isPlayingRef.current = false;
      }
    };

    // Game Loop
    const loop = () => {
      if (isPlayingRef.current) {
        // 1. Update Direction
        let diff = targetAngle.current - angle.current;
        while (diff <= -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        angle.current += diff * TURN_SPEED;

        // 2. Move Head
        pos.current.x += Math.cos(angle.current) * SPEED;
        pos.current.y += Math.sin(angle.current) * SPEED;

        // 3. Wraparound Logic (Pac-Man style)
        if (pos.current.x < 0) pos.current.x = width.current;
        if (pos.current.x > width.current) pos.current.x = 0;
        if (pos.current.y < 0) pos.current.y = height.current;
        if (pos.current.y > height.current) pos.current.y = 0;

        // 4. Update Tail
        history.current.unshift({ ...pos.current });
        
        // Growth Logic: Length increases based on score
        const currentLength = (TAIL_LENGTH + score.current * GROWTH_PER_FOOD) * SEGMENT_SPACING;
        
        if (history.current.length > currentLength) {
            history.current.pop();
        }

        // 5. Food Collision
        const dx = pos.current.x - food.current.x;
        const dy = pos.current.y - food.current.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist < 15) {
            score.current += 1;
            spawnFood();
        }

        // 6. Self Collision
        // Only check segments that are not immediately close to head
        for (let i = 15; i < history.current.length; i += SEGMENT_SPACING) {
            const seg = history.current[i];
            const distHead = Math.sqrt(Math.pow(pos.current.x - seg.x, 2) + Math.pow(pos.current.y - seg.y, 2));
            
            // If distance is small AND it's not a wraparound jump (check if segment distance is huge)
            const prevSeg = history.current[i-1];
            const segJump = Math.sqrt(Math.pow(seg.x - prevSeg.x, 2) + Math.pow(seg.y - prevSeg.y, 2));

            if (distHead < 5 && segJump < 50) {
                initGame(true); // Crash! Restart completely (Reset position to start)
                return; // Exit loop
            }
        }
      }

      // Update bubble position state less frequently for performance, but sync ensures smoothness
      // We assume simple position for bubble
      if (!isPlayingRef.current) {
          // Keep head pos updated for bubble while waiting
          setHeadPos({ ...pos.current });
      }

      // 7. Render
      ctx.clearRect(0, 0, width.current, height.current);

      // Draw Food (Dot)
      ctx.fillStyle = FOOD_COLOR;
      ctx.beginPath();
      ctx.arc(food.current.x, food.current.y, 4, 0, Math.PI * 2);
      ctx.fill();

      // Draw Snake
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = SNAKE_WIDTH;
      ctx.strokeStyle = SNAKE_COLOR;
      
      ctx.beginPath();
      if (history.current.length > 0) {
          ctx.moveTo(history.current[0].x, history.current[0].y);
          
          let lastIndex = 0;
          // Loop through segments using spacing
          for (let i = SEGMENT_SPACING; i < history.current.length; i += SEGMENT_SPACING) {
              const p1 = history.current[lastIndex]; // Previous drawn point
              const p2 = history.current[i];         // Next point to draw
              
              // Calculate distance between the points we are about to connect
              const dist = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
              
              // If distance is large (e.g., > 100px), it means we wrapped around screen. 
              // Don't draw a line across the screen; move to the new point instead.
              if (dist > 100) {
                  ctx.moveTo(p2.x, p2.y);
              } else {
                  ctx.lineTo(p2.x, p2.y);
              }
              
              lastIndex = i;
          }
      }
      ctx.stroke();

      // Draw Head Dot
      ctx.fillStyle = SNAKE_COLOR;
      ctx.beginPath();
      ctx.arc(pos.current.x, pos.current.y, 3, 0, Math.PI * 2);
      ctx.fill();

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    initGame();
    loop();

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleInteraction = (clientX: number, clientY: number) => {
    if (!containerRef.current || !isPlayingRef.current) return;
    const dx = clientX - pos.current.x;
    const dy = clientY - pos.current.y;
    targetAngle.current = Math.atan2(dy, dx);
  };

  const handleTouch = (e: React.TouchEvent) => {
    handleInteraction(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    handleInteraction(e.clientX, e.clientY);
  };

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 z-0 overflow-hidden cursor-crosshair bg-slate-50 dark:bg-slate-950"
      onTouchStart={handleTouch}
      onMouseDown={handleMouseDown}
    >
      <canvas ref={canvasRef} className="block" />
      
      {/* Start Bubble */}
      {!isPlaying && (
        <div 
            className="absolute transition-transform duration-100 ease-out z-20 pointer-events-auto"
            style={{ 
                left: headPos.x, 
                // Adjusted top to be higher above snake (approx 80px up from head)
                top: headPos.y - 80, 
                transform: 'translateX(-85%)' // Shifted to be visible from right edge
            }}
        >
            <div className="flex flex-col items-end animate-in fade-in zoom-in duration-300">
                <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-br-none shadow-xl border border-slate-100 dark:border-slate-700 flex flex-col items-center gap-2">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        Ahoj, kým čakáš, zahraj sa 🐍
                    </span>
                    <button 
                        onClick={startGame}
                        className="bg-[#6466f1] hover:bg-indigo-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors w-full"
                    >
                        Začať
                    </button>
                </div>
                {/* Triangle - Pointing Right/Down */}
                <div className="w-3 h-3 bg-white dark:bg-slate-800 transform rotate-45 -mt-1.5 mr-4 border-r border-b border-slate-100 dark:border-slate-700"></div>
            </div>
        </div>
      )}
    </div>
  );
};
