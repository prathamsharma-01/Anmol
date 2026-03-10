// Password validation utility
export const validatePassword = (password) => {
  const errors = [];
  
  if (!password || password.length < 8) {
    errors.push('At least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('One uppercase letter (A-Z)');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('One lowercase letter (a-z)');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('One number (0-9)');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('One special character (!@#$%^&*)');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors,
    message: errors.length > 0 ? `Password must contain: ${errors.join(', ')}` : 'Password is strong!'
  };
};

export const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', color: '#ccc' };
  
  let score = 0;
  
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;
  
  if (score <= 2) return { score, label: 'Weak', color: '#e74c3c' };
  if (score <= 3) return { score, label: 'Fair', color: '#f39c12' };
  if (score <= 4) return { score, label: 'Good', color: '#27ae60' };
  return { score, label: 'Strong', color: '#2ecc71' };
};