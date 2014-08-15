class AddGuestFlagToUser < ActiveRecord::Migration
  def change
    add_column :users, :guest, :boolean, :default => false
  end
end
