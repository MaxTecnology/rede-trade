# Etapa 1: Build da aplicação
FROM node:18-alpine as build

# Defina o diretório de trabalho dentro do container
WORKDIR /app

# Copie os arquivos do package.json e package-lock.json para o container
COPY package.json package-lock.json ./

# Instale as dependências
RUN npm install

# Copie todos os arquivos do projeto para dentro do container
COPY . .

# Execute o build da aplicação
RUN npm run build

# Etapa 2: Servir a aplicação usando o NGINX
FROM nginx:alpine

# Remove o arquivo de configuração padrão do NGINX
RUN rm /etc/nginx/conf.d/default.conf

# Copie um novo arquivo de configuração do NGINX
COPY nginx.conf /etc/nginx/conf.d

# Copie os arquivos gerados pelo build do Vite para a pasta que o NGINX serve
COPY --from=build /app/dist /usr/share/nginx/html

# Exponha a porta 80
EXPOSE 80

# Execute o NGINX
CMD ["nginx", "-g", "daemon off;"]
