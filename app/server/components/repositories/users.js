'use strict';

var github = require('../services/github');

module.exports = {
    get: () => {
        return github.getMembers({
            user: github.config.username,
            org: github.config.org,
            per_page: 100
        });
    }
};