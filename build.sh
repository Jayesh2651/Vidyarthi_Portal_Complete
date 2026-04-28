#!/usr/bin/env bash
set -o errexit

if [ "${BUILD_FRONTEND_WITH_DJANGO:-0}" = "1" ]; then
  echo "Building frontend bundle for Django static hosting..."
  npm --prefix frontend ci
  VITE_BASE_PATH=/static/ npm --prefix frontend run build
fi

echo "Running migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput
