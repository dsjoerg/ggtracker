class AddProCancelledAtToUser < ActiveRecord::Migration
  def change
    add_column :users, :pro_cancelled_at, :datetime
  end
end
