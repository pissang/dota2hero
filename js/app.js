(function(){
    
    'use strict';

    var app = angular.module("heroViewer");
    
    var BAE_AK = 'VTDybEOCGFYnwy6qhMtHXHOl';
    var BAE_SK = 'dVwdmD4UwYSVki0S7drrCN01QfFOdCuG';
    var BUCKET = 'modeldata';

    function getResourcePath(path) {
        if (window.location.host.indexOf('duapp') > 0) {
            // http://developer.baidu.com/wiki/index.php?title=docs/cplat/stor/access/signed-url
            if (path[0] !== '/') {
                path = '/' + path;
            }
            var flag = 'MBO'
            var content = [
                flag,
                'Method=GET',
                'Bucket=' + BUCKET,
                'Object=' + path
            ].join('\n') + '\n';
            
            var shaObj = new jsSHA(content, "TEXT");
            var sign = shaObj.getHMAC(BAE_SK, "TEXT", "SHA-1", "B64");
            sign = [flag, BAE_AK, sign].join(':');
            path = '/modeldata/' + path;
            return 'http://bcs.duapp.com' + encodeURIComponent(path) + '?sign=' + sign;
        } else {
            return path;
        }
    }

    app.provider('getResourcePath', function() {
        this.$get = function() {
            return getResourcePath;
        }
    });

    app.provider('cache', function() {
        var cache = {};
        function get(key) {
            return cache[key];
        }
        function set(key, value) {
            cache[key] = value;
        }
        function has(key) {
            return cache.hasOwnProperty(key);
        }
        this.$get = function() {
            return {
                get : get,
                set : set,
                has : has
            }
        }
    });

    app.config(function($routeProvider){
        $routeProvider
            .when("/heroes", {
                templateUrl : 'partials/heroList.html',
                controller : "heroList"
            })
            .when("/hero/:name", {
                templateUrl : 'partials/hero.html',
                controller : "hero"
            }).
            otherwise({
                redirectTo: '/heroes'
            });
    });
})();