# 🚚 Delivery Service Microservice

![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![Express](https://img.shields.io/badge/Express-4.18-blue.svg)
![Azure SQL](https://img.shields.io/badge/Azure_SQL-Server-red.svg)
![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

**Microservice profissional para gerenciamento de entregas, entregadores, veículos e aluguéis integrado com Azure SQL Server.**

Desenvolvido por: **[@iYoNuttxD](https://github.com/iYoNuttxD)**

---

## 📋 **Índice**

- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Executar Projeto](#-executar-projeto)
- [API Endpoints](#-api-endpoints)
- [Documentação Swagger](#-documentação-swagger)
- [Testes](#-testes)
- [Docker](#-docker)
- [Deploy Azure](#-deploy-azure)
- [Licença](#-licença)

---

## 🎯 **Funcionalidades**

### ✅ **Gestão de Entregadores**
- CRUD completo de entregadores
- Validação de CPF e CNH únicos
- Validação de idade mínima (18 anos)
- Controle de status (ATIVO, INATIVO, BLOQUEADO)

### ✅ **Gestão de Veículos**
- CRUD completo de veículos
- Tipos: MOTOCICLETA, CARRO, BICICLETA
- Status: DISPONÍVEL, ALUGADO, MANUTENÇÃO
- Validação de placa única

### ✅ **Gestão de Aluguéis**
- Criar aluguel vinculando entregador e veículo
- Verificação automática de disponibilidade
- Cálculo automático de valor (diárias)
- Finalizar ou cancelar aluguel
- Atualização automática de status do veículo

### ✅ **Gestão de Entregas**
- Criar entregas vinculadas a pedidos
- Rastreamento de status com máquina de estados
- Timestamps automáticos (coleta/entrega)
- Cálculo de ETA (tempo estimado de entrega)
- Integração com APIs de mapas (Google Maps)

### ✅ **Rastreamento em Tempo Real**
- Atualização de posição GPS das entregas
- Consulta de localização em tempo real
- Armazenamento em memória com possibilidade de persistência

### ✅ **Event-Driven Architecture (EDA)**
- Publicação de eventos de mudança de status
- Subscrição a eventos de criação de pedidos
- Integração via NATS (opcional)
- Suporte a arquitetura assíncrona

### ✅ **Autorização e Segurança**
- Autorização baseada em políticas (OPA)
- Controle de acesso granular por recurso e ação
- Proteção de endpoints sensíveis
- Feature flag para ambientes sem OPA

### ✅ **Observabilidade**
- Métricas Prometheus (/metrics)
- Monitoramento de requests HTTP
- Tracking de eventos NATS
- Métricas customizadas por domínio
- Logging estruturado (Winston)

### ✅ **Recursos Técnicos**
- Arquitetura em camadas (Repository → Service → Controller)
- Validação de dados (express-validator)
- Tratamento centralizado de erros
- Documentação OpenAPI/Swagger
- Testes automatizados (Jest)
- Containerização (Docker)
- Health check endpoint
- Graceful shutdown

---

## 🛠️ **Tecnologias**

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| **Node.js** | 18+ | Runtime JavaScript |
| **Express.js** | 4.18 | Framework web |
| **mssql** | 10.0 | Driver Azure SQL Server |
| **Azure SQL Server** | 2022 | Banco de dados |
| **Winston** | 3.11 | Sistema de logs |
| **Swagger UI** | 5.0 | Documentação API |
| **mssql** | 12.0 | Driver Azure SQL Server |
| **Azure SQL Server** | 2022 | Banco de dados |
| **Winston** | 3.11 | Sistema de logs |
| **Swagger UI** | 5.0 | Documentação API |
| **Jest** | 29.7 | Framework de testes |
| **Docker** | Latest | Containerização |
| **NATS** | Latest | Message Broker (Event-Driven) |
| **OPA** | Latest | Policy-based Authorization |
| **Axios** | Latest | HTTP Client |
| **Prom-Client** | Latest | Métricas Prometheus |

---

## 🏗️ **Arquitetura**

```
┌─────────────────────────────────────────────┐
│            CLIENT (Frontend/BFF)            │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│           CONTROLLER LAYER                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │Entregador│  │ Veículo  │  │ Entrega  │  │
│  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│            SERVICE LAYER                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Business │  │ Business │  │ Business │  │
│  │  Logic   │  │  Logic   │  │  Logic   │  │
│  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│          REPOSITORY LAYER                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   Data   │  │   Data   │  │   Data   │  │
│  │  Access  │  │  Access  │  │  Access  │  │
│  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│         AZURE SQL SERVER DATABASE           │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│   │Entregador│  │ Veículo  │  │ Entrega  │ │
│   └──────────┘  └──────────┘  └──────────┘ │
└─────────────────────────────────────────────┘
```

---

## 📦 **Pré-requisitos**

- **Node.js** 18 ou superior
- **Azure SQL Server** (ou SQL Server local)
- **Docker** (opcional)
- **Git**

---

## 🚀 **Instalação**

### **1. Clonar Repositório**

```bash
git clone https://github.com/iYoNuttxD/delivery-service-microservice.git
cd delivery-service-microservice
```

### **2. Instalar Dependências**

```bash
npm install
```

### **3. Configurar Variáveis de Ambiente**

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais do Azure SQL Server e serviços opcionais:

```env
# Application
NODE_ENV=development
PORT=3001

# Azure SQL Server Configuration
DB_SERVER=your-server.database.windows.net
DB_DATABASE=DeliveryServiceDB
DB_USER=your-username
DB_PASSWORD=your-password

# Logging
LOG_LEVEL=info

# NATS Configuration (Event-Driven Architecture) - OPCIONAL
# Se não configurado, o serviço funciona sem EDA
NATS_URL=nats://localhost:4222
NATS_CLIENT_ID=delivery-service
NATS_SUBJECT_ORDER_CREATED=order.created

# OPA Configuration (Policy-based Authorization) - OPCIONAL
# Se não configurado, a autorização OPA é ignorada
OPA_URL=http://localhost:8181

# Maps API Configuration (Routes and ETA) - OPCIONAL
# Se não configurado, retorna valores simulados
MAPS_API_URL=https://maps.googleapis.com/maps/api
MAPS_API_KEY=your-google-maps-api-key
```

### **4. Criar Banco de Dados**

Execute o script SQL no Azure SQL Server:

```bash
# O arquivo está em: scripts/schema-delivery-azure.sql
```

Ou use Azure Data Studio / SQL Server Management Studio para executar o script.

---

## ⚙️ **Configuração**

### **Azure SQL Server**

1. **Criar SQL Server no Azure**
   - Nome: `erp-delivery-sql-server`
   - Região: Brazil South
   - Admin: `erpadmin`

2. **Configurar Firewall**
   - Adicionar seu IP público
   - Permitir serviços Azure

3. **Criar Database**
   - Nome: `DeliveryServiceDB`
   - Tier: Serverless (desenvolvimento)

4. **Executar Scripts**
   - Executar `schema-delivery-azure.sql`

---

## 🏃 **Executar Projeto**

### **Desenvolvimento**

```bash
npm run dev
```

### **Produção**

```bash
npm start
```

### **Testar Conexão**

```bash
npm run test:db
```

**Saída esperada:**

```
🔄 Testando conexão com Azure SQL Server...

✅ Conexão bem-sucedida!
📊 Dados do banco: { CurrentTime: ..., DatabaseName: 'DeliveryServiceDB' }

📋 Tabelas criadas:
   ✓ Aluguel
   ✓ Entrega
   ✓ Entregador
   ✓ Locador
   ✓ Veiculo

📊 Registros no banco:
   • Entregadores: 3
   • Veículos: 4
   • Aluguéis: 2
   • Entregas: 3

✅ Teste concluído com sucesso!
```

### **Executar com Serviços Opcionais (NATS, OPA)**

Para desenvolvimento local completo com todos os recursos:

**1. Iniciar serviços via Docker Compose:**

```bash
docker-compose up -d nats opa sqlserver
```

**2. Configurar variáveis de ambiente:**

```env
NATS_URL=nats://localhost:4222
OPA_URL=http://localhost:8181
MAPS_API_KEY=your-google-maps-api-key  # Opcional
```

**3. Iniciar o serviço:**

```bash
npm run dev
```

**Verificar serviços:**
- NATS: http://localhost:8222 (monitoring)
- OPA: http://localhost:8181/health
- API: http://localhost:3001/api/v1/health

**Nota:** O serviço funciona perfeitamente sem NATS e OPA configurados. Eles são recursos opcionais que adicionam Event-Driven Architecture e autorização baseada em políticas.

---

## 📡 **API Endpoints**

### **Health Check**

```http
GET /api/v1/health
```

### **Entregadores**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/entregadores` | Listar todos |
| GET | `/api/v1/entregadores/:id` | Buscar por ID |
| POST | `/api/v1/entregadores` | Criar novo |
| PUT | `/api/v1/entregadores/:id` | Atualizar |
| DELETE | `/api/v1/entregadores/:id` | Deletar |

**Exemplo - Criar Entregador:**

```bash
curl -X POST http://localhost:3001/api/v1/entregadores \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "documento": "12345678901",
    "cnh": "CNH123456",
    "cnhCategoria": "AB",
    "email": "joao@example.com",
    "telefone": "11987654321",
    "dataNascimento": "1990-05-15"
  }'
```

### **Veículos**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/veiculos` | Listar todos |
| GET | `/api/v1/veiculos/:id` | Buscar por ID |
| POST | `/api/v1/veiculos` | Criar novo |
| PUT | `/api/v1/veiculos/:id` | Atualizar |
| DELETE | `/api/v1/veiculos/:id` | Deletar |

### **Aluguéis**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/alugueis` | Listar todos |
| GET | `/api/v1/alugueis/:id` | Buscar por ID |
| POST | `/api/v1/alugueis` | Criar novo |
| PATCH | `/api/v1/alugueis/:id/finalizar` | Finalizar |
| PATCH | `/api/v1/alugueis/:id/cancelar` | Cancelar |

### **Entregas**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/entregas` | Listar todas |
| GET | `/api/v1/entregas/:id` | Buscar por ID |
| GET | `/api/v1/entregas/:id/eta` | Calcular ETA |
| POST | `/api/v1/entregas` | Criar nova |
| PATCH | `/api/v1/entregas/:id/status` | Atualizar status |

### **Rastreamento**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/tracking/:deliveryId` | Obter posição atual |
| POST | `/api/v1/tracking/:deliveryId` | Atualizar posição |

**Exemplo - Atualizar Posição:**

```bash
curl -X POST http://localhost:3001/api/v1/tracking/delivery-123 \
  -H "Content-Type: application/json" \
  -d '{
    "lat": -23.5505,
    "lng": -46.6333
  }'
```

### **Métricas (Prometheus)**

```http
GET /metrics
```

Retorna métricas no formato Prometheus para monitoramento:
- Requisições HTTP (total, duração)
- Eventos NATS (publicados, recebidos)
- Verificações OPA (allow/deny)
- Chamadas API de mapas
- Atualizações de rastreamento

---

## 📚 **Documentação Swagger**

Acesse a documentação interativa em:

```
http://localhost:3001/api-docs
```

![Swagger UI](https://via.placeholder.com/800x400?text=Swagger+UI+Screenshot)

---

## 🧪 **Testes**

### **Executar Todos os Testes**

```bash
npm test
```

### **Executar com Coverage**

```bash
npm run test -- --coverage
```

### **Watch Mode**

```bash
npm run test:watch
```

### **Estrutura de Testes**

```
tests/
├── unit/
│   ├── EntregadorService.test.js
│   ├── VeiculoService.test.js
│   └── AluguelService.test.js
└── integration/
    ├── entregador.test.js
    ├── veiculo.test.js
    └── entrega.test.js
```

---

## 🐳 **Docker**

### **Build da Imagem**

```bash
docker build -t delivery-service:latest .
```

### **Executar Container**

```bash
docker run -d \
  -p 3001:3001 \
  --name delivery-service \
  --env-file .env \
  delivery-service:latest
```

### **Docker Compose**

```bash
docker-compose up -d
```

**Serviços disponíveis:**
- `delivery-service` - API (porta 3001)
- `sqlserver` - SQL Server local (porta 1433) - opcional para desenvolvimento
- `nats` - NATS Server (portas 4222, 8222, 6222) - Event-Driven Architecture
- `opa` - OPA Server (porta 8181) - Policy-based Authorization

**Para iniciar apenas o serviço principal:**

```bash
docker-compose up delivery-service
```

**Para incluir todos os serviços:**

```bash
docker-compose up -d
```

**Monitoramento:**
- NATS Monitoring: http://localhost:8222
- OPA Health: http://localhost:8181/health
- Prometheus Metrics: http://localhost:3001/metrics

---

## ☁️ **Deploy Azure**

### **Azure App Service**

```bash
# Login no Azure
az login

# Criar App Service
az webapp up \
  --name delivery-service-api \
  --resource-group erp-builders-rg \
  --runtime "NODE:18-lts"

# Configurar variáveis de ambiente
az webapp config appsettings set \
  --name delivery-service-api \
  --resource-group erp-builders-rg \
  --settings \
    NODE_ENV="production" \
    DB_SERVER="your-server.database.windows.net" \
    DB_DATABASE="DeliveryServiceDB" \
    DB_USER="your-user" \
    DB_PASSWORD="your-password" \
    LOG_LEVEL="info" \
    NATS_URL="nats://your-nats-server:4222" \
    NATS_CLIENT_ID="delivery-service-prod" \
    OPA_URL="http://your-opa-server:8181" \
    MAPS_API_KEY="your-google-maps-api-key"
```

**Notas sobre Deploy no Azure:**

1. **Azure SQL Server**: Já deve estar configurado e acessível
2. **NATS**: Pode usar Azure Container Instances ou serviço gerenciado
3. **OPA**: Pode rodar como sidecar ou serviço separado no Azure
4. **Métricas**: Configure Azure Monitor para coletar métricas do endpoint `/metrics`
5. **Variáveis Opcionais**: NATS_URL, OPA_URL e MAPS_API_KEY são opcionais

**Monitoramento no Azure:**

```bash
# Habilitar Application Insights
az monitor app-insights component create \
  --app delivery-service-insights \
  --location brazilsouth \
  --resource-group erp-builders-rg

# Configurar no App Service
az webapp config appsettings set \
  --name delivery-service-api \
  --resource-group erp-builders-rg \
  --settings \
    APPLICATIONINSIGHTS_CONNECTION_STRING="your-connection-string"
```

### **Azure Container Instances**

```bash
az container create \
  --resource-group erp-builders-rg \
  --name delivery-service \
  --image delivery-service:latest \
  --dns-name-label delivery-service \
  --ports 3001
```

---

## 📊 **Estrutura do Projeto**

```
delivery-service-microservice/
├── src/
│   ├── config/
│   │   └── database.js              # Configuração Azure SQL
│   ├── controllers/
│   │   ├── EntregadorController.js
│   │   ├── VeiculoController.js
│   │   ├── AluguelController.js
│   │   └── EntregaController.js
│   ├── services/
│   │   ├── EntregadorService.js     # Regras de negócio
│   │   ├── VeiculoService.js
│   │   ├── AluguelService.js
│   │   └── EntregaService.js
│   ├── repositories/
│   │   ├── EntregadorRepository.js  # Acesso a dados
│   │   ├── VeiculoRepository.js
│   │   ├── AluguelRepository.js
│   │   └── EntregaRepository.js
│   ├── routes/
│   │   ├── index.js
│   │   ├── entregadores.routes.js
│   │   ├── veiculos.routes.js
│   │   ├── alugueis.routes.js
│   │   └── entregas.routes.js
│   ├── middlewares/
│   │   ├── errorHandler.js
│   │   └── validator.js
│   ├── utils/
│   │   └── logger.js
│   └── app.js                       # Aplicação principal
├── tests/
│   ├── unit/
│   └── integration/
├── scripts/
│   └── schema-delivery-azure.sql    # Scripts SQL
├── logs/                            # Arquivos de log
├── .env.example
├── .gitignore
├── .dockerignore
├── package.json
├── Dockerfile
├── docker-compose.yml
├── jest.config.js
├── openapi.yaml                     # Documentação API
└── README.md
```

---

## 🤝 **Contribuindo**

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona NovaFeature'`)
4. Push para a branch (`git push origin feature/NovaFeature`)
5. Abra um Pull Request

---

## 📄 **Licença**

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👤 **Autor**

**iYoNuttxD**

- GitHub: [@iYoNuttxD](https://github.com/iYoNuttxD)
- Email: support@deliveryservice.com

---

## 🙏 **Agradecimentos**

- Time de desenvolvimento ERP Builders
- Comunidade Node.js
- Microsoft Azure

---

## 📞 **Suporte**

Se você tiver problemas ou dúvidas:

1. Verifique a [documentação](#)
2. Abra uma [issue](https://github.com/iYoNuttxD/delivery-service-microservice/issues)
3. Entre em contato via email

---

**⭐ Se este projeto foi útil, deixe uma estrela no GitHub!**