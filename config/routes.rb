# Notes: we allow POST to #update all over the place for Angular compat.
# ngResource does differentiate between collection and member, but does
# not differentiate the HTTP call (it only knows "save", which we'll leave
# alone, defaulting to POST)

Ggtracker::Application.routes.draw do
  devise_for :users, 
    :controllers => {
      :registrations => 'users'
    }
  
  devise_scope :user do
    get 'settings', :to => 'users#edit'
    get 'dashboard', :to => 'users#dashboard'
    post '/users/:id', :to  => 'users#update'

    authenticated do
      root :to => 'users#dashboard'
    end
    
    root :to => 'home#home_lander'
  end

  resources :notifications do
    member do
      get :ack
    end
  end
  
  resources :users do
    collection do
      get :auth
    end

    member do
      post :update
      post :view_mode
    end
  end

  match '/settings', :to => 'users#settings'

  resources :accounts do
    member do
      post :update, :destroy_all_matches
    end
  end

  resources :players

  # this route must be first so that it takes precedence over the ordinary show route
  match '/players/:id/give_one_month_ggtracker_pro', :to => 'players#give_one_month_ggtracker_pro'

  match '/players/:id/:name', :to => 'players#show'


  resources :matches do
    collection do
      get :search
    end
    member do
      post :userdelete
      get :replay
    end
  end

  resources :matchnotes

  get '/matches/:match_id/matchnote', :to => 'matchnotes#get_for_match'
  post '/matches/:match_id/matchnote', :to => 'matchnotes#post_for_match'

  resources :replays do
    collection do
      post :drop
      post :s3_drop
    end
  end

  resources :signed_urls, only: :index

  # This is our esdb callback destination - see esdb_controller.rb
  match '/esdb', :to => 'esdb#callback'
  
  # Dev controller - random nonsense we might want to have lying around for 
  # whatever reason, such as a complete view of all unit sprites, etc.
  match '/dev/:action', :to => 'dev'

  # old sc2gears replay-posting URL
  match '/api/upload' => 'replays#drop'

  # blitz.io
  match 'mu-3a3f1ed3-7eba3187-8180d5c5-395096ce' => 'static#blitz'

  # ad serving nonsense
  match 'eyeblaster/addineyeV2.html' => 'static#addineyeV2'

  match '500' => 'static#five_hundred'
  match 'go_pro' => 'home#go_pro'
  match 'pro_lander' => 'home#pro_lander'
  match 'you_are_pro' => 'home#you_are_pro'
  match 'credits' => 'home#credits'
  match 'replay_problems' => 'home#replay_problems'
  match 'spending_skill' => 'home#spending_skill'
  match 'saturation_speed' => 'home#saturation_speed'
  match 'spending_skill_stats' => 'home#spending_skill_stats'
  match 'auto_uploader' => 'home#auto_uploader'
  match 'army_strength' => 'home#army_strength'
  match 'race_macro' => 'home#race_macro'
  match 'faq' => 'home#faq'
  match 'faq_deutsch' => 'home#faq_deutsch'
  match 'winrate_by_matchup' => 'home#winrate_by_matchup'
  match 'worker_waves_per_minute' => 'home#worker_waves_per_minute'
  match 'tour' => 'home#tour'
  match 'home' => 'home#home'
  match 'landing_tour' => 'home#tour'
  match 'landing_home' => 'home#home'
  match 'privacy' => 'home#privacy'
  match 'changelog' => 'home#changelog'
  match 'api' => 'home#api'
  match 'developers' => 'home#developers'
  match 'terms' => 'home#terms'
  match 'injects' => 'home#injects'
  match 'wcsmatch' => 'matches#wcsmatch'
  match 'wcsmatch2/:id' => 'matches#wcsmatch2'
  match 'economy_stats' => 'home#economy_stats'
  match 'economy_stats2' => 'home#economy_stats2'
  match 'econ_staircase' => 'home#econ_staircase'
  match 'GoldLeagueHeroes', :to => redirect('/players/1455/GGTracker#?pack=GoldLeagueHeroes')
  match 'GoldSpeedAheadReplays', :to => redirect('/players/1455/GGTracker#?pack=GoldSpeedAhead')
  match 'GoldSpeedAhead', :to => 'home#goldspeedahead'
  match 'SEEDArium', :to => 'home#arium'
  match 'cancel' => 'home#cancelling_pro'
  match 'really_cancel_pro' => 'home#cancelled_pro'

  match 'simple_report' => 'report_mailer#simple_report'

  post 'backend/ipn', :to => 'payment#paypal_ipn'

  match 'scout' => 'home#scout'

  # 404
  match "*path" => 'application#not_found'
end
