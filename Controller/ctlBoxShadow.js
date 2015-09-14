angular.module('modBoxShadow', []).controller('ctlBoxShadow', ['$scope', function($scope){
	if (sessionStorage.shadow) {
		$scope.shadow = JSON.parse(sessionStorage.shadow)
	} else {
		$scope.shadow = {
			// 模式 颜色
			t : '', c : '#000000',
			// 垂直 水平
			v : 5,  h : 5,
			// 模糊 外延
			b : 2,  o : 3
		}
		sessionStorage.shadow = JSON.stringify($scope.shadow)
	}
}])