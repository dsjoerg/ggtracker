source 'https://rubygems.org'
ruby '1.9.3'

gem 'rails', '3.2.21'

# Bundle edge Rails instead:
# gem 'rails', :git => 'git://github.com/rails/rails.git'

gem 'mysql2'

gem 'unicorn', '1.1.5'

# Gems used only for assets and not required
# in production environments by default.
group :assets do
  gem 'sass-rails',   '~> 3.2.3'
  gem 'coffee-rails', '~> 3.2.1'

  # See https://github.com/sstephenson/execjs#readme for more supported runtimes
  # gem 'therubyracer', :platforms => :ruby

  gem 'uglifier', '>= 1.0.3'

  # EJS to render out jst.ejs templates, even though we're not actually using
  # it's syntax..
  gem 'ejs'
end

# Testing!
group :test do
  gem 'rspec'
  gem 'rspec-rails'

  # Used this for years - it's a thoughtbot gem. I love these guys.
  # https://github.com/thoughtbot/factory_girl
  gem "factory_girl_rails", "~> 4.0"
  
  # Generates random data :)
  # http://rubydoc.info/github/stympy/faker/master/frames
  gem 'faker'
  
  gem 'simplecov', :require => false
end

group :development do
  gem 'better_errors'
  gem 'binding_of_caller'
  gem 'rails-dev-boost', :git => 'git://github.com/thedarkone/rails-dev-boost.git'
  gem 'net-http-spy'
end

# For convenience ..
# gem 'twitter-bootstrap-rails', :git => 'git://github.com/seyhunak/twitter-bootstrap-rails.git'

# This belongs to the rails team.. I forgot that, so it's cool and should stay
gem 'jquery-rails'
gem 'compass', :git => 'git://github.com/chriseppstein/compass.git' # Go Edge!
gem 'compass-rails', :git => 'git://github.com/Compass/compass-rails.git'

# To use ActiveModel has_secure_password
# gem 'bcrypt-ruby', '~> 3.0.0'

# To use Jbuilder templates for JSON
# gem 'jbuilder'

# Use unicorn as the app server
# gem 'unicorn'

# Deploy with Capistrano
# gem 'capistrano'

# To use debugger
# gem 'debugger'

# GG!
# Don't commit the :path!

gem 'gg', :git => 'git@github.com:dsjoerg/gg.git'
# gem 'gg', :path => '/Users/mr/dev/ruby/gems/gg'
#gem 'gg', :path => '/Users/david/Dropbox/Programming/gg'

# Paperclip for all file attachment needs, including Replay storage
gem 'paperclip'

# Might want to consider to add support for Appoxys AWS Gem to Paperclip
# see https://github.com/appoxy/aws and https://github.com/thoughtbot/paperclip/issues/428
# for now, we'll use https://github.com/igor-alexandrov/paperclip-aws
gem 'paperclip-aws'

# Job queue.
gem 'resque'

# Juggernaut socket server: https://github.com/maccman/juggernaut
# There are other options, like Socky, but I do love the simplicity
# and "it just works" of Juggernaut (also, it's the oldest/most maintained)
gem 'juggernaut'

# Authentication!
gem 'devise'

# An easy and popular gem to pass ruby variables to javascript
# see https://github.com/gazay/gon
gem 'gon'

# AgoraGames' Battle.net Scraper - they have some solid basic gems for purposes
# like these. Depending on how well they support it, we should eventually just
# create our own (it's a simple Nokogiri based scraper..)

# Forked it and added portraits to profile scraping
gem 'bnet_scraper', :git => 'git@github.com:ggtracker/bnet_scraper.git', :ref => 'battlenetify'
#gem 'bnet_scraper', :path => '/Users/david/Dropbox/Programming/bnet_scraper/'


# Again, as in esdb, due to the lack of alternatives I've picked JBuilder for
# JSON serialization now, but I still have some sore memories using it.
# We'll address them once we get there (regarding performance)
gem 'jbuilder'

# We seem to have lost the Builder gem?
gem 'builder'

# Man, am I glad that this is being maintained..
# I used it back in the Rails2 days. Likely to be the most solid state machine
# gem in existence.
gem 'aasm'

# Formtastic helps a lot with generating forms
gem 'formtastic'

# EY config lets us use newrelic properly
gem 'ey_config'
gem 'newrelic_rpm'

# https://github.com/cldwalker/hirb
gem 'hirb'

# curl bindings
gem 'curb'

# ha aws-s3 and aws-sdk conflict OF COURSE
#
#gem 'aws-s3'

gem 'activemerchant'
