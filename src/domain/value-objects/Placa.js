// Value Object: Placa (License Plate)
// Brazilian license plate validation
class Placa {
  constructor(value) {
    this.value = this.validate(value);
  }

  validate(placa) {
    if (!placa) {
      throw new Error('Placa é obrigatória');
    }

    // Remove spaces and convert to uppercase
    const cleanPlaca = placa.replace(/\s/g, '').toUpperCase();

    // Brazilian plates: ABC1234 (old) or ABC1D23 (Mercosul)
    const oldPattern = /^[A-Z]{3}\d{4}$/;
    const mercosulPattern = /^[A-Z]{3}\d[A-Z]\d{2}$/;

    if (!oldPattern.test(cleanPlaca) && !mercosulPattern.test(cleanPlaca)) {
      throw new Error('Placa inválida. Formato esperado: ABC1234 ou ABC1D23');
    }

    return cleanPlaca;
  }

  toString() {
    return this.value;
  }

  formatted() {
    // Format as ABC-1234 or ABC-1D23
    return this.value.replace(/^([A-Z]{3})(.+)$/, '$1-$2');
  }

  equals(other) {
    return other instanceof Placa && this.value === other.value;
  }

  isMercosul() {
    // Mercosul plates have a letter in the 5th position
    return /^[A-Z]{3}\d[A-Z]\d{2}$/.test(this.value);
  }
}

module.exports = Placa;
