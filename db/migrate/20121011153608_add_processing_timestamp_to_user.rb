class AddProcessingTimestampToUser < ActiveRecord::Migration
  def change
    add_column :users, :processing_timestamp, :datetime
  end
end
