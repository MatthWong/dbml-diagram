import { DatabaseSchema, Table, LayoutOptions, LayoutResult } from '../types/database';
import { getEffectiveTableSize } from './tableSize';

/**
 * Force-directed layout algorithm using physics simulation
 */
export class ForceDirectedLayout {
  name = 'force-directed';
  description = 'Physics-based layout that minimizes edge crossings';

  async apply(schema: DatabaseSchema, options: LayoutOptions): Promise<LayoutResult> {
    const tables = schema.tables;
    const references = schema.references;
    
    if (tables.length === 0) {
      return {
        positions: {},
        bounds: { width: 0, height: 0 },
        metrics: { overlapCount: 0, crossingCount: 0, totalPathLength: 0 }
      };
    }

    // Initialize positions
    const positions: Record<string, { x: number; y: number }> = {};
    const velocities: Record<string, { x: number; y: number }> = {};
    
    tables.forEach((table, index) => {
      if (options.preserveUserPositions && table.position.x !== 0 && table.position.y !== 0) {
        positions[table.id] = { ...table.position };
      } else {
        // Circular initial layout
        const angle = (index / tables.length) * 2 * Math.PI;
        const radius = Math.max(300, tables.length * 30);
        positions[table.id] = {
          x: 500 + radius * Math.cos(angle),
          y: 500 + radius * Math.sin(angle)
        };
      }
      velocities[table.id] = { x: 0, y: 0 };
    });

    // Physics simulation parameters
    const iterations = 100;
    const repulsionStrength = 50000;
    const attractionStrength = 0.01;
    const damping = 0.8;
    const minDistance = options.spacing.horizontal;

    // Run simulation
    for (let iter = 0; iter < iterations; iter++) {
      const forces: Record<string, { x: number; y: number }> = {};
      
      // Initialize forces
      tables.forEach(table => {
        forces[table.id] = { x: 0, y: 0 };
      });

      // Repulsion between all nodes (considering effective table sizes)
      for (let i = 0; i < tables.length; i++) {
        for (let j = i + 1; j < tables.length; j++) {
          const table1 = tables[i];
          const table2 = tables[j];
          const size1 = getEffectiveTableSize(table1);
          const size2 = getEffectiveTableSize(table2);
          
          const dx = positions[table2.id].x - positions[table1.id].x;
          const dy = positions[table2.id].y - positions[table1.id].y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          
          // Adjust minimum distance based on table sizes
          const avgWidth = (size1.width + size2.width) / 2;
          const adjustedMinDistance = Math.max(minDistance, avgWidth + 50);
          
          if (distance < adjustedMinDistance * 3) {
            const force = repulsionStrength / (distance * distance);
            const fx = (dx / distance) * force;
            const fy = (dy / distance) * force;
            
            forces[table1.id].x -= fx;
            forces[table1.id].y -= fy;
            forces[table2.id].x += fx;
            forces[table2.id].y += fy;
          }
        }
      }

      // Attraction along edges
      references.forEach(ref => {
        const fromTable = tables.find(t => t.name === ref.fromTable);
        const toTable = tables.find(t => t.name === ref.toTable);
        
        if (fromTable && toTable) {
          const dx = positions[toTable.id].x - positions[fromTable.id].x;
          const dy = positions[toTable.id].y - positions[fromTable.id].y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          
          const force = distance * attractionStrength;
          const fx = (dx / distance) * force;
          const fy = (dy / distance) * force;
          
          forces[fromTable.id].x += fx;
          forces[fromTable.id].y += fy;
          forces[toTable.id].x -= fx;
          forces[toTable.id].y -= fy;
        }
      });

      // Apply forces
      tables.forEach(table => {
        velocities[table.id].x = (velocities[table.id].x + forces[table.id].x) * damping;
        velocities[table.id].y = (velocities[table.id].y + forces[table.id].y) * damping;
        
        positions[table.id].x += velocities[table.id].x;
        positions[table.id].y += velocities[table.id].y;
      });
    }

    // Center and calculate bounds
    const { positions: centeredPositions, bounds } = this.centerAndBounds(positions, tables);

    return {
      positions: centeredPositions,
      bounds,
      metrics: this.calculateMetrics(centeredPositions, tables, references)
    };
  }

  getDefaultOptions(): LayoutOptions {
    return {
      preserveUserPositions: false,
      minimizeOverlaps: true,
      optimizeRelationships: true,
      spacing: { horizontal: 250, vertical: 180 }
    };
  }

  private centerAndBounds(
    positions: Record<string, { x: number; y: number }>,
    tables: Table[]
  ): { positions: Record<string, { x: number; y: number }>; bounds: { width: number; height: number } } {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    tables.forEach(table => {
      const pos = positions[table.id];
      minX = Math.min(minX, pos.x);
      minY = Math.min(minY, pos.y);
      maxX = Math.max(maxX, pos.x + table.size.width);
      maxY = Math.max(maxY, pos.y + table.size.height);
    });

    const offsetX = 100 - minX;
    const offsetY = 100 - minY;
    
    const centeredPositions: Record<string, { x: number; y: number }> = {};
    tables.forEach(table => {
      centeredPositions[table.id] = {
        x: positions[table.id].x + offsetX,
        y: positions[table.id].y + offsetY
      };
    });

    return {
      positions: centeredPositions,
      bounds: {
        width: maxX - minX + 200,
        height: maxY - minY + 200
      }
    };
  }

  private calculateMetrics(
    positions: Record<string, { x: number; y: number }>,
    tables: Table[],
    references: any[]
  ) {
    let overlapCount = 0;
    let totalPathLength = 0;

    // Calculate overlaps using effective table sizes
    for (let i = 0; i < tables.length; i++) {
      for (let j = i + 1; j < tables.length; j++) {
        const t1 = tables[i];
        const t2 = tables[j];
        const p1 = positions[t1.id];
        const p2 = positions[t2.id];
        const size1 = getEffectiveTableSize(t1);
        const size2 = getEffectiveTableSize(t2);
        
        if (
          p1.x < p2.x + size2.width &&
          p1.x + size1.width > p2.x &&
          p1.y < p2.y + size2.height &&
          p1.y + size1.height > p2.y
        ) {
          overlapCount++;
        }
      }
    }

    // Calculate total path length
    references.forEach(ref => {
      const fromTable = tables.find(t => t.name === ref.fromTable);
      const toTable = tables.find(t => t.name === ref.toTable);
      
      if (fromTable && toTable) {
        const p1 = positions[fromTable.id];
        const p2 = positions[toTable.id];
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        totalPathLength += Math.sqrt(dx * dx + dy * dy);
      }
    });

    return {
      overlapCount,
      crossingCount: 0, // Simplified for now
      totalPathLength
    };
  }
}

/**
 * Hierarchical layout algorithm
 */
export class HierarchicalLayout {
  name = 'hierarchical';
  description = 'Tree-like layout based on table relationships';

  async apply(schema: DatabaseSchema, options: LayoutOptions): Promise<LayoutResult> {
    const tables = schema.tables;
    const references = schema.references;
    
    if (tables.length === 0) {
      return {
        positions: {},
        bounds: { width: 0, height: 0 },
        metrics: { overlapCount: 0, crossingCount: 0, totalPathLength: 0 }
      };
    }

    // Build dependency graph
    const children: Record<string, string[]> = {};
    const parents: Record<string, string[]> = {};
    
    tables.forEach(table => {
      children[table.name] = [];
      parents[table.name] = [];
    });

    references.forEach(ref => {
      if (children[ref.toTable]) {
        children[ref.toTable].push(ref.fromTable);
      }
      if (parents[ref.fromTable]) {
        parents[ref.fromTable].push(ref.toTable);
      }
    });

    // Find root nodes (tables with no parents)
    const roots = tables.filter(t => parents[t.name].length === 0);
    
    if (roots.length === 0) {
      // No clear hierarchy, use first table as root
      roots.push(tables[0]);
    }

    // Assign levels using BFS
    const levels: Record<string, number> = {};
    const queue: Array<{ name: string; level: number }> = [];
    
    roots.forEach(root => {
      queue.push({ name: root.name, level: 0 });
      levels[root.name] = 0;
    });

    while (queue.length > 0) {
      const { name, level } = queue.shift()!;
      
      children[name].forEach(childName => {
        if (levels[childName] === undefined || levels[childName] > level + 1) {
          levels[childName] = level + 1;
          queue.push({ name: childName, level: level + 1 });
        }
      });
    }

    // Assign remaining tables to levels
    tables.forEach(table => {
      if (levels[table.name] === undefined) {
        levels[table.name] = 0;
      }
    });

    // Group tables by level
    const tablesByLevel: Table[][] = [];
    tables.forEach(table => {
      const level = levels[table.name];
      if (!tablesByLevel[level]) {
        tablesByLevel[level] = [];
      }
      tablesByLevel[level].push(table);
    });

    // Position tables
    const positions: Record<string, { x: number; y: number }> = {};
    const horizontalSpacing = options.spacing.horizontal;
    const verticalSpacing = options.spacing.vertical;
    
    tablesByLevel.forEach((levelTables, level) => {
      let currentX = 100;
      
      levelTables.forEach((table) => {
        const size = getEffectiveTableSize(table);
        positions[table.id] = {
          x: currentX,
          y: 100 + level * verticalSpacing
        };
        // Move to next position based on actual table width
        currentX += size.width + horizontalSpacing;
      });
    });

    // Calculate bounds using effective sizes
    let maxX = 0, maxY = 0;
    tables.forEach(table => {
      const pos = positions[table.id];
      const size = getEffectiveTableSize(table);
      maxX = Math.max(maxX, pos.x + size.width);
      maxY = Math.max(maxY, pos.y + size.height);
    });

    return {
      positions,
      bounds: { width: maxX + 100, height: maxY + 100 },
      metrics: { overlapCount: 0, crossingCount: 0, totalPathLength: 0 }
    };
  }

  getDefaultOptions(): LayoutOptions {
    return {
      preserveUserPositions: false,
      minimizeOverlaps: true,
      optimizeRelationships: true,
      spacing: { horizontal: 300, vertical: 200 }
    };
  }
}

/**
 * Grid layout algorithm
 */
export class GridLayout {
  name = 'grid';
  description = 'Simple grid-based layout';

  async apply(schema: DatabaseSchema, options: LayoutOptions): Promise<LayoutResult> {
    const tables = schema.tables;
    const positions: Record<string, { x: number; y: number }> = {};
    
    const cols = Math.ceil(Math.sqrt(tables.length));
    const horizontalSpacing = options.spacing.horizontal;
    const verticalSpacing = options.spacing.vertical;
    
    // Calculate column widths and row heights
    const colWidths: number[] = new Array(cols).fill(0);
    const rowHeights: number[] = [];
    
    tables.forEach((table, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const size = getEffectiveTableSize(table);
      
      colWidths[col] = Math.max(colWidths[col], size.width);
      if (!rowHeights[row]) rowHeights[row] = 0;
      rowHeights[row] = Math.max(rowHeights[row], size.height);
    });
    
    // Position tables using calculated widths and heights
    tables.forEach((table, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      
      let x = 100;
      for (let c = 0; c < col; c++) {
        x += colWidths[c] + horizontalSpacing;
      }
      
      let y = 100;
      for (let r = 0; r < row; r++) {
        y += rowHeights[r] + verticalSpacing;
      }
      
      positions[table.id] = { x, y };
    });

    const rows = Math.ceil(tables.length / cols);
    const totalWidth = colWidths.reduce((sum, w) => sum + w, 0) + (cols - 1) * horizontalSpacing;
    const totalHeight = rowHeights.reduce((sum, h) => sum + h, 0) + (rows - 1) * verticalSpacing;
    
    return {
      positions,
      bounds: {
        width: 100 + totalWidth + 100,
        height: 100 + totalHeight + 100
      },
      metrics: { overlapCount: 0, crossingCount: 0, totalPathLength: 0 }
    };
  }

  getDefaultOptions(): LayoutOptions {
    return {
      preserveUserPositions: false,
      minimizeOverlaps: true,
      optimizeRelationships: false,
      spacing: { horizontal: 300, vertical: 250 }
    };
  }
}

/**
 * Star Schema layout algorithm - optimized for data warehouse schemas
 */
export class StarSchemaLayout {
  name = 'star-schema';
  description = 'Data warehouse layout with facts in center, dimensions around';

  async apply(schema: DatabaseSchema, _options: LayoutOptions): Promise<LayoutResult> {
    const tables = schema.tables;
    const references = schema.references;
    const positions: Record<string, { x: number; y: number }> = {};
    
    if (tables.length === 0) {
      return {
        positions: {},
        bounds: { width: 0, height: 0 },
        metrics: { overlapCount: 0, crossingCount: 0, totalPathLength: 0 }
      };
    }

    // Identify fact tables (tables with many incoming foreign keys)
    const incomingRefs: Record<string, number> = {};
    const outgoingRefs: Record<string, number> = {};
    
    tables.forEach(table => {
      incomingRefs[table.name] = 0;
      outgoingRefs[table.name] = 0;
    });

    references.forEach(ref => {
      if (incomingRefs[ref.toTable] !== undefined) {
        incomingRefs[ref.toTable]++;
      }
      if (outgoingRefs[ref.fromTable] !== undefined) {
        outgoingRefs[ref.fromTable]++;
      }
    });

    // Fact tables typically have many outgoing references (to dimensions)
    const factTables = tables.filter(t => outgoingRefs[t.name] >= 2);
    const dimensionTables = tables.filter(t => outgoingRefs[t.name] < 2);

    // If no clear facts, use tables with most relationships
    if (factTables.length === 0 && tables.length > 0) {
      const sorted = [...tables].sort((a, b) => 
        (outgoingRefs[b.name] + incomingRefs[b.name]) - 
        (outgoingRefs[a.name] + incomingRefs[a.name])
      );
      factTables.push(sorted[0]);
      dimensionTables.splice(dimensionTables.indexOf(sorted[0]), 1);
    }

    const centerX = 800;
    const centerY = 400;
    const factSpacing = 400;
    const dimensionRadius = 350;

    // Position fact tables in center
    if (factTables.length === 1) {
      const fact = factTables[0];
      positions[fact.id] = { x: centerX, y: centerY };
    } else {
      // Multiple facts - arrange in a line
      factTables.forEach((fact, index) => {
        const offset = (index - (factTables.length - 1) / 2) * factSpacing;
        positions[fact.id] = { x: centerX + offset, y: centerY };
      });
    }

    // Group dimensions by their related fact table
    const dimensionsByFact: Record<string, Table[]> = {};
    
    factTables.forEach(fact => {
      dimensionsByFact[fact.name] = [];
    });

    dimensionTables.forEach(dim => {
      // Find which fact(s) this dimension relates to
      const relatedFacts = references
        .filter(ref => ref.fromTable === dim.name || ref.toTable === dim.name)
        .map(ref => ref.fromTable === dim.name ? ref.toTable : ref.fromTable)
        .filter(tableName => factTables.some(f => f.name === tableName));

      if (relatedFacts.length > 0) {
        // Assign to first related fact
        const factName = relatedFacts[0];
        if (dimensionsByFact[factName]) {
          dimensionsByFact[factName].push(dim);
        }
      } else {
        // Unrelated dimension - assign to first fact
        if (factTables.length > 0) {
          dimensionsByFact[factTables[0].name].push(dim);
        }
      }
    });

    // Position dimensions around their fact tables
    factTables.forEach(fact => {
      const factPos = positions[fact.id];
      const dims = dimensionsByFact[fact.name] || [];
      
      dims.forEach((dim, index) => {
        const angle = (index / dims.length) * 2 * Math.PI;
        positions[dim.id] = {
          x: factPos.x + dimensionRadius * Math.cos(angle),
          y: factPos.y + dimensionRadius * Math.sin(angle)
        };
      });
    });

    // Calculate bounds
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    tables.forEach(table => {
      const pos = positions[table.id];
      if (pos) {
        minX = Math.min(minX, pos.x);
        minY = Math.min(minY, pos.y);
        maxX = Math.max(maxX, pos.x + table.size.width);
        maxY = Math.max(maxY, pos.y + table.size.height);
      }
    });

    // Center the layout
    const offsetX = 100 - minX;
    const offsetY = 100 - minY;
    
    Object.keys(positions).forEach(tableId => {
      positions[tableId].x += offsetX;
      positions[tableId].y += offsetY;
    });

    return {
      positions,
      bounds: {
        width: maxX - minX + 200,
        height: maxY - minY + 200
      },
      metrics: { overlapCount: 0, crossingCount: 0, totalPathLength: 0 }
    };
  }

  getDefaultOptions(): LayoutOptions {
    return {
      preserveUserPositions: false,
      minimizeOverlaps: true,
      optimizeRelationships: true,
      spacing: { horizontal: 350, vertical: 350 }
    };
  }
}

// Export layout algorithms
export const layoutAlgorithms = {
  'force-directed': new ForceDirectedLayout(),
  'hierarchical': new HierarchicalLayout(),
  'grid': new GridLayout(),
  'star-schema': new StarSchemaLayout()
};