class ReplaysController < ApplicationController
  before_filter :authenticate_user!, :only => [:index, :show]
  respond_to :html, :json, :xml

  # Drop is used for bulk/unassociated (anonymous) replay uploads
  #
  # Note: we're thinking about letting users claim their battle.net ids,
  # which would let them claim replays uploaded here.
  def drop
    ggtracker_received_at = Time.now

    # Sc2Gears Protocol Support
    # https://sites.google.com/site/sc2gears/features/replay-sharing
    # We also set access_token - check application_controller
    if params[:fileName] && params[:fileContent]

      content = Base64.decode64(params[:fileContent])
      md5 = Digest::MD5.hexdigest(content)

      file = StringIO.new(content)
      file.class.class_eval { attr_accessor :original_filename, :content_type }
      file.original_filename = params[:fileName]
      
      params[:replays] = [file]
      params[:mode] = 'sc2gears'

      if params[:token].present? && Rails.application.secret('partner_uploaders').include?(params[:token])

        # welcome GGTracker partner
        params[:channel] = params[:token]

      elsif current_user.nil? || !current_user.pro?

        xml = Builder::XmlMarkup.new(indent: 2)
        xml.instruct!
        xml.uploadResult(docVersion: '1.0') {
          xml.errorCode(403)
          xml.message('Uploading from Sc2gears requires a GGTracker Pro subscription.  See http://ggtracker.com/go_pro for more.')
          xml.replayUrl('')
        }
        render(xml: xml.target!, status: 200) and return
        
      else
        # welcome GGTracker Pro subscriber
        params[:channel] = "drop#{current_user.id}"
      end
    end


    # Yes, for now, we'll just render text.
    # TODO: decide on API approach and give us nice helpers such as error!
    render(:text => 'NOK', :status => 406) and return if !params[:replays] || params[:replays].empty?

    params[:replays].each do |file|

      replay = Replay.new(
        replay: file,
        user: current_user, 
        progress: 0,
        status: 'Waiting to process',
        channel: params[:channel]
      )

      replay.save!
      replay.process!(ggtracker_received_at)
      
      # what happens next:
      #  ggtracker/app/models/replay.rb: response = ESDB::Replay.upload(md5)
      #  gg/lib/esdb/replay.rb:          JSON.parse(RestClient.post(replay.url, :file => file, :access_token => ESDB.api_key))
      #  esdb/esdb/api/replays.rb:       parser_id = Resque.enqueue_to(queuename, ESDB::Jobs::Sc2::Replay::PreParse, {
      #  ggpyjobs/ggtracker/jobs.py:     replayDB = sc2reader_to_esdb.processReplay(StringIO(k.get_contents_as_string()))
      #  
    end

    case params[:mode].to_s.downcase
    when 'sc2gears' then
      # Using a custom builder to set the attribute on root, but sc2gears
      # doesn't really care if it's there. The 200 status is mandatory however,
      # 201 will result in failure..
      xml = Builder::XmlMarkup.new(indent: 2)
      xml.instruct!
      xml.uploadResult(docVersion: '1.0') {
        xml.errorCode(0)
        xml.message('OK')

        # We don't know the match id yet, so I've made matches/:id respond to
        # the md5 if :id is non-numeric and redirect if a match exists.
        xml.replayUrl(match_url(md5))
      }
      render(xml: xml.target!, status: 200)
    else
      render(text: 'WTF', status: 201)
    end
  end

  def s3_drop
    ggtracker_received_at = Time.now

    replay = Replay.new(
      replay_file_name: params[:file_name],
      md5: params[:s3_key],
      user: current_user, 
      progress: 0,
      status: 'Waiting to process',
      channel: params[:channel]
    )

    replay.save!
    replay.process!(ggtracker_received_at)
    render(text: 'OK', status: 201)
  end

  # FIXME: if we're providing more endpoints that also act like an API, give
  # some thought to the overall implementation.
  def index
    params[:page] = params[:page].to_i if params[:page]
    params.reverse_merge!({
      offset: 0,
      limit: 20,
      page: 1
    })

    # Page overrides offset if present
    if params[:page]
      params[:offset] = (params[:page] - 1) * params[:limit]
    end

    @replays = current_user.replays.
      order("updated_at desc").
      limit(params[:limit] || 10).
      offset(params[:offset] || 0)

    # respond_with @replays
    respond_to do |format|
      format.json {
        respond_with({
          params: params,
          collection: @replays
        })
      }
      format.html
    end
  end

  def show
  end
end
