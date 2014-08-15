require 'spec_helper'

describe ReplaysController do
  before(:all) do
    @replay_file = File.new(File.join(Rails.root, 'spec/files/test.SC2Replay'))
  end

  # We could've used #create, but I would like to reserve create for manual
  # upload via a form if necessary. Drop never sees any user interaction and
  # never has to render back HTML. 
  describe :drop do
    it 'should return error if no file given' do
      post :drop

      response.should_not be_ok
      response.body.should_not be_empty
      # JSON.parse(last_response.body).should == {'status' => 'error', 'error' => 'File missing'}
    end

    # It should always create the Replay object because we're very optimistic
    # about uploads, we never want them to fail.
    # TODO: add tests that demonstrate this better (duplicate replays, etc.)
    it 'should create the replay' do
      if Rails.configuration.s3['replays']['access_key_id'] == 'YOUR_ACCESS_KEY'
        pending("can't test this without configuring Amazon S3")
      end

      post :drop, :replay => Rack::Test::UploadedFile.new(@replay_file)
    
      response.status.should == 201 # created
      response.body.should_not be_empty

      replay = Replay.where(:replay_file_name => File.basename(@replay_file.path)).first
      replay.should_not == nil
    end

    # We want to create replays with 100% initial progress to indicate that
    # the upload has been a success and inform the user we're not waiting to
    # process the replay.
    it 'should create the replay with 100% progress' do
      if Rails.configuration.s3['replays']['access_key_id'] == 'YOUR_ACCESS_KEY'
        pending("can't test this without configuring Amazon S3")
      end

      post :drop, :replay => Rack::Test::UploadedFile.new(@replay_file)
    
      response.status.should == 201 # created
      response.body.should_not be_empty

      replay = Replay.where(:replay_file_name => File.basename(@replay_file.path)).first
      replay.should_not == nil
      replay.progress.should == 100
    end

    it 'should create the replay via s3 drop' do
      fname = "01b5b19019ac34499ecbc60ce980b26a.SC2Replay"
      post :s3_drop, :file_name => fname, :s3_key => fname, :channel => "testchannel"
    
      response.status.should == 201 # created
      response.body.should_not be_empty

      replay = Replay.where(:replay_file_name => fname).first
      replay.should_not == nil
    end
  end
end
