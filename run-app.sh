#!/bin/bash

echo "🚀 Starting Quikry Application..."
echo ""

# Backend start
echo "🔧 Starting Backend..."
cd "/Users/prathamsharma/Documents/test applications/openwork/openwork-platform/backend/api-gateway"
node server.js &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID)"
sleep 2

# Frontend start
echo "🌐 Starting Frontend..."
cd "/Users/prathamsharma/Documents/test applications/openwork/openwork-platform/frontend/customer-app"
npm run dev &
FRONTEND_PID=$!
echo "✅ Frontend started (PID: $FRONTEND_PID)"

echo ""
echo "════════════════════════════════════════"
echo "✅ Application Running!"
echo "════════════════════════════════════════"
echo "Backend:  http://localhost:8000"
echo "Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop"

wait
