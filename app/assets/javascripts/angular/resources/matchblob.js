gg.factory('MatchBlob', ['$resource', function($resource) {
  var MatchBlob = $resource('https://' + gon.global.blobs_bucket + '.s3.amazonaws.com/:id');

  return MatchBlob;
}]);
