# TODO: later on, there will be a real API key and a real authorization check
# but for now, we send a random string that esdb recognizes our provider by

ESDB.api_key = Rails.application.secret('esdb')['api_key']
GG.config.host = Rails.application.secret('esdb')['host']

# Override the api host by setting ESDB_HOST
# ESDB_HOST=192.168.2.102:9292 foreman start web
GG.config.host = ENV['ESDB_HOST'] if ENV['ESDB_HOST']
