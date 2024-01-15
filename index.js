const { spawn } = require('child_process');

// Start the server process
const serverProcess = spawn('node', ['server.js']);

serverProcess.stdout.on('data', (data) => {
  console.log(`Server output: ${data}`);
});

// Listen for process exit events
serverProcess.on('exit', (code) => {
  console.log(`Server process exited with code ${code}`);
});
