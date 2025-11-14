import { Table } from '../types/database';

/**
 * Calculate the effective width of a table based on its columns
 * This matches the logic in TableNode.tsx
 */
export function calculateEffectiveTableWidth(table: Table): number {
  if (table.collapsed) return table.size.width;
  
  let maxWidth = 200; // Minimum table width
  
  // Estimate text width for each column
  table.columns.forEach(column => {
    // Get display name (last part of dotted name for nested columns)
    const parts = column.name.split('.');
    const displayName = parts[parts.length - 1];
    
    // Calculate indentation for nested columns
    const nestingLevel = parts.length - 1;
    const indentation = nestingLevel * 20;
    
    const iconWidth = 16; // Width of column icon
    const typeWidth = column.type ? column.type.length * 7 : 0; // Estimate type text width
    const nameWidth = displayName.length * 7.5; // Estimate name text width (monospace)
    const expandButtonWidth = 0; // Simplified - not checking for virtual objects here
    const margins = 16; // Left and right margins
    
    const totalWidth = indentation + expandButtonWidth + iconWidth + nameWidth + typeWidth + margins + 20;
    maxWidth = Math.max(maxWidth, totalWidth);
  });
  
  // Add extra width for table name
  const tableNameWidth = table.name.length * 8 + 40;
  maxWidth = Math.max(maxWidth, tableNameWidth);
  
  return Math.min(Math.max(table.size.width, maxWidth), 600); // Cap at 600px
}

/**
 * Calculate the effective height of a table based on its columns
 * This matches the logic in TableNode.tsx
 */
export function calculateEffectiveTableHeight(table: Table): number {
  const columnHeight = 24;
  const headerHeight = 40;
  const padding = 8;
  
  if (table.collapsed) {
    return headerHeight;
  }
  
  return headerHeight + (table.columns.length * columnHeight) + padding;
}

/**
 * Get effective size for a table
 */
export function getEffectiveTableSize(table: Table): { width: number; height: number } {
  return {
    width: calculateEffectiveTableWidth(table),
    height: calculateEffectiveTableHeight(table)
  };
}
