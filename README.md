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
- Integração com microservice de pedidos
- **Publicação de eventos via NATS** (delivery.status.changed, delivery.created, delivery.completed)

### ✅ **Rastreamento e Tracking**
- Endpoint de rastreamento de entregas individuais
- Consulta de entregas por status
- Entregas ativas por entregador
- Timeline detalhada de cada entrega
- Cálculo de ETA (tempo estimado de entrega)

### ✅ **Event-Driven Architecture (EDA)**
- Cliente NATS para mensageria pub/sub
- EventPublisher para eventos de entrega
- EventSubscriber para eventos de pedidos
- Configuração totalmente via variáveis de ambiente
- Graceful degradation quando NATS não está disponível

### ✅ **Integração com Mapas**
- MapIntegrationAdapter para cálculo de rotas
- Geocodificação de endereços
- Geocodificação reversa
- Suporte para múltiplos provedores (Google Maps, Azure Maps, etc.)
- Fallback para dados mock quando serviço não está disponível

### ✅ **Autorização com OPA**
- AuthPolicyClient para Open Policy Agent
- Autorização baseada em políticas
- Configuração fail-open ou fail-closed
- Suporte para autenticação de drivers e admins

### ✅ **Observabilidade**
- Métricas Prometheus (requisições HTTP, eventos NATS, status de entregas)
- Endpoint /metrics para coleta de métricas
- Health check com status de integrações
- Logging estruturado com Winston

### ✅ **Recursos Técnicos**
- Arquitetura em camadas (Repository → Service → Controller)
- Validação de dados (express-validator)
- Logging estruturado (Winston)
- Tratamento centralizado de erros
- Documentação OpenAPI/Swagger
- Testes automatizados (Jest)
- Containerização (Docker)
- Health check endpoint

---

## 🛠️ **Tecnologias**

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| **Node.js** | 18+ | Runtime JavaScript |
| **Express.js** | 4.18 | Framework web |
| **mssql** | 10.0 | Driver Azure SQL Server |
| **Azure SQL Server** | 2022 | Banco de dados |
| **NATS** | Latest | Sistema de mensageria pub/sub |
| **Prometheus** | - | Métricas e monitoramento |
| **OPA** | - | Open Policy Agent (autorização) |
| **Winston** | 3.11 | Sistema de logs |
| **Swagger UI** | 5.0 | Documentação API |
| **Jest** | 29.7 | Framework de testes |
| **Docker** | Latest | Containerização |

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
NODE_ENV=production
PORT=3001

# Azure SQL Server (OBRIGATÓRIO)
DB_SERVER=your-server.database.windows.net
DB_NAME=DeliveryServiceDB
DB_USER=your-username
DB_PASSWORD=your-password
DB_ENCRYPT=true

# NATS Messaging (OPCIONAL - deixe vazio para desabilitar)
NATS_URL=nats://your-nats-server.com:4222
NATS_USER=your-nats-user
NATS_PASSWORD=your-nats-password

# OPA Authorization (OPCIONAL - deixe vazio para desabilitar)
OPA_URL=http://your-opa-server.com:8181
OPA_FAIL_OPEN=false

# Map Integration (OPCIONAL - deixe vazio para desabilitar)
MAP_SERVICE_URL=https://your-map-service.com
MAP_API_KEY=your-api-key

# Logging & Metrics
LOG_LEVEL=info
METRICS_ENABLED=true
```

**⚠️ IMPORTANTE - Cloud-First Configuration:**
- **Nenhuma variável tem default para localhost**
- Todos os serviços opcionais (NATS, OPA, Map) podem ser desabilitados deixando as variáveis vazias
- O serviço continua funcionando normalmente mesmo sem as integrações opcionais
- Apenas Azure SQL Server é obrigatório

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

---

## 📡 **API Endpoints**

### **Health Check**

```http
GET /api/v1/health
```

Retorna o status do serviço e suas integrações:

```json
{
  "status": "UP",
  "timestamp": "2023-11-06T16:00:00.000Z",
  "service": "Delivery Service",
  "version": "1.0.0",
  "integrations": {
    "nats": {
      "connected": true,
      "server": "nats://nats.example.com:4222",
      "subscriptions": 2
    },
    "opa": {
      "enabled": true,
      "url": "http://opa.example.com:8181"
    },
    "map": {
      "enabled": true,
      "provider": "google"
    }
  }
}
```

### **Metrics (Prometheus)**

```http
GET /api/v1/metrics
```

Retorna métricas no formato Prometheus para monitoramento.

### **Rastreamento de Entregas**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/tracking/deliveries/:id` | Rastrear entrega específica |
| GET | `/api/v1/tracking/deliveries?status=PENDENTE` | Listar entregas por status |
| GET | `/api/v1/tracking/drivers/:driverId/deliveries` | Entregas ativas de um entregador |

**Exemplo - Rastrear Entrega:**

```bash
curl http://localhost:3001/api/v1/tracking/deliveries/1
```

**Resposta:**

```json
{
  "success": true,
  "data": {
    "deliveryId": 1,
    "pedidoId": "ORDER-123",
    "status": "EM_TRANSITO",
    "currentLocation": null,
    "timeline": [
      {
        "status": "PENDENTE",
        "timestamp": "2023-11-06T10:00:00.000Z",
        "description": "Entrega criada"
      },
      {
        "status": "COLETADA",
        "timestamp": "2023-11-06T11:00:00.000Z",
        "description": "Pedido coletado"
      }
    ],
    "estimatedDeliveryTime": "2023-11-06T12:00:00.000Z",
    "driver": {
      "id": 10,
      "name": "João Silva"
    }
  }
}
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
| POST | `/api/v1/entregas` | Criar nova |
| PATCH | `/api/v1/entregas/:id/status` | Atualizar status |

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
- `sqlserver` - SQL Server local (porta 1433) - opcional

---

## 🔄 **Event-Driven Architecture**

O microservice suporta arquitetura orientada a eventos via NATS.

### **Eventos Publicados**

#### `delivery.status.changed`
Publicado quando o status de uma entrega muda.

```json
{
  "deliveryId": 1,
  "status": "ENTREGUE",
  "timestamp": "2023-11-06T12:00:00.000Z",
  "horaEntrega": "2023-11-06T12:00:00.000Z"
}
```

#### `delivery.created`
Publicado quando uma nova entrega é criada.

```json
{
  "deliveryId": 1,
  "pedidoId": "ORDER-123",
  "entregadorId": 10,
  "status": "PENDENTE",
  "timestamp": "2023-11-06T10:00:00.000Z"
}
```

#### `delivery.completed`
Publicado quando uma entrega é concluída.

```json
{
  "deliveryId": 1,
  "pedidoId": "ORDER-123",
  "entregadorId": 10,
  "horaEntrega": "2023-11-06T12:00:00.000Z",
  "timestamp": "2023-11-06T12:00:00.000Z"
}
```

### **Eventos Recebidos**

O EventSubscriber pode ser configurado para escutar eventos de outros serviços:

- Configure `ORDER_CREATED_SUBJECT` para receber eventos de pedidos criados
- Configure `ADDITIONAL_SUBJECTS` (separados por vírgula) para outros eventos

**Exemplo:**

```env
ORDER_CREATED_SUBJECT=order.created
ADDITIONAL_SUBJECTS=payment.confirmed,inventory.updated
```

### **Graceful Degradation**

Se o NATS não estiver configurado (`NATS_URL` vazio), o serviço continua funcionando normalmente sem mensageria. Eventos não são publicados nem recebidos, mas todas as outras funcionalidades permanecem operacionais.

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

# Configurar variáveis de ambiente - Database (OBRIGATÓRIO)
az webapp config appsettings set \
  --name delivery-service-api \
  --resource-group erp-builders-rg \
  --settings \
    NODE_ENV="production" \
    DB_SERVER="your-server.database.windows.net" \
    DB_NAME="DeliveryServiceDB" \
    DB_USER="your-user" \
    DB_PASSWORD="your-password" \
    DB_ENCRYPT="true"

# Configurar NATS (OPCIONAL)
az webapp config appsettings set \
  --name delivery-service-api \
  --resource-group erp-builders-rg \
  --settings \
    NATS_URL="nats://your-nats.example.com:4222" \
    NATS_USER="delivery-service" \
    NATS_PASSWORD="your-nats-password" \
    ORDER_CREATED_SUBJECT="order.created"

# Configurar OPA (OPCIONAL)
az webapp config appsettings set \
  --name delivery-service-api \
  --resource-group erp-builders-rg \
  --settings \
    OPA_URL="http://your-opa.example.com:8181" \
    OPA_FAIL_OPEN="false"

# Configurar Map Service (OPCIONAL)
az webapp config appsettings set \
  --name delivery-service-api \
  --resource-group erp-builders-rg \
  --settings \
    MAP_SERVICE_URL="https://your-map-service.com" \
    MAP_API_KEY="your-api-key" \
    MAP_PROVIDER="google"

# Configurar Logging e Metrics
az webapp config appsettings set \
  --name delivery-service-api \
  --resource-group erp-builders-rg \
  --settings \
    LOG_LEVEL="info" \
    METRICS_ENABLED="true"
```

**✅ Cloud-Ready Checklist:**
- ✅ Nenhuma configuração aponta para localhost
- ✅ Todas as integrações são opcionais (exceto Azure SQL)
- ✅ Graceful degradation quando serviços não estão disponíveis
- ✅ Métricas Prometheus para monitoramento
- ✅ Health check com status de todas integrações
- ✅ Event-driven architecture com NATS
- ✅ Autorização com OPA
- ✅ Integração com serviços de mapa

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
│   │   ├── EntregaController.js
│   │   └── TrackingController.js    # Rastreamento de entregas
│   ├── services/
│   │   ├── EntregadorService.js     # Regras de negócio
│   │   ├── VeiculoService.js
│   │   ├── AluguelService.js
│   │   ├── EntregaService.js
│   │   └── TrackingService.js       # Serviço de rastreamento
│   ├── repositories/
│   │   ├── EntregadorRepository.js  # Acesso a dados
│   │   ├── VeiculoRepository.js
│   │   ├── AluguelRepository.js
│   │   └── EntregaRepository.js
│   ├── messaging/                   # Event-Driven Architecture
│   │   ├── natsClient.js            # Cliente NATS
│   │   ├── EventPublisher.js        # Publicador de eventos
│   │   └── EventSubscriber.js       # Assinante de eventos
│   ├── auth/                        # Autorização
│   │   └── AuthPolicyClient.js      # Cliente OPA
│   ├── adapters/                    # Integrações externas
│   │   └── MapIntegrationAdapter.js # Integração de mapas
│   ├── routes/
│   │   ├── index.js
│   │   ├── entregadores.routes.js
│   │   ├── veiculos.routes.js
│   │   ├── alugueis.routes.js
│   │   ├── entregas.routes.js
│   │   └── tracking.routes.js       # Rotas de rastreamento
│   ├── middlewares/
│   │   ├── errorHandler.js
│   │   ├── validator.js
│   │   └── metricsMiddleware.js     # Middleware de métricas
│   ├── utils/
│   │   ├── logger.js
│   │   └── metrics.js               # Coletor de métricas Prometheus
│   └── app.js                       # Aplicação principal
├── tests/
│   ├── unit/
│   │   ├── EntregadorService.test.js
│   │   ├── EventPublisher.test.js
│   │   ├── TrackingService.test.js
│   │   └── MapIntegrationAdapter.test.js
│   └── integration/
│       └── entregador.test.js
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