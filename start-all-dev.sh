#!/bin/bash

# QuikRy - Start All Development Servers
# This script starts backend, 3 web frontends, and mobile app

echo "🚀 Starting QuikRy Development Environment..."
echo ""

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Kill existing processes
echo -e "${YELLOW}📋 Cleaning up existing processes...${NC}"
pkill -f "node server.js" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
pkill -f "expo start" 2>/dev/null || true
pkill -f "Metro" 2>/dev/null || true
sleep 2
echo -e "${GREEN}✅ Cleanup complete${NC}"
echo ""

# Start Backend
echo -e "${RED}🔧 Starting Backend (port 8000)...${NC}"
cd "$SCRIPT_DIR/openwork-platform/backend/api-gateway"
node server.js > /tmp/quikry-backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"
sleep 3

# Check backend health
BACKEND_STATUS=$(curl -s http://192.168.1.13:8000/api/health || echo "failed")
if [[ $BACKEND_STATUS == *"OK"* ]]; then
    echo -e "${GREEN}✅ Backend started successfully${NC}"
else
    echo -e "${RED}❌ Backend failed to start${NC}"
fi
echo ""

# Start Web Frontends with concurrently
echo -e "${BLUE}🌐 Starting Web Frontends (customer, delivery, seller)...${NC}"
cd "$SCRIPT_DIR"
npm run start:web > /tmp/quikry-web.log 2>&1 &
WEB_PID=$!
echo "Web Apps PID: $WEB_PID"
echo -e "${GREEN}✅ Web apps starting...${NC}"
echo "   - Customer App: http://localhost:3001"
echo "   - Delivery App: http://localhost:5174"
echo "   - Seller Dashboard: http://localhost:5175"
echo ""

# Start Mobile Expo
echo -e "${YELLOW}📱 Starting Mobile App (Expo)...${NC}"
cd "$SCRIPT_DIR/mobile/customer-app"
npx expo start --lan > /tmp/quikry-mobile.log 2>&1 &
MOBILE_PID=$!
echo "Mobile App PID: $MOBILE_PID"
sleep 5
echo -e "${GREEN}✅ Expo started - Scan QR code with your phone${NC}"
echo ""

# Summary
echo -e "${GREEN}════════════════════════════════════════════${NC}"
echo -e "${GREEN}  🎉 All Services Started Successfully!${NC}"
echo -e "${GREEN}════════════════════════════════════════════${NC}"
echo ""
echo "📊 Process IDs:"
echo "   Backend:  $BACKEND_PID"
echo "   Web:      $WEB_PID"
echo "   Mobile:   $MOBILE_PID"
echo ""
echo "🌐 Access URLs:"
echo "   Backend:       http://192.168.1.13:8000"
echo "   Customer Web:  http://localhost:3001"
echo "   Delivery Web:  http://localhost:5174"
echo "   Seller Web:    http://localhost:5175"
echo "   Mobile Expo:   exp://192.168.1.13:8081"
echo ""
echo "📝 Logs:"
echo "   Backend:  tail -f /tmp/quikry-backend.log"
echo "   Web:      tail -f /tmp/quikry-web.log"
echo "   Mobile:   tail -f /tmp/quikry-mobile.log"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"

# Keep script running
wait
