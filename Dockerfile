# Use a imagem oficial do Node.js 18 como base
FROM node:18-alpine

# Defina o diretório de trabalho dentro do contêiner
WORKDIR /usr/src/app

# Copie os arquivos de manifesto do pacote e instale as dependências
# Copiar package-lock.json garante instalações consistentes
COPY package*.json ./
RUN npm ci --only=production

# Copie o código-fonte da sua aplicação
COPY . .

# Exponha a porta em que o App Service irá executar a aplicação
EXPOSE 8080

# Comando para iniciar a aplicação
CMD [ "npm", "start" ]
