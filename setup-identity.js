/**
 * setup-identity.js - Friendly setup for Mine WorkNet Validator
 * 
 * This script helps you configure your wallet and API keys securely.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { ethers } = require('ethers');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const WALLET_FILE = path.join(__dirname, 'wallets.json');
const ENV_FILE = path.join(__dirname, '.env');

async function ask(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
    console.log('\n🚀 Welcome to the Mine WorkNet Validator Setup!\n');

    // 1. Wallet Setup
    let privateKey = '';
    if (fs.existsSync(WALLET_FILE)) {
        console.log('✅ Found existing wallets.json');
    } else {
        const choice = await ask('Do you have an existing Private Key to use? (y/n): ');
        if (choice.toLowerCase() === 'y') {
            privateKey = await ask('Enter your Private Key: ');
        } else {
            console.log('📦 Generating a fresh wallet for you...');
            const wallet = ethers.Wallet.createRandom();
            privateKey = wallet.privateKey;
            console.log(`\n✨ New Wallet Generated!`);
            console.log(`📍 Address: ${wallet.address}`);
            console.log(`🔑 Private Key: ${wallet.privateKey}`);
            console.log(`\n⚠️  IMPORTANT: SAVE THIS PRIVATE KEY. If you lose it, you lose your stake.\n`);
        }

        try {
            const wallet = new ethers.Wallet(privateKey);
            const walletData = [{
                id: 1,
                address: wallet.address,
                privateKey: wallet.privateKey,
                registered: false,
                bound: false,
                miningActive: false
            }];
            fs.writeFileSync(WALLET_FILE, JSON.stringify(walletData, null, 2));
            console.log('✅ wallets.json created successfully.');
        } catch (e) {
            console.error('❌ Invalid Private Key provided.');
            process.exit(1);
        }
    }

    // 2. API Key Setup
    console.log('\n🌐 LLM Gateway Setup');
    const fireworksKey = await ask('Enter your Fireworks API Key (get it at fireworks.ai): ');
    
    let envContent = fs.existsSync(ENV_FILE) ? fs.readFileSync(ENV_FILE, 'utf-8') : '';
    
    // Simple env update logic
    if (envContent.includes('FIREWORKS_API_KEY')) {
        envContent = envContent.replace(/FIREWORKS_API_KEY=.*/, `FIREWORKS_API_KEY=${fireworksKey}`);
    } else {
        envContent += `\nFIREWORKS_API_KEY=${fireworksKey}\n`;
    }
    
    // Standard fallbacks
    if (!envContent.includes('OPENAI_API_BASE')) {
        envContent += `OPENAI_API_BASE=https://api.fireworks.ai/inference/v1\n`;
    }
    if (!envContent.includes('MINE_GATEWAY_MODEL')) {
        envContent += `MINE_GATEWAY_MODEL=accounts/fireworks/models/llama-v3p3-70b-instruct\n`;
    }

    fs.writeFileSync(ENV_FILE, envContent.trim() + '\n');
    console.log('✅ .env file updated.');

    console.log('\n🎉 Setup Complete!');
    console.log('👉 Next Steps:');
    console.log('1. Run: npm install');
    console.log('2. Run: docker-compose up --build -d');
    console.log('\nHappy Mining!\n');
    process.exit(0);
}

main();
