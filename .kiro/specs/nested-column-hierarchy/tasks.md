# Implementation Plan - Nested Column Hierarchy

- [ ] 1. Create core hierarchy data structures and utilities
  - Create `ColumnHierarchyNode` interface in types/database.ts
  - Create `HierarchyState` interface
  - Add `columnHierarchy` and `hasNestedColumns` properties to Table interface
  - Create utility functions for path parsing and validation
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 2. Implement ColumnHierarchyBuilder class
  - Create `src/utils/columnHierarchyBuilder.ts`
  - Implement `buildHierarchy()` method to transform flat columns into tree
  - Implement `parseColumnPath()` to split column names on dots
  - Implement `insertIntoHierarchy()` to build tree structure recursively
  - Handle array notation (e.g., `crewmember[]`)
  - Calculate childCount and descendantCount for each node
  - Add unit tests for hierarchy building logic
  - _Requirements: 1.1, 1.2, 1.3, 1.5_

- [ ] 3. Implement HierarchyStateManager class
  - Create `src/utils/hierarchyStateManager.ts`
  - Implement state management for expansion states
  - Implement `setGlobalNestingLevel()` method
  - Implement `toggleNode()` method for individual node expansion
  - Implement `isNodeExpanded()` to check expansion state
  - Implement `saveState()` and `loadState()` for localStorage persistence
  - Add methods to calculate max nesting depth
  - _Requirements: 3.1, 3.2, 3.3, 8.1, 8.2_

- [ ] 4. Integrate hierarchy building into DBML parser
  - Update parseDBML() to call ColumnHierarchyBuilder after parsing tables
  - Add hierarchy metadata to each Table object
  - Detect tables with nested columns and set hasNestedColumns flag
  - Calculate maxColumnDepth for each table
  - Ensure backward compatibility (hierarchy is optional)
  - _Requirements: 1.1, 1.4_

- [ ] 5. Add hierarchy state to application context
  - Update AppContext to include HierarchyStateManager instance
  - Add actions for toggling nodes and changing global level
  - Create custom hooks: useHierarchyState, useNodeExpansion
  - Initialize hierarchy state on app load
  - Load saved preferences from localStorage
  - _Requirements: 8.1, 8.2, 8.3_

- [ ] 6. Enhance TableNode component for hierarchical rendering
  - Add hierarchyState prop to TableNode
  - Create renderColumnHierarchy() function for recursive rendering
  - Implement indentation based on nesting level (16px per level)
  - Add expand/collapse indicators (▶/▼) for parent nodes
  - Show child count badge next to parent nodes
  - Handle both flat and hierarchical rendering modes
  - Ensure proper spacing and alignment
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [ ] 7. Implement expand/collapse interaction
  - Add click handlers for expand/collapse indicators
  - Call HierarchyStateManager.toggleNode() on click
  - Trigger re-render to show/hide children
  - Add smooth CSS transitions for expand/collapse (200ms)
  - Prevent event propagation to avoid table selection
  - Update expansion state in context
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 8. Create NestingLevelControl component for toolbar
  - Create `src/components/NestingLevelControl.tsx`
  - Add increment/decrement buttons for nesting level
  - Add "All" button to expand everything
  - Add "None" button to collapse everything
  - Display current level (0, 1, 2, ... or "All")
  - Add tooltips explaining each control
  - Style to match existing toolbar components
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 9. Integrate NestingLevelControl into Toolbar
  - Update Toolbar component to include NestingLevelControl
  - Position control near other view options
  - Show/hide based on whether any table has nested columns
  - Connect to HierarchyStateManager via context
  - Handle onChange events to update global level
  - Apply changes to all tables in diagram
  - _Requirements: 4.1, 4.5, 4.6_

- [ ] 10. Implement visual styling for hierarchy
  - Add CSS for indentation and nesting levels
  - Style parent nodes (bold text, distinct color)
  - Style leaf nodes (normal column appearance)
  - Add hover effects for parent nodes
  - Add connecting lines or guides (optional)
  - Style expand/collapse indicators
  - Add collapsed state indicator (subtle badge or icon)
  - Ensure dark theme compatibility
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 11. Update tooltip integration for nested columns
  - Modify tooltip to show full column path for nested columns
  - Display path as breadcrumb (e.g., "maintenance > oTSData > bump")
  - Show nesting level in tooltip
  - Ensure tooltips work for both parent and leaf nodes
  - Parent node tooltips show summary of children
  - _Requirements: 6.1_

- [ ] 12. Implement state persistence
  - Save expansion states to localStorage on change
  - Save global nesting level preference
  - Load saved state on app initialization
  - Handle migration from old state format (if needed)
  - Add reset option to clear saved preferences
  - Debounce save operations to avoid excessive writes
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 13. Add performance optimizations
  - Memoize hierarchy building with useMemo
  - Use React.memo for ColumnHierarchyNode components
  - Implement lazy rendering (don't render collapsed children)
  - Add virtual scrolling for tables with 1000+ columns
  - Cache calculated node positions
  - Batch state updates to minimize re-renders
  - Profile and optimize hot paths
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 14. Add keyboard navigation support
  - Arrow keys to navigate between nodes
  - Enter/Space to toggle expansion
  - Tab to move between tables
  - Escape to collapse all in current table
  - Add focus indicators for keyboard navigation
  - Ensure accessibility with ARIA attributes
  - _Requirements: Accessibility (non-functional)_

- [ ] 15. Integrate with search functionality
  - Auto-expand parent nodes when search matches nested column
  - Highlight matching nodes in hierarchy
  - Collapse non-matching branches
  - Add "expand all matches" option
  - Preserve expansion state after search clear
  - _Requirements: 6.3_

- [ ] 16. Update relationship creation dialog
  - Show full column path in source/destination dropdowns
  - Group nested columns under parent nodes in dropdowns
  - Add breadcrumb display for selected columns
  - Ensure relationship lines connect to correct nested columns
  - _Requirements: 6.4_

- [ ] 17. Add export support for hierarchy
  - Preserve expansion state in PNG/SVG exports
  - Option to export fully expanded or current state
  - Include hierarchy structure in JSON export
  - Add metadata about nesting levels to exports
  - _Requirements: 6.5_

- [ ] 18. Create comprehensive test suite
  - Unit tests for ColumnHierarchyBuilder
  - Unit tests for HierarchyStateManager
  - Integration tests for full workflow
  - Visual regression tests for hierarchy rendering
  - Performance tests for large hierarchies (1000+ columns)
  - Test edge cases: no nesting, single level, deep nesting (10+ levels)
  - Test array notation handling
  - Test state persistence and restoration
  - _Requirements: All requirements for comprehensive coverage_

- [ ] 19. Add user documentation
  - Create user guide for nested column feature
  - Add examples showing different nesting patterns
  - Document keyboard shortcuts
  - Add troubleshooting section
  - Create animated GIFs showing feature in action
  - Update main README with feature description
  - _Requirements: Usability (non-functional)_

- [ ] 20. Add configuration options
  - Add setting to enable/disable hierarchy feature
  - Add setting for default nesting level
  - Add setting for indentation size
  - Add setting for expand/collapse animation speed
  - Add setting for maximum visible nesting depth
  - Store settings in user preferences
  - _Requirements: Compatibility (non-functional)_

## Optional Enhancements

- [ ] 21. Add advanced hierarchy features
  - Custom grouping rules (not just dots)
  - Drag-and-drop to reorganize hierarchy
  - Collapse all siblings when expanding one
  - Breadcrumb navigation for deep nesting
  - Mini-map showing hierarchy structure
  - Export hierarchy as JSON/YAML
  - Color-coding by nesting level
  - Search within specific parent node
  - _Requirements: Future enhancements_
