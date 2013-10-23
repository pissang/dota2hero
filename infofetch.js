var jsdom = require('jsdom');
var async = require('async');
var fs = require('fs');
var http = require('http');
var colors = require('colors');

var lang = process.argv[2] || 'en';
var website, output; 
if (lang === 'cn') {
    website = 'http://www.dota2.com.cn/heroes';
} else if (lang === 'en') {
    website = 'http://www.dota2.com/heroes';
}
output = 'heroes/overview_' + lang + '.json';

function download(uri, path) {
    http.get(uri, function(response) {
        response.pipe(fs.createWriteStream(path));
    });
}

function resolve(window, href) {
    var url = require('url');
    return url.resolve(
        window.location.protocol + '//' + window.location.host,
        href
    );
}

var HERO_ALIAS = {
    'templar_assassin' : 'lanaya',
    'gyrocopter' : 'gyro',
    'nyx_assassin' : 'nerubian_assassin',
    'bloodseeker' : 'blood_seeker',
    'drow_ranger' : 'drow',
    'riki' : 'rikimaru'
}

jsdom.env(
    website,
    ['http://code.jquery.com/jquery.js'],
    function(err, window) {
        var $ = window.$;
        var heroOverviews = [];

        async.eachLimit(
            $('.heroPickerIconLink').toArray(),
            3,
            function(item, callback) {
                var $item = $(item);
                var id = $item.attr('id');
                var href = resolve(window, $item.attr('href'));
                var heroName = id.substr('link_'.length);
                if (HERO_ALIAS[heroName]) {
                    heroName = HERO_ALIAS[heroName];
                }
                var heroRoot = 'heroes/' + heroName;

                if (!fs.existsSync(heroRoot)) {
                    console.log('[Skipped] '.red + heroName);
                    callback();
                    return;
                }
                fetchHero(heroName, href, function(overview) {
                    if (overview) {
                        overview['hover'] = resolve(
                            window,
                            $item.find("img.heroHoverLarge").attr("src")
                        );
                        heroOverviews.push(overview);
                    }
                    callback();
                });
            },
            function(err) {
                fs.writeFileSync(
                    output,
                    JSON.stringify(heroOverviews, false, 4),
                    'utf-8'
                );
            }
        );
    }
);

function getTitle(window) {
    var $ = window.$;
    if (lang === 'en') {
        return $('#centerColContent h1').text();
    } else if (lang === 'cn') {
        return $('#main .tit h1').text();
    } else {
        return '';
    }
}

function getPortrait(window) {
    var $ = window.$;
    if (lang === 'en') {
        return $('#heroPrimaryPortraitImg').attr('src');
    } else if (lang === 'cn') {
        return resolve(window, $('.ttimg img').attr('src'));
    } else {
        return '';
    }
}

function getAbilities(window) {
    var $ = window.$;
    var abilities = [];
    if (lang === 'en') {
        $("#overviewHeroAbilities .overviewAbilityRow")
            .each(function() {
                var $abiIconImg = $(this).find('.overviewAbilityImg');
                var abiName = $abiIconImg.attr("abilityname");

                var abiTitle = $(this).find(".overviewAbilityRowDescription h2").text();
                var abiDetail = $(this).find(".overviewAbilityRowDescription p").text();

                abilities.push({
                    name : abiName,
                    title : abiTitle,
                    detail : abiDetail,
                    icon : $abiIconImg.attr('src')
                });
            });
    } else if (lang === 'cn') {
        $('ul.skill li')
            .each(function() {
                var abiIcon = resolve(
                    window,
                    $(this).find('.skill_img img').attr('src')
                );
                
                var abiTitle = $(this).find(".skill_tit h2").text();
                var abiDetail = $(this).find(".skill_tit p").text();

                abilities.push({
                    name : '',
                    title : abiTitle,
                    detail : abiDetail,
                    icon : abiIcon
                });
            });
    }
    return abilities;
}

function fetchHero(name, href, callback) {
    jsdom.env(
        href,
        ['http://code.jquery.com/jquery.js'],
        function(err, window) {
            console.log('[Fetched] '.green + name);
            callback({
                name : name,
                title : getTitle(window),
                portrait : getPortrait(window),
                abilities : getAbilities(window)
            });
        }
    );
}