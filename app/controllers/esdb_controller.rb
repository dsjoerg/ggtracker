class EsdbController < ApiController
  # Callbacks coming from ESDB, see esdb/models/provider.rb
  #
  # Currently, we only receive replay processing updates here.
  def callback
    ggtracker_callback_received_at = Time.now

    case params[:call].downcase
    # replay_progress reports the progress of a replay parsing job to us
    when 'replay_progress'
      @replay = Replay.find_by_esdb_id(params[:job])

      if @replay && @replay.aasm_current_state == :processing
        @replay.update_attributes(
          :progress => params[:progress].to_i,
          :status   => params[:status],
        )

        if params[:progress].to_i == 100
          # TODO: we should check if we're even in the processing state before 
          # doing stuff here.
          @replay.esdb_id = params[:match_id]
          @replay.md5 = params[:md5]
          @replay.match_id = params[:match_id]
          @replay.ident_ids = params[:ident_ids]
          @replay.processed!
          @replay.save!

          replay_latency_seconds = Time.now - @replay.created_at
          # (used to email DJ when replay_latency_seconds was too high)
        end
      end

    # Replay parsing has failed.
    when 'replay_error'
      @replay = Replay.find_by_esdb_id(params[:job])
      Rails.logger.warn("ESDB replay processing has failed for replay #{@replay.id}")
      @replay.failure!

    # One of our provider identities has an update!
    # (or more likely, one of the Sc2 identities associated with it)
    when 'identity_update'
      if !params[:id]
        Rails.logger.warn "Received callback for unknown identity: #{params.inspect}"
      else
        accounts = Account.where(:esdb_id => params[:id]).all
        accounts.each do |account|
          account.update_from_esdb!(params)
        end
      end
    end

    @replay.publish_progress! if @replay

    if @replay && params[:progress].to_i == 100
      progress_published_at = Time.now

      timestamps = [
                    params[:ggtracker_received_at].to_f,
                    params[:esdb_received_at].to_f,
                    params[:preparse_received_at].to_f,
                    params[:jobspy_received_at].to_f,
                    params[:jobspy_done_at].to_f,
                    params[:postparse_received_at].to_f,
                    params[:postparse_complete_at].to_f,
                    ggtracker_callback_received_at.to_f,
                    progress_published_at.to_f
                    ]
      timediffs = timestamps.each_cons(2).map{|a,b| '%.2f' % (b-a)}.join(" ")
      totaltime = timestamps[-1] - timestamps[0]

      Rails.logger.warn "replay processing complete for #{@replay.match_id}. total time #{'%.2f' % totaltime}, breakdown2: #{timediffs}"
    end

    render :text => 'OK'
  end
end
