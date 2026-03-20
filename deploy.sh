#!/bin/bash

echo "Building and Deploying...";

if npm run build; then 
    echo "Build ok"
   if rsync -avz --delete dist/exo_musicxml/browser/ INFO:/home/www/vhosts/imusic-school.info/app/mobileApps/external/modules/; then 
    echo "Deploy ok"
    echo ''
else 
    echo "Deploy failed"
    exit 1
fi
else 
    echo "Build failed"
    exit 1
fi