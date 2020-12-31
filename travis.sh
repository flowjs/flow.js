#!/bin/bash

set -e

if [[ $TEST = "unit-tests" ]]; then

  echo "Running unit-tests"
  export DISPLAY=:99.0
  sleep 1
  grunt karma:coverage

elif [[ $TEST = "browser-tests" ]]; then

  echo "Running browser-tests"
  ./node_modules/.bin/karma start --single-run --browsers tb_ff karma.conf.js

fi
