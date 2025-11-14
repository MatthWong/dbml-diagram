import { 
  DatabaseSchema, 
  Table, 
  Column, 
  Reference, 
  ParseResult, 
  ParseError, 
  ParseWarning 
} from '../types/database';
import { DEFAULT_DATABASE_SCHEMA, DEFAULT_TABLE_SIZE } from '../constants/defaults';

// Enhanced DBML parser with comprehensive error handling and feature support
export class DBMLParser {
  private lines: string[] = [];
  private currentLine = 0;
  private errors: ParseError[] = [];
  private warnings: ParseWarning[] = [];
  private tables: Table[] = [];
  private references: Reference[] = [];
  private tableIndex = 0;
  private referenceIndex = 0;

  public parse(dbmlContent: string): ParseResult {
    const startTime = performance.now();
    
    // Reset parser state
    this.reset();
    
    // Preprocess content
    this.lines = this.preprocessContent(dbmlContent);
    
    try {
      this.parseContent();
    } catch (error) {
      this.addError(this.currentLine, 0, `Fatal parsing error: ${error instanceof Error ? error.message : String(error)}`, 'error');
    }

    const parseTime = performance.now() - startTime;
    
    // Create schema with defaults
    const schema: DatabaseSchema = {
      ...DEFAULT_DATABASE_SCHEMA,
      tables: this.tables,
      references: this.references,
      metadata: {
        ...DEFAULT_DATABASE_SCHEMA.metadata,
        modified: new Date().toISOString()
      }
    };

    return {
      schema,
      errors: this.errors,
      warnings: this.warnings,
      metadata: {
        parseTime,
        linesProcessed: this.lines.length,
        featuresUsed: this.getUsedFeatures()
      }
    };
  }

  private reset(): void {
    this.lines = [];
    this.currentLine = 0;
    this.errors = [];
    this.warnings = [];
    this.tables = [];
    this.references = [];
    this.tableIndex = 0;
    this.referenceIndex = 0;
  }

  private preprocessContent(content: string): string[] {
    return content
      .split('\n')
      .map((line, index) => ({ line: line.trim(), originalIndex: index + 1 }))
      .filter(({ line }) => line.length > 0 && !line.startsWith('//'))
      .map(({ line }) => line);
  }

  private parseContent(): void {
    while (this.currentLine < this.lines.length) {
      const line = this.lines[this.currentLine];
      
      try {
        if (this.isTableDefinition(line)) {
          this.parseTable();
        } else if (this.isReferenceDefinition(line)) {
          this.parseReference();
        } else if (this.isEnumDefinition(line)) {
          this.parseEnum();
        } else if (this.isProjectDefinition(line)) {
          this.parseProject();
        } else if (this.isTableGroupDefinition(line)) {
          this.parseTableGroup();
        } else if (this.isIndexDefinition(line)) {
          this.parseIndex();
        } else {
          this.addWarning(this.currentLine, 0, `Unrecognized syntax: ${line}`);
        }
      } catch (error) {
        this.addError(this.currentLine, 0, `Error parsing line: ${error instanceof Error ? error.message : String(error)}`, 'error');
      }
      
      this.currentLine++;
    }
  }

  private isTableDefinition(line: string): boolean {
    return /^(Table|table)\s+\w+/.test(line);
  }

  private isReferenceDefinition(line: string): boolean {
    return /^(Ref|ref):/.test(line);
  }

  private isEnumDefinition(line: string): boolean {
    return /^(Enum|enum)\s+\w+/.test(line);
  }

  private isProjectDefinition(line: string): boolean {
    return /^(Project|project)\s+\w+/.test(line);
  }

  private isTableGroupDefinition(line: string): boolean {
    return /^(TableGroup|tablegroup)\s+\w+/.test(line);
  }

  private isIndexDefinition(line: string): boolean {
    return /^(Indexes|indexes)\s*{/.test(line);
  }

  private parseTable(): void {
    const line = this.lines[this.currentLine];
    const tableMatch = line.match(/^(Table|table)\s+([\w_]+(?:\.[\w_]+)?)\s*(\[.*\])?\s*{?/);
    
    if (!tableMatch) {
      this.addError(this.currentLine, 0, 'Invalid table definition syntax', 'error');
      return;
    }

    const [, , fullTableName, settings] = tableMatch;
    const [schema, tableName] = fullTableName.includes('.') 
      ? fullTableName.split('.') 
      : [undefined, fullTableName];

    // Validate table name
    if (!this.isValidIdentifier(tableName)) {
      this.addError(this.currentLine, 0, `Invalid table name: ${tableName}`, 'error');
      return;
    }

    // Check for duplicate table names
    if (this.tables.some(t => t.name === tableName && t.schema === schema)) {
      this.addError(this.currentLine, 0, `Duplicate table name: ${fullTableName}`, 'error');
      return;
    }

    const table: Table = {
      id: `table_${this.tableIndex++}`,
      name: tableName,
      schema,
      columns: [],
      position: this.calculateTablePosition(),
      size: { ...DEFAULT_TABLE_SIZE },
      customProperties: {}
    };

    // Parse table settings if present
    if (settings) {
      this.parseTableSettings(table, settings);
    }

    this.tables.push(table);

    // Parse table body if it starts with '{'
    if (line.includes('{')) {
      this.parseTableBody(table);
    }
  }

  private parseTableBody(table: Table): void {
    this.currentLine++; // Move past the opening brace
    
    while (this.currentLine < this.lines.length) {
      const line = this.lines[this.currentLine];
      
      if (line === '}') {
        break; // End of table
      }
      
      if (this.isColumnDefinition(line)) {
        const column = this.parseColumn(line);
        if (column) {
          table.columns.push(column);
        }
      } else if (this.isIndexDefinition(line)) {
        this.parseTableIndex(table);
      } else if (line.startsWith('Note:')) {
        table.note = this.parseNote(line);
      } else {
        this.addWarning(this.currentLine, 0, `Unrecognized table content: ${line}`);
      }
      
      this.currentLine++;
    }
  }

  private isColumnDefinition(line: string): boolean {
    // Match both quoted and unquoted column names
    return /^(?:"[^"]+"|'[^']+'|[\w_]+)\s+[\w_]+/.test(line) && !line.startsWith('Note:') && !line.startsWith('Indexes:');
  }

  private parseColumn(line: string): Column | null {
    // Updated regex to handle quoted column names (with dots, brackets, etc.)
    const columnMatch = line.match(/^(?:"([^"]+)"|'([^']+)'|([\w_]+))\s+([\w_]+(?:\(\d+(?:,\s*\d+)?\))?)\s*(\[.*\])?/);
    
    if (!columnMatch) {
      this.addError(this.currentLine, 0, `Invalid column definition: ${line}`, 'error');
      return null;
    }

    // Extract column name from either quoted or unquoted match
    const columnName = columnMatch[1] || columnMatch[2] || columnMatch[3];
    const columnType = columnMatch[4];
    const settings = columnMatch[5];

    // Validate column name (skip validation for quoted names as they can contain special chars)
    if (!columnMatch[1] && !columnMatch[2] && !this.isValidIdentifier(columnName)) {
      this.addError(this.currentLine, 0, `Invalid column name: ${columnName}`, 'error');
      return null;
    }

    const column: Column = {
      id: `col_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: columnName,
      type: columnType,
      customProperties: {}
    };

    // Parse column settings
    if (settings) {
      this.parseColumnSettings(column, settings);
    }

    return column;
  }

  private parseColumnSettings(column: Column, settings: string): void {
    const settingsContent = settings.slice(1, -1); // Remove brackets
    const settingsParts = this.parseSettingsString(settingsContent);

    for (const setting of settingsParts) {
      // Split only on the first colon to preserve colons in values (e.g., "note: 'Sample values: 1, 2, 3'")
      const colonIndex = setting.indexOf(':');
      const key = colonIndex !== -1 ? setting.substring(0, colonIndex).trim() : setting.trim();
      const value = colonIndex !== -1 ? setting.substring(colonIndex + 1).trim() : undefined;
      
      switch (key.toLowerCase()) {
        case 'pk':
        case 'primary key':
          column.primaryKey = true;
          break;
        case 'not null':
          column.notNull = true;
          break;
        case 'unique':
          column.unique = true;
          break;
        case 'default':
          column.default = value ? value.replace(/['"]/g, '') : undefined;
          break;
        case 'note':
          // Remove only the outer quotes, preserve inner quotes
          column.note = value ? value.replace(/^['"]|['"]$/g, '') : undefined;
          break;
        case 'ref':
          // Handle inline foreign key reference
          if (value) {
            this.parseInlineReference(column, value);
          }
          break;
        default:
          // Store unknown settings as custom properties
          column.customProperties = column.customProperties || {};
          column.customProperties[key] = value || true;
          this.addWarning(this.currentLine, 0, `Unknown column setting: ${key}`);
      }
    }
  }

  private parseInlineReference(column: Column, refValue: string): void {
    const refMatch = refValue.match(/([<>-]+)\s*([\w_]+)\.([\w_]+)/);
    if (refMatch) {
      const [, relType, toTable, toColumn] = refMatch;
      
      // Find the table this column belongs to
      const fromTable = this.tables[this.tables.length - 1]; // Current table being parsed
      
      const reference: Reference = {
        id: `ref_${this.referenceIndex++}`,
        fromTable: fromTable.name,
        fromColumn: column.name,
        toTable,
        toColumn,
        type: this.parseRelationshipType(relType)
      };

      this.references.push(reference);
      column.foreignKey = true;
    }
  }

  private parseReference(): void {
    const line = this.lines[this.currentLine];
    // Updated regex to properly handle table names with underscores and optional reference names
    const refMatch = line.match(/^(Ref|ref):\s*(?:(\w+)\s+)?([\w_]+)\.([\w_]+)\s*([<>-]+)\s*([\w_]+)\.([\w_]+)(?:\s*\[([^\]]+)\])?/);
    
    if (!refMatch) {
      this.addError(this.currentLine, 0, `Invalid reference syntax: ${line}`, 'error');
      return;
    }

    const [, , refName, fromTable, fromColumn, relType, toTable, toColumn, settings] = refMatch;

    // Validate that referenced tables and columns exist
    const fromTableObj = this.tables.find(t => t.name === fromTable);
    const toTableObj = this.tables.find(t => t.name === toTable);

    if (!fromTableObj) {
      this.addError(this.currentLine, 0, `Referenced table not found: ${fromTable}`, 'error');
      return;
    }

    if (!toTableObj) {
      this.addError(this.currentLine, 0, `Referenced table not found: ${toTable}`, 'error');
      return;
    }

    const fromColumnObj = fromTableObj.columns.find(c => c.name === fromColumn);
    const toColumnObj = toTableObj.columns.find(c => c.name === toColumn);

    if (!fromColumnObj) {
      this.addError(this.currentLine, 0, `Referenced column not found: ${fromTable}.${fromColumn}`, 'error');
      return;
    }

    if (!toColumnObj) {
      this.addError(this.currentLine, 0, `Referenced column not found: ${toTable}.${toColumn}`, 'error');
      return;
    }

    const reference: Reference = {
      id: `ref_${this.referenceIndex++}`,
      name: refName,
      fromTable,
      fromColumn,
      toTable,
      toColumn,
      type: this.parseRelationshipType(relType)
    };

    // Parse reference settings
    if (settings) {
      this.parseReferenceSettings(reference, settings);
    }

    this.references.push(reference);

    // Mark the from column as a foreign key
    fromColumnObj.foreignKey = true;
  }

  private parseRelationshipType(relType: string): Reference['type'] {
    if (relType.includes('<') && relType.includes('>')) {
      return 'many-to-many';
    } else if (relType.includes('<')) {
      return 'many-to-one';
    } else if (relType.includes('>')) {
      return 'one-to-many';
    } else {
      return 'one-to-one';
    }
  }

  private parseReferenceSettings(reference: Reference, settings: string): void {
    const settingsParts = this.parseSettingsString(settings);

    for (const setting of settingsParts) {
      // Split only on the first colon to preserve colons in values
      const colonIndex = setting.indexOf(':');
      const key = colonIndex !== -1 ? setting.substring(0, colonIndex).trim() : setting.trim();
      const value = colonIndex !== -1 ? setting.substring(colonIndex + 1).trim() : undefined;
      
      switch (key.toLowerCase()) {
        case 'delete':
        case 'on delete':
          reference.onDelete = value as Reference['onDelete'];
          break;
        case 'update':
        case 'on update':
          reference.onUpdate = value as Reference['onUpdate'];
          break;
        default:
          this.addWarning(this.currentLine, 0, `Unknown reference setting: ${key}`);
      }
    }
  }

  private parseEnum(): void {
    // Placeholder for enum parsing - not directly used in visualization but logged as feature
    const line = this.lines[this.currentLine];
    this.addWarning(this.currentLine, 0, `Enum definitions are not fully supported in visualization: ${line}`);
  }

  private parseProject(): void {
    // Placeholder for project parsing - metadata only
    const line = this.lines[this.currentLine];
    this.addWarning(this.currentLine, 0, `Project definitions are parsed as metadata only: ${line}`);
  }

  private parseTableGroup(): void {
    // Placeholder for table group parsing - visual grouping feature
    const line = this.lines[this.currentLine];
    this.addWarning(this.currentLine, 0, `Table groups are not yet supported in visualization: ${line}`);
  }

  private parseIndex(): void {
    // Placeholder for index parsing - not directly visualized
    const line = this.lines[this.currentLine];
    this.addWarning(this.currentLine, 0, `Index definitions are not visualized: ${line}`);
  }

  private parseTableIndex(_table: Table): void {
    // Placeholder for table-specific index parsing
    this.addWarning(this.currentLine, 0, `Table indexes are not visualized`);
  }

  private parseTableSettings(table: Table, settings: string): void {
    const settingsContent = settings.slice(1, -1); // Remove brackets
    const settingsParts = this.parseSettingsString(settingsContent);

    for (const setting of settingsParts) {
      // Split only on the first colon to preserve colons in values
      const colonIndex = setting.indexOf(':');
      const key = colonIndex !== -1 ? setting.substring(0, colonIndex).trim() : setting.trim();
      const value = colonIndex !== -1 ? setting.substring(colonIndex + 1).trim() : undefined;
      
      switch (key.toLowerCase()) {
        case 'note':
          // Remove only the outer quotes, preserve inner quotes
          table.note = value ? value.replace(/^['"]|['"]$/g, '') : undefined;
          break;
        default:
          table.customProperties = table.customProperties || {};
          table.customProperties[key] = value || true;
          this.addWarning(this.currentLine, 0, `Unknown table setting: ${key}`);
      }
    }
  }

  private parseNote(line: string): string {
    const noteMatch = line.match(/^Note:\s*['"]?([^'"]+)['"]?/);
    return noteMatch ? noteMatch[1] : '';
  }

  private parseSettingsString(settings: string): string[] {
    // Simple settings parser - handles comma-separated key:value pairs
    const parts: string[] = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';

    for (let i = 0; i < settings.length; i++) {
      const char = settings[i];
      
      if ((char === '"' || char === "'") && !inQuotes) {
        inQuotes = true;
        quoteChar = char;
        current += char;
      } else if (char === quoteChar && inQuotes) {
        inQuotes = false;
        quoteChar = '';
        current += char;
      } else if (char === ',' && !inQuotes) {
        if (current.trim()) {
          parts.push(current.trim());
        }
        current = '';
      } else {
        current += char;
      }
    }

    if (current.trim()) {
      parts.push(current.trim());
    }

    return parts;
  }

  private calculateTablePosition(): { x: number; y: number } {
    const spacing = 300;
    const tablesPerRow = 3;
    const row = Math.floor(this.tableIndex / tablesPerRow);
    const col = this.tableIndex % tablesPerRow;
    
    return {
      x: 100 + (col * spacing),
      y: 100 + (row * 250)
    };
  }

  private isValidIdentifier(name: string): boolean {
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
  }

  private addError(line: number, column: number, message: string, severity: 'error' | 'warning'): void {
    this.errors.push({
      line: line + 1, // Convert to 1-based line numbers
      column,
      message,
      severity,
      suggestion: this.getSuggestion(message)
    });
  }

  private addWarning(line: number, column: number, message: string): void {
    this.warnings.push({
      line: line + 1, // Convert to 1-based line numbers
      column,
      message,
      suggestion: this.getSuggestion(message)
    });
  }

  private getSuggestion(message: string): string | undefined {
    // Simple suggestion system based on common errors
    if (message.includes('Invalid table name')) {
      return 'Table names must start with a letter or underscore and contain only letters, numbers, and underscores';
    }
    if (message.includes('Invalid column name')) {
      return 'Column names must start with a letter or underscore and contain only letters, numbers, and underscores';
    }
    if (message.includes('Duplicate table name')) {
      return 'Each table must have a unique name within its schema';
    }
    if (message.includes('Referenced table not found')) {
      return 'Make sure the referenced table is defined before creating references to it';
    }
    return undefined;
  }

  private getUsedFeatures(): string[] {
    const features: string[] = ['tables', 'columns'];
    
    if (this.references.length > 0) {
      features.push('references');
    }
    
    if (this.tables.some(t => t.note)) {
      features.push('table_notes');
    }
    
    if (this.tables.some(t => t.columns.some(c => c.note))) {
      features.push('column_notes');
    }
    
    if (this.tables.some(t => t.columns.some(c => c.primaryKey))) {
      features.push('primary_keys');
    }
    
    if (this.tables.some(t => t.columns.some(c => c.foreignKey))) {
      features.push('foreign_keys');
    }
    
    return features;
  }
}

// Convenience function for backward compatibility
export function parseDBML(dbmlContent: string): ParseResult {
  const parser = new DBMLParser();
  return parser.parse(dbmlContent);
}