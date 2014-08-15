class CreateNotifications < ActiveRecord::Migration
  def change
    create_table :notifications do |t|
      t.string      :title
      t.text        :message

      # The "class" of this notification
      # will, for now, simply be applied as a CSS class (e.g. error, info)
      t.string      :notification_type

      # Should the notification be displayed as a dialog?
      # potentially taking over the screen? TODO
      t.boolean     :dialog

      t.references  :user

      t.datetime    :ack_at
      t.timestamps
    end
  end
end
