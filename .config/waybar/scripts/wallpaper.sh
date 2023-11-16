#!/bin/bash

export PATH="${PATH}:${HOME}/.local/bin/"

DIR=$HOME/Wallpapers
PICS=($(ls ${DIR}))

RANDOMPICS=${PICS[ $RANDOM % ${#PICS[@]} ]}

if [[ $(pidof swww) ]]; then
  pkill swww
fi

swww img ${DIR}/${RANDOMPICS} --transition-type grow --transition-fps 60 --transition-duration 0.5 --transition-bezier 0.65,0,0.35,1 --transition-pos 0.794,0.972 --transition-step 1

sleep 1.25

if [[ "$(<~/.cache/wal/mode )" = "dark" ]]; then
  wal -i ${DIR}/${RANDOMPICS} --cols16
elif [[ "$(<~/.cache/wal/mode )" = "light" ]]; then
  wal -i ${DIR}/${RANDOMPICS} -l --cols16
fi

pywalfox update
pywal-discord -t default
wal-telegram --wal

. $HOME/.config/mako/update-colors.sh