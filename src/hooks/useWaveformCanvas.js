import { useEffect, useRef } from 'react';

export function useWaveformCanvas(waveformData) {
  const canvasRef = useRef(null);
  const historyRef = useRef([]);
  const animationFrameRef = useRef();

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;

    if (waveformData?.length) {
      historyRef.current = [...waveformData];
      if (historyRef.current.length > 32) {
        historyRef.current = historyRef.current.slice(-32);
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (!waveformData?.length) {
        const staticWave = new Array(20).fill(0).map(() => Math.random() * 10);
        drawWaveform(ctx, staticWave, canvas.width, canvas.height, '#3730a3', false);
        animationFrameRef.current = requestAnimationFrame(draw);
        return;
      }

      drawWaveform(ctx, historyRef.current, canvas.width, canvas.height, '#6366f1', true);
      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [waveformData]);

  return canvasRef;
}

function drawWaveform(ctx, data, width, height, color, isRecording) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, `${color}90`);
  gradient.addColorStop(0.5, color);
  gradient.addColorStop(1, `${color}90`);
  ctx.fillStyle = gradient;

  const centerY = height / 2;
  const barWidth = width / data.length;
  
  data.forEach((value, index) => {
    const normalizedValue = Math.min(255, value) / 255;
    
    const minHeight = height * 0.15;
    const maxHeight = height * (isRecording ? 0.95 : 0.5);
    const barHeight = minHeight + (normalizedValue * (maxHeight - minHeight));
    
    const barWidthScale = 0.8;
    const x = index * barWidth + (barWidth * (1 - barWidthScale) / 2);
    
    ctx.beginPath();
    ctx.roundRect(
      x,
      centerY - barHeight / 2,
      barWidth * barWidthScale,
      barHeight,
      2
    );
    ctx.fill();
  });
} 