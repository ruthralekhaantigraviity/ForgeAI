const fs = require('fs');
const path = require('path');

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
};

const replaceInFile = (file) => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Backgrounds
  content = content.replace(/(?<!dark:)bg-brand-darker/g, 'bg-gray-50 dark:bg-brand-darker');
  content = content.replace(/(?<!dark:)bg-brand-dark/g, 'bg-white dark:bg-brand-dark');
  content = content.replace(/(?<!dark:)bg-gray-900\/50/g, 'bg-white dark:bg-gray-900/50');
  content = content.replace(/(?<!dark:)bg-gray-800\/50/g, 'bg-gray-50 dark:bg-gray-800/50');
  content = content.replace(/(?<!dark:)bg-gray-800/g, 'bg-gray-100 dark:bg-gray-800');

  // Borders
  content = content.replace(/(?<!dark:)border-gray-800/g, 'border-gray-200 dark:border-gray-800');
  content = content.replace(/(?<!dark:)border-gray-700/g, 'border-gray-300 dark:border-gray-700');

  // Text
  content = content.replace(/(?<!dark:)text-white/g, 'text-gray-900 dark:text-white');
  content = content.replace(/(?<!dark:)text-gray-100/g, 'text-gray-900 dark:text-gray-100');
  content = content.replace(/(?<!dark:)text-gray-300/g, 'text-gray-700 dark:text-gray-300');
  content = content.replace(/(?<!dark:)text-gray-400/g, 'text-gray-600 dark:text-gray-400');
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
};

const srcDir = path.join(__dirname, 'src');
const files = walk(srcDir);
files.forEach(replaceInFile);
