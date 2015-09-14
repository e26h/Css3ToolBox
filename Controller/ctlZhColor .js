angular.module('modColor', [

]).controller('ctlColor', ['$scope', '$http', function($scope, $http) {
	$scope.orderVal = 'id'
	if (sessionStorage.ColorDict) {
		$scope.colors = JSON.parse(sessionStorage.ZhColorDict)
		console.log('本地色彩数据加载成功!');
	} else {
		$http.get('Model/ZhColors.json').success(function(data) {
			function getH(r, g, b) {
				var h = 1
				return h
			}

			function getS(r, g, b) {
				var s = 1
				return s
			}

			function getB(r, g, b) {
				return (r * 299 + g * 587 + b * 114) / 1000
			}

			function colorFactory(id, name, hex, H) {
				var color = {
					id: id,
					name: name,
					hex: hex,
					r: hex.slice(1, 3),
					g: hex.slice(3, 5),
					b: hex.slice(5),
					rgb: '',
					h: '',
					s: '',
					l: '',
					hsl: '',
					c: ""
				}
				var r = parseInt(color.r, 16),
					g = parseInt(color.g, 16),
					b = parseInt(color.b, 16)
				color.rgb = 'rgb(' + r + ',' + g + ',' + b + ')'
				color.h = getH(r, g, b)
				color.s = getS(r, g, b)
				color.l = getB(r, g, b).toString(16)
					// 补0
				if ((color.l).indexOf('.') === 1) {
					color.l = '0' + color.l
				}
				var h = 1,
					s = 1,
					l = getB(r, g, b).toFixed(0).toString()
					// 补空
					// switch(l.length){
					// 	case 1:
					// 		l = '  '+l
					// 		break;
					// 	case 2:
					// 		l = ' '+l
					// }
				color.hsl = 'hsl(' + h + '%,' + s + '%,' + l + ')'

				return color
			}
			var arr = new Array((data.length))
			for (var i = data.length - 1; i >= 0; i--) {
				arr[i] = colorFactory(data[i].id, data[i].name, data[i].hex)
			};
			$scope.colors = arr
			sessionStorage.ColorDict = JSON.stringify(arr)
			console.log('色彩数据加载成功!');
		}).error(function() {
			console.log('色彩数据加载错误!');
		})
	}
	$scope.sortIcon = "↑"
	$scope.reverse = false
	$scope.reverseItem = function() {
		$scope.reverse = !$scope.reverse
		if ($scope.reverse == false) {
			$scope.sortIcon = "↑"
		} else {
			$scope.sortIcon = "↓"
		};
	}
}]).filter('byNum', function() {
	return function(input) {
		var a
		return a
	}
})