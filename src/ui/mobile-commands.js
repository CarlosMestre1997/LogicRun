// Mobile command palette (drag-and-drop interface)
export function initMobileCommands(terminal, onCommandsChange) {
  const terminalDropZone = document.getElementById('terminal-drop-zone');
  let commands = []; // Array to store dropped commands

  // Check if mobile (touch device or small screen)
  const isMobileDevice = window.innerWidth <= 768 || ('ontouchstart' in window);

  if (!isMobileDevice || !terminalDropZone) return;

  function updateTerminalFromCommands() {
    // Update textarea with commands
    if (terminal && commands.length > 0) {
      terminal.value = commands.map(cmd => `> ${cmd}`).join('\n');
    } else if (terminal) {
      terminal.value = '';
    }
    
    // Update drop zone display
    terminalDropZone.classList.toggle('empty', commands.length === 0);
    terminalDropZone.innerHTML = '';
    
    commands.forEach((cmd, index) => {
      const chip = document.createElement('div');
      chip.className = 'command-chip';
      chip.dataset.index = index;
      
      // Check if command is spin(l) or spin(r) - these don't need parameter input
      const isSpinDirection = cmd === 'spin(l)' || cmd === 'spin(r)';
      
      if (isSpinDirection) {
        chip.innerHTML = `
          <span class="command-text">${cmd}</span>
          <button class="remove-btn" data-index="${index}">×</button>
        `;
        
        const removeBtn = chip.querySelector('.remove-btn');
        removeBtn.onclick = (e) => {
          e.stopPropagation();
          commands.splice(index, 1);
          updateTerminalFromCommands();
          if (onCommandsChange) onCommandsChange();
        };
      } else {
        const match = cmd.match(/^(\w+)\((\d*)\)$/);
        const baseCmd = match ? match[1] : cmd.replace(/\(.*\)/, '');
        const param = match ? match[2] : '';
        
        chip.innerHTML = `
          <span class="command-text">${baseCmd}(</span>
          <input type="text" class="command-param" value="${param}" data-index="${index}" inputmode="numeric" pattern="[0-9]*" maxlength="2">
          <span class="command-text">)</span>
          <button class="remove-btn" data-index="${index}">×</button>
        `;
        
        const paramInput = chip.querySelector('.command-param');
        const removeBtn = chip.querySelector('.remove-btn');
        
        paramInput.addEventListener('input', (e) => {
          const newParam = e.target.value.replace(/[^0-9]/g, '');
          e.target.value = newParam;
          const newCmd = newParam ? `${baseCmd}(${newParam})` : `${baseCmd}()`;
          commands[index] = newCmd;
          updateTerminalFromCommands();
          if (onCommandsChange) onCommandsChange();
        });
        
        paramInput.addEventListener('blur', () => {
          const param = paramInput.value.replace(/[^0-9]/g, '');
          const newCmd = param ? `${baseCmd}(${param})` : `${baseCmd}()`;
          commands[index] = newCmd;
          updateTerminalFromCommands();
        });
        
        chip.addEventListener('click', (e) => {
          if (e.target !== removeBtn && e.target !== paramInput) {
            paramInput.focus();
            setTimeout(() => paramInput.select(), 10);
          }
        });
        
        paramInput.addEventListener('focus', () => {
          paramInput.select();
        });
        
        removeBtn.onclick = (e) => {
          e.stopPropagation();
          commands.splice(index, 1);
          updateTerminalFromCommands();
          if (onCommandsChange) onCommandsChange();
        };
      }
      
      terminalDropZone.appendChild(chip);
    });
  }

  // Command palette functionality
  const commandButtons = document.querySelectorAll('.command-btn');
  
  commandButtons.forEach(btn => {
    // Primary method: tap/click to add
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const command = btn.dataset.command;
      if (command) {
        commands.push(command);
        updateTerminalFromCommands();
        if (onCommandsChange) onCommandsChange();
        
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => {
          btn.style.transform = '';
        }, 150);
      }
    });
    
    // Touch-based drag support
    let btnTouchStartY = 0;
    let btnTouchStartX = 0;
    let btnIsDragging = false;
    
    btn.addEventListener('touchstart', (e) => {
      btnTouchStartY = e.touches[0].clientY;
      btnTouchStartX = e.touches[0].clientX;
      btnIsDragging = false;
    }, { passive: true });
    
    btn.addEventListener('touchmove', (e) => {
      const touchY = e.touches[0].clientY;
      const touchX = e.touches[0].clientX;
      const deltaY = Math.abs(touchY - btnTouchStartY);
      const deltaX = Math.abs(touchX - btnTouchStartX);
      
      if ((deltaY > 10 || deltaX > 10) && !btnIsDragging) {
        btnIsDragging = true;
        btn.classList.add('dragging');
        if (e.cancelable) {
          e.preventDefault();
        }
      }
      
      if (btnIsDragging && e.cancelable) {
        e.preventDefault();
        const rect = terminalDropZone.getBoundingClientRect();
        if (touchY >= rect.top && touchY <= rect.bottom) {
          terminalDropZone.style.borderColor = '#0f0';
        } else {
          terminalDropZone.style.borderColor = '#555';
        }
      }
    }, { passive: false });
    
    btn.addEventListener('touchend', (e) => {
      if (btnIsDragging) {
        btn.classList.remove('dragging');
        const touchY = e.changedTouches[0].clientY;
        const rect = terminalDropZone.getBoundingClientRect();
        
        if (touchY >= rect.top && touchY <= rect.bottom) {
          const command = btn.dataset.command;
          commands.push(command);
          updateTerminalFromCommands();
          if (onCommandsChange) onCommandsChange();
        }
        
        terminalDropZone.style.borderColor = '#555';
        if (e.cancelable) {
          e.preventDefault();
        }
      }
      btnIsDragging = false;
    }, { passive: false });
  });

  // Initialize
  updateTerminalFromCommands();
  
  return {
    getCommands: () => commands.join('\n'),
    setCommands: (newCommands) => {
      commands = newCommands;
      updateTerminalFromCommands();
    }
  };
}
