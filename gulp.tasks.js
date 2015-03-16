'use strict';
var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    jscs = require('gulp-jscs'),
    mocha = require('gulp-mocha'),
    nodemon = require('gulp-nodemon'),
    gutil = require('gulp-util'),
    changed = require('gulp-changed'),
    runSequence = require('run-sequence'),
    Bluebird = require('bluebird'),
    istanbul = require('gulp-istanbul'),
    coveralls = require('gulp-coveralls'),
    isparta = require('isparta'),

    /**
     * Build Constants
     */
    APP_SRC = ['app/**/*.js', 'app/*.js', '!app/client/**'],
    SERVER_SRC = 'app/server/**/*.js',
    ALL_SRC = APP_SRC.concat(['*.js']),
    SERVER_TEST_SRC = 'app/server/test/**/Test*.js',
    SERVER_IT_SRC = 'app/server/it/**/Test*.js',
    devServer = null;

/**
 * Static Analysis Tasks
 */
gulp.task('lint', () => {
    return gulp.src(ALL_SRC)
        .pipe(jshint({lookup: true}))
        .pipe(jshint.reporter('default'));
});

gulp.task('jscs', () => {
    return gulp.src(ALL_SRC)
        .pipe(jscs());
});

gulp.task('static-checks', [
    'lint',
    'jscs'
]);

/**
 * Testing Tasks
 */
function instrumentSource() {
    return gulp.src(SERVER_SRC)
        .pipe(istanbul({
            instrumenter: isparta.Instrumenter,
            includeUntested: true
        }))
        .pipe(istanbul.hookRequire());
}
gulp.task('test', () => {
    return new Bluebird((resolve, reject) => {
        instrumentSource()
            .on('finish', () => {
                gulp.src(SERVER_TEST_SRC)
                    .pipe(mocha())
                    .pipe(istanbul.writeReports({
                        reporters: ['lcov', 'text-summary']
                    }))
                    .on('end', resolve);
            });
    });
});

gulp.task('exec-itest', ['start-server'], () => {
    return new Bluebird((resolve, reject) => {
        instrumentSource()
            .on('finish', () => {
                gulp.src(SERVER_IT_SRC)
                    .pipe(mocha())
                    .pipe(istanbul.writeReports())
                    .on('end', resolve);
            });
    });
});

gulp.task('itest', [
    'start-server',
    'exec-itest',
    'halt-server'
]);

gulp.task('report-coverage', () => {
    return gulp.src('coverage/**/lcov.info')
        .pipe(coveralls());
});

/**
 * App-Server Startup (for test)
 */
gulp.task('start-server', () => {
    return new Bluebird((resolve, reject) => {
        devServer = nodemon({
            script: 'app.js',
            ext: 'js',
            watch: ['app/server/**/*.js', 'app/*.js'],
            env: {
                'NODE_ENV': 'development'
            },
            stdout: false,
            stderr: true
        });

        devServer
            .on('exit', () => {
                gutil.log("Process exiting");
                reject();
            })
            .on('change', ['static-checks'])
            .on('restart', () => {
                gutil.log('**** Server Restarted ****');
            })
            .on('stdout', (data) => {
                let output = data.toString();
                gutil.log(output);
                if (output.indexOf("Express server listening on port") !== -1) {
                    gutil.log("**** Server Ready ****");
                    resolve(devServer);
                }
            });
    });
});

gulp.task('halt-server', ['exec-itest'], () => {
    devServer.emit('quit');
});

gulp.task('default', (cb) => {
    runSequence(
        'static-checks',
        'test',
        'report-coverage',
        cb);
});