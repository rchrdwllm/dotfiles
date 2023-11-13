#!/bin/bash

export PATH="${PATH}:${HOME}/.local/bin/"

CURRENTIMG="$(<~/.cache/wal/wal )"
MODE=""

if [[ -e "${HOME}/.cache/wal/mode" ]]; then
    MODE="$(<~/.cache/wal/mode )"
else
    cd ${HOME}/.cache/wal && touch mode

    set -o noclobber
    echo "dark" >| ${HOME}/.cache/wal/mode

    MODE="dark"
fi

if [[ $MODE = "light" ]]; then
    notify-send "Changing to dark theme..."

    MODE="dark"

    wal -i $CURRENTIMG --cols16

    . $HOME/.config/mako/update-colors.sh

    set -o noclobber
    echo "dark" >| ${HOME}/.cache/wal/mode

    notify-send "Changed to dark theme!"
else
    notify-send "Changing to light theme..."

    MODE="light"

    wal -i $CURRENTIMG -l --cols16

    . $HOME/.config/mako/update-colors.sh

    set -o noclobber
    echo "light" >| ${HOME}/.cache/wal/mode

    notify-send "Changed to light theme!"
fi