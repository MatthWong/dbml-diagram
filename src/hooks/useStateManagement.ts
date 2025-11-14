import { useCallback, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Reference, Annotation } from '../types/database';
import { Position, Size } from '../types/utils';

// Export hierarchical column operations
export const useHierarchicalColumnOperations = () => {
  const { 
    setNestingLevel, 
    toggleHierarchicalView, 
    getCurrentNestingLevel, 
    isHierarchicalViewEnabled 
  } = useAppContext();

  return {
    setNestingLevel,
    toggleHierarchicalView,
    getCurrentNestingLevel,
    isHierarchicalViewEnabled
  };
};

// Hook for table operations
export const useTableOperations = () => {
  const { updateTable, selectItem, isItemSelected } = useAppContext();

  const moveTable = useCallback((id: string, position: Position) => {
    updateTable(id, { position });
  }, [updateTable]);

  const resizeTable = useCallback((id: string, size: Size) => {
    updateTable(id, { size });
  }, [updateTable]);

  const changeTableColor = useCallback((id: string, color: string) => {
    updateTable(id, { color });
  }, [updateTable]);

  const toggleTableCollapse = useCallback((id: string, collapsed: boolean) => {
    updateTable(id, { collapsed });
  }, [updateTable]);

  const selectTable = useCallback((id: string, multiSelect = false) => {
    selectItem(id, multiSelect);
  }, [selectItem]);

  const isTableSelected = useCallback((id: string) => {
    return isItemSelected(id);
  }, [isItemSelected]);

  return {
    moveTable,
    resizeTable,
    changeTableColor,
    toggleTableCollapse,
    selectTable,
    isTableSelected
  };
};

// Hook for reference operations
export const useReferenceOperations = () => {
  const { updateReference, selectItem, isItemSelected } = useAppContext();

  const changeReferenceStyle = useCallback((id: string, style: Partial<Reference>) => {
    updateReference(id, style);
  }, [updateReference]);

  const selectReference = useCallback((id: string, multiSelect = false) => {
    selectItem(id, multiSelect);
  }, [selectItem]);

  const isReferenceSelected = useCallback((id: string) => {
    return isItemSelected(id);
  }, [isItemSelected]);

  return {
    changeReferenceStyle,
    selectReference,
    isReferenceSelected
  };
};

// Hook for annotation operations
export const useAnnotationOperations = () => {
  const { 
    addAnnotation, 
    updateAnnotation, 
    deleteAnnotation, 
    selectItem, 
    isItemSelected 
  } = useAppContext();

  const createAnnotation = useCallback((annotation: Omit<Annotation, 'id'>) => {
    const newAnnotation: Annotation = {
      ...annotation,
      id: `annotation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    addAnnotation(newAnnotation);
    return newAnnotation.id;
  }, [addAnnotation]);

  const moveAnnotation = useCallback((id: string, position: Position) => {
    updateAnnotation(id, { position });
  }, [updateAnnotation]);

  const resizeAnnotation = useCallback((id: string, size: Size) => {
    updateAnnotation(id, { size });
  }, [updateAnnotation]);

  const changeAnnotationContent = useCallback((id: string, content: string) => {
    updateAnnotation(id, { content });
  }, [updateAnnotation]);

  const changeAnnotationStyle = useCallback((id: string, style: Partial<Annotation['style']>) => {
    updateAnnotation(id, { style });
  }, [updateAnnotation]);

  const removeAnnotation = useCallback((id: string) => {
    deleteAnnotation(id);
  }, [deleteAnnotation]);

  const selectAnnotation = useCallback((id: string, multiSelect = false) => {
    selectItem(id, multiSelect);
  }, [selectItem]);

  const isAnnotationSelected = useCallback((id: string) => {
    return isItemSelected(id);
  }, [isItemSelected]);

  return {
    createAnnotation,
    moveAnnotation,
    resizeAnnotation,
    changeAnnotationContent,
    changeAnnotationStyle,
    removeAnnotation,
    selectAnnotation,
    isAnnotationSelected
  };
};

// Hook for viewport operations
export const useViewportOperations = () => {
  const { state, setViewport } = useAppContext();
  const viewport = state.ui.viewport;

  const zoomIn = useCallback((factor = 1.2) => {
    const newZoom = Math.min(viewport.zoom * factor, 5); // Max zoom 5x
    setViewport({
      ...viewport,
      zoom: newZoom
    });
  }, [viewport, setViewport]);

  const zoomOut = useCallback((factor = 1.2) => {
    const newZoom = Math.max(viewport.zoom / factor, 0.1); // Min zoom 0.1x
    setViewport({
      ...viewport,
      zoom: newZoom
    });
  }, [viewport, setViewport]);

  const resetZoom = useCallback(() => {
    setViewport({
      ...viewport,
      zoom: 1
    });
  }, [viewport, setViewport]);

  const panTo = useCallback((x: number, y: number) => {
    setViewport({
      ...viewport,
      pan: { x, y }
    });
  }, [viewport, setViewport]);

  const panBy = useCallback((deltaX: number, deltaY: number) => {
    setViewport({
      ...viewport,
      pan: {
        x: viewport.pan.x + deltaX,
        y: viewport.pan.y + deltaY
      }
    });
  }, [viewport, setViewport]);

  const fitToScreen = useCallback(() => {
    const { tables, annotations } = state.schema;
    
    if (tables.length === 0 && annotations.length === 0) {
      resetZoom();
      panTo(0, 0);
      return;
    }

    // Calculate bounds of all elements
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    tables.forEach(table => {
      minX = Math.min(minX, table.position.x);
      minY = Math.min(minY, table.position.y);
      maxX = Math.max(maxX, table.position.x + table.size.width);
      maxY = Math.max(maxY, table.position.y + table.size.height);
    });

    annotations.forEach(annotation => {
      minX = Math.min(minX, annotation.position.x);
      minY = Math.min(minY, annotation.position.y);
      maxX = Math.max(maxX, annotation.position.x + annotation.size.width);
      maxY = Math.max(maxY, annotation.position.y + annotation.size.height);
    });

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    const padding = 50;

    // Calculate zoom to fit content with padding
    const zoomX = (viewport.bounds.width - padding * 2) / contentWidth;
    const zoomY = (viewport.bounds.height - padding * 2) / contentHeight;
    const newZoom = Math.min(zoomX, zoomY, 1); // Don't zoom in beyond 1x

    // Calculate pan to center content
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const panX = viewport.bounds.width / 2 - centerX * newZoom;
    const panY = viewport.bounds.height / 2 - centerY * newZoom;

    setViewport({
      ...viewport,
      zoom: newZoom,
      pan: { x: panX, y: panY }
    });
  }, [state.schema, viewport, setViewport, resetZoom, panTo]);

  return {
    zoomIn,
    zoomOut,
    resetZoom,
    panTo,
    panBy,
    fitToScreen,
    setViewport,
    viewport
  };
};

// Hook for selection operations
export const useSelectionOperations = () => {
  const { 
    state, 
    selectItems, 
    selectItem, 
    clearSelection,
    getSelectedTables,
    getSelectedReferences,
    getSelectedAnnotations
  } = useAppContext();

  const selectedItems = state.ui.selectedItems;

  const selectAll = useCallback(() => {
    const allIds = [
      ...state.schema.tables.map(t => t.id),
      ...state.schema.references.map(r => r.id),
      ...state.schema.annotations.map(a => a.id)
    ];
    selectItems(allIds);
  }, [state.schema, selectItems]);

  const selectMultiple = useCallback((ids: string[]) => {
    selectItems(ids);
  }, [selectItems]);

  const toggleSelection = useCallback((id: string) => {
    selectItem(id, true);
  }, [selectItem]);

  const selectInBounds = useCallback((bounds: { x: number; y: number; width: number; height: number }) => {
    const itemsInBounds: string[] = [];

    // Check tables
    state.schema.tables.forEach(table => {
      const tableRight = table.position.x + table.size.width;
      const tableBottom = table.position.y + table.size.height;
      const boundsRight = bounds.x + bounds.width;
      const boundsBottom = bounds.y + bounds.height;

      if (
        table.position.x < boundsRight &&
        tableRight > bounds.x &&
        table.position.y < boundsBottom &&
        tableBottom > bounds.y
      ) {
        itemsInBounds.push(table.id);
      }
    });

    // Check annotations
    state.schema.annotations.forEach(annotation => {
      const annotationRight = annotation.position.x + annotation.size.width;
      const annotationBottom = annotation.position.y + annotation.size.height;
      const boundsRight = bounds.x + bounds.width;
      const boundsBottom = bounds.y + bounds.height;

      if (
        annotation.position.x < boundsRight &&
        annotationRight > bounds.x &&
        annotation.position.y < boundsBottom &&
        annotationBottom > bounds.y
      ) {
        itemsInBounds.push(annotation.id);
      }
    });

    selectItems(itemsInBounds);
  }, [state.schema, selectItems]);

  const hasSelection = useMemo(() => selectedItems.length > 0, [selectedItems]);
  const selectionCount = useMemo(() => selectedItems.length, [selectedItems]);

  return {
    selectedItems,
    selectAll,
    selectMultiple,
    toggleSelection,
    selectInBounds,
    clearSelection,
    hasSelection,
    selectionCount,
    getSelectedTables,
    getSelectedReferences,
    getSelectedAnnotations
  };
};

// Hook for drag operations
export const useDragOperations = () => {
  const { state, setDragState } = useAppContext();
  const dragState = state.ui.dragState;

  const startDrag = useCallback((
    type: 'table' | 'annotation' | 'selection',
    startPosition: Position,
    draggedItems: string[]
  ) => {
    setDragState({
      isDragging: true,
      dragType: type,
      startPosition,
      currentPosition: startPosition,
      draggedItems
    });
  }, [setDragState]);

  const updateDrag = useCallback((currentPosition: Position) => {
    if (dragState) {
      setDragState({
        ...dragState,
        currentPosition
      });
    }
  }, [dragState, setDragState]);

  const endDrag = useCallback(() => {
    setDragState(null);
  }, [setDragState]);

  const isDragging = useMemo(() => dragState?.isDragging || false, [dragState]);
  const dragOffset = useMemo(() => {
    if (!dragState) return { x: 0, y: 0 };
    return {
      x: dragState.currentPosition.x - dragState.startPosition.x,
      y: dragState.currentPosition.y - dragState.startPosition.y
    };
  }, [dragState]);

  return {
    dragState,
    startDrag,
    updateDrag,
    endDrag,
    isDragging,
    dragOffset
  };
};

// Hook for undo/redo operations (placeholder for future implementation)
export const useUndoRedo = () => {
  // This would implement undo/redo functionality
  // For now, just return placeholder functions
  const undo = useCallback(() => {
    console.log('Undo operation - not yet implemented');
  }, []);

  const redo = useCallback(() => {
    console.log('Redo operation - not yet implemented');
  }, []);

  const canUndo = false;
  const canRedo = false;

  return {
    undo,
    redo,
    canUndo,
    canRedo
  };
};

// Hook for keyboard shortcuts
export const useKeyboardShortcuts = () => {
  const { clearSelection } = useSelectionOperations();
  const { selectAll } = useSelectionOperations();
  const { zoomIn, zoomOut, resetZoom, fitToScreen } = useViewportOperations();
  const { undo, redo } = useUndoRedo();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const { key, ctrlKey, metaKey, shiftKey } = event;
    const isModifierPressed = ctrlKey || metaKey;

    // Prevent default for handled shortcuts
    let preventDefault = false;

    if (isModifierPressed) {
      switch (key.toLowerCase()) {
        case 'a':
          selectAll();
          preventDefault = true;
          break;
        case 'z':
          if (shiftKey) {
            redo();
          } else {
            undo();
          }
          preventDefault = true;
          break;
        case 'y':
          redo();
          preventDefault = true;
          break;
        case '=':
        case '+':
          zoomIn();
          preventDefault = true;
          break;
        case '-':
          zoomOut();
          preventDefault = true;
          break;
        case '0':
          resetZoom();
          preventDefault = true;
          break;
        case 'f':
          fitToScreen();
          preventDefault = true;
          break;
      }
    } else {
      switch (key) {
        case 'Escape':
          clearSelection();
          preventDefault = true;
          break;
      }
    }

    if (preventDefault) {
      event.preventDefault();
    }
  }, [selectAll, undo, redo, zoomIn, zoomOut, resetZoom, fitToScreen, clearSelection]);

  return {
    handleKeyDown
  };
};