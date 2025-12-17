// Command parsing
export function parse(text) {
  const lines = text.trim()
    .split('\n')
    .map(l => l.trim().replace(/^>\s*/, ''))
    .filter(l => l);
  
  const actions = [];
  
  for (const line of lines) {
    // Match move() or move(5) format
    const moveMatch = line.match(/^move\((\d+)?\)$/);
    if (moveMatch) {
      const count = moveMatch[1] ? parseInt(moveMatch[1], 10) : 1;
      for (let i = 0; i < count; i++) {
        actions.push({ type: 'move' });
      }
      continue;
    }
    
    // Match jump() or jump(3) format
    const jumpMatch = line.match(/^jump\((\d+)?\)$/);
    if (jumpMatch) {
      const count = jumpMatch[1] ? parseInt(jumpMatch[1], 10) : 1;
      for (let i = 0; i < count; i++) {
        actions.push({ type: 'jump' });
      }
      continue;
    }
    
    // Match spin(r) or spin(l) format
    const spinMatch = line.match(/^spin\(([lr])\)$/);
    if (spinMatch) {
      actions.push({ type: 'spin', direction: spinMatch[1] === 'r' ? 'right' : 'left' });
      continue;
    }
    
    return { error: `Unknown command: ${line}` };
  }
  
  return { actions };
}

