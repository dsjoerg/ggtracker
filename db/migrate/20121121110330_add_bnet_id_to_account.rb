class AddBnetIdToAccount < ActiveRecord::Migration
  def change
    add_column :accounts, :bnet_id, :integer
    rename_column :accounts, :region, :gateway
  end
end
