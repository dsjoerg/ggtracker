# In config/initializers/rack-attack.rb
class Rack::Attack

  throttle('req/ip', :limit => 300, :period => 5.minutes) do |req|
    req.ip # unless req.path.starts_with?('/assets')
  end


end

Rack::Attack.blacklist('block 98.163.122.235') do |req|
  '98.163.122.235' == req.ip
end
