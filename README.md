# 🚚 Delivery Service Microservice

![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![Express](https://img.shields.io/badge/Express-4.18-blue.svg)
![Azure SQL](https://img.shields.io/badge/Azure_SQL-Server-red.svg)
![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

**Microservice profissional para gerenciamento de entregas, entregadores, veículos e aluguéis integrado com Azure SQL Server.**

Desenvolvido por: **[@iYoNuttxD](https://github.com/iYoNuttxD)**

---

## ✨ Atualizações Recentes

- NATS operacional (com suporte a subjects com prefixo, ex.: `delivery.iYoNuttxD.7f2a.*`).
- OPA via Cloudflare Worker, compatível com `POST /v1/data/delivery/authz/allow`.
- Mapas via Cloudflare Worker + OpenRouteService (ORS): `POST /route`, `GET /geocode`, `GET /reverse-geocode`.
- Swagger configurado com servidor relativo (`/api/v1`) para evitar CORS/mixed content.
- Health e Métricas documentados e com exemplos de teste via curl.

---

## 📋 Índice

- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Configuração](#-configuração-cloud-first)
- [Executar Projeto](#-executar-projeto)
- [Testes Rápidos (curl)](#-testes-rápidos-curl)
- [API Endpoints](#-api-endpoints)
- [Documentação Swagger](#-documentação-swagger)
- [Observabilidade](#-observabilidade)
- [Docker](#-docker)
- [Deploy Azure](#-deploy-azure)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Contribuindo](#-contribuindo)
- [Licença](#-licença)

---

## 🎯 Funcionalidades

### ✅ Gestão de Entregadores
- CRUD completo de entregadores
- Validação de CPF e CNH únicos
- Validação de idade mínima (18 anos)
- Controle de status (ATIVO, INATIVO, BLOQUEADO)

### ✅ Gestão de Veículos
- CRUD completo de veículos
- Tipos: MOTOCICLETA, CARRO, BICICLETA
- Status: DISPONÍVEL, ALUGADO, MANUTENÇÃO
- Validação de placa única

### ✅ Gestão de Aluguéis
- Criar aluguel vinculando entregador e veículo
- Verificação automática de disponibilidade
- Cálculo automático de valor (diárias)
- Finalizar ou cancelar aluguel
- Atualização automática de status do veículo

### ✅ Gestão de Entregas
- Criar entregas vinculadas a pedidos
- Rastreamento de status com máquina de estados
- Timestamps automáticos (coleta/entrega)
- Integração com microservice de pedidos
- Publicação de eventos via NATS (`delivery.status.changed`, `delivery.created`, `delivery.completed`)

### ✅ Rastreamento e Tracking
- Endpoint de rastreamento de entregas individuais
- Consulta de entregas por status
- Entregas ativas por entregador
- Timeline detalhada de cada entrega
- Cálculo de ETA (tempo estimado de entrega)

### ✅ Event-Driven Architecture (EDA)
- Cliente NATS para mensageria pub/sub
- EventPublisher para eventos de entrega
- EventSubscriber para eventos de pedidos
- Configuração totalmente via variáveis de ambiente
- Graceful degradation quando NATS não está disponível

### ✅ Integração com Mapas
- MapIntegrationAdapter para cálculo de rotas
- Geocodificação de endereços
- Geocodificação reversa
- Suporte a provedores (Google, Azure, ORS via Worker)
- Fallback para dados mock quando serviço não está disponível

### ✅ Autorização com OPA
- AuthPolicyClient para Open Policy Agent
- Autorização baseada em políticas
- Configuração fail-open ou fail-closed
- Regras por papel (admin, cliente, restaurante, entregador, locador) via Worker

### ✅ Observabilidade
- Métricas Prometheus (requisições HTTP, eventos NATS, status de entregas)
- Endpoint `/metrics`
- Health check com status de integrações
- Logging estruturado com Winston

---

## 🛠️ Tecnologias

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| **Node.js** | 18+ | Runtime JavaScript |
| **Express.js** | 4.18 | Framework web |
| **mssql** | 12.1 | Driver Azure SQL Server |
| **Azure SQL Server** | 2022 | Banco de dados |
| **NATS** | 2.29 | Sistema de mensageria pub/sub |
| **Prometheus** | - | Métricas e monitoramento |
| **OPA** | - | Open Policy Agent (autorização) |
| **Winston** | 3.11 | Sistema de logs |
| **Swagger UI** | 5.0 | Documentação API |
| **Jest** | 29.7 | Framework de testes |
| **Docker** | Latest | Containerização |

---

## 🏗️ Arquitetura

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

## 📦 Pré-requisitos

- Node.js 18+
- Azure SQL Server
- Docker (opcional)
- Git

---

## 🚀 Instalação

```bash
git clone https://github.com/iYoNuttxD/delivery-service-microservice.git
cd delivery-service-microservice
npm install
cp .env.example .env
```

---

## 🧩 Configuração (Cloud-first)

```env
# NATS (exemplo com demo)
NATS_URL=nats://demo.nats.io:4222
DELIVERY_STATUS_SUBJECT=delivery.iYoNuttxD.7f2a.delivery.status.changed
DELIVERY_CREATED_SUBJECT=delivery.iYoNuttxD.7f2a.delivery.created
DELIVERY_COMPLETED_SUBJECT=delivery.iYoNuttxD.7f2a.delivery.completed
ORDER_CREATED_SUBJECT=delivery.iYoNuttxD.7f2a.order.created

# OPA (Cloudflare Worker compatível com OPA)
OPA_URL=https://SEU-OPA-WORKER.workers.dev
OPA_POLICY_PATH=v1/data/delivery/authz/allow
OPA_FAIL_OPEN=true

# Mapas (Cloudflare Worker + ORS)
MAP_SERVICE_URL=https://SEU-MAP-WORKER.workers.dev
MAP_PROVIDER=ors
# (Opcional) enviar key do ORS do app:
# MAP_API_KEY=YOUR_ORS_KEY

# Logging & Metrics
LOG_LEVEL=info
METRICS_ENABLED=true
```

**Dicas de teste (Windows CMD):** escape `"` no JSON ou use arquivo `body.json` + `--data "@body.json"`.

**Troubleshooting:**
- **CORS no Swagger**: Use servidor `/api/v1` (relativo) no dropdown de Servers.
- **JSON escaping no Windows CMD**: Substitua `"` por `\"` ou use PowerShell/arquivo JSON.
- **Mixed content**: Acesse Swagger via HTTPS se a API estiver em HTTPS.

---

## 🏃 Executar Projeto

```bash
npm run dev   # desenvolvimento
npm start     # produção
```

---

## 🧪 Testes Rápidos (curl)

### Health Check
```bash
curl -fsSL "https://SEU_HOST/api/v1/health" | jq .
```

### Métricas Prometheus
```bash
curl -fsSL "https://SEU_HOST/api/v1/metrics" | head -n 25
```

### Tracking - Listar entregas por status
```bash
curl -fsSL "https://SEU_HOST/api/v1/tracking/deliveries?status=PENDENTE"
```

### Tracking - Atualizar posição
```bash
curl -fsSL -X POST "https://SEU_HOST/api/v1/tracking/deliveries/123" \
  -H "Content-Type: application/json" \
  -d '{ "lat": -23.55, "lng": -46.63 }'
```

### Windows CMD (escape JSON)
```cmd
curl -fsSL -X POST "https://SEU_HOST/api/v1/tracking/deliveries/123" -H "Content-Type: application/json" -d "{ \"lat\": -23.55, \"lng\": -46.63 }"
```

### Windows PowerShell
```powershell
$body = @{ lat = -23.55; lng = -46.63 } | ConvertTo-Json
Invoke-WebRequest -Uri "https://SEU_HOST/api/v1/tracking/deliveries/123" -Method POST -ContentType "application/json" -Body $body
```

---

## 📡 API Endpoints

### Health & Metrics
- `GET /api/v1/health` - Status do serviço e integrações
- `GET /api/v1/metrics` - Métricas Prometheus

### Tracking
- `GET /api/v1/tracking/deliveries/:id` - Rastreamento de entrega individual
- `GET /api/v1/tracking/deliveries?status=STATUS` - Listar entregas por status
- `POST /api/v1/tracking/deliveries/:id` - Atualizar posição da entrega
- `GET /api/v1/tracking/drivers/:driverId/deliveries` - Entregas ativas do entregador

### Entregadores
- `GET /api/v1/entregadores` - Listar entregadores
- `GET /api/v1/entregadores/:id` - Buscar entregador
- `POST /api/v1/entregadores` - Criar entregador
- `PUT /api/v1/entregadores/:id` - Atualizar entregador
- `DELETE /api/v1/entregadores/:id` - Remover entregador

### Veículos
- `GET /api/v1/veiculos` - Listar veículos
- `GET /api/v1/veiculos/:id` - Buscar veículo
- `POST /api/v1/veiculos` - Criar veículo
- `PUT /api/v1/veiculos/:id` - Atualizar veículo
- `DELETE /api/v1/veiculos/:id` - Remover veículo

### Aluguéis
- `GET /api/v1/alugueis` - Listar aluguéis
- `GET /api/v1/alugueis/:id` - Buscar aluguel
- `POST /api/v1/alugueis` - Criar aluguel
- `POST /api/v1/alugueis/:id/finalizar` - Finalizar aluguel
- `POST /api/v1/alugueis/:id/cancelar` - Cancelar aluguel

### Entregas
- `GET /api/v1/entregas` - Listar entregas
- `GET /api/v1/entregas/:id` - Buscar entrega
- `POST /api/v1/entregas` - Criar entrega
- `PATCH /api/v1/entregas/:id/status` - Atualizar status

---

## 📚 Documentação Swagger

- Local: `http://localhost:3001/api-docs`
- Prod: `https://SEU_HOST/api-docs`

**Importante**: Selecione `/api/v1` no dropdown "Servers" para evitar erros CORS/mixed-content.

---

## 🔭 Observabilidade

### Logs
```bash
# Azure App Service → Monitoring → Log stream
# Ou via Azure CLI
az webapp log tail --name delivery-service --resource-group delivery-rg
```

### Métricas
- Endpoint `/metrics` expõe métricas no formato Prometheus
- Configure scraping no Prometheus ou Azure Monitor

### Health Check
- Endpoint `/health` mostra status de:
  - Banco de dados (implícito se o app está rodando)
  - NATS (conectado/desconectado)
  - OPA (habilitado/desabilitado)
  - Maps (habilitado/desabilitado)

---

## 🐳 Docker

### Build da Imagem
```bash
docker build -t delivery-service .
```

### Executar Container
```bash
docker run -p 3001:3001 \
  -e DB_SERVER="your-server.database.windows.net" \
  -e DB_NAME="DeliveryServiceDB" \
  -e DB_USER="your-user" \
  -e DB_PASSWORD="your-password" \
  -e NATS_URL="nats://demo.nats.io:4222" \
  delivery-service
```

### Docker Compose
```bash
docker-compose up -d
```

---

## ☁️ Deploy Azure

### Via Azure App Service

1. **Criar App Service**
```bash
az webapp create \
  --resource-group delivery-rg \
  --plan delivery-plan \
  --name delivery-service \
  --runtime "NODE:18-lts"
```

2. **Configurar Variáveis de Ambiente**
```bash
az webapp config appsettings set \
  --resource-group delivery-rg \
  --name delivery-service \
  --settings \
    NODE_ENV=production \
    DB_SERVER="your-server.database.windows.net" \
    DB_NAME="DeliveryServiceDB" \
    DB_USER="your-user" \
    DB_PASSWORD="your-password" \
    NATS_URL="nats://demo.nats.io:4222" \
    DELIVERY_STATUS_SUBJECT="delivery.iYoNuttxD.7f2a.delivery.status.changed" \
    OPA_URL="https://your-opa-worker.workers.dev" \
    OPA_POLICY_PATH="v1/data/delivery/authz/allow" \
    MAP_SERVICE_URL="https://your-map-worker.workers.dev" \
    MAP_PROVIDER="ors"
```

3. **Deploy via GitHub Actions ou Azure CLI**
```bash
az webapp up --name delivery-service --resource-group delivery-rg
```

### Via Container Registry
```bash
# Tag e push da imagem
docker tag delivery-service:latest your-acr.azurecr.io/delivery-service:latest
docker push your-acr.azurecr.io/delivery-service:latest

# Deploy no App Service
az webapp create \
  --resource-group delivery-rg \
  --plan delivery-plan \
  --name delivery-service \
  --deployment-container-image-name your-acr.azurecr.io/delivery-service:latest
```

---

## 📂 Estrutura do Projeto

```
delivery-service-microservice/
├── src/
│   ├── adapters/              # Adaptadores de integração
│   │   └── MapIntegrationAdapter.js
│   ├── auth/                  # Autenticação e autorização
│   │   └── AuthPolicyClient.js
│   ├── config/                # Configurações
│   │   └── database.js
│   ├── controllers/           # Controladores HTTP
│   │   ├── EntregadorController.js
│   │   ├── VeiculoController.js
│   │   ├── AluguelController.js
│   │   ├── EntregaController.js
│   │   └── TrackingController.js
│   ├── messaging/             # NATS messaging
│   │   ├── natsClient.js
│   │   ├── EventPublisher.js
│   │   └── EventSubscriber.js
│   ├── middlewares/           # Middlewares Express
│   │   ├── errorHandler.js
│   │   ├── validator.js
│   │   └── metricsMiddleware.js
│   ├── repositories/          # Repositórios de dados
│   │   ├── EntregadorRepository.js
│   │   ├── VeiculoRepository.js
│   │   ├── AluguelRepository.js
│   │   └── EntregaRepository.js
│   ├── routes/                # Rotas da API
│   │   ├── index.js
│   │   ├── entregadores.routes.js
│   │   ├── veiculos.routes.js
│   │   ├── alugueis.routes.js
│   │   ├── entregas.routes.js
│   │   └── tracking.routes.js
│   ├── services/              # Lógica de negócio
│   │   ├── EntregadorService.js
│   │   ├── VeiculoService.js
│   │   ├── AluguelService.js
│   │   ├── EntregaService.js
│   │   └── TrackingService.js
│   ├── utils/                 # Utilitários
│   │   ├── logger.js
│   │   └── metrics.js
│   └── app.js                 # Aplicação Express
├── tests/                     # Testes
│   ├── unit/
│   └── integration/
├── scripts/                   # Scripts SQL
│   └── schema-delivery-azure.sql
├── .env.example               # Exemplo de variáveis de ambiente
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── jest.config.js
├── openapi.yaml               # Especificação OpenAPI
├── package.json
└── README.md
```

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

**Desenvolvido com ❤️ por [@iYoNuttxD](https://github.com/iYoNuttxD)**
