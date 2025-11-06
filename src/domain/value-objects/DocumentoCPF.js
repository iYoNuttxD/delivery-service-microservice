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

    return cleanCpf;
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
