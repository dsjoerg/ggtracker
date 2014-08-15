# Replay class
#
# TODO: we're using strings for state and stage currently, and we know I have
# an aversion to that. Could use all kinds of refactoring too.
#
# Stage: the stage of processing the replay is in. Possible values currently:
#
# * upload (replay is being uploaded, or done uploading)
# * parsing (replay is being processed, or waiting to be processed by esdb)
#
# State: the state of the replay, in it's current stage:
#
# * empty, unknown
# * working (processing, uploading..)
# * success (done successfully)
# * error (done unsuccessfully)
#
# time field semantics:
#
# replay_updated_at  <-- if POSTed to /replays/drop, this will be the time at which the file was saved via paperclip.
# created_at <-- when the row was created
# updated_at <-- last time the row was changed
#

class Replay < ActiveRecord::Base
  attr_accessible :replay, :progress, :status, :user_id, :user, :stage, :state, :esdb_id, :channel, :replay_file_name, :md5
  attr_accessor :match_id, :ident_ids

  # The state machine controls the state and gives us callbacks for state
  # transitions.
  #
  # Note: events create bang methods (#event!) that will transition the state
  # as defined and fire callbacks we define. Any direct change on the state
  # column will also fire events and callbacks!
  include AASM
  aasm :column => :state do
    state :uploading, :initial => true
    state :processing
    state :done
    state :failed
    
    event :uploaded, :after => :after_uploading do
      transitions :to => :processing, :from => [:new, :uploading]
    end

    event :processed, :after => :after_processing do
      transitions :to => :done, :from => [:processing]
    end
    
    event :failure, :after => :after_the_fail do
      transitions :to => :failed, :from => [:uploading, :processing]
    end
  end

  # This callback fires after transitioning to :processing state
  def after_uploading
    update_attribute(:progress, 0)
    publish_progress!
  end

  # This callback fires after transitioning out of the :processing state
  def after_processing
    update_attribute(:progress, 0)
    publish_progress!
  end

  def after_the_fail
    if id % 10 == 0
      ten_fails_ago_id = Replay.where(:state => 'failed').order("id desc").limit(10).select("id").last.id
      fail_id_delta = id - ten_fails_ago_id
      # (used to email DJ when fail_id_delta was less than twenty, meaning failure rate > 50%)
    end
    publish_progress!
  end

  scope :processing, where(:state => :processing)
  scope :not_done, where(:state => [:uploading, :processing])
  scope :recent, lambda{ where(['created_at > ?', 24.hours.ago]) }

  def progress
    return 0 if ['uploading'].include?(state)
    return 100 if ['failed', 'done'].include?(state)
    return read_attribute(:progress)
  end

  # we use filenames to keep replay state consistent between the frontend and the server.
  # so its important that paperclip doesnt try to get smart on us and change the filename.
  #
  # http://stackoverflow.com/questions/10520674/paperclip-how-to-control-which-characters-are-escaped-changed-to-an-underscore
  # http://stackoverflow.com/questions/940822/regular-expression-syntax-for-match-nothing

  # leaving this here for legacy replays, so we can get the file if needed.
  # silly really.
  has_attached_file :replay,
    :storage => :aws,
    :restricted_characters => /a^/,
    :s3_credentials => {
      :access_key_id => Rails.configuration.s3['replays']['access_key_id'],
      :secret_access_key => Rails.configuration.s3['replays']['secret_access_key'],
      :endpoint => Rails.configuration.s3['replays']['endpoint']
    },
    :s3_bucket => Rails.configuration.s3['replays']['bucket'],
    :s3_protocol => 'http',
    :s3_permissions => :public_read,
    :s3_host_alias => Rails.configuration.s3['replays']['s3_host_alias'],
    :path => ":content_hash.SC2Replay"
  
  validates_attachment :replay, 
    :presence => true, 
    :size => {:in => 0..20.megabytes}

  do_not_validate_attachment_file_type :replay

  belongs_to :user

  def publish_progress!
    _channel = user ? user.replay_channel : channel
    Juggernaut.publish(_channel, to_builder.attributes!) if _channel
  end

  # Note on esdb_id:
  #
  # We store either the direct ID of the Replay or the job ID in it.
  # Depending on which it is, we know if the Replay is processed or not.

  def processing?
    esdb_id.to_i.to_s == esdb_id
  end

  # Attempts to post the replay file to esdb and retrieve either the replay
  # or a processing job ID to track it from.
  def process!(ggtracker_received_at)
    response = ESDB::Replay.upload(md5, channel, ggtracker_received_at)

    if response.is_a?(String)
      update_attribute(:esdb_id, response)

      # Transition to :processing
      uploaded!
    end

  rescue Exception => e
    Rails.logger.warn("Upload to ESDB has failed for replay #{id}: #{e.inspect}")
    failure!
  end

  # Return Jbuilder for serialization
  def to_builder(builder = nil)
    builder ||= Jbuilder.new
    builder.(self, :id, :progress, :status, :user_id, :replay_file_name,
            :replay_file_size, :esdb_id, :state, :stage, :match_id, :ident_ids)
    builder.file(replay.url)
    builder
  end
end
