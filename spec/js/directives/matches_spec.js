describe('matches', function() {
  it('should compile', inject(function($rootScope, $compile) {
    element = $compile("<matches></matches>")($rootScope);
    $rootScope.$digest();
  }));
});