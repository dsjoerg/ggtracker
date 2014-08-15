class UsersController < Devise::RegistrationsController
  before_filter :authenticate_user!, :except => [:auth]
  respond_to :html, :json, :xml

  # Overriding devise helpers
  def resource_name
    :user
  end

  # Auth endpoint
  # validates a given access_token by responding with 200/401 status
  def auth
    # I like doing /auth?<token>
    token = params[:access_token] ? params[:access_token] : params.keys.first
    respond_with({status: 'unauthorized'}, :status => 401) and return if !token
    
    @user = User.find_by_access_token(token)
    respond_with({status: 'unauthorized'}, :status => 401) and return if !@user

    respond_with @user
  end

  def dashboard
    # Let the URL be ugly for now - preferable to users being confused on how
    # to share their account page.
    if current_user.present?
      if current_user.primary_account
        redirect_to :controller => 'players', :action => 'show', :id => current_user.primary_account.esdb_id, :name => current_user.primary_account.name
      else
        redirect_to settings_url
      end
    else
      redirect_to :controller => :home, :action => :home
    end
  end

  def update
    current_user.update_attributes(params[:user])
    render :text => "OK"
  end
end
