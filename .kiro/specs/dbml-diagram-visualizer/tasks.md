# Implementation Plan

- [x] 1. Enhance core data models and type definitions
  - Update existing types/database.ts with enhanced interfaces including Column.id, Table.size, Reference styling, Annotation, DiagramSettings, and DatabaseSchema metadata
  - Add comprehensive TypeScript interfaces for state management, layout algorithms, and error handling
  - Create utility types for component props and event handlers
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 8.1, 9.1, 10.1_

- [x] 2. Implement enhanced DBML parser with error handling
  - Extend existing parsers/dbmlParser.ts to handle complete DBML syntax including enums, indexes, and table groups
  - Add comprehensive error recovery and detailed error reporting with line numbers and suggestions
  - Implement incremental parsing support for performance optimization
  - Create validation pipeline with ParseResult interface returning errors, warnings, and metadata
  - Write unit tests for parser edge cases and error scenarios
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 3. Create DBML generator for saving functionality
  - Implement DBMLGenerator class that converts DatabaseSchema back to valid DBML syntax
  - Add support for preserving custom styling as DBML comments or metadata
  - Implement proper formatting and indentation for generated DBML
  - Create validation to ensure round-trip accuracy (parse -> generate -> parse)
  - Write unit tests for DBML generation with various schema configurations
  - _Requirements: 7.2, 7.3, 7.4_

- [x] 4. Implement application state management system
  - Create React Context and useReducer setup for complex state operations
  - Implement AppState interface with schema, ui, and file management sections
  - Add action creators and reducers for all state mutations
  - Create custom hooks for accessing and updating specific state slices
  - Implement change tracking system for unsaved changes detection
  - Write unit tests for state management logic
  - _Requirements: 7.1, 7.5, 7.6_

- [x] 5. Build SVG-based canvas system with viewport management
  - Replace existing canvas-based DiagramCanvas with SVG implementation
  - Implement ViewportManager for zoom, pan, and coordinate transformations
  - Add GridSystem component with optional grid overlay and snap-to-grid functionality
  - Create SelectionManager for multi-select and selection rectangle handling
  - Implement smooth zoom and pan interactions with performance optimization
  - Write integration tests for canvas interactions
  - _Requirements: 2.1, 2.3, 2.5_

- [ ] 6. Enhance TableNode component with advanced features
  - Extend existing TableNode to support table resizing with drag handles
  - Add column collapsing/expanding functionality for large tables
  - Implement enhanced column display with type icons and constraint indicators
  - Add tooltip system for displaying column metadata on hover
  - Create table styling controls with color picker integration
  - Write component tests for table interactions and visual states
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 5.1, 5.2_

- [ ] 7. Implement advanced relationship rendering system
  - Create RelationshipRenderer component using SVG paths for scalable relationship lines
  - Implement RelationshipRouter for smart path routing that avoids table overlaps
  - Add support for different relationship types with distinct visual styles (solid, dashed, dotted)
  - Create dynamic connection point calculation system for optimal line attachment
  - Add relationship hover effects with table highlighting and detail tooltips
  - Write tests for relationship rendering and path calculation algorithms
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.3_

- [ ] 8. Create annotation system for documentation
  - Implement AnnotationLayer component as overlay for text and shape annotations
  - Create TextAnnotation component with rich text editing and formatting options
  - Add ShapeAnnotation component for basic shapes (rectangles, circles, arrows)
  - Implement AnnotationEditor with inline editing interface and styling controls
  - Add z-index management for annotation layering and visibility control
  - Create context menu system for adding annotations via right-click
  - Write component tests for annotation creation, editing, and positioning
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 9. Implement automatic layout algorithms
  - Create LayoutManager class to coordinate different layout algorithms
  - Implement ForceDirectedLayout using physics-based simulation for automatic arrangement
  - Add HierarchicalLayout for tree-like arrangement of hierarchical database structures
  - Create CircularLayout for circular arrangement optimized for relationship visualization
  - Implement layout options interface with spacing, bounds, and optimization settings
  - Add layout metrics calculation for overlap count, crossing count, and path length optimization
  - Write unit tests for layout algorithm correctness and performance
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 10. Build comprehensive export system
  - Implement SVGExporter for native SVG export with embedded styles and metadata
  - Create PNGExporter using SVG-to-canvas conversion for high-quality raster export
  - Add ExportDialog component with resolution, dimensions, and quality settings
  - Implement export progress feedback for large diagrams with async processing
  - Add batch export functionality for multiple format generation
  - Create export validation to ensure output quality and completeness
  - Write integration tests for export functionality across different diagram sizes
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 11. Implement file operations and persistence system
  - Create FileManager class with File System Access API and traditional file handling fallback
  - Add auto-save functionality with configurable intervals and change detection
  - Implement file validation and corruption detection before processing
  - Create backup system with automatic backups before destructive operations
  - Add recent files management and file history tracking
  - Implement unsaved changes warning system with save/discard prompts
  - Write integration tests for file operations and data persistence
  - _Requirements: 1.1, 7.1, 7.5, 7.6_

- [ ] 12. Create theme system and visual customization
  - Implement theme provider with light, dark, and custom theme support
  - Create color picker components for table and relationship customization
  - Add predefined color schemes and theme templates for quick styling
  - Implement accessibility-compliant color contrast validation
  - Create theme persistence system to maintain user preferences across sessions
  - Add CSS-in-JS styling system with theme variable support
  - Write visual regression tests for theme consistency across components
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 13. Optimize performance for large schemas
  - Implement virtualization system to render only visible elements in viewport
  - Add efficient algorithms for relationship path calculation and collision detection
  - Create memory management system with cleanup for unused components
  - Implement progressive loading for large DBML files with progress indicators
  - Add performance monitoring and metrics collection for frame rate and memory usage
  - Create async processing system for non-blocking operations during user interactions
  - Write performance tests for 100+ table schemas and interaction responsiveness
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 14. Add comprehensive error handling and validation
  - Implement graceful degradation system for non-critical feature failures
  - Create user-friendly error messaging with actionable solutions and recovery options
  - Add state recovery system for automatic recovery from invalid application states
  - Implement validation pipeline for all user inputs and file operations
  - Create error boundary components for React error handling and fallback UI
  - Add logging system for debugging and error tracking
  - Write error handling tests for various failure scenarios
  - _Requirements: 1.2, 1.4, 7.6, 8.4_

- [ ] 15. Create comprehensive test suite
  - Write unit tests for all utility functions, parsers, and layout algorithms
  - Create component tests using React Testing Library for all UI components
  - Implement integration tests for complete user workflows (import, edit, export)
  - Add visual regression tests for diagram rendering and export output quality
  - Create performance tests for large schema handling and interaction responsiveness
  - Implement cross-browser compatibility tests for major browsers
  - Add accessibility tests for keyboard navigation and screen reader support
  - _Requirements: All requirements for comprehensive coverage_

- [ ] 16. Integrate all systems and create main application
  - Update main App.tsx to integrate all new systems and components
  - Create application toolbar with file operations, layout controls, and export options
  - Implement keyboard shortcuts for common operations and accessibility
  - Add application settings panel for user preferences and configuration
  - Create help system with tooltips, documentation, and user guides
  - Implement responsive design for different screen sizes and orientations
  - Write end-to-end tests for complete application workflows
  - _Requirements: All requirements integrated into cohesive application_


## Enhancement Tasks

- [ ] 17. Enhance relationship line visibility and styling
  - Improve RelationshipRenderer to draw more prominent relationship lines
  - Add configurable line thickness and opacity settings
  - Implement relationship line highlighting on hover with increased thickness
  - Add relationship labels showing cardinality (1:1, 1:N, N:M) on lines
  - Create visual indicators for relationship direction (arrows, crow's feet notation)
  - Add option to show/hide relationship names on lines
  - Implement curved lines option for better visual separation
  - Add relationship line color coding based on relationship type or table groups
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 18. Implement star schema layout algorithm
  - Create StarSchemaLayout algorithm specifically for data warehouse schemas
  - Identify fact tables (tables with many foreign keys) as central entities
  - Position fact tables in the center of the canvas
  - Arrange dimension tables in a radial pattern around their related fact tables
  - Calculate optimal angles to minimize relationship line crossings
  - Implement grouping of dimensions by their fact table relationships
  - Add spacing controls for radial distance from center
  - Support multiple fact tables with separate star patterns
  - Optimize layout for schemas with shared dimensions across multiple facts
  - Add animation for smooth transition when applying star schema layout
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 19. Add table minimization and compact view mode
  - Implement table collapse/expand toggle in TableNode component
  - Create "Minimize All" button in toolbar to collapse all tables simultaneously
  - Add "Expand All" button to restore full table view
  - Design compact table view showing only table name and icon
  - Maintain relationship lines visibility in minimized mode
  - Add visual indicator (icon or badge) showing number of columns when minimized
  - Implement smooth animation for minimize/expand transitions
  - Preserve table selection state during minimize/expand operations
  - Add keyboard shortcut (e.g., Ctrl+M) for quick minimize/expand toggle
  - Store minimize state in table metadata for persistence
  - Create "Compact Mode" setting to default all new tables to minimized state
  - Add tooltip on minimized tables showing column count and primary key info
  - Optimize rendering performance for large schemas in minimized mode
  - _Requirements: 3.5, 10.2, 10.3_

- [ ] 20. Implement relationship-focused visualization mode
  - Create "Relationship View" mode that emphasizes connections over table details
  - Automatically minimize all tables when entering relationship view mode
  - Increase relationship line thickness and visibility in this mode
  - Add relationship statistics overlay (total relationships, types breakdown)
  - Implement relationship filtering by type (1:1, 1:N, N:M)
  - Add relationship path highlighting to show connection chains
  - Create relationship legend showing line styles and their meanings
  - Implement "Show only selected relationships" filter
  - Add relationship search/filter by table name
  - Optimize layout algorithm for relationship clarity in this mode
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 21. Add visual enhancements for better schema understanding
  - Implement table grouping with visual containers or background colors
  - Add badges or icons to distinguish fact vs dimension tables
  - Create visual indicators for table size (number of columns)
  - Implement relationship strength visualization (line thickness based on usage)
  - Add table importance indicators based on number of relationships
  - Create color-coding system for table types (fact, dimension, bridge, etc.)
  - Implement visual hierarchy with different table sizes based on importance
  - Add schema overview minimap for large diagrams
  - Create breadcrumb navigation for complex relationship paths
  - Implement table clustering visualization for related table groups
  - _Requirements: 3.1, 3.2, 4.1, 4.2, 5.1_

- [ ] 22. Implement context menu system for table interactions
  - Create ContextMenu component with positioning logic at cursor location
  - Add right-click event handler to TableNode component
  - Implement context menu state management (visible, position, target table)
  - Create menu options interface with labels, icons, actions, and disabled states
  - Add "Create Relationship" option to context menu
  - Implement menu item click handlers and action dispatching
  - Add keyboard support (Escape to close, arrow keys for navigation)
  - Create visual styling for context menu with hover effects
  - Implement click-outside detection to close menu
  - Add separator support for grouping menu items
  - _Requirements: 11.1, 11.2_

- [ ] 23. Create relationship creation dialog component
  - Implement RelationshipDialog modal component with form layout
  - Create dialog state management for open/close and form data
  - Add source table display (read-only, pre-populated from context)
  - Implement ColumnSelector dropdown component for source column selection
  - Create TableSelector dropdown component for destination table selection
  - Add ColumnSelector for destination column (populated after table selection)
  - Implement RelationshipTypeSelector with radio buttons or dropdown (1:1, 1:N, N:1)
  - Add optional fields for relationship name and ON DELETE/UPDATE actions
  - Create form validation logic for required fields
  - Implement confirm/cancel button handlers
  - Add loading state during DBML update
  - Create success/error feedback messages
  - _Requirements: 11.2, 11.3, 11.4, 11.5, 11.6, 11.11, 11.12_

- [ ] 24. Implement dropdown components for relationship configuration
  - Create reusable Dropdown component with search/filter functionality
  - Implement ColumnSelector with column name, type, and constraint display
  - Add visual indicators for primary keys (🔑) and foreign keys (🔗) in dropdowns
  - Create TableSelector with table name and schema display
  - Add table preview on hover in TableSelector
  - Implement filtering logic to exclude source table from destination options
  - Add disabled state styling for invalid selections
  - Create empty state messages for dropdowns with no options
  - Implement keyboard navigation (arrow keys, Enter to select)
  - Add accessibility attributes (ARIA labels, roles)
  - _Requirements: 11.3, 11.4, 11.5_

- [ ] 25. Build DBML reference generator and editor integration
  - Create DBMLReferenceGenerator utility class
  - Implement generateReference method to create DBML syntax from RelationshipConfig
  - Add support for different relationship type syntax (>, <, -, <>)
  - Implement insertReference method to append reference to DBML content
  - Add logic to find appropriate insertion point (after table definitions)
  - Create validateReference method to check for duplicates and conflicts
  - Implement type compatibility checking between source and destination columns
  - Add warning system for potential issues (type mismatches, missing indexes)
  - Create integration with DBMLEditor component to update source code
  - Implement trigger for re-parsing DBML after update
  - Add error handling for DBML generation and insertion failures
  - _Requirements: 11.7, 11.8, 11.9, 11.10_

- [ ] 26. Integrate relationship creation with diagram state
  - Add createRelationship action to state management system
  - Implement relationship creation workflow in app context
  - Create handler to open dialog from context menu
  - Add logic to pass source table data to dialog
  - Implement confirmation handler to process form submission
  - Add relationship to diagram state after DBML update
  - Trigger diagram re-render with new relationship line
  - Implement undo/redo support for relationship creation
  - Add change tracking to mark diagram as modified
  - Create success notification after relationship creation
  - Implement error handling and rollback on failure
  - _Requirements: 11.7, 11.8, 11.9, 11.10_

- [ ] 27. Add validation and error handling for relationship creation
  - Implement form validation for all required fields
  - Add real-time validation feedback in dialog
  - Create duplicate relationship detection
  - Implement column type compatibility checking
  - Add warning for relationships without indexes
  - Create validation for circular dependencies
  - Implement constraint validation (ON DELETE/UPDATE options)
  - Add error messages for DBML generation failures
  - Create recovery options for failed relationship creation
  - Implement validation summary display in dialog
  - Add accessibility-compliant error announcements
  - _Requirements: 11.11_

- [ ] 28. Implement UI/UX enhancements for relationship creation
  - Add keyboard shortcuts for dialog (Enter to confirm, Escape to cancel)
  - Implement tab navigation through form fields
  - Create loading spinner during DBML update
  - Add smooth dialog open/close animations
  - Implement relationship preview in dialog (visual representation)
  - Create tooltip help text for each form field
  - Add "Recent relationships" quick selection option
  - Implement "Suggest relationship" feature based on column names
  - Create relationship templates for common patterns
  - Add confirmation dialog for potentially problematic relationships
  - Implement responsive dialog layout for different screen sizes
  - _Requirements: 11.2, 11.3, 11.4, 11.5, 11.6, 11.12_
