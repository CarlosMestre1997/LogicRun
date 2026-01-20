// Modal management
export function createPasswordModal(levels) {
  const modal = document.createElement('div');
  modal.id = 'password-modal';
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>
      <h2>Enter Level Password</h2>
      <input type="text" id="password-input" placeholder="Password">
      <button id="password-submit">Go</button>
      <div id="password-error"></div>
    </div>
  `;
  
  document.getElementById('modal-container').appendChild(modal);
  
  const closeBtn = modal.querySelector('.close');
  const passwordSubmit = modal.querySelector('#password-submit');
  const passwordInput = modal.querySelector('#password-input');
  const errorDiv = modal.querySelector('#password-error');
  
  closeBtn.onclick = () => {
    modal.style.display = 'none';
  };
  
  window.onclick = (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  };
  
  passwordSubmit.onclick = () => {
    const password = passwordInput.value.trim();
    if (!password) {
      errorDiv.textContent = 'Please enter a password';
      return;
    }
    
    const levelData = Object.values(levels).find(l => l.password.toLowerCase() === password.toLowerCase());
    
    if (levelData) {
      window.location.href = `/play.html?password=${password.toUpperCase()}`;
    } else {
      errorDiv.textContent = 'Incorrect password';
    }
  };
  
  passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      passwordSubmit.click();
    }
  });
  
  return {
    show: () => {
      modal.style.display = 'block';
      passwordInput.value = '';
      errorDiv.textContent = '';
      setTimeout(() => passwordInput.focus(), 100);
    },
    hide: () => {
      modal.style.display = 'none';
    }
  };
}

export function createIntroModal(levelNumber) {
  if (levelNumber !== 1) return null;
  
  const modal = document.createElement('div');
  modal.id = 'intro-modal';
  modal.className = 'modal';
  modal.style.display = 'block';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 500px;">
      <div style="text-align: center; padding: 0px;">
        <img id="intro-celebrate-img" src="/celebrate.png" alt="Startie" style="width: 400px; height: auto; image-rendering: pixelated;">
        <h2 style="color: var(--white); margin-bottom: 15px;">Hi, I'm Startie!</h2>
        <p style="color: var(--white); font-size: 16px; line-height: 1.6;">Can you get me to the next level?<br>Write code to move me around, the less commands you write, the higher your score!</p>
        <button id="intro-close" style="margin-top: 10px; padding: 10px 30px; font-size: 16px; cursor: pointer; background: #0f00ff; color: #ff6fb8; border: none; border-radius: 4px;">Let's Go!</button>
      </div>
    </div>
  `;
  
  document.getElementById('modal-container').appendChild(modal);
  
  const closeBtn = modal.querySelector('#intro-close');
  const celebrateImg = modal.querySelector('#intro-celebrate-img');
  
  closeBtn.onclick = () => {
    modal.style.display = 'none';
  };
  
  window.onclick = (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  };
  
  // Animate the celebrate image
  if (celebrateImg) {
    import('../render/animations.js').then(({ animateCelebrationImage }) => {
      celebrateImg.onload = () => {
        animateCelebrationImage(celebrateImg, 1500);
      };
      if (celebrateImg.complete) {
        animateCelebrationImage(celebrateImg, 1500);
      }
    });
  }
  
  return modal;
}

/**
 * Create registration modal for capturing email + username after level 1
 * @param {function} onRegister - Callback when registration is submitted
 * @returns {object} Modal controller
 */
export function createRegistrationModal(onRegister) {
  const modal = document.createElement('div');
  modal.id = 'registration-modal';
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 450px;">
      <div style="text-align: center; padding: 20px;">
        <img src="/celebrate.png" alt="Startie" style="width: 150px; height: auto; image-rendering: pixelated; margin-bottom: 15px;">
        <h2 style="color: var(--white); margin-bottom: 10px;">🎉 Level Complete!</h2>
        <p style="color: #888; font-size: 14px; margin-bottom: 20px;">
          Join the leaderboard to compete with other players!<br>
          Your scores will update in real-time as you progress.
        </p>
        
        <div style="text-align: left; margin-bottom: 15px;">
          <label style="color: var(--white); font-size: 14px; display: block; margin-bottom: 5px;">Email Address</label>
          <input type="email" id="reg-email" placeholder="your@email.com" 
            style="width: 100%; padding: 12px; background: var(--black); border: 1px solid #555; color: var(--white); font-family: 'Courier New', monospace; font-size: 14px; box-sizing: border-box;">
        </div>
        
        <div style="text-align: left; margin-bottom: 15px;">
          <label style="color: var(--white); font-size: 14px; display: block; margin-bottom: 5px;">Username (3 characters)</label>
          <input type="text" id="reg-username" placeholder="ABC" maxlength="3" 
            style="width: 100%; padding: 12px; background: var(--black); border: 1px solid #555; color: var(--white); font-family: 'Courier New', monospace; font-size: 18px; text-align: center; letter-spacing: 0.5em; text-transform: uppercase; box-sizing: border-box;">
        </div>
        
        <div id="reg-error" style="color: #ff4444; min-height: 20px; margin-bottom: 10px; font-size: 13px;"></div>
        
        <button id="reg-submit" style="width: 100%; padding: 12px; background: var(--pink); border: none; color: var(--white); font-weight: bold; cursor: pointer; font-family: 'Courier New', monospace; font-size: 14px; margin-bottom: 10px;">
          Send Verification Email
        </button>
        
        <button id="reg-signin" style="width: 100%; padding: 10px; background: transparent; border: 1px solid var(--pink); color: var(--pink); cursor: pointer; font-family: 'Courier New', monospace; font-size: 13px; margin-bottom: 10px;">
          I already have an account
        </button>
        
        <button id="reg-skip" style="width: 100%; padding: 10px; background: transparent; border: 1px solid #555; color: #888; cursor: pointer; font-family: 'Courier New', monospace; font-size: 13px;">
          Skip for now
        </button>
      </div>
    </div>
  `;
  
  document.getElementById('modal-container').appendChild(modal);
  
  const emailInput = modal.querySelector('#reg-email');
  const usernameInput = modal.querySelector('#reg-username');
  const errorDiv = modal.querySelector('#reg-error');
  const submitBtn = modal.querySelector('#reg-submit');
  const signInBtn = modal.querySelector('#reg-signin');
  const skipBtn = modal.querySelector('#reg-skip');
  
  // Auto-uppercase username
  usernameInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  });
  
  // Sign in for returning users - just needs email, sends magic link
  signInBtn.onclick = async () => {
    const email = emailInput.value.trim();
    
    errorDiv.textContent = '';
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errorDiv.textContent = 'Please enter your email address above';
      return;
    }
    
    signInBtn.disabled = true;
    signInBtn.textContent = 'Sending link...';
    
    try {
      // Import sendMagicLink dynamically to avoid circular deps
      const { sendMagicLink } = await import('../utils/supabase.js');
      const result = await sendMagicLink(email);
      
      if (result.success) {
        modal.querySelector('.modal-content').innerHTML = `
          <div style="text-align: center; padding: 30px;">
            <h2 style="color: var(--white); margin-bottom: 15px;">📧 Check Your Email!</h2>
            <p style="color: #888; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
              We sent a sign-in link to:<br>
              <strong style="color: var(--white);">${email}</strong>
            </p>
            <p style="color: #888; font-size: 13px;">
              Click the link to sign in and continue your progress!
            </p>
            <button id="reg-continue" style="margin-top: 20px; padding: 12px 30px; background: var(--pink); border: none; color: var(--white); font-weight: bold; cursor: pointer; font-family: 'Courier New', monospace;">
              Continue Playing
            </button>
          </div>
        `;
        
        modal.querySelector('#reg-continue').onclick = () => {
          modal.style.display = 'none';
        };
      } else {
        errorDiv.textContent = result.error || 'Failed to send sign-in link';
        signInBtn.disabled = false;
        signInBtn.textContent = 'I already have an account';
      }
    } catch (error) {
      errorDiv.textContent = error.message || 'An error occurred';
      signInBtn.disabled = false;
      signInBtn.textContent = 'I already have an account';
    }
  };
  
  submitBtn.onclick = async () => {
    const email = emailInput.value.trim();
    const username = usernameInput.value.trim().toUpperCase();
    
    errorDiv.textContent = '';
    
    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errorDiv.textContent = 'Please enter a valid email address';
      return;
    }
    
    // Validate username
    if (username.length !== 3 || !/^[A-Z0-9]{3}$/.test(username)) {
      errorDiv.textContent = 'Username must be exactly 3 letters or numbers';
      return;
    }
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    
    try {
      const result = await onRegister(email, username);
      
      if (result.success) {
        // Show verification pending message
        modal.querySelector('.modal-content').innerHTML = `
          <div style="text-align: center; padding: 30px;">
            <h2 style="color: var(--white); margin-bottom: 15px;">📧 Check Your Email!</h2>
            <p style="color: #888; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
              We sent a verification link to:<br>
              <strong style="color: var(--white);">${email}</strong>
            </p>
            <p style="color: #888; font-size: 13px;">
              Click the link in the email to verify your account.<br>
              You can continue playing in the meantime!
            </p>
            <button id="reg-continue" style="margin-top: 20px; padding: 12px 30px; background: var(--pink); border: none; color: var(--white); font-weight: bold; cursor: pointer; font-family: 'Courier New', monospace;">
              Continue Playing
            </button>
          </div>
        `;
        
        modal.querySelector('#reg-continue').onclick = () => {
          modal.style.display = 'none';
        };
      } else {
        errorDiv.textContent = result.error || 'Registration failed. Please try again.';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Verification Email';
      }
    } catch (error) {
      errorDiv.textContent = error.message || 'An error occurred';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Verification Email';
    }
  };
  
  skipBtn.onclick = () => {
    modal.style.display = 'none';
  };
  
  // Enter key submits
  emailInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') usernameInput.focus();
  });
  usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') submitBtn.click();
  });
  
  return {
    show: () => {
      modal.style.display = 'block';
      setTimeout(() => emailInput.focus(), 100);
    },
    hide: () => {
      modal.style.display = 'none';
    }
  };
}

/**
 * Create verification success modal
 * @param {string} username - The verified username
 * @returns {object} Modal controller
 */
export function createVerificationSuccessModal(username) {
  const modal = document.createElement('div');
  modal.id = 'verification-success-modal';
  modal.className = 'modal';
  modal.style.display = 'block';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 400px;">
      <div style="text-align: center; padding: 30px;">
        <h2 style="color: var(--white); margin-bottom: 15px;">✅ Verified!</h2>
        <p style="color: #888; font-size: 14px; margin-bottom: 20px;">
          Welcome, <strong style="color: var(--pink);">${username}</strong>!<br>
          Your scores will now appear on the leaderboard.
        </p>
        <button id="verify-continue" style="padding: 12px 30px; background: var(--pink); border: none; color: var(--white); font-weight: bold; cursor: pointer; font-family: 'Courier New', monospace;">
          Continue
        </button>
      </div>
    </div>
  `;
  
  document.getElementById('modal-container').appendChild(modal);
  
  modal.querySelector('#verify-continue').onclick = () => {
    modal.style.display = 'none';
    modal.remove();
  };
  
  return modal;
}
