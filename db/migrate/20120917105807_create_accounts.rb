class CreateAccounts < ActiveRecord::Migration
  def change
    create_table :accounts do |t|
      t.string  :region
      t.string  :profile_url
      t.integer :character_code
      
      t.references :user
      
      # These should be retrieved automatically
      t.string  :name

      t.string  :most_played_race
      
      t.integer :highest_league
      t.integer :highest_team_league

      t.integer :current_league
      t.integer :current_team_league

      # And let's save everything we can, because.. why not?
      t.integer :achievement_points
      t.string  :most_played
      t.integer :season_games
      t.integer :career_games
      
      t.timestamps
    end
  end
end
