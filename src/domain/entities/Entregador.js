// Domain Entity: Entregador (Driver)
class Entregador {
  constructor({
    id,
    nome,
    documento,
    cnh,
    dataNascimento,
    status = 'ATIVO',
    createdAt = new Date(),
    updatedAt = new Date()
  }) {
    this.id = id;
    this.nome = nome;
    this.documento = documento;
    this.cnh = cnh;
    this.dataNascimento = dataNascimento;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  getAge() {
    const today = new Date();
    const birthDate = new Date(this.dataNascimento);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  isOldEnough(minimumAge = 18) {
    return this.getAge() >= minimumAge;
  }

  isActive() {
    return this.status === 'ATIVO';
  }
}

module.exports = Entregador;
