# http://help.airbrake.io/kb/api-2/deploy-tracking

notify_deploy_environments = %w(staging production integration)
notify_deploy_roles        = %w(solo app_master)

# Hide from the robots unless we're in production environment
# TODO: it should be behind a basic auth too, later on.
if config.environment != 'production'
  f = File.open("#{config.release_path}/public/robots.txt", 'w')
  f.write(<<-EOF
User-Agent: *
Disallow: /
  EOF
  )
  f.close()
end

if ['solo','app_master', 'app'].include?(current_role)
  $stderr.puts "purging varnish on #{config.environment} #{config.current_role}"
  run "varnishadm -T 127.0.0.1:6082 purge.url ."
end
