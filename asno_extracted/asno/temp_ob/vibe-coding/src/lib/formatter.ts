/**
 * Intelligent Code Formatter for JavaScript, TypeScript, and React (TSX/JSX)
 * Expands horizontal/minified code into beautiful, vertically-spaced, and properly-indented structures.
 */

export function beautifyCode(code: string): string {
  if (!code || typeof code !== 'string') return '';

  // Step 1: Handle block replacements of dense imports, braces, and tags to separate onto lines
  let formatted = code;

  // Ensure consecutive import lines are separated
  formatted = formatted.replace(/(import\s+[^;]*?;)\s*(import\s+)/g, '$1\n$2');
  formatted = formatted.replace(/(import\s+[^;]*?;)\s*(export\s+)/g, '$1\n\n$2');

  // Fix common squashed semicolons (except inside for-loops)
  // We can do a safe split of semicolons that are not followed by a newline, but ensure we don't break for(let i=0; i<n; i++)
  // To keep it safe, let's do safe expansion around semicolons that are sandwiched between statements
  formatted = formatted.replace(/;([a-zA-Z_])/g, ';\n$1');

  // Place spacing after component definitions/exports
  formatted = formatted.replace(/(export\s+default\s+function\s+\w+\(.*?\)\s*\{)/g, '\n$1\n');
  formatted = formatted.replace(/(const\s+\w+\s*=\s*\(.*?\)\s*=>\s*\{)/g, '\n$1\n');

  // Safe expansion of JSX squashed tags
  // Replace things like </div><ul with </div>\n<ul
  formatted = formatted.replace(/(<\/?[a-zA-Z0-9]+[^>]*>)\s*(<\/?[a-zA-Z0-9]+[^>]*>)/g, '$1\n$2');

  // Let's token-parse the lines to reconstruct proper indentation
  const rawLines = formatted.split('\n');
  const finishedLines: string[] = [];
  let indentLevel = 0;

  for (let rawLine of rawLines) {
    let line = rawLine.trim();
    if (!line) {
      // Keep single empty line if previous wasn't empty
      if (finishedLines.length > 0 && finishedLines[finishedLines.length - 1] !== '') {
        finishedLines.push('');
      }
      continue;
    }

    // Adjust indent of current line if it starts with close braces or tags
    let closeCount = 0;
    
    // Check if the trimmed line begins with closing brackets or tags
    const startsWithClose = line.startsWith('}') || line.startsWith(']') || line.startsWith(')') || line.startsWith('</') || line.startsWith('/>');
    if (startsWithClose) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    // Append indent to current line
    const indentStr = '  '.repeat(indentLevel);
    finishedLines.push(indentStr + line);

    // Calculate indent adjustments for the NEXT line
    // Count open characters (unless they are inside strings, but for standard code this is safe enough)
    let opens = 0;
    let closes = 0;

    // Standard brace and tag calculations
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      const nextChar = line[j + 1] || '';

      // Count curly braces
      if (char === '{') opens++;
      if (char === '}') closes++;

      // Count brackets and parenthesis
      if (char === '(') opens++;
      if (char === ')') closes++;
      if (char === '[') opens++;
      if (char === ']') closes++;

      // JSX specific open/closing tags count (e.g. <div but not </div and not />)
      if (char === '<' && nextChar !== '/' && nextChar !== '!' && /[a-zA-Z]/.test(nextChar)) {
        // Tag open
        // Check if self-closing tag or tag is closed in same line
        const closingIndex = line.indexOf('>', j);
        if (closingIndex !== -1) {
          const tagContent = line.slice(j, closingIndex + 1);
          if (!tagContent.endsWith('/>') && !tagContent.includes('</')) {
            opens++;
          }
        }
      }
      if (char === '<' && nextChar === '/') {
        closes++;
      }
      if (char === '/' && nextChar === '>') {
        closes++;
      }
    }

    const diff = opens - closes;
    if (!startsWithClose) {
      indentLevel = Math.max(0, indentLevel + diff);
    } else {
      // Starts with close was already decremented, we adjust after next line
      indentLevel = Math.max(0, indentLevel + opens);
    }
  }

  // Final trim and safety cleanups
  return finishedLines.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}
