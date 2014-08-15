describe('notifications', function() {
  it('should compile', inject(function($rootScope, $compile) {
    element = $compile("<notifications></notifications>")($rootScope);
    $rootScope.$digest();
  }));
});