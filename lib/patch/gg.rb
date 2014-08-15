# Convenience patches to the gg gem that we realistically only use in ggtracker
# so they don't have to be brought back into gg.

require 'gg'
require 'esdb'
require 'esdb/match'
require 'esdb/identity'

module ESDB
  class Match
    def caption
      case game_type
      when '1v1' then
        "#{entities.first['identity']['name']} vs. #{entities.last['identity']['name']} on #{map_name}"
      else
        @caption = "#{game_type} on #{map_name}: "
        @caption << teams.collect{|team, entities| entities.collect{|e| e['identity']['name']}.join(', ')}.join(' vs. ')
      end
    end
    
    def description
      "Starcraft II Match: #{caption}"
    end
  end

  class Identity
    def region_name
      if gateway.downcase == 'us'
        return 'am'
      else
        return gateway
      end
    end

    def caption
      @caption = "#{name}"
      if current_highest_league.present?
        @caption << " (#{region_name.upcase} #{Sc2.leagues[current_highest_league.to_i]}#{ " #{race_name.capitalize}" if race_name.present?})" 
      else
        @caption << " (#{region_name.upcase}#{ " #{race_name.capitalize}" if race_name.present?})"
      end
      @caption << " replays and statistics"
    end
    
    def description
      "Starcraft II Player: #{caption}"
    end
  end
end
