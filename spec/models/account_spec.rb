require 'spec_helper'

describe Account do
  # This test only tests the expected keys against the value of the model and
  # not the correctness of the values!
  it 'should serialize via jbuilder correctly' do
    expected_keys = [:id, :profile_url, :character_code,
      :gateway, :name, :most_played_race, :highest_league, 
      :highest_team_league, :current_league, :current_team_league, 
      :achievement_points, :season_games, :career_games, :portrait,
      :authenticated_at, :name, :authenticated, :portrait_css, 
      :expected_portrait_css]
    
    # TODO: factories, please.
    account = Account.new
    hash = account.to_builder.attributes!

    expected_keys.each do |xk|
      case xk
      when :expected_portrait_css
        hash[xk.to_s].should == account.portrait_css(true)
      when :authenticated
        hash[xk.to_s].should == account.authenticated?
      else
        hash[xk.to_s].should == account.send(xk)
      end
    end
  end

  it 'should be authenticated if authenticated_at is not nil' do
    account = Account.new
    account.authenticated_at = Time.now
    account.authenticated?.should == true
  end

  it 'should not pick the active portrait as expected_portrait' do
    account = Account.new
    account.portrait = 'Thatcher'

    # Yea, well, this isn't exactly 100% safe. We could expose the filtered
    # portraits but ..not now
    20.times do
      account.set_expected_portrait!
      account.expected_portrait.should_not == account.portrait
    end
  end
  
  it 'should output correct portrait_css' do
    account = Account.new
    account.portrait = 'Thatcher'

    account.portrait_css(false, 75).should == "background: url('/assets/sc2/portraits/0-75.jpg') -150px -0px no-repeat;"
  end
end
