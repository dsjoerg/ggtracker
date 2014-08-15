require 'spec_helper'

describe EsdbController do
  describe :callback do
    it 'should identify and update a replay by esdb job id for replay_progress' do
      if Rails.configuration.s3['replays']['access_key_id'] == 'YOUR_ACCESS_KEY'
        pending("can't test this without configuring Amazon S3")
      end

      replay = FactoryGirl.create(:replay)
      replay.uploaded!
      
      # Again, I kindof enjoy the new Hash syntax.
      # TODO: consider using it everywhere? It's JSON'ish after all..
      get :callback, call: 'replay_progress', progress: 25, status: 'computing!', job: replay.esdb_id
      
      replay.reload
      puts replay.inspect
      replay.progress.should == 25
      replay.status.should == 'computing!'
      replay.state.should == 'processing'
    end

    it 'should identify and update a replay by esdb job id for replay_error' do
      if Rails.configuration.s3['replays']['access_key_id'] == 'YOUR_ACCESS_KEY'
        pending("can't test this without configuring Amazon S3")
      end

      replay = FactoryGirl.create(:replay)
      replay.uploaded!
      
      get :callback, call: 'replay_error', job: replay.esdb_id
      
      replay.reload
      replay.state.should == 'failed'
    end

    # TODO: might want a replay_done callback or something instead, not sure yet.
    it 'should set the replay status to parsing/done when progress reaches 100%' do
      if Rails.configuration.s3['replays']['access_key_id'] == 'YOUR_ACCESS_KEY'
        pending("can't test this without configuring Amazon S3")
      end

      replay = FactoryGirl.create(:replay)
      replay.uploaded!
      
      get :callback, call: 'replay_progress', progress: 100, status: 'done!', job: replay.esdb_id
      
      replay.reload
      replay.state.should == 'done'
    end
  end
end
