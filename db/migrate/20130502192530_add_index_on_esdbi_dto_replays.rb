class AddIndexOnEsdbiDtoReplays < ActiveRecord::Migration
  def up
    add_index(:replays, :esdb_id)
  end

  def down
  end
end
