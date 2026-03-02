#!/usr/bin/env node

/**
 * Manual test script for generator utilities
 */

const CategoryGenerator = require('../utils/categoryGenerator');

const categoryGenerator = new CategoryGenerator();

console.log('=== Testing Category Generator ===\n');

// Test 1: Failed Grades Category
console.log('1. Testing Failed Grades Category:');
const failedCategory = categoryGenerator.generateFailedGradesCategory();
console.log(`   - Courses: ${failedCategory.courses.length}`);
console.log(`   - GPA: ${failedCategory.stats.gpa}`);
console.log(`   - Failed Courses: ${failedCategory.stats.failedCourses}`);
console.log(`   - Category: ${failedCategory.stats.category}`);
console.log('   ✓ Failed grades category generated successfully\n');

// Test 2: 2.5 GPA Category
console.log('2. Testing 2.5 GPA Category:');
const gpa25Category = categoryGenerator.generate25GPACategory();
console.log(`   - Courses: ${gpa25Category.courses.length}`);
console.log(`   - GPA: ${gpa25Category.stats.gpa}`);
console.log(`   - Category: ${gpa25Category.stats.category}`);
console.log(`   - Grade Distribution:`, gpa25Category.stats.gradeDistribution);
console.log('   ✓ 2.5 GPA category generated successfully\n');

// Test 3: 3.74 GPA Category
console.log('3. Testing 3.74 GPA Category:');
const gpa374Category = categoryGenerator.generate374GPACategory();
console.log(`   - Courses: ${gpa374Category.courses.length}`);
console.log(`   - GPA: ${gpa374Category.stats.gpa}`);
console.log(`   - Category: ${gpa374Category.stats.category}`);
console.log(`   - Honors Eligible: ${gpa374Category.stats.honorsEligible}`);
console.log(`   - Grade Distribution:`, gpa374Category.stats.gradeDistribution);
console.log('   ✓ 3.74 GPA category generated successfully\n');

// Test 4: Full Transcript Generation
console.log('4. Testing Full Transcript Generation:');
const transcript = categoryGenerator.generateTranscriptByCategory('2.5', 'college');
console.log(`   - Type: ${transcript.type}`);
console.log(`   - School: ${transcript.data.schoolName}`);
console.log(`   - Student: ${transcript.data.studentName}`);
console.log(`   - GPA: ${transcript.data.cumulativeGPA}`);
console.log(`   - Courses: ${transcript.data.courses.length}`);
console.log('   ✓ Full transcript generated successfully\n');

// Test 5: Get Available Categories
console.log('5. Testing Get Available Categories:');
const categories = categoryGenerator.getAvailableCategories();
console.log(`   - Available categories: ${categories.length}`);
categories.forEach(cat => {
  console.log(`     - ${cat.name} (${cat.id}): ${cat.description}`);
});
console.log('   ✓ Categories retrieved successfully\n');

console.log('=== All Category Generator Tests Passed! ===\n');

// Summary
console.log('Summary:');
console.log(`- Failed GPA: ${failedCategory.stats.gpa.toFixed(2)}`);
console.log(`- 2.5 GPA Target: ${gpa25Category.stats.gpa.toFixed(2)}`);
console.log(`- 3.74 GPA Target: ${gpa374Category.stats.gpa.toFixed(2)}`);
