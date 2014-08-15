class ApplicationController < ActionController::Base
  # protect_from_forgery

  before_filter :setup_gon
  before_filter :setup_http_caching
  before_filter :setup_cors

  # Patching current_user to allow sign_in via access_token
  alias_method :_current_user, :current_user
  def current_user
    # access_token and replay sharing protocol are only supported by
    # ReplaysController for now.
    if self.is_a?(ReplaysController)
      # Compatibility with "replay sharing protocol"
      # https://sites.google.com/site/sc2gears/features/replay-sharing
      # Simply overwrite access_token if we find it in one of the parameters
      # that are supported.
      if (params[:userName] && params[:userName].present?) || 
        (params[:password] && params[:password].present?)

        theuser = User.find_by_access_token(params[:userName].strip)
        theuser ||= User.find_by_access_token(params[:password].strip)
        params[:accessToken] = theuser.access_token if theuser
      end

      # If an access_token is passed, the user it belongs to overrides all other
      # means of authentication for now.
      # TODO: it really shouldn't, needs more solid implementation for later.
      if params[:accessToken] && params[:accessToken].present?
        @current_user = User.find_by_access_token(params[:accessToken].strip)
      end
    end

    @current_user ||= warden.authenticate(:scope => :user)
    @current_user
  end

  # Only spring the trap when we're not in dev env
  # Note: if assets aren't precompiled, this will result in a GET /500 due to
  # it not being able to render.
  # unless Rails.application.config.consider_all_requests_local
  unless Rails.env.development?
    rescue_from ActionController::RoutingError, 
      ActionController::UnknownController, 
      ::AbstractController::ActionNotFound, 
      ActiveRecord::RecordNotFound,
      { with: :not_found }
    rescue_from Exception, with: :exception
    rescue_from ESDB::Exception, with: :esdb_exception
  end

  def not_found(exception = nil)
    render 'not_found.html', status: 404, content_type: 'text/html'
  end

  # Catching ESDB::Exception from gg - we can use our layout here, like a 
  # not_found, because it's not a problem with us and be more specific about
  # what happened.
  #
  # The idea here is to not remove the user from the website entirely just
  # because esdb has failed.
  def esdb_exception(exception = nil)
    object_name = case self
      when PlayersController then 'player'
      when MatchesController then 'match'
      else 'data'
    end

    render 'esdb_exception', locals: {exception: exception, object_name: object_name}, status: 500
  end

  # The exception template has a minimal layout for itself to avoid triggering
  # the exception it was rendered for again.
  def exception(exception = nil)
    render 'exception', locals: {exception: exception}, status: 500, layout: false
  end

  def cobrand?
    false
  end

  def superuser?
    current_user.present? && (current_user.id == 2830 || current_user.id == 607)
  end

  private
  
  # Set up variables passed to Gon (into application.html.erb javascript)
  # globally.
  def setup_gon
    gon.user = current_user.to_builder.attributes! if signed_in?

    Gon.global.api_host = GG.config.host;
    Gon.global.replays_bucket = Rails.configuration.s3['replays']['bucket'];
    Gon.global.replays_access_key = Rails.configuration.s3['replays']['access_key_id'];
    Gon.global.blobs_bucket = Rails.configuration.s3['matchblobs']['bucket'];
  end

  # Caching is here only to deal with traffic spikes.
  #
  # In order to cache for longer, we need ESDB to be able to
  # invalidate cached pages in ggtracker.
  #
  def setup_http_caching
    unless signed_in?
      expires_in 1.minute, {public: true} 
    end
  end

  # A hack related to the above:
  # Our varnish configuration strips cookies when we set max-age, which we do
  # on the first response (redirect_to) when a user signs up, because he's not
  # signed in when setup_http_caching is called. But.. who wants to cache
  # redirects?
  def redirect_to(*args)
    headers['Cache-Control'] = 'no-cache'
    super(*args)
  end

  # Bare bones access control, TODO: you know it.
  # There's Rack::Cors and all sorts of stuff that can make this more 
  # streamlined and prettier.
  def setup_cors
    if request.method == :options
      headers['Access-Control-Allow-Origin'] = '*'
      headers['Access-Control-Allow-Methods'] = 'POST, GET, OPTIONS'
      headers['Access-Control-Allow-Headers'] = 'X-Requested-With, X-Prototype-Version'
      headers['Access-Control-Max-Age'] = '1728000'

      render :text => '', :content_type => 'text/plain'
    else
      headers['Access-Control-Allow-Origin'] = '*'
      headers['Access-Control-Allow-Methods'] = 'POST, GET, OPTIONS'
      headers['Access-Control-Max-Age'] = "1728000"
    end
  end
end
