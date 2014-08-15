# encoding: UTF-8

require 'spec_helper'

describe User do
  # This test only tests the expected keys against the value of the model and
  # not the correctness of the values!
  it 'should serialize via jbuilder correctly' do
    expected_keys = [:email, :password, :password_confirmation, :remember_me, :handle]

    user = User.new
    hash = user.to_builder.attributes!

    expected_keys.each do |xk|
      hash[xk.to_s].should == user.send(xk)
    end
    
    hash['accounts'].should_not be_nil
    # hash['replays'].should_not be_nil
    hash['notifications'].should_not be_nil
  end

  # Handle not required/used anymore currentl

  # it 'should require a handle' do
  #   user = User.new
  #   user.handle = nil
  #   user.valid?.should == false
  # end

  # it 'should validate the handle to be alphanumeric, mostly' do
  #   user = FactoryGirl.build(:user)
  # 
  #   user.handle = 'EG_IdrA2012'
  #   user.valid?.should == true
  # 
  #   user.handle = 'I pwnz Whitespace'
  #   user.valid?.should == false
  # 
  #   user.handle = 'WHO$)§WOULD%/§DO*THIS*?'
  #   user.valid?.should == false
  # end

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
