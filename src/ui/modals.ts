// Modal management
import type { ModalController, LevelInfo, RegistrationResult } from '../types';

export function createPasswordModal(levels: Record<number, LevelInfo>): ModalController {
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
  
  document.getElementById('modal-container')?.appendChild(modal);
  
  const closeBtn = modal.querySelector('.close') as HTMLSpanElement;
  const passwordSubmit = modal.querySelector('#password-submit') as HTMLButtonElement;
  const passwordInput = modal.querySelector('#password-input') as HTMLInputElement;
  const errorDiv = modal.querySelector('#password-error') as HTMLDivElement;
  
  closeBtn.onclick = () => {
    modal.style.display = 'none';
  };
  
  window.onclick = (e: MouseEvent) => {
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
  
  passwordInput.addEventListener('keypress', (e: KeyboardEvent) => {
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

export function createIntroModal(levelNumber: number, onClose: (() => void) | null = null): HTMLDivElement | null {
  if (levelNumber !== 1) return null;
  
  const modal = document.createElement('div');
  modal.id = 'intro-modal';
  modal.className = 'modal';
  modal.style.display = 'block';
  modal.innerHTML = `
    <div class="modal-content modal-content--wide">
      <div class="modal-body modal-body--compact">
        <img id="intro-celebrate-img" src="/celebrate.png" alt="Startie" class="intro-image">
        <h2 class="modal-title">Hi, I'm Startie!</h2>
        <p class="modal-text">Can you get me to the next level?<br>Write code to move me around, the less commands you write, the higher your score!</p>
        <button id="intro-close" class="intro-button">Let's Go!</button>
      </div>
    </div>
  `;
  
  document.getElementById('modal-container')?.appendChild(modal);
  
  const closeBtn = modal.querySelector('#intro-close') as HTMLButtonElement;
  const celebrateImg = modal.querySelector('#intro-celebrate-img') as HTMLImageElement;
  
  const handleClose = (): void => {
    modal.style.display = 'none';
    if (onClose) onClose();
  };
  
  closeBtn.onclick = handleClose;
  
  window.onclick = (e: MouseEvent) => {
    if (e.target === modal) {
      handleClose();
    }
  };
  
  // Animate the celebrate image
  if (celebrateImg) {
    import('../render/animations').then(({ animateCelebrationImage }) => {
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
 */
export function createRegistrationModal(onRegister: (email: string, username: string) => Promise<RegistrationResult>): ModalController {
  const modal = document.createElement('div');
  modal.id = 'registration-modal';
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content modal-content--medium">
      <div class="modal-body">
        <h2 class="modal-title modal-title--tight">Join the Leaderboard!</h2>
        <p class="modal-text--muted">
          Register to compete with other players!<br>
          Your scores will update in real-time as you progress.
        </p>
        
        <div class="form-group">
          <label class="form-label">Email Address</label>
          <input type="email" id="reg-email" placeholder="your@email.com" class="form-input">
        </div>
        
        <div class="form-group">
          <label class="form-label">Username (3 characters)</label>
          <input type="text" id="reg-username" placeholder="ABC" maxlength="3" class="form-input form-input--username">
        </div>
        
        <div id="reg-error" class="form-error"></div>
        
        <button id="reg-submit" class="modal-btn modal-btn--primary">
          Send Verification Email
        </button>
        
        <button id="reg-signin" class="modal-btn modal-btn--secondary">
          I already have an account
        </button>
        
        <button id="reg-skip" class="modal-btn modal-btn--tertiary">
          Play without registering
        </button>
      </div>
    </div>
  `;
  
  document.getElementById('modal-container')?.appendChild(modal);
  
  const emailInput = modal.querySelector('#reg-email') as HTMLInputElement;
  const usernameInput = modal.querySelector('#reg-username') as HTMLInputElement;
  const errorDiv = modal.querySelector('#reg-error') as HTMLDivElement;
  const submitBtn = modal.querySelector('#reg-submit') as HTMLButtonElement;
  const signInBtn = modal.querySelector('#reg-signin') as HTMLButtonElement;
  const skipBtn = modal.querySelector('#reg-skip') as HTMLButtonElement;
  
  // Auto-uppercase username
  usernameInput.addEventListener('input', (e: Event) => {
    const target = e.target as HTMLInputElement;
    target.value = target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  });
  
  // Sign in for returning users - check if verified account exists
  signInBtn.onclick = async () => {
    const email = emailInput.value.trim();
    
    errorDiv.textContent = '';
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errorDiv.textContent = 'Please enter your email address above';
      return;
    }
    
    signInBtn.disabled = true;
    signInBtn.textContent = 'Checking...';
    
    try {
      // Import signInExistingPlayer to check if verified account exists
      const { signInExistingPlayer } = await import('../utils/player-session');
      const result = await signInExistingPlayer(email);
      
      if (result.success) {
        // Account found and session restored - close modal and continue
        modal.style.display = 'none';
      } else {
        errorDiv.textContent = result.error || 'No verified account found with this email';
        signInBtn.disabled = false;
        signInBtn.textContent = 'I already have an account';
      }
    } catch (error) {
      errorDiv.textContent = (error as Error).message || 'An error occurred';
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
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
          modalContent.innerHTML = `
            <div class="modal-body modal-body--spacious">
              <h2 class="modal-title">📧 Check Your Email!</h2>
              <p class="modal-text--muted">
                We sent a verification link to:<br>
                <strong class="modal-text--highlight">${email}</strong>
              </p>
              <p class="modal-text--small">
                Click the link in the email to verify your account.<br>
                You can continue playing in the meantime!
              </p>
              <button id="reg-continue" class="modal-btn modal-btn--primary modal-btn--inline">
                Continue Playing
              </button>
            </div>
          `;
          
          const continueBtn = modal.querySelector('#reg-continue') as HTMLButtonElement;
          if (continueBtn) {
            continueBtn.onclick = () => {
              modal.style.display = 'none';
            };
          }
        }
      } else {
        errorDiv.textContent = result.error || 'Registration failed. Please try again.';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Verification Email';
      }
    } catch (error) {
      errorDiv.textContent = (error as Error).message || 'An error occurred';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Verification Email';
    }
  };
  
  skipBtn.onclick = () => {
    modal.style.display = 'none';
  };
  
  // Enter key submits
  emailInput.addEventListener('keypress', (e: KeyboardEvent) => {
    if (e.key === 'Enter') usernameInput.focus();
  });
  usernameInput.addEventListener('keypress', (e: KeyboardEvent) => {
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
 */
export function createVerificationSuccessModal(username: string): HTMLDivElement {
  const modal = document.createElement('div');
  modal.id = 'verification-success-modal';
  modal.className = 'modal';
  modal.style.display = 'block';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-body modal-body--spacious">
        <h2 class="modal-title">✅ Verified!</h2>
        <p class="modal-text--muted">
          Welcome, <strong class="modal-text--accent">${username}</strong>!<br>
          Your scores will now appear on the leaderboard.
        </p>
        <button id="verify-continue" class="modal-btn modal-btn--primary modal-btn--inline">
          Continue
        </button>
      </div>
    </div>
  `;
  
  document.getElementById('modal-container')?.appendChild(modal);
  
  const continueBtn = modal.querySelector('#verify-continue') as HTMLButtonElement;
  if (continueBtn) {
    continueBtn.onclick = () => {
      modal.style.display = 'none';
      modal.remove();
    };
  }
  
  return modal;
}
