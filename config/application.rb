require File.expand_path('../boot', __FILE__)
Dir['lib/patch/*.rb'].each {|file| require File.expand_path(file) }

require 'rails/all'

if defined?(Bundler)
  # If you precompile assets before deploying to production, use this line
  Bundler.require(*Rails.groups(:assets => %w(development test)))
  # If you want your assets lazily compiled in production, use this line
  # Bundler.require(:default, :assets, Rails.env)
end

module Ggtracker
  class Application < Rails::Application
    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.

    # Custom directories with classes and modules you want to be autoloadable.
    # config.autoload_paths += %W(#{config.root}/extras)

    # Only load the plugins named here, in the order given (default is alphabetical).
    # :all can be used as a placeholder for all plugins not explicitly named.
    # config.plugins = [ :exception_notification, :ssl_requirement, :all ]

    # Activate observers that should always be running.
    # config.active_record.observers = :cacher, :garbage_collector, :forum_observer

    # Set Time.zone default to the specified zone and make Active Record auto-convert to this zone.
    # Run "rake -D time" for a list of tasks for finding time zone names. Default is UTC.
    # config.time_zone = 'Central Time (US & Canada)'

    # The default locale is :en and all translations from config/locales/*.rb,yml are auto loaded.
    # config.i18n.load_path += Dir[Rails.root.join('my', 'locales', '*.{rb,yml}').to_s]
    # config.i18n.default_locale = :de

    def secret(key)
      @@secrets ||= YAML.load(ERB.new(File.read("#{Rails.root}/config/secrets.yml")).result)[Rails.env]
      @@secrets[key]
    end

    # Configure the default encoding used in templates for Ruby 1.9.
    config.encoding = "utf-8"

    # Configure sensitive parameters which will be filtered from the log file.
    config.filter_parameters += [:password, :fileContent]

    # Enable escaping HTML in JSON.
    config.active_support.escape_html_entities_in_json = true

    # Use SQL instead of Active Record's schema dumper when creating the database.
    # This is necessary if your schema can't be completely dumped by the schema dumper,
    # like if you have constraints or database-specific column types
    # config.active_record.schema_format = :sql

    # Enforce whitelist mode for mass assignment.
    # This will create an empty whitelist of attributes available for mass-assignment for all models
    # in your app. As such, your models will need to explicitly whitelist or blacklist accessible
    # parameters by using an attr_accessible or attr_protected declaration.
    config.active_record.whitelist_attributes = true

    # set the default url options for ActionMailer
    # obviously, this will produce links that don't work in development, but..
    # really.
    config.action_mailer.default_url_options = { :host => 'ggtracker.com' }

    # ActionMailer smtp setup
    config.action_mailer.smtp_settings = {
      :address => 'smtp.postmarkapp.com',
      :domain => 'ggtracker.com',
      :user_name => secret('smtp_user_name'),
      :password => secret('smtp_password')
    }

    # Enable the asset pipeline
    config.assets.enabled = true
    config.assets.precompile += ['print.css', 'gg.css', 'gg.js', 'wcs_gg.css', 'wcs.css']

    # Version of your assets, change this if you want to expire all your assets
    config.assets.version = '1.0'

    # S3 configuration from config/s3.yml
    config.s3 = YAML.load(ERB.new(File.read("#{Rails.root}/config/s3.yml")).result)[Rails.env]
    config.s3['matchblobs']['bucket'] = ENV['ESDB_MATCHBLOBS_BUCKET'] if ENV['ESDB_MATCHBLOBS_BUCKET']
    
    config.generators do |g|
      # We disable all automatic spec generation because it's annoying behavior
      # use `rails g rspec:<type> <name>` (see `rails g`) to generate them
      # manually.
      g.test_framework :rspec, :view_specs => false, 
                       :controller_specs => false, :helper_specs => false, 
                       :routing_specs => false, :fixtures => false

      # And we also disable stylesheet/asset generators, because those are even
      # more annoying. Reason being that we don't use Rails' typical structure
      # 98% of the time here (and we rarely use helpers)
      g.stylesheets = false
      g.javascripts = false
      g.assets = false
      g.helper = false
    end

    # Why is this on by default?
    # It's not.. in the future: https://github.com/rails/rails/pull/7838
    config.action_dispatch.rack_cache = false

    # SSL is good?
    # but first we need to figure out how to serve SSL assets out of CDN or something
    #    config.force_ssl = true

    ActiveMerchant::Billing::Base.mode = :test
    ::GATEWAY = ActiveMerchant::Billing::PaypalGateway.new(
      :login => secret('paypal')['login'],
      :password => secret('paypal')['password'],
      :signature => secret('paypal')['signature']
    )
  end
end
