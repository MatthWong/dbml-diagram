import React, { useRef, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useViewportOperations } from '../hooks/useStateManagement';
import { layoutAlgorithms } from '../utils/layoutAlgorithms';
import { exportToPNG, exportToSVG, downloadBlob, getDefaultExportOptions } from '../utils/exportUtils';
import './Toolbar.css';

interface ToolbarProps {
  onNew: () => void;
  onImport: (file: File) => void;
  onExport: (format: 'dbml' | 'json' | 'png' | 'svg') => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onNew,
  onImport,
  onExport
}) => {
  const { state, updateSettings, updateTable } = useAppContext();
  const { zoomIn, zoomOut, resetZoom, fitToScreen, viewport } = useViewportOperations();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isApplyingLayout, setIsApplyingLayout] = useState(false);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
      // Reset input so the same file can be selected again
      event.target.value = '';
    }
  };

  const handleThemeChange = (theme: 'light' | 'dark') => {
    updateSettings({ theme });
  };

  const handleGridToggle = () => {
    updateSettings({ gridEnabled: !state.schema.settings.gridEnabled });
  };

  const handleSnapToGridToggle = () => {
    updateSettings({ snapToGrid: !state.schema.settings.snapToGrid });
  };

  const handleMinimizeAll = () => {
    state.schema.tables.forEach(table => {
      updateTable(table.id, { collapsed: true });
    });
  };

  const handleExpandAll = () => {
    state.schema.tables.forEach(table => {
      updateTable(table.id, { collapsed: false });
    });
  };

  const handleApplyLayout = async (layoutType: 'force-directed' | 'hierarchical' | 'grid' | 'star-schema') => {
    setIsApplyingLayout(true);
    try {
      const layout = layoutAlgorithms[layoutType];
      const options = layout.getDefaultOptions();
      const result = await layout.apply(state.schema, options);
      
      // Apply new positions to all tables
      Object.entries(result.positions).forEach(([tableId, position]) => {
        updateTable(tableId, { position });
      });
      
      console.log(`✅ Applied ${layoutType} layout:`, result.metrics);
    } catch (error) {
      const err = error as Error;
      console.error('Failed to apply layout:', err);
    } finally {
      setIsApplyingLayout(false);
    }
  };

  const handleExportImage = async (format: 'png' | 'svg') => {
    try {
      // Find the SVG element
      const svgElement = document.querySelector('.diagram-canvas svg') as SVGSVGElement;
      if (!svgElement) {
        alert('Could not find diagram to export');
        return;
      }

      const options = getDefaultExportOptions();
      options.format = format;
      options.backgroundColor = state.schema.settings.theme === 'dark' ? '#1e1e1e' : '#ffffff';

      let result;
      if (format === 'png') {
        result = await exportToPNG(svgElement, options);
      } else {
        result = await exportToSVG(svgElement, options);
      }

      if (result.success && result.data) {
        const filename = `diagram.${format}`;
        downloadBlob(result.data as Blob, filename);
        console.log(`✅ Exported as ${format.toUpperCase()}:`, result.metadata);
      } else {
        alert(`Export failed: ${result.error}`);
      }
    } catch (error) {
      const err = error as Error;
      console.error('Export error:', err);
      alert(`Export failed: ${err.message}`);
    }
  };

  const zoomPercentage = Math.round(viewport.zoom * 100);

  return (
    <div className="toolbar">
      {/* File operations */}
      <div className="toolbar-group">
        <button 
          className="toolbar-button"
          onClick={onNew}
          title="New diagram (Ctrl+N)"
        >
          <span className="icon">📄</span>
          <span className="label">New</span>
        </button>
        
        <button 
          className="toolbar-button"
          onClick={handleImportClick}
          title="Import DBML file (Ctrl+O)"
        >
          <span className="icon">📁</span>
          <span className="label">Import</span>
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".dbml,.txt"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        
        <div className="toolbar-dropdown">
          <button 
            className="toolbar-button"
            title="Export diagram"
          >
            <span className="icon">💾</span>
            <span className="label">Export</span>
            <span className="dropdown-arrow">▼</span>
          </button>
          <div className="dropdown-menu">
            <button onClick={() => onExport('dbml')}>📄 Export as DBML</button>
            <button onClick={() => onExport('json')}>📋 Export as JSON</button>
            <button onClick={() => handleExportImage('png')}>🖼️ Export as PNG</button>
            <button onClick={() => handleExportImage('svg')}>🎨 Export as SVG</button>
          </div>
        </div>
      </div>

      <div className="toolbar-separator"></div>

      {/* View controls */}
      <div className="toolbar-group">
        <button 
          className="toolbar-button"
          onClick={() => zoomOut()}
          title="Zoom out (Ctrl+-)"
        >
          <span className="icon">🔍−</span>
        </button>
        
        <div className="zoom-display" title="Current zoom level">
          {zoomPercentage}%
        </div>
        
        <button 
          className="toolbar-button"
          onClick={() => zoomIn()}
          title="Zoom in (Ctrl+=)"
        >
          <span className="icon">🔍+</span>
        </button>
        
        <button 
          className="toolbar-button"
          onClick={resetZoom}
          title="Reset zoom (Ctrl+0)"
        >
          <span className="icon">⊙</span>
          <span className="label">Reset</span>
        </button>
        
        <button 
          className="toolbar-button"
          onClick={fitToScreen}
          title="Fit to screen (Ctrl+F)"
        >
          <span className="icon">⛶</span>
          <span className="label">Fit</span>
        </button>
      </div>

      <div className="toolbar-separator"></div>

      {/* Display options */}
      <div className="toolbar-group">
        <button 
          className={`toolbar-button ${state.schema.settings.gridEnabled ? 'active' : ''}`}
          onClick={handleGridToggle}
          title="Toggle grid"
        >
          <span className="icon">⊞</span>
          <span className="label">Grid</span>
        </button>
        
        <button 
          className={`toolbar-button ${state.schema.settings.snapToGrid ? 'active' : ''}`}
          onClick={handleSnapToGridToggle}
          title="Snap to grid"
          disabled={!state.schema.settings.gridEnabled}
        >
          <span className="icon">⊡</span>
          <span className="label">Snap</span>
        </button>

        <button 
          className="toolbar-button"
          onClick={handleMinimizeAll}
          title="Minimize all tables (Ctrl+M)"
        >
          <span className="icon">▼</span>
          <span className="label">Minimize</span>
        </button>
        
        <button 
          className="toolbar-button"
          onClick={handleExpandAll}
          title="Expand all tables (Ctrl+Shift+M)"
        >
          <span className="icon">▲</span>
          <span className="label">Expand</span>
        </button>
        
        <div className="toolbar-dropdown">
          <button 
            className="toolbar-button"
            title="Change theme"
          >
            <span className="icon">🎨</span>
            <span className="label">Theme</span>
            <span className="dropdown-arrow">▼</span>
          </button>
          <div className="dropdown-menu">
            <button 
              className={state.schema.settings.theme === 'light' ? 'active' : ''}
              onClick={() => handleThemeChange('light')}
            >
              ☀️ Light
            </button>
            <button 
              className={state.schema.settings.theme === 'dark' ? 'active' : ''}
              onClick={() => handleThemeChange('dark')}
            >
              🌙 Dark
            </button>
          </div>
        </div>
      </div>

      <div className="toolbar-separator"></div>

      {/* Layout controls */}
      <div className="toolbar-group">
        <div className="toolbar-dropdown">
          <button 
            className="toolbar-button"
            title="Auto-arrange tables"
            disabled={isApplyingLayout}
          >
            <span className="icon">⚡</span>
            <span className="label">Layout</span>
            <span className="dropdown-arrow">▼</span>
          </button>
          <div className="dropdown-menu">
            <button 
              onClick={() => handleApplyLayout('grid')}
              title="Simple grid-based layout - Arranges tables in a uniform grid pattern"
            >
              📐 Grid Layout
            </button>
            <button 
              onClick={() => handleApplyLayout('hierarchical')}
              title="Tree-like layout based on table relationships - Parent tables at top, children below"
            >
              🌳 Hierarchical Layout
            </button>
            <button 
              onClick={() => handleApplyLayout('force-directed')}
              title="Physics-based layout that minimizes edge crossings - Tables repel each other while relationships pull them together"
            >
              🧲 Force-Directed Layout
            </button>
            <button 
              onClick={() => handleApplyLayout('star-schema')}
              title="Data warehouse layout with facts in center, dimensions around - Optimized for star schema patterns"
            >
              ⭐ Star Schema Layout
            </button>
          </div>
        </div>
      </div>

      <div className="toolbar-separator"></div>

      {/* Info */}
      <div className="toolbar-group toolbar-info">
        <div className="info-item">
          <span className="info-label">Tables:</span>
          <span className="info-value">{state.schema.tables.length}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Relations:</span>
          <span className="info-value">{state.schema.references.length}</span>
        </div>
        {state.ui.selectedItems.length > 0 && (
          <div className="info-item selected">
            <span className="info-label">Selected:</span>
            <span className="info-value">{state.ui.selectedItems.length}</span>
          </div>
        )}
      </div>
    </div>
  );
};