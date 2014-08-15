class AddPaypalColumnsToUser < ActiveRecord::Migration
  def change
    add_column :users, :paypal_email, :string
    add_column :users, :paypal_profile_id, :string
  end
end
