(function(){
    
    'use strict';

    var app = angular.module("heroViewer");
    
    app.controller('heroList', function(
        $scope, $http, getResourcePath, cache, sparkle, background, renderer, animation
    ) {
        if (!cache.has('overview')) {
            $http.get(getResourcePath('heroes/overview_cn.json'))
                .success(function(data) {
                    cache.set('overview', data);
                    $scope.heroList = data;
                });
        } else {
            $scope.heroList = cache.get('overview');
        }
        animation.off('frame');
        animation.on('frame', function(deltaTime) {
            background.render(renderer);
            sparkle.render(renderer, deltaTime);
        });

        $scope.hoverHero = {
            title : ""
        }

        $scope.showHeroName = function(hero) {
            $scope.hoverHero.title = hero.title;
        }
        $scope.hideHeroName = function(hero) {
            $scope.hoverHero.title = "";
        }

        $("#Settings").sidebar('hide');
    });
})();