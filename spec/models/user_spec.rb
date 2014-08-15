# encoding: UTF-8

require 'spec_helper'

describe User do
  # This test only tests the expected keys against the value of the model and
  # not the correctness of the values!
  it 'should serialize via jbuilder correctly' do
    expected_keys = [:email, :password, :password_confirmation, :remember_me, :handle]

    user = FactoryGirl.create(:user)
    hash = user.to_builder.attributes!

    expected_keys.each do |xk|
      hash[xk.to_s].should == user.send(xk)
    end

    hash['accounts'].should_not be_nil
    hash['notifications'].should_not be_nil

    hash['accounts'][0].keys.length.should == 23
    hash['notifications'][0].keys.length.should == 6
  end

  it 'should require an email' do
    user = User.new
    user.email = nil
    user.valid?.should == false
  end

  it 'should require a password' do
    user = User.new
    user.password = nil
    user.valid?.should == false
  end

  it 'should create a valid notification with #notify' do
    user = FactoryGirl.create(:user)
    user.ack_all_notifications!
    user.notifications.count.should == 0

    user.notify('gg!')
    user.notifications.should_not be_empty

    n = user.notifications.where(:ack_at => nil).first
    n.message.should == 'gg!'
  end

  it 'should allow create parameters to be passed to #notify' do
    user = FactoryGirl.create(:user)
    user.ack_all_notifications!
    user.notifications.count.should == 0

    user.notify({:title => 'gg!', :message => 'good game.'})
    user.notifications.should_not be_empty

    n = user.notifications.where(:ack_at => nil).first
    n.title.should == 'gg!'
    n.message.should == 'good game.'
  end
end
