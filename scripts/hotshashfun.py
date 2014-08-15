import sc2reader

hots_hashes = open('/tmp/hotshash.txt','rb')
byend = {}
for hots_hash in hots_hashes:
    url = "http://xx.depot.battle.net:1119/{}.s2gs".format(hots_hash.strip())
    print "Getting {}".format(url)
    summary = sc2reader.load_game_summary(url)
    byend[summary.end_time] = hots_hash
latest_hash = byend[sorted(byend.keys())[-1]]
print latest_hash
