var GitHubApi = require("github");

var username = process.env.GITHUB_USER,
    password = process.env.GITHUB_PASSWORD,
    org = "atsid";

var github = new GitHubApi({
    debug: true,
    version: "3.0.0",
    protocol: "https",
    host: "api.github.com",
    timeout: 5000,
    headers: {
        "user-agent": username
    }
});

github.authenticate({
    type: "basic",
    username: username,
    password: password
});

module.exports = {
    get: function (callback) {
        github.orgs.getMembers({
            user: username,
            org: org,
            per_page: 100
        }, function(err, res) {
            callback(null, res);
            console.log(res);
        });
    }
};
