// Something confusing is going on when calling the directive "account" and
// I simply don't have the time or muse to trace it right now.
// It'll die crying the directive has asked for an isolate scope twice.

gg.directive('uaccount', ['Account', function(Account) {
  return {
    restrict: 'C',
    scope: {
      account: '=',
      user: '='
    },

    controller: ['$scope', function($scope) {
      $scope.validateBnetUrl = function(v) {
        return (typeof v == 'string' && v.match(/http[s]*:\/\/\w+\.battle\.net\/sc2\/\w+\/profile\/\d+\/\d\/.+/g)) ? true : false;
      }
    }],

    link: function(scope, element, attrs, ctrl) {
      scope.delete = function() {
          var r = confirm("Are you sure you want to delete your connection to this Battle.net account?");
          if (r == true) {
              account = new Account({id: scope.account.id, account: scope.account});
              account.$remove({id: account.id});
              scope.$parent.$parent.user.accounts = _.reject(scope.$parent.$parent.user.accounts, function(uaccount) {return parseInt(uaccount.id) == parseInt(account.id)})
          }
      }

      scope.delete_all_matches = function() {
          var r = confirm("Are you sure you want to delete all the matches in GGTracker for this Battle.net account?");
          if (r == true) {
              $.ajax({
                  url: '/accounts/' + scope.account.id + '/destroy_all_matches',
                  type: 'POST',
                  success: function() {
                      alert("We have started deleting your matches.");
                  },
                  error: function() {
                      alert("Sorry, your matches could not be deleted for some reason.  Please contact hello@ggtracker.com and we will beat the person responsible.");
                  }

                  // next steps through the code:
                  //
                  // ggtracker: app/controllers/accounts_controller.rb destroy_all_matches
                  // gg: lib/esdb/identity.rb destroy_all_matches
                  // esdb: esdb/api/identities.rb  post ':id/destroy_all_matches'
                  // esdb: esdb/jobs/sc2/identity/delete_all_matches.rb
                  // esdb: esdb/games/sc2/identity.rb destroy_all_matches!
              });
          }
      }

      scope.save = function() {
        scope.account.profile_url = scope.account.profile_url.replace('https://', 'http://');
        scope.account.profile_url = decodeURIComponent(scope.account.profile_url);
        if (scope.account.profile_url.slice(-1) != '/') {
            scope.account.profile_url = scope.account.profile_url + '/';
        }
        
        // TODO: I'm namespacing the data away here but I don't fully 
        // understand why it doesn't do this by default (for the $save call)
        // because it does it just fine on new objects (and the resource
        // instantiation should also be moved away..)
        account = new Account({id: scope.account.id, account: scope.account});

        // Note: there was a way to bind this in the resource, but @id doesnt
        // work anymore.. figure out what they changed it to.
        account.$save({id: account.id});
        
        return false;
      }
      
      scope.makePrimary = function() {
        scope.user.primary_account_id = scope.account.id;
        $.ajax({
          url: '/users/' + scope.user.id,
          type: 'POST',
          data: {
            user: {
              primary_account_id: scope.account.id
            }
          }
        });
      }

      ggtip($(element).find('.state-queued, .state-unauthed'));

      // And while we're at it..
      $(element).find('.action')
        .text(parseInt(scope.account.id) > 0 ? 'update' : 'save')
        .click(function(){ $(element).addClass('processing'); });
    }
  }
}]);

