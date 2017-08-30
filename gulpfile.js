var gulp = require('gulp');
var less = require('gulp-less');
var sourcemaps = require('gulp-sourcemaps');
var cleanCSS = require('gulp-clean-css');
var uglify = require('gulp-uglify');
var pump = require('pump');
var rename = require('gulp-rename');
const changed = require('gulp-changed');
var inlinesource = require('gulp-inline-source');
const rev = require('gulp-rev');
var revReplace = require("gulp-rev-replace");
var gzip = require('gulp-gzip');


gulp.task('default', ['watch']);
gulp.task('minify-css', function(){
  return gulp.src('src/css/*.css')
    
    .pipe(rename({suffix:'.min'}))
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest('dist/css'))
})
gulp.task('compileLess', function(cb){
	return gulp.src(['less/*.less'])
	  .pipe(less())
	  .pipe(gulp.dest('src/css'))
});
gulp.task('gzip', function(){
  return gulp.src(['dist/**/*.*','!dist/img/*','!dist/**/*.gz','!dist/**/*.less'])
  .pipe(gzip())
  .pipe(gulp.dest('dist/'))
})

gulp.task('minify-js', function (cb) {
  pump([
  		  sourcemaps.init(),
        gulp.src(['src/js/*.js']),
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
  gulp.watch('src/js/*', ['minify-js','gzip']);
  gulp.watch('less/*', ['compileLess','gzip']);
  gulp.watch('src/css/*.css', ['minify-css']);
});
gulp.task('build', function(){

})