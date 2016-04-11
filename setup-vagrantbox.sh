#!/bin/bash

export DEBIAN_FRONTEND=noninteractive

add-apt-repository ppa:chris-lea/redis-server -y

apt-get update

apt-get install -y ruby redis-server nodejs npm mysql-server git-core ruby-dev libcurl4-openssl-dev libmysqlclient-dev build-essential libxml2-dev libxslt-dev

gem install bundler
npm install -g juggernaut
