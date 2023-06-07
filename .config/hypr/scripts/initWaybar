#!/bin/bash

CONFIG_FILES="$HOME/.config/waybar/config.json $HOME/.config/waybar/style.css $HOME/.cache/wal/colors-waybar.css"

trap "killall waybar" EXIT

while true; do
    \cp -r .cache/wal/colors-waybar.css .config/waybar &
    waybar -c .config/waybar/config.json -s .config/waybar/style.css &
    inotifywait -e create,modify $CONFIG_FILES
    killall waybar
done