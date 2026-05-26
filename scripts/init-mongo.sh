#!/bin/bash
set -e

echo "⏳ Waiting for MongoDB replica set to be ready..."
sleep 10

echo "🔧 Initializing MongoDB Replica Set..."
docker exec mongo1 mongosh --eval "
  rs.initiate({
    _id: 'rs0',
    members: [
      {_id: 0, host: 'mongo1:27017'},
      {_id: 1, host: 'mongo2:27017'},
      {_id: 2, host: 'mongo3:27017'}
    ]
  })
" || true

echo "Replica set initialized!"
echo "Checking status..."
sleep 3
docker exec mongo1 mongosh --eval "rs.status()" | grep -E "(stateStr|health)" | head -5 || true
