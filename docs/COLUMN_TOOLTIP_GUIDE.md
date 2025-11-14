# Column Tooltip Feature Guide

## Overview
Column notes are now displayed as tooltips when you hover over columns in the diagram. This feature helps you view detailed information about each column without cluttering the visual display.

## How It Works

### Viewing Column Notes
1. **Hover** your mouse over any column in a table
2. If the column has a `note` property in the DBML, a tooltip will appear
3. The tooltip shows:
   - Column name and type (in bold, blue header)
   - The full note content

### Visual Indicators
- Columns with notes show a **help cursor** (question mark) when you hover
- Columns without notes show the default cursor

### Tooltip Appearance
- **Position**: Appears to the right of the table
- **Styling**: 
  - Light theme: White background with dark text
  - Dark theme: Dark background with light text
- **Content**: 
  - Header shows column name and type
  - Body shows the note content
  - Supports multi-line notes
  - Word wrapping for long text

## Example

### DBML Code
```dbml
Table AircraftEventAnl {
    _id ObjectId [not null, pk, note: 'Sample values: "690cfbf7920706694e295639"']
    _class string [not null, note: 'Sample values: "com.aa.opshub.adapter.analytical.model.AircraftEventModel"']
    "aircraft.aircraftID.carrierCode" string [not null, note: 'Sample values: "AA", "TE", "MQ"']
}
```

### What You'll See
When you hover over the `_id` column:
- **Tooltip Header**: `_id (ObjectId)`
- **Tooltip Body**: `Sample values: "690cfbf7920706694e295639"`

## File Loading Priority

The application now tries to load DBML files in this order:
1. **raw_events.dbml** (first priority)
2. **flights.dbml** (fallback)
3. **Sample schema** (if neither file is found)

## Testing with raw_events.dbml

Your `raw_events.dbml` file has been configured to load automatically. It contains:
- **5 tables**: AircraftEventAnl, CrewEventAnl, FlightEventAnl, MaintenanceEventAnl, PairingEventAnl
- **Extensive column notes** with sample values
- **Color-coded headers** for each table

### To Test
1. Open http://localhost:5173/
2. The raw_events.dbml file should load automatically
3. Hover over any column to see its note
4. Example columns with rich notes:
   - `AircraftEventAnl._id`
   - `FlightEventAnl.flight.alternates.dest1`
   - `CrewEventAnl.employeeId`

## Tooltip Features

### Responsive Design
- Tooltip width: Fits content, max 550px
- Tooltip height: Max 600px with scrolling
- Automatic word wrapping
- Supports multi-line content
- Preserves line breaks in notes
- Scrollable for very long notes

### Theme Support
- **Light Theme**: 
  - White background (98% opacity)
  - Dark text
  - Light border
- **Dark Theme**: 
  - Dark background (98% opacity)
  - Light text
  - Dark border

### Performance
- Tooltips only render when hovering
- No performance impact when not in use
- Smooth show/hide transitions

## DBML Note Syntax

### Basic Note
```dbml
column_name type [note: 'Your note here']
```

### Multi-line Note (using escaped quotes)
```dbml
column_name type [note: 'Line 1
Line 2
Line 3']
```

### Note with Special Characters
```dbml
column_name type [note: 'Sample values: "value1", "value2", "value3"']
```

## Tips

### For Schema Designers
1. **Use notes for sample values**: Help users understand what data looks like
2. **Document constraints**: Explain business rules or validation logic
3. **Add context**: Describe the purpose or usage of the column
4. **Keep it concise**: While tooltips support long text, shorter notes are easier to read

### For Users
1. **Look for the help cursor**: Indicates a column has a note
2. **Hover to learn**: Get instant information without opening documentation
3. **Collapsed tables**: Expand tables to see column notes
4. **Large schemas**: Use tooltips to quickly understand unfamiliar columns

## Troubleshooting

### Tooltip Not Appearing
- **Check if column has a note**: Only columns with `note:` property show tooltips
- **Expand the table**: Collapsed tables don't show column details
- **Hover over the column row**: Make sure you're hovering over the column area

### Tooltip Cut Off
- **Zoom out**: If the tooltip extends beyond the viewport, zoom out
- **Pan the diagram**: Move the table to give more space for the tooltip

### Note Not Parsing
- **Check DBML syntax**: Ensure notes are properly quoted
- **Escape special characters**: Use proper escaping for quotes within notes
- **Check parser errors**: Look at the validation panel for syntax errors

## Future Enhancements

Potential improvements for the tooltip feature:
- Configurable tooltip position (left, right, top, bottom)
- Tooltip delay setting
- Copy note content to clipboard
- Rich formatting support (bold, italic, links)
- Tooltip for table notes (not just columns)
- Keyboard shortcut to show/hide tooltips

## Related Features

- **Table Collapse/Expand**: Toggle column visibility
- **Drag and Drop**: Move tables to better position tooltips
- **Context Menu**: Right-click for more table options
- **Relationship Creation**: Create relationships between columns

## Technical Details

### Implementation
- Uses SVG `foreignObject` for HTML rendering
- React state management for hover tracking
- Position calculated relative to table coordinates
- Theme-aware styling

### Browser Compatibility
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ⚠️ Mobile browsers (hover not available on touch devices)

## Feedback

If you have suggestions for improving the tooltip feature or encounter any issues, please let us know!
