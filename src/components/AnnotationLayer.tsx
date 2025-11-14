import React from 'react';
import { Annotation } from '../types/database';
import { TextAnnotation } from './TextAnnotation';
import { ShapeAnnotation } from './ShapeAnnotation';

interface AnnotationLayerProps {
  annotations: Annotation[];
  selectedItems: string[];
  theme: 'light' | 'dark' | 'custom';
}

export const AnnotationLayer: React.FC<AnnotationLayerProps> = ({
  annotations,
  selectedItems,
  theme
}) => {
  // Sort annotations by z-index
  const sortedAnnotations = [...annotations].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <g className="annotation-layer">
      {sortedAnnotations.map(annotation => {
        const isSelected = selectedItems.includes(annotation.id);
        
        switch (annotation.type) {
          case 'text':
            return (
              <TextAnnotation
                key={annotation.id}
                annotation={annotation}
                selected={isSelected}
                theme={theme}
              />
            );
          case 'shape':
            return (
              <ShapeAnnotation
                key={annotation.id}
                annotation={annotation}
                selected={isSelected}
                theme={theme}
              />
            );
          case 'arrow':
            return (
              <ShapeAnnotation
                key={annotation.id}
                annotation={annotation}
                selected={isSelected}
                theme={theme}
                shape="arrow"
              />
            );
          default:
            return null;
        }
      })}
    </g>
  );
};