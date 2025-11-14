# Split-Pane Interface - User Guide

## 🎉 New Interface: Side-by-Side DBML Editor

The DBML Diagram Visualizer now features a **split-pane interface** with live editing and instant visualization!

## ✨ Overview

The application is divided into two main panes:

```
┌─────────────────────────────────────────────────────────┐
│  DBML Diagram Visualizer                                │
├─────────────────────────────────────────────────────────┤
│  [Toolbar with controls]                                │
├──────────────────────┬──────────────────────────────────┤
│                      │                                  │
│  DBML Source         │  Live Diagram Preview           │
│  (Left Pane)         │  (Right Pane)                   │
│                      │                                  │
│  Edit DBML text      │  See changes instantly          │
│  here...             │  as you type                    │
│                      │                                  │
│  ✓ Valid             │  [Interactive Canvas]           │
│                      │                                  │
├──────────────────────┴──────────────────────────────────┤
│  18 tables • 20 relationships • 0 annotations           │
└─────────────────────────────────────────────────────────┘
```

## 🎯 Key Features

### 1. Live DBML Editing (Left Pane)
- **Full-featured text editor** with monospace font
- **Real-time validation** as you type
- **1-second debounce** - waits for you to finish typing
- **Syntax highlighting** via error indicators
- **Line-by-line editing** with proper formatting

### 2. Instant Visualization (Right Pane)
- **Automatic updates** when DBML is valid
- **No manual "Apply" button** needed
- **Smooth transitions** between schema changes
- **Full canvas features** - zoom, pan, select, etc.

### 3. Smart Validation
- **Validates while typing** (with debounce)
- **Only updates diagram** when syntax is valid
- **Shows errors immediately** when detected
- **Prevents broken diagrams** from rendering

### 4. Error Display
- **Bottom error panel** appears when errors exist
- **Line numbers** for each error
- **Clear error messages** with suggestions
- **Red highlighting** for visibility
- **Auto-hides** when errors are fixed

## 🚀 How to Use

### Basic Editing Workflow

1. **Type in Left Pane**
   - Edit DBML text directly
   - Add tables, columns, relationships
   - Modify existing definitions

2. **Wait 1 Second**
   - System validates your changes
   - Status shows "⏳ Validating..."

3. **See Results**
   - If valid: Diagram updates automatically (✓ Valid)
   - If errors: Error panel shows issues (✗ Errors)

4. **Fix Errors**
   - Read error messages
   - Correct the syntax
   - Diagram updates when fixed

### Example: Adding a New Table

**Step 1: Type in left pane**
```dbml
Table new_customers {
  id integer [pk]
  name varchar(255)
  email varchar(255) [unique]
}
```

**Step 2: Wait 1 second**
- Status shows "⏳ Validating..."

**Step 3: See result**
- Status shows "✓ Valid"
- New table appears in diagram!

### Example: Adding a Relationship

**Step 1: Add reference**
```dbml
Ref: orders.customer_id > new_customers.id
```

**Step 2: Wait for validation**
- System checks if tables exist
- Validates column names

**Step 3: See relationship line**
- Line appears connecting tables
- Automatic routing around obstacles

### Example: Fixing an Error

**Step 1: Make a typo**
```dbml
Table users {
  id integer [pk
  // Missing closing bracket
}
```

**Step 2: See error**
- Status shows "✗ 1 Error(s)"
- Error panel appears at bottom
- Message: "Line 2: Invalid column definition"

**Step 3: Fix the error**
```dbml
Table users {
  id integer [pk]
  // Fixed!
}
```

**Step 4: Error disappears**
- Status shows "✓ Valid"
- Diagram updates

## 📊 Interface Components

### Left Pane - DBML Editor

**Header:**
- **Title**: "DBML Source"
- **Status Indicator**:
  - ⏳ Validating... (orange) - Checking syntax
  - ✓ Valid (green) - No errors, diagram updated
  - ✗ N Error(s) (red) - Syntax errors found

**Text Editor:**
- Monospace font for code
- Syntax-aware editing
- Scroll for long files
- Auto-saves to memory

**Error Panel** (bottom, appears when errors exist):
- Red header: "ERRORS:"
- List of error messages
- Line numbers for each error
- Scrollable for many errors

### Right Pane - Diagram Canvas

**Full Canvas Features:**
- Zoom with Ctrl + Mouse Wheel
- Pan with Alt + Drag
- Select tables by clicking
- Drag tables to reposition
- All toolbar features available

**Live Updates:**
- Tables appear/disappear instantly
- Relationships redraw automatically
- Colors and styles update live
- Layout preserved during edits

## ⚡ Performance Features

### 1. Debounced Validation
- **1-second delay** after you stop typing
- Prevents validation on every keystroke
- Smooth editing experience
- No lag or stuttering

### 2. Smart Updates
- **Only updates when valid** - prevents broken diagrams
- **Preserves layout** - tables stay where you put them
- **Efficient rendering** - only changes what's needed
- **No flickering** - smooth transitions

### 3. Error Prevention
- **Validates before rendering** - catches errors early
- **Shows clear messages** - helps you fix issues
- **Maintains last valid state** - diagram doesn't break
- **Graceful degradation** - handles partial errors

## 🎨 Visual Feedback

### Status Indicators

| Status | Color | Meaning |
|--------|-------|---------|
| ⏳ Validating... | Orange | Checking your DBML syntax |
| ✓ Valid | Green | No errors, diagram is up-to-date |
| ✗ N Error(s) | Red | Syntax errors found, see error panel |

### Error Panel

**Appears when:**
- Syntax errors detected
- Invalid table names
- Missing referenced tables
- Malformed DBML

**Shows:**
- Number of errors
- Line number for each error
- Error message with details
- Suggestions for fixes

**Disappears when:**
- All errors are fixed
- DBML becomes valid
- Diagram updates successfully

## 📝 Common Workflows

### Workflow 1: Exploring flights.dbml

1. **Application loads** with flights.dbml
2. **Left pane** shows complete DBML source
3. **Right pane** shows 18 tables and 20 relationships
4. **Scroll through** DBML to understand structure
5. **Make changes** to experiment

### Workflow 2: Building a Schema from Scratch

1. Click **New** button to start fresh
2. Type first table definition in left pane
3. Wait 1 second - table appears!
4. Add more tables one by one
5. Add relationships between tables
6. See diagram grow as you type

### Workflow 3: Importing and Modifying

1. Click **Import** to load DBML file
2. Left pane shows imported DBML
3. Right pane shows diagram
4. Edit DBML to make changes
5. See changes reflected instantly
6. Click **Export** to save

### Workflow 4: Fixing Validation Errors

1. Import DBML with errors
2. Error panel shows issues
3. Click on error to see line number
4. Fix error in editor
5. Wait for validation
6. Error disappears, diagram updates

## 🔧 Advanced Features

### Pane Resizing
- **Default**: 40% editor, 60% canvas
- **Responsive**: Adjusts for screen size
- **Mobile**: Stacks vertically (editor on top)

### Keyboard Editing
- **Tab**: Insert spaces (not tab character)
- **Ctrl+A**: Select all text
- **Ctrl+C/V**: Copy/paste
- **Ctrl+Z**: Undo (browser default)
- **Ctrl+F**: Find in text (browser default)

### Validation Rules
- **Table names**: Must start with letter/underscore
- **Column names**: Must be valid identifiers
- **References**: Must point to existing tables/columns
- **Syntax**: Must follow DBML specification

## 💡 Tips & Tricks

### Tip 1: Wait for Validation
After typing, wait 1 second for validation. Don't keep typing if you want to see results immediately.

### Tip 2: Fix Errors Top-Down
Fix errors starting from the first line. Later errors might be caused by earlier ones.

### Tip 3: Use Comments
Add comments to document your schema:
```dbml
// User management tables
Table users {
  id integer [pk]
}
```

### Tip 4: Copy from Examples
Copy table definitions from documentation or examples, paste into editor, and see them visualized!

### Tip 5: Save Frequently
Use **Export → DBML** to save your work. The editor doesn't auto-save to disk.

### Tip 6: Test Changes Safely
Make experimental changes in the editor. If something breaks, just undo (Ctrl+Z) or reload the page.

## 🐛 Troubleshooting

### Problem: Diagram Not Updating
**Cause**: Syntax errors in DBML  
**Solution**: Check error panel at bottom, fix errors

### Problem: Validation Taking Too Long
**Cause**: Very large DBML file  
**Solution**: Wait a bit longer, or break into smaller files

### Problem: Error Panel Won't Close
**Cause**: Still have syntax errors  
**Solution**: Fix all errors shown in panel

### Problem: Lost My Changes
**Cause**: Refreshed page without saving  
**Solution**: Use Export → DBML frequently to save

### Problem: Can't See Full Diagram
**Cause**: Diagram larger than viewport  
**Solution**: Use zoom out (Ctrl + Mouse Wheel) or Fit to Screen (Ctrl+F)

## 📱 Responsive Design

### Desktop (>1024px)
- Side-by-side panes
- Editor: 40% width
- Canvas: 60% width
- Full features available

### Tablet (768px - 1024px)
- Side-by-side panes
- Editor: 35% width
- Canvas: 65% width
- Smaller fonts

### Mobile (<768px)
- Stacked vertically
- Editor: Top 40% height
- Canvas: Bottom 60% height
- Touch-friendly controls

## 🎯 Benefits

### 1. Faster Workflow
- No need to click "Apply" button
- Changes appear instantly
- Continuous feedback loop
- Smooth editing experience

### 2. Better Learning
- See DBML syntax and result together
- Understand how DBML maps to diagrams
- Experiment safely with immediate feedback
- Learn by doing

### 3. More Control
- Direct access to DBML source
- Fine-grained control over schema
- Copy/paste entire sections
- Bulk modifications easy

### 4. Error Prevention
- Immediate error feedback
- Clear error messages
- Prevents broken diagrams
- Maintains valid state

### 5. Professional Workflow
- Edit like a developer
- Version control friendly
- Documentation in comments
- Clean, formatted code

## 🚀 Getting Started

**Try it now:**

1. Open http://localhost:5173/
2. See flights.dbml loaded in left pane
3. See diagram in right pane
4. Edit DBML text on left
5. Watch diagram update on right!

**First edit to try:**

Add this table at the end of the DBML:
```dbml
Table test_table {
  id integer [pk]
  name varchar(255)
  created_at timestamp
}
```

Wait 1 second and watch it appear in the diagram! 🎉

---

**The split-pane interface makes DBML editing fast, intuitive, and powerful!**