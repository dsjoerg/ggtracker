class AddLastSyncedAtToAccount < ActiveRecord::Migration
  def change
    add_column :accounts, :last_synced_at, :datetime
  end
end
