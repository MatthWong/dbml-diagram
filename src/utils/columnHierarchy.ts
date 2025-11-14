import { Column } from '../types/database';

export interface HierarchicalColumn extends Column {
  children: HierarchicalColumn[];
  isExpanded: boolean;
  nestingLevel: number;
  parentPath: string;
}

export interface ColumnHierarchyOptions {
  maxNestingLevel: number;
  showAllLevels: boolean;
}

/**
 * Parse column names with dots into hierarchical structure
 */
export function buildColumnHierarchy(
  columns: Column[],
  options: ColumnHierarchyOptions = { maxNestingLevel: 10, showAllLevels: true }
): HierarchicalColumn[] {
  const hierarchy: Map<string, HierarchicalColumn> = new Map();
  const rootColumns: HierarchicalColumn[] = [];

  const sortedColumns = [...columns].sort((a, b) => {
    const aDepth = (a.name.match(/\./g) || []).length;
    const bDepth = (b.name.match(/\./g) || []).length;
    if (aDepth !== bDepth) return aDepth - bDepth;
    return a.name.localeCompare(b.name);
  });

  for (const column of sortedColumns) {
    const parts = column.name.split('.');
    const nestingLevel = parts.length - 1;

    if (!options.showAllLevels && nestingLevel > options.maxNestingLevel) {
      continue;
    }

    const hierarchicalColumn: HierarchicalColumn = {
      ...column,
      children: [],
      isExpanded: true,
      nestingLevel,
      parentPath: parts.slice(0, -1).join('.')
    };

    if (nestingLevel === 0) {
      hierarchy.set(column.name, hierarchicalColumn);
      rootColumns.push(hierarchicalColumn);
    } else {
      let currentPath = '';
      let currentParent: HierarchicalColumn | null = null;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isLast = i === parts.length - 1;
        currentPath = currentPath ? `${currentPath}.${part}` : part;

        if (isLast) {
          hierarchy.set(currentPath, hierarchicalColumn);
          if (currentParent) {
            currentParent.children.push(hierarchicalColumn);
          } else {
            rootColumns.push(hierarchicalColumn);
          }
        } else {
          if (!hierarchy.has(currentPath)) {
            const parentColumn: HierarchicalColumn = {
              id: `virtual_${currentPath}`,
              name: currentPath,
              type: 'object',
              children: [],
              isExpanded: true,
              nestingLevel: i,
              parentPath: parts.slice(0, i).join('.'),
              isNested: true,
              isVirtual: true
            };
            hierarchy.set(currentPath, parentColumn);
            
            if (currentParent) {
              currentParent.children.push(parentColumn);
            } else {
              rootColumns.push(parentColumn);
            }
          }
          currentParent = hierarchy.get(currentPath)!;
        }
      }
    }
  }

  return rootColumns;
}

/**
 * Flatten hierarchical columns for display
 */
export function flattenHierarchy(
  hierarchicalColumns: HierarchicalColumn[],
  maxLevel: number = 10
): Column[] {
  const result: Column[] = [];

  function traverse(columns: HierarchicalColumn[], currentLevel: number = 0) {
    for (const column of columns) {
      if (currentLevel <= maxLevel) {
        result.push({
          ...column,
          nestingLevel: currentLevel,
          isNested: currentLevel > 0,
          isExpanded: column.isExpanded,
          isVirtual: column.type === 'object'
        });

        if (column.isExpanded && column.children.length > 0) {
          traverse(column.children, currentLevel + 1);
        }
      }
    }
  }

  traverse(hierarchicalColumns);
  return result;
}

/**
 * Toggle expansion state of a hierarchical column
 */
export function toggleColumnExpansion(
  hierarchicalColumns: HierarchicalColumn[],
  columnPath: string
): HierarchicalColumn[] {
  function traverse(columns: HierarchicalColumn[]): HierarchicalColumn[] {
    return columns.map(column => {
      if (column.name === columnPath) {
        return {
          ...column,
          isExpanded: !column.isExpanded
        };
      }
      if (column.children.length > 0) {
        return {
          ...column,
          children: traverse(column.children)
        };
      }
      return column;
    });
  }

  return traverse(hierarchicalColumns);
}

/**
 * Get display name for a column
 */
export function getColumnDisplayName(column: Column, showFullPath: boolean = false): string {
  if (showFullPath || !column.isNested) {
    return column.name;
  }

  const parts = column.name.split('.');
  return parts[parts.length - 1];
}

/**
 * Get indentation level for display
 */
export function getColumnIndentation(column: Column): number {
  return (column.nestingLevel || 0) * 20;
}
