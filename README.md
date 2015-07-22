### Introduction

This 'ggtracker' repository is the web server for ggtracker, plus the
HTML/CSS/Javascript that makes the pretty pages pretty.

It does *not* do replay parsing, and delegates queries about players
and matches to the ESDB API.

The other repos involved in ggtracker are:
* https://github.com/dsjoerg/esdb <-- the API server
* https://github.com/dsjoerg/ggpyjobs <-- the replay-parsing python
  server, included by ESDB as a git submodule
* https://github.com/dsjoerg/gg <-- little gem for accessing ESDB,
  used by this codebase


### Requirements

 * Ruby 1.9+ (get RVM: https://rvm.io/)
 * Bundler 1.2.0+ (gem install bundler --pre)
 * Redis
 * node.js, npm (see http://shapeshed.com/setting-up-nodejs-and-npm-on-mac-osx/)
 * juggernaut (npm install -g juggernaut, see https://github.com/maccman/juggernaut)
 * MySQL
 
On Mac OSX, you can use homebrew as package manager: http://mxcl.github.com/homebrew/


### Basic installation and updating

 * Run Bundler (`bundle`)
 * Copy and adjust database configuration (`cp config/database.yml.example config/database.yml`)
 * Copy secrets configuration (`cp config/secrets.yml.example config/secrets.yml`)
 * Copy s3 configuration (`cp config/s3.yml.example config/s3.yml`)
 * Create the database ggtracker needs (`rake db:create`)
 * Load the latest database schema (`bundle exec rake db:schema:load`)

If you want to be able to upload replays, you'll need to have an
Amazon S3 account.  After setting that up, edit your config/s3.yml
file accordingly.


### Starting

`foreman start web`

And then go to http://localhost:3000/ in your browser.

Note: the first time you request a page, it will be slow while it compiles CSS, JS etc.

It'll work, but there will be no matches, no players.  To make it more
interesting, you can simply point your ggtracker at the production
ESDB server like so:

`ESDB_HOST=api.ggtracker.com ESDB_MATCHBLOBS_BUCKET=gg2-matchblobs-prod foreman start web`

And then go to http://localhost:3000/matches in your browser.  If you
see recent matches, it's working!

If you are working on changes that involve replay processing as well,
you can run your own local instance of ESDB; in the default
development configuration, the ggtracker server and ESDB server will
find each other correctly.


### Testing

#### Ruby (rspec)

 The first time you run tests, set up the test database with:
 * `rake db:create`
 * `rake db:test:prepare`

 To run tests: `bundle exec rspec`


#### Test Coverage (ruby, simplecov)

After running rspec, open coverage/index.html in a browser.



#### Javascript (via Testacular, with Jasmine)

NOTE: *The following is obsolete as of 20140815.  If & when more than one person is actively developing GGTracker Javascript code, I'll revive it.*

Install testacular: `npm install -g testacular`

Note: Depending on your system configuration, the executable might not be in your PATH by default. 

Start testacular: `/usr/local/share/npm/bin/testacular start`

This will launch a chrome window (you need chrome installed, of course) and automatically monitor specs for changes.

Run all tests: `/usr/local/share/npm/bin/testacular run`


### I don't understand XXXX

Just ask, I'll add questions and answers to a FAQ here.

