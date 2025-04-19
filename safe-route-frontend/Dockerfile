# frontend/Dockerfile
FROM node:18

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the frontend code
COPY . .

# Expose the React app port
EXPOSE 3000

CMD ["npm", "start"]
