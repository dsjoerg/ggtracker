class AddPrimaryAccountToUsers < ActiveRecord::Migration
  def change
    add_column :users, :primary_account_id, :integer
  end
end
