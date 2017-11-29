// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// the compiled file.
//
// WARNING: THE FIRST BLANK LINE MARKS THE END OF WHAT'S TO BE PROCESSED, ANY BLANK LINE SHOULD
// GO AFTER THE REQUIRES BELOW.
//

//=require setdocdomain.js

// These will require from the jquery-rails gem:
//require jquery
//require jquery_ujs

//= require ./various/sha1.js
//= require ./various/juggernaut.js

// But, I'd rather not have gem paths floating around JS tests.
//= require ./jquery/jquery-1.8.3.min.js

// Get the latest jquery_ujs from github, if you're using it..
// https://github.com/indirect/jquery-rails/blob/master/vendor/assets/javascripts/jquery_ujs.js
//require ./rails/jquery_ujs.js

//= require ./jquery/select2.js
//= require ./jquery/jquery-ui-1.9.1.custom.min.js
//= require ./jquery/jquery.fileupload.js
//= require ./jquery/jquery.iframe-transport.js
//= require ./jquery/jquery.timeago.js
//= require ./jquery/jquery.placeholder.js

// Now we have two tooltip libraries here because bootstraps port of tipsy
// missed one important thing: ne/nw/se/sw positioning.
// TODO: port it to a custom placement function? replace popover as well to get
// rid of bootstrap-tooltip?
//= require ./jquery/jquery.tipsy.js

// Cherry picks from bootstrap
// bootstrap-tooltip is here because bootstrap-popover requires it.
//= require ./bootstrap/bootstrap-tooltip.js
//= require ./bootstrap/bootstrap-popover.js
//= require ./bootstrap/bootstrap-dropdown.js

//= require ./angular/1.1.0/angular.js
//= require ./angular/1.1.0/angular-resource-patched.js
//= require ./angular/1.1.0/angular-sanitize.js
//= require ./angular/1.1.0/angular-mocks.js

// More cherry picking from angular-ui
// https://github.com/angular-ui/
//= require ./angular/ui/common/module.js
//= require ./angular/ui/modules/directives/validate/validate.js

//= require highcharts.js
//= require highcharts-more.js
//= require highcharts-theme.js
//= require angular.js

//= require underscore-min.js
//= require_tree ./angular/helpers/
//= require_tree ./angular/resources/
//= require_tree ./angular/directives/
//= require_tree ./angular/templates/
//= require_tree ./angular/services/
//= require_tree ./angular/controllers/
//= require ./angular/filters.js

function dontDoThisEither() {
    //  Proxino.log("log this");
  throw "help i'm having a cloudfront problem";
}

function ggtip(elms) {
  elms.tipsy({
    className: 'htmltip',
    title: function(){
      if($(this).data('content')) { return $(this).data('content'); }
      return $(this).next().html();
    },
    html: true,
    opacity: 1.0,
    offset: 10,
    // gravity: 'sw'
    gravity: $.fn.tipsy.autoBounds(10, 'sw')
  });
};

gg.regionname = {}
gg.regionname['am'] = 'AM';
gg.regionname['us'] = 'AM';
gg.regionname['eu'] = 'EU';

leaguename[6] = 'grandmaster';
leaguename[5] = 'master';
leaguename[4] = 'diamond';
leaguename[3] = 'platinum';
leaguename[2] = 'gold';
leaguename[1] = 'silver';
leaguename[0] = 'bronze';

leaguelabel[6] = 'gm';
leaguelabel[5] = 'mstr';
leaguelabel[4] = 'dia';
leaguelabel[3] = 'plat';
leaguelabel[2] = 'gold';
leaguelabel[1] = 'slvr';
leaguelabel[0] = 'brnz';

gg.leaguecolor = {}
gg.leaguecolor[6] = 'DeepPink';
gg.leaguecolor[5] = 'Navy';
gg.leaguecolor[4] = 'YellowGreen';
gg.leaguecolor[3] = 'MediumTurquoise';
gg.leaguecolor[2] = 'Gold';
gg.leaguecolor[1] = 'lightGrey';
gg.leaguecolor[0] = 'Peru';

/* 3.50 to 3.84 is low diamond.
    3.84 to 4.16 is diamond.
    4.16 to 4.50 is high diamond.
    so the range for diamond is 3.50 to 4.5
*/
function leaguename(leaguenum) {
    if (leaguenum > 6.49) {
        leaguenum = 6.49;
    }
    leagueint = Math.round(leaguenum);
    leagueint = Math.max(0, leagueint);
    leagueint = Math.min(6, leagueint);

    leagueremainder = Math.round(leaguenum * 100.0) % 100;
    modifier = "";
    if (leagueremainder >= 50 && leagueremainder <= 84) {
        modifier = "low ";
    } else if (leagueremainder >= 16 && leagueremainder <  50) {
        modifier = "high ";
    }

    //    console.log("leaguename", leaguenum, modifier + leaguename[leagueint]);
    return modifier + leaguename[leagueint];
}

function leaguelabel(leaguenum) {
    leagueint = Math.round(leaguenum);
    leagueint = Math.max(0, leagueint);
    leagueint = Math.min(6, leagueint);

    leagueremainder = Math.round(leaguenum * 100.0) % 100;
    modifier = "";
    if (leagueremainder >= 50 && leagueremainder <= 84) {
        modifier = "lo ";
    } else if (leagueremainder >= 16 && leagueremainder <  50) {
        modifier = "hi ";
    }
    //    console.log("leaguelabel", leaguenum, leagueint, leaguelabel[leagueint]);
    return modifier + leaguelabel[leagueint];
}

format_minutes = function(minutes) {
    var floatseconds = minutes * 60.0;
    var intseconds = Math.round(floatseconds);

    var mins = Math.floor(intseconds / 60.0).toString();
    var seconds = (intseconds % 60).toString();
    if (seconds.length < 2) {
        seconds = "0" + seconds;
    }
    return mins + ':' + seconds
}

chart_tooltip_2 = function(id) {
  var description;
  switch (id) {
    case "income": description = "income"; break;
    case "apm":  description = "APM"; break;
    case "wwpm": description = "worker waves per minute"; break;
    case "armystrength": description = "army value"; break;
    case "workersactive": description = "active worker count"; break;
    case "upgradespending": description = "upgrade spending"; break;
    case "num_bases": description = "active base count"; break;
    case "creep_spread": description = "creep spread<br>in map percent"; break;
    case "replayincome": description = "mineral income<br>per minute"; break;
    case "replaygasincome": description = "gas income<br>per minute"; break;
    case "replaylost": description = "total resources<br>lost in combat"; break;
    case "replayminerals": description = "banked minerals"; break;
    case "replaygas": description = "banked gas"; break;
    case "replaytotalincome": description = "total resources<br>gathered"; break;
    case "replayworkers": description = "active worker count"; break;
    default: return null;
  }
  return function() {
        return this.series.name + '\'s ' +
        description + ' was <b>' +
        this.y.toFixed(0) +
          '</b><br>at ' +
          format_minutes(this.x)
  }
}

chart_tooltip = function(id, thename) {
  switch (id) {
    case "winchart":  return function() {
        return thename + ' won <b>' +
          this.points[0].y.toFixed(0) +
          '</b>%<br>of matches #' +
          Math.max(1, this.x - 9) +
          '-' + (this.x);
    }
    case "wpmchart":  return function() {
        return thename + ' made <b>' +
          this.points[0].y.toFixed(1) +
          '</b> worker waves<br>per minute in matches #' +
          Math.max(1, this.x - 9) +
          '-' + (this.x);
    }
    case "apmchart":  return function() {
        return thename + '\'s apm was <b>' +
          this.points[0].y.toFixed(0) +
          '</b><br> in matches #' +
          Math.max(1, this.x - 9) +
          '-' + (this.x);
    }
    case "spendingchart":
      return function() {
        return thename + ' spent like a <b>' +
        leaguename(this.points[0].y) +
          '</b><br>player in matches #' +
          Math.max(1, this.x - 9) +
          '-' + (this.x);
    }
    case "sat1chart":
      return function() {
        return thename + ' achieved fully saturated<br>1st base mineral income<br>as quickly as a <b>' +
        leaguename(this.points[0].y) +
          '</b><br>player in matches #' +
          Math.max(1, this.x - 9) +
          '-' + (this.x);
      }
    case "sat2chart":
      return function() {
        return thename + ' achieved fully saturated<br>2nd base mineral income<br>as quickly as a <b>' +
        leaguename(this.points[0].y) +
          '</b><br>player in matches #' +
          Math.max(1, this.x - 9) +
          '-' + (this.x);
      }
  }
};

yAxis_tooltip = function(id) {
  switch (id) {
    case "spendingchart":
    case "sat1chart":
    case "sat2chart":
      return function() {
      return leaguelabel(this.value);
    }
  }
};

function isFinalState(state) {
  return (state == "done" || state == "error" || state == "failed")
}

// whenever a replay changes to a non-final state, we set (or reset) a
// 60-second timer to force it to finality if necessary.  that way the
// user is _never_ left staring at an upload screen forever, even if
// we have bugs or a huge queue on the server side somewhere.
function setState(replay, newState) {
  uploadScope = angular.element($('.uploads')).scope();
  replay.state = newState;

  if (! _.isUndefined(replay.forgetAboutIt)) {
    clearTimeout(replay.forgetAboutIt);
    delete replay.forgetAboutIt;
  }

  if (! isFinalState(replay.state)) {
    replay.forgetAboutIt = setTimeout( function() {
      uploadScope.$apply(function() {
        setState(replay, "error");
      });
    }, 60000);
  }

  throttledUploadDigest();
}

// what URL should we go to after uploading the given list of replays?
function urlAfterUploading(replays) {
  // console.log("urlAfterUploading", replays);

  if (replays.length == 0) {
      //    Proxino.log("urlAfterUploading(). Somehow we have no replays to consider! returning null.");
    return null;  // wtf
  }

  match_ids = _.pluck(replays, "match_id");
  // Proxino.log("urlAfterUploading(). We have plucked match_id from " + match_ids.length + " replays.");

  match_ids = _.reject(match_ids, function(match_id) { return _.isUndefined(match_id) || _.isNull(match_id) || match_id == "null" });
  // Proxino.log("urlAfterUploading(). There are " + match_ids.length + " of them with non-null match_ids.");

  //  console.log("aaa", match_ids);

  if (match_ids.length == 0) {
      //    Proxino.log("urlAfterUploading(). No match IDs, returning null. There were " + replays.length + " replays.  First replay was " + JSON.stringify(replays[0]));
    return null;  // didnt parse anything, so don't change url.
  }

  // lets count how many times each identity appears.
  // TODO favor an ident that this User is associated with, at least to break ties.
  ident_ids = _.flatten(_.map(_.pluck(replays, "ident_ids"), function(ident_ids_string) { return eval(ident_ids_string) }));
  if (ident_ids.length == 0) {
      //    Proxino.log("urlAfterUploading(). No ident_ids, returning null.");
    return null;  // somehow don't have identity ids, so don't change url.
  }

  ident_ids = _.reject(ident_ids, function(ident_id) { return _.isUndefined(ident_id) || _.isNull(ident_id) || ident_id == "null" });
  if (ident_ids.length == 0) {
      //    Proxino.log("urlAfterUploading(). No non-null ident_ids, returning null.");
    return null;
  }

  ident_counts = _.countBy(ident_ids, function(ident_id) { return ident_id });
  counts_only = _.values(ident_counts);
  highest_count = _.max(counts_only);
  if (highest_count < 2) {
    // no identity appears more than once, so lets just show a match.
    if (match_ids[0] == "null") {
        // can this happen?
        //      Proxino.log("urlAfterUploading(). First match_id is null, returning null.");
      return null;
    }
    return "/matches/" + match_ids[0];  
  }
  ident_count_to_show = _.find(_.pairs(ident_counts), function(ident_count) { return ident_count[1] == highest_count });
  //  console.log("thing", ident_counts, counts_only, highest_count, ident_count_to_show);

  if (ident_count_to_show[0] == "null") {
        // can this happen?
      //    Proxino.log("urlAfterUploading(). ident_count_to_show[0] is null, returning null.");
    return null;
  }
  return "/players/" + ident_count_to_show[0];
}

throttledUploadDigest = _.throttle(function() {
  //  var start = new Date().getTime();
  //  console.log("throttled uploads digest is happening now!");
  uploadScope = angular.element($('.uploads')).scope();
  uploadScope.$digest();
  //  var end = new Date().getTime();
  //  var time = end - start;
  //  console.log("throttled uploads digest is done, took " + time + " millis.");
}, 1000);

// 0 anon, 1 free, 2 paid
userLevel = function() {
    if (gon.user) {
        if (gon.user.pro) {
            return 2;
        } else {
            return 1;
        }
    } else {
        return 0;
    }
}

uploadLimit = function() {
    if (gg.limits) {
        return gg.limits[userLevel()];
    } else {
        return [1, 1, 9999];
    }
};

blockForShutdown = function() {
    var shutdownLimit = 1;
    if (gg.limits) {
        shutdownLimit = gg.limits[3];
    }
    return (Math.random() * 100 < shutdownLimit);
}

notifyAboutUploadLimit = _.once(function() {
  accountDescrip = ["Anonymous", "Free", "Pro"][userLevel()];
  ul = uploadLimit();
  if (ul <= 1 || userLevel() == 2) {
      apology = "Hi!  We are kinda overloaded right now.  ";
  } else {
      apology = "";
  }
  if (ul == 1) {
      plural = "";
  } else {
      plural = "s";
  }
  alert(apology + accountDescrip + " accounts are limited to " + uploadLimit() + " replay" + plural + " per upload.  You can upload more any time you want.");
});

notifyAboutGGGReplays = _.once(function() {
    alert("Hi, GGTracker is shutting down but you can upload your replays to GGGReplays.com (a GGTracker clone), or to SC2ReplayStats.com or Drop.sc.");
});

$(function() {

  fuconfig = {
    url: 'https://' + gon.global.replays_bucket + '.s3.amazonaws.com',
    type: 'POST',
    autoUpload: true,
    dataType: 'xml',
    add: function(e, data) {
//      console.log("add!", data.files.length);

      if (gg.state.iecompat) {
          alert("Our apologies, but this browser can't upload replays to GGTracker.  To upload replays, you can use Internet Explorer 10, Google Chrome, Firefox or Safari.");
          return false;
      }

      uploadScope = angular.element($('.uploads')).scope();

      if (_.isUndefined(rootScope.creplays) || rootScope.creplays.length == 0) {
        // creplays are the replays that are still being uploaded/processed.
        // allreplays has all of the replays that were uploaded for this upload, regardless of their state
        uploadScope.creplays = []
        uploadScope.allreplays = []
        // console.log("clearing arrays!");

        $('#uploads')
          .dialog({
            modal: true,
            draggable: false,
            resizable: false,
            dialogClass: 'dialog-uploads',
            width: 'auto',
            position: { my: 'top', at: 'top+75' },
            collision: 'none',
            show: 'slide'
          }).
          addClass('uploads-expanded');

        $(window).bind('beforeunload', function () {
                //                console.log("beforeunload!", $('.button-upload input'), $('.button-upload input').data('fileupload'), uploadScope);
                //                return 'Foo!';
          if ($('.button-upload input').data('fileupload')._active > 0 &&
            uploadScope.creplays.length > 0) {
          
              //            console.log("Not leaving yet", $('#upload input').data('fileupload'), $('#upload input').data('fileupload')._active);
            return 'Leaving now will cancel your uploads in progress.';
          }
        });
      }

      if (uploadScope.allreplays.length >= uploadLimit()) {
          notifyAboutUploadLimit();
          return false;
      } else if (blockForShutdown()) {
          notifyAboutGGGReplays();
          return false;
      } else {


      replay = {
        progress: 0,
        status: '-',
        state: '-',
        replay_file_name: data.files[0].name
      };
      uploadScope.creplays.push(replay);
      uploadScope.allreplays.push(replay);
      throttledUploadDigest();

      $.ajax({
        url: "/signed_urls",
        type: 'GET',
        dataType: 'json',
        data: {doc: {title: data.files[0].name}}, // send the file name to the server so it can generate the key param
        async: false,
        success: function(ajaxdata) {
          data.formData = {
            key: ajaxdata.key,
            AWSAccessKeyId: gon.global.replays_access_key,
            acl: 'public-read',
            policy: ajaxdata.policy,
            signature: ajaxdata.signature,
            success_action_status: '201'
          };
          data.submit();
        }
      });
      }
    },

    send: function(e, data) {
      uploadScope = angular.element($('.uploads')).scope();
      $.each(data.files, function(i, file) {
        replay = _.find(uploadScope.creplays, function(rep) { return rep.replay_file_name == file.name })
        if (! _.isUndefined(replay)) {
          replay.status = 'Uploading';
          setState(replay, 'Uploading');
        }
      });
      throttledUploadDigest();
    },
  
    drop: function(e, data) {
    },
  
    change: function(e, data) {
    },

    progress: function (e, data) {
              //              console.log("progress");

      var progress = parseInt(data.loaded / data.total * 100, 10);

      uploadScope = angular.element($('.uploads')).scope();
      replay = _.find(uploadScope.creplays, function(rep) { return rep.replay_file_name == data.files[0].name })

      if(! _.isUndefined(replay)) {
        replay.progress = progress;
        if(progress == 100) {
          replay.status = 'Waiting to be processed';
          setState(replay, 'processing');
        }
      } else {
          // console.log('NNAYITS1238', data.files[0].name, rootScope.creplays, replay);
      }
      
      throttledUploadDigest();
    },
  
    done: function(e, data) {
              // console.log("done! ", $(data.result.getElementsByTagName("Location")[0]).text(), data.files[0].name);

      $.ajax({
        url: '/replays/s3_drop',
        type: 'POST',
        data: {
          file_name: data.files[0].name,
          s3_key: $(data.result.getElementsByTagName("Key")[0]).text(),
          channel: gg.settings.replay_channel
        },
        async: true,
      });
    }
  };  // fuconfig

  $('.button-upload input[name="file"]').fileupload(fuconfig);
  $('.button-upload input[name="differentname"]').fileupload(fuconfig);

  join = function(which_one) {

    $('#join .form').hide();
    $("#join .form-" + which_one).show();

    $('#join').dialog({
      modal: true,
      draggable: false,
      resizable: false,
      dialogClass: 'dialog-plain',
      width: 600,
      height: 'auto'
    });

    $('.ui-widget-overlay').click(function() {
      $('#join').dialog('close');
    });

    return false;
  }


  $('a.signup').click(function() { join("join"); });
  $('header a.login').click(function() { join("login"); });
  
  // quick toggle hax
  $('.toggle').each(function() {
    $(this).click(function() {
      $('.toggle').each(function() { $('[class*='+$(this).data('toggle')+']').hide(); });
      $('[class*='+$(this).data('toggle')+']').show();
      return false;
    });
  });

  // Tooltips!
  $('.tooltipped').tipsy();

  // TODO remove this in favor of ggtipper
  ggtip($('.accounts .state-queued, .accounts .state-unauthed'));

  // and popovers! Large tooltips, for better.. I don't know
  // Primary usage for popover is .help:

  $('.help').popover({
    trigger: 'hover',
    // if 'data-content' is given, this will not be used.
    html: true,
    content: function(e){return $(this).next().html();}
  });

  // One could also use modernizr to do this conditionally, but ..it's
  // our only compatibility code currently (if you don't count JSON)
  $('input').placeholder();
});

