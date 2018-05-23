#!/bin/bash

git pull origin master
rm -rf ./node_modules
yarn install
yarn build
pm2 startOrRestart ecosystem.config.js