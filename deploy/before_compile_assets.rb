$stderr.puts "copying secrets to release directory"

run "cp /home/deploy/config/* #{config.release_path}/config"
