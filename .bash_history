nmtui
clear
sudo pacman -S os-prober
clear
sudo os-prober
clear
lsblk
sudo mkdir /mnt/win11
sudo mount /dev/nvme0n1p1 /mnt/win11
sudo os-prober
sudo grub-mkconfig -o /boot/grub/grub.cfg
sudo nvim /etc/default/grub
:q
clear
sudo grub-mkconfig -o /boot/grub/grub.cfg
clear
reboot
sudo pacman -Sy wayland libdrm pixman libxkbcommon python libxml2 llvm libpng gegl mtdev xorg-wayland qt5-wayland qt6-wayland
sudo pacman -Sy wayland libdrm pixman libxkbcommon python libxml2 llvm libpng gegl mtdev xorg-xwayland qt5-wayland qt6-wayland
ls
clear
cd home
clear
mkdir Downloads
mkdir Downloads/Programs
cd Downloads/Programs
git clone https://aur.archlinux.org/paru-bin.git
cd paru-bin
makepkg -si
sudo pacman -Syu
paru -Syu
paru -S hyprland waybar xdg-desktop-portal-wlr wlroots xdg-desktop-portal polkit-kde-agent kitty pcmanfm-qt gedit
paru -S brightnessctl pavucontrol alsa-utils grim slurp mpv vvave nm-applet python-pywall rofi blueberry bluez bluez-utils ranger ts-node zsh ttf-jetbrains-mono ttf-jetbrains-mono-nerd inotify-tools sddm-sugar-candy-git thunar playerctl pamixer whitesur-icon-theme-git whitesur-cursor-theme-git
paru -S python-pywal network-manager-applet
paru -S google-chrome discord betterdiscordctl betterdiscord-git telegram-desktop spotify visual-studio-code-bin nodejs-nativefier cava tty-clock pipes.sh
clear
sddm
systemctl enable sddm.service
paru -S sddm
systemctl enable sddm.service
clear
reboot
zsh
google-chrome-stable
paru -S zsh-theme-powerlevel10k-git
ranger
