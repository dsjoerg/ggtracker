describe('chart', function() {
  it('should compile', inject(function($rootScope, $compile) {
    element = $compile("<chart></chart>")($rootScope);
    $rootScope.$digest();
  }));
});