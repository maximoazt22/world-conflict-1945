FROM node:20-alpine

WORKDIR /app

# Copy server files
COPY server.js .
COPY server-package.json package.json

# Install dependencies
RUN npm install --production

EXPOSE 3001

CMD ["node", "server.js"]
