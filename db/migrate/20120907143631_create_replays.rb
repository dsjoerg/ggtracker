class CreateReplays < ActiveRecord::Migration
  def change
    create_table :replays do |t|
      t.attachment  :replay

      t.string      :esdb_id
      # Status and Progress retrieved from ESDB
      t.integer     :progress, :max => 100
      t.string      :status

      t.timestamps
    end
  end
end
