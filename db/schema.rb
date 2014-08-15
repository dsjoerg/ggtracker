# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20131101180159) do

  create_table "accounts", :force => true do |t|
    t.string   "gateway"
    t.string   "profile_url"
    t.integer  "character_code"
    t.integer  "user_id"
    t.string   "name"
    t.string   "most_played_race"
    t.integer  "highest_league"
    t.integer  "highest_team_league"
    t.integer  "current_league"
    t.integer  "current_team_league"
    t.integer  "achievement_points"
    t.string   "most_played"
    t.integer  "season_games"
    t.integer  "career_games"
    t.datetime "created_at",          :null => false
    t.datetime "updated_at",          :null => false
    t.string   "portrait"
    t.string   "expected_portrait"
    t.datetime "authenticated_at"
    t.datetime "last_synced_at"
    t.datetime "last_scraped_at"
    t.integer  "esdb_id"
    t.string   "state"
    t.integer  "bnet_id"
  end

  add_index "accounts", ["user_id"], :name => "index_accounts_on_user_id"

  create_table "matchnotes", :force => true do |t|
    t.integer  "match_id"
    t.text     "note"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
    t.integer  "user_id"
  end

  create_table "notifications", :force => true do |t|
    t.string   "title"
    t.text     "message"
    t.string   "notification_type"
    t.boolean  "dialog"
    t.integer  "user_id"
    t.datetime "ack_at"
    t.datetime "created_at",        :null => false
    t.datetime "updated_at",        :null => false
  end

  create_table "replays", :force => true do |t|
    t.string   "replay_file_name"
    t.string   "replay_content_type"
    t.integer  "replay_file_size"
    t.datetime "replay_updated_at"
    t.string   "esdb_id"
    t.integer  "progress"
    t.string   "status"
    t.datetime "created_at",          :null => false
    t.datetime "updated_at",          :null => false
    t.integer  "user_id"
    t.string   "md5"
    t.string   "state"
    t.string   "stage"
    t.string   "channel"
  end

  add_index "replays", ["esdb_id"], :name => "index_replays_on_esdb_id"
  add_index "replays", ["user_id"], :name => "index_replays_on_user_id"

  create_table "users", :force => true do |t|
    t.string   "email",                  :default => "",    :null => false
    t.string   "encrypted_password",     :default => "",    :null => false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          :default => 0
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip"
    t.string   "last_sign_in_ip"
    t.datetime "created_at",                                :null => false
    t.datetime "updated_at",                                :null => false
    t.string   "handle"
    t.boolean  "anonymous",              :default => false
    t.boolean  "guest",                  :default => false
    t.datetime "processing_timestamp"
    t.string   "access_token"
    t.integer  "prolevel"
    t.integer  "primary_account_id"
    t.integer  "view_mode"
    t.string   "paypal_email"
    t.string   "paypal_profile_id"
    t.datetime "pro_cancelled_at"
  end

  add_index "users", ["email"], :name => "index_users_on_email", :unique => true
  add_index "users", ["reset_password_token"], :name => "index_users_on_reset_password_token", :unique => true

end
