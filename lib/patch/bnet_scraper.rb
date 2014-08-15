# Some of these might be candidates for our fork/pull requests
# but until that is decided, they're staying in here.
#
# See https://github.com/ggtracker/bnet_scraper

module BnetScraper
  module Starcraft2
    # Returns the map file and position of a portrait by name
    def self.portrait_position(name)
      index = PORTRAITS.flatten(1).collect(&:downcase).index(name.to_s.downcase)
      if index.nil?
        return nil
      end

      map = (index / 36)
      map_index = (index - map * 36) + 1
      y = (map_index.to_f / 6.0).ceil.to_i - 1
      x = (map_index - (y*6)) - 1
      [map, x, y]
    end
  end
end

# HAX: also patching our own gg here because ..really, this shouldn't be
# in here.

require 'gg'
module ESDB
  class Identity
    def portrait_css(size = 75)
      return '' if !portrait || portrait.blank?
      portrait_position = BnetScraper::Starcraft2.portrait_position(portrait)
      return '' if portrait_position.nil?
      "background: url('/assets/sc2/portraits/#{portrait_position[0]}-#{size}.jpg') -#{portrait_position[1]*size}px -#{portrait_position[2]*size}px no-repeat;"
    end
  end
end