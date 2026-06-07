FROM node:20-alpine

# Hugging Face runs containers under user ID 1000. Create an app directory and give permission.
RUN mkdir -p /home/node/app && chown -R node:node /home/node/app
WORKDIR /home/node/app

# Copy package configurations
COPY --chown=node:node package*.json ./

# Install dependencies as the non-root 'node' user
USER node
RUN npm ci --only=production

# Copy application files
COPY --chown=node:node . .

# Hugging Face exposes port 7860 by default
EXPOSE 7860
ENV PORT=7860

CMD ["npm", "start"]