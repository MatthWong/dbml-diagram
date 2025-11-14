// Quick test to verify flights.dbml parsing
import { readFileSync } from 'fs';

// Read the flights.dbml file
const dbmlContent = readFileSync('./flights.dbml', 'utf-8');

// Simple test of the regex patterns
const lines = dbmlContent.split('\n');

console.log('Testing reference parsing...\n');

// Test the new regex pattern
const refPattern = /^(Ref|ref):\s*(?:(\w+)\s+)?([\w_]+)\.([\w_]+)\s*([<>-]+)\s*([\w_]+)\.([\w_]+)(?:\s*\[([^\]]+)\])?/;

let refCount = 0;
let errorCount = 0;

lines.forEach((line, index) => {
  const trimmed = line.trim();
  if (trimmed.startsWith('Ref:')) {
    refCount++;
    const match = trimmed.match(refPattern);
    if (match) {
      const [, , refName, fromTable, fromColumn, relType, toTable, toColumn] = match;
      console.log(`✓ Line ${index + 1}: ${fromTable}.${fromColumn} ${relType} ${toTable}.${toColumn}`);
    } else {
      errorCount++;
      console.log(`✗ Line ${index + 1}: Failed to parse: ${trimmed}`);
    }
  }
});

console.log(`\n=== Results ===`);
console.log(`Total references found: ${refCount}`);
console.log(`Parse errors: ${errorCount}`);
console.log(`Success rate: ${((refCount - errorCount) / refCount * 100).toFixed(1)}%`);