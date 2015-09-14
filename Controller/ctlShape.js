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
			width:'0 2em 2em 2em',
			color:'transparent transparent red transparent',
			style:'dashed solid solid solid'
		},{
		    width:'2em 2em 0 2em',
			color:'red transparent transparent transparent',
			style:'solid dashed dashed dashed'
		},{
			width:'2em 2em 2em 0',
			color:'transparent red transparent transparent',
			style:'dashed solid dashed dashed'
		},{
			width:'2em 0 2em 2em',
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
		},{
			width:'2em',
			color:'red transparent red transparent',
			style:'solid dashed solid dashed'
		},{
			width:'2em',
			color:'transparent red transparent red',
			style:'dashed solid dashed solid'
		},{
			width:'2em',
			color:'red red transparent transparent',
			style:'solid solid dashed dashed'
		},{
			width:'2em',
			color:'transparent red red transparent',
			style:'dashed solid solid dashed'
		},{
			width:'2em',
			color:'transparent transparent red red',
			style:'dashed dashed solid solid'
		},{
			width:'2em',
			color:'red transparent transparent red',
			style:'solid dashed dashed solid'
		}
	]
	$scope.ladderStyles = [
		// {
		// 	width:'1em 2em 2em 2em',
		// 	color:'red',
		// 	style:'solid'
		// },{
		// 	width:'2em 1em 2em 2em',
		// 	color:'red',
		// 	style:'solid'
		// }
	]
}])