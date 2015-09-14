angular.module('css3ToolBox', [
	'ngRoute' ,'ngAnimate','ngTouch',
	'ui.bootstrap',
	'modColor','modFont','modShape','modBoxShadow','modSize','modFilter'
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
		redirectTo: '/test'
	});
}]).controller('ctlNav', ['$scope', function($scope){
	var navList = [
		{name:'测试页'  ,id:'test'      ,ctl:'ctlTest'},
		{name:'形状'    ,id:'shape'     ,ctl:'ctlShape'},
		{name:'变换'    ,id:'transform' ,ctl:'ctlTransform'},
		{name:'过渡'    ,id:'translate' ,ctl:'ctlTranslate'},
		{name:'动画'    ,id:'animation' ,ctl:'ctlAnimation'},

		{name:'颜色'    ,id:'color'     ,ctl:'ctlColor'},
		// {name:'传统色'  ,id:'zhColor'   ,ctl:'ctlZhColor'},
		// {name:'取色'    ,id:'pickColor' ,ctl:'ctlpColor'},

		{name:'文字'    ,id:'font'      ,ctl:'ctlFont'},
		// {name:'文字旋转',id:'textRotate',ctl:'ctlTextRotate'},

		{name:'盒阴影'  ,id:'boxShadow' ,ctl:'ctlBoxShadow'},
		{name:'尺寸'    ,id:'size'      ,ctl:'ctlSize'},
		{name:'滤镜'    ,id:'filter'    ,ctl:'ctlFilter'}
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