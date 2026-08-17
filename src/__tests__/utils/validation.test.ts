import { 
  isValidCPF, 
  isValidCNPJ, 
  isValidEmail, 
  isValidPhone,
  isStrongPassword 
} from '@/lib/utils/validation';

describe('Validation Utils', () => {
  describe('isValidCPF', () => {
    it('should validate correct CPF', () => {
      expect(isValidCPF('123.456.789-09')).toBe(true);
    });

    it('should reject invalid CPF', () => {
      expect(isValidCPF('111.111.111-11')).toBe(false);
    });

    it('should reject CPF with wrong length', () => {
      expect(isValidCPF('123.456.789-0')).toBe(false);
    });
  });

  describe('isValidCNPJ', () => {
    it('should validate correct CNPJ', () => {
      expect(isValidCNPJ('11.222.333/0001-81')).toBe(true);
    });

    it('should reject invalid CNPJ', () => {
      expect(isValidCNPJ('11.111.111/1111-11')).toBe(false);
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
    });

    it('should reject invalid email', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('should validate correct phone with DDD', () => {
      expect(isValidPhone('11999999999')).toBe(true);
    });

    it('should reject invalid phone', () => {
      expect(isValidPhone('123')).toBe(false);
    });
  });

  describe('isStrongPassword', () => {
    it('should validate strong password', () => {
      const result = isStrongPassword('Abc123!@#');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject weak password', () => {
      const result = isStrongPassword('weak');
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(4);
    });
  });
});
