import { ExportOptions, ExportResult } from '../types/database';

/**
 * Export SVG element to PNG using canvas
 */
export async function exportToPNG(
  svgElement: SVGSVGElement,
  options: ExportOptions
): Promise<ExportResult> {
  try {
    // Clone the SVG to avoid modifying the original
    const svgClone = svgElement.cloneNode(true) as SVGSVGElement;
    
    // Get SVG dimensions
    const bbox = svgElement.getBBox();
    const width = options.bounds?.width || bbox.width + 200;
    const height = options.bounds?.height || bbox.height + 200;
    
    // Set SVG attributes for export
    svgClone.setAttribute('width', width.toString());
    svgClone.setAttribute('height', height.toString());
    svgClone.setAttribute('viewBox', `0 0 ${width} ${height}`);
    
    // Serialize SVG to string
    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(svgClone);
    
    // Add XML declaration and styling
    svgString = `<?xml version="1.0" encoding="UTF-8"?>
${svgString}`;
    
    // Create blob from SVG
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    // Load SVG into image
    const img = new Image();
    img.width = width * (options.resolution / 96); // Scale for resolution
    img.height = height * (options.resolution / 96);
    
    const loadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
      img.onload = () => resolve(img);
      img.onerror = reject;
    });
    
    img.src = url;
    await loadPromise;
    
    // Create canvas and draw image
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    
    // Fill background
    ctx.fillStyle = options.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw image
    ctx.drawImage(img, 0, 0);
    
    // Convert to blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create blob'));
        },
        'image/png',
        options.quality
      );
    });
    
    // Cleanup
    URL.revokeObjectURL(url);
    
    return {
      success: true,
      data: blob,
      metadata: {
        format: 'png',
        size: { width: canvas.width, height: canvas.height },
        fileSize: blob.size
      }
    };
  } catch (error) {
    const err = error as Error;
    return {
      success: false,
      error: `PNG export failed: ${err.message}`,
      metadata: {
        format: 'png',
        size: { width: 0, height: 0 },
        fileSize: 0
      }
    };
  }
}

/**
 * Export SVG element to SVG file
 */
export async function exportToSVG(
  svgElement: SVGSVGElement,
  options: ExportOptions
): Promise<ExportResult> {
  try {
    // Clone the SVG
    const svgClone = svgElement.cloneNode(true) as SVGSVGElement;
    
    // Get SVG dimensions
    const bbox = svgElement.getBBox();
    const width = options.bounds?.width || bbox.width + 200;
    const height = options.bounds?.height || bbox.height + 200;
    
    // Set SVG attributes
    svgClone.setAttribute('width', width.toString());
    svgClone.setAttribute('height', height.toString());
    svgClone.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svgClone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    
    // Add background if specified
    if (options.backgroundColor && options.backgroundColor !== 'transparent') {
      const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bgRect.setAttribute('width', '100%');
      bgRect.setAttribute('height', '100%');
      bgRect.setAttribute('fill', options.backgroundColor);
      svgClone.insertBefore(bgRect, svgClone.firstChild);
    }
    
    // Serialize to string
    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(svgClone);
    
    // Add XML declaration
    svgString = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
${svgString}`;
    
    // Create blob
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    
    return {
      success: true,
      data: blob,
      metadata: {
        format: 'svg',
        size: { width, height },
        fileSize: blob.size
      }
    };
  } catch (error) {
    const err = error as Error;
    return {
      success: false,
      error: `SVG export failed: ${err.message}`,
      metadata: {
        format: 'svg',
        size: { width: 0, height: 0 },
        fileSize: 0
      }
    };
  }
}

/**
 * Download a blob as a file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Get default export options
 */
export function getDefaultExportOptions(): ExportOptions {
  return {
    format: 'png',
    resolution: 300,
    quality: 0.95,
    backgroundColor: '#ffffff',
    includeAnnotations: true
  };
}