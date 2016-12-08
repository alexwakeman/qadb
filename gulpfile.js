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
var shell = require('gulp-shell');
var less = require('gulp-less');

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
		CMS Login
	 */
	srcDest('node_modules/bootstrap/dist/**/*', 'dist/login/libs/bootstrap'),
	/*
		Public site
	 */
	srcDest('node_modules/bootstrap/dist/**/*', 'dist/public/libs/bootstrap'),
	srcDest('node_modules/react/dist/react.js', 'dist/public/libs/react'),
	srcDest('node_modules/react-dom/dist/react-dom.js', 'dist/public/libs/react-dom'),
	srcDest('node_modules/rxjs/**/*.js', 'dist/public/libs/rxjs'),
	srcDest('node_modules/wolfy87-eventemitter/EventEmitter.js', 'dist/public/libs/eventemitter')
];

gulp.task('riskchecker:js', function() {
	gulp.src([
		'risk-checker/build/private/src/js/lib/jquery.js',
		'risk-checker/build/private/src/js/lib/bootstrap-modal.js',
		'risk-checker/build/private/src/js/lib/moustache.js',
		'risk-checker/build/private/src/js/lib/qunit.js',
		'risk-checker/build/private/src/js/module.js',
		'risk-checker/build/private/src/js/main.js',
		'risk-checker/build/private/src/js/accessibility.js',
		'risk-checker/build/private/src/js/analytics.js',
		'risk-checker/build/private/src/js/fonts.js',
		'risk-checker/build/private/src/js/interface.js',
		'risk-checker/build/private/src/js/jquery.vjustify.js',
		'risk-checker/build/private/src/js/menu.js',
		'risk-checker/build/private/src/js/polyfill.js',
		'risk-checker/build/private/src/js/questions.js',
		'risk-checker/build/private/src/js/video.js',
		'risk-checker/build/private/src/js/risk_checker/*.js',
	])
		.pipe(concat('main.js'))
		.pipe(gulp.dest('risk-checker/build/public/js/'));
});

gulp.task('riskchecker:less', function () {
	gulp.src(['risk-checker/build/private/src/less/main.less', 'risk-checker/build/private/src/less/osmap.less'])
		.pipe(less({
			paths: [ path.join(__dirname, 'less', 'includes') ]
		}))
		.pipe(gulp.dest('risk-checker/build/public/css'));
});

gulp.task('riskchecker:html', shell.task([
	'php ./risk-checker/build/private/bin/rebuild.php'
]));

gulp.task('watch', ['build', 'server'], function() {
	gulp.watch('cms/stylesheets/*.scss', ['cms:sass']);
	gulp.watch('cms/**/*.html', ['cms:html']);
	gulp.watch('cms/**/*.ts', ['cms:app']);
	gulp.watch('cms/loader/systemjs.config.js', ['cms:loader']);

	gulp.watch('public/stylesheets/*.scss', ['public:sass']);
	gulp.watch('public/**/*.html', ['public:html']);
	gulp.watch('public/**/*.+(tsx|ts)', ['public:app']);
});

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
	return gulp.src('cms/index.html')
		.pipe(gulp.dest('dist/cms'));
});

gulp.task('cms:login', function () {
	return gulp.src('login/**/*')
		.pipe(gulp.dest('dist/login'));
});

gulp.task('cms:loader', function() {
	return gulp.src('cms/loader/systemjs.config.js')
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
	gulp.src('public/img/**/*')
		.pipe(gulp.dest('dist/public/img'));
	return gulp.src('public/index.html')
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
	gulp.watch('public/**/*.+(tsx|ts)', ['public:app']);

	gulp.watch('risk-checker/build/private/src/**/*.php', ['riskchecker:html']);
	gulp.watch('risk-checker/build/private/src/**/*.js', ['riskchecker:js']);
	gulp.watch('risk-checker/build/private/src/**/*.less', ['riskchecker:less']);
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
	runSequence('clean', 'libs', 'cms:app', 'cms:html', 'cms:login', 'cms:sass',
		'public:app', 'public:sass', 'public:html', 'riskchecker:html', 'riskchecker:js', 'riskchecker:less', callback);
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
