import { Table, Column } from '../types/database';
import { RelationshipConfig } from '../components/RelationshipDialog';

export class DBMLReferenceGenerator {
  /**
   * Generate DBML reference syntax from relationship configuration
   */
  static generateReference(
    config: RelationshipConfig,
    sourceTable: Table,
    destinationTable: Table
  ): string {
    const sourceColumn = sourceTable.columns.find(c => c.id === config.sourceColumnId);
    const destColumn = destinationTable.columns.find(c => c.id === config.destinationColumnId);

    if (!sourceColumn || !destColumn) {
      throw new Error('Source or destination column not found');
    }

    // Determine the relationship symbol based on type
    let symbol: string;
    switch (config.relationshipType) {
      case 'one-to-one':
        symbol = '-';
        break;
      case 'one-to-many':
        symbol = '<';
        break;
      case 'many-to-one':
        symbol = '>';
        break;
      default:
        symbol = '>';
    }

    // Build the reference line
    const sourceTableName = sourceTable.schema 
      ? `${sourceTable.schema}.${sourceTable.name}`
      : sourceTable.name;
    
    const destTableName = destinationTable.schema
      ? `${destinationTable.schema}.${destinationTable.name}`
      : destinationTable.name;

    let referenceLine = `Ref`;
    
    // Add name if provided
    if (config.name) {
      referenceLine += ` ${config.name}`;
    }
    
    referenceLine += `: ${sourceTableName}.${sourceColumn.name} ${symbol} ${destTableName}.${destColumn.name}`;

    // Add ON DELETE/UPDATE if provided
    const constraints: string[] = [];
    if (config.onDelete) {
      constraints.push(`[delete: ${config.onDelete}]`);
    }
    if (config.onUpdate) {
      constraints.push(`[update: ${config.onUpdate}]`);
    }

    if (constraints.length > 0) {
      referenceLine += ` ${constraints.join(' ')}`;
    }

    return referenceLine;
  }

  /**
   * Insert reference into DBML content
   * Appends the reference at the end of the file
   */
  static insertReference(dbmlContent: string, reference: string): string {
    // Trim any trailing whitespace
    const trimmedContent = dbmlContent.trimEnd();
    
    // Add the reference with proper spacing
    return `${trimmedContent}\n\n${reference}\n`;
  }

  /**
   * Validate if a reference already exists
   */
  static validateReference(
    config: RelationshipConfig,
    sourceTable: Table,
    destinationTable: Table,
    existingReferences: any[]
  ): { valid: boolean; message?: string } {
    const sourceColumn = sourceTable.columns.find(c => c.id === config.sourceColumnId);
    const destColumn = destinationTable.columns.find(c => c.id === config.destinationColumnId);

    if (!sourceColumn || !destColumn) {
      return {
        valid: false,
        message: 'Source or destination column not found'
      };
    }

    // Check for duplicate relationships
    const duplicate = existingReferences.find(ref =>
      ref.fromTable === sourceTable.name &&
      ref.fromColumn === sourceColumn.name &&
      ref.toTable === destinationTable.name &&
      ref.toColumn === destColumn.name
    );

    if (duplicate) {
      return {
        valid: false,
        message: 'A relationship between these columns already exists'
      };
    }

    // Check for type compatibility (warning, not error)
    if (sourceColumn.type !== destColumn.type) {
      return {
        valid: true,
        message: `Warning: Column types don't match (${sourceColumn.type} vs ${destColumn.type})`
      };
    }

    return { valid: true };
  }

  /**
   * Parse relationship type from DBML symbol
   */
  static parseRelationshipType(symbol: string): 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many' {
    switch (symbol) {
      case '-':
        return 'one-to-one';
      case '<':
        return 'one-to-many';
      case '>':
        return 'many-to-one';
      case '<>':
        return 'many-to-many';
      default:
        return 'many-to-one';
    }
  }
}
