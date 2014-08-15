class AddUserToMatchnotes < ActiveRecord::Migration
  def change
    add_column :matchnotes, :user_id, :integer
  end
end
