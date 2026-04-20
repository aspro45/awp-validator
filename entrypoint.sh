#!/bin/bash
set -e

echo "🚀 Starting Entrypoint Setup..."

# Fix: Create dummy requirements-dev.txt to prevent pip failure
if [ -d "/app/mine-skill" ]; then
    touch /app/mine-skill/requirements-dev.txt
    echo "📄 Created dummy requirements-dev.txt"
fi

# 🛡️ SECRETS & AUTH (Validator Specific)
if [ -f "/app/wallets.json" ]; then
    echo "🔑 Configuring Validator Signer..."
    # Extract the private key for the first wallet
    export VALIDATOR_PRIVATE_KEY=$(python3 -c "import json; print(json.load(open('/app/wallets.json'))[0]['privateKey'])")
    export VALIDATOR_ADDRESS=$(python3 -c "import json; print(json.load(open('/app/wallets.json'))[0]['address'])")
fi

if [ -f "/app/.env" ]; then
    echo "🌐 Configuring LLM Gateway Fallback..."
    export MINE_GATEWAY_TOKEN=$(grep FIREWORKS_API_KEY /app/.env | cut -d'=' -f2 | xargs)
    export MINE_GATEWAY_BASE_URL=$(grep OPENAI_API_BASE /app/.env | cut -d'=' -f2 | xargs)
    export FIREWORKS_API_KEY=$MINE_GATEWAY_TOKEN
    export OPENAI_API_BASE=$MINE_GATEWAY_BASE_URL
    export OPENAI_API_KEY=$MINE_GATEWAY_TOKEN
fi

# 🎬 RUNTIME CONFIG (Supervisor Environment)
export MINER_ID="validator-agent"
export PYTHON_PATH="/usr/bin/python3"
export MINE_CWD="/app/mine-skill"
export AWP_WRAPPER_PATH="/app/awp-wrapper.sh"
export CRAWLER_OUTPUT_ROOT="/app/data/validator-agent"
export WORKER_COMMAND="run-validator-worker"
export WORKER_ARGS="60,0"

# Specific patches for awp-wrapper.js (Small internal path fix)
sed -i "s|const logPath = '.*';|const logPath = '/app/wrapper.log';|" /app/awp-wrapper.js
sed -i "s|const walletsPath = '.*';|const walletsPath = '/app/wallets.json';|" /app/awp-wrapper.js

# Ensure wrapper script exists
if [ ! -f "/app/awp-wrapper.sh" ]; then
    echo '#!/bin/bash' > /app/awp-wrapper.sh
    echo 'node /app/awp-wrapper.js "$@"' >> /app/awp-wrapper.sh
    chmod +x /app/awp-wrapper.sh
fi

# Install Python dependencies
if [ -d "/app/mine-skill" ]; then
    echo "📦 Verifying mine-skill dependencies..."
    pip install --no-cache-dir --break-system-packages \
        -r /app/mine-skill/requirements-core.txt \
        -r /app/mine-skill/requirements-browser.txt \
        -r /app/mine-skill/requirements.txt || echo "⚠️ Some dependencies could not be fully satisfied."
fi

echo "🎬 Starting Validator Supervisor..."
exec node auto-restart-mining.js
