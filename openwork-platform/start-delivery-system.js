#!/usr/bin/env node

console.log('🚛 OpenWork Delivery System Setup & Test');
console.log('═'.repeat(50));

const { spawn, exec } = require('child_process');
const path = require('path');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkMongoDB() {
  return new Promise((resolve) => {
    exec('mongod --version', (error) => {
      if (error) {
        log('❌ MongoDB not found. Please install MongoDB first.', 'red');
        log('   Download from: https://www.mongodb.com/try/download/community', 'cyan');
        resolve(false);
      } else {
        log('✅ MongoDB is installed', 'green');
        resolve(true);
      }
    });
  });
}

async function setupDatabase() {
  log('\n📂 Setting up delivery database...', 'yellow');
  
  return new Promise((resolve) => {
    const setupProcess = spawn('node', ['setup-delivery-data.js'], {
      cwd: __dirname,
      stdio: 'inherit'
    });

    setupProcess.on('close', (code) => {
      if (code === 0) {
        log('✅ Database setup completed', 'green');
        resolve(true);
      } else {
        log('❌ Database setup failed', 'red');
        resolve(false);
      }
    });
  });
}

async function startBackend() {
  log('\n🖥️  Starting backend server...', 'yellow');
  
  const backendProcess = spawn('node', ['backend/api-gateway/server.js'], {
    cwd: __dirname,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  backendProcess.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('Server running on port 8000')) {
      log('✅ Backend server started on http://localhost:8000', 'green');
    }
  });

  backendProcess.stderr.on('data', (data) => {
    const error = data.toString();
    if (!error.includes('DeprecationWarning')) {
      log(`Backend error: ${error}`, 'red');
    }
  });

  return backendProcess;
}

async function startDeliveryApp() {
  log('\n📱 Starting delivery app...', 'yellow');
  
  const deliveryProcess = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, 'frontend', 'delivery-app', 'web'),
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true
  });

  deliveryProcess.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('Local:') && output.includes('5174')) {
      log('✅ Delivery app started on http://localhost:5174', 'green');
    }
  });

  deliveryProcess.stderr.on('data', (data) => {
    const error = data.toString();
    if (!error.includes('Warning') && !error.includes('esbuild')) {
      log(`Delivery app error: ${error}`, 'red');
    }
  });

  return deliveryProcess;
}

async function startCustomerApp() {
  log('\n👥 Starting customer app...', 'yellow');
  
  const customerProcess = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, 'frontend', 'customer-app'),
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true
  });

  customerProcess.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('Local:') && output.includes('5173')) {
      log('✅ Customer app started on http://localhost:5173', 'green');
    }
  });

  customerProcess.stderr.on('data', (data) => {
    const error = data.toString();
    if (!error.includes('Warning') && !error.includes('esbuild')) {
      log(`Customer app error: ${error}`, 'red');
    }
  });

  return customerProcess;
}

async function displayTestInfo() {
  await sleep(3000); // Wait for servers to fully start
  
  log('\n🎉 SYSTEM READY FOR TESTING!', 'bold');
  log('═'.repeat(50), 'cyan');
  
  log('\n🔗 APPLICATIONS:', 'blue');
  log('   • Customer App:  http://localhost:5173', 'cyan');
  log('   • Delivery App:  http://localhost:5174', 'cyan');
  log('   • Backend API:   http://localhost:8000', 'cyan');
  
  log('\n🔐 DELIVERY LOGIN CREDENTIALS:', 'blue');
  log('   1. Phone: 9876543210 | Password: delivery123 | Name: Rajesh Kumar', 'cyan');
  log('   2. Phone: 8765432109 | Password: priya456   | Name: Priya Sharma', 'cyan');
  log('   3. Phone: 7654321098 | Password: amit789    | Name: Amit Singh', 'cyan');
  
  log('\n📋 TESTING STEPS:', 'blue');
  log('   1. Open delivery app (http://localhost:5174)', 'cyan');
  log('   2. Login with any of the credentials above', 'cyan');
  log('   3. You should see 3 pending orders', 'cyan');
  log('   4. Accept an order and test the functionality', 'cyan');
  log('   5. Open customer app to place more orders', 'cyan');
  
  log('\n🛑 TO STOP ALL SERVICES:', 'blue');
  log('   Press Ctrl+C in this terminal', 'cyan');
  
  log('\n📊 MONITORING:', 'blue');
  log('   • Check MongoDB: Use MongoDB Compass or mongo shell', 'cyan');
  log('   • API Testing: Use Postman or curl with localhost:8000', 'cyan');
  log('   • Logs: Watch this terminal for real-time logs', 'cyan');
}

async function main() {
  try {
    // Check prerequisites
    const mongoInstalled = await checkMongoDB();
    if (!mongoInstalled) {
      process.exit(1);
    }

    // Setup database
    const dbSetup = await setupDatabase();
    if (!dbSetup) {
      log('❌ Failed to setup database. Please check MongoDB is running.', 'red');
      process.exit(1);
    }

    await sleep(2000);

    // Start all services
    const backendProcess = await startBackend();
    await sleep(3000);
    
    const deliveryProcess = await startDeliveryApp();
    await sleep(2000);
    
    const customerProcess = await startCustomerApp();
    
    // Display test information
    await displayTestInfo();

    // Handle cleanup on exit
    process.on('SIGINT', () => {
      log('\n🛑 Shutting down all services...', 'yellow');
      
      if (backendProcess) backendProcess.kill();
      if (deliveryProcess) deliveryProcess.kill();
      if (customerProcess) customerProcess.kill();
      
      log('✅ All services stopped. Goodbye!', 'green');
      process.exit(0);
    });

    // Keep the main process alive
    process.stdin.resume();

  } catch (error) {
    log(`❌ Error starting system: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run the main function
main();