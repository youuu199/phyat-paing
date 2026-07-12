export type PasswordValidationError = 'length' | 'number';

export function validatePassword(password: string): PasswordValidationError | null {
  if (password.length < 8) {
    return 'length';
  }
  if (!/\d/.test(password)) {
    return 'number';
  }
  return null;
}
