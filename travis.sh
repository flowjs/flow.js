#!/bin/bash

set -e

if [ $TEST = "unit-tests" ]; then

  echo "Running unit-tests"
  export DISPLAY=:99.0
  sh -e /etc/init.d/xvfb start
  sleep 1
  grunt karma:coverage
  grunt coveralls

elif [[ $TEST = "browser-tests" ]]; then

  echo "Running browser-tests"
  grunt karma:saucelabs

fi
