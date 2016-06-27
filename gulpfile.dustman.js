'use strict';

/*
  D U S T M A N
  0.7.34

  A Gulp 4 automation boilerplate
  by https://github.com/vitto
*/

var gulp = require('gulp');

    // autoprefixer = require('gulp-autoprefixer'),
    // concat       = require('gulp-concat'),
    // csslint      = require('gulp-csslint'),
    // sass         = require('gulp-sass'),
    // less         = require('gulp-less'),
    // rename       = require('gulp-rename'),
    // sourcemaps   = require('gulp-sourcemaps'),
    // stylestats   = require('gulp-stylestats'),
    // uglify       = require('gulp-uglify'),
    // twig         = require('gulp-twig'),
    // uglifyCss    = require('gulp-uglifycss'),
    // prettify     = require('gulp-html-prettify'),
    // moment       = require('moment'),
    // sequence     = require('run-sequence'),
    // exec         = require('child_process').exec,
    // fs           = require('fs'),
    // faker        = require('faker'),
    // browserSync  = require('browser-sync');


var config = (function(){
  var colour = require('colour');
  var fs = require('fs');
  var yaml = require('js-yaml');
  var merge = require('merge');
  var path = require('path');

  var configFile = 'dustman.yml';

  var data = {
    config: {
      autoprefixer: {
        browsers: [
          'last 3 versions'
        ]
      },
      faker: {
        locale: 'en'
      },
      prettify: {
        indent_char: ' ',
        indent_size: 2
      },
      twig: {
        cache: false
      },
      verbose: 3
    },
    css: {
      file: 'dustman.min.css',
      watch: './**/*.css'
    },
    js: {
      file: 'dustman.min.js',
      watch: './**/*.js'
    },
    paths: {
      css: 'dustman/css/',
      fonts: 'dustman/fonts/',
      images: 'dustman/img/',
      js: 'dustman/js/',
      server: 'dustman/'
    },
    tasks: [
      'css',
      'js',
      'html'
    ],
    vendors: {
      css: {
        merge: true
      }
    }
  };

  var configFileExists = function(configFile) {
    try {
      fs.accessSync(configFile, fs.F_OK);
      return true;
    } catch (e) {
      console.log(colour.red('Error: config file ') + colour.yellow(configFile) + colour.red(' NOT found'));
      process.exit();
    }
  };

  var checkDefaultConfig = function(loadedConfig, configFile){
    if (!loadedConfig) {
      configFileExists(configFile);
      return yaml.safeLoad(fs.readFileSync(configFile, 'utf-8'));
    }
    return loadedConfig;
  };

  var pathClean = function(configPath) {
    return path.normalize(configPath).replace(/\/$/, '') + '/';
  };

  var checkArguments = function(){
    var loadedConfig = false;
    for (var i = 0; i < process.argv.length; i += 1) {
      if (process.argv[i] === '--config' && process.argv[i + 1] !== undefined) {
        configFile = process.argv[i + 1];
        configFileExists(configFile);
        loadedConfig = yaml.safeLoad(fs.readFileSync(configFile, 'utf-8'));
      }
    }
    loadedConfig = checkDefaultConfig(loadedConfig, configFile);
    data = merge.recursive(true, data, loadedConfig);

    data.paths.css = pathClean(data.paths.css);
    data.paths.fonts = pathClean(data.paths.fonts);
    data.paths.images = pathClean(data.paths.images);
    data.paths.js = pathClean(data.paths.js);
    data.paths.server = pathClean(data.paths.server);
  };

  var ifProp = function(propName) {
    return typeof data[propName] !== 'undefined' ? true : false;
  };

  var error = function(message) {
    console.log(colour.red('Error:') + message);
    process.exit();
  };

  return {
    file: function() {
      return configFile;
    },
    get: function(propName){
      if (!ifProp(propName)) {
        error('Required property ' + colour.yellow(propName) + ' NOT found in ' + colour.yellow(configFile));
      }
      return data[propName];
    },
    hasTask: function(taskName) {
      if (!ifProp('tasks')) {
        error('Required property ' + colour.yellow('tasks') + ' NOT found in ' + colour.yellow(configFile));
      }
      for (var i = 0; i < data.tasks.length; i += 1) {
        if (data.tasks[i] === taskName) {
          return true;
        }
      }
      return false;
    },
    if: function(propName){
      return ifProp(propName);
    },
    load: function(){
      checkArguments();
    },
    pathClean : function(configPath) {
      return path.normalize(configPath).replace(/\/$/, '') + '/';
    }
  };
})();


var message = (function(){
  var colour = require('colour');
  colour.setTheme({
    annoy: 'grey',
    error: 'red bold',
    event: 'magenta',
    intro: 'rainbow',
    speak: 'white',
    success: 'green',
    task: 'white',
    verbose: 'blue',
    warning: 'yellow bold'
  });

  var phrases = {
    add: [
      'What the hell is %file%?? I, DUSTMAN will do something to solve this situation...',
      'I\'ve found a sensational discovery, %file% is alive!',
      'Hey %file%, welcome to da build',
      'File %file% detected. Updating the build.'
    ],
    change: [
      'Hey, something\'s happened to %file%, this is a work for DUSTMAN...',
      'Dear %file%, do you really though I wouldn\'t noticed you? Hahaha!',
      'Aha! %file%! You are under build!',
    ],
    unlink: [
      'We have lost %file%, this is a work for DUSTMAN...',
      'Oh my god... %file%... Nooooo!',
      'Another good %file% gone... I will avange you...',
    ],
    wait: [
      'Waiting silently if something changes, is unlinked or added',
      'Dustman is watching them',
      'The dust is never clear totally, waiting for changes'
    ]
  };

  var isVerboseEnough = function(verbosity) {
    return config.get('config').verbose >= verbosity;
  };

  var log = function(level, message) {
    if (isVerboseEnough(level)) {
      console.log(message);
    }
  };

  var event = function(eventType, file) {
    var min, max, phrase, splitPhrase, finalPhrase, index;
    min = 1;
    max = phrases[eventType].length;
    index = (Math.floor(Math.random() * (max - min + 1)) + min) - 1;
    phrase = phrases[eventType][index];

    if (typeof file !== 'undefined') {
      splitPhrase = phrase.split('%file%');
      finalPhrase = colour.event(splitPhrase[0]) + file + colour.event(splitPhrase[1]);
    } else {
      finalPhrase = colour.event(phrase + '...');
    }

    log(1, finalPhrase);
  };

  return {
    annoy: function(message) {
      log(4, colour.annoy(message.trim()));
    },
    intro: function() {
      console.log('');
      console.log(colour.intro('   D U S T M A N   '));
      console.log('');
    },
    error: function(message) {
      log(0, colour.error('Error: ') + message.trim());
      process.exit();
    },
    event: function(eventType, file) {
      event(eventType, file);
    },
    wait: function() {
      log(3, '');
      event('wait');
    },
    notice: function(message) {
      log(3, colour.verbose('Notice: ') + message.trim());
    },
    speak: function(message) {
      log(2, colour.speak(message));
    },
    success: function(message) {
      log(2, colour.success(message.trim()));
    },
    task: function(message) {
      log(3, '');
      log(2, colour.task(message));
    },
    verbose: function(title, message) {
      if (typeof message !== 'undefined') {
        log(3, colour.verbose(title.trim() + ': ') + message.trim());
      } else {
        log(3, colour.verbose(title.trim()));
      }
    },
    warning: function(message){
      log(2, colour.warning('Warning: ') + message.trim());
    },
  };
})();

var task = task || {};

task.core = (function(){

  var fs = require('fs');

  return {
    action: function(name, actionName) {
      return name + ':' + actionName;
    },
    fileCheck: function(path){
      try {
        path = path.replace(new RegExp(/\*.*$/), '');
        fs.accessSync(path, fs.F_OK);
        return true;
      } catch (e) {
        message.error(path + ' NOT found');
        console.log(e);
        process.exit();
      }
    },
    fileExists: function(path) {
      try {
        path = path.replace(new RegExp(/\*.*$/), '');
        fs.accessSync(path, fs.F_OK);
        return true;
      } catch (e) {
        return false;
      }
    },
    has: function(task, property) {
      return property in task ? true : false;
    }
  };
})();

var tasks = (function(){

  var browserSync = require('browser-sync');

  var paths;
  var pipeline = {
    before:[],
    middle:[],
    after:[]
  };

  var tasksConfig = {};
  var watchFolders = [];

  var getWatchFolder = function(property) {
    if (config.if(property)) {
      var configProperty = config.get(property);
      if (task.core.has(configProperty, 'watch')) {
        return [configProperty.watch];
      }
    }
    return [];
  };

  var init = function() {
    paths = config.if('paths') ? config.get('paths') : false;
    tasksConfig = config.if('config') ? config.get('config') : false;

    watchFolders = watchFolders.concat(getWatchFolder('css'));
    watchFolders = watchFolders.concat(getWatchFolder('js'));
    watchFolders = watchFolders.concat(getWatchFolder('twig'));
  };

  var addToPipeline = function(subTaskPipeline) {
    pipeline.before = pipeline.before.concat(subTaskPipeline.before);
    pipeline.middle = pipeline.middle.concat(subTaskPipeline.middle);
    pipeline.after = pipeline.after.concat(subTaskPipeline.after.reverse());
  };

  var http = function(tasks) {

    gulp.task('http', gulp.series(tasks, function() {
      browserSync.stream();
      browserSync.init({
        server: {
            baseDir: paths.server
        },
        logLevel: 'info',
        notify: true
      });

      message.wait();

      return gulp.watch(watchFolders, gulp.series(tasks, function(done){
          browserSync.reload();
          message.wait();
          done();
        }))
        .on('change', function(path) {
          message.event('change', path);
        })
        .on('unlink', function(path) {
          message.event('unlink', path);
        })
        .on('add', function(path) {
          message.event('add', path);
        });
    }));
  };

  var watch = function(tasks) {
    gulp.task('watch', gulp.series(tasks, function() {
      message.wait();
      return gulp.watch(watchFolders, gulp.series(tasks, function(done){
          message.wait();
          done();
        }))
        .on('change', function(path) {
          message.event('change', path);
        })
        .on('unlink', function(path) {
          message.event('unlink', path);
        })
        .on('add', function(path) {
          message.event('add', path);
        });
    }));
  };

  var build = function(tasks){
    gulp.task('default', gulp.series(tasks, function(done){
      done();
    }));
  };

  return {
    init: function(){
      init();
      addToPipeline(task.timer.get());
      addToPipeline(task.shell.get());
      addToPipeline(task.css.get());
      addToPipeline(task.js.get());
      addToPipeline(task.vendors.get());
      addToPipeline(task.html.get());
      pipeline.after.reverse();
      var pipelineList = pipeline.before.concat(pipeline.middle.concat(pipeline.after));
      build(pipelineList);
      watch(pipelineList);
      http(pipelineList);
    }
  };
})();

var task = task || {};

task.timer = (function(){
  var moment = require('moment');

  var name = 'timer';
  var startBuildDate;
  var buildIndex = 1;

  var pipeline = {
    before:[],
    middle:[],
    after:[]
  };

  var start = function(){
    var taskName = task.core.action(name, 'start');
    gulp.task(taskName, function(done){
      startBuildDate = Date.now();
      done();
    });
    pipeline.before.push(taskName);
  };

  var stop = function(){
    var taskName = task.core.action(name, 'stop');
    gulp.task(taskName, function(done){
      var stopBuildDate = Date.now();
      var timeSpent = (stopBuildDate - startBuildDate)/1000 + ' secs';
      message.success('The dust was cleaned successfully in ' + timeSpent);
      message.success('Build [ ' + buildIndex + ' ] done at ' + moment().format('HH:mm') + ' and ' + moment().format('ss') + ' seconds.');
      buildIndex += 1;
      done();
    });
    pipeline.after.push(taskName);
  };

  return {
    duration: function(){

    },
    get: function(){
      start();
      stop();
      return pipeline;
    }
  };
})();

var task = task || {};

task.vendors = (function(){

  var name = 'vendors';
  var paths = {};
  var vendorsConfig = {};
  var vendorsFontsBuilt = false;
  var vendorsImagesBuilt = false;

  var pipeline = {
    before:[],
    middle:[],
    after:[]
  };

  var init = function() {
    paths = config.get('paths');
    vendorsConfig = config.if('vendors') ? config.get('vendors') : {};
  };

  var images = function() {
    if (config.if('vendors') && task.core.has(vendorsConfig, 'images')) {
      var taskName = task.core.action(name, 'images');
      gulp.task(taskName, function (done) {
        if (vendorsImagesBuilt) {
          message.notice('Vendors Images already built, if you need to update them, re-run the watcher');
          done();
        } else {
          vendorsImagesBuilt = true;
            message.task('Copying images from vendors');
            for (var i = 0; i < vendorsConfig.images.length; i += 1) {
              message.verbose('Image vendor', vendorsConfig.images[i]);
              task.core.fileCheck(vendorsConfig.images[i]);
            }
            message.verbose('Vendor images copied to', paths.images);
            return gulp.src(vendorsConfig.images)
            .pipe(gulp.dest(paths.images));
        }
      });
      return [taskName];
    } else {
      message.warning('Vendor\'s Images not found, skipping task');
    }
    return [];
  };

  var fonts = function(){
    if (config.if('vendors') && task.core.has(vendorsConfig, 'fonts')) {
      var taskName = task.core.action(name, 'fonts');
      gulp.task(taskName, function (done) {
        if (vendorsFontsBuilt) {
          message.notice('Vendors Fonts already built, if you need to update them, re-run the watcher');
          done();
        } else {
          vendorsFontsBuilt = true;
            message.task('Copying fonts from vendors');
            var i = 0;
            for (i = 0; i < vendorsConfig.fonts.length; i += 1) {
              message.verbose('Font vendor', vendorsConfig.fonts[i]);
              task.core.fileCheck(vendorsConfig.fonts[i]);
            }
            message.verbose('Vendor fonts copied to', paths.fonts);
            return gulp.src(vendorsConfig.fonts)
              .pipe(gulp.dest(paths.fonts));
        }
      });
      return [taskName];
    } else {
      message.warning('Vendor\'s Fonts not found, skipping task');
    }
    return [];
  };

  return {
    get: function(){
      init();
      pipeline.middle = pipeline.middle.concat(fonts());
      pipeline.middle = pipeline.middle.concat(images());
      return pipeline;
    }
  };
})();

var task = task || {};

task.shell = (function(){
  var exec = require('child_process').exec;
  var name = 'shell';
  var taskConfig = [];
  var pipeline = {
    before: [],
    middle:[],
    after: []
  };

  var init = function() {
    taskConfig = config.if('shell') ? config.get('shell') : [];
  };

  var afterMessage = function(){
    if (task.core.has(taskConfig, 'after')) {
      var taskName = task.core.action(name, 'after-message');
      gulp.task(taskName, function(done){
        message.task('Executing shell tasks after build');
        done();
      });
      pipeline.after.push(taskName);
    }
  };

  var afterTask = function(index) {
    var taskName = task.core.action(name, 'after-' + index);
    pipeline.after.push(taskName);
    gulp.task(taskName, function(done){
      exec(taskConfig.after[index], function (err) {
        done(err);
      });
    });
  };

  var after = function(){
    if (task.core.has(taskConfig, 'after')) {
      afterMessage();
      for (var i = 0; i < taskConfig.after.length; i += 1) {
        afterTask(i);
      }
    }
  };

  var beforeMessage = function(){
    if (task.core.has(taskConfig, 'before')) {
      var taskName = task.core.action(name, 'before-message');
      gulp.task(taskName, function(done){
        message.task('Executing shell tasks before build');
        done();
      });
      pipeline.before.push(taskName);
    }
  };

  var beforeTask = function(index) {
    var taskName = task.core.action(name, 'before-' + index);
    pipeline.before.push(taskName);
    gulp.task(taskName, function(done){
      exec(taskConfig.before[index], function (err) {
        done(err);
      });
    });
  };

  var before = function(){
    if (task.core.has(taskConfig, 'before')) {
      beforeMessage();
      for (var i = 0; i < taskConfig.before.length; i += 1) {
        beforeTask(i);
      }
    }
  };

  return {
    get: function(){
      init();
      before();
      after();
      return pipeline.before.length > 1 || pipeline.after.length > 1 ? pipeline : false;
    }
  };
})();

var task = task || {};

task.html = (function(){

  var faker = require('faker');
  var prettify = require('gulp-html-prettify');
  var twig = require('gulp-twig');

  var name = 'html';
  var paths = {};
  var twigConfig = {};
  var twigPages;

  var pipeline = {
    before:[],
    middle:[],
    after:[]
  };

  var init = function() {
    paths = config.get('paths');
    twigPages = config.if('twig') ? config.get('twig') : {};
    twigConfig = config.if('config') ? config.get('config') : {};
    faker.locale = 'en';
  };

  var build = function() {
    if (config.if('twig') && task.core.has(twigPages, 'files')) {
      gulp.task(name, function () {
        message.task('Twig to HTML');
        if (!task.core.has(twigConfig, 'twig')) {
          twigConfig.twig = {};
        }
        twigConfig.twig.data = {
          faker: faker
        };
        for (var i = 0; i < twigPages.files.length; i += 1) {
          message.verbose('Twig view', twigPages.files[i]);
        }
        message.verbose('All Twig files converted in', paths.server);
        return gulp.src(twigPages.files)
          .pipe(twig(twigConfig.twig))
          .pipe(prettify(twigConfig.prettify || {}))
          .pipe(gulp.dest(paths.server));
      });
      return [name];
    } else {
      message.warning('Twig files not set, skipping task');
    }
    return [];
  };

  return {
    get: function(){
      if (!config.hasTask(name)) {
        return pipeline;
      }
      init();
      pipeline.middle = pipeline.middle.concat(build());
      return pipeline;
    }
  };
})();

var task = task || {};

task.css = (function(){
  var autoprefixer = require('gulp-autoprefixer');
  var concat = require('gulp-concat');
  var less = require('gulp-less');
  var merge = require('merge');
  var rename = require('gulp-rename');
  var sass = require('gulp-sass');
  var stylestats = require('gulp-stylestats');
  var sourcemaps = require('gulp-sourcemaps');
  var uglifyCss = require('gulp-uglifycss');

  var name = 'css';
  var paths = {};
  var tasksConfig = {};
  var themeTasks = [];
  var themeBuilds = [];
  var vendorsBuilt = false;
  var vendorsConfig = {};
  var pipeline = {
    before: [],
    middle: [],
    after: []
  };

  var init = function() {
    pipeline.middle.push(name);
    paths = config.get('paths');
    themeTasks = config.if('css') ? config.get('css') : [];
    tasksConfig = config.if('config') ? config.get('config') : {};
    vendorsConfig = config.if('vendors') ? config.get('vendors') : {};
  };

  var fonts = function(theme) {
    if (theme.fonts) {
      var taskName = task.core.action(name, theme.name + '-fonts');
      var target = paths.fonts + theme.name;
      gulp.task(taskName, function () {
        message.verbose('Copy theme fonts to', target);
        return gulp.src(paths.fonts)
          .pipe(gulp.dest(target));
      });
      return [taskName];
    }
    return [];
  };

  var images = function(theme) {
    if (theme.images) {
      var taskName = task.core.action(name, theme.name + '-images');
      var target = paths.images + theme.name;
      gulp.task(taskName, function () {
        message.verbose('Copy theme images to', target);
        return gulp.src(paths.images)
          .pipe(gulp.dest(target));
      });
      return [taskName];
    }
    return [];
  };

  var css = function(theme, index, totalThemes) {
    var taskName = task.core.action(name, theme.name + '-css');
    gulp.task(taskName, function () {
      if (totalThemes >= 1) {
        message.task('Build CSS theme ' + (index + 1) + ' of ' + totalThemes);
      } else {
        message.task('Build CSS theme');
      }
      message.verbose('Theme', theme.name);
      message.verbose('File', theme.path + theme.file);
      return gulp.src(theme.compile)
        .pipe(sourcemaps.init())
        .pipe(
          theme.compile.indexOf('.scss') !== -1 ?
            sass({ outputStyle: 'expanded' }).on('error', sass.logError)
          :
            less()
          )
        .pipe(concat(theme.file))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(theme.path));
    });
    return [taskName];
  };

  var autoprefixerRename = function(file) {
    return file.replace('.css', '.autoprefixer.css');
  };

  var getAutoprefixer = function(theme) {
    if (theme.autoprefixer) {
      var taskName = task.core.action(name, theme.name + '-autoprefixer');
      gulp.task(taskName, function () {
        var fileName = autoprefixerRename(theme.file);
        message.task('Browser compatibility');
        message.verbose('Theme', theme.name);
        if (task.core.has(tasksConfig.autoprefixer, 'browsers')) {
          message.verbose('Autoprefixer browsers', tasksConfig.autoprefixer.browsers.toString().replace(new RegExp(',', 'g'), ', '));
        } else {
          message.verbose('Autoprefixer', 'Enabled');
        }
        message.verbose('Adding prefixes to file', theme.path + theme.file);
        message.verbose('Browser prefixes saved to', theme.path + fileName);
        return gulp.src(theme.path + theme.file)
          .pipe(
            autoprefixer(theme.autoprefixer instanceof Object ?
              theme.autoprefixer
              :
              tasksConfig.autoprefixer
            )
          )
          .pipe(rename(fileName))
          .pipe(gulp.dest(theme.path));
      });
      return [taskName];
    }
    return [];
  };

  var getStylestats = function(theme) {
    if (theme.stylestats) {
      var taskName = task.core.action(name, theme.name + '-stylestats');
      var fileName = autoprefixerRename(theme.file);

      gulp.task(taskName, function () {
        return gulp.src(theme.autoprefixer !== false ?
            theme.path + fileName
            :
            theme.path + theme.file
          )
          .pipe(stylestats({
            type: 'md',
            config: theme.stylestats instanceof Object ? theme.stylestats : tasksConfig.stylestats
          }));
      });
      return [taskName];
    }
    return [];
  };

  var themeBuild = function(theme, themePipeline) {
    var taskName = task.core.action(name, theme.name + '-build');
    gulp.task(taskName, gulp.series(themePipeline, function(done){
      done();
    }));
    return [taskName];
  };

  var add = function(theme, index, totalThemes) {
    var themePipeline = [];
    var defaults = {
      autoprefixer: false,
      compile: null,
      csslint: false,
      file: 'theme-' + index.toString() + '.css',
      fonts: false,
      images: false,
      merge: true,
      name: 'theme-' + index.toString(),
      path: paths.css,
      stylestats: false
    };

    themeTasks.themes[index] = merge.recursive(true, defaults, theme);

    if (!themeTasks.themes[index].path) {
      themeTasks.themes[index].path = paths.css;
    }

    themeTasks.themes[index].path = config.pathClean(themeTasks.themes[index].path);

    if (themeTasks.themes[index].compile === null) {
      message.error(themeTasks.themes[index].name + ' "compile" attribute must be specified');
    }

    theme = themeTasks.themes[index];

    themePipeline = themePipeline.concat(fonts(theme));
    themePipeline = themePipeline.concat(images(theme));
    themePipeline = themePipeline.concat(css(theme, index, totalThemes));
    themePipeline = themePipeline.concat(getAutoprefixer(theme));
    themePipeline = themePipeline.concat(getStylestats(theme));
    themeBuilds = themeBuilds.concat(themeBuild(theme, themePipeline));
  };

  var themes = function() {
    for (var i = 0; i < themeTasks.themes.length; i += 1) {
      add(themeTasks.themes[i], i, themeTasks.themes.length);
    }
    return themeBuilds;
  };

  var vendors = function() {
    if (task.core.has(vendorsConfig, 'css') && task.core.has(vendorsConfig.css, 'files')) {
      var taskName = task.core.action(name, 'vendors');
      gulp.task(taskName, function (done) {
        if (vendorsBuilt) {
          message.annoy('Vendors CSS already built, if you need to update them, re-run the task');
          done();
        } else {
          vendorsBuilt = true;
          message.task('Merging CSS vendors');
          for (var i = 0; i < vendorsConfig.css.files.length; i += 1) {
            message.verbose('CSS vendor', vendorsConfig.css.files[i]);
            task.core.fileCheck(vendorsConfig.css.files[i]);
          }
          message.verbose('Vendor CSS files merged to', paths.css + vendorsConfig.css.file);
          return gulp.src(vendorsConfig.css.files)
          .pipe(uglifyCss())
          .pipe(concat(vendorsConfig.css.file))
          .pipe(gulp.dest(paths.css));
        }
      });
      return [taskName];
    }
    return [];
  };

  var needsMerge = function() {
    var theme;
    for (var i = 0; i < themeTasks.themes.length; i += 1) {
      theme = merge.recursive(true, themeTasks.themes[i], { merge: true });
      if (theme.merge === true) {
        return true;
      }
    }
    return false;
  };

  var getVendorsToMerge = function() {
    if (vendorsConfig.css.merge) {
      message.verbose('CSS vendors to merge', paths.css + vendorsConfig.css.file);
      return [paths.css + vendorsConfig.css.file];
    }
    message.verbose('CSS vendors skipped from merge', paths.css + vendorsConfig.css.file);
    return [];
  };

  var getThemesToMerge = function() {
    var fileName, theme, themes = [];
    for (var i = 0; i < themeTasks.themes.length; i += 1) {
      theme = themeTasks.themes[i];
      fileName = theme.autoprefixer ? autoprefixerRename(theme.file) : theme.file;
      if (theme.merge) {
        message.verbose('CSS theme to merge', theme.path + fileName);
        themes.push(theme.path + fileName);
      } else {
        message.verbose('CSS theme skipped from merge', theme.path + fileName);
      }
    }
    return themes;
  };

  var mergeCss = function() {
    if (needsMerge()) {
      var taskName = task.core.action(name, 'merge');
      gulp.task(taskName, function(done){
        var themes = [];
        message.task('Checking CSS files to merge');

        themes = themes.concat(getVendorsToMerge());
        themes = themes.concat(getThemesToMerge());

        if (themes.length > 0) {
          message.verbose('All CSS files merged to', paths.css + themeTasks.file);
          return gulp.src(themes)
            .pipe(uglifyCss())
            .pipe(concat(themeTasks.file))
            .pipe(gulp.dest(paths.css));
        } else {
          message.warning('No vendors or themes will be merged');
          done();
        }
      });
      return [taskName];
    }
    return [];
  };

  var build = function(subTaskPipeline) {
    gulp.task(name, gulp.series(subTaskPipeline, function(done){
      done();
    }));
    return [name];
  };

  return {
    get: function(){
      if (!config.hasTask(name)) {
        return pipeline;
      }
      init();
      var subTaskPipeline = [];
      subTaskPipeline = subTaskPipeline.concat(themes());
      subTaskPipeline = subTaskPipeline.concat(vendors());
      subTaskPipeline = subTaskPipeline.concat(mergeCss());
      pipeline.middle.concat(build(subTaskPipeline));
      return pipeline;
    }
  };
})();

var task = task || {};

task.js = (function(){

  var concat = require('gulp-concat');
  var sourcemaps = require('gulp-sourcemaps');
  var uglify = require('gulp-uglify');

  var name = 'js';
  var js = {};
  var paths = {};
  var vendorsConfig = {};

  var pipeline = {
    before:[],
    middle:[],
    after:[]
  };

  var init = function() {
    js = config.if(name) ? config.get(name) : [];
    paths = config.get('paths');
    vendorsConfig = config.if('vendors') ? config.get('vendors') : {};
  };

  var build = function(){
    if (config.if(name)) {
      gulp.task(name, function (done) {
        message.task('Merging JavaScript files');
        var notFoundLength = 0;
        for (var i = 0; i < js.files.length; i += 1) {
          if (task.core.fileExists(js.files[i])) {
            message.verbose('JavaScript file', js.files[i]);
          } else {
            notFoundLength += 1;
            message.warning('JavaScript file ' + js.files[i] + ' NOT found');
          }
        }
        if (notFoundLength === js.files.length) {
          message.error('None of the JavaScript files where found, check your "js.files" propery in your configuration file');
          done();
          return;
        }
        message.verbose('JavaScript files merged to', paths.js + js.file);
        return gulp.src(js.files)
          .pipe(sourcemaps.init())
          .pipe(uglify())
          .pipe(concat(js.file))
          .pipe(sourcemaps.write('./'))
          .pipe(gulp.dest(paths.js));
      });
      return [name];
    }
    return [];
  };

  return {
    get: function(){
      if (!config.hasTask(name)) {
        return pipeline;
      }
      init();
      pipeline.middle = pipeline.middle.concat(build());
      return pipeline;
    }
  };
})();


message.intro();
config.load();
message.verbose('Config loaded', config.file());
tasks.init();
