# Mimick sc2.js for ruby

module Sc2
  class << self
    def leagues
      [
        'Bronze',
        'Silver',
        'Gold',
        'Platinum',
        'Diamond',
        'Master',
        'Grandmaster'
      ]
    end

    def race_names
      {
        'T' => 'terran',
        'Z' => 'zerg',
        'P' => 'protoss',
        't' => 'terran',
        'z' => 'zerg',
        'p' => 'protoss'
      }
    end
  end
end