# Design Document: DBML Diagram Visualizer

## Overview

The DBML Diagram Visualizer will be a comprehensive web-based application built with React and TypeScript that provides full-featured database schema visualization and editing capabilities. The application will extend the existing foundation to include advanced features like SVG-based rendering, sophisticated layout algorithms, annotation systems, and robust DBML parsing/generation.

The architecture follows a modular design with clear separation of concerns between data management, rendering, user interactions, and file operations. The application will use a canvas-based approach with SVG for scalable graphics and precise relationship rendering.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
├─────────────────────────────────────────────────────────────┤
│  UI Components  │  Canvas System  │  Export System         │
├─────────────────────────────────────────────────────────────┤
│  State Management │ Layout Engine │ Annotation System      │
├─────────────────────────────────────────────────────────────┤
│  DBML Parser/Generator │ File Operations │ Theme System    │
├─────────────────────────────────────────────────────────────┤
│                    Core Data Models                         │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Graphics Rendering**: SVG with React components for scalable, high-quality visuals
- **State Management**: React Context + useReducer for complex state operations
- **Drag & Drop**: Enhanced react-draggable with custom interaction handling
- **File Operations**: File System Access API with fallback to traditional file handling
- **Export**: SVG-to-PNG conversion using canvas, native SVG export
- **Layout Algorithms**: Custom implementations of force-directed and hierarchical layouts
- **Styling**: CSS-in-JS with theme system for customization

## Components and Interfaces

### Core Data Models (Enhanced)

```typescript
// Enhanced from existing types/database.ts
export interface Column {
  id: string;
  name: string;
  type: string;
  primaryKey?: boolean;
  foreignKey?: boolean;
  notNull?: boolean;
  unique?: boolean;
  default?: string;
  note?: string;
  customProperties?: Record<string, any>;
}

export interface Table {
  id: string;
  name: string;
  schema?: string;
  columns: Column[];
  position: { x: number; y: number };
  size: { width: number; height: number };
  color?: string;
  borderColor?: string;
  textColor?: string;
  note?: string;
  collapsed?: boolean;
  customProperties?: Record<string, any>;
}

export interface Reference {
  id: string;
  name?: string;
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';
  onDelete?: 'cascade' | 'restrict' | 'set null' | 'set default';
  onUpdate?: 'cascade' | 'restrict' | 'set null' | 'set default';
  color?: string;
  style?: 'solid' | 'dashed' | 'dotted';
  thickness?: number;
}

export interface Annotation {
  id: string;
  type: 'text' | 'shape' | 'arrow';
  position: { x: number; y: number };
  size: { width: number; height: number };
  content: string;
  style: {
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
    fontSize?: number;
    fontWeight?: 'normal' | 'bold';
    fontStyle?: 'normal' | 'italic';
  };
  zIndex: number;
}

export interface DiagramSettings {
  theme: 'light' | 'dark' | 'custom';
  gridEnabled: boolean;
  snapToGrid: boolean;
  gridSize: number;
  showRelationshipLabels: boolean;
  autoLayout: 'manual' | 'hierarchical' | 'force-directed' | 'circular';
  exportSettings: {
    defaultFormat: 'png' | 'svg';
    resolution: number;
    backgroundColor: string;
  };
}

export interface DatabaseSchema {
  tables: Table[];
  references: Reference[];
  annotations: Annotation[];
  settings: DiagramSettings;
  metadata: {
    version: string;
    created: string;
    modified: string;
    author?: string;
  };
}
```

### Component Architecture

#### 1. Application Container (`App.tsx`)
- Main application state management
- File operations coordination
- Global event handling
- Theme provider

#### 2. Canvas System
- **DiagramCanvas**: Enhanced SVG-based canvas with zoom/pan
- **ViewportManager**: Handles viewport transformations and bounds
- **GridSystem**: Optional grid overlay with snap-to-grid functionality
- **SelectionManager**: Multi-select and selection rectangle handling

#### 3. Table Rendering System
- **TableNode**: Enhanced table visualization with collapsing
- **ColumnRenderer**: Individual column display with type icons
- **TableResizer**: Handle-based resizing functionality
- **TableStyler**: Color picker and styling controls

#### 4. Relationship System
- **RelationshipRenderer**: SVG path-based relationship lines
- **RelationshipRouter**: Smart routing to avoid overlaps
- **RelationshipEditor**: Interactive relationship editing
- **ConnectionPoints**: Dynamic connection point calculation

#### 5. Layout Engine
- **LayoutManager**: Coordinates different layout algorithms
- **ForceDirectedLayout**: Physics-based automatic arrangement
- **HierarchicalLayout**: Tree-like arrangement for hierarchical data
- **CircularLayout**: Circular arrangement for relationship visualization
- **ManualLayout**: User-controlled positioning with guides

#### 6. Annotation System
- **AnnotationLayer**: Overlay for text and shape annotations
- **TextAnnotation**: Rich text editing with formatting
- **ShapeAnnotation**: Basic shapes (rectangles, circles, arrows)
- **AnnotationEditor**: Inline editing interface

#### 7. File Operations
- **DBMLParser**: Enhanced parser with error recovery
- **DBMLGenerator**: Schema-to-DBML conversion with formatting
- **FileManager**: File system operations with auto-save
- **ImportExportManager**: Multiple format support

#### 8. Export System
- **SVGExporter**: Native SVG export with embedded styles
- **PNGExporter**: High-quality raster export
- **ExportDialog**: User interface for export options
- **PrintManager**: Print-optimized layouts

### State Management Architecture

```typescript
interface AppState {
  schema: DatabaseSchema;
  ui: {
    selectedItems: string[];
    dragState: DragState | null;
    viewport: ViewportState;
    activeTools: ActiveTools;
    unsavedChanges: boolean;
  };
  file: {
    currentFile: string | null;
    recentFiles: string[];
    autoSaveEnabled: boolean;
  };
}

type AppAction = 
  | { type: 'LOAD_SCHEMA'; payload: DatabaseSchema }
  | { type: 'UPDATE_TABLE'; payload: { id: string; updates: Partial<Table> } }
  | { type: 'ADD_ANNOTATION'; payload: Annotation }
  | { type: 'SET_VIEWPORT'; payload: ViewportState }
  | { type: 'SELECT_ITEMS'; payload: string[] }
  | { type: 'APPLY_LAYOUT'; payload: { algorithm: string; options: any } };
```

## Data Models

### Enhanced DBML Parser

The parser will be significantly enhanced to handle:

- **Complete DBML Syntax**: Full support for all DBML features including enums, indexes, and table groups
- **Error Recovery**: Graceful handling of syntax errors with detailed error reporting
- **Metadata Preservation**: Maintain comments and custom properties
- **Incremental Parsing**: Support for parsing changes without full reprocessing

```typescript
interface ParseResult {
  schema: DatabaseSchema;
  errors: ParseError[];
  warnings: ParseWarning[];
  metadata: {
    parseTime: number;
    linesProcessed: number;
    featuresUsed: string[];
  };
}

interface ParseError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning';
  suggestion?: string;
}
```

### Layout Algorithm Interfaces

```typescript
interface LayoutAlgorithm {
  name: string;
  description: string;
  apply(schema: DatabaseSchema, options: LayoutOptions): Promise<LayoutResult>;
  getDefaultOptions(): LayoutOptions;
}

interface LayoutOptions {
  preserveUserPositions: boolean;
  minimizeOverlaps: boolean;
  optimizeRelationships: boolean;
  spacing: { horizontal: number; vertical: number };
  bounds?: { width: number; height: number };
}

interface LayoutResult {
  positions: Record<string, { x: number; y: number }>;
  bounds: { width: number; height: number };
  metrics: {
    overlapCount: number;
    crossingCount: number;
    totalPathLength: number;
  };
}
```

## Error Handling

### Parsing Error Management
- **Syntax Error Recovery**: Continue parsing after encountering errors
- **Error Highlighting**: Visual indication of problematic DBML sections
- **Suggestion System**: Automated suggestions for common syntax issues
- **Validation Pipeline**: Multi-stage validation with detailed feedback

### Runtime Error Handling
- **Graceful Degradation**: Maintain functionality when non-critical features fail
- **User Feedback**: Clear error messages with actionable solutions
- **State Recovery**: Automatic recovery from invalid states
- **Performance Monitoring**: Detection and handling of performance issues

### File Operation Error Handling
- **Permission Errors**: Clear messaging for file access issues
- **Corruption Detection**: Validation of file integrity before processing
- **Backup System**: Automatic backups before destructive operations
- **Recovery Options**: Multiple recovery paths for failed operations

## Testing Strategy

### Unit Testing
- **Component Testing**: React Testing Library for UI components
- **Parser Testing**: Comprehensive test suite for DBML parsing edge cases
- **Layout Algorithm Testing**: Verification of layout algorithm correctness
- **State Management Testing**: Redux-style action/reducer testing

### Integration Testing
- **File Operations**: End-to-end testing of import/export workflows
- **Canvas Interactions**: Testing of drag-and-drop and selection behaviors
- **Cross-browser Compatibility**: Testing across major browsers
- **Performance Testing**: Load testing with large schemas

### Visual Regression Testing
- **Screenshot Comparison**: Automated visual testing of rendered diagrams
- **Export Quality**: Verification of export output quality
- **Theme Consistency**: Testing of theme application across components
- **Responsive Behavior**: Testing of layout at different viewport sizes

### Performance Testing
- **Large Schema Handling**: Testing with 100+ table schemas
- **Memory Usage**: Monitoring for memory leaks during extended use
- **Rendering Performance**: Frame rate testing during interactions
- **Export Performance**: Timing of export operations for large diagrams

## Implementation Phases

### Phase 1: Enhanced Core (Weeks 1-2)
- Upgrade existing components to SVG-based rendering
- Implement enhanced data models and state management
- Add comprehensive DBML parser with error handling
- Create robust file operations system

### Phase 2: Advanced Interactions (Weeks 3-4)
- Implement multi-select and advanced selection tools
- Add table resizing and column reordering
- Create relationship editing interface
- Develop annotation system foundation

### Phase 3: Layout and Visualization (Weeks 5-6)
- Implement automatic layout algorithms
- Add advanced relationship routing
- Create theme system and customization options
- Develop export system with multiple formats

### Phase 4: Polish and Performance (Weeks 7-8)
- Optimize performance for large schemas
- Add comprehensive error handling and validation
- Implement auto-save and backup systems
- Create comprehensive test suite

## Interactive Relationship Creation

### Context Menu System

The context menu will be triggered on right-click of table nodes and provide quick access to relationship creation.

```typescript
interface ContextMenuOption {
  id: string;
  label: string;
  icon?: string;
  action: () => void;
  disabled?: boolean;
  separator?: boolean;
}

interface ContextMenuState {
  visible: boolean;
  position: { x: number; y: number };
  targetTableId: string | null;
  options: ContextMenuOption[];
}
```

### Relationship Creation Dialog

The dialog will provide a user-friendly interface for configuring new relationships.

```typescript
interface RelationshipDialogProps {
  isOpen: boolean;
  sourceTable: Table;
  allTables: Table[];
  onConfirm: (relationship: RelationshipConfig) => void;
  onCancel: () => void;
}

interface RelationshipConfig {
  sourceTableId: string;
  sourceColumnId: string;
  destinationTableId: string;
  destinationColumnId: string;
  relationshipType: 'one-to-one' | 'one-to-many' | 'many-to-one';
  name?: string;
  onDelete?: 'cascade' | 'restrict' | 'set null' | 'set default';
  onUpdate?: 'cascade' | 'restrict' | 'set null' | 'set default';
}
```

### Dialog Components

#### 1. RelationshipDialog Component
- Modal dialog with form fields
- Validation logic for required fields
- Real-time preview of relationship
- Confirm/Cancel actions

#### 2. ColumnSelector Component
- Dropdown with searchable column list
- Display column name, type, and constraints
- Visual indicators for primary keys and foreign keys
- Disabled state for invalid selections

#### 3. TableSelector Component
- Dropdown with searchable table list
- Display table name and schema
- Filter out source table from destination options
- Show table preview on hover

#### 4. RelationshipTypeSelector Component
- Radio buttons or dropdown for relationship types
- Visual icons for each type (1:1, 1:N, N:1)
- Description text for each type
- Default selection based on column constraints

### DBML Generation

When a relationship is created, the system will generate proper DBML syntax:

```typescript
interface DBMLGenerator {
  generateReference(config: RelationshipConfig): string;
  insertReference(dbmlContent: string, reference: string): string;
  validateReference(reference: string): ValidationResult;
}

// Example output:
// Ref: fact_flight_leg.airline_sk > dim_airline.airline_sk
// Ref: orders.user_id - users.id  // one-to-one
// Ref: posts.user_id > users.id   // many-to-one
```

### Workflow

1. **User Right-Clicks Table**
   - Context menu appears at cursor position
   - Menu shows "Create Relationship" option
   - Other options: Edit Table, Delete Table, Duplicate Table

2. **User Selects "Create Relationship"**
   - Dialog opens with source table pre-selected
   - Source column dropdown populated with table columns
   - Destination table dropdown shows all other tables
   - Relationship type defaults to "many-to-one"

3. **User Configures Relationship**
   - Selects source column (e.g., "airline_sk")
   - Selects destination table (e.g., "dim_airline")
   - Destination column dropdown populates with destination table columns
   - Selects destination column (e.g., "airline_sk")
   - Optionally changes relationship type
   - Optionally sets ON DELETE/UPDATE actions

4. **User Confirms**
   - System validates all required fields are filled
   - Generates DBML reference syntax
   - Appends reference to DBML source code
   - Triggers re-parse of DBML
   - Diagram updates with new relationship line
   - Dialog closes

5. **User Cancels**
   - Dialog closes without changes
   - No modifications to DBML or diagram

### Validation Rules

- **Source Column**: Must be selected
- **Destination Table**: Must be selected and different from source
- **Destination Column**: Must be selected
- **Relationship Type**: Must be selected
- **Duplicate Check**: Warn if relationship already exists
- **Type Compatibility**: Warn if column types don't match
- **Constraint Validation**: Validate ON DELETE/UPDATE options

### Integration Points

#### 1. Context Menu Integration
- Add right-click handler to TableNode component
- Position context menu at cursor location
- Handle menu item selection
- Close menu on outside click or escape

#### 2. Dialog Integration
- Create modal overlay component
- Manage dialog state in app context
- Handle form submission
- Provide loading state during DBML update

#### 3. DBML Editor Integration
- Access current DBML content
- Append new reference syntax
- Trigger editor update
- Maintain cursor position if possible

#### 4. Parser Integration
- Re-parse DBML after update
- Handle parsing errors gracefully
- Update diagram state with new relationship
- Maintain existing table positions

### UI/UX Considerations

- **Keyboard Navigation**: Support tab navigation through form fields
- **Accessibility**: Proper ARIA labels and roles
- **Responsive Design**: Dialog adapts to viewport size
- **Error Feedback**: Clear validation messages
- **Loading States**: Show spinner during DBML update
- **Success Feedback**: Brief confirmation message after creation
- **Undo Support**: Allow undo of relationship creation

This design provides a solid foundation for building a professional-grade DBML visualization tool that meets all the specified requirements while maintaining excellent performance and user experience.