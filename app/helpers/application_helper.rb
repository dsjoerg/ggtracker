module ApplicationHelper
  # Quick helper to have controller-action in the body class
  def body_name
    [
      controller.class.to_s.gsub(/Controller/, '').demodulize.downcase,
      params[:action].to_s.downcase
    ].join('-')
  end

  # Returns 'active' if current controllers match a given section
  def active?(section)
    case section.to_s.downcase
    when 'home' then
      (controller.is_a?(HomeController) && params[:action] == "home") ? 'active' : nil
    when 'go_pro' then
      (controller.is_a?(HomeController) && params[:action] == "go_pro") ? 'active' : nil
    when 'dashboard' then
      false # we have no dashboard yet, whatever it's going to be
    when 'players' then
      (controller.is_a?(PlayersController)) ? 'active' : nil
    when 'matches' then
      (controller.is_a?(MatchesController)) ? 'active' : nil
    end
  end


  #
  # Below are helpers written for MLG Summer Arena.
  #

  # The units here are listed in the order they appear in the database columns,
  # for example u0 = scv for terran.
  # Also we give the mineral and gas cost, and whether or not the unit should be
  # counted as part of the Army Size.
  @@UNITS = {
    'T' => [
      ['scv', 50, 0, false],
      ['marine', 50, 0, true],
      ['marauder', 100, 25, true],        # 2
      ['reaper', 50, 50, true],
      ['ghost', 200, 100, true],          # 4
      ['hellion', 100, 0, true],
      ['siegetank', 150, 125, true],      # 6 
      ['thor', 300, 200, true],
      ['viking', 150, 75, true],          # 8
      ['medivac', 100, 100, true],
      ['banshee', 150, 100, true],        # 10
      ['raven',   100, 200, true],
      ['battlecruiser', 400, 300, true],  # 12
      ['planetaryfortress', 150, 150, false],
      ['missileturret', 100, 0, false],   # 14
    ],
    'Z' => [
      ['drone', 50, 0, false],      #0
      ['zergling', 25, 0, true],    # 25 per zergling    1
      ['queen', 150, 0, true],      # queen fighting!    2
      ['baneling', 50, 25, true],   # full unit cost     3
      ['roach', 75, 25, true],
      ['overlord', 100, 0, false],  # we dont count pylons in the army so lets not count overlords either     5
      ['overseer', 50, 50, true],   # 6
      ['hydralisk', 100, 50, true], # 7
      ['spinecrawler', 150, 0, false], # buildings are not in army 8
      ['sporecrawler', 125, 0, false],  # 9
      ['mutalisk', 100, 100, true],    # 10
      ['corruptor', 150, 100, true],   # 11
      ['broodlord', 300, 250, true],   # 12
      ['broodling', 0, 0, true],  
      ['infestor', 100, 150, true],
      ['infestedterran', 0, 0, true],  # 15
      ['ultralisk', 300, 200, true],
      ['nydusworm', 100, 100, false],    # 17
    ],
    'P' => [
      ['probe', 50, 0, false],          # 0
      ['zealot', 100, 0, true],         # 1
      ['sentry', 50, 100, true],
      ['stalker', 125, 50, true],
      ['hightemplar', 50, 150, true],
      ['darktemplar', 125, 125, true],  # 5
      ['immortal', 250, 100, true],
      ['colossus', 300, 200, true],
      ['archon', 175, 275, true],
      ['observer', 25, 75, true],
      ['warpprism', 200, 0, true],      # 10
      ['phoenix', 150, 100, true],
      ['voidray', 250, 150, true],
      ['carrier', 350, 250, true],
      ['mothership', 400, 400, true],
      ['photoncannon', 150, 0, false],  # 15
    ]
  }

  # the names of the units that we want to show on the caster sheet,
  # in the order we want to present them.  this is _not_ the order
  # that the units are listed in the database columns u1, u2, etc.
  @@UNITNAMES_IN_ORDER = {
    'P' => [
      'zealot',
      'sentry',
      'stalker',
      'immortal',
      'observer',
      'colossus',
      'hightemplar',
      'darktemplar',
      'archon',
      'warpprism',
      'phoenix',
      'voidray',
      'carrier',
      'mothership',
    ],
    'Z' => [
      'zergling',
      'roach',
      'baneling',
      'infestor',
      'hydralisk',
      'mutalisk',
      'corruptor',
      'broodlord',
      'ultralisk',
      'queen',
      'overseer',
    ],
    'T' => [
      'marine',
      'marauder',
      'medivac',
      'hellion',
      'siegetank',
      'thor',
      'reaper',
      'ghost',
      'viking',
      'banshee',
      'raven',
      'battlecruiser',
    ]
  }

  def unitnames_in_order(race)
    @@UNITNAMES_IN_ORDER[race.upcase]
  end
  
  def unitnumber(race,unitname)
    @@UNITS[race.upcase].collect{|unit| unit[0]}.index(unitname)
  end  

  def render_one_sigfig(number)
    return ("%.1f" % number) if number > 0 and number < 1
    return ("%.0f" % number)
  end

  # returns the army resource cost in minerals + gas
  # army is a hash of unitnum to how many of that unit
  def army_size(race, army)
    units = @@UNITS[race.upcase]
    army_size = 0.0

    army.keys.each do |unitnum|
      unitnum_i = unitnum.to_i
      if units[unitnum_i] && units[unitnum_i][3]
        army_size = army_size + army[unitnum].to_f * (units[unitnum_i][1] + units[unitnum_i][2])
      end
    end

    number_with_delimiter(army_size.sigfig_to_s(2), :delimiter => ',')
  end
end
