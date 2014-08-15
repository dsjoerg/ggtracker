require 'spec_helper'

describe NotificationsController do
  login_user

  describe :ack do
    it 'should ack a notification for current_user' do
      subject.current_user.notify('hi!')
      n = subject.current_user.notifications.last
      
      # We redirect_to :back on #ack for html requests.
      request.env["HTTP_REFERER"] = '/'
      get :ack, id: n.id
      
      n.reload
      n.ack?.should == true
    end

    it 'should not ack notifications for other users' do
      user = FactoryGirl.create(:user)
      user.notify('hi!')
      n = user.notifications.last
      
      # We redirect_to :back on #ack for html requests.
      request.env["HTTP_REFERER"] = '/'
      get :ack, id: n.id
      
      n.reload
      n.ack?.should == false
    end

    it 'should not redirect on JSON requests' do
      subject.current_user.notify('hi!')
      n = subject.current_user.notifications.last
      
      get :ack, id: n.id, :format => :json
      response.status.should == 200
    end
  end
end