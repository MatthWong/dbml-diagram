# Relationship Creation Guide

## Overview
You can now create relationships between tables directly from the diagram using a context menu and dialog interface. This feature allows you to visually establish foreign key relationships without manually editing DBML code.

## How to Create a Relationship

### Step 1: Open the Context Menu
1. **Right-click** on any table in the diagram
2. A context menu will appear at your cursor position
3. Select **"Create Relationship"** from the menu

### Step 2: Configure the Relationship
A dialog will open with the following fields:

#### Required Fields

**Source Table** (Read-only)
- Pre-populated with the table you right-clicked on
- This is the table that will contain the foreign key

**Source Column** ⭐
- Select the column from the source table that will reference the destination
- Dropdown shows all columns with icons:
  - 🔑 = Primary Key
  - 🔗 = Foreign Key
  - ⭐ = Unique constraint

**Destination Table** ⭐
- Select the table you want to reference
- Dropdown shows all tables except the source table
- Format: `schema.table_name` or just `table_name`

**Destination Column** ⭐
- Select the column in the destination table to reference
- This dropdown populates after you select a destination table
- Usually you'll select the primary key of the destination table

**Relationship Type** ⭐
- **Many-to-One (N:1)** - Default and most common
  - Multiple records in source can reference one record in destination
  - Example: Many orders belong to one user
  
- **One-to-Many (1:N)**
  - One record in source can reference multiple records in destination
  - Less common, used for reverse relationships
  
- **One-to-One (1:1)**
  - One record in source references exactly one record in destination
  - Example: User has one profile

#### Optional Fields

**Relationship Name**
- Custom name for the relationship (e.g., `fk_orders_users`)
- If omitted, DBML will auto-generate a name

**ON DELETE**
- What happens when the referenced record is deleted
- Options:
  - **CASCADE** - Delete this record too
  - **RESTRICT** - Prevent deletion of referenced record
  - **SET NULL** - Set foreign key to NULL
  - **SET DEFAULT** - Set foreign key to default value

**ON UPDATE**
- What happens when the referenced record's key is updated
- Same options as ON DELETE

### Step 3: Confirm or Cancel
- Click **"Create Relationship"** to add the relationship
- Click **"Cancel"** or press **Escape** to close without changes
- Click outside the dialog to cancel

## What Happens Next

1. **DBML Generation**: The system generates proper DBML syntax for the relationship
2. **Code Update**: The reference is appended to your DBML source code
3. **Diagram Update**: The diagram automatically updates with a new relationship line
4. **Validation**: The DBML is re-parsed to ensure everything is valid

## Example Workflow

### Creating a Simple Foreign Key

**Scenario**: Link `orders` table to `users` table

1. Right-click on the `orders` table
2. Select "Create Relationship"
3. In the dialog:
   - Source Table: `orders` (pre-filled)
   - Source Column: Select `user_id`
   - Destination Table: Select `users`
   - Destination Column: Select `id`
   - Relationship Type: Keep as "Many-to-One (N:1)"
   - ON DELETE: Select "CASCADE" (optional)
4. Click "Create Relationship"

**Result**: DBML code is generated:
```dbml
Ref: orders.user_id > users.id [delete: cascade]
```

### Creating a One-to-One Relationship

**Scenario**: Link `users` table to `user_profiles` table

1. Right-click on the `users` table
2. Select "Create Relationship"
3. In the dialog:
   - Source Table: `users` (pre-filled)
   - Source Column: Select `profile_id`
   - Destination Table: Select `user_profiles`
   - Destination Column: Select `id`
   - Relationship Type: Select "One-to-One (1:1)"
4. Click "Create Relationship"

**Result**: DBML code is generated:
```dbml
Ref: users.profile_id - user_profiles.id
```

## Validation and Warnings

### Automatic Validation

The system performs several checks:

1. **Duplicate Detection**: Warns if a relationship already exists between the same columns
2. **Type Compatibility**: Warns if column types don't match (e.g., `integer` vs `varchar`)
3. **Required Fields**: Prevents submission if required fields are missing

### Warning Messages

**Type Mismatch Warning**:
```
Warning: Column types don't match (integer vs varchar)

Do you want to proceed?
```
- You can proceed, but the relationship may cause database errors

**Duplicate Relationship**:
```
A relationship between these columns already exists
```
- The relationship will not be created

## Keyboard Shortcuts

- **Escape** - Close dialog without saving
- **Enter** - Submit form (when all required fields are filled)
- **Tab** - Navigate between form fields

## Tips and Best Practices

### Choosing the Right Relationship Type

**Use Many-to-One (N:1) when:**
- Multiple records in the source table reference one record in the destination
- Example: Many products belong to one category
- This is the most common relationship type

**Use One-to-One (1:1) when:**
- Each record in the source has exactly one corresponding record in the destination
- Example: User has one profile, profile belongs to one user
- Often used to split large tables

**Use One-to-Many (1:N) when:**
- You're defining the relationship from the "one" side
- Less common in practice (usually define from the "many" side)

### Naming Relationships

**Good naming conventions:**
- `fk_source_destination` - e.g., `fk_orders_users`
- `source_to_destination` - e.g., `orders_to_users`
- Descriptive names - e.g., `order_belongs_to_user`

**Why name relationships:**
- Easier to identify in database
- Better documentation
- Clearer error messages

### Using ON DELETE/UPDATE

**CASCADE**:
- Use when child records should be deleted with parent
- Example: Delete order items when order is deleted
- ⚠️ Use carefully - can delete a lot of data

**RESTRICT**:
- Use when you want to prevent accidental deletion
- Example: Prevent deleting a category that has products
- Safest option for important data

**SET NULL**:
- Use when the relationship is optional
- Example: Set manager_id to NULL when manager is deleted
- Requires the foreign key column to allow NULL

**SET DEFAULT**:
- Use when you have a default fallback value
- Less commonly used

## Troubleshooting

### Dialog Won't Open
- Make sure you're right-clicking directly on a table
- Try clicking on the table header or body, not on buttons

### Can't Select Destination Column
- Make sure you've selected a destination table first
- The destination column dropdown is disabled until a table is selected

### Relationship Not Appearing
- Check the DBML editor for syntax errors
- Look for error messages in the validation panel
- The relationship line may be hidden behind other elements - try zooming out

### Type Mismatch Warning
- Verify that both columns have compatible types
- Common issue: `integer` vs `bigint` or `varchar(50)` vs `varchar(100)`
- You can proceed, but consider fixing the types in your schema

### Duplicate Relationship Error
- Check if the relationship already exists in your DBML
- You may need to delete the existing relationship first
- Look for similar references in the code

## DBML Syntax Reference

The relationship creation dialog generates standard DBML reference syntax:

### Many-to-One (N:1)
```dbml
Ref: source_table.column > destination_table.column
```

### One-to-Many (1:N)
```dbml
Ref: source_table.column < destination_table.column
```

### One-to-One (1:1)
```dbml
Ref: source_table.column - destination_table.column
```

### With Constraints
```dbml
Ref: source_table.column > destination_table.column [delete: cascade, update: restrict]
```

### With Name
```dbml
Ref fk_name: source_table.column > destination_table.column
```

## Advanced Features (Coming Soon)

- **Visual Relationship Creation**: Drag from one column to another
- **Relationship Editing**: Modify existing relationships
- **Batch Creation**: Create multiple relationships at once
- **Smart Suggestions**: Auto-suggest relationships based on column names
- **Relationship Templates**: Quick creation for common patterns

## Related Features

- **Drag and Drop**: Move tables around to organize your diagram
- **Table Collapse**: Minimize tables to see high-level structure
- **Export**: Export your diagram with relationships as PNG or SVG

## Feedback

If you encounter issues or have suggestions for improving the relationship creation feature, please let us know!
