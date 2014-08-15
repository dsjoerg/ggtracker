// http://docs.angularjs.org/guide/dev_guide.mvc.understanding_controller

describe('matches', function() {
  var ctrl = scope = null;

  beforeEach(module('gg'));

  beforeEach(inject(function($controller, $rootScope, $compile, $injector) {
    scope = $rootScope.$new();
    ctrl = $controller('PlayerController', {$scope: scope});
  }));

  it('should set resolution to 100', inject(function($controller) {
    expect(scope.resolution).toBe(100);
  }));
});