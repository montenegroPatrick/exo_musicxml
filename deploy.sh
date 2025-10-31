#!/bin/bash

echo "Building and Deploying...";

if npm run build; then 
    echo "Build ok"
   if scp -r dist/exo_musicxml/browser/* INFO:/home/www/vhosts/imusic-school.info/app/mobileApps/external/exo_musicXml/; then 
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