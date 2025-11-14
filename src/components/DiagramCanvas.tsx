import React, { useRef, useCallback, useState, useMemo } from 'react';
import { TableNode } from './TableNode';
import { RelationshipRenderer } from './RelationshipRenderer';
import { GridSystem } from './GridSystem';
import { SelectionManager } from './SelectionManager';
import { AnnotationLayer } from './AnnotationLayer';
import { ContextMenu, ContextMenuOption } from './ContextMenu';
import { RelationshipDialog, RelationshipConfig } from './RelationshipDialog';
import { useAppContext } from '../context/AppContext';
import { useViewportOperations, useSelectionOperations } from '../hooks/useStateManagement';
import { Position } from '../types/utils';
import { DBMLReferenceGenerator } from '../utils/dbmlGenerator';
import { calculateCanvasBounds } from '../utils/canvasBounds';

interface DiagramCanvasProps {
  className?: string;
  onDBMLUpdate?: (newContent: string) => void;
  dbmlContent?: string;
}

export const DiagramCanvas: React.FC<DiagramCanvasProps> = ({
  className = '',
  onDBMLUpdate,
  dbmlContent = ''
}) => {
  const { state } = useAppContext();
  const { viewport, panBy, setViewport } = useViewportOperations();
  const { selectInBounds, clearSelection } = useSelectionOperations();
  // const { startDrag, updateDrag, endDrag, isDragging } = useDragOperations();
  
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate canvas bounds to fit all tables and annotations
  const canvasBounds = useMemo(() => {
    return calculateCanvasBounds(
      state.schema.tables,
      state.schema.annotations,
      200 // padding - increased to ensure full scrollability
    );
  }, [state.schema.tables, state.schema.annotations]);

  const width = canvasBounds.width;
  const height = canvasBounds.height;
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Position>({ x: 0, y: 0 });
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<Position>({ x: 0, y: 0 });
  const [selectionEnd, setSelectionEnd] = useState<Position>({ x: 0, y: 0 });
  const [isDraggingScroll, setIsDraggingScroll] = useState(false);
  const [scrollStart, setScrollStart] = useState<Position>({ x: 0, y: 0 });
  
  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    position: { x: number; y: number };
    tableId: string | null;
  }>({ visible: false, position: { x: 0, y: 0 }, tableId: null });
  
  // Relationship dialog state
  const [relationshipDialog, setRelationshipDialog] = useState<{
    isOpen: boolean;
    sourceTableId: string | null;
  }>({ isOpen: false, sourceTableId: null });

  // Column tooltip state
  const [columnTooltip, setColumnTooltip] = useState<{
    visible: boolean;
    columnData: { name: string; type: string; note: string } | null;
    position: { x: number; y: number } | null;
  }>({ visible: false, columnData: null, position: null });

  // Handle mouse events for panning and selection
  const handleMouseDown = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
    // Don't interfere with table dragging
    const target = event.target as SVGElement;
    if (target.closest('.table-node')) {
      return;
    }

    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clientX = event.clientX - rect.left;
    const clientY = event.clientY - rect.top;
    
    // Convert to world coordinates
    const worldX = (clientX - viewport.pan.x) / viewport.zoom;
    const worldY = (clientY - viewport.pan.y) / viewport.zoom;

    if (event.button === 1 || (event.button === 0 && event.altKey)) {
      // Middle mouse or Alt+Left mouse for panning
      setIsPanning(true);
      setPanStart({ x: clientX, y: clientY });
      event.preventDefault();
    } else if (event.button === 0 && state.ui.activeTools.selectedTool === 'select') {
      // Check if clicking on background (not on any table, annotation, or relationship)
      const isOnTable = target.closest('.table-node');
      const isOnAnnotation = target.closest('.annotation');
      const isOnRelationship = target.closest('.relationships-layer');
      
      if (!isOnTable && !isOnAnnotation && !isOnRelationship && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
        // Left mouse on background for drag scrolling
        const container = containerRef.current?.parentElement;
        if (container) {
          setIsDraggingScroll(true);
          setScrollStart({ 
            x: event.clientX + container.scrollLeft, 
            y: event.clientY + container.scrollTop 
          });
          event.preventDefault();
          return;
        }
      }
      
      // Left mouse for selection (when Ctrl/Cmd/Shift is pressed or clicking on elements)
      if (!event.ctrlKey && !event.metaKey) {
        clearSelection();
      }
      setIsSelecting(true);
      setSelectionStart({ x: worldX, y: worldY });
      setSelectionEnd({ x: worldX, y: worldY });
    }
  }, [viewport, state.ui.activeTools.selectedTool, clearSelection]);

  const handleMouseMove = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clientX = event.clientX - rect.left;
    const clientY = event.clientY - rect.top;
    
    if (isDraggingScroll) {
      // Drag to scroll
      const container = containerRef.current?.parentElement;
      if (container) {
        const scrollLeft = scrollStart.x - event.clientX;
        const scrollTop = scrollStart.y - event.clientY;
        container.scrollLeft = scrollLeft;
        container.scrollTop = scrollTop;
      }
    } else if (isPanning) {
      const deltaX = clientX - panStart.x;
      const deltaY = clientY - panStart.y;
      panBy(deltaX, deltaY);
      setPanStart({ x: clientX, y: clientY });
    } else if (isSelecting) {
      const worldX = (clientX - viewport.pan.x) / viewport.zoom;
      const worldY = (clientY - viewport.pan.y) / viewport.zoom;
      setSelectionEnd({ x: worldX, y: worldY });
    }
  }, [isDraggingScroll, scrollStart, isPanning, isSelecting, panStart, viewport, panBy]);

  const handleMouseUp = useCallback((_event: React.MouseEvent<SVGSVGElement>) => {
    if (isDraggingScroll) {
      setIsDraggingScroll(false);
    } else if (isPanning) {
      setIsPanning(false);
    } else if (isSelecting) {
      // Perform selection
      const minX = Math.min(selectionStart.x, selectionEnd.x);
      const minY = Math.min(selectionStart.y, selectionEnd.y);
      const maxX = Math.max(selectionStart.x, selectionEnd.x);
      const maxY = Math.max(selectionStart.y, selectionEnd.y);
      
      if (Math.abs(maxX - minX) > 5 || Math.abs(maxY - minY) > 5) {
        selectInBounds({
          x: minX,
          y: minY,
          width: maxX - minX,
          height: maxY - minY
        });
      }
      
      setIsSelecting(false);
    }
  }, [isDraggingScroll, isPanning, isSelecting, selectionStart, selectionEnd, selectInBounds]);

  // Handle wheel events for zooming
  const handleWheel = useCallback((event: React.WheelEvent<SVGSVGElement>) => {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;

      const clientX = event.clientX - rect.left;
      const clientY = event.clientY - rect.top;
      
      // Calculate zoom
      const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.max(0.1, Math.min(5, viewport.zoom * zoomFactor));
      
      // Calculate new pan to zoom towards mouse position
      const worldX = (clientX - viewport.pan.x) / viewport.zoom;
      const worldY = (clientY - viewport.pan.y) / viewport.zoom;
      
      const newPanX = clientX - worldX * newZoom;
      const newPanY = clientY - worldY * newZoom;
      
      setViewport({
        ...viewport,
        zoom: newZoom,
        pan: { x: newPanX, y: newPanY }
      });
    }
  }, [viewport, setViewport]);

  // Handle table context menu
  const handleTableContextMenu = useCallback((tableId: string, position: { x: number; y: number }) => {
    setContextMenu({
      visible: true,
      position,
      tableId
    });
  }, []);

  // Handle column hover for tooltip
  const handleColumnHover = useCallback((
    columnId: string | null,
    columnData: { name: string; type: string; note: string } | null,
    position: { x: number; y: number } | null
  ) => {
    setColumnTooltip({
      visible: columnId !== null && columnData !== null,
      columnData,
      position
    });
  }, []);

  // Context menu options
  const contextMenuOptions: ContextMenuOption[] = [
    {
      id: 'create-relationship',
      label: 'Create Relationship',
      icon: '🔗',
      action: () => {
        if (contextMenu.tableId) {
          setRelationshipDialog({
            isOpen: true,
            sourceTableId: contextMenu.tableId
          });
        }
      }
    }
  ];

  // Handle relationship creation
  const handleRelationshipConfirm = useCallback(async (config: RelationshipConfig) => {
    try {
      const sourceTable = state.schema.tables.find(t => t.id === config.sourceTableId);
      const destTable = state.schema.tables.find(t => t.id === config.destinationTableId);
      
      if (!sourceTable || !destTable) {
        throw new Error('Table not found');
      }

      // Validate the relationship
      const validation = DBMLReferenceGenerator.validateReference(
        config,
        sourceTable,
        destTable,
        state.schema.references
      );

      if (!validation.valid) {
        alert(validation.message);
        return;
      }

      // Show warning if there is one
      if (validation.message) {
        const proceed = window.confirm(`${validation.message}\n\nDo you want to proceed?`);
        if (!proceed) return;
      }

      // Generate DBML reference
      const reference = DBMLReferenceGenerator.generateReference(config, sourceTable, destTable);
      
      // Update DBML content
      if (onDBMLUpdate && dbmlContent) {
        const newContent = DBMLReferenceGenerator.insertReference(dbmlContent, reference);
        onDBMLUpdate(newContent);
      }
      
      // Close dialog
      setRelationshipDialog({ isOpen: false, sourceTableId: null });
    } catch (error) {
      console.error('Failed to create relationship:', error);
      alert(`Failed to create relationship: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [state.schema.tables, state.schema.references, onDBMLUpdate, dbmlContent]);

  // Handle context menu (canvas level)
  const handleContextMenu = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
    event.preventDefault();
    // Only handle if not on a table (tables handle their own context menu)
  }, []);

  // Calculate transform for the main group
  const transform = `translate(${viewport.pan.x}, ${viewport.pan.y}) scale(${viewport.zoom})`;

  // Calculate selection rectangle
  const selectionRect = isSelecting ? {
    x: Math.min(selectionStart.x, selectionEnd.x),
    y: Math.min(selectionStart.y, selectionEnd.y),
    width: Math.abs(selectionEnd.x - selectionStart.x),
    height: Math.abs(selectionEnd.y - selectionStart.y)
  } : null;

  return (
    <div
      ref={containerRef}
      className={`diagram-canvas ${className}`}
      style={{
        position: 'relative',
        display: 'inline-block',
        minWidth: '100%',
        minHeight: '100%',
        width: width,
        height: height,
        backgroundColor: state.schema.settings.theme === 'dark' ? '#1e1e1e' : '#f5f5f5',
        cursor: isDraggingScroll ? 'grabbing' : isPanning ? 'grabbing' : isSelecting ? 'crosshair' : 'grab'
      }}
    >
      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ display: 'block' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={handleContextMenu}
      >
        {/* Definitions for patterns, gradients, etc. */}
        <defs>
          <pattern
            id="grid"
            width={state.schema.settings.gridSize}
            height={state.schema.settings.gridSize}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${state.schema.settings.gridSize} 0 L 0 0 0 ${state.schema.settings.gridSize}`}
              fill="none"
              stroke={state.schema.settings.theme === 'dark' ? '#333' : '#ddd'}
              strokeWidth="1"
            />
          </pattern>
          
          {/* Arrow markers for relationships */}
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="#666"
            />
          </marker>
          
          <marker
            id="arrowhead-selected"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="#2196f3"
            />
          </marker>
        </defs>

        {/* Main content group with transform */}
        <g transform={transform}>
          {/* Grid - extends to entire canvas */}
          {state.schema.settings.gridEnabled && (
            <GridSystem
              gridSize={state.schema.settings.gridSize}
              theme={state.schema.settings.theme}
              width={width}
              height={height}
            />
          )}

          {/* Relationships layer */}
          <g className="relationships-layer">
            {state.schema.references.map(reference => (
              <RelationshipRenderer
                key={reference.id}
                reference={reference}
                tables={state.schema.tables}
                selected={state.ui.selectedItems.includes(reference.id)}
                theme={state.schema.settings.theme}
              />
            ))}
          </g>

          {/* Annotations layer */}
          <AnnotationLayer
            annotations={state.schema.annotations}
            selectedItems={state.ui.selectedItems}
            theme={state.schema.settings.theme}
          />

          {/* Tables layer */}
          <g className="tables-layer">
            {state.schema.tables.map(table => (
              <TableNode
                key={table.id}
                table={table}
                selected={state.ui.selectedItems.includes(table.id)}
                theme={state.schema.settings.theme}
                snapToGrid={state.schema.settings.snapToGrid}
                gridSize={state.schema.settings.gridSize}
                onContextMenu={handleTableContextMenu}
                onColumnHover={handleColumnHover}
              />
            ))}
          </g>

          {/* Selection rectangle */}
          {selectionRect && (
            <rect
              x={selectionRect.x}
              y={selectionRect.y}
              width={selectionRect.width}
              height={selectionRect.height}
              fill="rgba(33, 150, 243, 0.1)"
              stroke="#2196f3"
              strokeWidth="1"
              strokeDasharray="5,5"
            />
          )}
        </g>

        {/* UI overlay (not affected by zoom/pan) */}
        <g className="ui-overlay">
          {/* Zoom controls, minimap, etc. would go here */}
        </g>
      </svg>

      {/* Selection manager for advanced selection operations */}
      <SelectionManager
        selectedItems={state.ui.selectedItems}
        viewport={viewport}
        onSelectionChange={selectInBounds}
      />

      {/* Context Menu */}
      <ContextMenu
        visible={contextMenu.visible}
        position={contextMenu.position}
        options={contextMenuOptions}
        onClose={() => setContextMenu({ visible: false, position: { x: 0, y: 0 }, tableId: null })}
      />

      {/* Relationship Dialog */}
      {relationshipDialog.isOpen && relationshipDialog.sourceTableId && (
        <RelationshipDialog
          isOpen={relationshipDialog.isOpen}
          sourceTable={state.schema.tables.find(t => t.id === relationshipDialog.sourceTableId)!}
          allTables={state.schema.tables}
          onConfirm={handleRelationshipConfirm}
          onCancel={() => setRelationshipDialog({ isOpen: false, sourceTableId: null })}
        />
      )}

      {/* Column Tooltip Overlay */}
      {columnTooltip.visible && columnTooltip.columnData && columnTooltip.position && (
        <div
          style={{
            position: 'fixed',
            left: `${columnTooltip.position.x}px`,
            top: `${columnTooltip.position.y}px`,
            zIndex: 10001,
            pointerEvents: 'none',
            maxWidth: '800px',
            maxHeight: '80vh'
          }}
        >
          <div
            style={{
              backgroundColor: state.schema.settings.theme === 'dark' ? 'rgba(45, 45, 45, 0.98)' : 'rgba(255, 255, 255, 0.98)',
              color: state.schema.settings.theme === 'dark' ? '#e0e0e0' : '#333',
              padding: '16px 20px',
              borderRadius: '8px',
              fontSize: '14px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              border: `2px solid ${state.schema.settings.theme === 'dark' ? '#555' : '#ddd'}`,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              lineHeight: '1.6',
              overflowY: 'auto',
              overflowX: 'hidden',
              maxHeight: '80vh'
            }}
          >
            <div style={{ 
              fontWeight: 'bold', 
              marginBottom: '12px', 
              fontSize: '15px',
              color: state.schema.settings.theme === 'dark' ? '#2196f3' : '#1976d2',
              borderBottom: `1px solid ${state.schema.settings.theme === 'dark' ? '#555' : '#ddd'}`,
              paddingBottom: '8px'
            }}>
              {columnTooltip.columnData.name} ({columnTooltip.columnData.type})
            </div>
            <div style={{ fontSize: '13px', opacity: 0.95 }}>
              {columnTooltip.columnData.note}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};