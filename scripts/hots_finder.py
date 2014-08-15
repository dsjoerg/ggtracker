import sc2reader
import boto
import StringIO
import re
import string
import os
from boto.s3.key import Key

if not os.path.exists('/Users/david/Downloads/hotsreplays'):
  os.mkdir('/Users/david/Downloads/hotsreplays')
replaybucket = boto.connect_s3('aws_access_key','aws_secret').get_bucket('gg2-replays-prod')
k = Key(replaybucket)

# IN ggtracker prod DB: select md5 from replays where state != 'Done'
# Put that into customresult.csv, then

bad_md5s = open('/Users/david/Downloads/customresult.csv','rb')
for md5 in bad_md5s:
    md5 = md5.strip()
    md5 = string.replace(md5, '"', '')
    if re.search('.sc2replay', md5, re.IGNORECASE) is None:
      md5 = md5 + ".SC2Replay"
    k.key = md5
    print "doing {}".format(md5)
    try:
        stringio = StringIO.StringIO()
        k.get_contents_to_file(stringio)
        rs = sc2reader.load_replay(stringio, load_level=0).release_string
        if rs[0] == '2':
          versdir = '/Users/david/Downloads/hotsreplays/{}'.format(rs)
          if not os.path.exists(versdir):
            os.mkdir(versdir)
          hotsfile = open("{}/{}".format(versdir, md5), 'w')
          k.get_contents_to_file(hotsfile)
          hotsfile.close()
          print "OK! Got {}".format(rs)
        else:
          print "nah its just {}".format(rs)
    except Exception as e:
        print "bah", e
        pass
