# @rchrdwllm's Hyprland Rice on Arch Linux

Here are my configuration files for this rice. This rice relies heavily on [Pywal](https://github.com/dylanaraps/pywal). Colors change as you change your wallpaper!

![](https://raw.githubusercontent.com/rchrdwllm/dotfiles/master/Screenshots/relaxed_mario.png)

![](https://raw.githubusercontent.com/rchrdwllm/dotfiles/master/Screenshots/desert.png)

![](https://raw.githubusercontent.com/rchrdwllm/dotfiles/master/Screenshots/samurai_strike.png)

![](https://raw.githubusercontent.com/rchrdwllm/dotfiles/master/Screenshots/apex_octane.png)

If you want to use these dotfiles on your machine, you may need to run these commands first. Please use these dotfiles at your own risk !!!

## Installing Hyprland

I have `paru` as my AUR helper. You can use whatever you want!

```
paru -S wayland libdrm pixman libxkbcommon python libxml2 llvm libpng gegl mtdev xorg-xwayland qt5-wayland qt6-wayland hyprland swww waybar xdg-desktop-portal-wlr wlroots xdg-desktop-portal
```

## Setting up volume, brightness, and other stuff

```
paru -S polkit-kde-agent kitty pcmanfm-qt neovim gedit swaylock-effects brightnessctl pavucontrol alsa-utils grim slurp wl-clipboard mpv nm-applet python-pip rofi blueberry bluez bluez-utils ranger ts-node zsh ttf-jetbrains-mono ttf-jetbrains-mono-nerd inotify-tools sddm-sugar-candy-git thunar ark playerctl pamixer whitesur-icon-theme-git whitesur-cursor-theme-git whitesur-gtk-theme-git xdg-user-dirs nwg-look-bin python-pillow python-pywalfox pywal-discord-git mako-git viewnior gnome-keyring neofetch
```

## Fonts

I'm using the [Cartograph CF](https://connary.com/cartograph.html). It's a paid font and worth every penny. If you don't want to use the same font, go ahead and use those that you wish (be sure to replace them in the .config files for kitty, mako, rofi, waybar, etc.).

## Installing all other applications

Here are the apps that I normally have installed on distros that I use. Feel free to remove those that you're not using anyway.

```
paru -S firefox-developer-edition discord betterdiscordctl betterdiscord-git telegram-desktop spotify spicetify-cli visual-studio-code-bin cava cmatrix tty-clock pipes.sh obs-studio vlc
```

## Installing Pywal

If you want the regular Pywal, you can install it with `paru -S python-pywal`. But if you want 16 colors to be generated (which I use in this), you can install it by:

-   Cloning [this](https://github.com/eylles/pywal16) repo
-   `cd` into the repo and run `pip3 install --user .`

## Copying the dotfiles

Once done, you can go ahead and copy the files to their respective directories and do a reboot. An `install.sh` script does exist but it still hasn't been tested and and is still WIP.

## Setting up Firefox

If you use Firefox and want to have Pywal colors:

-   Download the theme extension [here.](https://addons.mozilla.org/en-US/firefox/addon/pywalfox/)
-   Run `pywalfox update` in your terminal.

Once done, you don't need to worry about manually updating the colors everytime you change your wallpaper. A script already takes care of that BUT you do need to manually restart Firefox to apply the new colors.

As for the custom CSS, I followed this guide [here](https://www.reddit.com/r/FirefoxCSS/wiki/index/tutorials/). The `userChrome.css` can be found in `.config/firefox/home/style.css`. Be sure to modify line 2 (replace "uiriamu" with your Linux username).

If you want to have the custom Firefox homepage, be sure to modify line 1 in `.config/firefox/home/style.css` (replace "uiriamu" with your Linux username). After that, set your home page in Firefox to a URL directing to the `index.html` file (e.g., file:///home/{yourusername}/.config/firefox/home/index.html)

## Setting up Spotify

-   Open and login with Spotify first.
-   Once done, initially run `spicetify backup apply` in your terminal.
-   Then you can set the theme by running `spicetify config current_theme Pywal` in your terminal to set the color theme.

Open Spotify and you should be good to go.

Note that you need to restart Spotify everytime the colors are changed. This process will be automatically done if you run Spotify using the `CTRL + ALT + S` keybind that I've set in `hyprland.conf` (you can change this keybind to whatever you want).

## Setting up Discord

Login with Discord first, then run `betterdiscordctl install` in your terminal, that will install Better Discord.

There's a short and easy-to-follow guide for setting up Discord with Pywal [here](https://github.com/FilipLitwora/pywal-discord).

## Some note

I don't know about you but in case you're experiencing a super slow reboot or shutdown with this, I followed [this](https://www.reddit.com/r/archlinux/comments/whsqdq/comment/ij9r90h/?utm_source=reddit&utm_medium=web2x&context=3) Reddit comment and it helped! Not really sure why that's happening, though.

## Credits

I got the waybar setup from [@1amSimp1e's dotfiles](https://github.com/1amSimp1e/dots) and modified them a bit!
