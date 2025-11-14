# Quick Test Guide - Relationship Creation Feature

## 🚀 Quick Test (2 minutes)

### Test 1: Basic Relationship Creation
1. Open http://localhost:5173/
2. **Right-click** on the `fact_flight_leg` table
3. Select **"Create Relationship"** from the context menu
4. In the dialog:
   - Source Column: Select any column (e.g., `airline_sk`)
   - Destination Table: Select `dim_airline`
   - Destination Column: Select `airline_sk`
   - Relationship Type: Keep as "Many-to-One (N:1)"
5. Click **"Create Relationship"**

**Expected Result:**
- ✅ Dialog closes
- ✅ New line appears in DBML editor: `Ref: fact_flight_leg.airline_sk > dim_airline.airline_sk`
- ✅ New relationship line appears in diagram connecting the two tables
- ✅ No errors in console

### Test 2: Dialog Validation
1. **Right-click** on any table
2. Select **"Create Relationship"**
3. Try clicking **"Create Relationship"** button without filling fields

**Expected Result:**
- ✅ Button is disabled (grayed out)
- ✅ Cannot submit form

### Test 3: Cancel Dialog
1. **Right-click** on any table
2. Select **"Create Relationship"**
3. Press **Escape** key

**Expected Result:**
- ✅ Dialog closes
- ✅ No changes to DBML or diagram

### Test 4: Context Menu Close
1. **Right-click** on any table
2. Context menu appears
3. Click anywhere outside the menu

**Expected Result:**
- ✅ Context menu closes
- ✅ No dialog opens

## 🧪 Detailed Test (10 minutes)

### Test 5: All Relationship Types

**One-to-One (1:1)**
1. Right-click on a table
2. Create relationship
3. Select "One-to-One (1:1)" type
4. Complete and submit

**Expected DBML:**
```dbml
Ref: source_table.column - destination_table.column
```

**One-to-Many (1:N)**
1. Right-click on a table
2. Create relationship
3. Select "One-to-Many (1:N)" type
4. Complete and submit

**Expected DBML:**
```dbml
Ref: source_table.column < destination_table.column
```

**Many-to-One (N:1)**
1. Right-click on a table
2. Create relationship
3. Select "Many-to-One (N:1)" type (default)
4. Complete and submit

**Expected DBML:**
```dbml
Ref: source_table.column > destination_table.column
```

### Test 6: Optional Fields

1. Right-click on a table
2. Create relationship
3. Fill required fields
4. Add optional fields:
   - Relationship Name: `test_relationship`
   - ON DELETE: Select "CASCADE"
   - ON UPDATE: Select "RESTRICT"
5. Submit

**Expected DBML:**
```dbml
Ref test_relationship: source_table.column > destination_table.column [delete: cascade] [update: restrict]
```

### Test 7: Duplicate Detection

1. Create a relationship between two tables
2. Try to create the **same relationship again**

**Expected Result:**
- ✅ Alert message: "A relationship between these columns already exists"
- ✅ Relationship is not created

### Test 8: Type Mismatch Warning

1. Right-click on a table
2. Create relationship
3. Select source column with type `integer`
4. Select destination column with type `varchar`
5. Submit

**Expected Result:**
- ✅ Confirmation dialog: "Warning: Column types don't match..."
- ✅ Can proceed if confirmed
- ✅ Can cancel if declined

### Test 9: Destination Column Population

1. Right-click on a table
2. Create relationship
3. **Before** selecting destination table:
   - Destination Column dropdown should be **disabled**
   - Shows: "Select destination table first"
4. **After** selecting destination table:
   - Destination Column dropdown should be **enabled**
   - Shows all columns from selected table

### Test 10: Visual Feedback

1. Right-click on a table
2. Observe context menu animation (should fade in)
3. Select "Create Relationship"
4. Observe dialog animation (should slide in)
5. Submit form
6. Observe relationship line appear in diagram

## 🐛 Bug Check

### Check for Console Errors
1. Open browser DevTools (F12)
2. Go to Console tab
3. Perform all tests above
4. **Expected**: No errors in console

### Check for Visual Issues
- [ ] Context menu appears at cursor position (not offset)
- [ ] Dialog is centered on screen
- [ ] Dialog is scrollable if content is long
- [ ] All text is readable (not cut off)
- [ ] Icons appear correctly (🔑 🔗 ⭐)
- [ ] Buttons are clickable
- [ ] Dropdowns open correctly

### Check Dark Theme
1. Enable dark mode in your OS
2. Refresh the page
3. Test all features

**Expected:**
- [ ] Context menu has dark background
- [ ] Dialog has dark background
- [ ] Text is readable (light on dark)
- [ ] Form fields have dark styling

## ✅ Success Criteria

All tests should pass with:
- ✅ No console errors
- ✅ No visual glitches
- ✅ Smooth animations
- ✅ Correct DBML generation
- ✅ Diagram updates correctly
- ✅ Validation works as expected

## 🚨 Common Issues

### Context Menu Doesn't Appear
- **Cause**: Right-clicking on interactive elements (buttons, icons)
- **Solution**: Right-click on table header or body area

### Dialog Doesn't Open
- **Cause**: Context menu closed before clicking option
- **Solution**: Click "Create Relationship" before menu closes

### Relationship Line Doesn't Appear
- **Cause**: DBML parsing error
- **Solution**: Check DBML editor for syntax errors

### Dropdown Shows No Options
- **Cause**: No tables/columns available
- **Solution**: Ensure schema has tables with columns

## 📊 Test Results Template

```
Test Date: ___________
Tester: ___________

Test 1: Basic Creation          [ ] Pass [ ] Fail
Test 2: Validation              [ ] Pass [ ] Fail
Test 3: Cancel Dialog           [ ] Pass [ ] Fail
Test 4: Context Menu Close      [ ] Pass [ ] Fail
Test 5: Relationship Types      [ ] Pass [ ] Fail
Test 6: Optional Fields         [ ] Pass [ ] Fail
Test 7: Duplicate Detection     [ ] Pass [ ] Fail
Test 8: Type Mismatch           [ ] Pass [ ] Fail
Test 9: Column Population       [ ] Pass [ ] Fail
Test 10: Visual Feedback        [ ] Pass [ ] Fail

Console Errors:                 [ ] None [ ] Some
Visual Issues:                  [ ] None [ ] Some
Dark Theme:                     [ ] Pass [ ] Fail

Overall Status:                 [ ] PASS [ ] FAIL

Notes:
_________________________________
_________________________________
_________________________________
```

## 🎯 Ready to Test!

The feature is fully implemented and ready for testing. Start with the Quick Test (2 minutes) to verify basic functionality, then proceed to Detailed Tests if needed.

**Happy Testing!** 🎉
