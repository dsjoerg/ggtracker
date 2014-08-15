describe('accounts', function() {
  // Note: we need angular-mocks for inject(), and more.
  it('should compile', inject(function($rootScope, $compile) {
    element = $compile("<accounts></accounts>")($rootScope);
    $rootScope.$digest();
  }));
});