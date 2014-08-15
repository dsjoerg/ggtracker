# NOT YET READY FOR PRIMETIME

I still need to test and streamline the installation procedure for interested developers.

So keep it quiet for now, thanks :)


### Requirements

 * Ruby 1.9+ (get RVM: https://rvm.io/)
 * Bundler 1.2.0+ (gem install bundler --pre) [not a hard requirement currently, but will be at some point (see Bundlers 1.2 features)]
 * Redis
 * node.js, npm (see http://shapeshed.com/setting-up-nodejs-and-npm-on-mac-osx/)
 * juggernaut (npm install -g juggernaut, see https://github.com/maccman/juggernaut)
 * MySQL
 
On Mac OSX, I recommend using homebrew as package manager: http://mxcl.github.com/homebrew/

### Basic installation and updating

The first steps that should be done when checking out a fresh copy:

 * Run Bundler (`bundle`)
 * Copy and adjust database configuration (`cp config/database.yml.example config/database.yml`)
 * Create the database ggtracker needs (`mysql -u root` and then `create database ggtracker_development;` and then `quit`)
 * Run migrations (`bundle exec rake db:migrate`)

Whenever you pull in changes to Gemfile* or db/migrations, you should run Bundler or migrations, then check integrity by running specs.

Make sure to keep your bundle updated (especially the gg gem, which will receive updates often): `bundle update gg`

### Keeping npm/node updated

Note: node includes npm, which should be sufficient. If you installed npm before node, you may have to `brew link -f node`

Remember to keep node and npm updated. It's a little convoluted, due to their love for shellscript installers, but should be painless:

update/install npm: `curl https://npmjs.org/install.sh | sh`
update/install node: `brew install node`

There are massive differences at times between minor revisions for both of these. Versions for development as of 9/16: npm 1.0.106, node 0.8.8

### Starting

To boot up the rails application, use `rails s` for Webrick or `foreman start web` to start Unicorn via Foreman.

If you need the full stack (Juggernaut for websockets/push, Resque for background jobs) use `foreman start` or `foreman start [component]` - see Procfile for components of the full stack.

#### Running on multiple systems

If you're running ggtracker and esdb on different systems (or just a system different than the one used to access ggtracker web), you need to set the ESDB host manually (it defaults to localhost:9292 in development) by setting the ESDB_HOST environment variable:

`ESDB_HOST=192.168.2.102:9292 foreman start web`

### Database Dumps

Once necessary, there will be dumps at https://github.com/ggtracker/ggtracker/downloads

Make sure you run migrations on these, especially if you pick an older one.

### Testing

#### Javascript (via Testacular, with Jasmine)

Install testacular: `npm install -g testacular`

Note: Depending on your system configuration, the executable might not be in your PATH by default. 

Start testacular: `/usr/local/share/npm/bin/testacular start`

This will launch a chrome window (you need chrome installed, of course) and automatically monitor specs for changes.

Run all tests: `/usr/local/share/npm/bin/testacular run`

#### Ruby (rspec)

Make sure you have your test database set up in config/database.yml and created, then prepare it via `rake db:test:prepare` (run this after applying new migrations, it applies the schema to your test database)

Execute all specs: `bundle exec rspec`

To create specs, you can use the rspec: generators (e.g. `rails g rspec:controller <name>`)

#### Test Coverage (ruby, simplecov)

To see our test coverage, simply run all specs and open coverage/index.html in a browser!

## Caching

Varnish is used via the varnish_frontend recipe (which adds a NAT route to work with HAProxy)

A quick rundown of how and why this works:

Rails sets HTTP caching headers (Cache-Control) in application_controller#setup_http_caching - these are picked up by varnish and determine whether it should cache the response or not.

Rails also sets a cookie named "cctrl" via Warden callbacks in config/initializers/warden.rb which when set will make Varnish pass through all requests to Rails, effectively disabling all caching for logged in users.

To ensure that the browser checks with us, we let Varnish modify Cache-Control (setting it to no-cache) to disable caching.

All varnish configuration is in the recipe, at cookbooks/varnish_frontend/templates/default/app.vcl.erb

## Deployment
### How to avoid depedency injection issues

If you're seeing javascript errors like `Uncaught Error: Unknown provider: e from gg` in production, make sure all angular code has proper dependency injection set up. When minifying/obfuscating the javascript code, method names and arguments are being renamed. To avoid problems with this, you should use `factory` (and it's friends `controller`, etc.) wherever you need to inject dependencies.

e.g. instead of this:

    SomeController = function(dependency) {}
    
Do this:

    gg.controller('SomeController', ['dependency', function(dependency){}]);

For more information, read: http://docs.angularjs.org/guide/di

### Notes on debugging dependency injection:

As said, one of the most prominent pointers are "xProvider" missing errors and these will only appear once we've minified/uglified the code, so it's hard to track them down. 

 * Run ggtracker in production, precompile all assets
 * Always restart the appserver, and re-precompile the assets before you do
 * Start with retracing any recent changes, then remove/comment them out entirely until the problem goes away
 * Then start re-introducing code until it re-appears

May be an obvious procedure, but even I forget restarting the appserver from time to time, or precompilation after a step, or even attempt to debug it by trying to read the minified code.. just don't. It's nasty.

Also, as I've outlined above, these are likely DI issues and as such you can also just grep for a controller that slipped by without proper definition:

$ find app/assets/javascripts/|xargs grep "controller: f"
(TODO: figure out an elaborate grep regex that also greps for directive/factory definitions that aren't an array and.. add a pre-commit hook that dies a horrible death?)

## Styling Rules

I'll keep a very concise list of things to do and not to do in the CSS structure that is established here, just for the record.

 * Do not listen to random blogs on the internet. Almost nothing has a "best practice" in how you structure stylesheets, it's always app specific.
 * Do not separate position and color, or anything really. This is something people in 2000 thought would be cool. It is not and has never been. One block per selector.
 * Do not try to group stuff, keep things in the order and structure that the intended usage dictates. li inside ul blocks, etc.
 * Use [SCSS](http://sass-lang.com/). It's like looking into the future. Nesting rules is a thing of beauty. Do NOT use Sass (or HAML for that matter)! I would rather kill myself than convert another SASS stylesheet hell into proper (S)CSS.
 * Use [Compass](http://compass-style.org/). Do not user browser specific rules - if one exists, it's likely the Compass framework has a helper for it.
 * Do not apply (location) specific styles to generic components when it can be helped. If that button needs to be blue on one page and green on the other, give the button style a way to do that. At the very least, give it .button-green and .button-blue classes that you then apply instead of giving #pageN .button the color green.
 * If it belongs inside a widget (directive, controller, etc.), it puts the styles in its own file or else it gets the hose again.

Plus more implicit rules that are so engrained in my muscle memory that I can't think of them right now.

### About Bootstrap Usage

I've opted to not use all-out bootstrap because it makes customizations a mess, much more complex than necessary and will include even more unused code. However, bootstrap is very good CSS and javascript. As such, it makes cherrypicking the features you want very easy.

Here's some notes for the future:

 * Whenever there is time, it may be worthwhile to write a quick rake task that pulls in, updates and automatically translate or just outright uses bootstraps LESS. Until then, simply taking the LESS code and translating ".<include>" calls into "@include <include>" and @variables into $variables is also just a 5-minute-job.
 * All of bootstraps CSS/JS is in either javascripts/bootstrap or stylesheets/ui, named exactly like it is in bootstrap.
 * Modifications to bootstrap are done after bootstrap is included, outside of the bootstrap files. They are always left genuine (apart from translation into SCSS.)

### HTML5!

 * Don't use <section> to arbitrarily replace <div> - sections are meant to be a section of content, says Captain Obvious.
 * There really only is one <header>, it has the navigation, period. Same goes for <footer>

Here's a small read on the subject: http://html5doctor.com/avoiding-common-html5-mistakes/

Bottom line: most of the new tags in HTML aren't meant to be styling aids. They have a CLEAR semantic meaning. We should not abuse them. You can never go wrong with a <div> when in doubt. It's better to have no semantic structure than to have it wrong.
  
Some class naming aids in "my style":

 * header and footer are the header and footer of the page. Only one exists. Don't ever give anything a class name "header" - use "top", "bottom" and "middle" to denote their structural position if necessary. You might see me calling something "head" from time to time, which then is because ..it's actually a heading, such as the global "head" sitting in .content - it's huge, unique and unmistakably a heading element. I don't call it head because it's on top.
 * Don't use id for anything that isn't unique. No id shall ever be used twice on a page. When in doubt: class, not id.