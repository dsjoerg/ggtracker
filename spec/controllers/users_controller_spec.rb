require 'spec_helper'

describe UsersController do
  before(:all) do
  end

  describe :dashboard do
    login_user

    # Note: User factory creates accounts by default
    # Note: confused by "subject"? It's the controller instance.
    it 'should redirect to the first account if the user has any' do
      get :dashboard
      response.should redirect_to(subject.current_user.primary_account.url)
    end

    it 'should redirect to settings_url if the user has no accounts' do
      subject.current_user.accounts = []
      get :dashboard
      response.should redirect_to(settings_url)
    end
  end
end
