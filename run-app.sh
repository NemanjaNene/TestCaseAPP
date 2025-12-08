#!/bin/bash

# Crypto Portfolio Tracker - Quick Start Script
# Pokreće aplikaciju sa jednom komandom

echo "🚀 Pokrećem Crypto Portfolio Tracker..."
echo ""

# Proveri da li je node_modules instaliran
if [ ! -d "node_modules" ]; then
    echo "📦 Instaliram zavisnosti..."
    npm install
    echo ""
fi

# Zaustavi stare servere na portu 3000
echo "🧹 Čistim stare servere..."
lsof -ti:3000 2>/dev/null | xargs kill -9 2>/dev/null
sleep 1

# Pokreni development server
echo "✨ Server se pokreće na http://localhost:3000"
echo "🌐 Chrome će se automatski otvoriti..."
echo "⚡ Za zaustavljanje pritisni Ctrl+C"
echo ""

# Otvori Chrome nakon 2 sekunde
(sleep 2 && open -a "Google Chrome" http://localhost:3000) &

npm run dev

