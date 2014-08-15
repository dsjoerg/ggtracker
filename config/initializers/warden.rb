# Set up Warden callbacks

# See https://github.com/hassox/warden/wiki/Callbacks
# after_authentication is only called once for each session
Warden::Manager.after_authentication do |user, auth, opts|
  # Trigger syncs for all identities of the user - we can blindfire this
  # Validation of last_scraped_at, validity or queue status happens on esdb

  # TODO: if we want to do this, do it with a background job.. doing it
  # in the request response cycle is stupid.

  # user.accounts.each do |account|
  #   account.sync_identity!
  # end
end

# cache control -- we set a cookie when a user authenticates that will
# force varnish to pass through all requests.

Warden::Manager.after_set_user do |user, auth, opts|
  auth.cookies['cctrl'] = "1"
end

Warden::Manager.before_logout do |user, auth, opts|
  auth.cookies.delete('cctrl')
end