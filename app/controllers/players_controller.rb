class PlayersController < ApplicationController
  def show

    @identity = ESDB::Identity.find(params[:id])
    not_found and return if !@identity

    escaped_name = nil
    escaped_name = CGI.escape params[:name] unless params[:name].nil?

    # Was someone a naughty boy or girl and mess up the name?
    redirect_to :action => 'show', :id => params[:id], :name => @identity.name unless ( @identity.name == params[:name] || @identity.name == escaped_name )

    @prolevel = 0
    account = Account.find_by_esdb_id(@identity.id)
    if account.present?
      # Is the user a pro user?
      if account.user.pro?
        @prolevel = account.user.prolevel
      end
    end

    gon.identity = @identity.to_hash
  end

  def give_one_month_ggtracker_pro
    not_found and return if !superuser?

    account = Account.find_by_esdb_id(params[:id])
    user = account.user
    not_found and return if user.prolevel.present?
    user.prolevel = 1
    user.pro_cancelled_at = Time.now
    user.save!
    
    redirect_to action: :show
  end

  def index
  end
end
