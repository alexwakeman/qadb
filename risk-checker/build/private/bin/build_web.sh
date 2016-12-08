#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Rebuild the static files.
php $DIR/rebuild.php

# Make public files globally readable.
chmod -R go+r $DIR/../../public/*
