'use strict';

var GitHubApi = require('github'),
    Bluebird = require('bluebird'),
    debug = require('debug')('app:services:github'),
    conf = require('../../config'),
    org = conf.get('github.org'),
    token = conf.get('github.token'),
    acceptHeader = conf.get('github.acceptHeader'),
    github = new GitHubApi({
        version: '3.0.0',
        protocol: 'https',
        host: 'api.github.com',
        timeout: 10000,
        headers: {
            'user-agent': 'permissive'
        }
    });

if (token) {
    github.authenticate({
        type: 'oauth',
        token: token
    });
    debug('Github authentication method: Token');
} else {
    debug('No Github Token found. App will be unable to authenticate.');
}

if (acceptHeader) {
    github.config.headers.Accept = acceptHeader;
}

/**
 * Emit an object with Promisified Github methods and a raw, configured github API object.
 * @type {{github: *, getMembers}}
 */
module.exports = {
    github: github,
    config: {
        org: org
    },
    isOrgMember: Bluebird.promisify(github.orgs.getMember),
    getUsers: Bluebird.promisify(github.orgs.getMembers),
    getUser: Bluebird.promisify(github.user.getFrom),
    getRepos: Bluebird.promisify(github.repos.getFromOrg),
    isCollaborator: Bluebird.promisify(github.repos.getCollaborator),
    addCollaborator: Bluebird.promisify(github.repos.addCollaborator),
    removeCollaborator: Bluebird.promisify(github.repos.removeCollaborator),
    getTeam: Bluebird.promisify(github.orgs.getTeam),
    getCollaborators: Bluebird.promisify(github.repos.getCollaborators),
    getTeams: Bluebird.promisify(github.orgs.getTeams),
    createTeam: Bluebird.promisify(github.orgs.createTeam),
    getTeamMembers: Bluebird.promisify(github.orgs.getTeamMembers),
    getTeamRepos: Bluebird.promisify(github.orgs.getTeamRepos),
    addTeamMember: Bluebird.promisify(github.orgs.addTeamMember),
    deleteTeamMember: Bluebird.promisify(github.orgs.deleteTeamMember)
};
