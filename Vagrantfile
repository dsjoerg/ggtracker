Vagrant.configure("2") do |config|
  config.vm.box = "ubuntu/trusty64"
  config.vm.network :private_network, type: "dhcp"
  config.vm.hostname = "ggtracker"

  config.vm.provision "shell", path: "setup-vagrantbox.sh"

  config.vm.provider :virtualbox do |vb|
    vb.memory = 1536
    vb.cpus = 2
    vb.name = "ggtracker"
  end
end
