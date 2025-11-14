import { Table, Annotation } from '../types/database';

export interface CanvasBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

/**
 * Calculate the bounding box that contains all tables and annotations
 */
export function calculateCanvasBounds(
  tables: Table[],
  annotations: Annotation[] = [],
  padding: number = 100
): CanvasBounds {
  if (tables.length === 0 && annotations.length === 0) {
    // Default canvas size when empty
    return {
      minX: 0,
      minY: 0,
      maxX: 2000,
      maxY: 1500,
      width: 2000,
      height: 1500
    };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  // Calculate bounds from tables
  for (const table of tables) {
    const tableMinX = table.position.x;
    const tableMinY = table.position.y;
    const tableMaxX = table.position.x + table.size.width;
    
    // Calculate actual rendered height based on columns
    // These constants match TableNode.tsx
    const columnHeight = 24;
    const headerHeight = 40;
    const tablePadding = 8;
    
    // Use actual column count for accurate height calculation
    // Note: This uses all columns, not just visible ones in hierarchical mode
    // This ensures we always have enough space even if columns are expanded
    const columnCount = table.collapsed ? 0 : table.columns.length;
    const actualHeight = table.collapsed 
      ? headerHeight 
      : headerHeight + (columnCount * columnHeight) + tablePadding;
    
    // Add extra padding for tables with many columns to ensure full visibility
    // More padding for tables with lots of columns
    const extraPadding = columnCount > 50 ? 100 : columnCount > 20 ? 50 : 0;
    const tableMaxY = table.position.y + actualHeight + extraPadding;

    minX = Math.min(minX, tableMinX);
    minY = Math.min(minY, tableMinY);
    maxX = Math.max(maxX, tableMaxX);
    maxY = Math.max(maxY, tableMaxY);
  }

  // Calculate bounds from annotations
  for (const annotation of annotations) {
    const annMinX = annotation.position.x;
    const annMinY = annotation.position.y;
    const annMaxX = annotation.position.x + annotation.size.width;
    const annMaxY = annotation.position.y + annotation.size.height;

    minX = Math.min(minX, annMinX);
    minY = Math.min(minY, annMinY);
    maxX = Math.max(maxX, annMaxX);
    maxY = Math.max(maxY, annMaxY);
  }

  // Add padding
  minX -= padding;
  minY -= padding;
  maxX += padding;
  maxY += padding;

  // Ensure canvas starts at 0,0 or includes negative coordinates
  const startX = Math.min(minX, 0);
  const startY = Math.min(minY, 0);
  
  // Calculate width and height from the start point
  const width = Math.max(maxX - startX, 1000);
  const height = Math.max(maxY - startY, 800);

  return {
    minX: startX,
    minY: startY,
    maxX,
    maxY,
    width,
    height
  };
}

/**
 * Get the center point of the canvas bounds
 */
export function getCanvasCenter(bounds: CanvasBounds): { x: number; y: number } {
  return {
    x: bounds.minX + bounds.width / 2,
    y: bounds.minY + bounds.height / 2
  };
}

/**
 * Calculate zoom level to fit all content in viewport
 */
export function calculateFitZoom(
  bounds: CanvasBounds,
  viewportWidth: number,
  viewportHeight: number,
  padding: number = 50
): number {
  const availableWidth = viewportWidth - padding * 2;
  const availableHeight = viewportHeight - padding * 2;

  const zoomX = availableWidth / bounds.width;
  const zoomY = availableHeight / bounds.height;

  // Use the smaller zoom to ensure everything fits
  return Math.min(zoomX, zoomY, 1); // Cap at 1x to avoid zooming in
}
