'use strict';

module.exports =
    angular.module('permissive', [
        'ui.router',

        'ngMaterial',
        'ngResource',

        //html templates in $templateCache generated by Gulp:
        require('../../../tmp/templates').name,

        //general directives, filters, services shared across the app
        require('../common').name,

        require('./main/main').name,
        require('./users/users').name

        //load other app modules here, e.g.:
        //require('./account').name
    ])
    .config(function ($urlRouterProvider) {
        $urlRouterProvider.otherwise('/');
    });
