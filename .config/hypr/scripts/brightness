#!/usr/bin/env bash

iDIR="$HOME/.config/dunst/imgs"

# Get brightness
get_backlight() {
	MAX=$(brightnessctl max)
	LIGHT=$(printf "%.0f\n" $(brightnessctl get))
	PERCENTAGE=$(expr 100 \* $LIGHT / $MAX)
	echo "${PERCENTAGE}%"
}

# Get icons
get_icon() {
	backlight="$(get_backlight)"
	current="${backlight%%%}"
	if [[ ("$current" -ge "0") && ("$current" -le "20") ]]; then
		icon="$iDIR/brightness-20.png"
	elif [[ ("$current" -ge "20") && ("$current" -le "40") ]]; then
		icon="$iDIR/brightness-40.png"
	elif [[ ("$current" -ge "40") && ("$current" -le "60") ]]; then
		icon="$iDIR/brightness-60.png"
	elif [[ ("$current" -ge "60") && ("$current" -le "80") ]]; then
		icon="$iDIR/brightness-80.png"
	elif [[ ("$current" -ge "80") && ("$current" -le "100") ]]; then
		icon="$iDIR/brightness-100.png"
	fi
}

# Notify
notify_user() {
	notify-send -h string:x-canonical-private-synchronous:sys-notify -u low -i "$icon" "Brightness : $(get_backlight)"
}

# Increase brightness
inc_backlight() {
	brightnessctl set 5%+ && get_icon && notify_user
}

# Decrease brightness
dec_backlight() {
	brightnessctl set 5%- && get_icon && notify_user
}

# Execute accordingly
if [[ "$1" == "--get" ]]; then
	get_backlight
elif [[ "$1" == "--inc" ]]; then
	inc_backlight
elif [[ "$1" == "--dec" ]]; then
	dec_backlight
else
	get_backlight
fi