const fs = require('fs');
const path = require('path');

// Configuration
const ROOT_DIR = path.join(__dirname, '..');
const IGNORE_DIRS = [
  'node_modules',
  '.git',
  'build',
  'dist',
  'coverage',
  '.next',
  '.vscode',
  '.github',
  'cypress'
];

// Function to process a single file
function processFile(filePath) {
  try {
    // Read the file
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove TypeScript specific syntax
    // 1. Remove type annotations
    content = content.replace(/:\s*[\w\[\]{}|]+(?=\s*[=,;)\]{}|>]|$)/g, '');
    
    // 2. Remove interface and type declarations
    content = content.replace(/\b(interface|type)\s+\w+\s*([^{]*{([^}]*)})?/g, '');
    
    // 3. Remove 'as' type assertions
    content = content.replace(/\sas\s+[\w\[\]{}|]+/g, '');
    
    // 4. Remove 'import type' to just 'import'
    content = content.replace(/import\s+type\s+/g, 'import ');
    
    // 5. Remove 'export type' to just 'export'
    content = content.replace(/export\s+type\s+/g, 'export ');
    
    // 6. Remove 'declare' keyword
    content = content.replace(/\bdeclare\s+/g, '');
    
    // 7. Remove 'implements' clauses
    content = content.replace(/\s+implements\s+[^{\n{]+/g, '');
    
    // 8. Fix React.FC and other generic types
    content = content.replace(/React\.FC<[^>]+>/g, '');
    
    // 9. Remove type parameters from functions and classes
    content = content.replace(/<[\w\s,]+>(?=\s*[({])/g, '');
    
    // 10. Fix any remaining generic syntax
    content = content.replace(/<[\w\s,]+>(?=\s*[\[({])/g, '');
    
    // Write the file back
    fs.writeFileSync(filePath, content, 'utf8');
    
    // Rename the file if it's a TypeScript file
    if (filePath.endsWith('.js')) {
      const newPath = filePath.replace(/\.ts$/, '.js');
      fs.renameSync(filePath, newPath);
      console.log(`Converted: ${filePath} -> ${newPath}`);
      return newPath;
    } else if (filePath.endsWith('.jsx')) {
      const newPath = filePath.replace(/\.tsx$/, '.jsx');
      fs.renameSync(filePath, newPath);
      console.log(`Converted: ${filePath} -> ${newPath}`);
      return newPath;
    }
    
    return filePath;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return null;
  }
}

// Function to process a directory
function processDirectory(dir) {
  try {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip ignored directories
        if (IGNORE_DIRS.includes(file)) {
          console.log(`Skipping ignored directory: ${fullPath}`);
          continue;
        }
        processDirectory(fullPath);
      } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
        processFile(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${dir}:`, error);
  }
}

// Function to update imports in all JavaScript files
function updateImports(dir) {
  try {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      
      if (file.isDirectory()) {
        if (IGNORE_DIRS.includes(file.name)) {
          console.log(`Skipping ignored directory: ${fullPath}`);
          continue;
        }
        updateImports(fullPath);
      } else if (file.name.endsWith('.js') || file.name.endsWith('.jsx')) {
        try {
          let content = fs.readFileSync(fullPath, 'utf8');
          let updated = false;
          
          // Update .ts imports to .js
          if (content.includes(".js'")) {
            content = content.replace(/\.ts(['"])/g, '.js$1');
            updated = true;
          }
          
          // Update .tsx imports to .jsx
          if (content.includes(".jsx'")) {
            content = content.replace(/\.tsx(['"])/g, '.jsx$1');
            updated = true;
          }
          
          if (updated) {
            fs.writeFileSync(fullPath, content, 'utf8');
            console.log(`Updated imports in: ${fullPath}`);
          }
        } catch (error) {
          console.error(`Error updating imports in ${fullPath}:`, error);
        }
      }
    }
  } catch (error) {
    console.error(`Error updating imports in ${dir}:`, error);
  }
}

// Main function
async function main() {
  console.log('Starting TypeScript to JavaScript migration...');
  
  // Process all TypeScript files
  console.log('\nConverting TypeScript files to JavaScript...');
  processDirectory(ROOT_DIR);
  
  // Update imports in all JavaScript files
  console.log('\nUpdating imports in JavaScript files...');
  updateImports(ROOT_DIR);
  
  console.log('\nMigration completed!');
  
  console.log('\nNext steps:');
  console.log('1. Remove TypeScript dependencies from package.json');
  console.log('2. Update build scripts to use Babel instead of tsc');
  console.log('3. Test the application thoroughly');
}

// Run the script
main().catch(console.error);
