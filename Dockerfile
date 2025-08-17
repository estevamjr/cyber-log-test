# Usa a imagem Node.js 18, versão Alpine por ser leve
FROM node:18-alpine

# Define o diretório de trabalho dentro do container
WORKDIR /usr/src/app

# Copia os arquivos de definição de pacotes
COPY package*.json ./

# Instala TODAS as dependências, incluindo as de desenvolvimento
# Otimizado para usar o cache do npm se o package-lock não mudar
RUN npm install

# Muda para um usuário não-root para mais segurança
USER node

# O comando do docker-compose.yml irá sobrepor este, mas é bom ter um padrão.
CMD [ "npm", "run", "start:dev" ]