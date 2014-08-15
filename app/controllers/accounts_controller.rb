class AccountsController < ApplicationController
  before_filter :authenticate_user!

  respond_to :json, :html

  def update
    params[:account].reject!{|k,v| strip_attributes.include?(k.to_sym)}

    @account = current_user.accounts.find(params[:id])

    @account.update_attributes(params[:account])

    # TODO: move to resque job, of course.
    # Also, for now we rescrape on every update to demonstrate authentication,
    # later on this will be a separate call.
    @account.sync_identity! # if @account.last_changes.keys.include?('profile_url')
    
    respond_with @account
  end

  def create
    params[:account].reject!{|k,v| strip_attributes.include?(k.to_sym)}

    @account = current_user.accounts.build(params[:account])
    @account.save

    # TODO: move to resque job, of course.
    @account.sync_identity!
    
    respond_with @account
  end

  def destroy

    @account = current_user.accounts.find(params[:id])

    if current_user.primary_account_id == @account.id
      current_user.primary_account_id = nil
      current_user.save
    end

    @account.destroy

    respond_with "OK"
  end

  def destroy_all_matches
    authenticate_user!

    not_found and return if !current_user

    account = current_user.accounts.find(params[:id])
    not_found and return if !account
    not_found and return if !account.authenticated?

    identity = ESDB::Identity.find(account.esdb_id)
    response = identity.destroy_all_matches
    if response['status'] == 'success'
      render :text => "OK", :status => 200
    else
      render :text => "Not OK", :status => 500
    end
  end

  private
  
  # A quick list of attributes to strip for incoming create/update calls
  # Some of these are for presentation, virtual, etc.
  # TODO: due to how we $save from Angular, find a way to do this generically
  def strip_attributes
    [:portrait_css, :expected_portrait_css, :authenticated, :synced, :checked, :sc2ranks_url, :identity_id]
  end
end
