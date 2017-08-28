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
gulp.task('compileLess', function(cb){
	return gulp.src(['less/*.less','!dist/css/*.gz'])
	  .pipe(sourcemaps.init())
	  .pipe(less())
	  .pipe(gulp.dest('dist/css'))
	  .pipe(rename({suffix:'.min'}))
	  .pipe(cleanCSS({compatibility: 'ie8'}))
	  .pipe(sourcemaps.write('maps'))
	  .pipe(gulp.dest('dist/css'));
});
gulp.task('gzip', function(){
  return gulp.src(['dist/**/*','!dist/**/*.gz'])
  .pipe(gzip())
  .pipe(gulp.dest('dist'))
})
// gulp.task("index", function(cb){
//   var jsFilter = filter("**/*.js", { restore: true });
//   var cssFilter = filter("**/*.css", { restore: true });
//   return gulp.src("src/index.html")
//   .pipe(jsFilter)
//   .pipe(cssFilter)
// })
// gulp.task("revreplace", ["revision"], function(){
//   var manifest = gulp.src("./" + opt.distFolder + "/rev-manifest.json");

//   return gulp.src(opt.srcFolder + "/index.html")
//     .pipe(revReplace({manifest: manifest}))
//     .pipe(gulp.dest(opt.distFolder));
// });
gulp.task('minify-js', function (cb) {
  pump([
  		  sourcemaps.init(),
        gulp.src(['src/js/*.js','dist/js/*.gz']),
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
});