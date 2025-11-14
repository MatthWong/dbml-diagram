import React, { useState, useEffect } from 'react';
import { Table, Column } from '../types/database';
import './RelationshipDialog.css';

export interface RelationshipConfig {
  sourceTableId: string;
  sourceColumnId: string;
  destinationTableId: string;
  destinationColumnId: string;
  relationshipType: 'one-to-one' | 'one-to-many' | 'many-to-one';
  name?: string;
  onDelete?: 'cascade' | 'restrict' | 'set null' | 'set default';
  onUpdate?: 'cascade' | 'restrict' | 'set null' | 'set default';
}

interface RelationshipDialogProps {
  isOpen: boolean;
  sourceTable: Table;
  allTables: Table[];
  onConfirm: (config: RelationshipConfig) => void;
  onCancel: () => void;
}

export const RelationshipDialog: React.FC<RelationshipDialogProps> = ({
  isOpen,
  sourceTable,
  allTables,
  onConfirm,
  onCancel
}) => {
  const [sourceColumnId, setSourceColumnId] = useState('');
  const [destinationTableId, setDestinationTableId] = useState('');
  const [destinationColumnId, setDestinationColumnId] = useState('');
  const [relationshipType, setRelationshipType] = useState<'one-to-one' | 'one-to-many' | 'many-to-one'>('many-to-one');
  const [relationshipName, setRelationshipName] = useState('');
  const [onDelete, setOnDelete] = useState<'cascade' | 'restrict' | 'set null' | 'set default' | ''>('');
  const [onUpdate, setOnUpdate] = useState<'cascade' | 'restrict' | 'set null' | 'set default' | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSourceColumnId('');
      setDestinationTableId('');
      setDestinationColumnId('');
      setRelationshipType('many-to-one');
      setRelationshipName('');
      setOnDelete('');
      setOnUpdate('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Reset destination column when destination table changes
  useEffect(() => {
    setDestinationColumnId('');
  }, [destinationTableId]);

  if (!isOpen) return null;

  const destinationTable = allTables.find(t => t.id === destinationTableId);
  const availableDestinationTables = allTables.filter(t => t.id !== sourceTable.id);

  const isFormValid = sourceColumnId && destinationTableId && destinationColumnId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);

    const config: RelationshipConfig = {
      sourceTableId: sourceTable.id,
      sourceColumnId,
      destinationTableId,
      destinationColumnId,
      relationshipType,
      name: relationshipName || undefined,
      onDelete: onDelete || undefined,
      onUpdate: onUpdate || undefined
    };

    onConfirm(config);
  };

  const getColumnIcon = (column: Column) => {
    if (column.primaryKey) return '🔑';
    if (column.foreignKey) return '🔗';
    if (column.unique) return '⭐';
    return '';
  };

  return (
    <div className="relationship-dialog-overlay" onClick={onCancel}>
      <div className="relationship-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="relationship-dialog-header">
          <h2>Create Relationship</h2>
          <button 
            className="relationship-dialog-close" 
            onClick={onCancel}
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="relationship-dialog-form">
          {/* Source Table (Read-only) */}
          <div className="form-group">
            <label>Source Table</label>
            <input
              type="text"
              value={sourceTable.name}
              readOnly
              className="form-control readonly"
            />
          </div>

          {/* Source Column */}
          <div className="form-group">
            <label htmlFor="source-column">
              Source Column <span className="required">*</span>
            </label>
            <select
              id="source-column"
              value={sourceColumnId}
              onChange={(e) => setSourceColumnId(e.target.value)}
              className="form-control"
              required
            >
              <option value="">Select a column...</option>
              {sourceTable.columns.map(column => (
                <option key={column.id} value={column.id}>
                  {getColumnIcon(column)} {column.name} ({column.type})
                </option>
              ))}
            </select>
          </div>

          {/* Destination Table */}
          <div className="form-group">
            <label htmlFor="destination-table">
              Destination Table <span className="required">*</span>
            </label>
            <select
              id="destination-table"
              value={destinationTableId}
              onChange={(e) => setDestinationTableId(e.target.value)}
              className="form-control"
              required
            >
              <option value="">Select a table...</option>
              {availableDestinationTables.map(table => (
                <option key={table.id} value={table.id}>
                  {table.schema ? `${table.schema}.${table.name}` : table.name}
                </option>
              ))}
            </select>
          </div>

          {/* Destination Column */}
          <div className="form-group">
            <label htmlFor="destination-column">
              Destination Column <span className="required">*</span>
            </label>
            <select
              id="destination-column"
              value={destinationColumnId}
              onChange={(e) => setDestinationColumnId(e.target.value)}
              className="form-control"
              required
              disabled={!destinationTableId}
            >
              <option value="">
                {destinationTableId ? 'Select a column...' : 'Select destination table first'}
              </option>
              {destinationTable?.columns.map(column => (
                <option key={column.id} value={column.id}>
                  {getColumnIcon(column)} {column.name} ({column.type})
                </option>
              ))}
            </select>
          </div>

          {/* Relationship Type */}
          <div className="form-group">
            <label>Relationship Type <span className="required">*</span></label>
            <div className="relationship-type-options">
              <label className="radio-option">
                <input
                  type="radio"
                  name="relationshipType"
                  value="many-to-one"
                  checked={relationshipType === 'many-to-one'}
                  onChange={(e) => setRelationshipType(e.target.value as any)}
                />
                <span>Many-to-One (N:1)</span>
                <small>Multiple records in source can reference one record in destination</small>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="relationshipType"
                  value="one-to-many"
                  checked={relationshipType === 'one-to-many'}
                  onChange={(e) => setRelationshipType(e.target.value as any)}
                />
                <span>One-to-Many (1:N)</span>
                <small>One record in source can reference multiple records in destination</small>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="relationshipType"
                  value="one-to-one"
                  checked={relationshipType === 'one-to-one'}
                  onChange={(e) => setRelationshipType(e.target.value as any)}
                />
                <span>One-to-One (1:1)</span>
                <small>One record in source references exactly one record in destination</small>
              </label>
            </div>
          </div>

          {/* Optional: Relationship Name */}
          <div className="form-group">
            <label htmlFor="relationship-name">Relationship Name (Optional)</label>
            <input
              id="relationship-name"
              type="text"
              value={relationshipName}
              onChange={(e) => setRelationshipName(e.target.value)}
              className="form-control"
              placeholder="e.g., fk_orders_users"
            />
          </div>

          {/* Optional: ON DELETE */}
          <div className="form-group">
            <label htmlFor="on-delete">ON DELETE (Optional)</label>
            <select
              id="on-delete"
              value={onDelete}
              onChange={(e) => setOnDelete(e.target.value as any)}
              className="form-control"
            >
              <option value="">None</option>
              <option value="cascade">CASCADE</option>
              <option value="restrict">RESTRICT</option>
              <option value="set null">SET NULL</option>
              <option value="set default">SET DEFAULT</option>
            </select>
          </div>

          {/* Optional: ON UPDATE */}
          <div className="form-group">
            <label htmlFor="on-update">ON UPDATE (Optional)</label>
            <select
              id="on-update"
              value={onUpdate}
              onChange={(e) => setOnUpdate(e.target.value as any)}
              className="form-control"
            >
              <option value="">None</option>
              <option value="cascade">CASCADE</option>
              <option value="restrict">RESTRICT</option>
              <option value="set null">SET NULL</option>
              <option value="set default">SET DEFAULT</option>
            </select>
          </div>

          {/* Form Actions */}
          <div className="relationship-dialog-actions">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Relationship'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
