# Requirements Document - Nested Column Hierarchy

## Introduction

This feature will transform flat column names with dot notation (e.g., `maintenance.oTSData.bump`) into a hierarchical, collapsible tree structure within table displays. This will significantly improve readability for schemas with deeply nested JSON/object structures.

## Glossary

- **Nested Column**: A column whose name contains dots (`.`), indicating a hierarchical path
- **Nesting Level**: The depth of nesting, counted by the number of dots in the column name
- **Parent Node**: A non-leaf node in the hierarchy that contains child nodes
- **Leaf Node**: The final column in a nested path that contains the actual data type
- **Expansion State**: Whether a parent node is expanded (showing children) or collapsed (hiding children)

## Requirements

### Requirement 1: Column Name Parsing and Hierarchy Detection

**User Story:** As a database designer, I want column names with dots to be automatically recognized as nested structures, so that I can see the hierarchical organization of my data.

#### Acceptance Criteria

1. WHEN a table contains columns with dot notation THEN the system SHALL parse the column names into a hierarchical tree structure
2. WHEN parsing column names THEN the system SHALL split on the dot (`.`) character to determine nesting levels
3. WHEN multiple columns share a common prefix THEN the system SHALL group them under a common parent node
4. WHEN a column has no dots THEN the system SHALL treat it as a top-level column with no nesting
5. WHEN building the hierarchy THEN the system SHALL preserve the original column order within each nesting level
6. WHEN a field name ends with `[]` THEN the system SHALL treat the parent node data type as an array
7. WHEN a field name does not end with `[]` THEN the system SHALL treat the parent node data type as an object

### Requirement 2: Hierarchical Display in Table View

**User Story:** As a database designer, I want to see nested columns displayed in a tree structure with indentation, so that I can understand the data organization at a glance.

#### Acceptance Criteria

1. WHEN displaying a table with nested columns THEN the system SHALL render parent nodes with expand/collapse indicators
2. WHEN a parent node is collapsed THEN the system SHALL hide all child nodes beneath it
3. WHEN a parent node is expanded THEN the system SHALL show immediate child nodes with appropriate indentation
4. WHEN rendering nested columns THEN the system SHALL use visual indentation (e.g., 16px per level) to show hierarchy depth
5. WHEN displaying a parent node THEN the system SHALL show only the segment name (not the full path)
6. WHEN displaying a leaf node THEN the system SHALL show the column name, type, and constraints

### Requirement 3: Expand/Collapse Functionality

**User Story:** As a database designer, I want to expand and collapse nested column groups, so that I can focus on relevant parts of the schema and reduce visual clutter.

#### Acceptance Criteria

1. WHEN a user clicks on a parent node indicator THEN the system SHALL toggle the expansion state of that node
2. WHEN a parent node is collapsed THEN the system SHALL display a right-pointing arrow (▶) or plus icon (+)
3. WHEN a parent node is expanded THEN the system SHALL display a down-pointing arrow (▼) or minus icon (-)
4. WHEN a parent node has children THEN the system SHALL show a count badge indicating the number of direct children
5. WHEN toggling expansion state THEN the system SHALL animate the transition smoothly

### Requirement 4: Nesting Level Control in Toolbar

**User Story:** As a database designer, I want to control the default nesting level displayed for all tables, so that I can quickly adjust the level of detail shown across the entire diagram.

#### Acceptance Criteria

1. WHEN the toolbar is displayed THEN the system SHALL show a nesting level control with a numeric counter
2. WHEN the user adjusts the nesting level THEN the system SHALL expand/collapse all tables to show only nodes up to that level
3. WHEN the nesting level is set to 0 THEN the system SHALL show only top-level columns (all nested columns collapsed)
4. WHEN the nesting level is set to "All" or maximum THEN the system SHALL expand all nested columns completely
5. WHEN the user changes the nesting level THEN the system SHALL apply the change to all tables in the diagram
6. WHEN a table has no nesting deeper than the current level THEN the system SHALL display all its columns normally

### Requirement 5: Visual Indicators and Styling

**User Story:** As a database designer, I want clear visual indicators for nested structures, so that I can easily distinguish between parent nodes and leaf columns.

#### Acceptance Criteria

1. WHEN displaying a parent node THEN the system SHALL use a distinct style (e.g., bold text, different color)
2. WHEN displaying a leaf node THEN the system SHALL show the data type and constraints as normal columns
3. WHEN hovering over a parent node THEN the system SHALL highlight it to indicate interactivity
4. WHEN a parent node is collapsed THEN the system SHALL show a subtle indicator of hidden content
5. WHEN displaying nested columns THEN the system SHALL use connecting lines or indentation guides to show relationships

### Requirement 6: Interaction with Existing Features

**User Story:** As a database designer, I want nested column display to work seamlessly with existing features like tooltips and search, so that I maintain full functionality.

#### Acceptance Criteria

1. WHEN hovering over a nested column THEN the system SHALL display the tooltip with the full column path and note
2. WHEN a table is collapsed THEN the system SHALL maintain the nesting state when expanded again
3. WHEN searching for columns THEN the system SHALL automatically expand parent nodes to reveal matching nested columns
4. WHEN creating relationships THEN the system SHALL show the full column path in dropdowns
5. WHEN exporting the diagram THEN the system SHALL preserve the current expansion state in the visual output

### Requirement 7: Performance Optimization

**User Story:** As a database designer, I want nested column display to perform well with large tables, so that I can work efficiently with complex schemas.

#### Acceptance Criteria

1. WHEN a table has hundreds of nested columns THEN the system SHALL render the hierarchy within 100ms
2. WHEN toggling expansion state THEN the system SHALL update the display within 50ms
3. WHEN changing the global nesting level THEN the system SHALL update all tables within 500ms
4. WHEN building the hierarchy THEN the system SHALL use efficient algorithms to avoid redundant processing
5. WHEN rendering collapsed nodes THEN the system SHALL not render hidden child nodes to improve performance

### Requirement 8: State Persistence

**User Story:** As a database designer, I want my expansion state preferences to be remembered, so that I don't have to reconfigure the view each time I open the diagram.

#### Acceptance Criteria

1. WHEN a user expands or collapses a node THEN the system SHALL save the expansion state
2. WHEN a user sets a global nesting level THEN the system SHALL remember this preference
3. WHEN reopening the diagram THEN the system SHALL restore the previous expansion states
4. WHEN loading a new DBML file THEN the system SHALL apply the saved global nesting level preference
5. WHEN resetting preferences THEN the system SHALL provide an option to expand all or collapse all

## Example Scenarios

### Scenario 1: Simple Nesting
**Input:**
```
maintenance.key.airlineCode
maintenance.key.registration
maintenance.key.tailNumber
```

**Display (Level 0):**
```
▶ maintenance (3)
```

**Display (Level 1):**
```
▼ maintenance
  ▶ key (3)
```

**Display (Level 2 or All):**
```
▼ maintenance
  ▼ key
    airlineCode string
    registration string
    tailNumber string
```

### Scenario 2: Mixed Nesting Depths
**Input:**
```
_id ObjectId
maintenance.key.airlineCode
maintenance.oTSData.bump
maintenance.oTSData.eRTSTime.code
maintenance.oTSData.eRTSTime.value
```

**Display (Level 1):**
```
_id ObjectId
▼ maintenance
  ▶ key (1)
  ▶ oTSData (3)
```

**Display (Level 2):**
```
_id ObjectId
▼ maintenance
  ▼ key
    airlineCode string
  ▼ oTSData
    bump string
    ▶ eRTSTime (2)
```

### Scenario 3: Array Notation
**Input:**
```
flight.crewData.crewmember[].empNum
flight.crewData.crewmember[].firstName
```

**Display:**
```
▼ flight (object)
  ▼ crewData (object)
    ▼ crewmember[] (array)
      empNum string
      firstName string
```

**Type Indicators:**
- `flight` → object (children don't have [])
- `crewData` → object (children don't have [])
- `crewmember[]` → array (name ends with [])

## Non-Functional Requirements

### Usability
- Expansion/collapse should be intuitive and discoverable
- Visual hierarchy should be clear and easy to follow
- Nesting level control should be easily accessible

### Performance
- Hierarchy building should not noticeably slow down diagram loading
- Expansion/collapse should feel instant (<50ms)
- Large tables (1000+ columns) should remain responsive

### Compatibility
- Should work with all existing DBML syntax
- Should not break existing diagrams
- Should be optional (users can disable if desired)

### Accessibility
- Keyboard navigation for expand/collapse
- Screen reader support for hierarchy structure
- High contrast mode support for visual indicators
