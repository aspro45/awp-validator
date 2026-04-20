# AWP Mine WorkNet Validator Template

A fully containerized, autonomous validator node for the **AWP Mine WorkNet**. This setup is designed for continuous evaluation tasks, utilizing an environment-aware supervisor and a secure canonical signer.

## 🌟 Features

- **Autonomous Evaluation**: Executes `run-validator-worker` in an infinite loop.
- **Self-Healing**: Automatically restarts the worker process if it fails or stalls.
- **Platform Agnostic**: Works on Linux, Windows (WSL), and macOS via Docker.
- **Secure Signing**: Canonical AWP Signer integration for verified task submission.

## 🛠️ Prerequisites

- **Docker** and **Docker Compose** installed.
- **Node.js** (v18+) installed locally for initialization.
- **10,000 AWP** staked on your wallet address (Required for Eligibility).
- **Fireworks API Key** (or MINE_GATEWAY_TOKEN) for LLM evaluations.

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone <this-repo-url>
cd validator-portable-template
```

### 2. Initialize your Identity
Run the interactive setup script to configure your wallet and API keys.
```bash
npm install
node setup-identity.js
```
*You can provide an existing private key or generate a fresh one.*

### 3. Launch the Node
Start the containerized validator swarm.
```bash
docker-compose up --build -d
```

## 📊 Monitoring

- **Node Logs**: `docker logs -f awp-fernando-validator`
- **Explorer**: Check your status at `https://minework.net/validators/<your-address>`

## 📁 Repository Structure

- `auto-restart-mining.js`: The platform-aware supervisor process.
- `setup-identity.js`: CLI tool for initial configuration.
- `entrypoint.sh`: Shell environment preparation and dependency verification.
- `docker-compose.yml`: Container orchestration.

## ⚖️ License
MIT
