#!/bin/bash
set -e

echo "=== Vehicle Showcase Site - Build Script ==="
echo "Node version: $(node --version)"
echo "pnpm version: $(pnpm --version)"

echo ""
echo "Step 1: Installing dependencies..."
pnpm install --frozen-lockfile

echo ""
echo "Step 2: Building client..."
pnpm build

echo ""
echo "Step 3: Verifying build output..."
if [ -d "dist/public" ]; then
    echo "✓ dist/public exists"
    ls -lah dist/public/ | head -10
else
    echo "✗ dist/public not found!"
    exit 1
fi

if [ -f "dist/index.js" ]; then
    echo "✓ dist/index.js exists"
else
    echo "✗ dist/index.js not found!"
    exit 1
fi

echo ""
echo "=== Build completed successfully ==="
