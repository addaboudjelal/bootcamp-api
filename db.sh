#!/bin/sh
echo "Uploading Data to dB"
node seeder -d
echo "Removed old data"
node seeder -i
echo "Creating new one"
npm run dev
echo "Done"