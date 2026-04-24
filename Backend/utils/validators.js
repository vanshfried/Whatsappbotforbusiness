// 📧 Email validation
export function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// 🔑 Password validation
export function isStrongPassword(password, email) {
  const minLength = password.length >= 10;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const notSameAsEmail = password !== email;

  return (
    minLength &&
    hasUpper &&
    hasLower &&
    hasNumber &&
    hasSymbol &&
    notSameAsEmail
  );
}