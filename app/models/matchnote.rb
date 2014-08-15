class Matchnote < ActiveRecord::Base
  attr_accessible :match_id, :note, :user
  belongs_to :user

  def to_builder(builder = nil)
    builder ||= Jbuilder.new
    builder.(self, :note)
    builder
  end
end
