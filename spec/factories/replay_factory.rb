FactoryGirl.define do
  factory :replay do
    md5 { Digest::MD5.hexdigest(Time.now.to_f.to_s) }
    esdb_id { Digest::MD5.hexdigest(Time.now.to_f.to_s) }
    replay { File.new(Rails.root.join('spec/files/test.SC2Replay')) }
  end
end