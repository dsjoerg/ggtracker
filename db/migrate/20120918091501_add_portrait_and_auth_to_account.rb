class AddPortraitAndAuthToAccount < ActiveRecord::Migration
  def change
    add_column :accounts, :portrait, :string

    add_column :accounts, :expected_portrait, :string
    add_column :accounts, :authenticated_at, :datetime
  end
end
