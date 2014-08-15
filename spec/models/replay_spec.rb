require 'spec_helper'

describe Replay do
  # This test only tests the expected keys against the value of the model and
  # not the correctness of the values!
  it 'should serialize via jbuilder correctly' do
    expected_keys = [:id, :progress, :status, :user_id, :replay_file_name,
            :replay_file_size, :esdb_id, :state, :stage, :file]
    
    replay = Replay.new
    hash = replay.to_builder.attributes!

    expected_keys.each do |xk|
      case xk
      when :file
        hash[xk.to_s].should == replay.replay.url
      else
        hash[xk.to_s].should == replay.send(xk)
      end
    end
  end

  it 'should require a replay file' do
    replay = Replay.new
    replay.valid?.should == false
    
    replay.replay = File.new(Rails.root.join('spec/files/test.SC2Replay'))
    replay.valid?.should == true
  end
end
