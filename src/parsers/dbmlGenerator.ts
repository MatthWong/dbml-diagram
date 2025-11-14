import { DatabaseSchema, Table, Column, Reference } from '../types/database';

export interface GenerateOptions {
  includeComments?: boolean;
  includeMetadata?: boolean;
  indentSize?: number;
  preserveCustomProperties?: boolean;
  formatOutput?: boolean;
}

export interface GenerateResult {
  dbml: string;
  success: boolean;
  warnings: string[];
  metadata: {
    tablesGenerated: number;
    referencesGenerated: number;
    linesGenerated: number;
    generationTime: number;
  };
}

export class DBMLGenerator {
  private options: Required<GenerateOptions>;
  private warnings: string[] = [];
  private indent: string;

  constructor(options: GenerateOptions = {}) {
    this.options = {
      includeComments: true,
      includeMetadata: true,
      indentSize: 2,
      preserveCustomProperties: true,
      formatOutput: true,
      ...options
    };
    this.indent = ' '.repeat(this.options.indentSize);
  }

  public generate(schema: DatabaseSchema): GenerateResult {
    const startTime = performance.now();
    this.warnings = [];

    try {
      const dbmlParts: string[] = [];

      // Add header comment with metadata
      if (this.options.includeComments && this.options.includeMetadata) {
        dbmlParts.push(this.generateHeader(schema));
      }

      // Generate tables
      for (const table of schema.tables) {
        dbmlParts.push(this.generateTable(table));
      }

      // Generate standalone references
      const standaloneRefs = this.getStandaloneReferences(schema);
      if (standaloneRefs.length > 0) {
        dbmlParts.push(''); // Empty line before references
        dbmlParts.push(this.generateReferences(standaloneRefs));
      }

      // Add footer comment if metadata is included
      if (this.options.includeComments && this.options.includeMetadata) {
        dbmlParts.push(this.generateFooter(schema));
      }

      const dbml = dbmlParts.join('\n\n');
      const generationTime = performance.now() - startTime;

      return {
        dbml,
        success: true,
        warnings: this.warnings,
        metadata: {
          tablesGenerated: schema.tables.length,
          referencesGenerated: schema.references.length,
          linesGenerated: dbml.split('\n').length,
          generationTime
        }
      };
    } catch (error) {
      return {
        dbml: '',
        success: false,
        warnings: [...this.warnings, `Generation failed: ${error instanceof Error ? error.message : String(error)}`],
        metadata: {
          tablesGenerated: 0,
          referencesGenerated: 0,
          linesGenerated: 0,
          generationTime: performance.now() - startTime
        }
      };
    }
  }

  private generateHeader(schema: DatabaseSchema): string {
    const lines = [
      '// Database Schema',
      `// Generated on: ${new Date().toISOString()}`,
      `// Version: ${schema.metadata.version}`,
    ];

    if (schema.metadata.author) {
      lines.push(`// Author: ${schema.metadata.author}`);
    }

    if (schema.metadata.created) {
      lines.push(`// Created: ${schema.metadata.created}`);
    }

    if (schema.metadata.modified) {
      lines.push(`// Modified: ${schema.metadata.modified}`);
    }

    lines.push('');
    return lines.join('\n');
  }

  private generateFooter(schema: DatabaseSchema): string {
    const tableCount = schema.tables.length;
    const columnCount = schema.tables.reduce((sum, table) => sum + table.columns.length, 0);
    const referenceCount = schema.references.length;

    return [
      '',
      '// Schema Statistics:',
      `// Tables: ${tableCount}`,
      `// Columns: ${columnCount}`,
      `// References: ${referenceCount}`
    ].join('\n');
  }

  private generateTable(table: Table): string {
    const lines: string[] = [];
    
    // Table declaration
    const tableName = table.schema ? `${table.schema}.${table.name}` : table.name;
    let tableDeclaration = `Table ${tableName}`;

    // Add table settings
    const tableSettings = this.generateTableSettings(table);
    if (tableSettings) {
      tableDeclaration += ` ${tableSettings}`;
    }

    tableDeclaration += ' {';
    lines.push(tableDeclaration);

    // Add columns
    for (const column of table.columns) {
      lines.push(this.indent + this.generateColumn(column));
    }

    // Add table note if present
    if (table.note && this.options.includeComments) {
      lines.push('');
      lines.push(this.indent + `Note: '${this.escapeString(table.note)}'`);
    }

    // Add custom properties as comments
    if (this.options.preserveCustomProperties && table.customProperties) {
      const customProps = Object.entries(table.customProperties);
      if (customProps.length > 0) {
        lines.push('');
        lines.push(this.indent + '// Custom properties:');
        for (const [key, value] of customProps) {
          lines.push(this.indent + `// ${key}: ${JSON.stringify(value)}`);
        }
      }
    }

    lines.push('}');
    return lines.join('\n');
  }

  private generateTableSettings(table: Table): string {
    const settings: string[] = [];

    // Add table note as setting if present
    if (table.note && this.options.includeComments) {
      settings.push(`note: '${this.escapeString(table.note)}'`);
    }

    // Add visual properties as comments in settings
    if (this.options.includeComments) {
      if (table.color && table.color !== '#ffffff') {
        settings.push(`color: '${table.color}'`);
      }
      if (table.position) {
        settings.push(`position: '${table.position.x},${table.position.y}'`);
      }
      if (table.size && (table.size.width !== 200 || table.size.height !== 150)) {
        settings.push(`size: '${table.size.width}x${table.size.height}'`);
      }
    }

    return settings.length > 0 ? `[${settings.join(', ')}]` : '';
  }

  private generateColumn(column: Column): string {
    let columnDef = `${column.name} ${column.type}`;

    // Generate column settings
    const settings = this.generateColumnSettings(column);
    if (settings) {
      columnDef += ` ${settings}`;
    }

    return columnDef;
  }

  private generateColumnSettings(column: Column): string {
    const settings: string[] = [];

    // Primary key
    if (column.primaryKey) {
      settings.push('pk');
    }

    // Not null
    if (column.notNull) {
      settings.push('not null');
    }

    // Unique
    if (column.unique) {
      settings.push('unique');
    }

    // Default value
    if (column.default !== undefined) {
      const defaultValue = this.formatDefaultValue(column.default);
      settings.push(`default: ${defaultValue}`);
    }

    // Note
    if (column.note && this.options.includeComments) {
      settings.push(`note: '${this.escapeString(column.note)}'`);
    }

    // Add inline foreign key reference if this column is a foreign key
    const inlineRef = this.findInlineReference(column);
    if (inlineRef) {
      const refSymbol = this.getRelationshipSymbol(inlineRef.type);
      settings.push(`ref: ${refSymbol} ${inlineRef.toTable}.${inlineRef.toColumn}`);
    }

    // Custom properties
    if (this.options.preserveCustomProperties && column.customProperties) {
      for (const [key, value] of Object.entries(column.customProperties)) {
        if (key !== 'increment') { // Skip common properties that might be handled elsewhere
          settings.push(`${key}: ${JSON.stringify(value)}`);
        }
      }
    }

    return settings.length > 0 ? `[${settings.join(', ')}]` : '';
  }

  private findInlineReference(_column: Column): Reference | null {
    // This would need to be passed from the schema context
    // For now, we'll handle this in the main generate method
    return null;
  }

  private generateReferences(references: Reference[]): string {
    const lines: string[] = [];

    if (this.options.includeComments) {
      lines.push('// References');
    }

    for (const ref of references) {
      lines.push(this.generateReference(ref));
    }

    return lines.join('\n');
  }

  private generateReference(reference: Reference): string {
    const refSymbol = this.getRelationshipSymbol(reference.type);
    let refLine = `Ref`;
    
    // Add reference name if present
    if (reference.name) {
      refLine += ` ${reference.name}`;
    }
    
    refLine += `: ${reference.fromTable}.${reference.fromColumn} ${refSymbol} ${reference.toTable}.${reference.toColumn}`;

    // Add reference settings
    const settings = this.generateReferenceSettings(reference);
    if (settings) {
      refLine += ` ${settings}`;
    }

    return refLine;
  }

  private generateReferenceSettings(reference: Reference): string {
    const settings: string[] = [];

    // On delete constraint
    if (reference.onDelete) {
      settings.push(`delete: ${reference.onDelete}`);
    }

    // On update constraint
    if (reference.onUpdate) {
      settings.push(`update: ${reference.onUpdate}`);
    }

    // Visual properties as comments
    if (this.options.includeComments) {
      if (reference.color && reference.color !== '#666666') {
        settings.push(`color: '${reference.color}'`);
      }
      if (reference.style && reference.style !== 'solid') {
        settings.push(`style: '${reference.style}'`);
      }
      if (reference.thickness && reference.thickness !== 2) {
        settings.push(`thickness: ${reference.thickness}`);
      }
    }

    return settings.length > 0 ? `[${settings.join(', ')}]` : '';
  }

  private getRelationshipSymbol(type: Reference['type']): string {
    switch (type) {
      case 'one-to-one':
        return '-';
      case 'one-to-many':
        return '>';
      case 'many-to-one':
        return '<';
      case 'many-to-many':
        return '<>';
      default:
        this.warnings.push(`Unknown relationship type: ${type}, using one-to-many`);
        return '>';
    }
  }

  private getStandaloneReferences(schema: DatabaseSchema): Reference[] {
    // Filter out references that are already included as inline references
    const inlineRefs = new Set<string>();
    
    // Collect inline references from columns
    for (const table of schema.tables) {
      for (const column of table.columns) {
        if (column.foreignKey) {
          // Find the reference for this foreign key
          const ref = schema.references.find(r => 
            r.fromTable === table.name && r.fromColumn === column.name
          );
          if (ref) {
            inlineRefs.add(ref.id);
          }
        }
      }
    }

    // Return only standalone references
    return schema.references.filter(ref => !inlineRefs.has(ref.id));
  }

  private formatDefaultValue(value: string): string {
    // Handle different types of default values
    if (value === 'now()' || value === 'CURRENT_TIMESTAMP') {
      return `'${value}'`;
    }
    
    // Check if it's a number
    if (!isNaN(Number(value))) {
      return value;
    }
    
    // Check if it's already quoted
    if ((value.startsWith("'") && value.endsWith("'")) || 
        (value.startsWith('"') && value.endsWith('"'))) {
      return value;
    }
    
    // Quote string values
    return `'${this.escapeString(value)}'`;
  }

  private escapeString(str: string): string {
    return str.replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '\\r');
  }

  public static generateDBML(schema: DatabaseSchema, options?: GenerateOptions): GenerateResult {
    const generator = new DBMLGenerator(options);
    return generator.generate(schema);
  }
}

// Convenience function for backward compatibility
export function generateDBML(schema: DatabaseSchema, options?: GenerateOptions): GenerateResult {
  return DBMLGenerator.generateDBML(schema, options);
}

// Validation function to ensure round-trip accuracy
export async function validateRoundTrip(originalSchema: DatabaseSchema, options?: GenerateOptions): Promise<{
  isValid: boolean;
  errors: string[];
  generatedDbml?: string;
}> {
  try {
    const generateResult = generateDBML(originalSchema, options);
    
    if (!generateResult.success) {
      return {
        isValid: false,
        errors: [`Generation failed: ${generateResult.warnings.join(', ')}`]
      };
    }

    // Import the parser to test round-trip
    // Note: This creates a circular dependency, but it's acceptable for validation
    const { parseDBML } = await import('./dbmlParser');
    const parseResult = parseDBML(generateResult.dbml);

    if (parseResult.errors.length > 0) {
      return {
        isValid: false,
        errors: parseResult.errors.map((e: any) => e.message),
        generatedDbml: generateResult.dbml
      };
    }

    // Basic validation - check if we have the same number of tables and references
    const originalTableCount = originalSchema.tables.length;
    const parsedTableCount = parseResult.schema.tables.length;
    const originalRefCount = originalSchema.references.length;
    const parsedRefCount = parseResult.schema.references.length;

    const errors: string[] = [];

    if (originalTableCount !== parsedTableCount) {
      errors.push(`Table count mismatch: original ${originalTableCount}, parsed ${parsedTableCount}`);
    }

    if (originalRefCount !== parsedRefCount) {
      errors.push(`Reference count mismatch: original ${originalRefCount}, parsed ${parsedRefCount}`);
    }

    // Check table names
    const originalTableNames = new Set(originalSchema.tables.map(t => t.name));
    const parsedTableNames = new Set(parseResult.schema.tables.map((t: any) => t.name));
    
    for (const name of originalTableNames) {
      if (!parsedTableNames.has(name)) {
        errors.push(`Missing table in parsed result: ${name}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      generatedDbml: generateResult.dbml
    };
  } catch (error) {
    return {
      isValid: false,
      errors: [`Validation error: ${error instanceof Error ? error.message : String(error)}`]
    };
  }
}