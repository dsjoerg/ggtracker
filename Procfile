web: bundle exec unicorn -p3000
# resque: bundle exec rake resque:work QUEUE=*
log: tail -f -n0 log/development.log
juggernaut: juggernaut --port 5300
# varnish: varnishd -a 0.0.0.0:8181 -T 0.0.0.0:8282 -f config/app.development.vcl -F