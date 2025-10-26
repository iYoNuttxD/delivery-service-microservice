-- =========================================
-- BANCO DE DADOS: Microservice de Entregas
-- COMPATÍVEL COM AZURE SQL SERVER
-- =========================================

-- =========================================
-- TABELA: LOCADOR (Empresa de Aluguel)
-- =========================================
CREATE TABLE Locador (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Nome NVARCHAR(100) NOT NULL,
    Contato NVARCHAR(100),
    CNPJ NVARCHAR(18) UNIQUE,
    Endereco NVARCHAR(200),
    Status NVARCHAR(20) NOT NULL DEFAULT 'ATIVO',
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT CHK_Locador_Status CHECK (Status IN ('ATIVO', 'INATIVO'))
);

-- =========================================
-- TABELA: ENTREGADOR
-- =========================================
CREATE TABLE Entregador (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Nome NVARCHAR(100) NOT NULL,
    Documento NVARCHAR(50) NOT NULL UNIQUE, -- CPF
    CNH NVARCHAR(20) NOT NULL UNIQUE,
    CNHCategoria NVARCHAR(10) NOT NULL,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    Telefone NVARCHAR(20) NOT NULL,
    DataNascimento DATE NOT NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'ATIVO',
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT CHK_Entregador_Status CHECK (Status IN ('ATIVO', 'INATIVO', 'BLOQUEADO'))
);

-- =========================================
-- TABELA: VEICULO
-- =========================================
CREATE TABLE Veiculo (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Tipo NVARCHAR(50) NOT NULL,
    Placa NVARCHAR(20) NOT NULL UNIQUE,
    Modelo NVARCHAR(50) NOT NULL,
    Marca NVARCHAR(50) NOT NULL,
    Ano INT NOT NULL,
    PrecoDiaria FLOAT NOT NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'DISPONIVEL',
    LocadorId INT NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_Veiculo_Locador FOREIGN KEY (LocadorId) REFERENCES Locador(Id),
    CONSTRAINT CHK_Veiculo_Status CHECK (Status IN ('DISPONIVEL', 'ALUGADO', 'MANUTENCAO')),
    CONSTRAINT CHK_Veiculo_Tipo CHECK (Tipo IN ('MOTOCICLETA', 'CARRO', 'BICICLETA'))
);

-- =========================================
-- TABELA: ALUGUEL
-- =========================================
CREATE TABLE Aluguel (
    Id INT PRIMARY KEY IDENTITY(1,1),
    DataInicio DATE NOT NULL,
    DataFim DATE NULL,
    Valor FLOAT NOT NULL DEFAULT 0,
    Status NVARCHAR(20) NOT NULL DEFAULT 'ATIVO',
    VeiculoId INT NOT NULL,
    EntregadorId INT NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_Aluguel_Veiculo FOREIGN KEY (VeiculoId) REFERENCES Veiculo(Id),
    CONSTRAINT FK_Aluguel_Entregador FOREIGN KEY (EntregadorId) REFERENCES Entregador(Id),
    CONSTRAINT CHK_Aluguel_Status CHECK (Status IN ('ATIVO', 'FINALIZADO', 'CANCELADO'))
);

-- =========================================
-- TABELA: ENTREGA
-- =========================================
CREATE TABLE Entrega (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Status NVARCHAR(50) NOT NULL DEFAULT 'PENDENTE',
    DataHora DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    PedidoId NVARCHAR(50) NOT NULL, -- Referência ao Pedido do outro microservice
    EntregadorId INT NOT NULL,
    AluguelId INT NOT NULL,
    EnderecoColeta NVARCHAR(200) NOT NULL,
    EnderecoEntrega NVARCHAR(200) NOT NULL,
    HoraColeta DATETIME2 NULL,
    HoraEntrega DATETIME2 NULL,
    TaxaEntrega FLOAT NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_Entrega_Entregador FOREIGN KEY (EntregadorId) REFERENCES Entregador(Id),
    CONSTRAINT FK_Entrega_Aluguel FOREIGN KEY (AluguelId) REFERENCES Aluguel(Id),
    CONSTRAINT CHK_Entrega_Status CHECK (Status IN ('PENDENTE', 'ATRIBUIDA', 'COLETADA', 'EM_TRANSITO', 'ENTREGUE', 'CANCELADA'))
);

-- =========================================
-- ÍNDICES PARA PERFORMANCE
-- =========================================

CREATE INDEX IX_Entregador_Documento ON Entregador(Documento);
CREATE INDEX IX_Entregador_Email ON Entregador(Email);
CREATE INDEX IX_Entregador_Status ON Entregador(Status);

CREATE INDEX IX_Veiculo_Placa ON Veiculo(Placa);
CREATE INDEX IX_Veiculo_Status ON Veiculo(Status);
CREATE INDEX IX_Veiculo_Locador ON Veiculo(LocadorId);

CREATE INDEX IX_Aluguel_Entregador ON Aluguel(EntregadorId);
CREATE INDEX IX_Aluguel_Veiculo ON Aluguel(VeiculoId);
CREATE INDEX IX_Aluguel_Status ON Aluguel(Status);

CREATE INDEX IX_Entrega_Entregador ON Entrega(EntregadorId);
CREATE INDEX IX_Entrega_PedidoId ON Entrega(PedidoId);
CREATE INDEX IX_Entrega_Status ON Entrega(Status);

-- =========================================
-- DADOS DE EXEMPLO (SEED)
-- =========================================

-- Inserir Locadores
INSERT INTO Locador (Nome, Contato, CNPJ, Endereco, Status)
VALUES 
('RentCar Express', '11 98765-4321', '12.345.678/0001-90', 'Av. Paulista, 1000 - São Paulo/SP', 'ATIVO'),
('MotoRent Brasil', '11 87654-3210', '98.765.432/0001-10', 'Rua Augusta, 500 - São Paulo/SP', 'ATIVO');

-- Inserir Entregadores
INSERT INTO Entregador (Nome, Documento, CNH, CNHCategoria, Email, Telefone, DataNascimento, Status)
VALUES 
('João Silva', '12345678901', 'CNH123456', 'AB', 'joao.silva@delivery.com', '11 98765-1111', '1990-05-15', 'ATIVO'),
('Maria Santos', '98765432109', 'CNH987654', 'A', 'maria.santos@delivery.com', '11 87654-2222', '1992-08-20', 'ATIVO'),
('Pedro Oliveira', '45678912303', 'CNH456789', 'B', 'pedro.oliveira@delivery.com', '11 76543-3333', '1988-12-10', 'ATIVO');

-- Inserir Veículos
INSERT INTO Veiculo (Tipo, Placa, Modelo, Marca, Ano, PrecoDiaria, Status, LocadorId)
VALUES 
('MOTOCICLETA', 'ABC1234', 'CB 300', 'Honda', 2022, 50.00, 'DISPONIVEL', 1),
('MOTOCICLETA', 'XYZ5678', 'Factor 150', 'Yamaha', 2021, 45.00, 'DISPONIVEL', 2),
('CARRO', 'DEF9012', 'Prisma', 'Chevrolet', 2020, 80.00, 'DISPONIVEL', 1),
('BICICLETA', 'GHI3456', 'Mountain Bike', 'Caloi', 2023, 20.00, 'DISPONIVEL', 2);

-- Inserir Aluguéis
INSERT INTO Aluguel (DataInicio, DataFim, Valor, Status, VeiculoId, EntregadorId)
VALUES 
('2024-01-15', NULL, 1500.00, 'ATIVO', 1, 1),
('2024-01-20', '2024-02-20', 1350.00, 'FINALIZADO', 2, 2);

-- Inserir Entregas
INSERT INTO Entrega (Status, PedidoId, EntregadorId, AluguelId, EnderecoColeta, EnderecoEntrega, TaxaEntrega)
VALUES 
('ENTREGUE', 'PED001', 1, 1, 'Restaurante XYZ - Av. Paulista, 100', 'Rua das Flores, 200 - São Paulo/SP', 8.50),
('EM_TRANSITO', 'PED002', 1, 1, 'Restaurante ABC - Rua Augusta, 300', 'Av. Brigadeiro, 400 - São Paulo/SP', 12.00),
('PENDENTE', 'PED003', 2, 2, 'Restaurante 123 - Rua Consolação, 500', 'Rua Oscar Freire, 600 - São Paulo/SP', 10.00);

GO