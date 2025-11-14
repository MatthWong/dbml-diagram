import React from 'react';

interface GridSystemProps {
  gridSize: number;
  theme: 'light' | 'dark' | 'custom';
  width?: number;
  height?: number;
}

export const GridSystem: React.FC<GridSystemProps> = ({
  gridSize,
  theme,
  width = 2000,
  height = 1500
}) => {
  const gridColor = theme === 'dark' ? '#333333' : '#e0e0e0';
  const majorGridColor = theme === 'dark' ? '#444444' : '#cccccc';
  const majorGridInterval = 5; // Every 5th line is major

  return (
    <g className="grid-system">
      {/* Minor grid lines */}
      <defs>
        <pattern
          id={`grid-${theme}`}
          width={gridSize}
          height={gridSize}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
            fill="none"
            stroke={gridColor}
            strokeWidth="0.5"
            opacity="0.5"
          />
        </pattern>
        
        <pattern
          id={`major-grid-${theme}`}
          width={gridSize * majorGridInterval}
          height={gridSize * majorGridInterval}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M ${gridSize * majorGridInterval} 0 L 0 0 0 ${gridSize * majorGridInterval}`}
            fill="none"
            stroke={majorGridColor}
            strokeWidth="1"
            opacity="0.7"
          />
        </pattern>
      </defs>

      {/* Render grid */}
      <rect
        width={width}
        height={height}
        fill={`url(#grid-${theme})`}
      />
      
      {/* Major grid lines */}
      <rect
        width={width}
        height={height}
        fill={`url(#major-grid-${theme})`}
      />
    </g>
  );
};