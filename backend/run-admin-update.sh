#!/bin/bash

# Helper script to update admin password on VPS
cd /var/www/html/kyatflow-mobile-/backend

# Install dependencies if needed (for bcryptjs)
if [ ! -d "node_modules" ]; then
    npm install
fi

# Run the update script
# We use npx tsx because it handles typescript files without compilation
npx tsx update-admin-pass.ts
