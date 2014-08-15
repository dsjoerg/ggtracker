require 'spec_helper'

describe Notification do
  before(:all) do
    @user ||= FactoryGirl.create(:user)
  end

  # This test only tests the expected keys against the value of the model and
  # not the correctness of the values!
  it 'should serialize via jbuilder correctly' do
    expected_keys = [:id, :title, :message, :notification_type, :ack_at,
      :user_id]

    notification = Notification.new
    hash = notification.to_builder.attributes!

    expected_keys.each do |xk|
      hash[xk.to_s].should == notification.send(xk)
    end
  end

  it 'should require a user to be created' do
    n = Notification.new
    n.valid?.should == false
    n.errors.messages.keys.should include(:user)
  end

  it '#ack! should update the ack_at timestamp' do
    n = @user.notifications.create
    n.ack_at.should be_nil

    n.ack!
    # Is there a nicer way? Just want to make sure..
    n.ack_at.should be_within(1.second).of(Time.now)
  end
end
