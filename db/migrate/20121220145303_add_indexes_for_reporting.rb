class AddIndexesForReporting < ActiveRecord::Migration
  def up
    add_index(:replays, :user_id)
    add_index(:accounts, :user_id)
  end

  def down
  end
end
