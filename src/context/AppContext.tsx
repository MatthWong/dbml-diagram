import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { 
  AppState, 
  AppAction, 
  DatabaseSchema, 
  Table, 
  Reference, 
  Annotation,
  DiagramSettings,
  ViewportState,
  DragState,
  ActiveTools
} from '../types/database';
import { DEFAULT_DATABASE_SCHEMA, DEFAULT_VIEWPORT } from '../constants/defaults';

// Initial state
const initialState: AppState = {
  schema: DEFAULT_DATABASE_SCHEMA,
  ui: {
    selectedItems: [],
    dragState: null,
    viewport: {
      zoom: DEFAULT_VIEWPORT.zoom,
      pan: DEFAULT_VIEWPORT.pan,
      bounds: DEFAULT_VIEWPORT.bounds
    },
    activeTools: {
      selectedTool: 'select',
      isMultiSelectMode: false
    },
    unsavedChanges: false
  },
  file: {
    currentFile: null,
    recentFiles: [],
    autoSaveEnabled: true
  }
};

// Reducer function
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOAD_SCHEMA':
      return {
        ...state,
        schema: action.payload,
        ui: {
          ...state.ui,
          selectedItems: [],
          unsavedChanges: false
        }
      };

    case 'UPDATE_TABLE': {
      const updatedTables = state.schema.tables.map(table =>
        table.id === action.payload.id
          ? { ...table, ...action.payload.updates }
          : table
      );
      
      return {
        ...state,
        schema: {
          ...state.schema,
          tables: updatedTables,
          metadata: {
            ...state.schema.metadata,
            modified: new Date().toISOString()
          }
        },
        ui: {
          ...state.ui,
          unsavedChanges: true
        }
      };
    }

    case 'UPDATE_REFERENCE': {
      const updatedReferences = state.schema.references.map(ref =>
        ref.id === action.payload.id
          ? { ...ref, ...action.payload.updates }
          : ref
      );
      
      return {
        ...state,
        schema: {
          ...state.schema,
          references: updatedReferences,
          metadata: {
            ...state.schema.metadata,
            modified: new Date().toISOString()
          }
        },
        ui: {
          ...state.ui,
          unsavedChanges: true
        }
      };
    }

    case 'ADD_ANNOTATION':
      return {
        ...state,
        schema: {
          ...state.schema,
          annotations: [...state.schema.annotations, action.payload],
          metadata: {
            ...state.schema.metadata,
            modified: new Date().toISOString()
          }
        },
        ui: {
          ...state.ui,
          unsavedChanges: true
        }
      };

    case 'UPDATE_ANNOTATION': {
      const updatedAnnotations = state.schema.annotations.map(annotation =>
        annotation.id === action.payload.id
          ? { ...annotation, ...action.payload.updates }
          : annotation
      );
      
      return {
        ...state,
        schema: {
          ...state.schema,
          annotations: updatedAnnotations,
          metadata: {
            ...state.schema.metadata,
            modified: new Date().toISOString()
          }
        },
        ui: {
          ...state.ui,
          unsavedChanges: true
        }
      };
    }

    case 'DELETE_ANNOTATION': {
      const filteredAnnotations = state.schema.annotations.filter(
        annotation => annotation.id !== action.payload
      );
      
      return {
        ...state,
        schema: {
          ...state.schema,
          annotations: filteredAnnotations,
          metadata: {
            ...state.schema.metadata,
            modified: new Date().toISOString()
          }
        },
        ui: {
          ...state.ui,
          selectedItems: state.ui.selectedItems.filter(id => id !== action.payload),
          unsavedChanges: true
        }
      };
    }

    case 'SET_VIEWPORT':
      return {
        ...state,
        ui: {
          ...state.ui,
          viewport: action.payload
        }
      };

    case 'SELECT_ITEMS':
      return {
        ...state,
        ui: {
          ...state.ui,
          selectedItems: action.payload
        }
      };

    case 'SET_DRAG_STATE':
      return {
        ...state,
        ui: {
          ...state.ui,
          dragState: action.payload
        }
      };

    case 'SET_ACTIVE_TOOL':
      return {
        ...state,
        ui: {
          ...state.ui,
          activeTools: {
            ...state.ui.activeTools,
            ...action.payload
          }
        }
      };

    case 'SET_UNSAVED_CHANGES':
      return {
        ...state,
        ui: {
          ...state.ui,
          unsavedChanges: action.payload
        }
      };

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        schema: {
          ...state.schema,
          settings: {
            ...state.schema.settings,
            ...action.payload
          },
          metadata: {
            ...state.schema.metadata,
            modified: new Date().toISOString()
          }
        },
        ui: {
          ...state.ui,
          unsavedChanges: true
        }
      };

    case 'APPLY_LAYOUT': {
      // This would be handled by the layout engine
      // For now, just mark as unsaved changes
      return {
        ...state,
        ui: {
          ...state.ui,
          unsavedChanges: true
        }
      };
    }

    default:
      return state;
  }
}

// Context type
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  
  // Schema actions
  loadSchema: (schema: DatabaseSchema) => void;
  updateTable: (id: string, updates: Partial<Table>) => void;
  updateReference: (id: string, updates: Partial<Reference>) => void;
  addAnnotation: (annotation: Annotation) => void;
  updateAnnotation: (id: string, updates: Partial<Annotation>) => void;
  deleteAnnotation: (id: string) => void;
  updateSettings: (settings: Partial<DiagramSettings>) => void;
  
  // UI actions
  setViewport: (viewport: ViewportState) => void;
  selectItems: (items: string[]) => void;
  selectItem: (id: string, multiSelect?: boolean) => void;
  clearSelection: () => void;
  setDragState: (dragState: DragState | null) => void;
  setActiveTool: (tool: Partial<ActiveTools>) => void;
  setUnsavedChanges: (hasChanges: boolean) => void;
  
  // Utility functions
  getSelectedTables: () => Table[];
  getSelectedReferences: () => Reference[];
  getSelectedAnnotations: () => Annotation[];
  isItemSelected: (id: string) => boolean;
  hasUnsavedChanges: () => boolean;
  
  // Hierarchical column operations
  setNestingLevel: (level: number | undefined) => void;
  toggleHierarchicalView: (enabled: boolean) => void;
  getCurrentNestingLevel: () => number | undefined;
  isHierarchicalViewEnabled: () => boolean;
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
interface AppProviderProps {
  children: React.ReactNode;
  initialSchema?: DatabaseSchema;
}

export const AppProvider: React.FC<AppProviderProps> = ({ 
  children, 
  initialSchema 
}) => {
  const [state, dispatch] = useReducer(appReducer, {
    ...initialState,
    schema: initialSchema || DEFAULT_DATABASE_SCHEMA
  });

  // Schema actions
  const loadSchema = useCallback((schema: DatabaseSchema) => {
    dispatch({ type: 'LOAD_SCHEMA', payload: schema });
  }, []);

  // Watch for changes to initialSchema and update the state
  useEffect(() => {
    if (initialSchema) {
      loadSchema(initialSchema);
    }
  }, [initialSchema, loadSchema]);

  const updateTable = useCallback((id: string, updates: Partial<Table>) => {
    dispatch({ type: 'UPDATE_TABLE', payload: { id, updates } });
  }, []);

  const updateReference = useCallback((id: string, updates: Partial<Reference>) => {
    dispatch({ type: 'UPDATE_REFERENCE', payload: { id, updates } });
  }, []);

  const addAnnotation = useCallback((annotation: Annotation) => {
    dispatch({ type: 'ADD_ANNOTATION', payload: annotation });
  }, []);

  const updateAnnotation = useCallback((id: string, updates: Partial<Annotation>) => {
    dispatch({ type: 'UPDATE_ANNOTATION', payload: { id, updates } });
  }, []);

  const deleteAnnotation = useCallback((id: string) => {
    dispatch({ type: 'DELETE_ANNOTATION', payload: id });
  }, []);

  const updateSettings = useCallback((settings: Partial<DiagramSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  }, []);

  // UI actions
  const setViewport = useCallback((viewport: ViewportState) => {
    dispatch({ type: 'SET_VIEWPORT', payload: viewport });
  }, []);

  const selectItems = useCallback((items: string[]) => {
    dispatch({ type: 'SELECT_ITEMS', payload: items });
  }, []);

  const selectItem = useCallback((id: string, multiSelect = false) => {
    if (multiSelect) {
      const currentSelection = state.ui.selectedItems;
      const isSelected = currentSelection.includes(id);
      
      if (isSelected) {
        // Remove from selection
        selectItems(currentSelection.filter(item => item !== id));
      } else {
        // Add to selection
        selectItems([...currentSelection, id]);
      }
    } else {
      // Single select
      selectItems([id]);
    }
  }, [state.ui.selectedItems, selectItems]);

  const clearSelection = useCallback(() => {
    selectItems([]);
  }, [selectItems]);

  const setDragState = useCallback((dragState: DragState | null) => {
    dispatch({ type: 'SET_DRAG_STATE', payload: dragState });
  }, []);

  const setActiveTool = useCallback((tool: Partial<ActiveTools>) => {
    dispatch({ type: 'SET_ACTIVE_TOOL', payload: tool });
  }, []);

  const setUnsavedChanges = useCallback((hasChanges: boolean) => {
    dispatch({ type: 'SET_UNSAVED_CHANGES', payload: hasChanges });
  }, []);

  // Utility functions
  const getSelectedTables = useCallback((): Table[] => {
    return state.schema.tables.filter(table => 
      state.ui.selectedItems.includes(table.id)
    );
  }, [state.schema.tables, state.ui.selectedItems]);

  const getSelectedReferences = useCallback((): Reference[] => {
    return state.schema.references.filter(ref => 
      state.ui.selectedItems.includes(ref.id)
    );
  }, [state.schema.references, state.ui.selectedItems]);

  const getSelectedAnnotations = useCallback((): Annotation[] => {
    return state.schema.annotations.filter(annotation => 
      state.ui.selectedItems.includes(annotation.id)
    );
  }, [state.schema.annotations, state.ui.selectedItems]);

  const isItemSelected = useCallback((id: string): boolean => {
    return state.ui.selectedItems.includes(id);
  }, [state.ui.selectedItems]);

  const hasUnsavedChanges = useCallback((): boolean => {
    return state.ui.unsavedChanges;
  }, [state.ui.unsavedChanges]);

  // Hierarchical column operations
  const setNestingLevel = useCallback((level: number | undefined) => {
    updateSettings({ maxNestingLevel: level });
  }, [updateSettings]);

  const toggleHierarchicalView = useCallback((enabled: boolean) => {
    updateSettings({ showHierarchical: enabled });
  }, [updateSettings]);

  const getCurrentNestingLevel = useCallback((): number | undefined => {
    return state.schema.settings.maxNestingLevel;
  }, [state.schema.settings.maxNestingLevel]);

  const isHierarchicalViewEnabled = useCallback((): boolean => {
    return state.schema.settings.showHierarchical !== false;
  }, [state.schema.settings.showHierarchical]);

  // Auto-save effect
  useEffect(() => {
    if (state.file.autoSaveEnabled && state.ui.unsavedChanges) {
      // Auto-save logic would go here
      // For now, we'll just log that auto-save would trigger
      console.log('Auto-save would trigger here');
    }
  }, [state.file.autoSaveEnabled, state.ui.unsavedChanges]);

  const contextValue: AppContextType = {
    state,
    dispatch,
    
    // Schema actions
    loadSchema,
    updateTable,
    updateReference,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation,
    updateSettings,
    
    // UI actions
    setViewport,
    selectItems,
    selectItem,
    clearSelection,
    setDragState,
    setActiveTool,
    setUnsavedChanges,
    
    // Utility functions
    getSelectedTables,
    getSelectedReferences,
    getSelectedAnnotations,
    isItemSelected,
    hasUnsavedChanges,
    
    // Hierarchical column operations
    setNestingLevel,
    toggleHierarchicalView,
    getCurrentNestingLevel,
    isHierarchicalViewEnabled
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Hook to use the context
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

// Selector hooks for specific parts of the state
export const useSchema = () => {
  const { state } = useAppContext();
  return state.schema;
};

export const useTables = () => {
  const { state } = useAppContext();
  return state.schema.tables;
};

export const useReferences = () => {
  const { state } = useAppContext();
  return state.schema.references;
};

export const useAnnotations = () => {
  const { state } = useAppContext();
  return state.schema.annotations;
};

export const useSettings = () => {
  const { state } = useAppContext();
  return state.schema.settings;
};

export const useViewport = () => {
  const { state } = useAppContext();
  return state.ui.viewport;
};

export const useSelection = () => {
  const { state } = useAppContext();
  return state.ui.selectedItems;
};

export const useActiveTools = () => {
  const { state } = useAppContext();
  return state.ui.activeTools;
};

export const useDragState = () => {
  const { state } = useAppContext();
  return state.ui.dragState;
};

export const useFileState = () => {
  const { state } = useAppContext();
  return state.file;
};