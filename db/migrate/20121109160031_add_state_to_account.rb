class AddStateToAccount < ActiveRecord::Migration
  def change
    add_column :accounts, :state, :string
  end
end
