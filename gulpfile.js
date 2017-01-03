var vinyl_source = require('vinyl-source-stream');
var browserify = require('browserify');
var watchify = require('watchify');
var gulp = require('gulp');
var gulp_util = require('gulp-util');
var assign = require('lodash/object/assign');

var generateBrowserifyBundler = function(src){
	var browserify_config = assign( {}, watchify.args, {
		debug: true
	});
	var bundler = browserify( src, browserify_config );
	/* transforms are configured in package.json */
	return bundler;
};

var compileTask = function(src, dest){
	return function () {
		var bundler = generateBrowserifyBundler(src);
		return bundler.bundle()
			.pipe( vinyl_source(dest) )
			.pipe( gulp.dest('./dist') );
	}
};

var watchTask = function(src, dest){
	return function(){
		var bundler = watchify( generateBrowserifyBundler(src) );
		var bundle = function(){
			return bundler.bundle()
				.on( 'error', function( error ){
					gulp_util.log( '[watchify]', error.toString() );
					gulp_util.beep();
					this.emit('end');
				})
				.pipe( vinyl_source(dest) )
				.pipe( gulp.dest('./dist') );
		};
		bundler.on( 'update', function(){
			gulp_util.log( '[watchify]', 'Bundling '+dest+'...');
			bundle();
		});
		bundler.on( 'time', function( time ){
			gulp_util.log( '[watchify]', 'Bundled '+dest+' in '+ time +'ms');
		});
		return bundle();
	}
};

gulp.task( 'compile content.js', compileTask('./src/content.jsx', 'content.js') );

gulp.task( 'compile event.js', compileTask('./src/event.js', 'event.js') );

gulp.task( 'compile and watch content.js', watchTask('./src/content.jsx', 'content.js') );

gulp.task( 'compile and watch event.js', watchTask('./src/event.js', 'event.js') );

gulp.task( 'copy static files', function(){
	gulp.src([
		'./src/manifest.json',
		'./src/images/**/*'
	], { base: './src' })
		.pipe( gulp.dest('dist') );
});

gulp.task( 'watch static files', function(){
	gulp.watch([
		'./src/manifest.json',
		'./src/images/**/*'
	], ['copy static files']);
});

gulp.task( 'build', [
	'compile content.js',
	'compile event.js',
	'copy static files'
]);

gulp.task( 'dev', [
	'compile and watch content.js',
	'compile and watch event.js',
	'copy static files',
	'watch static files'
]);

gulp.task( 'default', ['dev'] );
