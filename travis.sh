#!/bin/bash

set -e

if [[ $TEST = "unit-tests" ]]; then

  echo "Running unit-tests"
  export DISPLAY=:99.0
  sleep 1
  firefox -v
  grunt karma:coverage
  ls -lR coverage/

elif [[ $TEST = "browser-tests" ]]; then

  echo "Running browser-tests"
  grunt karma:saucelabs

fi
