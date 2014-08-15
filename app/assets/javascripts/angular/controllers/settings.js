
gg.controller('SettingsController', ['$scope', '$rootScope', 'Account', 
  function ($scope, $rootScope, Account) {

  // TODO only call this once, the first time a user signs up.
  // could achieve that through form or link API in mixpanel.
  //  mixpanel.alias($rootScope.user.id);

  $scope.addAccount = function() {
    account = new Account();
    account.portrait_css = 'display: none;';
    $scope.user.accounts.push(account);

    return false;
  }

  $rootScope.$watch('user', function() {
    $scope.user = $rootScope.user;
    if ($scope.user.accounts.length == 0) {
        $scope.addAccount();
    }
  });
  
}]);
