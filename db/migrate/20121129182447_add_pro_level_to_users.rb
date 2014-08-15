class AddProLevelToUsers < ActiveRecord::Migration
  def change
    add_column :users, :prolevel, :integer
  end
end
