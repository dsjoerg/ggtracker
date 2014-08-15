class AddChannelToReplay < ActiveRecord::Migration
  def change
    add_column :replays, :channel, :string
  end
end
