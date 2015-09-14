// 颜色模块
angular.module('modColor', [

]).controller('ctlColor', ['$scope', '$http', function($scope, $http) {
	$scope.orderVal = 'id'
	if (sessionStorage.ColorDict) {
		$scope.colors = JSON.parse(sessionStorage.ColorDict)
		console.log('本地色彩数据加载成功!');
	} else {
		$http.get('Model/colors.json').success(function(data) {
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

			function colorFactory(id, name, hex) {
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

	function RGB2HSL(r, g, b) {
	}

	function RGB2CMYK(r, g, b) {
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
}]).filter('byNum', function($scope) {
	return function(input) {
		var a
		return
	}
})
// 文字模块
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
// 形状模块
angular.module('modShape', [

]).filter('myFilter',function(){
	return function(input){

			return input
	}
}).controller('ctlShape', ['$scope', function($scope){
	// if (sessionStorage.radius) {
	// 	$scope.radius = JSON.parse(sessionStorage.radius)
	// } else {
	// 	$scope.radius = {
	// 		lt : 6,
	// 		rt : 6,
	// 		rb : 6,
	// 		lb : 6
	// 	}
	// 	sessionStorage.radius = JSON.stringify($scope.radius)
	// }
	$scope.radiusStyles = [
		'border-top-left-radius: 100%;',
		'border-top-right-radius: 100%;',
		'border-bottom-right-radius: 100%;',
		'border-bottom-left-radius: 100%;',
		'border-radius: 50%;',
		'border-radius: 100% 0;',
		'border-radius:0 100%;'
	]
	$scope.triangleStyles = [
		{
			width:'2em',
			color:'transparent transparent red transparent',
			style:'dashed solid solid solid'
		},{
		    width:'2em',
			color:'red transparent transparent transparent',
			style:'solid dashed dashed dashed'
		},{
			width:'2em',
			color:'transparent red transparent transparent',
			style:'dashed solid dashed dashed'
		},{
			width:'2em',
			color:'transparent transparent transparent red',
			style:'dashed dashed dashed solid'
		},{
			width:'0 2em 3.464em 2em',
			color:'transparent transparent red transparent',
			style:'dashed solid solid solid'
		},{
		    width:'3.464em 2em 0 2em',
			color:'red transparent transparent transparent',
			style:'solid dashed dashed dashed'
		},{
			width:'2em 3.464em 2em 0',
			color:'transparent red transparent transparent',
			style:'dashed solid dashed dashed'
		},{
			width:'2em 0 2em 3.464em',
			color:'transparent transparent transparent red',
			style:'dashed dashed dashed solid'
		}
	]
}])
// 阴影模块
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
// 尺寸模块
angular.module('modSize', [

]).controller('ctlSize', ['$scope', function($scope) {
	$scope.lengthSizes = [
		{
			content : "1em = 1倍父元素设定的字高",
			unit : "em",
			type : "font-relative",
			width : "1"
		},{
			content : "1ex = 1倍字母x的高度 ≈ 0.5em",
			unit : "ex",
			type : "font-relative",
			width : "1"
		},{
			content : "1ch = 1倍数字0的宽度",
			unit : "ch",
			type : "font-relative",
			width : "1"
		},{
			content : "1rem = 1倍根元素(即html)的字体的尺寸",
			unit : "rem",
			type : "font-relative",
			width : "1"
		},{
			content : "30vw = 30%的视口宽度",
			unit : "vw",
			type : "viewport-percentage",
			width : "30"
		},{
			content : "30vh = 30%的视口高度",
			unit : "vh",
			type : "viewport-percentage",
			width : "30"
		},{
			content : "30vmin = 30%的视口较小边",
			unit : "vmin",
			type : "viewport-percentage",
			width : "30"
		},{
			content : "30vmax = 30%的视口较大边",
			unit : "vmax",
			type : "viewport-percentage",
			width : "30"
		},{
			content : "1px = 1个像素尺寸",
			unit : "px",
			type : "absolute",
			width : "1"
		},{
			content : "1mm",
			unit : "mm",
			type : "absolute",
			width : "1"
		},{
			content : "1cm = 10mm",
			unit : "cm",
			type : "absolute",
			width : "1"
		},{
			content : "1pt = 1/12 pica",
			unit : "pt",
			type : "absolute",
			width : "1"
		},{
			content : "1 pica = 1/6in",
			unit : "pc",
			type : "absolute",
			width : "1"
		},{
			content : "1in = 2.54cm",
			unit : "in",
			type : "absolute",
			width : "1"
		}
	]
	$scope.angleSizes = [
		{
			content : "1deg,1度 = 1/360 turn",
			unit : "deg",
			type : "angle",
			width : "1"
		},{
			content : "1rad,1弧度 = 1/2π turn",
			unit : "rad",
			type : "angle",
			width : "1"
		},{
			content : "1grad,1梯度 = 1/400turn",
			unit : "grad",
			type : "angle",
			width : "1"
		},{
			content : "1turn,1圆周",
			unit : "turn",
			type : "angle",
			width : "1"
		}
	]
	$scope.bodySize = 16;
	$scope.htmlSize = 16;
}]);
// 主模块
angular.module('css3ToolBox', [
	'ngRoute' ,'ngAnimate',
	'modColor','modFont','modShape','modBoxShadow','modSize'
]).config(['$routeProvider',function($routeProvider) {
	$routeProvider.when('/font', {
		templateUrl: 'Views/font.html',
		controller: 'ctlFont'
	}).when('/color', {
		templateUrl: 'Views/color.html',
		controller: 'ctlColor'
	}).when('/shape', {
		templateUrl: 'Views/shape.html',
		controller: 'ctlShape'
	}).when('/boxShadow', {
		templateUrl: 'Views/boxShadow.html',
		controller: 'ctlBoxShadow'
	}).when('/size', {
		templateUrl: 'Views/size.html',
		controller: 'ctlSize'
	}).otherwise({
		redirectTo: '/nav'
	});
}]).controller('ctlNav', ['$scope', function($scope){
	var navList = [
		{name:'形状'    ,id:'shape'    ,ctl:'ctlShape'},
		{name:'变换'    ,id:'transform' ,ctl:'ctlTransform'},
		{name:'过渡'    ,id:'translate' ,ctl:'ctlTranslate'},
		{name:'动画'    ,id:'animation' ,ctl:'ctlAnimation'},

		{name:'颜色'  ,id:'color'     ,ctl:'ctlColor'},
		// {name:'传统色'  ,id:'zhColor'   ,ctl:'ctlZhColor'},
		// {name:'取色'    ,id:'pickColor' ,ctl:'ctlpColor'},

		{name:'文字'    ,id:'font'      ,ctl:'ctlFont'},
		// {name:'文字旋转',id:'textRotate',ctl:'ctlTextRotate'},

		{name:'盒阴影'  ,id:'boxShadow' ,ctl:'ctlBoxShadow'},
		{name:'尺寸'    ,id:'size'      ,ctl:'ctlSize'},
		{name:'滤镜'    ,id:'filter'    ,ctl:'ctlFilter'},
	]
	$scope.navs = navList
	$scope.toolType = '形状'
	$scope.changeType = function(name){
		$scope.toolType = name
	}
}])

// angular.element(document).ready(function() {
// 	angular.bootstrap(document, ['myApp']);
// });

// sessionStorage