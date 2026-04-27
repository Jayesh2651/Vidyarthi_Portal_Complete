#!/usr/bin/env bash
set -o errexit

echo "Installing wkhtmltopdf..."
apt-get update
apt-get install -y wkhtmltopdf

echo "Installing frontend dependencies..."
cd frontend
npm install
npm run build
cd ..

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Running migrations..."
python manage.py migrate --noinput
