class AddLastScrapedAtToAccount < ActiveRecord::Migration
  def change
    add_column :accounts, :last_scraped_at, :datetime
  end
end
