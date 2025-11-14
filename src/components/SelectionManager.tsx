import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ViewportState } from '../types/database';
import { Position, Bounds } from '../types/utils';

interface SelectionManagerProps {
  selectedItems: string[];
  viewport: ViewportState;
  onSelectionChange: (bounds: Bounds) => void;
}

export const SelectionManager: React.FC<SelectionManagerProps> = ({
  selectedItems,
  viewport,
  onSelectionChange
}) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<Position>({ x: 0, y: 0 });
  const [selectionEnd, setSelectionEnd] = useState<Position>({ x: 0, y: 0 });
  const selectionRef = useRef<HTMLDivElement>(null);

  // Convert screen coordinates to world coordinates
  const screenToWorld = useCallback((screenPos: Position): Position => {
    return {
      x: (screenPos.x - viewport.pan.x) / viewport.zoom,
      y: (screenPos.y - viewport.pan.y) / viewport.zoom
    };
  }, [viewport]);

  // Convert world coordinates to screen coordinates
  const worldToScreen = useCallback((worldPos: Position): Position => {
    return {
      x: worldPos.x * viewport.zoom + viewport.pan.x,
      y: worldPos.y * viewport.zoom + viewport.pan.y
    };
  }, [viewport]);

  // Handle selection rectangle
  const handleSelectionStart = useCallback((screenPos: Position) => {
    const worldPos = screenToWorld(screenPos);
    setIsSelecting(true);
    setSelectionStart(worldPos);
    setSelectionEnd(worldPos);
  }, [screenToWorld]);

  const handleSelectionMove = useCallback((screenPos: Position) => {
    if (!isSelecting) return;
    
    const worldPos = screenToWorld(screenPos);
    setSelectionEnd(worldPos);
  }, [isSelecting, screenToWorld]);

  const handleSelectionEnd = useCallback(() => {
    if (!isSelecting) return;

    const minX = Math.min(selectionStart.x, selectionEnd.x);
    const minY = Math.min(selectionStart.y, selectionEnd.y);
    const maxX = Math.max(selectionStart.x, selectionEnd.x);
    const maxY = Math.max(selectionStart.y, selectionEnd.y);

    // Only trigger selection if the rectangle is large enough
    if (Math.abs(maxX - minX) > 5 || Math.abs(maxY - minY) > 5) {
      onSelectionChange({
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
      });
    }

    setIsSelecting(false);
  }, [isSelecting, selectionStart, selectionEnd, onSelectionChange]);

  // Calculate selection rectangle in screen coordinates for display
  const selectionRect = React.useMemo(() => {
    if (!isSelecting) return null;

    const startScreen = worldToScreen(selectionStart);
    const endScreen = worldToScreen(selectionEnd);

    return {
      x: Math.min(startScreen.x, endScreen.x),
      y: Math.min(startScreen.y, endScreen.y),
      width: Math.abs(endScreen.x - startScreen.x),
      height: Math.abs(endScreen.y - startScreen.y)
    };
  }, [isSelecting, selectionStart, selectionEnd, worldToScreen]);

  return (
    <>
      {/* Selection rectangle overlay */}
      {selectionRect && (
        <div
          ref={selectionRef}
          style={{
            position: 'absolute',
            left: selectionRect.x,
            top: selectionRect.y,
            width: selectionRect.width,
            height: selectionRect.height,
            border: '1px dashed #2196f3',
            backgroundColor: 'rgba(33, 150, 243, 0.1)',
            pointerEvents: 'none',
            zIndex: 1000
          }}
        />
      )}

      {/* Selection info display */}
      {selectedItems.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            padding: '8px 12px',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            borderRadius: '4px',
            fontSize: '12px',
            pointerEvents: 'none',
            zIndex: 1000
          }}
        >
          {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
        </div>
      )}
    </>
  );
};