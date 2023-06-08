#!/bin/bash

export PATH="${PATH}:${HOME}/.local/bin/"

DIR=$HOME/Wallpapers
PICS=($(ls ${DIR}))

RANDOMPICS=${PICS[ $RANDOM % ${#PICS[@]} ]}

if [[ $(pidof swww) ]]; then
  pkill swww
fi

# swww init
swww img ${DIR}/${RANDOMPICS} --transition-type grow --transition-fps 60 --transition-duration 1.0 --transition-pos 0.768,0.970 --transition-bezier 0.65,0,0.35,1 --transition-step 255

wal -i ${DIR}/${RANDOMPICS} --cols16
pywalfox update