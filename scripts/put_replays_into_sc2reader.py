import sc2reader
import os
import shutil
import sys

def main():
    for argument in sys.argv[1:]:
        for path in sc2reader.utils.get_files(argument,extension='SC2Replay'):
            try:
              print "doing {}".format(path)
              rs = sc2reader.load_replay(path, load_level=0).release_string
              versdir = '/Users/david/Dropbox/Public/sc2replays/{}'.format(rs)
              if not os.path.exists(versdir):
                os.mkdir(versdir)
              shutil.copy(path, versdir)
            except Exception as e:
              print "bah", e
              pass

if __name__ == '__main__':
    main()
