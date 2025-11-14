import React, { useState, useEffect, useRef } from 'react';

interface TooltipProps {
  content: string | React.ReactNode;
  x: number;
  y: number;
  visible: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, x, y, visible }) => {
  if (!visible) return null;

  return (
    <foreignObject
      x={x + 10}
      y={y - 30}
      width="300"
      height="200"
      style={{ pointerEvents: 'none', overflow: 'visible' }}
    >
      <div
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          maxWidth: '280px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word'
        }}
      >
        {content}
      </div>
    </foreignObject>
  );
};