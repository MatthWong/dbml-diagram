import React, { useState, useRef, useEffect } from 'react';
import { Annotation } from '../types/database';
import { useAnnotationOperations } from '../hooks/useStateManagement';

interface TextAnnotationProps {
  annotation: Annotation;
  selected: boolean;
  theme: 'light' | 'dark' | 'custom';
}

export const TextAnnotation: React.FC<TextAnnotationProps> = ({
  annotation,
  selected,
  theme
}) => {
  const { 
    selectAnnotation, 
    moveAnnotation, 
    resizeAnnotation, 
    changeAnnotationContent,
    changeAnnotationStyle 
  } = useAnnotationOperations();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(annotation.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle editing
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    selectAnnotation(annotation.id, event.ctrlKey || event.metaKey);
  };

  const handleDoubleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsEditing(true);
  };

  const handleEditSubmit = () => {
    changeAnnotationContent(annotation.id, editContent);
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setEditContent(annotation.content);
    setIsEditing(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleEditSubmit();
    } else if (event.key === 'Escape') {
      handleEditCancel();
    }
  };

  // Calculate text styling
  const textStyle = {
    fontSize: annotation.style.fontSize || 14,
    fontWeight: annotation.style.fontWeight || 'normal',
    fontStyle: annotation.style.fontStyle || 'normal',
    fill: annotation.style.textColor || (theme === 'dark' ? '#ffffff' : '#000000')
  };

  const backgroundColor = annotation.style.backgroundColor || 
    (theme === 'dark' ? 'rgba(40, 40, 40, 0.9)' : 'rgba(255, 255, 255, 0.9)');
  
  const borderColor = annotation.style.borderColor || 
    (selected ? '#2196f3' : (theme === 'dark' ? '#555' : '#ccc'));

  // Split content into lines for proper text rendering
  const lines = annotation.content.split('\n');
  const lineHeight = (annotation.style.fontSize || 14) * 1.2;

  return (
    <g 
      className={`text-annotation ${selected ? 'selected' : ''}`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      style={{ cursor: 'pointer' }}
    >
      {/* Background rectangle */}
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

      {/* Text content */}
      {!isEditing ? (
        <text
          x={annotation.position.x + 8}
          y={annotation.position.y + 8 + (annotation.style.fontSize || 14)}
          style={textStyle}
        >
          {lines.map((line, index) => (
            <tspan
              key={index}
              x={annotation.position.x + 8}
              dy={index === 0 ? 0 : lineHeight}
            >
              {line}
            </tspan>
          ))}
        </text>
      ) : (
        // Foreign object for HTML textarea during editing
        <foreignObject
          x={annotation.position.x + 4}
          y={annotation.position.y + 4}
          width={annotation.size.width - 8}
          height={annotation.size.height - 8}
        >
          <textarea
            ref={textareaRef}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleEditSubmit}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              outline: 'none',
              resize: 'none',
              backgroundColor: 'transparent',
              color: textStyle.fill,
              fontSize: textStyle.fontSize,
              fontWeight: textStyle.fontWeight,
              fontStyle: textStyle.fontStyle,
              fontFamily: 'inherit',
              padding: '4px'
            }}
          />
        </foreignObject>
      )}

      {/* Resize handles when selected */}
      {selected && !isEditing && (
        <g className="resize-handles">
          {/* Corner handles */}
          <rect
            x={annotation.position.x + annotation.size.width - 6}
            y={annotation.position.y + annotation.size.height - 6}
            width="6"
            height="6"
            fill="#2196f3"
            stroke="#fff"
            strokeWidth="1"
            style={{ cursor: 'nw-resize' }}
          />
          
          {/* Edge handles */}
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
        </g>
      )}
    </g>
  );
};