class AddMd5ToReplay < ActiveRecord::Migration
  def change
    add_column :replays, :md5, :string
  end
end
