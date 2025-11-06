// Value Object: DocumentoCPF
// Simple CPF document validation
class DocumentoCPF {
  constructor(value) {
    this.value = this.validate(value);
  }

  validate(cpf) {
    if (!cpf) {
      throw new Error('CPF é obrigatório');
    }

    // Remove non-numeric characters
    const cleanCpf = cpf.replace(/\D/g, '');

    if (cleanCpf.length !== 11) {
      throw new Error('CPF deve ter 11 dígitos');
    }

    // Check for known invalid patterns (all same digits)
    if (/^(\d)\1{10}$/.test(cleanCpf)) {
      throw new Error('CPF inválido');
    }

    // Validate check digits
    if (!this.validateCheckDigits(cleanCpf)) {
      throw new Error('CPF inválido - dígitos verificadores incorretos');
    }

    return cleanCpf;
  }

  validateCheckDigits(cpf) {
    // Calculate first check digit
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let digit1 = 11 - (sum % 11);
    if (digit1 > 9) digit1 = 0;

    // Calculate second check digit
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    let digit2 = 11 - (sum % 11);
    if (digit2 > 9) digit2 = 0;

    // Verify both digits
    return parseInt(cpf.charAt(9)) === digit1 && parseInt(cpf.charAt(10)) === digit2;
  }

  toString() {
    return this.value;
  }

  formatted() {
    return this.value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  equals(other) {
    return other instanceof DocumentoCPF && this.value === other.value;
  }
}

module.exports = DocumentoCPF;
