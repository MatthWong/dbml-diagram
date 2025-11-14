# Drag and Drop Feature Guide

## Overview
Tables in the DBML diagram can now be dragged and repositioned on the canvas. Relationship arrows automatically follow the tables and maintain their connections.

## How to Use

### Dragging Tables
1. **Click and hold** on any table (header or body area)
2. **Drag** the table to the desired position
3. **Release** the mouse button to drop the table

### Visual Feedback
- **Cursor changes** to a "move" cursor when hovering over tables
- **Cursor changes** to "grabbing" while dragging
- **Shadow effect** appears during drag for better visual feedback
- **Opacity** slightly reduces during drag to show movement

### Relationship Arrows
- **Automatically follow** table positions during drag
- **Connect to specific columns** when tables are expanded
- **Connect to table header** when tables are collapsed
- **Maintain connections** throughout the drag operation

## Collapsed vs Expanded Tables

### Expanded Tables
When a table is expanded (showing all columns):
- Relationship arrows connect to the **specific column** involved in the relationship
- Arrows point to the exact row of the foreign key or primary key column

### Collapsed Tables
When a table is collapsed (only showing the header):
- Relationship arrows connect to the **center of the table header**
- This provides a cleaner view when you want to see the overall schema structure
- Click the **▼** icon in the table header to collapse
- Click the **▶** icon to expand again

## Grid Snapping
If grid snapping is enabled in the settings:
- Tables will snap to the nearest grid point when dropped
- This helps maintain alignment and organization
- Grid size can be configured in the settings

## Multi-Selection (Coming Soon)
Future enhancement will allow:
- Selecting multiple tables
- Dragging them together as a group
- Maintaining relative positions

## Keyboard Shortcuts
- **Escape**: Clear selection and cancel drag
- **Ctrl/Cmd + Click**: Multi-select tables (selection only, drag coming soon)

## Tips
1. **Organize your schema** by dragging related tables close together
2. **Collapse tables** to see the high-level structure and reduce clutter
3. **Use grid snapping** for a cleaner, more organized layout
4. **Zoom in/out** (Ctrl/Cmd + Mouse Wheel) for better precision when positioning

## Technical Details
- Drag operations respect the current zoom level
- Position updates are smooth and responsive
- Relationship paths are recalculated in real-time
- All changes are maintained in the application state
