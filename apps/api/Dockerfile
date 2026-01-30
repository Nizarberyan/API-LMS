FROM node:20-alpine

WORKDIR /app

# Copy the entire monorepo
COPY . .

# Install dependencies
RUN npm install

# Build the API
RUN npx turbo run build --filter=api

# Run the API
CMD ["node", "apps/api/dist/src/main"]
