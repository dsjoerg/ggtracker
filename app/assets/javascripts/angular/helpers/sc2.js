
Sc2 = {
  leagues: [
    'Bronze',
    'Silver',
    'Gold',
    'Platinum',
    'Diamond',
    'Master',
    'Grandmaster'
  ],

  race_names: {
    'T': 'terran',
    'Z': 'zerg',
    'P': 'protoss',
    't': 'terran',
    'z': 'zerg',
    'p': 'protoss'
  },

  armyUnits: {
      'WoL': {
          'zealot': [100,0,2,0,'protoss'],
          'sentry': [50,100,2,0,'protoss'],
          'stalker': [125,50,2,0,'protoss'],
          'hightemplar': [50,150,2,0,'protoss'],
          'darktemplar': [125,125,2,0,'protoss'],
          'immortal': [250,100,4,0,'protoss'],
          'colossus': [300,200,6,0,'protoss'],
          'archon': [175,275,4,0,'protoss'],
          'observer': [25,75,1,0,'protoss'],
          'warpprism': [200,0,2,0,'protoss'],
          'phoenix': [150,100,2,0,'protoss'],
          'voidray': [250,150,3,0,'protoss'],
          'carrier': [350,250,6,0,'protoss'],
          'interceptor': [25,0,0,0,'protoss'],
          'mothership': [400,400,8,0,'protoss'],
          'photoncannon': [150,0,0,0,'protoss'],
          'marine': [50,0,1,0,'terran'],
          'marauder': [100,25,2,0,'terran'],
          'reaper': [50,50,1,0,'terran'],
          'ghost': [200,100,2,0,'terran'],
          'hellion': [100,0,2,0,'terran'],
          'siegetank': [150,125,3,0,'terran'],
          'thor': [300,200,6,0,'terran'],
          'viking': [150,75,2,0,'terran'],
          'medivac': [100,100,2,0,'terran'],
          'banshee': [150,100,3,0,'terran'],
          'raven': [100,200,2,0,'terran'],
          'battlecruiser': [400,300,6,0,'terran'],
          'planetaryfortress': [150,150,0,0,'terran'],
          'missileturret': [100,0,0,0,'terran'],
          'queen': [150,0,2,0,'zerg'],
          'zergling': [25,0,0.5,0,'zerg'],
          'baneling': [50,25,0.5,0,'zerg'],
          'roach': [75,25,2,0,'zerg'],
          'overseer': [50,50,0,0,'zerg'],
          'hydralisk': [100,50,2,0,'zerg'],
          'spinecrawler': [100,0,0,0,'zerg'],
          'sporecrawler': [75,0,0,0,'zerg'],
          'mutalisk': [100,100,2,0,'zerg'],
          'corruptor': [150,100,2,0,'zerg'],
          'broodlord': [150,150,4,0,'zerg'],
          'infestor': [100,150,2,0,'zerg'],
          'infestedterran': [0,0,0,0,'zerg'],
          'ultralisk': [300,200,6,0,'zerg'],
          'nydusworm': [100,100,0,0,'zerg'],
      },
      'HotS': {
          'zealot': [100,0,2,0,'protoss'],
          'sentry': [50,100,2,0,'protoss'],
          'stalker': [125,50,2,0,'protoss'],
          'hightemplar': [50,150,2,0,'protoss'],
          'darktemplar': [125,125,2,0,'protoss'],
          'immortal': [250,100,4,0,'protoss'],
          'colossus': [300,200,6,0,'protoss'],
          'archon': [175,275,4,0,'protoss'],
          'observer': [25,75,1,0,'protoss'],
          'warpprism': [200,0,2,0,'protoss'],
          'phoenix': [150,100,2,0,'protoss'],
          'voidray': [250,150,3,0,'protoss'],
          'carrier': [350,250,6,0,'protoss'],
          'interceptor': [25,0,0,0,'protoss'],
          'mothership': [400,400,8,0,'protoss'],
          'photoncannon': [150,0,0,0,'protoss'],
          'oracle': [150,150,3,0,'protoss'],
          'tempest': [300,200,4,0,'protoss'],
          'mothershipcore': [100,100,2,0,'protoss'],
          'marine': [50,0,1,0,'terran'],
          'marauder': [100,25,2,0,'terran'],
          'reaper': [50,50,1,0,'terran'],
          'ghost': [200,100,2,0,'terran'],
          'hellion': [100,0,2,0,'terran'],
          'siegetank': [150,125,3,0,'terran'],
          'thor': [300,200,6,0,'terran'],
          'viking': [150,75,2,0,'terran'],
          'medivac': [100,100,2,0,'terran'],
          'banshee': [150,100,3,0,'terran'],
          'raven': [100,200,2,0,'terran'],
          'battlecruiser': [400,300,6,0,'terran'],
          'planetaryfortress': [150,150,0,0,'terran'],
          'missileturret': [100,0,0,0,'terran'],
          'widowmine': [75,25,2,0,'terran'],
          'queen': [150,0,2,0,'zerg'],
          'zergling': [25,0,0.5,0,'zerg'],
          'baneling': [50,25,0.5,0,'zerg'],
          'roach': [75,25,2,0,'zerg'],
          'overseer': [50,50,0,0,'zerg'],
          'hydralisk': [100,50,2,0,'zerg'],
          'spinecrawler': [100,0,0,0,'zerg'],
          'sporecrawler': [75,0,0,0,'zerg'],
          'mutalisk': [100,100,2,0,'zerg'],
          'corruptor': [150,100,2,0,'zerg'],
          'broodlord': [150,150,4,0,'zerg'],
          'infestor': [100,150,2,0,'zerg'],
          'infestedterran': [0,0,0,0,'zerg'],
          'ultralisk': [300,200,6,0,'zerg'],
          'nydusworm': [100,100,0,0,'zerg'],
          'swarmhost': [200,100,3,0,'zerg'],
          'viper': [100,200,3,0,'zerg'],
      }
  },


  workerUnits: {
    'probe': true,
    'drone': true,
    'scv': true
  },

  ignored_units: {
    'probe': true,
    'nexus': true,
    'gateway': true,
    'cyberneticscore': true,
    'pylon': true,
    'assimilator': true,
    'forge': true,
    'gateway (warpgate)': true,
    'roboticsbay': true,
    'twilightcouncil': true,
    'roboticsfacility': true,
    'templararchive': true,
    'richmineralfield1': true,
    'scv': true,
    'commandcenter': true,
    'barracks': true,
    'supplydepot': true,
    'supplydepot (lowered)': true,
    'orbitalcommand': true,
    'mule': true,
    'mineralfield3': true,
    'engineeringbay': true,
    'factory': true,
    'bunker': true,
    'commandcenter (commandcenter (flying))': true,
    'starport': true,
    'techlab (starport) (starport) (starport)': true,
    'refinery': true,
    'techlab (factory) (factory) (factory)': true,
    'armory': true,
    'ghostacademy': true,
    'techlab (barracks) (barracks) (barracks)': true,
    'hatchery': true,
    'larva': true,
    'drone': true,
    'overlord': true,
    'spawningpool': true,
    'creeptumorburrowed': true,
    'roachwarren': true,
    'banelingnest': true,
    'evolutionchamber': true,
    'lair': true,
    'spinecrawler (spinecrawler (uprooted))': true,
    'mineralfield4': true,
    'barracks (barracks (flying))': true,
    'factory (factory (flying))': true,
    'starport (starport (flying))': true,
    'reactor': true,
    'orbitalcommand (orbitalcommand (flying))': true,
    'spire': true,
    'extractor': true,
    'changeling': true,
    'infestationpit': true,
    'hive': true,
    'greaterspire': true,
    'stargate': true,
    'nydusnetwork': true,
  }
}

// compute total resource for each unit
for (var expansion_tag in Sc2.armyUnits) {
  for (var unitname in Sc2.armyUnits[expansion_tag]) {
    Sc2.armyUnits[expansion_tag][unitname][3] = Sc2.armyUnits[expansion_tag][unitname][0] + Sc2.armyUnits[expansion_tag][unitname][1];
  }
}

// I'd rather stuff these here, than in Match

Sc2.frameToTime = function(frame) {
  minute = Math.floor(frame / (60 * 16));
  second = Math.floor((frame / 16) % 60).toString();
  if (second.length < 2) {
    second = "0" + second;
  }
  return minute + ":" + second;
}

Sc2.timeToFrame = function(time) {
  parts = time.split(':');
  seconds = parseInt(parts[parts.length-1]);
  minutes = parseInt(parts[parts.length-2]);
  frame = ((minutes*60) + seconds) * 16;
  return frame;
}

Sc2.armyInfo = function(expansion_tag, unitname, infonum) {
    return Sc2.armyUnits[expansion_tag][unitname][infonum];
}

Sc2.isArmyUnit = function(unitname) {
    return (unitname in Sc2.armyUnits['HotS']);
}
