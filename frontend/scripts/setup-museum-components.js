const fs = require('fs');
const path = require('path');

const museumDir = path.join(__dirname, '..', 'components', 'museum');
const files = fs.readdirSync(museumDir);

files.forEach(file => {
  if (file.endsWith('.tsx') || file.endsWith('.ts')) {
    const fullPath = path.join(museumDir, file);
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Add 'use client'; if not present
    if (!content.startsWith("'use client'") && !content.startsWith('"use client"')) {
      content = "'use client';\n\n" + content;
    }
    
    // Normalize relative imports:
    // '../types' -> '@/types/museum'
    // '../data/' -> '@/data/'
    // '../utils/' -> '@/utils/'
    // './' -> './' (sibling components in museum/)
    content = content.replace(/from\s+['"]\.\.\/types['"]/g, "from '@/types/museum'");
    content = content.replace(/from\s+['"]\.\.\/data\/(.*?)['"]/g, "from '@/data/$1'");
    content = content.replace(/from\s+['"]\.\.\/utils\/(.*?)['"]/g, "from '@/utils/$1'");
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Processed ${file}`);
  }
});
