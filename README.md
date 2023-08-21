# @rchrdwllm's Hyprland Rice on Arch Linux

Here are my configuration files for this rice. This rice relies heavily on [Pywal](https://github.com/dylanaraps/pywal). Colors change as you change your wallpaper!

## Some features and configs

-   Select a wallpaper with `Super + W` and see the colors change
-   Discord, Spotify, VS Code, and Firefox are also themed
-   Add any wallpapers in the home/Wallpapers directory and let Pywal handle the colors for you
-   Apps will open in their respective workspaces
    -   Workspace 1: Terminal
    -   Workspace 2: VS Code
    -   Workspace 3: Browsers (Microsoft Edge and Firefox)
    -   Workspace 4: Files (Thunar and `ranger`)
    -   Workspace 5: Productivity (Capacities)
    -   Workspace 6: Social media (Discord and Telegram)
    -   Workspace 7: Music (Spotify, Cider, and `cava`)
-   Toggle full screen: `Super + F`
-   Launcher: `Super + D`
-   Power menu: `Super + X`
-   Search anything on the internet: `Super + Space`
-   Select emojis: `Super + ;`
-   Terminal: `Super + Enter`
-   Ranger: `Super + Shift + Enter`
-   VS Code: `CTRL + Alt + V`
-   Microsoft Edge: `CTRL + Alt + W`
-   Discord: `CTRL + Alt + D`
-   Cider: `CTRL + Alt + M`
-   Spotify: `CTRL + Alt + S`
-   Telegram: `CTRL + Alt + T`
-   Open Facebook: `CTRL + Alt + F`
-   Open Capacities: `CTRL + Alt + C`
-   Open YouTube: `CTRL + Alt + Y`
-   Some of the waybar configs:
    -   Right click on the wallpaper button on your bar to set a random wallpaper and set colors from it
    -   Click on the bluetooth icon to open `blueberry`
    -   Click on the wifi icon to open `nmtui`
    -   Click on the audio icon to open `pavucontrol`
-   Run `hyprcfg` in your terminal to edit your `hyprland.conf` file
-   Run `waycfg` in your terminal to open your waybar config folder

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
paru -S polkit-kde-agent kitty pcmanfm-qt neovim gedit swaylock-effects brightnessctl pavucontrol alsa-utils grim slurp wl-clipboard mpv python-pip rofi blueberry bluez bluez-utils ranger ts-node zsh ttf-jetbrains-mono ttf-jetbrains-mono-nerd inotify-tools sddm-sugar-candy-git thunar ark playerctl pamixer whitesur-icon-theme-git whitesur-cursor-theme-git whitesur-gtk-theme-git xdg-user-dirs nwg-look-bin python-pillow python-pywalfox pywal-discord-git mako-git viewnior gnome-keyring neofetch imagemagick wtype inter-font-beta rofi-emoji noto-fonts-emoji ttf-droid alsa-firmware tumbler wal-telegram-git
```

## Installing all other applications

Here are the apps that I normally have installed on distros that I use. Feel free to remove those that you're not using anyway.

```
paru -S google-chrome firefox-developer-edition microsoft-edge-stable-bin discord betterdiscordctl betterdiscord-git telegram-desktop spotify spicetify-cli cider visual-studio-code-bin cava cmatrix tty-clock pipes.sh obs-studio vlc
```

## Fonts

I'm using the [Cartograph CF](https://connary.com/cartograph.html). It's a paid font and worth every penny. If you don't want to use the same font, go ahead and use those that you wish (be sure to replace them in the .config files for kitty, mako, rofi, waybar, etc.).

## Setting up Oh My Zsh and Powerlevel10k Theme

Do these first before copying the `.zshrc` and `.p10k.zsh` files to your home directory:

-   Install first Oh My Zsh by running this command:
    ```
    sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
    ```
-   Install the Powerlevel10k theme:
    ```
    git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k
    ```
-   Install the syntax highlighting plugin and the autosuggestions plugin:

    ```
    git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
    ```

    ```
    git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
    ```

After that, you can now copy the `.zshrc` and `.p10k.zsh` files to your home directory.

## Installing Pywal

If you want the regular Pywal, you can install it with `paru -S python-pywal`. But if you want 16 colors to be generated (which I use in this), you can install it by:

-   Cloning [this](https://github.com/eylles/pywal16) repo
-   `cd` into the repo and run `pip3 install --user . --break-system-packages`

## Copying the dotfiles

Once done, you can run the `install.sh` script found in this dotfiles directory and do a reboot after. Then, proceed to the next section.

Once done, you can go ahead and copy the files to their respective directories and do a reboot. Be sure to check out the [some notes](#some-notes) section in this README.

## Setting up VS Code

There's a [Pywal](https://marketplace.visualstudio.com/items?itemName=dlasagno.wal-theme) theme for VS Code. Colors will automatically update as well once you apply the theme.

## Setting up Firefox

If you use Firefox and want to have Pywal colors:

-   Download the theme extension [here.](https://addons.mozilla.org/en-US/firefox/addon/pywalfox/)
-   Run `pywalfox update` in your terminal.

Once done, you don't need to worry about manually updating the colors everytime you change your wallpaper. A script already takes care of that BUT you do need to manually restart Firefox to apply the new colors.

As for the custom CSS, I followed this guide [here](https://www.reddit.com/r/FirefoxCSS/wiki/index/tutorials/). The `userChrome.css` can be found in `.config/firefox/home/style.css`. Be sure to modify line 2 (replace "uiriamu" with your Linux username).

If you want to have the custom Firefox homepage, be sure to modify line 1 in `.config/firefox/home/style.css` (replace "uiriamu" with your Linux username). After that, set your home page in Firefox to a URL directing to the `index.html` file (e.g., file:///home/{yourusername}/.config/firefox/home/index.html)

## Setting up Spotify

-   Open and login with Spotify first.
-   Run these in your terminal:

    ```
    sudo chmod a+wr /opt/spotify
    sudo chmod a+wr /opt/spotify/Apps -R
    ```

-   Once done, initially run `spicetify backup apply` in your terminal.
-   Then you can set the theme by running `spicetify config current_theme Pywal` in your terminal to set the color theme.

Open Spotify and you should be good to go.

Note that you need to restart Spotify everytime the colors are changed. This process will be automatically done if you run Spotify using the `CTRL + Alt + S` keybind that I've set in `hyprland.conf` (you can change this keybind to whatever you want).

## Setting up Discord

Login with Discord first, then run `betterdiscordctl install` in your terminal, that will install Better Discord.

There's a short and easy-to-follow guide for setting up Discord with Pywal [here](https://github.com/FilipLitwora/pywal-discord).

## Credits

I got the waybar setup from [@1amSimp1e's dotfiles](https://github.com/1amSimp1e/dots) and modified them a bit!

## Some notes <a name="some-notes"></a>

-   I don't know about you but in case you're experiencing a super slow reboot or shutdown with this, I followed [this](https://www.reddit.com/r/archlinux/comments/whsqdq/comment/ij9r90h/?utm_source=reddit&utm_medium=web2x&context=3) Reddit comment and it helped! Not really sure why that's happening, though.
-   If you get an error on line 60 of `hyprland.conf` after rebooting saying that colors couldn't be found, be sure to check line 24. Replace "uiriamu" with your Linux username. After that, run `hyprctl reload` in your terminal. Once this is resolved, it shouldn't happen anymore for future reboots.
-   Be sure to customize your sddm conf file in `/lib/sddm/sddm.conf.d/default.conf`. Change your name, fonts, etc. if you want.
-   This repo is also open to forks if you guys want to make changes of your own and take them into your own repository.
-   If you guys have any problems, you can reach me on Reddit [u/rchrdwllm](https://www.reddit.com/user/rchrdwllm), I'll be happy to help!
