#!/bin/sh
set -e

echo "Installing dependencies..."
npm install --legacy-peer-deps

echo "Starting application..."
exec "$@"