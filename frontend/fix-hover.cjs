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

  // Fix hover states that got mangled
  content = content.replace(/hover:text-gray-900 dark:text-white/g, 'hover:text-gray-900 dark:hover:text-white');
  content = content.replace(/hover:text-gray-700 dark:text-gray-300/g, 'hover:text-gray-700 dark:hover:text-gray-300');
  content = content.replace(/hover:text-gray-600 dark:text-gray-400/g, 'hover:text-gray-600 dark:hover:text-gray-400');
  
  // Fix double darks like dark:hover:text-gray-900 dark:hover:text-white -> dark:hover:text-white
  content = content.replace(/dark:hover:text-gray-900 dark:hover:text-white/g, 'dark:hover:text-white');
  content = content.replace(/dark:text-gray-400 dark:hover:text-gray-900 dark:text-white/g, 'dark:text-gray-400 dark:hover:text-white');

  content = content.replace(/className="[^"]*?(bg-gradient-to-[a-z]+|bg-[a-z]+-[56]00)[^"]*?text-gray-900 dark:text-white[^"]*?"/g, (match) => {
    return match.replace('text-gray-900 dark:text-white', 'text-white');
  });

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
};

const srcDir = path.join(__dirname, 'src');
const files = walk(srcDir);
files.forEach(replaceInFile);
