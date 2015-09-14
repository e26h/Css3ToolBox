angular.module('modFont', [

]).filter('trimQuote',function(){
	return function(input){
		if (input[0] === "'" || input[0] === '"') {
			return input.slice(1,-1)
		} else{
			return input
		}
	}
}).controller('ctlFont', ['$scope', '$http', function($scope, $http){
	$scope.family = ""
	$scope.size = 1.2
	$scope.style = 'normal'
	$scope.weight = 'normal'
	if (localStorage.fontFamilyDict) {
		$scope.fontFamilys = JSON.parse(localStorage.fontFamilyDict)
		$scope.family = $scope.fontFamilys[0]
	} else {
		// $http.get('Model/fontFamilys.json').success(function(data) {
			var data = [
				"'微软雅黑'","'宋体'","'华文新魏'","'黑体'",
				"'Times New Roman'","sans-serif","monospace"
			]
			localStorage.fontFamilyDict = JSON.stringify(data)
			$scope.fontFamilys = data
			$scope.family = $scope.fontFamilys[0]
		// }).error(function(){
		// 	console.log('字体数据加载错误!');
		// })
	}

	$scope.setWeight = function(num){
		$scope.weight = num
	}
}])