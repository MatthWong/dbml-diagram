import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';

export const exportToPNG = async (element: HTMLElement, filename: string = 'diagram.png') => {
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#f5f5f5',
      scale: 2,
      useCORS: true
    });
    
    canvas.toBlob((blob) => {
      if (blob) {
        saveAs(blob, filename);
      }
    });
  } catch (error) {
    console.error('Error exporting to PNG:', error);
  }
};

export const exportToSVG = (schema: any, filename: string = 'diagram.svg') => {
  // Create SVG content
  const svgContent = `
    <svg width="2000" height="1500" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          .table-rect { fill: white; stroke: #ccc; stroke-width: 1; }
          .table-header { fill: rgba(0,0,0,0.05); }
          .table-text { font-family: Arial, sans-serif; font-size: 14px; }
          .column-text { font-family: Arial, sans-serif; font-size: 12px; }
          .relationship { stroke: #666; stroke-width: 2; fill: none; }
        </style>
      </defs>
      
      <!-- Tables -->
      ${schema.tables.map((table: any) => `
        <g transform="translate(${table.position.x}, ${table.position.y})">
          <rect class="table-rect" width="200" height="${40 + table.columns.length * 25}" rx="8" 
                fill="${table.color || '#ffffff'}"/>
          <rect class="table-header" width="200" height="40" rx="8"/>
          <text class="table-text" x="10" y="25" font-weight="bold">${table.name}</text>
          ${table.columns.map((column: any, index: number) => `
            <text class="column-text" x="10" y="${65 + index * 25}" 
                  font-weight="${column.primaryKey ? 'bold' : 'normal'}">
              ${column.primaryKey ? '🔑 ' : ''}${column.name}
            </text>
            <text class="column-text" x="150" y="${65 + index * 25}" fill="#666">
              ${column.type}
            </text>
          `).join('')}
        </g>
      `).join('')}
      
      <!-- Relationships -->
      ${schema.references.map((ref: any) => {
        const fromTable = schema.tables.find((t: any) => t.name === ref.fromTable);
        const toTable = schema.tables.find((t: any) => t.name === ref.toTable);
        if (fromTable && toTable) {
          const fromX = fromTable.position.x + 100;
          const fromY = fromTable.position.y + 50;
          const toX = toTable.position.x + 100;
          const toY = toTable.position.y + 50;
          return `<line class="relationship" x1="${fromX}" y1="${fromY}" x2="${toX}" y2="${toY}"/>`;
        }
        return '';
      }).join('')}
    </svg>
  `;

  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  saveAs(blob, filename);
};