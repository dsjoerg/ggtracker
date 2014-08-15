class Notification < ActiveRecord::Base
  attr_accessible :title, :message, :notification_type, :ack_at, :user_id

  belongs_to :user

  scope :unacked, :conditions => {:ack_at => nil}, :order => 'created_at DESC'
  default_scope unacked

  validates :user, :presence => true

  # Calls #publish! on the user after creation to push to the frontend
  after_create :publish!
  def publish!
    user.publish!
  end

  # Acknowledge the notification, do not display again
  # Note: later on, we'll likely have a list of old notifications somewhere
  # obviously it should be displayed there then.
  def ack!
    update_attribute(:ack_at, Time.now)
  end

  def ack?
    ack_at ? true : false
  end
  
  # Default type to 'info' for now
  def notification_type
    read_attribute(:notification_type) || 'info'
  end

  # Return Jbuilder for serialization
  def to_builder(builder = nil)
    builder ||= Jbuilder.new
    builder.(self, :id, :title, :message, :notification_type, :ack_at, :user_id)
    builder
  end
end
