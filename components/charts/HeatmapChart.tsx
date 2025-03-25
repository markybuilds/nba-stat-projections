import { useRef, useEffect } from 'react';
import { PlayerStats } from '@/types/stats';
import { generateHeatmapData } from './utils/dataTransformers';

interface HeatmapChartProps {
  stats: PlayerStats[];
  statKey: keyof PlayerStats;
  title: string;
  isDarkMode?: boolean;
  height?: number;
  cellSize?: number;
}

export const HeatmapChart: React.FC<HeatmapChartProps> = ({
  stats,
  statKey,
  title,
  isDarkMode = false,
  height = 300,
  cellSize = 10,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawHeatmap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const heatmapData = generateHeatmapData(stats, statKey);
    const values = heatmapData.flat().filter(v => v > 0);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);

    const getColor = (value: number) => {
      if (value === 0) return isDarkMode ? '#1a202c' : '#f7fafc';
      
      const normalizedValue = (value - minValue) / (maxValue - minValue);
      const hue = isDarkMode ? 200 : 210; // Blue hue
      const saturation = 80;
      const lightness = isDarkMode 
        ? 20 + (normalizedValue * 40) // 20-60% lightness for dark mode
        : 40 + (normalizedValue * 40); // 40-80% lightness for light mode
      
      return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    };

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw title
    ctx.fillStyle = isDarkMode ? '#e2e8f0' : '#2d3748';
    ctx.font = '14px system-ui';
    ctx.fillText(title, 10, 20);

    // Draw day labels
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    days.forEach((day, i) => {
      ctx.fillText(day, 10, 50 + (i * cellSize));
    });

    // Draw month labels
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    months.forEach((month, i) => {
      ctx.fillText(month, 50 + (i * (4 * cellSize)), 30);
    });

    // Draw heatmap cells
    heatmapData.forEach((week, weekIndex) => {
      week.forEach((value, dayIndex) => {
        const x = 50 + (weekIndex * cellSize);
        const y = 40 + (dayIndex * cellSize);

        ctx.fillStyle = getColor(value);
        ctx.fillRect(x, y, cellSize - 1, cellSize - 1);

        // Add hover effect
        canvas.addEventListener('mousemove', (event) => {
          const rect = canvas.getBoundingClientRect();
          const mouseX = event.clientX - rect.left;
          const mouseY = event.clientY - rect.top;

          if (
            mouseX >= x && mouseX <= x + cellSize - 1 &&
            mouseY >= y && mouseY <= y + cellSize - 1
          ) {
            // Draw tooltip
            ctx.fillStyle = isDarkMode ? '#2d3748' : '#ffffff';
            ctx.fillRect(mouseX + 10, mouseY - 30, 100, 25);
            ctx.strokeStyle = isDarkMode ? '#4a5568' : '#e2e8f0';
            ctx.strokeRect(mouseX + 10, mouseY - 30, 100, 25);
            
            ctx.fillStyle = isDarkMode ? '#ffffff' : '#2d3748';
            ctx.font = '12px system-ui';
            ctx.fillText(
              `${statKey}: ${value.toFixed(1)}`,
              mouseX + 15,
              mouseY - 15
            );
          }
        });
      });
    });

    // Draw legend
    const legendWidth = 200;
    const legendHeight = 20;
    const legendX = canvas.width - legendWidth - 10;
    const legendY = canvas.height - 30;

    const gradient = ctx.createLinearGradient(legendX, 0, legendX + legendWidth, 0);
    for (let i = 0; i <= 1; i += 0.1) {
      gradient.addColorStop(i, getColor(minValue + (i * (maxValue - minValue))));
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(legendX, legendY, legendWidth, legendHeight);

    ctx.fillStyle = isDarkMode ? '#e2e8f0' : '#2d3748';
    ctx.font = '12px system-ui';
    ctx.fillText(`${minValue.toFixed(1)}`, legendX, legendY + legendHeight + 15);
    ctx.fillText(`${maxValue.toFixed(1)}`, legendX + legendWidth - 30, legendY + legendHeight + 15);
  };

  useEffect(() => {
    if (canvasRef.current) {
      // Set canvas size
      canvasRef.current.width = 600;
      canvasRef.current.height = height;
      drawHeatmap();
    }
  }, [stats, statKey, isDarkMode]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="w-full"
        style={{ height }}
      />
    </div>
  );
}; 