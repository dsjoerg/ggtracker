class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :token_authenticatable, :confirmable,
  # :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable

  # Setup accessible (or protected) attributes for your model
  attr_accessible :email, :password, :remember_me, :handle, :primary_account_id, :view_mode

  has_many :replays
  has_many :notifications
  has_many :accounts
  has_many :matchnotes

  # Handle (Nickname, Player Tag, ...)
  # validates :handle, :format => {:with => /^[a-z0-9\-\_]+$/i}, :presence => true, :uniqueness => true
  validates :access_token, :uniqueness => true, :presence => true
  
  # Why does devise not validate :email anymore? What did we remove?
  validates :email, :presence => true, :uniqueness => true, :format => {:with => /^([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})$/i}

  # Set a new access token before creating a user
  before_create do
    self.access_token = new_access_token
  end

  after_create do
    WelcomeMailer.welcome_buddy(self).deliver
    self.notify("Welcome!  Please tell us about your Battle.Net Account so we can customize GGTracker for you.")
  end

  # Display Name
  # returns either handle, if set, or the user's email
  def display_name
    if handle.present?
      return handle
    end
    if primary_account_id.present?
      primary_account = Account.first(:conditions => {:id => primary_account_id})
      if primary_account.present?
        return primary_account.name
      end
    end
    if accounts.count == 1
      return accounts.first.name
    end
    return email
  end

  # Reset access_token
  # I wanted to keep the hash small but alphanumeric, so we're doing this:
  # a base 36 of the crc32 of user.id + user.encrypted_password + rand
  # If we don't necessarily care (the user will copy/paste anyway), we should
  # just change this to a MD5 of various user data including password.
  def new_access_token
    Zlib::crc32(id.to_s + encrypted_password + rand(Time.now.to_i).to_s).to_s(36)
  end

  def reset_access_token!
    new_token = new_access_token
    update_attribute(:access_token, new_token)
    return new_token
  end

  # Access token accessor
  def access_token
    read_attribute(:access_token) || (!new_record? ? reset_access_token! : new_access_token)
  end

  def pro?
    prolevel.present? && prolevel > 0 && (pro_cancelled_at.nil? || (Time.now - pro_cancelled_at) < 1.month)
  end
  
  # Provides a permanent channel name for Juggernaut communication
  # TODO: make it more complicated, maybe :)
  def channel
    Digest::MD5.hexdigest(self.id.to_s)
  end

  def replay_channel
    Digest::MD5.hexdigest(self.id.to_s + "/replays")
  end
  
  # Publishes to the users Juggernaut channel
  def publish(message)
    Juggernaut.publish(channel, message)
  end
  
  # Publishes the entire User object, including replays and possibly other
  # relevant assocations.
  def publish!
    # publish(JSON.parse(self.to_json(include: [:accounts, :replays, :notifications]))) # HAX
    publish(to_builder.attributes!)
  end

  # Notifications
  
  # Does the user have any unacked notifications?
  # Note: #unacked is the default scope of Notification right now
  def has_notifications?
    notifications.any?
  end
  
  def notify(options)
    options = {:message => options} if options.is_a?(String)
    notifications.create(options)
  end

  def ack_all_notifications!
    notifications.each{|n| n.ack!}
  end

  def primary_account
    if primary_account_id.present?
      Account.find(primary_account_id)
    else
      accounts.any? ? accounts.first : nil
    end
  end

  def name_for_public
    if primary_account.present?
      primary_account.name
    else
      "User #{id}"
    end
  end

  # Return Jbuilder for serialization
  def to_builder(builder = nil)
    builder ||= Jbuilder.new
    builder.(self, :id, :email, :password, :remember_me, :handle, :prolevel, :primary_account_id, :view_mode)
    builder.pro(self.pro?)

    # Assocations.
    # I tried doing a nice send(), but Jbuilder freaks out for some reason.
    builder.accounts(accounts) {|json, account| account.to_builder(json)}
    builder.notifications(notifications) {|json, notification| notification.to_builder(json)}

    builder
  end
end
