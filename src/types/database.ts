// Enhanced Column interface with additional properties
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
  // Hierarchical structure properties
  isNested?: boolean;
  nestingLevel?: number;
  parentPath?: string;
  children?: Column[];
  isExpanded?: boolean;
  isVirtual?: boolean;
}

// Enhanced Table interface with size, styling, and advanced features
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
  // Hierarchical display options
  hierarchicalColumns?: any[];
  maxNestingLevel?: number;
  showHierarchical?: boolean;
}

// Enhanced Reference interface with styling and constraint options
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

// New Annotation interface for documentation and notes
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

// Diagram settings for themes, grid, and export preferences
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
  // Hierarchical column settings
  maxNestingLevel?: number;
  showHierarchical?: boolean;
  expandAllNested?: boolean;
}

// Enhanced DatabaseSchema with annotations, settings, and metadata
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

// State management interfaces
export interface ViewportState {
  zoom: number;
  pan: { x: number; y: number };
  bounds: { width: number; height: number };
}

export interface DragState {
  isDragging: boolean;
  dragType: 'table' | 'annotation' | 'selection';
  startPosition: { x: number; y: number };
  currentPosition: { x: number; y: number };
  draggedItems: string[];
}

export interface ActiveTools {
  selectedTool: 'select' | 'pan' | 'annotate' | 'relationship';
  isMultiSelectMode: boolean;
}

export interface AppState {
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

// Action types for state management
export type AppAction = 
  | { type: 'LOAD_SCHEMA'; payload: DatabaseSchema }
  | { type: 'UPDATE_TABLE'; payload: { id: string; updates: Partial<Table> } }
  | { type: 'UPDATE_REFERENCE'; payload: { id: string; updates: Partial<Reference> } }
  | { type: 'ADD_ANNOTATION'; payload: Annotation }
  | { type: 'UPDATE_ANNOTATION'; payload: { id: string; updates: Partial<Annotation> } }
  | { type: 'DELETE_ANNOTATION'; payload: string }
  | { type: 'SET_VIEWPORT'; payload: ViewportState }
  | { type: 'SELECT_ITEMS'; payload: string[] }
  | { type: 'SET_DRAG_STATE'; payload: DragState | null }
  | { type: 'SET_ACTIVE_TOOL'; payload: Partial<ActiveTools> }
  | { type: 'SET_UNSAVED_CHANGES'; payload: boolean }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<DiagramSettings> }
  | { type: 'APPLY_LAYOUT'; payload: { algorithm: string; options: any } };

// Layout algorithm interfaces
export interface LayoutOptions {
  preserveUserPositions: boolean;
  minimizeOverlaps: boolean;
  optimizeRelationships: boolean;
  spacing: { horizontal: number; vertical: number };
  bounds?: { width: number; height: number };
}

export interface LayoutResult {
  positions: Record<string, { x: number; y: number }>;
  bounds: { width: number; height: number };
  metrics: {
    overlapCount: number;
    crossingCount: number;
    totalPathLength: number;
  };
}

export interface LayoutAlgorithm {
  name: string;
  description: string;
  apply(schema: DatabaseSchema, options: LayoutOptions): Promise<LayoutResult>;
  getDefaultOptions(): LayoutOptions;
}

// Error handling and parsing interfaces
export interface ParseError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning';
  suggestion?: string;
}

export interface ParseWarning {
  line: number;
  column: number;
  message: string;
  suggestion?: string;
}

export interface ParseResult {
  schema: DatabaseSchema;
  errors: ParseError[];
  warnings: ParseWarning[];
  metadata: {
    parseTime: number;
    linesProcessed: number;
    featuresUsed: string[];
  };
}

// Component prop interfaces
export interface TableNodeProps {
  table: Table;
  selected: boolean;
  onSelect: (id: string) => void;
  onPositionChange: (id: string, position: { x: number; y: number }) => void;
  onSizeChange: (id: string, size: { width: number; height: number }) => void;
  onColorChange: (id: string, color: string) => void;
  onToggleCollapse: (id: string) => void;
}

export interface RelationshipProps {
  reference: Reference;
  fromTable: Table;
  toTable: Table;
  selected: boolean;
  onSelect: (id: string) => void;
  onStyleChange: (id: string, style: Partial<Reference>) => void;
}

export interface AnnotationProps {
  annotation: Annotation;
  selected: boolean;
  onSelect: (id: string) => void;
  onPositionChange: (id: string, position: { x: number; y: number }) => void;
  onSizeChange: (id: string, size: { width: number; height: number }) => void;
  onContentChange: (id: string, content: string) => void;
  onStyleChange: (id: string, style: Partial<Annotation['style']>) => void;
}

// Export interfaces
export interface ExportOptions {
  format: 'png' | 'svg';
  resolution: number;
  quality: number;
  backgroundColor: string;
  includeAnnotations: boolean;
  bounds?: { x: number; y: number; width: number; height: number };
}

export interface ExportResult {
  success: boolean;
  data?: Blob | string;
  error?: string;
  metadata: {
    format: string;
    size: { width: number; height: number };
    fileSize: number;
  };
}