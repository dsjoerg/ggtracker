describe('match', function() {
  it('should compile', inject(function($rootScope, $compile) {
    element = $compile("<match></match>")($rootScope);
    $rootScope.$digest();
  }));
});