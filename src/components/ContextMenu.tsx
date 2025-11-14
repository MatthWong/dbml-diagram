import React, { useEffect, useRef } from 'react';
import './ContextMenu.css';

export interface ContextMenuOption {
  id: string;
  label: string;
  icon?: string;
  action: () => void;
  disabled?: boolean;
  separator?: boolean;
}

interface ContextMenuProps {
  visible: boolean;
  position: { x: number; y: number };
  options: ContextMenuOption[];
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  visible,
  position,
  options,
  onClose
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close menu
  useEffect(() => {
    if (!visible) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [visible, onClose]);

  if (!visible) return null;

  const handleOptionClick = (option: ContextMenuOption) => {
    if (!option.disabled) {
      option.action();
      onClose();
    }
  };

  return (
    <div
      ref={menuRef}
      className="context-menu"
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 10000
      }}
    >
      {options.map((option, index) => (
        <React.Fragment key={option.id}>
          {option.separator && <div className="context-menu-separator" />}
          <div
            className={`context-menu-item ${option.disabled ? 'disabled' : ''}`}
            onClick={() => handleOptionClick(option)}
            role="menuitem"
            aria-disabled={option.disabled}
            tabIndex={option.disabled ? -1 : 0}
          >
            {option.icon && <span className="context-menu-icon">{option.icon}</span>}
            <span className="context-menu-label">{option.label}</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};
