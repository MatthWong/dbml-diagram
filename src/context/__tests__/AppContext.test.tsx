import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { AppProvider, useAppContext } from '../AppContext';
import { DatabaseSchema, Table, Reference, Annotation } from '../../types/database';
import { DEFAULT_DATABASE_SCHEMA } from '../../constants/defaults';

// Test wrapper component
const createWrapper = (initialSchema?: DatabaseSchema) => {
  return ({ children }: { children: React.ReactNode }) => (
    <AppProvider initialSchema={initialSchema}>
      {children}
    </AppProvider>
  );
};

describe('AppContext', () => {
  describe('Initial state', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useAppContext(), {
        wrapper: createWrapper()
      });

      expect(result.current.state.schema).toEqual(DEFAULT_DATABASE_SCHEMA);
      expect(result.current.state.ui.selectedItems).toEqual([]);
      expect(result.current.state.ui.unsavedChanges).toBe(false);
      expect(result.current.state.file.currentFile).toBeNull();
    });

    it('should initialize with provided schema', () => {
      const customSchema: DatabaseSchema = {
        ...DEFAULT_DATABASE_SCHEMA,
        tables: [{
          id: 'table_1',
          name: 'test_table',
          columns: [],
          position: { x: 0, y: 0 },
          size: { width: 200, height: 150 }
        }]
      };

      const { result } = renderHook(() => useAppContext(), {
        wrapper: createWrapper(customSchema)
      });

      expect(result.current.state.schema.tables).toHaveLength(1);
      expect(result.current.state.schema.tables[0].name).toBe('test_table');
    });
  });

  describe('Schema operations', () => {
    it('should load a new schema', () => {
      const { result } = renderHook(() => useAppContext(), {
        wrapper: createWrapper()
      });

      const newSchema: DatabaseSchema = {
        ...DEFAULT_DATABASE_SCHEMA,
        tables: [{
          id: 'table_1',
          name: 'users',
          columns: [],
          position: { x: 100, y: 100 },
          size: { width: 200, height: 150 }
        }]
      };

      act(() => {
        result.current.loadSchema(newSchema);
      });

      expect(result.current.state.schema.tables).toHaveLength(1);
      expect(result.current.state.schema.tables[0].name).toBe('users');
      expect(result.current.state.ui.selectedItems).toEqual([]);
      expect(result.current.state.ui.unsavedChanges).toBe(false);
    });

    it('should update a table', () => {
      const initialSchema: DatabaseSchema = {
        ...DEFAULT_DATABASE_SCHEMA,
        tables: [{
          id: 'table_1',
          name: 'users',
          columns: [],
          position: { x: 100, y: 100 },
          size: { width: 200, height: 150 }
        }]
      };

      const { result } = renderHook(() => useAppContext(), {
        wrapper: createWrapper(initialSchema)
      });

      act(() => {
        result.current.updateTable('table_1', {
          position: { x: 200, y: 200 },
          color: '#ff0000'
        });
      });

      const updatedTable = result.current.state.schema.tables[0];
      expect(updatedTable.position).toEqual({ x: 200, y: 200 });
      expect(updatedTable.color).toBe('#ff0000');
      expect(result.current.state.ui.unsavedChanges).toBe(true);
    });

    it('should update a reference', () => {
      const initialSchema: DatabaseSchema = {
        ...DEFAULT_DATABASE_SCHEMA,
        references: [{
          id: 'ref_1',
          fromTable: 'posts',
          fromColumn: 'user_id',
          toTable: 'users',
          toColumn: 'id',
          type: 'one-to-many'
        }]
      };

      const { result } = renderHook(() => useAppContext(), {
        wrapper: createWrapper(initialSchema)
      });

      act(() => {
        result.current.updateReference('ref_1', {
          color: '#00ff00',
          style: 'dashed'
        });
      });

      const updatedReference = result.current.state.schema.references[0];
      expect(updatedReference.color).toBe('#00ff00');
      expect(updatedReference.style).toBe('dashed');
      expect(result.current.state.ui.unsavedChanges).toBe(true);
    });

    it('should add an annotation', () => {
      const { result } = renderHook(() => useAppContext(), {
        wrapper: createWrapper()
      });

      const annotation: Annotation = {
        id: 'annotation_1',
        type: 'text',
        position: { x: 100, y: 100 },
        size: { width: 200, height: 100 },
        content: 'Test annotation',
        style: {
          backgroundColor: '#ffffff',
          textColor: '#000000'
        },
        zIndex: 1
      };

      act(() => {
        result.current.addAnnotation(annotation);
      });

      expect(result.current.state.schema.annotations).toHaveLength(1);
      expect(result.current.state.schema.annotations[0]).toEqual(annotation);
      expect(result.current.state.ui.unsavedChanges).toBe(true);
    });

    it('should update an annotation', () => {
      const initialSchema: DatabaseSchema = {
        ...DEFAULT_DATABASE_SCHEMA,
        annotations: [{
          id: 'annotation_1',
          type: 'text',
          position: { x: 100, y: 100 },
          size: { width: 200, height: 100 },
          content: 'Original content',
          style: {},
          zIndex: 1
        }]
      };

      const { result } = renderHook(() => useAppContext(), {
        wrapper: createWrapper(initialSchema)
      });

      act(() => {
        result.current.updateAnnotation('annotation_1', {
          content: 'Updated content',
          position: { x: 150, y: 150 }
        });
      });

      const updatedAnnotation = result.current.state.schema.annotations[0];
      expect(updatedAnnotation.content).toBe('Updated content');
      expect(updatedAnnotation.position).toEqual({ x: 150, y: 150 });
      expect(result.current.state.ui.unsavedChanges).toBe(true);
    });

    it('should delete an annotation', () => {
      const initialSchema: DatabaseSchema = {
        ...DEFAULT_DATABASE_SCHEMA,
        annotations: [{
          id: 'annotation_1',
          type: 'text',
          position: { x: 100, y: 100 },
          size: { width: 200, height: 100 },
          content: 'Test annotation',
          style: {},
          zIndex: 1
        }]
      };

      const { result } = renderHook(() => useAppContext(), {
        wrapper: createWrapper(initialSchema)
      });

      // First select the annotation
      act(() => {
        result.current.selectItems(['annotation_1']);
      });

      expect(result.current.state.ui.selectedItems).toContain('annotation_1');

      // Then delete it
      act(() => {
        result.current.deleteAnnotation('annotation_1');
      });

      expect(result.current.state.schema.annotations).toHaveLength(0);
      expect(result.current.state.ui.selectedItems).not.toContain('annotation_1');
      expect(result.current.state.ui.unsavedChanges).toBe(true);
    });

    it('should update settings', () => {
      const { result } = renderHook(() => useAppContext(), {
        wrapper: createWrapper()
      });

      act(() => {
        result.current.updateSettings({
          theme: 'dark',
          gridEnabled: false,
          showRelationshipLabels: false
        });
      });

      const settings = result.current.state.schema.settings;
      expect(settings.theme).toBe('dark');
      expect(settings.gridEnabled).toBe(false);
      expect(settings.showRelationshipLabels).toBe(false);
      expect(result.current.state.ui.unsavedChanges).toBe(true);
    });
  });

  describe('UI operations', () => {
    it('should set viewport', () => {
      const { result } = renderHook(() => useAppContext(), {
        wrapper: createWrapper()
      });

      const newViewport = {
        zoom: 1.5,
        pan: { x: 100, y: 200 },
        bounds: { width: 1000, height: 800 }
      };

      act(() => {
        result.current.setViewport(newViewport);
      });

      expect(result.current.state.ui.viewport).toEqual(newViewport);
    });

    it('should select items', () => {
      const { result } = renderHook(() => useAppContext(), {
        wrapper: createWrapper()
      });

      act(() => {
        result.current.selectItems(['table_1', 'table_2']);
      });

      expect(result.current.state.ui.selectedItems).toEqual(['table_1', 'table_2']);
    });

    it('should select single item', () => {
      const { result } = renderHook(() => useAppContext(), {
        wrapper: createWrapper()
      });

      act(() => {
        result.current.selectItem('table_1');
      });

      expect(result.current.state.ui.selectedItems).toEqual(['table_1']);
    });

    it('should handle multi-select', () => {
      const { result } = renderHook(() => useAppContext(), {
        wrapper: createWrapper()
      });

      // First selection
      act(() => {
        result.current.selectItem('table_1');
      });

      expect(result.current.state.ui.selectedItems).toEqual(['table_1']);

      // Multi-select add
      act(() => {
        result.current.selectItem('table_2', true);
      });

      expect(result.current.state.ui.selectedItems).toEqual(['table_1', 'table_2']);

      // Multi-select remove
      act(() => {
        result.current.selectItem('table_1', true);
      });

      expect(result.current.state.ui.selectedItems).toEqual(['table_2']);
    });

    it('should clear selection', () => {
      const { result } = renderHook(() => useAppContext(), {
        wrapper: createWrapper()
      });

      // First select some items
      act(() => {
        result.current.selectItems(['table_1', 'table_2']);
      });

      expect(result.current.state.ui.selectedItems).toHaveLength(2);

      // Then clear selection
      act(() => {
        result.current.clearSelection();
      });

      expect(result.current.state.ui.selectedItems).toEqual([]);
    });

    it('should set drag state', () => {
      const { result } = renderHook(() => useAppContext(), {
        wrapper: createWrapper()
      });

      const dragState = {
        isDragging: true,
        dragType: 'table' as const,
        startPosition: { x: 100, y: 100 },
        currentPosition: { x: 150, y: 150 },
        draggedItems: ['table_1']
      };

      act(() => {
        result.current.setDragState(dragState);
      });

      expect(result.current.state.ui.dragState).toEqual(dragState);

      // Clear drag state
      act(() => {
        result.current.setDragState(null);
      });

      expect(result.current.state.ui.dragState).toBeNull();
    });

    it('should set active tool', () => {
      const { result } = renderHook(() => useAppContext(), {
        wrapper: createWrapper()
      });

      act(() => {
        result.current.setActiveTool({
          selectedTool: 'annotate',
          isMultiSelectMode: true
        });
      });

      const activeTools = result.current.state.ui.activeTools;
      expect(activeTools.selectedTool).toBe('annotate');
      expect(activeTools.isMultiSelectMode).toBe(true);
    });

    it('should set unsaved changes', () => {
      const { result } = renderHook(() => useAppContext(), {
        wrapper: createWrapper()
      });

      act(() => {
        result.current.setUnsavedChanges(true);
      });

      expect(result.current.state.ui.unsavedChanges).toBe(true);

      act(() => {
        result.current.setUnsavedChanges(false);
      });

      expect(result.current.state.ui.unsavedChanges).toBe(false);
    });
  });

  describe('Utility functions', () => {
    it('should get selected tables', () => {
      const initialSchema: DatabaseSchema = {
        ...DEFAULT_DATABASE_SCHEMA,
        tables: [
          {
            id: 'table_1',
            name: 'users',
            columns: [],
            position: { x: 100, y: 100 },
            size: { width: 200, height: 150 }
          },
          {
            id: 'table_2',
            name: 'posts',
            columns: [],
            position: { x: 400, y: 100 },
            size: { width: 200, height: 150 }
          }
        ]
      };

      const { result } = renderHook(() => useAppContext(), {
        wrapper: createWrapper(initialSchema)
      });

      act(() => {
        result.current.selectItems(['table_1']);
      });

      const selectedTables = result.current.getSelectedTables();
      expect(selectedTables).toHaveLength(1);
      expect(selectedTables[0].name).toBe('users');
    });

    it('should check if item is selected', () => {
      const { result } = renderHook(() => useAppContext(), {
        wrapper: createWrapper()
      });

      act(() => {
        result.current.selectItems(['table_1']);
      });

      expect(result.current.isItemSelected('table_1')).toBe(true);
      expect(result.current.isItemSelected('table_2')).toBe(false);
    });

    it('should check if has unsaved changes', () => {
      const { result } = renderHook(() => useAppContext(), {
        wrapper: createWrapper()
      });

      expect(result.current.hasUnsavedChanges()).toBe(false);

      act(() => {
        result.current.setUnsavedChanges(true);
      });

      expect(result.current.hasUnsavedChanges()).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        renderHook(() => useAppContext());
      }).toThrow('useAppContext must be used within an AppProvider');

      console.error = originalError;
    });
  });
});