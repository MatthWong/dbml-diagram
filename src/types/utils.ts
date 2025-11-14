// Utility types for better type safety and development experience

// Generic position and size types
export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Bounds extends Position, Size {}

// Color and styling utilities
export interface ColorPalette {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  accent: string;
  error: string;
  warning: string;
  success: string;
}

export interface Theme {
  name: string;
  colors: ColorPalette;
  typography: {
    fontFamily: string;
    fontSize: {
      small: number;
      medium: number;
      large: number;
      xlarge: number;
    };
    fontWeight: {
      normal: number;
      medium: number;
      bold: number;
    };
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    small: number;
    medium: number;
    large: number;
  };
}

// Event handler types
export type MouseEventHandler<T = Element> = (event: React.MouseEvent<T>) => void;
export type KeyboardEventHandler<T = Element> = (event: React.KeyboardEvent<T>) => void;
export type ChangeEventHandler<T = Element> = (event: React.ChangeEvent<T>) => void;

// Generic callback types
export type VoidCallback = () => void;
export type ValueCallback<T> = (value: T) => void;
export type ErrorCallback = (error: Error) => void;

// File operation types
export interface FileHandle {
  name: string;
  kind: 'file' | 'directory';
  getFile(): Promise<File>;
  createWritable(): Promise<FileSystemWritableFileStream>;
}

export interface FileOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  fileName?: string;
}

// Performance monitoring types
export interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  frameRate: number;
  interactionLatency: number;
}

// Validation types
export interface ValidationRule<T> {
  validate: (value: T) => boolean;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Generic API response type
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    version: string;
    requestId: string;
  };
}

// Debounce and throttle utility types
export type DebouncedFunction<T extends (...args: any[]) => any> = {
  (...args: Parameters<T>): void;
  cancel: () => void;
  flush: () => void;
};

export type ThrottledFunction<T extends (...args: any[]) => any> = {
  (...args: Parameters<T>): void;
  cancel: () => void;
};

// Component state types
export interface LoadingState {
  isLoading: boolean;
  loadingMessage?: string;
  progress?: number;
}

export interface ErrorState {
  hasError: boolean;
  error?: Error;
  errorMessage?: string;
  errorCode?: string;
}

// Selection and interaction types
export interface SelectionState {
  selectedItems: Set<string>;
  lastSelected?: string;
  selectionBounds?: Bounds;
}

export interface InteractionState {
  isHovering: boolean;
  isDragging: boolean;
  isResizing: boolean;
  isEditing: boolean;
}

// Keyboard shortcut types
export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  action: string;
  description: string;
}

// Context menu types
export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  separator?: boolean;
  submenu?: ContextMenuItem[];
  action: () => void;
}

// Undo/Redo types
export interface UndoRedoState<T> {
  past: T[];
  present: T;
  future: T[];
}

export interface UndoRedoAction<T> {
  type: 'UNDO' | 'REDO' | 'SET' | 'CLEAR';
  payload?: T;
}