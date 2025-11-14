import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { parseDBML } from '../parsers/dbmlParser';
import { generateDBML } from '../parsers/dbmlGenerator';
import './DBMLEditor.css';

interface DBMLEditorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DBMLEditor: React.FC<DBMLEditorProps> = ({ isOpen, onClose }) => {
  const { state, loadSchema } = useAppContext();
  const [dbmlContent, setDbmlContent] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const debounceTimerRef = useRef<number>();

  // Generate DBML from current schema when editor opens
  useEffect(() => {
    if (isOpen) {
      const result = generateDBML(state.schema, {
        includeComments: true,
        includeMetadata: true,
        formatOutput: true
      });
      
      if (result.success) {
        setDbmlContent(result.dbml);
        setHasChanges(false);
      }
    }
  }, [isOpen, state.schema]);

  // Validate DBML with debouncing
  const validateDBML = useCallback((content: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = window.setTimeout(() => {
      try {
        const parseResult = parseDBML(content);
        
        const errorMessages = parseResult.errors
          .filter(e => e.severity === 'error')
          .map(e => `Line ${e.line}: ${e.message}`);
        
        const warningMessages = parseResult.warnings
          .map(w => `Line ${w.line}: ${w.message}`);
        
        setErrors(errorMessages);
        setWarnings(warningMessages);
        setIsValid(errorMessages.length === 0);
      } catch (error) {
        const err = error as Error;
        setErrors([`Parse error: ${err.message}`]);
        setWarnings([]);
        setIsValid(false);
      }
    }, 500); // 500ms debounce
  }, []);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setDbmlContent(newContent);
    setHasChanges(true);
    validateDBML(newContent);
  };

  const handleApply = () => {
    if (!isValid) {
      alert('Cannot apply changes: DBML has errors. Please fix them first.');
      return;
    }

    try {
      const parseResult = parseDBML(dbmlContent);
      
      if (parseResult.errors.length > 0) {
        const errorCount = parseResult.errors.filter(e => e.severity === 'error').length;
        if (errorCount > 0) {
          alert(`Cannot apply: ${errorCount} error(s) found. Please fix them first.`);
          return;
        }
      }

      loadSchema(parseResult.schema);
      setHasChanges(false);
      alert('✅ Changes applied successfully!');
    } catch (error) {
      const err = error as Error;
      alert(`Failed to apply changes: ${err.message}`);
    }
  };

  const handleSave = () => {
    if (!isValid) {
      alert('Cannot save: DBML has errors. Please fix them first.');
      return;
    }

    try {
      const blob = new Blob([dbmlContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'schema.dbml';
      a.click();
      URL.revokeObjectURL(url);
      
      setHasChanges(false);
      alert('✅ DBML file saved successfully!');
    } catch (error) {
      const err = error as Error;
      alert(`Failed to save: ${err.message}`);
    }
  };

  const handleFormat = () => {
    try {
      const parseResult = parseDBML(dbmlContent);
      const generateResult = generateDBML(parseResult.schema, {
        includeComments: true,
        includeMetadata: true,
        formatOutput: true
      });
      
      if (generateResult.success) {
        setDbmlContent(generateResult.dbml);
        setHasChanges(true);
        alert('✅ DBML formatted successfully!');
      }
    } catch (error) {
      const err = error as Error;
      alert(`Failed to format: ${err.message}`);
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      if (confirm('You have unsaved changes. Close anyway?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      // Ctrl+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      
      // Ctrl+Enter to apply
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleApply();
      }

      // Escape to close
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, hasChanges, isValid, dbmlContent]);

  if (!isOpen) return null;

  return (
    <div className="dbml-editor-overlay">
      <div className="dbml-editor">
        {/* Header */}
        <div className="dbml-editor-header">
          <div className="dbml-editor-title">
            <span className="icon">📝</span>
            <h2>DBML Editor</h2>
            {hasChanges && <span className="unsaved-indicator">●</span>}
          </div>
          <button className="close-button" onClick={handleClose} title="Close (Esc)">
            ×
          </button>
        </div>

        {/* Toolbar */}
        <div className="dbml-editor-toolbar">
          <button 
            className="editor-button primary"
            onClick={handleApply}
            disabled={!isValid || !hasChanges}
            title="Apply changes to diagram (Ctrl+Enter)"
          >
            ✓ Apply Changes
          </button>
          
          <button 
            className="editor-button"
            onClick={handleSave}
            disabled={!isValid}
            title="Save DBML file (Ctrl+S)"
          >
            💾 Save File
          </button>
          
          <button 
            className="editor-button"
            onClick={handleFormat}
            title="Format DBML"
          >
            ✨ Format
          </button>

          <div className="editor-status">
            {isValid ? (
              <span className="status-valid">✓ Valid DBML</span>
            ) : (
              <span className="status-invalid">✗ {errors.length} Error(s)</span>
            )}
            {warnings.length > 0 && (
              <span className="status-warning">⚠ {warnings.length} Warning(s)</span>
            )}
          </div>
        </div>

        {/* Editor Content */}
        <div className="dbml-editor-content">
          {/* Text Editor */}
          <div className="dbml-editor-pane">
            <div className="pane-header">
              <span>DBML Source</span>
              <span className="line-count">{dbmlContent.split('\n').length} lines</span>
            </div>
            <textarea
              ref={textareaRef}
              className="dbml-textarea"
              value={dbmlContent}
              onChange={handleContentChange}
              spellCheck={false}
              placeholder="Enter DBML code here..."
            />
          </div>

          {/* Errors/Warnings Panel */}
          {(errors.length > 0 || warnings.length > 0) && (
            <div className="dbml-messages-pane">
              <div className="pane-header">
                <span>Messages</span>
              </div>
              <div className="messages-content">
                {errors.length > 0 && (
                  <div className="message-section">
                    <h4 className="error-heading">Errors ({errors.length})</h4>
                    {errors.map((error, index) => (
                      <div key={index} className="message error-message">
                        <span className="message-icon">✗</span>
                        <span className="message-text">{error}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {warnings.length > 0 && (
                  <div className="message-section">
                    <h4 className="warning-heading">Warnings ({warnings.length})</h4>
                    {warnings.slice(0, 10).map((warning, index) => (
                      <div key={index} className="message warning-message">
                        <span className="message-icon">⚠</span>
                        <span className="message-text">{warning}</span>
                      </div>
                    ))}
                    {warnings.length > 10 && (
                      <div className="message info-message">
                        ... and {warnings.length - 10} more warnings
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="dbml-editor-footer">
          <div className="footer-info">
            <span>💡 Tip: Press <kbd>Ctrl+Enter</kbd> to apply changes, <kbd>Ctrl+S</kbd> to save</span>
          </div>
          <div className="footer-actions">
            <button className="editor-button secondary" onClick={handleClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};