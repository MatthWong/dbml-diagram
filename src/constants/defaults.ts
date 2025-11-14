import { DiagramSettings, DatabaseSchema } from '../types/database';
import { ColorPalette } from '../types/utils';

// Default diagram settings
export const DEFAULT_DIAGRAM_SETTINGS: DiagramSettings = {
  theme: 'light',
  gridEnabled: true,
  snapToGrid: false,
  gridSize: 20,
  showRelationshipLabels: true,
  autoLayout: 'manual',
  exportSettings: {
    defaultFormat: 'png',
    resolution: 300,
    backgroundColor: '#ffffff'
  },
  // Hierarchical column settings
  maxNestingLevel: undefined, // undefined means show all levels
  showHierarchical: true,
  expandAllNested: true
};

// Default database schema structure
export const DEFAULT_DATABASE_SCHEMA: DatabaseSchema = {
  tables: [],
  references: [],
  annotations: [],
  settings: DEFAULT_DIAGRAM_SETTINGS,
  metadata: {
    version: '1.0.0',
    created: new Date().toISOString(),
    modified: new Date().toISOString()
  }
};

// Default table dimensions
export const DEFAULT_TABLE_SIZE = {
  width: 200,
  height: 150,
  minWidth: 150,
  maxWidth: 400,
  minHeight: 100,
  maxHeight: 600
};

// Default annotation dimensions
export const DEFAULT_ANNOTATION_SIZE = {
  width: 200,
  height: 100,
  minWidth: 100,
  maxWidth: 500,
  minHeight: 50,
  maxHeight: 300
};

// Canvas and viewport defaults
export const DEFAULT_VIEWPORT = {
  zoom: 1,
  minZoom: 0.1,
  maxZoom: 5,
  zoomStep: 0.1,
  pan: { x: 0, y: 0 },
  bounds: { width: 2000, height: 1500 }
};

// Color palettes for themes
export const LIGHT_COLOR_PALETTE: ColorPalette = {
  primary: '#2196f3',
  secondary: '#757575',
  background: '#ffffff',
  surface: '#f5f5f5',
  text: '#212121',
  textSecondary: '#757575',
  border: '#e0e0e0',
  accent: '#ff4081',
  error: '#f44336',
  warning: '#ff9800',
  success: '#4caf50'
};

export const DARK_COLOR_PALETTE: ColorPalette = {
  primary: '#64b5f6',
  secondary: '#bdbdbd',
  background: '#121212',
  surface: '#1e1e1e',
  text: '#ffffff',
  textSecondary: '#bdbdbd',
  border: '#333333',
  accent: '#ff4081',
  error: '#f44336',
  warning: '#ff9800',
  success: '#4caf50'
};

// Default themes
export const LIGHT_THEME = {
  name: 'light',
  colors: LIGHT_COLOR_PALETTE,
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: {
      small: 12,
      medium: 14,
      large: 16,
      xlarge: 20
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      bold: 700
    }
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32
  },
  borderRadius: {
    small: 4,
    medium: 8,
    large: 12
  }
};

export const DARK_THEME = {
  ...LIGHT_THEME,
  name: 'dark',
  colors: DARK_COLOR_PALETTE
};

// Table color presets
export const TABLE_COLOR_PRESETS = [
  '#ffffff', // White
  '#e3f2fd', // Light Blue
  '#f3e5f5', // Light Purple
  '#e8f5e8', // Light Green
  '#fff3e0', // Light Orange
  '#fce4ec', // Light Pink
  '#f1f8e9', // Light Lime
  '#e0f2f1', // Light Teal
  '#fafafa', // Light Gray
  '#fff8e1'  // Light Yellow
];

// Relationship style presets
export const RELATIONSHIP_STYLE_PRESETS = {
  colors: ['#666666', '#2196f3', '#4caf50', '#ff9800', '#f44336', '#9c27b0'],
  styles: ['solid', 'dashed', 'dotted'] as const,
  thickness: [1, 2, 3, 4, 5]
};

// Layout algorithm default options
export const LAYOUT_DEFAULTS = {
  hierarchical: {
    preserveUserPositions: false,
    minimizeOverlaps: true,
    optimizeRelationships: true,
    spacing: { horizontal: 300, vertical: 200 }
  },
  forceDirected: {
    preserveUserPositions: false,
    minimizeOverlaps: true,
    optimizeRelationships: true,
    spacing: { horizontal: 250, vertical: 180 }
  },
  circular: {
    preserveUserPositions: false,
    minimizeOverlaps: true,
    optimizeRelationships: false,
    spacing: { horizontal: 200, vertical: 200 }
  }
};

// Export defaults
export const EXPORT_DEFAULTS = {
  png: {
    resolution: 300,
    quality: 0.9,
    backgroundColor: '#ffffff'
  },
  svg: {
    includeStyles: true,
    embedFonts: true,
    optimizeSize: true
  }
};

// Performance thresholds
export const PERFORMANCE_THRESHOLDS = {
  maxTablesForFullRendering: 100,
  maxRelationshipsForFullRendering: 200,
  virtualizationThreshold: 50,
  memoryWarningThreshold: 100 * 1024 * 1024, // 100MB
  frameRateWarningThreshold: 30 // FPS
};

// File operation defaults
export const FILE_DEFAULTS = {
  autoSaveInterval: 30000, // 30 seconds
  maxRecentFiles: 10,
  backupRetentionDays: 7,
  supportedFormats: ['.dbml', '.json'],
  maxFileSize: 10 * 1024 * 1024 // 10MB
};

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  save: { key: 's', ctrlKey: true, description: 'Save diagram' },
  open: { key: 'o', ctrlKey: true, description: 'Open file' },
  export: { key: 'e', ctrlKey: true, description: 'Export diagram' },
  undo: { key: 'z', ctrlKey: true, description: 'Undo' },
  redo: { key: 'y', ctrlKey: true, description: 'Redo' },
  selectAll: { key: 'a', ctrlKey: true, description: 'Select all' },
  delete: { key: 'Delete', description: 'Delete selected items' },
  copy: { key: 'c', ctrlKey: true, description: 'Copy' },
  paste: { key: 'v', ctrlKey: true, description: 'Paste' },
  zoomIn: { key: '=', ctrlKey: true, description: 'Zoom in' },
  zoomOut: { key: '-', ctrlKey: true, description: 'Zoom out' },
  resetZoom: { key: '0', ctrlKey: true, description: 'Reset zoom' },
  fitToScreen: { key: 'f', ctrlKey: true, description: 'Fit to screen' }
};

// Animation and transition defaults
export const ANIMATION_DEFAULTS = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)'
  }
};

// Validation rules
export const VALIDATION_RULES = {
  tableName: {
    minLength: 1,
    maxLength: 64,
    pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/
  },
  columnName: {
    minLength: 1,
    maxLength: 64,
    pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/
  },
  schemaName: {
    minLength: 1,
    maxLength: 64,
    pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/
  }
};