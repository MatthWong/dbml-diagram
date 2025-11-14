import { useState, useEffect, useCallback, useRef } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { DiagramCanvas } from './components/DiagramCanvas';
import { Toolbar } from './components/Toolbar';
import { parseDBML } from './parsers/dbmlParser';
import { DatabaseSchema } from './types/database';
import { DEFAULT_DATABASE_SCHEMA } from './constants/defaults';
import './App.css';

// Sample DBML for initial load
const SAMPLE_DBML = `
// E-commerce Database Schema
Table users {
  id integer [pk, increment]
  username varchar(50) [unique, not null]
  email varchar(255) [unique, not null]
  password_hash varchar(255) [not null]
  created_at timestamp [default: 'now()']
  updated_at timestamp [default: 'now()']
  Note: 'User accounts and authentication'
}

Table products {
  id integer [pk, increment]
  name varchar(255) [not null]
  description text
  price decimal(10,2) [not null]
  stock_quantity integer [default: 0]
  category_id integer [not null]
  created_at timestamp [default: 'now()']
  updated_at timestamp [default: 'now()']
}

Table categories {
  id integer [pk, increment]
  name varchar(100) [unique, not null]
  description text
  parent_id integer
}

Table orders {
  id integer [pk, increment]
  user_id integer [not null]
  status varchar(20) [default: 'pending']
  total_amount decimal(10,2) [not null]
  created_at timestamp [default: 'now()']
  updated_at timestamp [default: 'now()']
}

Table order_items {
  id integer [pk, increment]
  order_id integer [not null]
  product_id integer [not null]
  quantity integer [not null]
  price decimal(10,2) [not null]
}

Table reviews {
  id integer [pk, increment]
  product_id integer [not null]
  user_id integer [not null]
  rating integer [not null]
  comment text
  created_at timestamp [default: 'now()']
}

// References
Ref: products.category_id > categories.id [delete: restrict]
Ref: categories.parent_id > categories.id [delete: cascade]
Ref: orders.user_id > users.id [delete: cascade]
Ref: order_items.order_id > orders.id [delete: cascade]
Ref: order_items.product_id > products.id [delete: restrict]
Ref: reviews.product_id > products.id [delete: cascade]
Ref: reviews.user_id > users.id [delete: cascade]
`;

function App() {
  const [schema, setSchema] = useState<DatabaseSchema>(DEFAULT_DATABASE_SCHEMA);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dbmlContent, setDbmlContent] = useState('');
  const [validationErrors, setValidationErrors] = useState<Array<{ line: number; message: string }>>([]);
  const [isValidating, setIsValidating] = useState(false);
  const debounceTimerRef = useRef<number>();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load initial schema
  useEffect(() => {
    const loadSchema = async () => {
      // Try to load raw_events.dbml first, then flights.dbml
      const filesToTry = ['/raw_events.dbml', '/flights.dbml'];
      
      for (const file of filesToTry) {
        try {
          const response = await fetch(file);
          if (response.ok) {
            const content = await response.text();
            setDbmlContent(content);
            
            const parseResult = parseDBML(content);
            
            if (parseResult.errors.length > 0) {
              console.warn('Parse errors:', parseResult.errors);
            }
            
            if (parseResult.warnings.length > 0) {
              console.warn('Parse warnings:', parseResult.warnings);
            }
            
            console.log(`✅ Loaded ${file}: ${parseResult.schema.tables.length} tables, ${parseResult.schema.references.length} references`);
            setSchema(parseResult.schema);
            setIsLoading(false);
            return;
          }
        } catch (err) {
          console.warn(`Could not load ${file}`);
        }
      }
      
      // Fallback to sample schema
      try {
        setDbmlContent(SAMPLE_DBML);
        const parseResult = parseDBML(SAMPLE_DBML);
        
        if (parseResult.errors.length > 0) {
          console.warn('Parse warnings:', parseResult.errors);
        }
        
        setSchema(parseResult.schema);
        setIsLoading(false);
      } catch (err) {
        const error = err as Error;
        setError(`Failed to load schema: ${error.message}`);
        setIsLoading(false);
      }
    };
    
    loadSchema();
  }, []);

  // Validate and update schema with debouncing
  const validateAndUpdateSchema = useCallback((content: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setIsValidating(true);

    debounceTimerRef.current = window.setTimeout(() => {
      try {
        const parseResult = parseDBML(content);
        
        const errorMessages = parseResult.errors
          .filter(e => e.severity === 'error')
          .map(e => ({ line: e.line, message: e.message }));
        
        setValidationErrors(errorMessages);
        
        // Only update schema if no errors
        if (errorMessages.length === 0) {
          setSchema(parseResult.schema);
          console.log('✅ Schema updated from DBML');
        }
        
        setIsValidating(false);
      } catch (error) {
        const err = error as Error;
        setValidationErrors([{ line: 0, message: `Parse error: ${err.message}` }]);
        setIsValidating(false);
      }
    }, 1000); // 1 second debounce
  }, []);

  // Handle DBML content change
  const handleDbmlChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setDbmlContent(newContent);
    validateAndUpdateSchema(newContent);
  }, [validateAndUpdateSchema]);

  // Handle DBML update from diagram (e.g., relationship creation)
  const handleDBMLUpdate = useCallback((newContent: string) => {
    setDbmlContent(newContent);
    validateAndUpdateSchema(newContent);
  }, [validateAndUpdateSchema]);

  // Sync line numbers scroll with textarea
  const handleScroll = useCallback((e: React.UIEvent<HTMLTextAreaElement>) => {
    const lineNumbersDiv = e.currentTarget.previousElementSibling as HTMLDivElement;
    if (lineNumbersDiv) {
      lineNumbersDiv.scrollTop = e.currentTarget.scrollTop;
    }
  }, []);

  // Jump to specific line in editor
  const jumpToLine = useCallback((lineNumber: number) => {
    if (!textareaRef.current) return;
    
    const lines = dbmlContent.split('\n');
    let charPosition = 0;
    
    // Calculate character position for the target line
    for (let i = 0; i < lineNumber - 1 && i < lines.length; i++) {
      charPosition += lines[i].length + 1; // +1 for newline
    }
    
    // Set cursor position and focus
    textareaRef.current.focus();
    textareaRef.current.setSelectionRange(charPosition, charPosition + (lines[lineNumber - 1]?.length || 0));
    textareaRef.current.scrollTop = Math.max(0, (lineNumber - 5) * 20); // Scroll to show line with context
  }, [dbmlContent]);

  // Handle file import
  const handleImport = useCallback(async (file: File) => {
    try {
      const content = await file.text();
      setDbmlContent(content);
      
      const parseResult = parseDBML(content);
      
      if (parseResult.errors.length > 0) {
        console.warn('Parse errors:', parseResult.errors);
        const errorMessages = parseResult.errors
          .filter(e => e.severity === 'error')
          .map(e => ({ line: e.line, message: e.message }));
        setValidationErrors(errorMessages);
        
        if (errorMessages.length === 0) {
          setSchema(parseResult.schema);
        }
      } else {
        setSchema(parseResult.schema);
        setValidationErrors([]);
      }
      
      setError(null);
    } catch (err) {
      const error = err as Error;
      setError(`Failed to import file: ${error.message}`);
    }
  }, []);

  // Handle file export
  const handleExport = useCallback((format: 'dbml' | 'json' | 'png' | 'svg') => {
    try {
      if (format === 'dbml') {
        const blob = new Blob([dbmlContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'schema.dbml';
        a.click();
        URL.revokeObjectURL(url);
      } else if (format === 'json') {
        const json = JSON.stringify(schema, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'schema.json';
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      const error = err as Error;
      setError(`Failed to export: ${error.message}`);
    }
  }, [schema, dbmlContent]);

  // Handle new schema
  const handleNew = useCallback(() => {
    if (confirm('Create a new schema? Any unsaved changes will be lost.')) {
      const emptyDbml = '// New Database Schema\n\n';
      setDbmlContent(emptyDbml);
      setSchema(DEFAULT_DATABASE_SCHEMA);
      setValidationErrors([]);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading DBML Diagram Visualizer...</p>
      </div>
    );
  }

  return (
    <AppProvider initialSchema={schema}>
      <AppContent 
        error={error}
        setError={setError}
        handleNew={handleNew}
        handleImport={handleImport}
        handleExport={handleExport}
        handleDBMLUpdate={handleDBMLUpdate}
        dbmlContent={dbmlContent}
        handleDbmlChange={handleDbmlChange}
        handleScroll={handleScroll}
        isValidating={isValidating}
        validationErrors={validationErrors}
        jumpToLine={jumpToLine}
        textareaRef={textareaRef}
      />
    </AppProvider>
  );
}

// Inner component that has access to AppContext
function AppContent({ 
  error, 
  setError, 
  handleNew, 
  handleImport, 
  handleExport,
  handleDBMLUpdate,
  dbmlContent,
  handleDbmlChange,
  handleScroll,
  isValidating,
  validationErrors,
  jumpToLine,
  textareaRef
}: {
  error: string | null;
  setError: (error: string | null) => void;
  handleNew: () => void;
  handleImport: (file: File) => Promise<void>;
  handleExport: (format: 'dbml' | 'json' | 'png' | 'svg') => void;
  handleDBMLUpdate: (content: string) => void;
  dbmlContent: string;
  handleDbmlChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleScroll: (e: React.UIEvent<HTMLTextAreaElement>) => void;
  isValidating: boolean;
  validationErrors: Array<{ line: number; message: string }>;
  jumpToLine: (line: number) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
}) {
  const { state } = useAppContext();
  const theme = state.schema.settings.theme;
  const isDark = theme === 'dark';

  return (
    <div className={`app ${isDark ? 'dark-mode' : ''}`}>
      {/* Header */}
      <header className="app-header">
        <div className="app-title">
          <h1>DBML Diagram Visualizer</h1>
          <span className="app-version">v0.1.0</span>
        </div>
      </header>

      {/* Toolbar */}
      <Toolbar
        onNew={handleNew}
        onImport={handleImport}
        onExport={handleExport}
      />

      {/* Error display */}
      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          <span className="error-message">{error}</span>
          <button 
            className="error-close"
            onClick={() => setError(null)}
          >
            ×
          </button>
        </div>
      )}

      {/* Main content - Split pane */}
      <main className="app-main split-view">
        {/* Left pane - DBML Editor */}
        <div className="editor-pane">
          <div className="editor-header">
            <span className="editor-title">DBML Source</span>
            <span className="editor-status">
              {isValidating ? (
                <span className="status-validating">⏳ Validating...</span>
              ) : validationErrors.length > 0 ? (
                <span className="status-error">✗ {validationErrors.length} Error(s)</span>
              ) : (
                <span className="status-valid">✓ Valid</span>
              )}
            </span>
          </div>
          <div className="editor-container">
            <div className="line-numbers">
              {dbmlContent.split('\n').map((_, index) => (
                <div key={index} className="line-number">
                  {index + 1}
                </div>
              ))}
            </div>
            <textarea
              ref={textareaRef}
              className="dbml-editor-textarea"
              value={dbmlContent}
              onChange={handleDbmlChange}
              onScroll={handleScroll}
              spellCheck={false}
              placeholder="Enter DBML code here..."
            />
          </div>
          {validationErrors.length > 0 && (
            <div className="editor-errors">
              <div className="errors-header">Errors ({validationErrors.length}):</div>
              <div className="errors-list">
                {validationErrors.map((error, index) => (
                  <div 
                    key={index} 
                    className="error-item clickable"
                    onClick={() => jumpToLine(error.line)}
                    title={`Click to jump to line ${error.line}`}
                  >
                    <span className="error-icon">✗</span>
                    <span className="error-line">Line {error.line}:</span>
                    <span className="error-text">{error.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right pane - Diagram Canvas */}
        <div className="canvas-pane">
          <DiagramCanvas 
            onDBMLUpdate={handleDBMLUpdate}
            dbmlContent={dbmlContent}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-info">
          <span>{state.schema.tables.length} tables</span>
          <span>•</span>
          <span>{state.schema.references.length} relationships</span>
          <span>•</span>
          <span>{state.schema.annotations.length} annotations</span>
        </div>
        <div className="footer-help">
          <span>Edit DBML on the left, see live preview on the right</span>
        </div>
      </footer>
    </div>
  );
}

export default App;