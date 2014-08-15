class AddStateAndStageToReplay < ActiveRecord::Migration
  def change
    add_column :replays, :state, :string
    add_column :replays, :stage, :string
  end
end
