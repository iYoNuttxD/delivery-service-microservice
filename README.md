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
- [Configuração](#-configuração)
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

- **Node.js** 18 ou superior
- **Azure SQL Server** (ou SQL Server local)
- **Docker** (opcional)
- **Git**

---

## 🚀 Instalação

### 1) Clonar Repositório

```bash
git clone https://github.com/iYoNuttxD/delivery-service-microservice.git
cd delivery-service-microservice
```

### 2) Instalar Dependências

```bash
npm install
```

### 3) Configurar Variáveis de Ambiente

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

# NATS (OPCIONAL - deixe vazio para desabilitar)
NATS_URL=nats://demo.nats.io:4222
DELIVERY_STATUS_SUBJECT=delivery.iYoNuttxD.7f2a.delivery.status.changed
DELIVERY_CREATED_SUBJECT=delivery.iYoNuttxD.7f2a.delivery.created
DELIVERY_COMPLETED_SUBJECT=delivery.iYoNuttxD.7f2a.delivery.completed
ORDER_CREATED_SUBJECT=delivery.iYoNuttxD.7f2a.order.created

# OPA (OPCIONAL - via Cloudflare Worker compatível)
OPA_URL=https://SEU-OPA-WORKER.workers.dev
OPA_POLICY_PATH=v1/data/delivery/authz/allow
OPA_FAIL_OPEN=true

# Mapas (OPCIONAL - via Cloudflare Worker + ORS)
MAP_SERVICE_URL=https://SEU-MAP-WORKER.workers.dev
MAP_PROVIDER=ors
# Se preferir enviar a key do ORS do app (opcional):
# MAP_API_KEY=YOUR_ORS_KEY

# Logging & Metrics
LOG_LEVEL=info
METRICS_ENABLED=true
```

**⚠️ Cloud-First:**
- Serviços opcionais (NATS, OPA, Mapas) podem ficar vazios; o app mantém funcionamento básico.
- Evite apontar para `localhost` em produção; use Workers/domínios públicos.

### 4) Criar Banco de Dados

Execute o script SQL no Azure SQL Server:

```bash
# O arquivo está em: scripts/schema-delivery-azure.sql
```

Ou use Azure Data Studio / SSMS para executar o script.

---

## 🏃 Executar Projeto

### Desenvolvimento

```bash
npm run dev
```

### Produção

```bash
npm start
```

### Testar Conexão

```bash
npm run test:db
```

Saída esperada (resumo):

```
✅ Conexão bem-sucedida!
📋 Tabelas criadas: Aluguel, Entrega, Entregador, Locador, Veiculo
```

---

## 🧪 Testes Rápidos (curl)

Substitua `SEU_HOST` pelo domínio do App Service (ex.: `delivery-service-microservice.azurewebsites.net`).

- Health
```bash
curl -fsSL "https://SEU_HOST/api/v1/health" | jq .
```

- Métricas (Prometheus)
```bash
curl -fsSL "https://SEU_HOST/api/v1/metrics" | head -n 25
```

- Tracking
```bash
curl -fsSL "https://SEU_HOST/api/v1/tracking/deliveries?status=PENDENTE"
curl -fsSL "https://SEU_HOST/api/v1/tracking/deliveries/123"
curl -fsSL -X POST "https://SEU_HOST/api/v1/tracking/deliveries/123" \
  -H "Content-Type: application/json" \
  -d '{ "lat": -23.55, "lng": -46.63 }'
```

- Publicar evento de status (API → NATS)
```bash
curl -fsSL -X PATCH "https://SEU_HOST/api/v1/entregas/1/status" \
  -H "Content-Type: application/json" \
  -d '{ "status": "ENTREGUE" }'
```

- OPA (Worker)
```bash
curl -fsSL -X POST "https://SEU-OPA-WORKER.workers.dev/v1/data/delivery/authz/allow" \
  -H "Content-Type: application/json" \
  -d '{ "input": { "user": {"id":1,"role":"admin"}, "resource": {"type":"order","id":101}, "action":"update" } }'
```

- Mapas (Worker)
```bash
curl -fsSL "https://SEU-MAP-WORKER.workers.dev/geocode?address=Avenida%20Paulista%201000"
curl -fsSL -X POST "https://SEU-MAP-WORKER.workers.dev/route" \
  -H "Content-Type: application/json" \
  -d '{ "origin": { "latitude": -23.55, "longitude": -46.63 }, "destination": { "latitude": -23.56, "longitude": -46.64 } }'
```

Windows CMD: escape o JSON com `\"` ou use um arquivo `body.json` e `--data "@body.json"`.

---

## 📡 API Endpoints

### Health Check

```http
GET /api/v1/health
```

Retorna status do serviço e integrações (NATS/OPA/Map).

### Metrics (Prometheus)

```http
GET /api/v1/metrics
```

Texto Prometheus para coleta.

### Rastreamento de Entregas

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/tracking/deliveries/:id` | Rastrear entrega |
| GET | `/api/v1/tracking/deliveries?status=PENDENTE` | Listar por status |
| POST | `/api/v1/tracking/deliveries/:deliveryId` | Atualizar posição |

Demais domínios (Entregadores, Veículos, Aluguéis, Entregas) mantêm os endpoints do OpenAPI.

---

## 📚 Documentação Swagger

- Local: `http://localhost:3001/api-docs`
- Produção: `https://delivery-service-microservice.azurewebsites.net/api-docs`

Dica: no dropdown “Servers”, selecione `/api/v1` (servidor relativo) para evitar CORS/mixed content.

---

## 🔭 Observabilidade

- Log stream (Portal Azure → App Service → Monitoring → Log stream)
- Você verá:
  - “Conectado ao NATS …” quando `NATS_URL` configurado
  - “OPA configurado …” quando `OPA_URL` configurado
  - “Integração de mapa configurada …” quando `MAP_SERVICE_URL` configurado

---

## 🐳 Docker

### Build

```bash
docker build -t delivery-service:latest .
```

### Run

```bash
docker run -d \
  -p 3001:3001 \
  --name delivery-service \
  --env-file .env \
  delivery-service:latest
```

### Compose

```bash
docker-compose up -d
```

---

## ☁️ Deploy Azure

Exemplo (CLI):

```bash
az login

# App Service
az webapp up \
  --name delivery-service-api \
  --resource-group erp-builders-rg \
  --runtime "NODE:18-lts"

# Database (OBRIGATÓRIO)
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

# NATS (OPCIONAL)
az webapp config appsettings set \
  --name delivery-service-api \
  --resource-group erp-builders-rg \
  --settings \
    NATS_URL="nats://demo.nats.io:4222" \
    DELIVERY_STATUS_SUBJECT="delivery.iYoNuttxD.7f2a.delivery.status.changed" \
    DELIVERY_CREATED_SUBJECT="delivery.iYoNuttxD.7f2a.delivery.created" \
    DELIVERY_COMPLETED_SUBJECT="delivery.iYoNuttxD.7f2a.delivery.completed" \
    ORDER_CREATED_SUBJECT="delivery.iYoNuttxD.7f2a.order.created"

# OPA (OPCIONAL - Worker)
az webapp config appsettings set \
  --name delivery-service-api \
  --resource-group erp-builders-rg \
  --settings \
    OPA_URL="https://SEU-OPA-WORKER.workers.dev" \
    OPA_POLICY_PATH="v1/data/delivery/authz/allow" \
    OPA_FAIL_OPEN="true"

# Mapas (OPCIONAL - Worker + ORS)
az webapp config appsettings set \
  --name delivery-service-api \
  --resource-group erp-builders-rg \
  --settings \
    MAP_SERVICE_URL="https://SEU-MAP-WORKER.workers.dev" \
    MAP_PROVIDER="ors" \
    MAP_SERVICE_TIMEOUT="10000"
```

---

## 📊 Estrutura do Projeto

```
delivery-service-microservice/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── messaging/
│   ├── auth/
│   ├── adapters/
│   ├── routes/
│   ├── middlewares/
│   ├── utils/
│   └── app.js
├── tests/
├── scripts/
├── openapi.yaml
├── .env.example
└── README.md
```

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/NovaFeature`)
3. Commit (`git commit -m 'feat: NovaFeature'`)
4. Push (`git push origin feature/NovaFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Projeto sob licença MIT. Veja [LICENSE](LICENSE).

---

## 👤 Autor

**iYoNuttxD**

- GitHub: [@iYoNuttxD](https://github.com/iYoNuttxD)
- Email: support@deliveryservice.com

---

## 📞 Suporte

1. Verifique a documentação
2. Abra uma [issue](https://github.com/iYoNuttxD/delivery-service-microservice/issues)
3. Entre em contato por email

---

**⭐ Se este projeto foi útil, deixe uma estrela no GitHub!**
