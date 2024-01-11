echo "Installing rchrdwllm's dotfiles..."
echo "Installing base Hyprland packages..."

paru -S wayland libdrm pixman libxkbcommon python libxml2 llvm libpng gegl mtdev xorg-xwayland qt5-wayland qt6-wayland hyprland swww waybar xdg-desktop-portal-wlr wlroots xdg-desktop-portal
paru -S google-chrome discord betterdiscordctl betterdiscord-git telegram-desktop cider visual-studio-code-bin obs-studio vlc

echo "Installing Oh My Zsh..."

sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions

echo "Copying .config and Wallpapers to /home directory..."

cp -r .config $HOME
cp -r Wallpapers $HOME

echo "Successfully copied files!"
echo "Copying SDDM theme to /usr/share/sddm/themes..."
echo "Your password is needed for this one"

sudo cp -r usr/share/sddm/themes/sugar-candy/* /usr/share/sddm/themes/sugar-candy/
sudo cp -r lib/sddm/sddm.conf.d/default.conf /lib/sddm/sddm.conf.d/

echo "Successfully copied SDDM theme!"

echo "Enabling services SDDM and bluetooth services..."

systemctl enable sddm.service
systemctl enable bluetooth.service

echo "Successfully enabled services!"

echo "You can now reboot your system to see changes"
echo "Would you like to reboot now? (y/n)"

read reboot

if [ $reboot = "y" ]; then
    sudo reboot
else
    echo "Alright, you can reboot later by typing 'sudo reboot'"
fi
