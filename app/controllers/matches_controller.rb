class MatchesController < ApplicationController
  def show
    @match = ESDB::Match.find(params[:id])

    not_found and return if !@match

    blob_url = "https://#{Rails.configuration.s3['matchblobs']['bucket']}.s3.amazonaws.com/#{@match.id}"
    begin
      blob_response = Curl.get(blob_url)
    rescue Exception => e
      # sometimes there are random problems retrieving from S3. we
      # dont need to hear about each one.
      # TODO complain if there are too many consecutive failures
    end

    # trying to deal better with nonsense like this: https://www.exceptional.io/exceptions/118713598
    if !@match.ended_at
      # TODO report this to a human or not?  This is bad, but it can
      # also happen if ESDB is temporarily down.
      not_found and return
    end

    # If the match was requested via a md5 (as given out by sc2gears) redirect
    # to the correct URL if it is found or display "we're still processing" 
    # message otherwise
    unless params[:id].to_i.to_s == params[:id]
      redirect_to(match_url(@match.id), status: 302) and return if @match # Moved!
      render 'processing' and return
    end

# How to do next/prev?!
#
#
# if any of
# match.entities.identity.id
# match any of
# current_user.accounts.esdb_id
# 
# and there is only one match, then we are in business!
# 
# then the prev match can be:
# ggtracker.com/matches/prev?identity=<esdb_identity_id>&match=<esdb_match_id>
# ggtracker.com/matches/next?identity=<esdb_identity_id>&match=<esdb_match_id>
# api.esdb.net/api/v1/matches/prev?identity=<esdb_identity_id>&match=<esdb_match_id>
# api.esdb.net/api/v1/matches/next?identity=<esdb_identity_id>&match=<esdb_match_id>
#
#

    gon.match = @match.to_hash
    if blob_response && blob_response.status[0] == '2'
      gon.matchblob = blob_response.body_str
#    else
#      Rails.logger.warn("Got blob response status #{blob_response.status} for match #{@match.id}")
    end
  end

  def index
  end

  def search
  end

  def userdelete
    authenticate_user!
    @match = ESDB::Match.find(params[:id])
    not_found and return if !@match
    not_found and return if !can_delete(@match)

    response = @match.userdelete(current_user.id)
    if response['status'] == 'success'
      render :text => "OK", :status => 200
    else
      render :text => "Not OK", :status => 500
    end
  end

  def can_delete(match)
    if !current_user
      return false
    end
    if current_user.id == 2830
      return true
    end
    idents_in_match = match.entities.collect { |entity| entity['identity']['id'].to_i }
    my_match = current_user.accounts.any? { |account| account.state == 'authed' && idents_in_match.include?(account.esdb_id) }
    return my_match
  end

  def show_delete_link?
    can_delete(@match)
  end

  def replay
    @match = ESDB::Match.find(params[:id])
    replay = @match.replays.first

    bucketname = Rails.configuration.s3['replays']['bucket']
    s3_filename = "#{replay.md5}.SC2Replay"
    replay_url = "https://#{bucketname}.s3.amazonaws.com/#{s3_filename}"
    replay_response = Curl.get(replay_url)
    if replay_response.status[0] == '2'
      user_filename = "ggtracker_#{@match.id}.SC2Replay"
      send_data(replay_response.body_str, :filename => user_filename)
    end
  end

  def wcsmatch
    @match = ESDB::Match.find(1464)

    blob_url = "https://#{Rails.configuration.s3['matchblobs']['bucket']}.s3.amazonaws.com/#{@match.id}"
    begin
      blob_response = Curl.get(blob_url)
    rescue Exception => e
      # sometimes there are random problems retrieving from S3. we
      # dont need to hear about each one.
      # TODO complain if there are too many consecutive failures
    end

    gon.match = @match.to_hash
    if blob_response && blob_response.status[0] == '2'
      gon.matchblob = blob_response.body_str
    end

    render :layout => 'wcs'
  end

  def wcsmatch2
    @match = ESDB::Match.find(params[:id])

    blob_url = "https://#{Rails.configuration.s3['matchblobs']['bucket']}.s3.amazonaws.com/#{@match.id}"
    begin
      blob_response = Curl.get(blob_url)
    rescue Exception => e
      # sometimes there are random problems retrieving from S3. we
      # dont need to hear about each one.
      # TODO complain if there are too many consecutive failures
    end

    gon.match = @match.to_hash
    if blob_response && blob_response.status[0] == '2'
      gon.matchblob = blob_response.body_str
    end

    render :layout => 'wcs2'
  end

  def cobrand?
    return false if @match.nil?

# DJ 20130911 maybe this code should be revived for ESL refactor?
# Is cobrand passed through by the API?
#
#    @match.cobrand.present?

    replay = Replay.where(:esdb_id => @match.id.to_s).first
    return false if replay.nil?
    replay.channel == Rails.application.secret('wcs_cobrand')
  end
end
