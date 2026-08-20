# Usa uma imagem leve do Node.js
FROM node:18-alpine

# Define a pasta de trabalho
WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante dos arquivos (src, public, configs)
COPY . .

# Expõe a porta padrão do Vite
EXPOSE 5173

# Comando para rodar o modo de desenvolvimento
CMD ["npm", "run", "dev", "--", "--host"]