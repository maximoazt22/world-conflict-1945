FROM node:20-alpine

WORKDIR /app

# Copy configuration files
COPY package.json ./
# If you have a lockfile, uncomment the next line
# COPY package-lock.json ./ 
COPY tsconfig.json ./
COPY tsconfig.server.json ./

# Install dependencies (including production + typescript/ts-node)
RUN npm install

# Copy source code
COPY src ./src

# Expose the port
EXPOSE 3001

# Start the server using the script defined in package.json
CMD ["npm", "start"]
