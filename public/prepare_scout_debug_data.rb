#!/usr/bin/env ruby
require 'csv'
require 'set'

MATCH_LIMIT = 1000

matches = []
matches_headers = []
match_ids = Set.new

CSV.open('matches.csv', 'r', {:headers => true}) { |matches_csv|
  matches_csv.each {|matches_row|
    matches << matches_row
    match_ids.add(matches_row['id'])
    if matches.size >= MATCH_LIMIT
      matches_headers = matches_csv.headers  
      break
    end
  }
}

CSV.open('matches_debug.csv', 'wb') do |matches_debug|
  matches_debug << matches_headers
  matches.each {|matches_row|
    matches_debug << matches_row
  }
end

entities = []
entities_headers = []
entity_ids = Set.new

CSV.open('ents.csv', 'r', {:headers => true}) { |ents_csv|
  ents_csv.each {|entity_row|
    if match_ids.include?(entity_row['match_id'])
      entities << entity_row
      entity_ids.add(entity_row['entity_id'])
    end
  }
  entities_headers = ents_csv.headers
}

CSV.open('ents_debug.csv', 'wb') do |ents_debug|
  ents_debug << entities_headers
  entities.each {|entity_row|
    ents_debug << entity_row
  }
end

minutes = []
minutes_headers = []

CSV.open('minutes.csv', 'r', {:headers => true}) { |minutes_csv|
  minutes_csv.each {|minutes_row|
    if entity_ids.include?(minutes_row['entity_id'])
      minutes << minutes_row
    end
  }
  minutes_headers = minutes_csv.headers
}

CSV.open('minutes_debug.csv', 'wb') do |minutes_debug|
  minutes_debug << minutes_headers
  minutes.each {|minutes_row|
    minutes_debug << minutes_row
  }
end
