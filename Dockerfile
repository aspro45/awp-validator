# Dockerfile
FROM node:20-slim

# Install Python, Procps, Build Tools
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    procps \
    sed \
    build-essential \
    libffi-dev \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the repository files
COPY . .

# 1. Create a persistent binary-style wrapper for AWP Wallet
# This is still useful as a global hook
RUN echo '#!/bin/bash\nnode /app/awp-wrapper.js "$@"' > /app/awp-wrapper.sh && \
    chmod +x /app/awp-wrapper.sh

# 2. Cleanup: We no longer need inline sed patches because our scripts (auto-restart-mining.js) 
# have been refactored to be platform-aware and use environment variables.

RUN npm install

# Create logs
RUN touch /app/wrapper.log && chmod 666 /app/wrapper.log

COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
