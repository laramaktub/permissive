'use strict';

module.exports = /*@ngInject*/
    () => {
        return {
            templateUrl: 'common/directives/user/user.html',
            scope: {
                user: '='
            },
            controllerAs: 'ctrl',
            bindToController: true,
            controller: /*@ngInject*/
                function (reposService) {
                    this.toggled = false;

                    this.click = () => {
                        console.log('user click ' + this.user.username);
                        this.toggled = !this.toggled;
                        if (this.toggled && !this.repos) {
                            this.repos = reposService.query({
                                permission_user: this.user.username
                            });
                        }
                    };
                }
        };
    };
