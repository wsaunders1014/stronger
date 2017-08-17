var gulp = require('gulp');
var less = require('gulp-less');
var sourcemaps = require('gulp-sourcemaps');
var cleanCSS = require('gulp-clean-css');
var uglify = require('gulp-uglify');
var pump = require('pump');
var rename = require('gulp-rename');
const changed = require('gulp-changed');


gulp.task('default', ['watch']);
gulp.task('compileLess', function(cb){
	return gulp.src('less/*.less')
	  .pipe(sourcemaps.init())
	  .pipe(less())
	  .pipe(gulp.dest('dist/css'))
	  .pipe(rename({suffix:'.min'}))
	  .pipe(cleanCSS({compatibility: 'ie8'}))
	  .pipe(sourcemaps.write('maps'))
	  .pipe(gulp.dest('dist/css'));
})

gulp.task('minify-js', function (cb) {
  pump([
  		  sourcemaps.init(),
        gulp.src('src/js/*.js'),
        gulp.dest('dist/js'),
        uglify(),
        rename({suffix:'.min'}),
        sourcemaps.write('maps'),
        gulp.dest('dist/js')
    ],
    cb
  );
});

gulp.task('watch', function() {
  gulp.watch('src/img/*', ['imgmin']);
  gulp.watch('src/js/*', ['minify-js']);
  gulp.watch('less/*', ['compileLess']);
});