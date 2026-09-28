export const validateName = (name) => {
  if (!name || !name.trim()) return 'Name is required.';
  const trimmed = name.trim();
  if (trimmed.length < 20) return 'Name must be at least 20 characters.';
  if (trimmed.length > 60) return 'Name must not exceed 60 characters.';
  return null;
};

export const validateAddress = (address) => {
  if (!address || !address.trim()) return 'Address is required.';
  const trimmed = address.trim();
  if (trimmed.length > 400) return 'Address must not exceed 400 characters.';
  return null;
};

export const validateEmail = (email) => {
  if (!email || !email.trim()) return 'Email address is required.';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) return 'Please enter a valid email address.';
  return null;
};

export const getPasswordCriteria = (password = '') => {
  return {
    minLength: password.length >= 8 && password.length <= 16,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  };
};

export const validatePassword = (password) => {
  if (!password) return 'Password is required.';
  const criteria = getPasswordCriteria(password);
  if (!criteria.minLength) return 'Password must be between 8 and 16 characters.';
  if (!criteria.hasUpper) return 'Password must contain at least one uppercase letter.';
  if (!criteria.hasLower) return 'Password must contain at least one lowercase letter.';
  if (!criteria.hasNumber) return 'Password must contain at least one number.';
  if (!criteria.hasSpecial) return 'Password must contain at least one special character.';
  return null;
};
