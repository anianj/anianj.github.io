'use strict'
/**
 * anianj.ui module
 * njSwitcher DIrectives
 *
 * Description
 */
angular.module('anianj.ui', []).directive('njSwitcher', ['$log','$animate',
    function($log,$animate) {
        // Runs during compile
        return {
            // name: '2',
            // priority: 1,
            // terminal: true,
            scope: {
                pp: '@',
                on: "="
            }, // {} = isolate, true = child, false/undefined = no change
            controller: function($scope, $element, $attrs, $transclude) {
                $log.debug('[njSwitcher:' + $scope.$id + '] controller is constructing...')

                var items = this.items = $scope.items = [];

                //add items to switcher's items list, so that switcher can update their status when needed.
                this.addItem = function addSwitcherItem(item) {
                    $log.debug('[njSwitcher:' + $scope.$id + '] add new item:' + item.$id)
                    items.push(item);
                }

                this.activeItem = function activeSwitcherItem(activeItem) {

                    if (angular.isString(activeItem)) { //if activeItem is a string, means 'on' property value changed,so it needs to update the item's active status
                        var newOnValue = activeItem;

                        angular.forEach(items, function(item) {
                            if (item.val != newOnValue) {
                                item.active = false;
                            } else {
                                item.active = true;
                                activeItem = item;
                            }
                        });

                    } else { //otherwise, a switcher item is clicked, so it needs to update the 'on' property's value
                        $scope.on = activeItem.val;
                    };

                    return activeItem;

                }
            },
            // require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
            restrict: 'A', // E = Element, A = Attribute, C = Class, M = Comment
            template: '<div><span nj-switcher-pointer ng-class="' + "'nj-switcher-pointer pointer-{{pp}}'" + '"></span></div>',
            // templateUrl: '',
            replace: true,
            transclude: 'element',
            compile: function(tElement, tAttrs, transcludeFn) {

                return function postlinking(scope, elm, attrs, controller,transclude) {
                    $log.debug('[njSwitcher:' + scope.$id + '] is in post-linking.');

                    // append the transcluded the content of switcher
                    transclude(scope.$parent,function(clone) {
                        elm.append(clone);
                    })


                    //watching 'on' property, if it changes, it needs to update the item's 'active' property
                    scope.$watch('on', function onValueChange(newVal, oldVal) {

                        $log.debug("[njSwitcher:" + scope.$id + "] 'on' property value changed " + newVal + " | " + oldVal);

                        var activeItem = controller.activeItem(newVal);

                        //Todo:update position of pointer
                        var coords = [],
                            pp = angular.element(elm[0].querySelector('[nj-switcher-pointer]')),
                            itemElms = elm[0].querySelectorAll('[nj-switcher-item]');
                        angular.forEach(itemElms, function(itemElm) {
                            itemElm = angular.element(itemElm);
                            if (itemElm.isolateScope() === activeItem) {

                                coords[0] = itemElm.prop('offsetLeft') + itemElm.prop('offsetWidth') / 2 - pp.prop('offsetWidth') / 2;
                                coords[1] = itemElm.prop('offsetTop') + itemElm.prop('offsetHeight') / 2 - pp.prop('offsetHeight') / 2;
                            } else {
                                //nothing needs to do
                            }
                        });
                        $log.debug('[njSwitcher:' + scope.$id + '] update pointer coords to:' + coords);
                        pp.css('left', coords[0] + 'px');
                    });
                }
            },
            // link: function($scope, iElm, iAttrs, controller) {}
        };
    }
]).directive('njSwitcherItem', ['$log',
    function($log) {
        // Runs during compile
        return {
            // name: '',
            // priority: 1,
            // terminal: true,
            scope: {
                active: "=?",
                val: "@"
            }, // {} = isolate, true = child, false/undefined = no change
            // controller: function($scope, $element, $attrs, $transclude) {},
            require: '^njSwitcher', // Array = multiple requires, ? = optional, ^ = check parent elements
            restrict: 'A', // E = Element, A = Attribute, C = Class, M = Comment
            template: '<li ng-class="{active:active}"></li>',
            // templateUrl: '',
            replace: true,
            transclude: true,
            // compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
            link: function($scope, iElm, iAttrs, controller,transclude) {
                $log.debug('[njSwitcherItem:' + $scope.$id + '] is linking with val: ' + $scope.val)

                transclude($scope.$parent,function(clone){
                    iElm.append(clone);
                })

                //add item's scope to parent's contoller
                controller.addItem($scope);

                //setup click listener
                iElm.on('click', function() {
                    $scope.$apply('active = true');
                });

                //watching 'active' property of item ,if it changes to true, it needs to let switcher update the 'on' property
                $scope.$watch('active', function(newVal, oldVal) {
                    $log.debug('[njSwitcherItem:' + $scope.$id + '] active value changed: ' + newVal + '|' + oldVal);
                    iAttrs.$set('active', newVal);
                    if (newVal) {
                        controller.activeItem($scope);
                    }

                })
            }
        };
    }
]);
