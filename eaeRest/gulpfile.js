var gulp = require('gulp');

var ui5preload = require('gulp-ui5-preload');
var uglify = require('gulp-uglify');
var prettydata = require('gulp-pretty-data');
var gulpif = require('gulp-if');

gulp.task(
    'ui5preload',
    function() {
        return gulp.src(
                [
                    'src/main/webapp/ui/**.+(js|xml)',
                    '!Component-preload.js',
                    '!gulpfile.js',
                    '!WEB-INF/web.xml',
                    '!model/metadata.xml',
                    '!node_modules/**',
                    '!resources/**'
                ]
            )
            .pipe(gulpif('**/*.js', uglify())) //only pass .js files to uglify
            .pipe(gulpif('**/*.xml', prettydata({type: 'minify'}))) // only pass .xml to prettydata 
            .pipe(ui5preload({
                base: 'src/main/webapp/ui/',
                namespace: 'org.eae.tools',
                fileName: 'Component-preload.js'
            }))
            .pipe(gulp.dest('./src/main/webapp/ui/'));
    }
)