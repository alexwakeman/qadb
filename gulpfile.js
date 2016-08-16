var gulp = require('gulp');
var path = require('path');
var sourcemaps = require('gulp-sourcemaps');
var ts = require('gulp-typescript');
var del = require('del');
var concat = require('gulp-concat');
var runSequence = require('run-sequence');
var sass = require('gulp-sass');
var nodemon = require('gulp-nodemon');
var webpack = require('webpack-stream');

var dependencies = [
	/*
		CMS
	*/
	srcDest('node_modules/bootstrap/dist/**/*', 'dist/cms/libs/bootstrap'),
	srcDest('node_modules/systemjs/dist/system.src.js', 'dist/cms/libs/systemjs'),
	srcDest('node_modules/zone.js/dist/zone.min.js', 'dist/cms/libs/zone.js'),
	srcDest('node_modules/reflect-metadata/Reflect.js', 'dist/cms/libs/reflect-metadata'),
	srcDest('node_modules/@angular/**/bundles/*.umd.js', 'dist/cms/libs/@angular'),
	srcDest('node_modules/rxjs/**/*.js', 'dist/cms/libs/rxjs'),
	/*
		Public site
	 */
	srcDest('node_modules/bootstrap/dist/**/*', 'dist/public/libs/bootstrap'),
	srcDest('node_modules/react/dist/react.js', 'dist/public/libs/react'),
	srcDest('node_modules/react-dom/dist/react-dom.js', 'dist/public/libs/react-dom')
];

gulp.task('clean', function () {
	return del('dist')
});

gulp.task('libs', function () {
	dependencies.forEach((dep) => gulp.src(dep.src).pipe(gulp.dest(dep.dest)));
});

gulp.task('cms:app', ['cms:loader'], function () {
	var tsProject = ts.createProject('cms/tsconfig.json');
	var tsResult = gulp.src('cms/**/*.ts')
		.pipe(sourcemaps.init())
		.pipe(ts(tsProject));
	return tsResult.js
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('dist/cms'));
});

gulp.task('cms:html', function() {
	gulp.src('cms/**/*.html')
		.pipe(gulp.dest('dist/cms'));
	gulp.src('cms/index.html')
		.pipe(gulp.dest('dist/cms'));
});

gulp.task('cms:login', function () {
	gulp.src('node_modules/bootstrap/dist/**/*')
		.pipe(gulp.dest('dist/login/bootstrap'));
	return gulp.src('login/**/*')
		.pipe(gulp.dest('dist/login'));
});

gulp.task('cms:loader', function() {
	gulp.src('cms/loader/systemjs.config.js')
		.pipe(gulp.dest('dist/cms/loader'));
});

gulp.task('cms:sass', function() {
	return gulp.src('cms/stylesheets/*.scss')
		.pipe(sass())
		.pipe(gulp.dest('dist/cms/stylesheets'));
});

gulp.task('public:app', function () {
	return gulp.src('public/app/app.tsx')
		.pipe(webpack(require('./webpack.config.js')))
		.pipe(gulp.dest('dist/public/app'));
});

gulp.task('public:html', function() {
	gulp.src('public/index.html')
		.pipe(gulp.dest('dist/public'));
});

gulp.task('public:sass', function() {
	return gulp.src('public/stylesheets/*.scss')
		.pipe(sass())
		.pipe(gulp.dest('dist/public/stylesheets'));
});

gulp.task('watch', ['build', 'server'], function() {
	gulp.watch('cms/stylesheets/*.scss', ['cms:sass']);
	gulp.watch('cms/**/*.html', ['cms:html']);
	gulp.watch('cms/**/*.ts', ['cms:app']);
	gulp.watch('cms/loader/systemjs.config.js', ['cms:loader']);

	gulp.watch('public/stylesheets/*.scss', ['public:sass']);
	gulp.watch('public/**/*.html', ['public:html']);
	gulp.watch('public/**/*.tsx', ['public:app']);
});

gulp.task('server', function() { // starts and restarts the node server
	nodemon({
		script: 'server/server.js',
		watch: ['server/**/*.js'],
		ext: 'js'
	}).on('restart', () => {
		console.warn('Restarted the node daemon - server/server.js');
	});
});

gulp.task('build', function (callback) {
	runSequence('clean', 'libs', 'cms:loader', 'cms:app', 'cms:html', 'cms:login', 'cms:sass',
		'public:app', 'public:sass', 'public:html', callback);
});

gulp.task('default', ['build']);

/*
 Utility functions
 */

function srcDest(src, dest) {
	if (!src || !dest) throw new Error('Both source and destination are required.');
	return {
		src: src,
		dest: dest
	}
}
