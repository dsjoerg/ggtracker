class CreateMatchnotes < ActiveRecord::Migration
  def change
    create_table :matchnotes do |t|
      t.integer :match_id
      t.text :note

      t.timestamps
    end
  end
end
