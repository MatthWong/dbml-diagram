# DBML Diagram Visualizer - Quick Start Guide

## 🚀 Getting Started (30 seconds)

The application is **already running** at: **http://localhost:5173/**

## ✨ What You'll See

When you open the application, you'll see:
1. **18 tables** from flights.dbml automatically loaded
2. **20 relationships** connecting the tables
3. **Professional toolbar** with all features
4. **Interactive canvas** ready for exploration

## 🎯 Try These Features Now

### 1. Navigate the Diagram (5 seconds)
- **Zoom In**: Hold `Ctrl` and scroll mouse wheel up
- **Zoom Out**: Hold `Ctrl` and scroll mouse wheel down
- **Pan**: Hold `Alt` and drag, or use middle mouse button
- **Fit to Screen**: Press `Ctrl + F`

### 2. Select Tables (10 seconds)
- **Click** any table to select it
- **Ctrl + Click** to select multiple tables
- **Drag** on empty space to select multiple with rectangle
- **Press Esc** to clear selection

### 3. Apply Auto-Layout (15 seconds)
1. Click **Layout** button in toolbar
2. Choose an algorithm:
   - **Grid Layout**: Evenly spaced grid
   - **Hierarchical Layout**: Organized by dependencies
   - **Force-Directed Layout**: Physics-based optimization
3. Watch tables automatically rearrange!

### 4. Customize Appearance (20 seconds)
- Click **Theme** dropdown → Choose Light or Dark
- Click **Grid** button → Toggle grid display
- Click **Snap** button → Enable snap-to-grid
- Click color circle in table header → Change table color

### 5. Export Your Diagram (30 seconds)
1. Click **Export** dropdown in toolbar
2. Choose format:
   - **DBML**: Save as text file
   - **JSON**: Export data structure
   - **PNG**: High-quality image (300 DPI)
   - **SVG**: Scalable vector graphic
3. File downloads automatically!

### 6. Import Your Own DBML (45 seconds)
1. Click **Import** button
2. Select a `.dbml` file from your computer
3. Watch it render instantly!

## 🎨 Understanding the flights.dbml Schema

The loaded schema is a **flight data warehouse** with:

### Dimension Tables (Yellow/Light colored)
- `dim_airline` - Airline information
- `dim_airport` - Airport details
- `dim_aircraft` - Aircraft specifications
- `dim_employee` - Crew members
- `dim_date` - Date dimension
- `dim_time` - Time dimension
- And more...

### Fact Tables (Blue/Darker colored)
- `fact_flight_leg` - Main flight data
- `fact_flight_delay` - Delay information
- `fact_flight_crew_assignment` - Crew assignments
- `fact_acars_position` - Aircraft tracking
- And more...

### Relationships (Lines)
- **20 foreign key relationships** connecting facts to dimensions
- **Star schema pattern** - typical data warehouse design

## ⌨️ Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Zoom In | `Ctrl + =` or `Ctrl + +` |
| Zoom Out | `Ctrl + -` |
| Reset Zoom | `Ctrl + 0` |
| Fit to Screen | `Ctrl + F` |
| Select All | `Ctrl + A` |
| Clear Selection | `Esc` |
| New Diagram | `Ctrl + N` |
| Import File | `Ctrl + O` |

## 🎓 Common Tasks

### Task: Organize a Messy Diagram
1. Click **Layout** → **Force-Directed Layout**
2. Wait 1-2 seconds for optimization
3. Click **Fit to Screen** to see everything
4. Manually adjust any tables by dragging

### Task: Focus on Specific Tables
1. Select tables you want to focus on (Ctrl + Click)
2. Zoom in with `Ctrl + Mouse Wheel`
3. Pan to center them with `Alt + Drag`

### Task: Create Documentation
1. Arrange tables as desired
2. Click **Export** → **PNG**
3. Use the image in your documentation
4. Or export as **SVG** for presentations

### Task: Share Schema with Team
1. Click **Export** → **DBML**
2. Share the `.dbml` file
3. Team members can import it
4. Everyone sees the same schema

## 🐛 Troubleshooting

### Tables are too small/large
- Use zoom controls: `Ctrl + Mouse Wheel`
- Or click zoom buttons in toolbar
- Press `Ctrl + 0` to reset zoom

### Can't see all tables
- Press `Ctrl + F` to fit everything on screen
- Or use **Layout** to reorganize

### Relationships are crossing
- Try **Force-Directed Layout** for optimization
- Or manually drag tables to better positions

### Want to start fresh
- Click **New** button to create empty diagram
- Or click **Import** to load different file

## 📚 Learn More

- **README.md** - Complete documentation
- **VERIFICATION.md** - flights.dbml verification report
- **IMPLEMENTATION_SUMMARY.md** - Technical details
- **Spec files** in `.kiro/specs/` - Requirements and design

## 🎉 You're Ready!

You now know how to:
- ✅ Navigate and explore diagrams
- ✅ Apply automatic layouts
- ✅ Customize appearance
- ✅ Export in multiple formats
- ✅ Import your own DBML files

**Have fun visualizing your database schemas!** 🚀

---

**Need Help?**
- Check the toolbar tooltips (hover over buttons)
- Look at the footer for keyboard shortcuts
- Review the README.md for detailed documentation

**Pro Tip**: Start with **Grid Layout** for simple organization, then use **Force-Directed Layout** for optimization!