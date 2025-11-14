import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Table, Column } from '../types/database';
import { useTableOperations, useHierarchicalColumnOperations } from '../hooks/useStateManagement';
import { TABLE_COLOR_PRESETS } from '../constants/defaults';
import {
  buildColumnHierarchy,
  flattenHierarchy,
  getColumnDisplayName,
  getColumnIndentation,
  toggleColumnExpansion,
  HierarchicalColumn
} from '../utils/columnHierarchy';

interface TableNodeProps {
  table: Table;
  selected: boolean;
  theme: 'light' | 'dark' | 'custom';
  snapToGrid?: boolean;
  gridSize?: number;
  onContextMenu?: (tableId: string, position: { x: number; y: number }) => void;
  onColumnHover?: (columnId: string | null, columnData: { name: string; type: string; note: string } | null, position: { x: number; y: number } | null) => void;
}

export const TableNode: React.FC<TableNodeProps> = ({
  table,
  selected,
  theme,
  snapToGrid = false,
  gridSize = 20,
  onContextMenu,
  onColumnHover
}) => {
  const { 
    moveTable, 
    resizeTable, 
    changeTableColor, 
    toggleTableCollapse, 
    selectTable 
  } = useTableOperations();
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; zoom: number } | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const groupRef = useRef<SVGGElement>(null);

  // Calculate colors based on theme
  const backgroundColor = table.color || (theme === 'dark' ? '#2d2d2d' : '#ffffff');
  const borderColor = selected 
    ? '#2196f3' 
    : table.borderColor || (theme === 'dark' ? '#555' : '#ddd');
  const textColor = table.textColor || (theme === 'dark' ? '#ffffff' : '#000000');
  const headerBgColor = theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

  // Calculate column height and positions
  const columnHeight = 24;
  const headerHeight = 40;
  const padding = 8;

  // Get hierarchical column operations
  const { getCurrentNestingLevel, isHierarchicalViewEnabled } = useHierarchicalColumnOperations();
  
  // State for tracking expanded columns
  const [hierarchyState, setHierarchyState] = useState<HierarchicalColumn[]>([]);
  
  // Process columns into hierarchical structure
  const visibleColumns = useMemo(() => {
    if (table.collapsed) return [];
    
    const showHierarchical = table.showHierarchical !== false && isHierarchicalViewEnabled();
    const maxNestingLevel = table.maxNestingLevel ?? getCurrentNestingLevel() ?? 10;
    
    if (showHierarchical) {
      const hierarchy = buildColumnHierarchy(table.columns, {
        maxNestingLevel,
        showAllLevels: maxNestingLevel >= 10
      });
      
      // Update hierarchy state if changed
      if (hierarchyState.length === 0) {
        setHierarchyState(hierarchy);
      }
      
      return flattenHierarchy(hierarchyState.length > 0 ? hierarchyState : hierarchy, maxNestingLevel);
    }
    
    return table.columns;
  }, [table.collapsed, table.columns, table.showHierarchical, table.maxNestingLevel, getCurrentNestingLevel, isHierarchicalViewEnabled, hierarchyState]);
  
  const actualHeight = table.collapsed 
    ? headerHeight 
    : headerHeight + (visibleColumns.length * columnHeight) + padding;

  // Calculate minimum width needed to fit column names
  const calculateMinWidth = useMemo(() => {
    if (table.collapsed) return table.size.width;
    
    let maxWidth = 200; // Minimum table width
    
    // Estimate text width for each column
    visibleColumns.forEach(column => {
      const displayName = getColumnDisplayName(column);
      const indentation = getColumnIndentation(column);
      const iconWidth = 16; // Width of column icon
      const typeWidth = column.type ? column.type.length * 7 : 0; // Estimate type text width
      const nameWidth = displayName.length * 7.5; // Estimate name text width (monospace)
      const expandButtonWidth = column.isVirtual ? 15 : 0;
      const margins = 16; // Left and right margins
      
      const totalWidth = indentation + expandButtonWidth + iconWidth + nameWidth + typeWidth + margins + 20;
      maxWidth = Math.max(maxWidth, totalWidth);
    });
    
    // Add extra width for table name
    const tableNameWidth = table.name.length * 8 + 40;
    maxWidth = Math.max(maxWidth, tableNameWidth);
    
    return Math.min(maxWidth, 600); // Cap at 600px
  }, [table.collapsed, table.size.width, table.name, visibleColumns]);

  // Use calculated width if it's larger than the stored width
  const effectiveWidth = Math.max(table.size.width, calculateMinWidth);

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    selectTable(table.id, event.ctrlKey || event.metaKey);
  };

  const handleDoubleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    // Open table editor or toggle collapse
    toggleTableCollapse(table.id, !table.collapsed);
  };

  const handleColorChange = (color: string) => {
    changeTableColor(table.id, color);
    setShowColorPicker(false);
  };

  // Snap position to grid if enabled
  const snapToGridPosition = (x: number, y: number) => {
    if (!snapToGrid) return { x, y };
    return {
      x: Math.round(x / gridSize) * gridSize,
      y: Math.round(y / gridSize) * gridSize
    };
  };

  // Drag handlers
  const handleMouseDown = (event: React.MouseEvent) => {
    if (event.button !== 0) return; // Only left mouse button
    
    // Don't start drag if clicking on interactive elements
    const target = event.target as SVGElement;
    const tagName = target.tagName.toLowerCase();
    if (tagName === 'circle' || (tagName === 'text' && target.getAttribute('style')?.includes('cursor: pointer'))) {
      return;
    }
    
    event.stopPropagation();
    
    // Get the current viewport zoom from the SVG transform
    const svg = groupRef.current?.ownerSVGElement;
    const mainGroup = svg?.querySelector('g[transform]');
    const transform = mainGroup?.getAttribute('transform') || '';
    const scaleMatch = transform.match(/scale\(([\d.]+)\)/);
    const zoom = scaleMatch ? parseFloat(scaleMatch[1]) : 1;
    
    setIsDragging(true);
    setDragStart({ x: event.clientX, y: event.clientY, zoom });
    
    // Select the table if not already selected
    if (!selected) {
      selectTable(table.id, event.ctrlKey || event.metaKey);
    }
  };

  // Use effect to handle document-level mouse events during drag
  useEffect(() => {
    if (!isDragging || !dragStart) return;

    const handleMouseMove = (event: MouseEvent) => {
      event.preventDefault();
      
      const deltaX = event.clientX - dragStart.x;
      const deltaY = event.clientY - dragStart.y;
      
      // Apply zoom to delta
      const worldDeltaX = deltaX / dragStart.zoom;
      const worldDeltaY = deltaY / dragStart.zoom;
      
      const newPosition = snapToGridPosition(
        table.position.x + worldDeltaX,
        table.position.y + worldDeltaY
      );
      
      moveTable(table.id, newPosition);
      setDragStart({ x: event.clientX, y: event.clientY, zoom: dragStart.zoom });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDragStart(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, table.position, table.id, moveTable, snapToGrid, gridSize, snapToGridPosition]);

  // Context menu handler
  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (onContextMenu) {
      onContextMenu(table.id, { x: event.clientX, y: event.clientY });
    }
  };

  // Column icons based on constraints
  const getColumnIcon = (column: typeof table.columns[0]) => {
    if (column.primaryKey) return '🔑';
    if (column.foreignKey) return '🔗';
    if (column.unique) return '⭐';
    return '';
  };

  return (
    <g 
      ref={groupRef}
      className={`table-node ${selected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleMouseDown}
      onContextMenu={handleContextMenu}
      style={{ cursor: isDragging ? 'grabbing' : 'move' }}
    >
      {/* Table background */}
      <rect
        x={table.position.x}
        y={table.position.y}
        width={effectiveWidth}
        height={actualHeight}
        fill={backgroundColor}
        stroke={borderColor}
        strokeWidth={selected ? 2 : 1}
        strokeDasharray={selected ? '5,5' : 'none'}
        rx="8"
        ry="8"
        filter={theme === 'light' ? 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))' : 'none'}
      />

      {/* Table header */}
      <rect
        x={table.position.x}
        y={table.position.y}
        width={effectiveWidth}
        height={headerHeight}
        fill={headerBgColor}
        stroke="none"
        rx="8"
        ry="8"
      />

      {/* Header separator line */}
      <line
        x1={table.position.x}
        y1={table.position.y + headerHeight}
        x2={table.position.x + effectiveWidth}
        y2={table.position.y + headerHeight}
        stroke={borderColor}
        strokeWidth="1"
      />

      {/* Table name */}
      <text
        x={table.position.x + 12}
        y={table.position.y + headerHeight / 2}
        dominantBaseline="middle"
        fontSize="14"
        fontWeight="bold"
        fill={textColor}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {table.schema ? `${table.schema}.${table.name}` : table.name}
      </text>

      {/* Collapse/expand indicator */}
      <text
        x={table.position.x + effectiveWidth - 20}
        y={table.position.y + headerHeight / 2}
        dominantBaseline="middle"
        fontSize="12"
        fill={textColor}
        style={{ cursor: 'pointer', pointerEvents: 'all' }}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
        onClick={(e) => {
          e.stopPropagation();
          toggleTableCollapse(table.id, !table.collapsed);
        }}
      >
        {table.collapsed ? '▶' : '▼'}
      </text>

      {/* Color picker button */}
      <circle
        cx={table.position.x + effectiveWidth - 35}
        cy={table.position.y + headerHeight / 2}
        r="6"
        fill={table.color || backgroundColor}
        stroke={borderColor}
        strokeWidth="1"
        style={{ cursor: 'pointer', pointerEvents: 'all' }}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
        onClick={(e) => {
          e.stopPropagation();
          setShowColorPicker(!showColorPicker);
        }}
      />

      {/* Columns */}
      {!table.collapsed && visibleColumns.map((column, index) => {
        const columnY = table.position.y + headerHeight + (index * columnHeight);
        
        return (
          <g key={column.id} className="table-column">
            {/* Column background (for hover effects) */}
            <rect
              x={table.position.x}
              y={columnY}
              width={effectiveWidth}
              height={columnHeight}
              fill="transparent"
              className="column-hover"
              style={{ cursor: column.note ? 'help' : 'default' }}
              onMouseEnter={(e) => {
                if (column.note && onColumnHover) {
                  setHoveredColumn(column.id);
                  const rect = (e.target as SVGRectElement).getBoundingClientRect();
                  setTooltipPosition({ x: rect.right + 10, y: rect.top });
                  onColumnHover(column.id, {
                    name: column.name,
                    type: column.type,
                    note: column.note
                  }, { x: rect.right + 10, y: rect.top });
                }
              }}
              onMouseLeave={() => {
                setHoveredColumn(null);
                if (onColumnHover) {
                  onColumnHover(null, null, null);
                }
              }}
            />

            {/* Column separator line */}
            {index < visibleColumns.length - 1 && (
              <line
                x1={table.position.x + 8}
                y1={columnY + columnHeight}
                x2={table.position.x + effectiveWidth - 8}
                y2={columnY + columnHeight}
                stroke={theme === 'dark' ? '#444' : '#eee'}
                strokeWidth="1"
              />
            )}

            {/* Hierarchical indentation line */}
            {column.isNested && (
              <line
                x1={table.position.x + 8 + getColumnIndentation(column) - 10}
                y1={columnY + 2}
                x2={table.position.x + 8 + getColumnIndentation(column) - 10}
                y2={columnY + columnHeight - 2}
                stroke={theme === 'dark' ? '#555' : '#ddd'}
                strokeWidth="1"
              />
            )}
            
            {/* Expand/collapse button for object types */}
            {column.isVirtual && (
              <text
                x={table.position.x + 8 + getColumnIndentation(column)}
                y={columnY + columnHeight / 2}
                dominantBaseline="middle"
                fontSize="10"
                fill={textColor}
                style={{ cursor: 'pointer', pointerEvents: 'all' }}
                onClick={(e) => {
                  e.stopPropagation();
                  const newHierarchy = toggleColumnExpansion(hierarchyState, column.name);
                  setHierarchyState(newHierarchy);
                }}
              >
                {column.isExpanded ? '▼' : '▶'}
              </text>
            )}

            {/* Column icon */}
            <text
              x={table.position.x + 8 + getColumnIndentation(column) + (column.isVirtual ? 15 : 0)}
              y={columnY + columnHeight / 2}
              dominantBaseline="middle"
              fontSize="12"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {getColumnIcon(column)}
            </text>

            {/* Column name */}
            <text
              x={table.position.x + 8 + getColumnIndentation(column) + (column.isVirtual ? 15 : 0) + (getColumnIcon(column) ? 16 : 0)}
              y={columnY + columnHeight / 2}
              dominantBaseline="middle"
              fontSize="12"
              fontWeight={column.primaryKey || column.isVirtual ? 'bold' : 'normal'}
              fill={textColor}
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {getColumnDisplayName(column)}
            </text>

            {/* Column type */}
            {!column.isVirtual && (
              <text
                x={table.position.x + effectiveWidth - 8}
                y={columnY + columnHeight / 2}
                dominantBaseline="middle"
                textAnchor="end"
                fontSize="10"
                fill={theme === 'dark' ? '#aaa' : '#666'}
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {column.type}
              </text>
            )}

            {/* Constraint indicators */}
            {(column.notNull || column.unique) && (
              <text
                x={table.position.x + effectiveWidth - 40}
                y={columnY + columnHeight / 2}
                dominantBaseline="middle"
                textAnchor="end"
                fontSize="8"
                fill={theme === 'dark' ? '#888' : '#999'}
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {column.notNull ? 'NN' : ''}{column.notNull && column.unique ? ',' : ''}{column.unique ? 'UQ' : ''}
              </text>
            )}
          </g>
        );
      })}

      {/* Table note */}
      {table.note && !table.collapsed && (
        <text
          x={table.position.x + 8}
          y={table.position.y + actualHeight - 8}
          fontSize="10"
          fontStyle="italic"
          fill={theme === 'dark' ? '#888' : '#666'}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {table.note.length > 30 ? `${table.note.substring(0, 30)}...` : table.note}
        </text>
      )}

      {/* Resize handles when selected */}
      {selected && (
        <g className="resize-handles">
          {/* Corner handles */}
          <rect
            x={table.position.x - 3}
            y={table.position.y - 3}
            width="6"
            height="6"
            fill="#2196f3"
            stroke="#fff"
            strokeWidth="1"
            style={{ cursor: 'nw-resize' }}
          />
          
          <rect
            x={table.position.x + effectiveWidth - 3}
            y={table.position.y - 3}
            width="6"
            height="6"
            fill="#2196f3"
            stroke="#fff"
            strokeWidth="1"
            style={{ cursor: 'ne-resize' }}
          />
          
          <rect
            x={table.position.x - 3}
            y={table.position.y + actualHeight - 3}
            width="6"
            height="6"
            fill="#2196f3"
            stroke="#fff"
            strokeWidth="1"
            style={{ cursor: 'sw-resize' }}
          />
          
          <rect
            x={table.position.x + effectiveWidth - 3}
            y={table.position.y + actualHeight - 3}
            width="6"
            height="6"
            fill="#2196f3"
            stroke="#fff"
            strokeWidth="1"
            style={{ cursor: 'se-resize' }}
          />

          {/* Edge handles */}
          <rect
            x={table.position.x + effectiveWidth / 2 - 3}
            y={table.position.y - 3}
            width="6"
            height="6"
            fill="#2196f3"
            stroke="#fff"
            strokeWidth="1"
            style={{ cursor: 'ns-resize' }}
          />
          
          <rect
            x={table.position.x + effectiveWidth / 2 - 3}
            y={table.position.y + actualHeight - 3}
            width="6"
            height="6"
            fill="#2196f3"
            stroke="#fff"
            strokeWidth="1"
            style={{ cursor: 'ns-resize' }}
          />
          
          <rect
            x={table.position.x - 3}
            y={table.position.y + actualHeight / 2 - 3}
            width="6"
            height="6"
            fill="#2196f3"
            stroke="#fff"
            strokeWidth="1"
            style={{ cursor: 'ew-resize' }}
          />
          
          <rect
            x={table.position.x + effectiveWidth - 3}
            y={table.position.y + actualHeight / 2 - 3}
            width="6"
            height="6"
            fill="#2196f3"
            stroke="#fff"
            strokeWidth="1"
            style={{ cursor: 'ew-resize' }}
          />
        </g>
      )}

      {/* Color picker popup */}
      {showColorPicker && (
        <g className="color-picker">
          <rect
            x={table.position.x + effectiveWidth - 120}
            y={table.position.y + headerHeight + 5}
            width="110"
            height="60"
            fill={theme === 'dark' ? '#333' : '#fff'}
            stroke={borderColor}
            strokeWidth="1"
            rx="4"
            ry="4"
            filter="drop-shadow(0 2px 8px rgba(0,0,0,0.2))"
          />
          
          {TABLE_COLOR_PRESETS.map((color, index) => (
            <circle
              key={color}
              cx={table.position.x + effectiveWidth - 105 + (index % 5) * 20}
              cy={table.position.y + headerHeight + 20 + Math.floor(index / 5) * 20}
              r="8"
              fill={color}
              stroke={theme === 'dark' ? '#555' : '#ccc'}
              strokeWidth="1"
              style={{ cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation();
                handleColorChange(color);
              }}
            />
          ))}
        </g>
      )}

    </g>
  );
};