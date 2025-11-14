# Design Document - Nested Column Hierarchy

## Overview

The Nested Column Hierarchy feature transforms flat column names with dot notation into an interactive, collapsible tree structure. This design leverages a hierarchical data model, efficient rendering techniques, and intuitive UI controls to provide a superior viewing experience for complex database schemas.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    DBML Parser                          │
│  (Parses flat columns into Column objects)             │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│              Column Hierarchy Builder                    │
│  (Transforms flat columns into tree structure)          │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│              Hierarchy State Manager                     │
│  (Manages expansion states and nesting level)           │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│            TableNode Renderer (Enhanced)                 │
│  (Renders hierarchical columns with expand/collapse)    │
└─────────────────────────────────────────────────────────┘
```

## Data Models

### Column Hierarchy Node

```typescript
interface ColumnHierarchyNode {
  id: string;                    // Unique identifier
  name: string;                  // Segment name (not full path)
  fullPath: string;              // Complete dot-notation path
  level: number;                 // Nesting depth (0 = root)
  isLeaf: boolean;               // True if this is an actual column
  isExpanded: boolean;           // Expansion state
  isArray: boolean;              // True if name ends with []
  dataType: 'object' | 'array' | 'primitive'; // Parent node type
  children: ColumnHierarchyNode[]; // Child nodes
  
  // Only for leaf nodes (actual columns)
  column?: Column;               // Original column data
  
  // Metadata
  childCount: number;            // Direct children count
  descendantCount: number;       // Total descendants count
}
```

### Hierarchy State

```typescript
interface HierarchyState {
  globalNestingLevel: number;    // 0 = all collapsed, -1 = all expanded
  expansionStates: Map<string, boolean>; // Per-node expansion state
  maxNestingDepth: number;       // Maximum depth in current schema
}
```

### Enhanced Table Interface

```typescript
interface Table {
  // ... existing properties
  columnHierarchy?: ColumnHierarchyNode[]; // Root nodes of hierarchy
  hasNestedColumns: boolean;     // Quick check for nesting
  maxColumnDepth: number;        // Deepest nesting level
}
```

## Components and Interfaces

### 1. Column Hierarchy Builder

**Purpose:** Transform flat column list into hierarchical tree structure

```typescript
class ColumnHierarchyBuilder {
  /**
   * Build hierarchy from flat column list
   */
  buildHierarchy(columns: Column[]): ColumnHierarchyNode[] {
    const root: Map<string, ColumnHierarchyNode> = new Map();
    
    for (const column of columns) {
      const segments = this.parseColumnPath(column.name);
      this.insertIntoHierarchy(root, segments, column);
    }
    
    return Array.from(root.values());
  }
  
  /**
   * Parse column name into path segments
   * Example: "maintenance.oTSData.bump" → ["maintenance", "oTSData", "bump"]
   * Example: "crewmember[].empNum" → ["crewmember[]", "empNum"]
   */
  private parseColumnPath(columnName: string): string[] {
    // Split on dots, preserving array notation []
    return columnName.split('.');
  }
  
  /**
   * Determine if a segment represents an array
   * Example: "crewmember[]" → true
   * Example: "crewmember" → false
   */
  private isArraySegment(segment: string): boolean {
    return segment.endsWith('[]');
  }
  
  /**
   * Determine data type of parent node
   * - If child has [], parent is array
   * - Otherwise, parent is object
   */
  private getParentDataType(children: ColumnHierarchyNode[]): 'object' | 'array' {
    return children.some(c => c.isArray) ? 'array' : 'object';
  }
  
  /**
   * Insert column into hierarchy tree
   */
  private insertIntoHierarchy(
    parent: Map<string, ColumnHierarchyNode>,
    segments: string[],
    column: Column,
    currentPath: string[] = []
  ): void {
    if (segments.length === 0) return;
    
    const segment = segments[0];
    const fullPath = [...currentPath, segment].join('.');
    
    if (!parent.has(segment)) {
      parent.set(segment, {
        id: `node_${fullPath}`,
        name: segment,
        fullPath,
        level: currentPath.length,
        isLeaf: segments.length === 1,
        isExpanded: false,
        children: [],
        column: segments.length === 1 ? column : undefined,
        childCount: 0,
        descendantCount: 0
      });
    }
    
    const node = parent.get(segment)!;
    
    if (segments.length > 1) {
      // Continue building tree
      const childMap = new Map(node.children.map(c => [c.name, c]));
      this.insertIntoHierarchy(childMap, segments.slice(1), column, [...currentPath, segment]);
      node.children = Array.from(childMap.values());
      node.childCount = node.children.length;
      node.descendantCount = node.children.reduce((sum, c) => sum + c.descendantCount + 1, 0);
    }
  }
}
```

### 2. Hierarchy State Manager

**Purpose:** Manage expansion states and global nesting level

```typescript
class HierarchyStateManager {
  private state: HierarchyState;
  
  constructor() {
    this.state = {
      globalNestingLevel: -1, // All expanded by default
      expansionStates: new Map(),
      maxNestingDepth: 0
    };
  }
  
  /**
   * Set global nesting level (affects all tables)
   */
  setGlobalNestingLevel(level: number): void {
    this.state.globalNestingLevel = level;
    this.applyGlobalLevel();
  }
  
  /**
   * Toggle expansion state of a specific node
   */
  toggleNode(nodeId: string): void {
    const current = this.state.expansionStates.get(nodeId) ?? false;
    this.state.expansionStates.set(nodeId, !current);
  }
  
  /**
   * Check if node should be expanded based on global level and individual state
   */
  isNodeExpanded(node: ColumnHierarchyNode): boolean {
    // Check individual state first
    if (this.state.expansionStates.has(node.id)) {
      return this.state.expansionStates.get(node.id)!;
    }
    
    // Fall back to global level
    if (this.state.globalNestingLevel === -1) {
      return true; // All expanded
    }
    
    return node.level < this.state.globalNestingLevel;
  }
  
  /**
   * Apply global nesting level to all nodes
   */
  private applyGlobalLevel(): void {
    // Clear individual states when global level changes
    this.state.expansionStates.clear();
  }
  
  /**
   * Persist state to localStorage
   */
  saveState(): void {
    localStorage.setItem('hierarchyState', JSON.stringify({
      globalNestingLevel: this.state.globalNestingLevel,
      expansionStates: Array.from(this.state.expansionStates.entries())
    }));
  }
  
  /**
   * Restore state from localStorage
   */
  loadState(): void {
    const saved = localStorage.getItem('hierarchyState');
    if (saved) {
      const data = JSON.parse(saved);
      this.state.globalNestingLevel = data.globalNestingLevel;
      this.state.expansionStates = new Map(data.expansionStates);
    }
  }
}
```

### 3. Enhanced TableNode Component

**Purpose:** Render hierarchical columns with expand/collapse

```typescript
interface TableNodeProps {
  // ... existing props
  hierarchyState: HierarchyStateManager;
  onToggleNode: (nodeId: string) => void;
}

// Rendering logic
const renderColumnHierarchy = (
  nodes: ColumnHierarchyNode[],
  level: number = 0
): JSX.Element[] => {
  return nodes.flatMap(node => {
    const isExpanded = hierarchyState.isNodeExpanded(node);
    const indentation = level * 16; // 16px per level
    
    const elements: JSX.Element[] = [];
    
    // Render current node
    elements.push(
      <g key={node.id} className="hierarchy-node">
        {/* Node background */}
        <rect
          x={table.position.x + indentation}
          y={nodeY}
          width={table.size.width - indentation}
          height={columnHeight}
          fill="transparent"
          className="node-hover"
        />
        
        {/* Expand/collapse indicator (if not leaf) */}
        {!node.isLeaf && (
          <text
            x={table.position.x + indentation + 4}
            y={nodeY + columnHeight / 2}
            dominantBaseline="middle"
            fontSize="10"
            fill={textColor}
            style={{ cursor: 'pointer' }}
            onClick={() => onToggleNode(node.id)}
          >
            {isExpanded ? '▼' : '▶'}
          </text>
        )}
        
        {/* Node name */}
        <text
          x={table.position.x + indentation + (node.isLeaf ? 8 : 20)}
          y={nodeY + columnHeight / 2}
          dominantBaseline="middle"
          fontSize="12"
          fontWeight={node.isLeaf ? 'normal' : 'bold'}
          fill={textColor}
        >
          {node.name}
          {!node.isLeaf && ` (${node.childCount})`}
        </text>
        
        {/* Type (for leaf nodes) */}
        {node.isLeaf && node.column && (
          <text
            x={table.position.x + table.size.width - 8}
            y={nodeY + columnHeight / 2}
            dominantBaseline="middle"
            textAnchor="end"
            fontSize="10"
            fill={theme === 'dark' ? '#aaa' : '#666'}
          >
            {node.column.type}
          </text>
        )}
      </g>
    );
    
    // Render children if expanded
    if (isExpanded && node.children.length > 0) {
      elements.push(...renderColumnHierarchy(node.children, level + 1));
    }
    
    return elements;
  });
};
```

### 4. Nesting Level Control (Toolbar)

**Purpose:** Global control for nesting level

```typescript
interface NestingLevelControlProps {
  currentLevel: number;
  maxLevel: number;
  onChange: (level: number) => void;
}

const NestingLevelControl: React.FC<NestingLevelControlProps> = ({
  currentLevel,
  maxLevel,
  onChange
}) => {
  return (
    <div className="nesting-level-control">
      <label>Nesting Level:</label>
      <button onClick={() => onChange(Math.max(0, currentLevel - 1))}>
        −
      </button>
      <span className="level-display">
        {currentLevel === -1 ? 'All' : currentLevel}
      </span>
      <button onClick={() => onChange(currentLevel === -1 ? maxLevel : currentLevel + 1)}>
        +
      </button>
      <button onClick={() => onChange(-1)}>
        All
      </button>
      <button onClick={() => onChange(0)}>
        None
      </button>
    </div>
  );
};
```

## Workflow

### 1. Initial Load

```
User loads DBML
    ↓
Parser creates flat Column objects
    ↓
ColumnHierarchyBuilder analyzes column names
    ↓
Build tree structure for each table
    ↓
HierarchyStateManager loads saved preferences
    ↓
Apply global nesting level
    ↓
Render tables with hierarchical columns
```

### 2. User Interaction - Toggle Node

```
User clicks expand/collapse indicator
    ↓
onToggleNode(nodeId) called
    ↓
HierarchyStateManager updates expansion state
    ↓
Component re-renders
    ↓
Show/hide child nodes with animation
    ↓
Save state to localStorage
```

### 3. User Interaction - Change Global Level

```
User adjusts nesting level control
    ↓
onChange(newLevel) called
    ↓
HierarchyStateManager.setGlobalNestingLevel(newLevel)
    ↓
Clear individual expansion states
    ↓
All tables re-render with new level
    ↓
Save preference to localStorage
```

## Performance Optimizations

### 1. Lazy Rendering
- Only render visible nodes (collapsed children are not rendered)
- Use virtual scrolling for tables with 1000+ columns

### 2. Memoization
- Memoize hierarchy building (only rebuild when columns change)
- Memoize expansion state calculations
- Use React.memo for node components

### 3. Efficient Updates
- Use Map for O(1) expansion state lookups
- Batch state updates to minimize re-renders
- Use CSS transforms for expand/collapse animations

### 4. Caching
- Cache built hierarchies per table
- Cache calculated node positions
- Invalidate cache only when necessary

## Visual Design

### Indentation
- 16px per nesting level
- Maximum visual indentation: 5 levels (80px)
- Deeper levels use ellipsis or scrolling

### Icons
- Collapsed: ▶ (right arrow)
- Expanded: ▼ (down arrow)
- Leaf node: No icon (or bullet point)

### Colors
- Parent nodes: Bold text, slightly darker
- Leaf nodes: Normal text
- Hover: Subtle background highlight
- Selected: Blue highlight

### Animations
- Expand/collapse: 200ms ease-out
- Fade in children: 150ms
- Height transition: smooth

## Integration Points

### 1. DBML Parser
- No changes needed (continues to parse flat columns)
- Hierarchy building happens post-parse

### 2. Table Component
- Add hierarchy rendering mode
- Toggle between flat and hierarchical view
- Maintain backward compatibility

### 3. Toolbar
- Add nesting level control
- Position near other view controls
- Show/hide based on whether any table has nesting

### 4. Context/State
- Add hierarchy state to app context
- Persist expansion states
- Sync across components

## Testing Strategy

### Unit Tests
- ColumnHierarchyBuilder.parseColumnPath()
- ColumnHierarchyBuilder.buildHierarchy()
- HierarchyStateManager.isNodeExpanded()
- Edge cases: empty columns, single-level, deep nesting

### Integration Tests
- Full workflow: parse → build → render
- State persistence and restoration
- Global level changes affect all tables

### Visual Tests
- Indentation is correct
- Icons display properly
- Animations are smooth
- Hover states work

### Performance Tests
- Build hierarchy for 1000 columns: < 100ms
- Toggle expansion: < 50ms
- Change global level: < 500ms

## Migration Strategy

### Phase 1: Core Implementation
- Implement ColumnHierarchyBuilder
- Implement HierarchyStateManager
- Add basic rendering (no animations)

### Phase 2: UI Polish
- Add expand/collapse animations
- Add toolbar control
- Improve visual styling

### Phase 3: Optimization
- Add lazy rendering
- Add memoization
- Performance tuning

### Phase 4: Enhancement
- Add keyboard navigation
- Add search integration
- Add export support

## Future Enhancements

- Custom grouping rules (not just dots)
- Drag-and-drop to reorganize hierarchy
- Collapse all siblings when expanding one
- Breadcrumb navigation for deep nesting
- Mini-map showing hierarchy structure
- Export hierarchy as JSON/YAML
