const EntregadorService = require('../../src/services/EntregadorService');
const EntregadorRepository = require('../../src/repositories/EntregadorRepository');

jest.mock('../../src/repositories/EntregadorRepository');

describe('EntregadorService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createEntregador', () => {
    it('Deve criar um entregador com dados válidos', async () => {
      const mockData = {
        nome: 'João Silva',
        documento: '12345678901',
        cnh: 'CNH123',
        cnhCategoria: 'AB',
        email: 'joao@test.com',
        telefone: '11999999999',
        dataNascimento: '1990-01-01'
      };

      EntregadorRepository.findByDocumento.mockResolvedValue(null);
      EntregadorRepository.create.mockResolvedValue({ Id: 1, ...mockData });

      const result = await EntregadorService.createEntregador(mockData);

      expect(result).toHaveProperty('Id');
      expect(result.nome).toBe(mockData.nome);
      expect(EntregadorRepository.create).toHaveBeenCalledWith(mockData);
    });

    it('Deve rejeitar entregador menor de 18 anos', async () => {
      const mockData = {
        nome: 'Menor Idade',
        documento: '98765432100',
        cnh: 'CNH456',
        cnhCategoria: 'A',
        email: 'menor@test.com',
        telefone: '11888888888',
        dataNascimento: '2020-01-01' // Muito jovem
      };

      EntregadorRepository.findByDocumento.mockResolvedValue(null);

      await expect(EntregadorService.createEntregador(mockData))
        .rejects
        .toThrow('Entregador deve ter no mínimo 18 anos');
    });

    it('Deve rejeitar CPF duplicado', async () => {
      const mockData = {
        documento: '12345678901',
        // ... outros campos
      };

      EntregadorRepository.findByDocumento.mockResolvedValue({ Id: 1 });

      await expect(EntregadorService.createEntregador(mockData))
        .rejects
        .toThrow('CPF já cadastrado');
    });
  });
});