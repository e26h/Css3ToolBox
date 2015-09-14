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