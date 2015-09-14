(function(window, angular, undefined) {
'use strict';
angular.module('ngAnimate', ['ng'])
.directive('ngAnimateChildren', function() {
var NG_ANIMATE_CHILDREN = '$$ngAnimateChildren';
return function(scope, element, attrs) {
var val = attrs.ngAnimateChildren;
if (angular.isString(val) && val.length === 0) {
element.data(NG_ANIMATE_CHILDREN, true);
} else {
scope.$watch(val, function(value) {
element.data(NG_ANIMATE_CHILDREN, !!value);
});
}
};
}).factory('$$animateReflow', ['$$rAF', '$document', function($$rAF, $document) {
var bod = $document[0].body;
return function(fn) {
return $$rAF(function() {
var a = bod.offsetWidth + 1;
fn();
});
};
}]).config(['$provide', '$animateProvider', function($provide, $animateProvider) {
var noop = angular.noop;
var forEach = angular.forEach;
var selectors = $animateProvider.$$selectors;
var isArray = angular.isArray;
var isString = angular.isString;
var isObject = angular.isObject;
var ELEMENT_NODE = 1;
var NG_ANIMATE_STATE = '$$ngAnimateState';
var NG_ANIMATE_CHILDREN = '$$ngAnimateChildren';
var NG_ANIMATE_CLASS_NAME = 'ng-animate';
var rootAnimateState = {
running: true
};
function extractElementNode(element) {
for (var i = 0; i < element.length; i++) {
var elm = element[i];
if (elm.nodeType == ELEMENT_NODE) {
return elm;
}
}
}
function prepareElement(element) {
return element && angular.element(element);
}
function stripCommentsFromElement(element) {
return angular.element(extractElementNode(element));
}
function isMatchingElement(elm1, elm2) {
return extractElementNode(elm1) == extractElementNode(elm2);
}
$provide.decorator('$animate', ['$delegate', '$$q', '$injector', '$sniffer', '$rootElement', '$$asyncCallback', '$rootScope', '$document', '$templateRequest',
function($delegate, $$q, $injector, $sniffer, $rootElement, $$asyncCallback, $rootScope, $document, $templateRequest) {
$rootElement.data(NG_ANIMATE_STATE, rootAnimateState);
var deregisterWatch = $rootScope.$watch(
function() {
return $templateRequest.totalPendingRequests;
},
function(val, oldVal) {
if (val !== 0) return;
deregisterWatch();
$rootScope.$$postDigest(function() {
$rootScope.$$postDigest(function() {
	rootAnimateState.running = false;
});
});
}
);
var globalAnimationCounter = 0;
var classNameFilter = $animateProvider.classNameFilter();
var isAnimatableClassName = !classNameFilter ? function() {
return true;
} : function(className) {
return classNameFilter.test(className);
};
function classBasedAnimationsBlocked(element, setter) {
var data = element.data(NG_ANIMATE_STATE) || {};
if (setter) {
data.running = true;
data.structural = true;
element.data(NG_ANIMATE_STATE, data);
}
return data.disabled || (data.running && data.structural);
}
function runAnimationPostDigest(fn) {
var cancelFn, defer = $$q.defer();
defer.promise.$$cancelFn = function() {
cancelFn && cancelFn();
};
$rootScope.$$postDigest(function() {
cancelFn = fn(function() {
defer.resolve();
});
});
return defer.promise;
}
function parseAnimateOptions(options) {
if (isObject(options)) {
if (options.tempClasses && isString(options.tempClasses)) {
options.tempClasses = options.tempClasses.split(/\s+/);
}
return options;
}
}
function resolveElementClasses(element, cache, runningAnimations) {
runningAnimations = runningAnimations || {};
var lookup = {};
forEach(runningAnimations, function(data, selector) {
forEach(selector.split(' '), function(s) {
lookup[s] = data;
});
});
var hasClasses = Object.create(null);
forEach((element.attr('class') || '').split(/\s+/), function(className) {
hasClasses[className] = true;
});
var toAdd = [],
toRemove = [];
forEach(cache.classes, function(status, className) {
var hasClass = hasClasses[className];
var matchingAnimation = lookup[className] || {};
if (status === false) {
if (hasClass || matchingAnimation.event == 'addClass') {
	toRemove.push(className);
}
} else if (status === true) {
if (!hasClass || matchingAnimation.event == 'removeClass') {
	toAdd.push(className);
}
}
});
return (toAdd.length + toRemove.length) > 0 && [toAdd.join(' '), toRemove.join(' ')];
}
function lookup(name) {
if (name) {
var matches = [],
flagMap = {},
classes = name.substr(1).split('.');
if ($sniffer.transitions || $sniffer.animations) {
matches.push($injector.get(selectors['']));
}
for (var i = 0; i < classes.length; i++) {
var klass = classes[i],
	selectorFactoryName = selectors[klass];
if (selectorFactoryName && !flagMap[klass]) {
	matches.push($injector.get(selectorFactoryName));
	flagMap[klass] = true;
}
}
return matches;
}
}
function animationRunner(element, animationEvent, className, options) {
var node = element[0];
if (!node) {
return;
}
if (options) {
options.to = options.to || {};
options.from = options.from || {};
}
var classNameAdd;
var classNameRemove;
if (isArray(className)) {
classNameAdd = className[0];
classNameRemove = className[1];
if (!classNameAdd) {
className = classNameRemove;
animationEvent = 'removeClass';
} else if (!classNameRemove) {
className = classNameAdd;
animationEvent = 'addClass';
} else {
className = classNameAdd + ' ' + classNameRemove;
}
}
var isSetClassOperation = animationEvent == 'setClass';
var isClassBased = isSetClassOperation || animationEvent == 'addClass' || animationEvent == 'removeClass' || animationEvent == 'animate';
var currentClassName = element.attr('class');
var classes = currentClassName + ' ' + className;
if (!isAnimatableClassName(classes)) {
return;
}
var beforeComplete = noop,
beforeCancel = [],
before = [],
afterComplete = noop,
afterCancel = [],
after = [];
var animationLookup = (' ' + classes).replace(/\s+/g, '.');
forEach(lookup(animationLookup), function(animationFactory) {
var created = registerAnimation(animationFactory, animationEvent);
if (!created && isSetClassOperation) {
registerAnimation(animationFactory, 'addClass');
registerAnimation(animationFactory, 'removeClass');
}
});
function registerAnimation(animationFactory, event) {
var afterFn = animationFactory[event];
var beforeFn = animationFactory['before' + event.charAt(0).toUpperCase() + event.substr(1)];
if (afterFn || beforeFn) {
if (event == 'leave') {
	beforeFn = afterFn;
	afterFn = null;
}
after.push({
	event: event,
	fn: afterFn
});
before.push({
	event: event,
	fn: beforeFn
});
return true;
}
}
function run(fns, cancellations, allCompleteFn) {
var animations = [];
forEach(fns, function(animation) {
animation.fn && animations.push(animation);
});
var count = 0;
function afterAnimationComplete(index) {
if (cancellations) {
	(cancellations[index] || noop)();
	if (++count < animations.length) return;
	cancellations = null;
}
allCompleteFn();
}
forEach(animations, function(animation, index) {
var progress = function() {
	afterAnimationComplete(index);
};
switch (animation.event) {
	case 'setClass':
		cancellations.push(animation.fn(element, classNameAdd, classNameRemove, progress, options));
		break;
	case 'animate':
		cancellations.push(animation.fn(element, className, options.from, options.to, progress));
		break;
	case 'addClass':
		cancellations.push(animation.fn(element, classNameAdd || className, progress, options));
		break;
	case 'removeClass':
		cancellations.push(animation.fn(element, classNameRemove || className, progress, options));
		break;
	default:
		cancellations.push(animation.fn(element, progress, options));
		break;
}
});
if (cancellations && cancellations.length === 0) {
allCompleteFn();
}
}
return {
node: node,
event: animationEvent,
className: className,
isClassBased: isClassBased,
isSetClassOperation: isSetClassOperation,
applyStyles: function() {
if (options) {
	element.css(angular.extend(options.from || {}, options.to || {}));
}
},
before: function(allCompleteFn) {
beforeComplete = allCompleteFn;
run(before, beforeCancel, function() {
	beforeComplete = noop;
	allCompleteFn();
});
},
after: function(allCompleteFn) {
afterComplete = allCompleteFn;
run(after, afterCancel, function() {
	afterComplete = noop;
	allCompleteFn();
});
},
cancel: function() {
if (beforeCancel) {
	forEach(beforeCancel, function(cancelFn) {
		(cancelFn || noop)(true);
	});
	beforeComplete(true);
}
if (afterCancel) {
	forEach(afterCancel, function(cancelFn) {
		(cancelFn || noop)(true);
	});
	afterComplete(true);
}
}
};
}
return {
animate: function(element, from, to, className, options) {
className = className || 'ng-inline-animate';
options = parseAnimateOptions(options) || {};
options.from = to ? from : null;
options.to = to ? to : from;
return runAnimationPostDigest(function(done) {
return performAnimation('animate', className, stripCommentsFromElement(element), null, null, noop, options, done);
});
},
enter: function(element, parentElement, afterElement, options) {
options = parseAnimateOptions(options);
element = angular.element(element);
parentElement = prepareElement(parentElement);
afterElement = prepareElement(afterElement);
classBasedAnimationsBlocked(element, true);
$delegate.enter(element, parentElement, afterElement);
return runAnimationPostDigest(function(done) {
return performAnimation('enter', 'ng-enter', stripCommentsFromElement(element), parentElement, afterElement, noop, options, done);
});
},
leave: function(element, options) {
options = parseAnimateOptions(options);
element = angular.element(element);
cancelChildAnimations(element);
classBasedAnimationsBlocked(element, true);
return runAnimationPostDigest(function(done) {
return performAnimation('leave', 'ng-leave', stripCommentsFromElement(element), null, null, function() {
	$delegate.leave(element);
}, options, done);
});
},
move: function(element, parentElement, afterElement, options) {
options = parseAnimateOptions(options);
element = angular.element(element);
parentElement = prepareElement(parentElement);
afterElement = prepareElement(afterElement);
cancelChildAnimations(element);
classBasedAnimationsBlocked(element, true);
$delegate.move(element, parentElement, afterElement);
return runAnimationPostDigest(function(done) {
return performAnimation('move', 'ng-move', stripCommentsFromElement(element), parentElement, afterElement, noop, options, done);
});
},
addClass: function(element, className, options) {
return this.setClass(element, className, [], options);
},
removeClass: function(element, className, options) {
return this.setClass(element, [], className, options);
},
setClass: function(element, add, remove, options) {
options = parseAnimateOptions(options);
var STORAGE_KEY = '$$animateClasses';
element = angular.element(element);
element = stripCommentsFromElement(element);
if (classBasedAnimationsBlocked(element)) {
return $delegate.$$setClassImmediately(element, add, remove, options);
}
var classes, cache = element.data(STORAGE_KEY);
var hasCache = !!cache;
if (!cache) {
cache = {};
cache.classes = {};
}
classes = cache.classes;
add = isArray(add) ? add : add.split(' ');
forEach(add, function(c) {
if (c && c.length) {
	classes[c] = true;
}
});
remove = isArray(remove) ? remove : remove.split(' ');
forEach(remove, function(c) {
if (c && c.length) {
	classes[c] = false;
}
});
if (hasCache) {
if (options && cache.options) {
	cache.options = angular.extend(cache.options || {}, options);
}
return cache.promise;
} else {
element.data(STORAGE_KEY, cache = {
	classes: classes,
	options: options
});
}
return cache.promise = runAnimationPostDigest(function(done) {
var parentElement = element.parent();
var elementNode = extractElementNode(element);
var parentNode = elementNode.parentNode;
if (!parentNode || parentNode['$$NG_REMOVED'] || elementNode['$$NG_REMOVED']) {
	done();
	return;
}
var cache = element.data(STORAGE_KEY);
element.removeData(STORAGE_KEY);
var state = element.data(NG_ANIMATE_STATE) || {};
var classes = resolveElementClasses(element, cache, state.active);
return !classes ? done() : performAnimation('setClass', classes, element, parentElement, null, function() {
	if (classes[0]) $delegate.$$addClassImmediately(element, classes[0]);
	if (classes[1]) $delegate.$$removeClassImmediately(element, classes[1]);
}, cache.options, done);
});
},
cancel: function(promise) {
promise.$$cancelFn();
},
enabled: function(value, element) {
switch (arguments.length) {
case 2:
	if (value) {
		cleanup(element);
	} else {
		var data = element.data(NG_ANIMATE_STATE) || {};
		data.disabled = true;
		element.data(NG_ANIMATE_STATE, data);
	}
	break;
case 1:
	rootAnimateState.disabled = !value;
	break;
default:
	value = !rootAnimateState.disabled;
	break;
}
return !!value;
}
};
function performAnimation(animationEvent, className, element, parentElement, afterElement, domOperation, options, doneCallback) {
var noopCancel = noop;
var runner = animationRunner(element, animationEvent, className, options);
if (!runner) {
fireDOMOperation();
fireBeforeCallbackAsync();
fireAfterCallbackAsync();
closeAnimation();
return noopCancel;
}
animationEvent = runner.event;
className = runner.className;
var elementEvents = angular.element._data(runner.node);
elementEvents = elementEvents && elementEvents.events;
if (!parentElement) {
parentElement = afterElement ? afterElement.parent() : element.parent();
}
if (animationsDisabled(element, parentElement)) {
fireDOMOperation();
fireBeforeCallbackAsync();
fireAfterCallbackAsync();
closeAnimation();
return noopCancel;
}
var ngAnimateState = element.data(NG_ANIMATE_STATE) || {};
var runningAnimations = ngAnimateState.active || {};
var totalActiveAnimations = ngAnimateState.totalActive || 0;
var lastAnimation = ngAnimateState.last;
var skipAnimation = false;
if (totalActiveAnimations > 0) {
var animationsToCancel = [];
if (!runner.isClassBased) {
if (animationEvent == 'leave' && runningAnimations['ng-leave']) {
	skipAnimation = true;
} else {
	for (var klass in runningAnimations) {
		animationsToCancel.push(runningAnimations[klass]);
	}
	ngAnimateState = {};
	cleanup(element, true);
}
} else if (lastAnimation.event == 'setClass') {
animationsToCancel.push(lastAnimation);
cleanup(element, className);
} else if (runningAnimations[className]) {
var current = runningAnimations[className];
if (current.event == animationEvent) {
	skipAnimation = true;
} else {
	animationsToCancel.push(current);
	cleanup(element, className);
}
}
if (animationsToCancel.length > 0) {
forEach(animationsToCancel, function(operation) {
	operation.cancel();
});
}
}
if (runner.isClassBased && !runner.isSetClassOperation && animationEvent != 'animate' && !skipAnimation) {
skipAnimation = (animationEvent == 'addClass') == element.hasClass(className);
}
if (skipAnimation) {
fireDOMOperation();
fireBeforeCallbackAsync();
fireAfterCallbackAsync();
fireDoneCallbackAsync();
return noopCancel;
}
runningAnimations = ngAnimateState.active || {};
totalActiveAnimations = ngAnimateState.totalActive || 0;
if (animationEvent == 'leave') {
element.one('$destroy', function(e) {
var element = angular.element(this);
var state = element.data(NG_ANIMATE_STATE);
if (state) {
	var activeLeaveAnimation = state.active['ng-leave'];
	if (activeLeaveAnimation) {
		activeLeaveAnimation.cancel();
		cleanup(element, 'ng-leave');
	}
}
});
}
element.addClass(NG_ANIMATE_CLASS_NAME);
if (options && options.tempClasses) {
forEach(options.tempClasses, function(className) {
element.addClass(className);
});
}
var localAnimationCount = globalAnimationCounter++;
totalActiveAnimations++;
runningAnimations[className] = runner;
element.data(NG_ANIMATE_STATE, {
last: runner,
active: runningAnimations,
index: localAnimationCount,
totalActive: totalActiveAnimations
});
fireBeforeCallbackAsync();
runner.before(function(cancelled) {
var data = element.data(NG_ANIMATE_STATE);
cancelled = cancelled ||
!data || !data.active[className] ||
(runner.isClassBased && data.active[className].event != animationEvent);
fireDOMOperation();
if (cancelled === true) {
closeAnimation();
} else {
fireAfterCallbackAsync();
runner.after(closeAnimation);
}
});
return runner.cancel;
function fireDOMCallback(animationPhase) {
var eventName = '$animate:' + animationPhase;
if (elementEvents && elementEvents[eventName] && elementEvents[eventName].length > 0) {
$$asyncCallback(function() {
	element.triggerHandler(eventName, {
		event: animationEvent,
		className: className
	});
});
}
}
function fireBeforeCallbackAsync() {
fireDOMCallback('before');
}
function fireAfterCallbackAsync() {
fireDOMCallback('after');
}
function fireDoneCallbackAsync() {
fireDOMCallback('close');
doneCallback();
}
function fireDOMOperation() {
if (!fireDOMOperation.hasBeenRun) {
fireDOMOperation.hasBeenRun = true;
domOperation();
}
}
function closeAnimation() {
if (!closeAnimation.hasBeenRun) {
if (runner) {
	runner.applyStyles();
}
closeAnimation.hasBeenRun = true;
if (options && options.tempClasses) {
	forEach(options.tempClasses, function(className) {
		element.removeClass(className);
	});
}
var data = element.data(NG_ANIMATE_STATE);
if (data) {
	if (runner && runner.isClassBased) {
		cleanup(element, className);
	} else {
		$$asyncCallback(function() {
			var data = element.data(NG_ANIMATE_STATE) || {};
			if (localAnimationCount == data.index) {
				cleanup(element, className, animationEvent);
			}
		});
		element.data(NG_ANIMATE_STATE, data);
	}
}
fireDoneCallbackAsync();
}
}
}
function cancelChildAnimations(element) {
var node = extractElementNode(element);
if (node) {
var nodes = angular.isFunction(node.getElementsByClassName) ?
node.getElementsByClassName(NG_ANIMATE_CLASS_NAME) :
node.querySelectorAll('.' + NG_ANIMATE_CLASS_NAME);
forEach(nodes, function(element) {
element = angular.element(element);
var data = element.data(NG_ANIMATE_STATE);
if (data && data.active) {
	forEach(data.active, function(runner) {
		runner.cancel();
	});
}
});
}
}
function cleanup(element, className) {
if (isMatchingElement(element, $rootElement)) {
if (!rootAnimateState.disabled) {
rootAnimateState.running = false;
rootAnimateState.structural = false;
}
} else if (className) {
var data = element.data(NG_ANIMATE_STATE) || {};
var removeAnimations = className === true;
if (!removeAnimations && data.active && data.active[className]) {
data.totalActive--;
delete data.active[className];
}
if (removeAnimations || !data.totalActive) {
element.removeClass(NG_ANIMATE_CLASS_NAME);
element.removeData(NG_ANIMATE_STATE);
}
}
}
function animationsDisabled(element, parentElement) {
if (rootAnimateState.disabled) {
return true;
}
if (isMatchingElement(element, $rootElement)) {
return rootAnimateState.running;
}
var allowChildAnimations, parentRunningAnimation, hasParent;
do {
if (parentElement.length === 0) break;
var isRoot = isMatchingElement(parentElement, $rootElement);
var state = isRoot ? rootAnimateState : (parentElement.data(NG_ANIMATE_STATE) || {});
if (state.disabled) {
return true;
}
if (isRoot) {
hasParent = true;
}
if (allowChildAnimations !== false) {
var animateChildrenFlag = parentElement.data(NG_ANIMATE_CHILDREN);
if (angular.isDefined(animateChildrenFlag)) {
	allowChildAnimations = animateChildrenFlag;
}
}
parentRunningAnimation = parentRunningAnimation ||
state.running ||
(state.last && !state.last.isClassBased);
}
while (parentElement = parentElement.parent());
return !hasParent || (!allowChildAnimations && parentRunningAnimation);
}
}
]);
$animateProvider.register('', ['$window', '$sniffer', '$timeout', '$$animateReflow',
function($window, $sniffer, $timeout, $$animateReflow) {
var CSS_PREFIX = '',
TRANSITION_PROP, TRANSITIONEND_EVENT, ANIMATION_PROP, ANIMATIONEND_EVENT;
if (window.ontransitionend === undefined && window.onwebkittransitionend !== undefined) {
CSS_PREFIX = '-webkit-';
TRANSITION_PROP = 'WebkitTransition';
TRANSITIONEND_EVENT = 'webkitTransitionEnd transitionend';
} else {
TRANSITION_PROP = 'transition';
TRANSITIONEND_EVENT = 'transitionend';
}
if (window.onanimationend === undefined && window.onwebkitanimationend !== undefined) {
CSS_PREFIX = '-webkit-';
ANIMATION_PROP = 'WebkitAnimation';
ANIMATIONEND_EVENT = 'webkitAnimationEnd animationend';
} else {
ANIMATION_PROP = 'animation';
ANIMATIONEND_EVENT = 'animationend';
}
var DURATION_KEY = 'Duration';
var PROPERTY_KEY = 'Property';
var DELAY_KEY = 'Delay';
var ANIMATION_ITERATION_COUNT_KEY = 'IterationCount';
var ANIMATION_PLAYSTATE_KEY = 'PlayState';
var NG_ANIMATE_PARENT_KEY = '$$ngAnimateKey';
var NG_ANIMATE_CSS_DATA_KEY = '$$ngAnimateCSS3Data';
var ELAPSED_TIME_MAX_DECIMAL_PLACES = 3;
var CLOSING_TIME_BUFFER = 1.5;
var ONE_SECOND = 1000;
var lookupCache = {};
var parentCounter = 0;
var animationReflowQueue = [];
var cancelAnimationReflow;
function clearCacheAfterReflow() {
if (!cancelAnimationReflow) {
cancelAnimationReflow = $$animateReflow(function() {
animationReflowQueue = [];
cancelAnimationReflow = null;
lookupCache = {};
});
}
}
function afterReflow(element, callback) {
if (cancelAnimationReflow) {
cancelAnimationReflow();
}
animationReflowQueue.push(callback);
cancelAnimationReflow = $$animateReflow(function() {
forEach(animationReflowQueue, function(fn) {
fn();
});
animationReflowQueue = [];
cancelAnimationReflow = null;
lookupCache = {};
});
}
var closingTimer = null;
var closingTimestamp = 0;
var animationElementQueue = [];
function animationCloseHandler(element, totalTime) {
var node = extractElementNode(element);
element = angular.element(node);
animationElementQueue.push(element);
var futureTimestamp = Date.now() + totalTime;
if (futureTimestamp <= closingTimestamp) {
return;
}
$timeout.cancel(closingTimer);
closingTimestamp = futureTimestamp;
closingTimer = $timeout(function() {
closeAllAnimations(animationElementQueue);
animationElementQueue = [];
}, totalTime, false);
}
function closeAllAnimations(elements) {
forEach(elements, function(element) {
var elementData = element.data(NG_ANIMATE_CSS_DATA_KEY);
if (elementData) {
forEach(elementData.closeAnimationFns, function(fn) {
	fn();
});
}
});
}
function getElementAnimationDetails(element, cacheKey) {
var data = cacheKey ? lookupCache[cacheKey] : null;
if (!data) {
var transitionDuration = 0;
var transitionDelay = 0;
var animationDuration = 0;
var animationDelay = 0;
forEach(element, function(element) {
if (element.nodeType == ELEMENT_NODE) {
	var elementStyles = $window.getComputedStyle(element) || {};
	var transitionDurationStyle = elementStyles[TRANSITION_PROP + DURATION_KEY];
	transitionDuration = Math.max(parseMaxTime(transitionDurationStyle), transitionDuration);
	var transitionDelayStyle = elementStyles[TRANSITION_PROP + DELAY_KEY];
	transitionDelay = Math.max(parseMaxTime(transitionDelayStyle), transitionDelay);
	var animationDelayStyle = elementStyles[ANIMATION_PROP + DELAY_KEY];
	animationDelay = Math.max(parseMaxTime(elementStyles[ANIMATION_PROP + DELAY_KEY]), animationDelay);
	var aDuration = parseMaxTime(elementStyles[ANIMATION_PROP + DURATION_KEY]);
	if (aDuration > 0) {
		aDuration *= parseInt(elementStyles[ANIMATION_PROP + ANIMATION_ITERATION_COUNT_KEY], 10) || 1;
	}
	animationDuration = Math.max(aDuration, animationDuration);
}
});
data = {
total: 0,
transitionDelay: transitionDelay,
transitionDuration: transitionDuration,
animationDelay: animationDelay,
animationDuration: animationDuration
};
if (cacheKey) {
lookupCache[cacheKey] = data;
}
}
return data;
}
function parseMaxTime(str) {
var maxValue = 0;
var values = isString(str) ?
str.split(/\s*,\s*/) :
[];
forEach(values, function(value) {
maxValue = Math.max(parseFloat(value) || 0, maxValue);
});
return maxValue;
}
function getCacheKey(element) {
var parentElement = element.parent();
var parentID = parentElement.data(NG_ANIMATE_PARENT_KEY);
if (!parentID) {
parentElement.data(NG_ANIMATE_PARENT_KEY, ++parentCounter);
parentID = parentCounter;
}
return parentID + '-' + extractElementNode(element).getAttribute('class');
}
function animateSetup(animationEvent, element, className, styles) {
var structural = ['ng-enter', 'ng-leave', 'ng-move'].indexOf(className) >= 0;
var cacheKey = getCacheKey(element);
var eventCacheKey = cacheKey + ' ' + className;
var itemIndex = lookupCache[eventCacheKey] ? ++lookupCache[eventCacheKey].total : 0;
var stagger = {};
if (itemIndex > 0) {
var staggerClassName = className + '-stagger';
var staggerCacheKey = cacheKey + ' ' + staggerClassName;
var applyClasses = !lookupCache[staggerCacheKey];
applyClasses && element.addClass(staggerClassName);
stagger = getElementAnimationDetails(element, staggerCacheKey);
applyClasses && element.removeClass(staggerClassName);
}
element.addClass(className);
var formerData = element.data(NG_ANIMATE_CSS_DATA_KEY) || {};
var timings = getElementAnimationDetails(element, eventCacheKey);
var transitionDuration = timings.transitionDuration;
var animationDuration = timings.animationDuration;
if (structural && transitionDuration === 0 && animationDuration === 0) {
element.removeClass(className);
return false;
}
var blockTransition = styles || (structural && transitionDuration > 0);
var blockAnimation = animationDuration > 0 &&
stagger.animationDelay > 0 &&
stagger.animationDuration === 0;
var closeAnimationFns = formerData.closeAnimationFns || [];
element.data(NG_ANIMATE_CSS_DATA_KEY, {
stagger: stagger,
cacheKey: eventCacheKey,
running: formerData.running || 0,
itemIndex: itemIndex,
blockTransition: blockTransition,
closeAnimationFns: closeAnimationFns
});
var node = extractElementNode(element);
if (blockTransition) {
blockTransitions(node, true);
if (styles) {
element.css(styles);
}
}
if (blockAnimation) {
blockAnimations(node, true);
}
return true;
}
function animateRun(animationEvent, element, className, activeAnimationComplete, styles) {
var node = extractElementNode(element);
var elementData = element.data(NG_ANIMATE_CSS_DATA_KEY);
if (node.getAttribute('class').indexOf(className) == -1 || !elementData) {
activeAnimationComplete();
return;
}
var activeClassName = '';
var pendingClassName = '';
forEach(className.split(' '), function(klass, i) {
var prefix = (i > 0 ? ' ' : '') + klass;
activeClassName += prefix + '-active';
pendingClassName += prefix + '-pending';
});
var style = '';
var appliedStyles = [];
var itemIndex = elementData.itemIndex;
var stagger = elementData.stagger;
var staggerTime = 0;
if (itemIndex > 0) {
var transitionStaggerDelay = 0;
if (stagger.transitionDelay > 0 && stagger.transitionDuration === 0) {
transitionStaggerDelay = stagger.transitionDelay * itemIndex;
}
var animationStaggerDelay = 0;
if (stagger.animationDelay > 0 && stagger.animationDuration === 0) {
animationStaggerDelay = stagger.animationDelay * itemIndex;
appliedStyles.push(CSS_PREFIX + 'animation-play-state');
}
staggerTime = Math.round(Math.max(transitionStaggerDelay, animationStaggerDelay) * 100) / 100;
}
if (!staggerTime) {
element.addClass(activeClassName);
if (elementData.blockTransition) {
blockTransitions(node, false);
}
}
var eventCacheKey = elementData.cacheKey + ' ' + activeClassName;
var timings = getElementAnimationDetails(element, eventCacheKey);
var maxDuration = Math.max(timings.transitionDuration, timings.animationDuration);
if (maxDuration === 0) {
element.removeClass(activeClassName);
animateClose(element, className);
activeAnimationComplete();
return;
}
if (!staggerTime && styles) {
if (!timings.transitionDuration) {
element.css('transition', timings.animationDuration + 's linear all');
appliedStyles.push('transition');
}
element.css(styles);
}
var maxDelay = Math.max(timings.transitionDelay, timings.animationDelay);
var maxDelayTime = maxDelay * ONE_SECOND;
if (appliedStyles.length > 0) {
var oldStyle = node.getAttribute('style') || '';
if (oldStyle.charAt(oldStyle.length - 1) !== ';') {
oldStyle += ';';
}
node.setAttribute('style', oldStyle + ' ' + style);
}
var startTime = Date.now();
var css3AnimationEvents = ANIMATIONEND_EVENT + ' ' + TRANSITIONEND_EVENT;
var animationTime = (maxDelay + maxDuration) * CLOSING_TIME_BUFFER;
var totalTime = (staggerTime + animationTime) * ONE_SECOND;
var staggerTimeout;
if (staggerTime > 0) {
element.addClass(pendingClassName);
staggerTimeout = $timeout(function() {
staggerTimeout = null;
if (timings.transitionDuration > 0) {
	blockTransitions(node, false);
}
if (timings.animationDuration > 0) {
	blockAnimations(node, false);
}
element.addClass(activeClassName);
element.removeClass(pendingClassName);
if (styles) {
	if (timings.transitionDuration === 0) {
		element.css('transition', timings.animationDuration + 's linear all');
	}
	element.css(styles);
	appliedStyles.push('transition');
}
}, staggerTime * ONE_SECOND, false);
}
element.on(css3AnimationEvents, onAnimationProgress);
elementData.closeAnimationFns.push(function() {
onEnd();
activeAnimationComplete();
});
elementData.running++;
animationCloseHandler(element, totalTime);
return onEnd;
function onEnd() {
element.off(css3AnimationEvents, onAnimationProgress);
element.removeClass(activeClassName);
element.removeClass(pendingClassName);
if (staggerTimeout) {
$timeout.cancel(staggerTimeout);
}
animateClose(element, className);
var node = extractElementNode(element);
for (var i in appliedStyles) {
node.style.removeProperty(appliedStyles[i]);
}
}
function onAnimationProgress(event) {
event.stopPropagation();
var ev = event.originalEvent || event;
var timeStamp = ev.$manualTimeStamp || ev.timeStamp || Date.now();
var elapsedTime = parseFloat(ev.elapsedTime.toFixed(ELAPSED_TIME_MAX_DECIMAL_PLACES));
if (Math.max(timeStamp - startTime, 0) >= maxDelayTime && elapsedTime >= maxDuration) {
activeAnimationComplete();
}
}
}
function blockTransitions(node, bool) {
node.style[TRANSITION_PROP + PROPERTY_KEY] = bool ? 'none' : '';
}
function blockAnimations(node, bool) {
node.style[ANIMATION_PROP + ANIMATION_PLAYSTATE_KEY] = bool ? 'paused' : '';
}
function animateBefore(animationEvent, element, className, styles) {
if (animateSetup(animationEvent, element, className, styles)) {
return function(cancelled) {
cancelled && animateClose(element, className);
};
}
}
function animateAfter(animationEvent, element, className, afterAnimationComplete, styles) {
if (element.data(NG_ANIMATE_CSS_DATA_KEY)) {
return animateRun(animationEvent, element, className, afterAnimationComplete, styles);
} else {
animateClose(element, className);
afterAnimationComplete();
}
}
function animate(animationEvent, element, className, animationComplete, options) {
var preReflowCancellation = animateBefore(animationEvent, element, className, options.from);
if (!preReflowCancellation) {
clearCacheAfterReflow();
animationComplete();
return;
}
var cancel = preReflowCancellation;
afterReflow(element, function() {
cancel = animateAfter(animationEvent, element, className, animationComplete, options.to);
});
return function(cancelled) {
(cancel || noop)(cancelled);
};
}
function animateClose(element, className) {
element.removeClass(className);
var data = element.data(NG_ANIMATE_CSS_DATA_KEY);
if (data) {
if (data.running) {
data.running--;
}
if (!data.running || data.running === 0) {
element.removeData(NG_ANIMATE_CSS_DATA_KEY);
}
}
}
return {
animate: function(element, className, from, to, animationCompleted, options) {
options = options || {};
options.from = from;
options.to = to;
return animate('animate', element, className, animationCompleted, options);
},
enter: function(element, animationCompleted, options) {
options = options || {};
return animate('enter', element, 'ng-enter', animationCompleted, options);
},
leave: function(element, animationCompleted, options) {
options = options || {};
return animate('leave', element, 'ng-leave', animationCompleted, options);
},
move: function(element, animationCompleted, options) {
options = options || {};
return animate('move', element, 'ng-move', animationCompleted, options);
},
beforeSetClass: function(element, add, remove, animationCompleted, options) {
options = options || {};
var className = suffixClasses(remove, '-remove') + ' ' +
suffixClasses(add, '-add');
var cancellationMethod = animateBefore('setClass', element, className, options.from);
if (cancellationMethod) {
afterReflow(element, animationCompleted);
return cancellationMethod;
}
clearCacheAfterReflow();
animationCompleted();
},
beforeAddClass: function(element, className, animationCompleted, options) {
options = options || {};
var cancellationMethod = animateBefore('addClass', element, suffixClasses(className, '-add'), options.from);
if (cancellationMethod) {
afterReflow(element, animationCompleted);
return cancellationMethod;
}
clearCacheAfterReflow();
animationCompleted();
},
beforeRemoveClass: function(element, className, animationCompleted, options) {
options = options || {};
var cancellationMethod = animateBefore('removeClass', element, suffixClasses(className, '-remove'), options.from);
if (cancellationMethod) {
afterReflow(element, animationCompleted);
return cancellationMethod;
}
clearCacheAfterReflow();
animationCompleted();
},
setClass: function(element, add, remove, animationCompleted, options) {
options = options || {};
remove = suffixClasses(remove, '-remove');
add = suffixClasses(add, '-add');
var className = remove + ' ' + add;
return animateAfter('setClass', element, className, animationCompleted, options.to);
},
addClass: function(element, className, animationCompleted, options) {
options = options || {};
return animateAfter('addClass', element, suffixClasses(className, '-add'), animationCompleted, options.to);
},
removeClass: function(element, className, animationCompleted, options) {
options = options || {};
return animateAfter('removeClass', element, suffixClasses(className, '-remove'), animationCompleted, options.to);
}
};
function suffixClasses(classes, suffix) {
var className = '';
classes = isArray(classes) ? classes : classes.split(/\s+/);
forEach(classes, function(klass, i) {
if (klass && klass.length > 0) {
className += (i > 0 ? ' ' : '') + klass + suffix;
}
});
return className;
}
}
]);
}]);
})(window, window.angular);