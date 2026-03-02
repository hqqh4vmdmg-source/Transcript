#!/usr/bin/env node

/**
 * Manual test script for simple seal generator
 */

const SimpleSealGenerator = require('../utils/simpleSealGenerator');
const fs = require('fs');
const path = require('path');

const sealGenerator = new SimpleSealGenerator();

console.log('=== Testing Simple Seal Generator ===\n');

// Test 1: Institutional Seal
console.log('1. Testing Institutional Seal:');
const institutional = sealGenerator.generateInstitutionalSeal('Test University', '2024');
console.log(`   - Format: ${institutional.format}`);
console.log(`   - Width: ${institutional.width}px`);
console.log(`   - Height: ${institutional.height}px`);
console.log(`   - SVG Length: ${institutional.svg.length} characters`);
console.log(`   - Has dataUrl: ${institutional.dataUrl.substring(0, 50)}...`);
console.log('   ✓ Institutional seal generated successfully\n');

// Test 2: Departmental Seal
console.log('2. Testing Departmental Seal:');
const departmental = sealGenerator.generateDepartmentalSeal('Computer Science', 'Tech University');
console.log(`   - Seal Type: ${departmental.sealType}`);
console.log(`   - Format: ${departmental.format}`);
console.log('   ✓ Departmental seal generated successfully\n');

// Test 3: Registrar Seal
console.log('3. Testing Registrar Seal:');
const registrar = sealGenerator.generateRegistrarSeal('State University');
console.log(`   - Seal Type: ${registrar.sealType}`);
console.log(`   - Format: ${registrar.format}`);
console.log('   ✓ Registrar seal generated successfully\n');

// Test 4: Accreditation Seal
console.log('4. Testing Accreditation Seal:');
const accreditation = sealGenerator.generateAccreditationSeal('ABET', '2024');
console.log(`   - Seal Type: ${accreditation.sealType}`);
console.log(`   - Format: ${accreditation.format}`);
console.log('   ✓ Accreditation seal generated successfully\n');

// Test 5: Save seal to file
console.log('5. Testing File Save:');
const outputDir = path.join(__dirname, '../../tmp');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const filename = sealGenerator.generateFilename('test');
const filepath = path.join(outputDir, filename);
const buffer = sealGenerator.svgToBuffer(institutional.svg);
fs.writeFileSync(filepath, buffer);
console.log(`   - Saved to: ${filepath}`);
console.log(`   - File size: ${buffer.length} bytes`);
console.log('   ✓ Seal saved to file successfully\n');

console.log('=== All Simple Seal Generator Tests Passed! ===\n');

// Display sample SVG snippet
console.log('Sample SVG output (first 200 chars):');
console.log(institutional.svg.substring(0, 200) + '...\n');
