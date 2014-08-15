### Introduction

This 'ggtracker' repository is the web server for ggtracker, plus the
HTML/CSS/Javascript that makes the pretty pages pretty.

It does *not* do replay parsing, and delegates queries about players
and matches to the ESDB API, both of which are in other repos:

* ESDB <-- the ruby API server, planning to make this public but it's not ready yet
* https://github.com/dsjoerg/ggpyjobs <-- the replay-parsing python server
* https://github.com/dsjoerg/gg <-- little gem for accessing ESDB


### Requirements

 * Ruby 1.9+ (get RVM: https://rvm.io/)
 * Bundler 1.2.0+ (gem install bundler --pre)
 * Redis
 * node.js, npm (see http://shapeshed.com/setting-up-nodejs-and-npm-on-mac-osx/)
 * juggernaut (npm install -g juggernaut, see https://github.com/maccman/juggernaut)
 * MySQL
 
On Mac OSX, I recommend using homebrew as package manager: http://mxcl.github.com/homebrew/


### Basic installation and updating

 * Run Bundler (`bundle`)
 * Copy and adjust database configuration (`cp config/database.yml.example config/database.yml`)
 * Copy secrets configuration (`cp config/secrets.yml.example config/secrets.yml`)
 * Copy s3 configuration (`cp config/s3.yml.example config/s3.yml`)
 * Create the database ggtracker needs (`mysql -u root` and then `create database ggtracker_development;` and then `quit`)
 * Run migrations (`bundle exec rake db:migrate`)

### Starting

`foreman start web`

And then go to http://localhost:3000/ in your browser.

Note: the first time you request a page, it will be slow while it compiles CSS, JS etc.

It'll work, but there will be no matches, no players.  To make it more interesting, point your ggtracker at the production ESDB server like so:

`ESDB_HOST=api.ggtracker.com ESDB_MATCHBLOBS_BUCKET=gg2-matchblobs-prod foreman start web`

And then go to http://localhost:3000/matches in your browser.  If you see recent matches, it's working!


### Testing

#### Ruby (rspec)

 The first time you run tests, set up the test database with:
 * `mysql -u root`
 ** `create database ggtracker_test;`
 ** `quit`
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


### Keeping npm/node updated

update/install npm: `curl https://npmjs.org/install.sh | sh`
update/install node: `brew install node`

Note: node includes npm, which should be sufficient. If you installed npm before node, you may have to `brew link -f node`
