class AddEsdbIdToAccount < ActiveRecord::Migration
  def change
    add_column :accounts, :esdb_id, :integer
  end
end
