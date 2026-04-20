const { spawn } = require('child_process');
const path = require('path');

// Configuration with environment variable overrides for container compatibility
const MINER_ID = process.env.MINER_ID || 'miner-1';
const DATASETS = process.env.DATASETS || 'ds_wikipedia';
const RESTART_INTERVAL_MS = parseInt(process.env.RESTART_INTERVAL_MS) || (30 * 60 * 1000); // Default 30 min
const CWD = process.env.MINE_CWD || 'f:\\minework-farm\\mine-skill';
const PYTHON_PATH = process.env.PYTHON_PATH || path.join(CWD, '.venv', 'Scripts', 'python.exe');
const WRAPPER_PATH = process.env.AWP_WRAPPER_PATH || 'f:\\minework-farm\\awp-wrapper.cmd';

// Role configuration
const WORKER_COMMAND = process.env.WORKER_COMMAND || 'agent-start';
const WORKER_ARGS = process.env.WORKER_ARGS ? process.env.WORKER_ARGS.split(',') : [DATASETS];

let currentProcess = null;

function startMiner() {
    const roleName = WORKER_COMMAND.includes('validator') ? 'Validator' : 'Miner-1';
    console.log(`[${new Date().toISOString()}] Starting ${roleName} focus: ${DATASETS}...`);
    
    // Kill existing before start (Platform aware)
    const killer = process.platform === 'win32' 
        ? spawn('taskkill', ['/F', '/IM', 'python.exe', '/T'])
        : spawn('pkill', ['-f', 'python3']);
    
    killer.on('close', () => {
        const env = Object.assign({}, process.env, {
            PYTHONUTF8: '1',
            PYTHONIOENCODING: 'utf-8',
            AWP_WALLET_BIN: WRAPPER_PATH,
            MINER_ID: MINER_ID,
            CRAWLER_OUTPUT_ROOT: process.env.CRAWLER_OUTPUT_ROOT || `f:\\minework-farm\\data\\${MINER_ID}`
        });

        // Construct arguments array
        const args = [
            path.join(CWD, 'scripts', 'run_tool.py'),
            WORKER_COMMAND,
            ...WORKER_ARGS
        ];

        console.log(`[Supervisor] Launching: ${PYTHON_PATH} ${args.join(' ')}`);

        currentProcess = spawn(PYTHON_PATH, args, { env, cwd: CWD });

        currentProcess.stdout.on('data', (data) => {
            const line = data.toString().trim();
            // Capture meaningful progress items
            if (line.includes('iteration') || line.includes('Submitted') || line.includes('Validator')) {
                console.log(`[Worker Log]: ${line}`);
            }
        });

        currentProcess.stderr.on('data', (data) => {
            if (data.toString().includes('ERROR')) {
                console.log(`[Worker Error]: ${data}`);
            }
        });

        currentProcess.on('close', (code) => {
            console.log(`[${new Date().toISOString()}] Worker process exited with code ${code}.`);
        });
    });
}

// Initial start
startMiner();

// Set up restart interval
if (RESTART_INTERVAL_MS > 0) {
    setInterval(() => {
        console.log(`[${new Date().toISOString()}] Restart timer reached. Restarting worker...`);
        if (currentProcess) {
            currentProcess.kill('SIGKILL');
        }
        startMiner();
    }, RESTART_INTERVAL_MS);
}

const roleLabel = WORKER_COMMAND.includes('validator') ? 'Validator' : 'Miner-1';
console.log(`[${new Date().toISOString()}] Supervisor Active. Mode: ${roleLabel}.`);
