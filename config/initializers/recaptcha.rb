Recaptcha.configure do |config|
  config.public_key  = '6Lc35yoUAAAAACUODLMbUxj4pC7NfUt5s-i76Z7D'
  config.private_key = Rails.application.secret('recaptcha_secret')
end
