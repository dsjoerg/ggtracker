FactoryGirl.define do
  factory :user do
    # Remember: these are blocks because we want them to execute on every
    # invocation, not only once, on evaluation of the file.
    email { Faker::Internet.email }
    handle { Faker::Name.first_name.downcase }
    password { Digest::MD5.hexdigest(Time.now.to_f.to_s) }

    after(:build) do |user|
      user.accounts << FactoryGirl.create(:account)
    end
  end
end