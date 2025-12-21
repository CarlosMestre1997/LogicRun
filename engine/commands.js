// Command parsing
function parseCommand(line) {
  // Move command: move() or move(5)
  const moveMatch = line.match(/^move\((\d+)?\)$/);
  if (moveMatch) {
    const count = moveMatch[1] ? parseInt(moveMatch[1], 10) : 1;
    const actions = [];
    for (let j = 0; j < count; j++) {
      actions.push({ type: 'move' });
    }
    return actions;
  }
  
  // Jump command: jump() or jump(3)
  const jumpMatch = line.match(/^jump\((\d+)?\)$/);
  if (jumpMatch) {
    const count = jumpMatch[1] ? parseInt(jumpMatch[1], 10) : 1;
    const actions = [];
    for (let j = 0; j < count; j++) {
      actions.push({ type: 'jump' });
    }
    return actions;
  }
  
  // Spin command: spin(r) or spin(l)
  const spinMatch = line.match(/^spin\(([lr])\)$/);
  if (spinMatch) {
    return [{ type: 'spin', direction: spinMatch[1] === 'r' ? 'right' : 'left' }];
  }
  
  return null;
}

export function parse(text) {
  const lines = text.trim()
    .split('\n')
    .map(l => l.trim().replace(/^>\s*/, ''))
    .filter(l => l);
  
  const actions = [];
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i];
    
    // Match while(hacking) { format
    const whileMatch = line.match(/^while\((\w+)\)\s*\{?$/);
    if (whileMatch) {
      const condition = whileMatch[1];
      if (condition !== 'hacking') {
        return { error: `Unknown while condition: ${condition}. Use 'hacking' (you need the laptop first)` };
      }
      
      // Collect inner commands until closing brace
      const innerCommands = [];
      i++; // Skip the while line
      let braceCount = 1;
      
      while (i < lines.length && braceCount > 0) {
        const innerLine = lines[i];
        
        if (innerLine.trim() === '}') {
          braceCount--;
          if (braceCount === 0) {
            i++;
            break;
          }
        }
        
        if (innerLine.includes('{')) {
          braceCount++;
        }
        
        const parsed = parseCommand(innerLine);
        if (parsed) {
          innerCommands.push(...parsed);
          i++;
          continue;
        }
        
        return { error: `Unknown command in while loop: ${innerLine}` };
      }
      
      if (braceCount > 0) {
        return { error: 'Unclosed while loop' };
      }
      
      actions.push({ type: 'while', condition: 'hacking', body: innerCommands });
      continue;
    }
    
    // Parse regular command
    const parsed = parseCommand(line);
    if (parsed) {
      actions.push(...parsed);
      i++;
      continue;
    }
    
    // Ignore closing braces that might be on their own line
    if (line.trim() === '}') {
      i++;
      continue;
    }
    
    return { error: `Unknown command: ${line}` };
  }
  
  return { actions };
}

