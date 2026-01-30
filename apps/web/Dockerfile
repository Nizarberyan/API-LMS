FROM node:20-alpine

WORKDIR /app

# Copy the entire monorepo
COPY . .

# Install dependencies
RUN npm install

# Build the Web app
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npx turbo run build --filter=web

# Run the Web app
ENV PORT=3000
CMD ["npm", "run", "start", "-w", "apps/web"]
