
import React, { useRef, useEffect, useState } from 'react';

// Configuration
const SPEED = 2.5;
const TURN_SPEED = 0.15;
const TAIL_LENGTH = 20; // Shorter start
const GROWTH_PER_FOOD = 10; // Grow by 10 segments per food
const SEGMENT_SPACING = 4; // Used for length calculation and collision optimization
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
      let valid = false;
      let newX = 0;
      let newY = 0;
      let attempts = 0;

      const centerX = width.current / 2;
      const centerY = height.current / 2;
      
      // Define Forbidden Zone (Center area where Loading UI is)
      const forbiddenW = 340; 
      const forbiddenH = 250;

      while (!valid && attempts < 100) {
        newX = margin + Math.random() * (width.current - 2 * margin);
        newY = margin + Math.random() * (height.current - 2 * margin);

        // Check collision with Forbidden Zone
        const inBoxX = newX > (centerX - forbiddenW/2) && newX < (centerX + forbiddenW/2);
        const inBoxY = newY > (centerY - forbiddenH/2) && newY < (centerY + forbiddenH/2);

        if (!inBoxX || !inBoxY) {
            valid = true;
        }
        attempts++;
      }
      
      // Fallback (corner) if somehow we fail to find a spot
      if (!valid) {
          newX = margin;
          newY = margin;
      }

      food.current = { x: newX, y: newY };
    };

    // Initialization
    const initGame = (fullReset = false) => {
      // Start at Bottom RIGHT, very low (10px padding from bottom for radius)
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
        // Optimization: Skip adjacent segments, check every few
        for (let i = 15; i < history.current.length; i += SEGMENT_SPACING) {
            const seg = history.current[i];
            const distHead = Math.sqrt(Math.pow(pos.current.x - seg.x, 2) + Math.pow(pos.current.y - seg.y, 2));
            
            // If distance is small AND it's not a wraparound jump (check if segment distance is huge)
            const prevSeg = history.current[i-1];
            const segJump = Math.sqrt(Math.pow(seg.x - prevSeg.x, 2) + Math.pow(seg.y - prevSeg.y, 2));

            if (distHead < 5 && segJump < 50) {
                initGame(true); // Crash! Restart completely (Reset position to start)
            }
        }
      }

      // Update bubble position state less frequently for performance, but sync ensures smoothness
      if (!isPlayingRef.current) {
          setHeadPos({ ...pos.current });
      }

      // 7. Render
      ctx.clearRect(0, 0, width.current, height.current);

      // Draw Food (Dot)
      if (!isNaN(food.current.x) && !isNaN(food.current.y)) {
        ctx.fillStyle = FOOD_COLOR;
        ctx.beginPath();
        ctx.arc(food.current.x, food.current.y, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Glow effect
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(food.current.x, food.current.y, 10, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw Snake
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = SNAKE_WIDTH;
      ctx.strokeStyle = SNAKE_COLOR;
      
      ctx.beginPath();
      if (history.current.length > 0) {
          ctx.moveTo(history.current[0].x, history.current[0].y);
          
          // Draw EVERY point for maximum smoothness
          for (let i = 1; i < history.current.length; i++) {
              const p1 = history.current[i-1];
              const p2 = history.current[i];
              
              // Calculate squared distance
              const distSq = (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2;
              
              // If distance is large (> 2500 = 50px^2), it's a wraparound jump. Break the line.
              if (distSq > 2500) {
                  ctx.moveTo(p2.x, p2.y);
              } else {
                  ctx.lineTo(p2.x, p2.y);
              }
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
                // Adjusted top to be closer to snake (70px up from head - adjusted lower)
                top: headPos.y - 70, 
                transform: 'translateX(-85%)' // Shifted to be visible from right edge
            }}
        >
            <div className="flex flex-col items-end animate-in fade-in zoom-in duration-300">
                <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl px-5 py-2 rounded-xl rounded-br-none shadow-xl border border-white/50 dark:border-slate-700/50 flex flex-col items-center gap-1.5">
                    <span className="text-[9px] font-black text-slate-800 dark:text-slate-100 whitespace-nowrap tracking-tight">
                        Máme chviľku? Poďme si zahrať! 🐍
                    </span>
                    <button 
                        onClick={startGame}
                        className="w-full bg-[#6466f1] hover:bg-indigo-700 text-white text-[9px] font-bold px-2 py-1 rounded-md shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center justify-center gap-1"
                    >
                        <span>Začať</span>
                    </button>
                </div>
                {/* Triangle - Pointing Right/Down */}
                <div className="w-2.5 h-2.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl transform rotate-45 -mt-1 mr-4 border-r border-b border-white/50 dark:border-slate-700/50"></div>
            </div>
        </div>
      )}
    </div>
  );
};
