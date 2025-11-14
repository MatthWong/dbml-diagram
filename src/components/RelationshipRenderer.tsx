import React, { useMemo } from 'react';
import { Reference, Table } from '../types/database';
import { useReferenceOperations } from '../hooks/useStateManagement';

interface RelationshipRendererProps {
  reference: Reference;
  tables: Table[];
  selected: boolean;
  theme: 'light' | 'dark' | 'custom';
}

export const RelationshipRenderer: React.FC<RelationshipRendererProps> = ({
  reference,
  tables,
  selected,
  theme
}) => {
  const { selectReference, changeReferenceStyle } = useReferenceOperations();

  // Find the connected tables
  const fromTable = tables.find(t => t.name === reference.fromTable);
  const toTable = tables.find(t => t.name === reference.toTable);

  // Calculate connection points
  const connectionPoints = useMemo(() => {
    if (!fromTable || !toTable) return null;

    // Find the specific columns
    const fromColumn = fromTable.columns.find(c => c.name === reference.fromColumn);
    const toColumn = toTable.columns.find(c => c.name === reference.toColumn);

    if (!fromColumn || !toColumn) return null;

    const columnHeight = 24; // Height of each column row
    const headerHeight = 40; // Height of table header

    // If table is collapsed, connect to the center of the header
    // Otherwise, connect to the specific column
    let fromTableCenter, toTableCenter;

    if (fromTable.collapsed) {
      // Connect to header center when collapsed
      fromTableCenter = {
        x: fromTable.position.x + fromTable.size.width / 2,
        y: fromTable.position.y + headerHeight / 2
      };
    } else {
      // Connect to specific column when expanded
      const fromColumnIndex = fromTable.columns.indexOf(fromColumn);
      fromTableCenter = {
        x: fromTable.position.x + fromTable.size.width / 2,
        y: fromTable.position.y + headerHeight + (fromColumnIndex + 0.5) * columnHeight
      };
    }

    if (toTable.collapsed) {
      // Connect to header center when collapsed
      toTableCenter = {
        x: toTable.position.x + toTable.size.width / 2,
        y: toTable.position.y + headerHeight / 2
      };
    } else {
      // Connect to specific column when expanded
      const toColumnIndex = toTable.columns.indexOf(toColumn);
      toTableCenter = {
        x: toTable.position.x + toTable.size.width / 2,
        y: toTable.position.y + headerHeight + (toColumnIndex + 0.5) * columnHeight
      };
    }

    // Determine which edges to connect based on table positions
    let fromPoint, toPoint;

    if (fromTableCenter.x < toTableCenter.x) {
      // From table is to the left of to table
      fromPoint = {
        x: fromTable.position.x + fromTable.size.width,
        y: fromTableCenter.y
      };
      toPoint = {
        x: toTable.position.x,
        y: toTableCenter.y
      };
    } else {
      // From table is to the right of to table
      fromPoint = {
        x: fromTable.position.x,
        y: fromTableCenter.y
      };
      toPoint = {
        x: toTable.position.x + toTable.size.width,
        y: toTableCenter.y
      };
    }

    return { fromPoint, toPoint };
  }, [fromTable, toTable, reference.fromColumn, reference.toColumn]);

  if (!connectionPoints) return null;

  const { fromPoint, toPoint } = connectionPoints;

  // Calculate path with smart routing
  const path = useMemo(() => {
    const dx = toPoint.x - fromPoint.x;
    const dy = toPoint.y - fromPoint.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Simple straight line for now, can be enhanced with smart routing
    if (Math.abs(dx) > Math.abs(dy) * 2) {
      // Horizontal connection with slight curve
      const midX = fromPoint.x + dx / 2;
      return `M ${fromPoint.x} ${fromPoint.y} 
              C ${midX} ${fromPoint.y}, ${midX} ${toPoint.y}, ${toPoint.x} ${toPoint.y}`;
    } else {
      // More complex routing for vertical or diagonal connections
      const offsetX = Math.min(50, Math.abs(dx) / 4);
      const controlX1 = fromPoint.x + (dx > 0 ? offsetX : -offsetX);
      const controlX2 = toPoint.x - (dx > 0 ? offsetX : -offsetX);
      
      return `M ${fromPoint.x} ${fromPoint.y} 
              C ${controlX1} ${fromPoint.y}, ${controlX2} ${toPoint.y}, ${toPoint.x} ${toPoint.y}`;
    }
  }, [fromPoint, toPoint]);

  // Determine stroke style based on relationship type
  const strokeDasharray = useMemo(() => {
    if (reference.style === 'dashed') return '8,4';
    if (reference.style === 'dotted') return '2,2';
    return 'none';
  }, [reference.style]);

  // Determine marker based on relationship type
  const markerEnd = useMemo(() => {
    const markerType = selected ? 'arrowhead-selected' : 'arrowhead';
    
    switch (reference.type) {
      case 'one-to-one':
        return `url(#${markerType})`;
      case 'one-to-many':
        return `url(#${markerType})`;
      case 'many-to-one':
        return `url(#${markerType})`;
      case 'many-to-many':
        return `url(#${markerType})`;
      default:
        return `url(#${markerType})`;
    }
  }, [reference.type, selected]);

  const strokeColor = selected 
    ? '#2196f3' 
    : reference.color || (theme === 'dark' ? '#888' : '#666');

  const strokeWidth = reference.thickness || 2;

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    selectReference(reference.id, event.ctrlKey || event.metaKey);
  };

  const handleDoubleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    // Open relationship editor
    console.log('Edit relationship:', reference.id);
  };

  return (
    <g 
      className={`relationship ${selected ? 'selected' : ''}`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      style={{ cursor: 'pointer' }}
    >
      {/* Main relationship line */}
      <path
        d={path}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        markerEnd={markerEnd}
        opacity={selected ? 1 : 0.8}
      />

      {/* Invisible wider path for easier clicking */}
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={Math.max(strokeWidth * 3, 10)}
        style={{ cursor: 'pointer' }}
      />

      {/* Relationship label */}
      {reference.name && (
        <text
          x={(fromPoint.x + toPoint.x) / 2}
          y={(fromPoint.y + toPoint.y) / 2 - 5}
          textAnchor="middle"
          fontSize="12"
          fill={theme === 'dark' ? '#ccc' : '#555'}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {reference.name}
        </text>
      )}

      {/* Constraint labels */}
      {(reference.onDelete || reference.onUpdate) && (
        <text
          x={(fromPoint.x + toPoint.x) / 2}
          y={(fromPoint.y + toPoint.y) / 2 + 15}
          textAnchor="middle"
          fontSize="10"
          fill={theme === 'dark' ? '#999' : '#777'}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {reference.onDelete && `ON DELETE ${reference.onDelete.toUpperCase()}`}
          {reference.onDelete && reference.onUpdate && ' | '}
          {reference.onUpdate && `ON UPDATE ${reference.onUpdate.toUpperCase()}`}
        </text>
      )}

      {/* Selection indicator */}
      {selected && (
        <circle
          cx={(fromPoint.x + toPoint.x) / 2}
          cy={(fromPoint.y + toPoint.y) / 2}
          r="4"
          fill="#2196f3"
          stroke="#fff"
          strokeWidth="2"
        />
      )}
    </g>
  );
};