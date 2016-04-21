angular.module('event', ['restangular', 'ngRoute']).
    config(function ($routeProvider, RestangularProvider) {
        $routeProvider.
            when('/', {
                controller: ListCtrl,
                templateUrl: 'events.list.html'
            }).
            when('/edit/:eventId', {
                controller: EditCtrl,
                templateUrl: 'events.detail.html',
                resolve: {
                    event : function (Restangular, $route) {
                        return Restangular.one('events', $route.current.params.eventId).get();
                    },
                    groups: function (Restangular) {
                        return Restangular.all('groups').getList().$object;
                    }
                }
            }).
            when('/new', {
                controller: CreateCtrl,
                templateUrl: 'events.detail.html',
                resolve: {
                    groups: function (Restangular) {
                        return Restangular.all('groups').getList().$object;
                    }
                }
            }).
            otherwise({redirectTo: '/'});
        RestangularProvider.setBaseUrl('https://api.mongolab.com/api/1/databases/beorg-app/collections');
        RestangularProvider.setDefaultRequestParams({ apiKey: 'WB5ZDewHyirIssJSIylEHfljGaczWmYp' })
        RestangularProvider.setRestangularFields({
            id: '_id.$oid'
        });
        RestangularProvider.setRequestInterceptor(function (elem, operation, what) {
            if (operation === 'put') {
                elem._id = undefined;
                return elem;
            }
            return elem;
        })
    });
function ListCtrl($scope, Restangular) {
    $scope.events = Restangular.all("events").getList().$object;
    $scope.groups = Restangular.all("groups").getList().$object;
}
function CreateCtrl($scope, $location, Restangular, groups) {
    $scope.groups = groups;
    $scope.save = function () {
        Restangular.all('events').post($scope.event).then(function (event) {
            $location.path('/list');
        });
    }
}
function EditCtrl($scope, $location, Restangular, event, groups) {
    $scope.groups = groups;
    var original = event;
    $scope.event  = Restangular.copy(original);
    $scope.isClean = function () {
        return angular.equals(original, $scope.event);
    }
    $scope.destroy = function () {
        original.remove().then(function () {
            $location.path('/list');
        });
    };
    $scope.save = function () {
        $scope.event.put().then(function () {
            $location.path('/');
        });
    };
}

