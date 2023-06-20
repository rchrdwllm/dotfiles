echo "Installing rchrdwllm's dotfiles..."
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