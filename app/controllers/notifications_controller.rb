class NotificationsController < ApplicationController
  # Acknowledge a notification for a user - needs to be logged in as the
  # User who owns it.
  def ack
    # Using find_by_id to not trigger ActiveRecord::RecordNotFound
    @notification = current_user.notifications.find_by_id(params[:id])
    @notification.ack! if @notification

    respond_to do |format|
      format.json { render :text => {:status => 'OK'}.to_json }
      format.html { redirect_to :back }
    end
  end
end
