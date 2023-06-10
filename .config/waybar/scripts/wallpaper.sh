#!/bin/bash

export PATH="${PATH}:${HOME}/.local/bin/"

DIR=$HOME/Wallpapers
PICS=($(ls ${DIR}))

RANDOMPICS=${PICS[ $RANDOM % ${#PICS[@]} ]}

if [[ $(pidof swww) ]]; then
  pkill swww
fi

# swww init
swww img ${DIR}/${RANDOMPICS} --transition-type grow --transition-fps 60 --transition-duration 1.0 --transition-pos 0.810,0.972 --transition-bezier 0.65,0,0.35,1 --transition-step 255
wal -i ${DIR}/${RANDOMPICS} --cols16
pywalfox update
pywal-discord -t default

. $HOME/.config/mako/update-colors.sh
. $HOME/.config/spicetify/Themes/Pywal/update-colors.sh
. $HOME/.config/cava/scripts/update-colors.sh