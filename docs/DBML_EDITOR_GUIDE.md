# DBML Editor - User Guide

## 🎉 New Feature: Inline DBML Editor

The DBML Diagram Visualizer now includes a powerful inline text editor that allows you to view and edit the raw DBML source code directly!

## ✨ Features

### 1. Live DBML Editing
- Edit DBML source code in a full-featured text editor
- Syntax validation with real-time error checking
- Automatic debounced validation (500ms delay)
- Line numbers and monospace font for code editing

### 2. Real-Time Validation
- **Instant feedback** on DBML syntax errors
- **Error messages** with line numbers and suggestions
- **Warning messages** for non-critical issues
- **Visual indicators** showing validation status

### 3. Apply Changes
- **Apply button** to update the diagram with your changes
- **Automatic re-rendering** when valid DBML is applied
- **Confirmation** before applying to prevent accidents
- **Keyboard shortcut**: `Ctrl+Enter` to apply

### 4. Save DBML File
- **Save button** to download edited DBML as a file
- **Preserves formatting** and comments
- **Keyboard shortcut**: `Ctrl+S` to save
- **Unsaved changes indicator** (yellow dot)

### 5. Format DBML
- **Format button** to auto-format your DBML code
- **Consistent indentation** and spacing
- **Preserves comments** and metadata
- **Professional formatting** for clean code

## 🚀 How to Use

### Opening the Editor

**Method 1: Toolbar Button**
1. Click the **📝 Edit DBML** button in the toolbar
2. Editor opens as a modal overlay

**Method 2: Keyboard Shortcut** (coming soon)
- Press `Ctrl+E` to open the editor

### Editing DBML

1. **View Current Schema**
   - Editor automatically loads current schema as DBML
   - All tables, columns, and relationships included
   - Comments and metadata preserved

2. **Make Changes**
   - Edit the DBML text directly
   - Add new tables, columns, or relationships
   - Modify existing definitions
   - Add comments and notes

3. **Validation**
   - Changes are validated automatically after 500ms
   - Errors appear in the right panel
   - Green checkmark = valid DBML
   - Red X = errors found

4. **Apply Changes**
   - Click **✓ Apply Changes** button
   - Or press `Ctrl+Enter`
   - Diagram updates immediately
   - Tables and relationships re-render

5. **Save File**
   - Click **💾 Save File** button
   - Or press `Ctrl+S`
   - Downloads as `schema.dbml`
   - Can be imported later

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Enter` | Apply changes to diagram |
| `Ctrl+S` | Save DBML file |
| `Esc` | Close editor (with confirmation if unsaved) |

## 📝 Example Workflow

### Scenario 1: Adding a New Table

1. Click **📝 Edit DBML** in toolbar
2. Scroll to end of DBML code
3. Add new table definition:
```dbml
Table new_table {
  id integer [pk, increment]
  name varchar(255) [not null]
  created_at timestamp [default: 'now()']
}
```
4. Wait for validation (green checkmark)
5. Click **✓ Apply Changes**
6. See new table appear in diagram!

### Scenario 2: Adding a Relationship

1. Open DBML editor
2. Add reference at end:
```dbml
Ref: new_table.id > existing_table.id
```
3. Validate (green checkmark)
4. Apply changes
5. See new relationship line appear!

### Scenario 3: Modifying Existing Table

1. Open editor
2. Find table definition
3. Add new column:
```dbml
Table users {
  id integer [pk]
  name varchar(255)
  email varchar(255) [unique, not null]  // Add this line
}
```
4. Apply changes
5. Table updates with new column!

### Scenario 4: Fixing Errors

1. Make changes that cause errors
2. See error messages in right panel:
   - "Line 15: Invalid table name"
   - "Line 23: Referenced table not found"
3. Fix errors based on suggestions
4. Wait for green checkmark
5. Apply changes

## 🎨 Editor Interface

### Layout

```
┌─────────────────────────────────────────────────────┐
│  📝 DBML Editor                              [×]    │
├─────────────────────────────────────────────────────┤
│  [✓ Apply] [💾 Save] [✨ Format]  ✓ Valid DBML    │
├──────────────────────────┬──────────────────────────┤
│                          │                          │
│  DBML Source             │  Messages                │
│  (Text Editor)           │  (Errors/Warnings)       │
│                          │                          │
│  Table users {           │  Errors (0)              │
│    id integer [pk]       │                          │
│    name varchar(255)     │  Warnings (2)            │
│  }                       │  ⚠ Line 5: Unknown...   │
│                          │  ⚠ Line 12: Enum...     │
│                          │                          │
├──────────────────────────┴──────────────────────────┤
│  💡 Tip: Ctrl+Enter to apply, Ctrl+S to save       │
└─────────────────────────────────────────────────────┘
```

### Components

1. **Header**
   - Title: "DBML Editor"
   - Unsaved indicator (● yellow dot)
   - Close button (×)

2. **Toolbar**
   - Apply Changes button (disabled if errors)
   - Save File button
   - Format button
   - Validation status

3. **Editor Pane**
   - Full-featured text editor
   - Monospace font
   - Line count indicator
   - Syntax highlighting (basic)

4. **Messages Pane**
   - Error messages (red)
   - Warning messages (orange)
   - Line numbers for each issue
   - Suggestions for fixes

5. **Footer**
   - Keyboard shortcut tips
   - Cancel button

## ⚠️ Important Notes

### Validation Rules

1. **Errors prevent applying**
   - Must fix all errors before applying
   - Invalid table names
   - Missing referenced tables
   - Syntax errors

2. **Warnings don't prevent applying**
   - Unknown settings
   - Unsupported features
   - Enum definitions (not visualized)
   - Index definitions (not visualized)

### Data Preservation

1. **Visual properties**
   - Table positions saved as comments
   - Table colors saved as metadata
   - Size information preserved

2. **Comments preserved**
   - Line comments (//)
   - Block comments (/* */)
   - Table notes
   - Column notes

3. **Metadata included**
   - Schema version
   - Creation date
   - Modification date
   - Author information

## 🔧 Advanced Features

### Format DBML

The **Format** button:
1. Parses current DBML
2. Generates clean, formatted version
3. Consistent indentation (2 spaces)
4. Proper spacing between sections
5. Preserves all data and comments

**Before Format:**
```dbml
Table users{id integer[pk]name varchar(255)}
```

**After Format:**
```dbml
Table users {
  id integer [pk]
  name varchar(255)
}
```

### Unsaved Changes Protection

- Yellow dot (●) appears when changes are made
- Closing editor prompts: "You have unsaved changes. Close anyway?"
- Apply or Save to clear unsaved indicator
- Prevents accidental data loss

### Error Recovery

If you make a mistake:
1. See error message with line number
2. Read suggestion for fix
3. Correct the error
4. Wait for validation
5. Apply when valid

## 📊 Use Cases

### 1. Quick Schema Modifications
- Add columns without manual UI interaction
- Faster than clicking through UI
- Copy/paste table definitions
- Bulk changes to multiple tables

### 2. Schema Documentation
- Add detailed comments
- Document design decisions
- Explain relationships
- Add table and column notes

### 3. Version Control
- Save DBML to file
- Commit to Git
- Track schema changes
- Review diffs in pull requests

### 4. Schema Import/Export
- Edit schema in external editor
- Copy from documentation
- Paste into editor
- Apply to visualize

### 5. Learning DBML
- See generated DBML from visual diagram
- Learn DBML syntax by example
- Experiment with changes
- Immediate visual feedback

## 🎯 Tips & Tricks

### Tip 1: Use Format for Clean Code
After making changes, click Format to clean up your DBML code.

### Tip 2: Save Frequently
Use `Ctrl+S` to save your work frequently, especially for large schemas.

### Tip 3: Check Warnings
Warnings won't prevent applying, but they might indicate issues.

### Tip 4: Use Comments
Add comments to document your schema:
```dbml
// User authentication tables
Table users {
  id integer [pk]
  // Email must be unique for login
  email varchar(255) [unique, not null]
}
```

### Tip 5: Copy from Examples
Copy table definitions from DBML documentation or examples, paste into editor, and apply!

## 🐛 Troubleshooting

### Problem: Can't Apply Changes
**Solution**: Check for errors in the Messages pane. Fix all errors before applying.

### Problem: Changes Not Showing
**Solution**: Make sure you clicked "Apply Changes" button or pressed Ctrl+Enter.

### Problem: Lost Changes
**Solution**: Always save your DBML file before closing the editor.

### Problem: Validation Too Slow
**Solution**: Validation is debounced by 500ms. Wait a moment after typing.

### Problem: Can't Close Editor
**Solution**: If you have unsaved changes, you'll be prompted. Choose to save or discard.

## 🎉 Benefits

1. **Faster Editing**
   - Text editing is faster than UI clicking
   - Copy/paste entire table definitions
   - Bulk modifications

2. **More Control**
   - Direct access to DBML source
   - Fine-grained control over schema
   - Advanced DBML features

3. **Better Documentation**
   - Add detailed comments
   - Document design decisions
   - Explain relationships

4. **Version Control**
   - Save DBML files
   - Track changes in Git
   - Review schema diffs

5. **Learning Tool**
   - See DBML syntax
   - Learn by example
   - Experiment safely

## 📚 Related Features

- **Import DBML**: Load DBML files from disk
- **Export DBML**: Save current schema as DBML
- **Format on Save**: Auto-format when saving
- **Validation**: Real-time syntax checking
- **Error Messages**: Helpful error descriptions

## 🚀 Future Enhancements

Planned improvements:
- [ ] Syntax highlighting
- [ ] Auto-completion
- [ ] Line numbers in editor
- [ ] Find and replace
- [ ] Undo/redo in editor
- [ ] Split view (edit + preview)
- [ ] Diff view for changes
- [ ] Import from clipboard

---

**Start editing your DBML now!**

Click **📝 Edit DBML** in the toolbar to get started!