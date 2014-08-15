FactoryGirl.define do
  factory :account do
    esdb_id { rand(1911) }
    profile_url { "http://us.battle.net/sc2/en/profile/#{rand(1911)}/1/#{Faker::Name.first_name}" }
  end
end