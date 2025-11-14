import React from 'react';
import { Annotation } from '../types/database';
import { useAnnotationOperations } from '../hooks/useStateManagement';

interface ShapeAnnotationProps {
  annotation: Annotation;
  selected: boolean;
  theme: 'light' | 'dark' | 'custom';
  shape?: 'rectangle' | 'circle' | 'arrow';
}

export const ShapeAnnotation: React.FC<ShapeAnnotationProps> = ({
  annotation,
  selected,
  theme,
  shape = 'rectangle'
}) => {
  const { selectAnnotation, changeAnnotationStyle } = useAnnotationOperations();

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    selectAnnotation(annotation.id, event.ctrlKey || event.metaKey);
  };

  const backgroundColor = annotation.style.backgroundColor || 
    (theme === 'dark' ? 'rgba(60, 60, 60, 0.8)' : 'rgba(240, 240, 240, 0.8)');
  
  const borderColor = annotation.style.borderColor || 
    (selected ? '#2196f3' : (theme === 'dark' ? '#666' : '#999'));

  const renderShape = () => {
    switch (shape) {
      case 'circle':
        return (
          <ellipse
            cx={annotation.position.x + annotation.size.width / 2}
            cy={annotation.position.y + annotation.size.height / 2}
            rx={annotation.size.width / 2}
            ry={annotation.size.height / 2}
            fill={backgroundColor}
            stroke={borderColor}
            strokeWidth={selected ? 2 : 1}
            strokeDasharray={selected ? '5,5' : 'none'}
          />
        );
      
      case 'arrow':
        const arrowPath = `
          M ${annotation.position.x} ${annotation.position.y + annotation.size.height / 2}
          L ${annotation.position.x + annotation.size.width - 20} ${annotation.position.y + annotation.size.height / 2}
          L ${annotation.position.x + annotation.size.width - 20} ${annotation.position.y + 10}
          L ${annotation.position.x + annotation.size.width} ${annotation.position.y + annotation.size.height / 2}
          L ${annotation.position.x + annotation.size.width - 20} ${annotation.position.y + annotation.size.height - 10}
          L ${annotation.position.x + annotation.size.width - 20} ${annotation.position.y + annotation.size.height / 2}
          Z
        `;
        
        return (
          <path
            d={arrowPath}
            fill={backgroundColor}
            stroke={borderColor}
            strokeWidth={selected ? 2 : 1}
            strokeDasharray={selected ? '5,5' : 'none'}
          />
        );
      
      case 'rectangle':
      default:
        return (
          <rect
            x={annotation.position.x}
            y={annotation.position.y}
            width={annotation.size.width}
            height={annotation.size.height}
            fill={backgroundColor}
            stroke={borderColor}
            strokeWidth={selected ? 2 : 1}
            strokeDasharray={selected ? '5,5' : 'none'}
            rx="4"
            ry="4"
          />
        );
    }
  };

  return (
    <g 
      className={`shape-annotation ${selected ? 'selected' : ''}`}
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      {renderShape()}

      {/* Content text if present */}
      {annotation.content && (
        <text
          x={annotation.position.x + annotation.size.width / 2}
          y={annotation.position.y + annotation.size.height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={annotation.style.fontSize || 12}
          fontWeight={annotation.style.fontWeight || 'normal'}
          fontStyle={annotation.style.fontStyle || 'normal'}
          fill={annotation.style.textColor || (theme === 'dark' ? '#ffffff' : '#000000')}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {annotation.content}
        </text>
      )}

      {/* Resize handles when selected */}
      {selected && (
        <g className="resize-handles">
          {/* Corner handles */}
          <rect
            x={annotation.position.x - 3}
            y={annotation.position.y - 3}
            width="6"
            height="6"
            fill="#2196f3"
            stroke="#fff"
            strokeWidth="1"
            style={{ cursor: 'nw-resize' }}
          />
          
          <rect
            x={annotation.position.x + annotation.size.width - 3}
            y={annotation.position.y - 3}
            width="6"
            height="6"
            fill="#2196f3"
            stroke="#fff"
            strokeWidth="1"
            style={{ cursor: 'ne-resize' }}
          />
          
          <rect
            x={annotation.position.x - 3}
            y={annotation.position.y + annotation.size.height - 3}
            width="6"
            height="6"
            fill="#2196f3"
            stroke="#fff"
            strokeWidth="1"
            style={{ cursor: 'sw-resize' }}
          />
          
          <rect
            x={annotation.position.x + annotation.size.width - 3}
            y={annotation.position.y + annotation.size.height - 3}
            width="6"
            height="6"
            fill="#2196f3"
            stroke="#fff"
            strokeWidth="1"
            style={{ cursor: 'se-resize' }}
          />

          {/* Edge handles */}
          <rect
            x={annotation.position.x + annotation.size.width / 2 - 3}
            y={annotation.position.y - 3}
            width="6"
            height="6"
            fill="#2196f3"
            stroke="#fff"
            strokeWidth="1"
            style={{ cursor: 'ns-resize' }}
          />
          
          <rect
            x={annotation.position.x + annotation.size.width / 2 - 3}
            y={annotation.position.y + annotation.size.height - 3}
            width="6"
            height="6"
            fill="#2196f3"
            stroke="#fff"
            strokeWidth="1"
            style={{ cursor: 'ns-resize' }}
          />
          
          <rect
            x={annotation.position.x - 3}
            y={annotation.position.y + annotation.size.height / 2 - 3}
            width="6"
            height="6"
            fill="#2196f3"
            stroke="#fff"
            strokeWidth="1"
            style={{ cursor: 'ew-resize' }}
          />
          
          <rect
            x={annotation.position.x + annotation.size.width - 3}
            y={annotation.position.y + annotation.size.height / 2 - 3}
            width="6"
            height="6"
            fill="#2196f3"
            stroke="#fff"
            strokeWidth="1"
            style={{ cursor: 'ew-resize' }}
          />
        </g>
      )}
    </g>
  );
};