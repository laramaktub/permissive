'use strict';

var permissionRepository = require('../components/repositories/permissions'),
    repoRepository = require('../components/repositories/repos'),
    session = require('../session');

module.exports = {

    listRepos (req, res, next) {
        console.log('listing repos [' + req.path + ']');
        console.log('query:' + JSON.stringify(req.query, null, 2));

        repoRepository.getRepos().then(repos => {
            req.entity = repos;
            next();
        }).catch(err => next(err));
    },

    listReposPermission (req, res, next) {
        console.log('looking up user permission for repos');

        let username = req.query.permission_user,
            repos = req.entity;

        if (username) {
            permissionRepository.setUserPermissionForRepos(repos, username).then(repos => {
                req.entity = repos;
                next();
            }).catch(err => next(err));
        } else {
            next();
        }
    },

    listReposLinks (req, res, next) {
        console.log('checking for links on repo list');

        let repos = req.entity,
            user = req.query.permission_user,
            username = session.user.username;

        if (user) {
            permissionRepository.getRepoPermissionsForUser(repos, username).then(permissions => {
                repos.forEach(repo => {
                    let permission = permissions[repo.id];
                    if (permission.permissive === 'admin' || permission.github === 'admin') {
                        repo.links = [{
                            rel: 'edit-user-permission',
                            href: 'repos/' + repo.id + '/users/' + username + '/permissions/{permission}',
                            method: 'PUT'
                        }];
                    }
                });
                next();
            }).catch(err => next(err));
        } else {
            next();
        }
    },

    readRepo (req, res, next) {
        console.log('getting repo [' + req.path + ']');
        console.log('params:' + JSON.stringify(req.params, null, 2));

        let repoId = req.params.id;
        repoRepository.getRepo(repoId).then(repo => {
            req.entity = repo;
            next();
        }).catch(err => next(err));
    }
};
