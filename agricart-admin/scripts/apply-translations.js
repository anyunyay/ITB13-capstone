/**
 * Helper script to find hardcoded strings in admin pages
 * Run with: node scripts/apply-translations.js
 */

const fs = require('fs');
const path = require('path');

// Common strings to look for
const commonStrings = [
    'Orders',
    'Inventory',
    'Sales',
    'Members',
    'Logistics',
    'Staff',
    'Dashboard',
    'Pending',
    'Approved',
    'Rejected',
    'Delayed',
    'View',
    'Edit',
    'Delete',
    'Create',
    'Save',
    'Cancel',
    'Search',
    'Filter',
    'Export',
    'Total',
    'Revenue',
    'Status',
    'Manage',
    'Report',
    'Generate',
    'Back to',
];

function findTsxFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        try {
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                if (!filePath.includes('node_modules') && 
                    !filePath.includes('.git') && 
                    !filePath.includes('build')) {
                    findTsxFiles(filePath, fileList);
                }
            } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                fileList.push(filePath);
            }
        } catch (e) {
            // Skip files we can't read
        }
    });
    return fileList;
}

function analyzeFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const issues = [];
        
        // Check if useTranslation is imported
        const hasTranslationImport = content.includes("useTranslation") || 
                                   content.includes("from '@/hooks/use-translation'");
        
        if (!hasTranslationImport) {
            // Check if file has hardcoded strings
            commonStrings.forEach(str => {
                // Look for strings in quotes that match
                const regex = new RegExp(`["']${str}[^"']*["']|>\\s*${str}\\s*<`, 'gi');
                if (regex.test(content)) {
                    issues.push({
                        file: filePath.replace(/\\/g, '/'),
                        string: str,
                        needsTranslation: true
                    });
                }
            });
        }
        
        return issues;
    } catch (e) {
        return [];
    }
}

// Main execution
const adminDir = './resources/js/pages/Admin';
const componentDir = './resources/js/components';

console.log('🔍 Scanning for files that need translation updates...\n');

const adminFiles = findTsxFiles(adminDir);
const componentFiles = findTsxFiles(componentDir);

let allIssues = [];

adminFiles.forEach(file => {
    const issues = analyzeFile(file);
    allIssues = allIssues.concat(issues);
});

// Group by file
const byFile = {};
allIssues.forEach(issue => {
    if (!byFile[issue.file]) {
        byFile[issue.file] = [];
    }
    byFile[issue.file].push(issue.string);
});

console.log(`Found ${Object.keys(byFile).length} files that may need translations:\n`);

Object.keys(byFile).slice(0, 20).forEach(file => {
    const strings = [...new Set(byFile[file])];
    console.log(`📄 ${file}`);
    console.log(`   Strings found: ${strings.join(', ')}\n`);
});

if (Object.keys(byFile).length > 20) {
    console.log(`... and ${Object.keys(byFile).length - 20} more files\n`);
}

console.log('\n💡 Tip: Add "import { useTranslation } from '@/hooks/use-translation';" and use t() function for all strings.');

