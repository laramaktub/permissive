'use strict';

let conf = require('../config');
conf.set('service', 'mock');

let expect = require('chai').expect,
    github = require('../components/services/github.mock'),
    repos = require('./repos');

//jscs:disable disallowDanglingUnderscores
describe('repos.js', () => {

    describe('listRepos', () => {

        it('private repos are listed', (done) => {

            let req = {
                session: {
                    passport: {
                        user: {
                            username: 'testuser1'
                        }
                    }
                }
            };

            //testuser1 in the mock data can see the private repo
            repos.listRepos(req, {}, () => {
                let entity = req.entity;
                expect(entity.length).to.equal(2);
                expect(entity[0].permission).to.be.undefined;
                done();
            });

        });

    });

    describe('listReposPermission', () => {

        it('missing "permission_user" query param results in passthrough', (done) => {

            let req = {
                query: {},
                entity: [{
                    id: 1
                }]
            };

            repos.listReposPermission(req, {}, () => {
                let entity = req.entity;
                expect(entity.length).to.equal(1);
                expect(entity[0].permission).to.be.undefined;
                done();
            });

        });

        it('"permission_user" query param adds "permission" flag to repos', (done) => {

            let req = {
                query: {
                    permission_user: 'testuser3'
                },
                entity: [{
                    id: 1
                }]
            };

            //mock permissive team only exists for push
            repos.listReposPermission(req, {}, () => {
                let entity = req.entity;
                expect(entity.length).to.equal(1);
                expect(entity[0].permission).to.equal('push');
                done();
            });

        });

        it('users with no permission default to "pull" for public repositories', (done) => {

            let req = {
                query: {
                    permission_user: 'testuser4'
                },
                entity: [{
                    id: 1
                }]
            };

            //testuser4 has no permissions in the mocks
            repos.listReposPermission(req, {}, () => {
                let entity = req.entity;
                expect(entity.length).to.equal(1);
                expect(entity[0].permission).to.equal('pull');
                done();
            });

        });

    });

    describe('listReposLinks', () => {

        it('missing "permission_user" query param results in passthrough', (done) => {

            let req = {
                query: {},
                session: {
                    passport: {
                        user: {
                            username: 'testuser1'
                        }
                    }
                },
                entity: [{
                    id: 1
                }]
            };

            repos.listReposLinks(req, {}, () => {
                let entity = req.entity;
                expect(entity.length).to.equal(1);
                expect(entity[0].links).to.be.undefined;
                done();
            });

        });

        it('if logged-in user does not have "admin" permission on repo, "edit-user-permission" link is not present', (done) => {

            let req = {
                query: {
                    permission_user: 'testuser1'
                },
                session: {
                    passport: {
                        user: {
                            username: 'testuser1'
                        }
                    }
                },
                entity: [{
                    id: 1
                }]
            };

            repos.listReposLinks(req, {}, () => {
                let entity = req.entity;
                expect(entity.length).to.equal(1);
                expect(entity[0].links).to.be.undefined;
                done();
            });

        });

        it('if logged-in user has "admin" permission on repo, "edit-user-permission" link is present', (done) => {

            let req = {
                query: {
                    permission_user: 'testuser1'
                },
                session: {
                    passport: {
                        user: {
                            username: 'testuser1'
                        }
                    }
                },
                entity: [{
                    id: 2
                }]
            };

            repos.listReposLinks(req, {}, () => {
                let entity = req.entity;
                expect(entity.length).to.equal(1);
                expect(entity[0].links.length).to.equal(1);
                expect(entity[0].links[0].rel).to.equal('edit-user-permission');
                done();
            });

        });

    });

});
