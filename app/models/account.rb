# Account is exclusively SC2 right now and attributes are named accordingly
# but if we ever support anything else, we'll generalize it.
class Account < ActiveRecord::Base
  LEAGUES = [:bronze, :silver, :gold, :platinum, :diamond, :master, :grandmaster]
  # The fact that we have it disabled here but not in Replay is funny, imo :)
  attr_protected false

  include AASM
  aasm :column => :state do
    state :new, :initial => true
    # It's in queued state if ESDB has the identity for this account queued
    # it may get stuck in this state, if either the callback never arrives
    # that clears it, or the job never runs.
    # TODO: pruning, cleaning jobs. really.
    state :queued

    state :unauthed
    state :authed

    event :unauth, :after => :publish! do
      transitions :to => :unauthed, :from => [:new, :queued] # from all
    end
    
    # This can not transition from :new because ..it should never
    # happen. If the expected portrait matches right away, we've done something
    # terribly wrong.
    event :auth, :after => :publish! do
      transitions :to => :authed, :from => [:unauthed, :queued]
    end

    event :queued, :after => :publish! do
      transitions :to => :queued, :from => [:new, :unauthed] # from all
      transitions :to => :authed, :from => [:authed] # from all
    end
  end

  # This callback fires after transitioning to :processing state
  def after_uploading
    # user.notify('Replay successfully uploaded.') if user
    update_attribute(:progress, 0)
    publish_progress!
  end


  belongs_to :user
  default_scope order('created_at DESC')
  
  validates :profile_url, :format => {:with => URI::regexp(%w(http https))}

  # A quick method to persist changes after a save for checks in 
  # AccountsController.
  attr_accessor :last_changes
  after_save :keep_changes
  def keep_changes
    @last_changes = changes
  end
  
  def last_changes
    @last_changes || {}
  end
  
  # We sync this account to an ESDB::Sc2::Identity, User to a 
  # ESDB::Provider::Identity. 
  #
  # On a first sync, when the identity doesn't exist, we will of course
  # retrieve an empty object - esdb will send an identity_update callback
  # when it has updates for an identity.
  #
  # This callback is caught in esdb_controller and triggers a #update_from_esdb
  # call on this identity with the data it has received.
  def sync_identity!
    return false if !profile_url || !URI::regexp(%w(http https)).match(profile_url)

    begin

      # The force parameter forces a critical priority rescrape of the identity
      # in esdb.
      attrs = {:profile_url => profile_url, :force => true}

      identity = ESDB::Identity.sync(attrs)
    rescue Exception => e
      # TODO: Airbrake it, put it in gg? Do something!
      # The rescue is here for now because we don't want the login to fail if
      # esdb can't be reached by gg for whatever reason.
      Rails.logger.warn 'ESDB seems to be down!'
      return false
    end

    # return false
    # 
    # 
    # scraper = BnetScraper::Starcraft2::ProfileScraper.new(:url => profile_url)
    # scraper.scrape
    # puts scraper.inspect
    
    update_from_esdb!(identity)
  end

  # Updates this account with info coming from esdb with no request or queueing
  # logic. If given a hash, it'll create an ESDB::Identity object from it.
  def update_from_esdb!(identity)
    identity = ESDB::Identity.from_hash(identity) if identity.is_a?(Hash)
    return false if !identity.is_a?(ESDB::Identity)

    update_attributes({
      :esdb_id              => identity.id,

      # Relax, we're only using it to generate sc2ranks_url
      :bnet_id              => identity.bnet_id,
      :gateway              => identity.gateway,
      :name                 => identity.name,
      
      :most_played_race     => identity.most_played_race,
      
      :highest_league       => identity.highest_league_1v1,
      :current_league       => identity.current_league_1v1,

      :achievement_points   => identity.achievement_points,
      :season_games         => identity.season_games,
      :career_games         => identity.career_games,
      
      :portrait             => identity.portrait,
      
      :last_synced_at       => Time.now,

      # Note: updated_at is currently the value of last_scraped_at on esdb
      # this may change (see Identity on ESDB)
      :last_scraped_at      => identity.updated_at
    })

    save!

    if identity.queued === true || identity.queued === 'true'
      queued! unless queued?
    else
      # Set expected portrait to authenticate ownership, or confirm 
      # authentication if portraits match.
      unless authenticated?
        # Portraits match - identity has been authenticated!
        if portrait && portrait == expected_portrait
          update_attribute(:authenticated_at, Time.now)

          unless state == 'authed'
            auth!
            user.ack_all_notifications!
            user.notify("You're all set.  Next, upload some replays.")
          end
        else
          set_expected_portrait!

          unless state == 'unauthed'
            unauth!
            user.ack_all_notifications!
            user.notify("OK!  To verify your Battle.Net Account, please click the AUTHENTICATE button below.  We need to be sure it's really your account!")
          end
        end
      end
    end

    # Push to the frontend via user
    # publish!
  end

  def publish!
    user.publish! if user
  end

  def queued?
    state == 'queued'
  end

  # Has the account been authenticated?
  def authenticated?
    authenticated_at ? true : false
  end

  # Has the account been sync'd?
  def synced?
    last_synced_at ? true : false
  end

  # Has the account been scraped?
  def scraped?
    last_scraped_at ? true : false
  end

# 20121230 thought I needed this, then I didnt
#
#  def primary?
#    user.primary_account == self
#  end

  # After first scraping of an account, we set a random portrait from the ones
  # freely available to anyone and tell the user to change to this portrait.
  # We then rescrape the account until it matches, indicating authentication
  # of ownership on the account.
  def set_expected_portrait!
    # I don't think we want to change the expected portrait on every sync.
    return false if !portrait.present? || expected_portrait.present?

    # Every new account has at least these four basic portraits available
    # TODO: add retrieval of all portraits available to bnet_scraper to have
    # more alternatives?
    basic_portraits = ['Kachinsky', 'Cade', 'Thatcher', 'Hall']
    basic_portraits.delete(portrait)

    update_attribute(:expected_portrait, basic_portraits[rand(basic_portraits.length-1)])
  end

  # Yes, it's presentation in a model, I'm sorry. The way we currently work,
  # we need this in the objects attributes for the frontend.
  def portrait_css(expected = false, size = 75)
    _portrait = expected ? expected_portrait : portrait
    return 'display: none;' if !_portrait || _portrait.blank?
    portrait_position = BnetScraper::Starcraft2.portrait_position(_portrait)
    if portrait_position.present?
      "background: url('/assets/sc2/portraits/#{portrait_position[0]}-#{size}.jpg') -#{portrait_position[1]*size}px -#{portrait_position[2]*size}px no-repeat;"
    else
      nil
    end
  end

  def league_index(league_name)
    LEAGUES.index(league_name.to_s.downcase.to_sym)
  end

  # Some quick regex to get bnet_id and name even if we're not synced but have
  # a profile_url.
  def gateway
    return read_attribute(:gateway) if read_attribute(:gateway)
    profile_url.to_s.scan(/http:\/\/(\w+?)\./).flatten.join
  end

  def bnet_id
    return read_attribute(:bnet_id) if read_attribute(:bnet_id)
    profile_url.to_s.scan(/profile\/(\d+)/).flatten.join
  end

  def name
    return read_attribute(:name) if read_attribute(:name)
    profile_url.to_s.scan(/profile\/\d+\/(\w+)/).flatten.join
  end

  def sc2ranks_url
    "http://sc2ranks.com/#{gateway}/#{bnet_id}/#{name}"
  end

  # URL
  # imho, all objects should have a function like this. I always prefered this
  # approach over routes for simple stuff.
  def url
    esdb_id.present? ? "/players/#{esdb_id}/#{name}" : ''
  end

  def destroy_all_matches!
    ident = ESDB::Identity.find(params[:id])
    not_found and return if !ident

    response = @match.userdelete(current_user.id)

  end

  # Return Jbuilder for serialization
  def to_builder(builder = nil)
    builder ||= Jbuilder.new

    builder.(self, :id, :profile_url, :character_code)

    # Battle.net Attributes
    builder.(self, :gateway, :name, :most_played_race, :highest_league, 
            :highest_team_league, :current_league, :current_team_league, 
            :achievement_points, :season_games, :career_games, :portrait,
            :authenticated_at, :sc2ranks_url)

    builder.authenticated authenticated?
#    builder.primary primary?
    builder.synced synced?

    # Note: again, I'm attempting to not use "scraping" on public interfaces.
    builder.checked scraped?

    builder.state state
    builder.identity_id esdb_id

    builder.name name
    builder.portrait_css(portrait_css)
    builder.expected_portrait_css(portrait_css(true))
    builder
  end
end
