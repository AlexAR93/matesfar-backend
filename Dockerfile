# Usa una imagen base de Node.js
FROM node:18

# Configura el directorio de trabajo
WORKDIR /app

# Copia el package.json y package-lock.json
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el código fuente
COPY . .

# Expone el puerto que usa tu app
EXPOSE 3000

# Ejecuta la aplicación
CMD ["npm", "start"]
