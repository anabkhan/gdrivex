#!/bin/bash

echo "Building react project"
npm run build --prefix ./ui

echo "Copy build to views"
rm -rf ./api/views
cp -f ./ui/build ./api/views

echo "Deploy to cloud foundry"
cd ./api
ibmcloud cf push
