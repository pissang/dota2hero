(function() {

    'use strict';

    var Shader = qtek.Shader;
    var app = angular.module("heroViewer");
    
    app.provider("config", function() {

        var config = {
            shadow : {
                enabled : true,
                resolution : 512,
                softShadow : 'vsm'
            }
        }
        $('#ShadowQuality').dropdown({
            onChange : function(value, text) {
                if (value === 'none') {
                    config.shadow.enabled = false;
                }
                else if (value === 'low') {
                    config.shadow.enabled = true;
                    config.shadow.resolution = 256;
                }
                else if (value === 'high') {
                    config.shadow.enabled = true;
                    config.shadow.resolution = 512;
                }
            },
            debug : false,
            verbose : false,
            performance : false
        });

        $('#SoftShadow').dropdown({
            onChange : function(value, text) {
                config.shadow.softShadow = value;
            },
            debug : false,
            verbose : false,
            performance : false
        });
        this.$get = function () {
            return config;
        }
    });
})();