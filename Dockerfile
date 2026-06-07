# ==========================================
# STAGE 1: Build the TypeScript Application
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /home/node/app

# Copy configuration files needed to compile
COPY package*.json tsconfig.json ./

# Install ALL dependencies (including typescript compiler)
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Run the typescript compiler build script
RUN npm run build

# ==========================================
# STAGE 2: Run the Compiled Production Server
# ==========================================
FROM node:20-alpine AS runner

# Hugging Face runs containers under user ID 1000
RUN mkdir -p /home/node/app && chown -R node:node /home/node/app
WORKDIR /home/node/app

COPY --chown=node:node package*.json ./

USER node

# Install ONLY production dependencies (keeps container tiny)
RUN npm ci --only=production

# CRUCIAL FIX: Copy compiled 'dist' files from the builder stage
COPY --from=builder --chown=node:node /home/node/app/dist ./dist

# Hugging Face exposes port 7860 by default
EXPOSE 7860
ENV PORT=7860

CMD ["npm", "start"]