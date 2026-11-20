import fs from 'fs';
import path from 'path';

const IGNORE_DIRS = ['node_modules', '.git', 'dist', 'build', '.next', '.gemini'];
const EXTENSIONS = ['.js', '.ts', '.jsx', '.tsx'];

function ingest(targetDir) {
  const absoluteTarget = path.resolve(targetDir);
  console.log(`🚀 Starting ingestion for: ${absoluteTarget}`);

  const nodes = [];
  const links = [];

  function walk(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        if (!IGNORE_DIRS.includes(file)) {
          walk(fullPath);
        }
      } else if (EXTENSIONS.includes(path.extname(file))) {
        const relativePath = path.relative(absoluteTarget, fullPath);
        const content = fs.readFileSync(fullPath, 'utf-8');

        // 1. Add File Node
        nodes.push({
          id: relativePath,
          type: 'file',
          content: content.slice(0, 500), // Store snippet for search
          metadata: { size: stat.size, lastModified: stat.mtime }
        });

        // 2. Extract Imports (Entity relationships)
        const importRegex = /(?:import|from)\s+['"]([^'"]+)['"]/g;
        let match;
        while ((match = importRegex.exec(content)) !== null) {
          links.push({
            source: relativePath,
            target: match[1],
            type: 'import'
          });
        }

        // 3. Extract Functions/Classes (Entities)
        const entityRegex = /(?:function|class|const|let)\s+([a-zA-Z0-9_]+)\s*(?:=|{|\()/g;
        let entityMatch;
        while ((entityMatch = entityRegex.exec(content)) !== null) {
          const entityName = entityMatch[1];
          if (!['if', 'for', 'while', 'switch', 'return'].includes(entityName)) {
            nodes.push({
              id: `${relativePath}::${entityName}`,
              type: entityName.charAt(0).toUpperCase() === entityName.charAt(0) ? 'class' : 'function',
              content: `Defined in ${relativePath}`,
              metadata: { file: relativePath }
            });
            links.push({
              source: relativePath,
              target: `${relativePath}::${entityName}`,
              type: 'mention'
            });
          }
        }
      }
    }
  }

  walk(absoluteTarget);

  const result = {
    timestamp: new Date().toISOString(),
    project: path.basename(absoluteTarget),
    nodes,
    links
  };

  const outputPath = path.resolve('./src/vault-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  console.log(`✅ Ingestion complete! Data saved to: ${outputPath}`);
  console.log(`📊 Stats: ${nodes.length} nodes, ${links.length} links`);
}

// Default to current directory if no argument provided
const target = process.argv[2] || '.';
ingest(target);
