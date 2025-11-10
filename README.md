# 🚚 Delivery Service Microservice

![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![Express](https://img.shields.io/badge/Express-4.18-blue.svg)
![Azure SQL](https://img.shields.io/badge/Azure_SQL-Server-red.svg)
![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

Microservice profissional para gerenciamento de entregas, entregadores, veículos e aluguéis integrado com Azure SQL Server.

Desenvolvido por: [@iYoNuttxD](https://github.com/iYoNuttxD)

---

# Feito Por

Daniel Ganz Musse, João Vitor de Souza Hernandes, Flavio Augusto da Cruz Melo, Matheus 
Lowen, Enrico Malho Bozza 

## ✨ Atualizações Recentes

- Arquitetura 100% Vertical Slice com princípios de Clean Architecture.
- Routers e handlers por feature em `src/features/<feature>/http/`.
- Casos de uso co-localizados por feature em `src/features/<feature>/use-cases/`.
- Adapters (NATS/OPA/Maps) na infraestrutura implementando ports do domínio.
- Swagger com servidor relativo (`/api/v1`) para evitar CORS/mixed content.
- Health e Métricas com status de NATS, OPA e Map.
- Publicação de imagem Docker via GitHub Actions (multi-arch).
- Imagem oficial no Docker Hub: https://hub.docker.com/r/iyonuttxd/delivery-service

---

## 📋 Índice

- Funcionalidades
- Tecnologias
- Arquitetura
- Pré-requisitos
- Instalação
- Configuração (Cloud-first)
- Executar Projeto
- Testes Rápidos (curl)
- API Endpoints
- Documentação Swagger
- Observabilidade
- Docker
- Deploy Azure
- Estrutura do Projeto
- Contribuindo
- Licença

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
- NATS para mensageria pub/sub (fail-safe: app roda sem NATS se não configurado)
- EventPublisher e EventSubscriber

### ✅ Integração com Mapas
- MapServiceAdapter (Cloudflare Worker + ORS)
- Geocodificação e geocodificação reversa
- Cálculo de rotas e ETA
- Fallback mock quando desabilitado

### ✅ Autorização com OPA
- OPAPolicyClient (Worker compatível com OPA)
- Fail-open configurável

### ✅ Observabilidade
- Métricas Prometheus (`/metrics`)
- Health check (`/health`) com status de integrações
- Logging estruturado (Winston)

---

## 🛠️ Tecnologias

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| Node.js | 18+ | Runtime JavaScript |
| Express.js | 4.18 | Framework web |
| mssql | 12.1 | Driver Azure SQL Server |
| Azure SQL Server | 2022 | Banco de dados |
| NATS | 2.x | Mensageria pub/sub |
| Prometheus | - | Métricas e monitoramento |
| OPA | - | Open Policy Agent (autorização) |
| Winston | 3.x | Logs |
| Swagger UI | 5.x | Documentação API |
| Jest | 29.x | Testes |
| Docker | latest | Container |

---

## 🏗️ Arquitetura

Clean Architecture + Vertical Slice:

- Domain (núcleo): entidades, value-objects, eventos e ports (interfaces).
- Use cases (por feature): regras de aplicação co-localizadas com cada fatia.
- Infra (detalhes): repositórios SQL Server, adapters NATS/OPA/Maps.
- HTTP por feature: routers/handlers finos que chamam use-cases via container.
- Composition root: container (DI) e bootstrap (app).

Dependências: handlers → use-cases → domain (ports) → infra (adapters/repos implementam ports).

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

Dicas (Windows CMD): escape `"` no JSON ou use `body.json` + `--data "@body.json"`.

Troubleshooting:
- CORS no Swagger: selecione servidor `/api/v1` (relativo).
- Mixed content: acesse Swagger via HTTPS quando a API estiver em HTTPS.

---

## 🏃 Executar Projeto

```bash
npm run dev   # desenvolvimento
npm start     # produção
```

---

## 🧪 Testes Rápidos (curl)

- Health:
```bash
curl -fsSL "https://SEU_HOST/api/v1/health" | jq .
```

- Métricas:
```bash
curl -fsSL "https://SEU_HOST/api/v1/metrics" | head -n 25
```

- Tracking list:
```bash
curl -fsSL "https://SEU_HOST/api/v1/tracking/deliveries?status=PENDENTE"
```

- Tracking update:
```bash
curl -fsSL -X POST "https://SEU_HOST/api/v1/tracking/deliveries/123" \
  -H "Content-Type: application/json" \
  -d '{ "lat": -23.55, "lng": -46.63 }'
```

---

## 📡 API Endpoints

### Health & Metrics
- `GET /api/v1/health`
- `GET /api/v1/metrics`

### Tracking
- `GET /api/v1/tracking/deliveries/:id`
- `GET /api/v1/tracking/deliveries?status=STATUS`
- `POST /api/v1/tracking/deliveries/:id`
- `GET /api/v1/tracking/drivers/:driverId/deliveries`

### Entregadores
- `GET /api/v1/entregadores`
- `GET /api/v1/entregadores/:id`
- `POST /api/v1/entregadores`
- `PUT /api/v1/entregadores/:id`
- `DELETE /api/v1/entregadores/:id`

### Veículos
- `GET /api/v1/veiculos`
- `GET /api/v1/veiculos/:id`
- `POST /api/v1/veiculos`
- `PUT /api/v1/veiculos/:id`
- `DELETE /api/v1/veiculos/:id`

### Aluguéis
- `GET /api/v1/alugueis`
- `GET /api/v1/alugueis/:id`
- `POST /api/v1/alugueis`
- `POST /api/v1/alugueis/:id/finalizar`
- `POST /api/v1/alugueis/:id/cancelar`

### Entregas
- `GET /api/v1/entregas`
- `GET /api/v1/entregas/:id`
- `POST /api/v1/entregas`
- `PATCH /api/v1/entregas/:id/status`

---

## 📚 Documentação Swagger

- Local: `http://localhost:3001/api-docs`
- Prod: `https://SEU_HOST/api-docs`

Importante: Selecione `/api/v1` no dropdown "Servers" para evitar erros CORS/mixed-content.

---

## 🔭 Observabilidade

### Logs
```bash
# Azure App Service → Monitoring → Log stream
az webapp log tail --name delivery-service --resource-group delivery-rg
```

### Métricas
- Endpoint `/metrics` expõe métricas no formato Prometheus

### Health Check
- Endpoint `/health` mostra status de integrações:
  - NATS (conectado/desconectado)
  - OPA (habilitado/desabilitado)
  - Maps (habilitado/desabilitado)

---

## 🐳 Docker

- Docker Hub: https://hub.docker.com/r/iyonuttxd/delivery-service

### Usando a imagem oficial
```bash
docker pull iyonuttxd/delivery-service:latest

docker run --rm -p 3001:3001 \
  -e NODE_ENV=production \
  -e DB_SERVER="your-server.database.windows.net" \
  -e DB_NAME="DeliveryServiceDB" \
  -e DB_USER="your-user" \
  -e DB_PASSWORD="your-password" \
  -e NATS_URL="nats://demo.nats.io:4222" \
  iyonuttxd/delivery-service:latest
```

### Docker Compose (exemplo)
```yaml
services:
  api:
    image: iyonuttxd/delivery-service:latest
    ports:
      - "3001:3001"
    environment:
      NODE_ENV: "production"
      DB_SERVER: "your-server.database.windows.net"
      DB_NAME: "DeliveryServiceDB"
      DB_USER: "your-user"
      DB_PASSWORD: "your-password"
      NATS_URL: "nats://demo.nats.io:4222"
      OPA_URL: "https://your-opa-worker.workers.dev"
      OPA_POLICY_PATH: "v1/data/delivery/authz/allow"
      MAP_SERVICE_URL: "https://your-map-worker.workers.dev"
      MAP_PROVIDER: "ors"
```

---

## ☁️ Deploy Azure

### App Service (Container com imagem do Docker Hub)
- Configure o App Service para usar a imagem `iyonuttxd/delivery-service:latest` (ou uma tag de release ex.: `v1.3.0`).
- Defina as App Settings (variáveis de ambiente) no Portal.

Exemplo via CLI (imagem pública do Docker Hub):
```bash
az webapp create \
  --resource-group delivery-rg \
  --plan delivery-plan \
  --name delivery-service \
  --deployment-container-image-name iyonuttxd/delivery-service:latest
```

Atualizar configurações:
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

---

## 📂 Estrutura do Projeto

```
delivery-service-microservice/
├── src/
│   ├── domain/                      # Núcleo do domínio (entities, value-objects, events, ports)
│   ├── features/
│   │   ├── deliveries/
│   │   │   ├── http/
│   │   │   │   ├── router.js
│   │   │   │   └── handlers.js
│   │   │   └── use-cases/
│   │   ├── tracking/
│   │   │   ├── http/
│   │   │   │   ├── router.js
│   │   │   │   └── handlers.js
│   │   │   └── use-cases/
│   │   ├── drivers/
│   │   │   ├── http/
│   │   │   │   ├── router.js
│   │   │   │   └── handlers.js
│   │   │   └── use-cases/
│   │   ├── vehicles/
│   │   │   ├── http/
│   │   │   │   ├── router.js
│   │   │   │   └── handlers.js
│   │   │   └── use-cases/
│   │   └── rentals/
│   │       ├── http/
│   │       │   ├── router.js
│   │       │   └── handlers.js
│   │       └── use-cases/
│   ├── infra/                       # Detalhes técnicos (adapters e repos concretos)
│   │   ├── adapters/                # NatsMessageBus, OPAPolicyClient, MapServiceAdapter
│   │   └── repositories/
│   │       └── sqlserver/
│   ├── main/                        # Composition root / DI e bootstrap
│   │   └── container.js
│   ├── middlewares/
│   ├── messaging/
│   ├── utils/
│   └── app.js                       # Express app (monta routers das features, health/metrics)
├── tests/
│   ├── unit/
│   └── integration/
├── openapi.yaml
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── package.json
└── README.md
```

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feat/minha-feature`)
3. Commit (`git commit -m 'feat: minha feature'`)
4. Push (`git push origin feat/minha-feature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja [LICENSE](LICENSE).

---

Imagem Docker: https://hub.docker.com/r/iyonuttxd/delivery-service

Desenvolvido com ❤️ por [@iYoNuttxD](https://github.com/iYoNuttxD)
