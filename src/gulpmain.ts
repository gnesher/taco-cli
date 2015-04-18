﻿/// <reference path="typings/node.d.ts" />
/// <reference path="typings/Q.d.ts" />
/// <reference path="typings/gulp.d.ts" />
/// <reference path="typings/gulp-extensions.d.ts" />
/// <reference path="typings/del.d.ts" />
/// <reference path="typings/archiver.d.ts" />
var runSequence = require("run-sequence");
import gulp = require ("gulp");
import path = require ("path");
import Q = require ("q");
import stylecopUtil = require ("../tools/stylecop-util");
import tsUtil = require ("./taco-cli/compile/typescript-util");
import gulpUtil = require("../tools/gulp-tasks-util");

var buildConfig = require("../../src/build_config.json");

var tacoModules = ["taco-utils", "taco-cli", "remotebuild", "taco-remote", "taco-remote-lib"];

/* Default task for building /src folder into /bin */
gulp.task("default", ["install-build"]);

/* Compiles the typescript files in the project, for fast iterative use */
gulp.task("compile", function (callback: Function): void {
    var tsCompiler = new tsUtil.TypeScriptServices();
    tsCompiler.compileDirectory(buildConfig.src, buildConfig.buildSrc, /*sourceMap*/ true, callback);
});

/* compile + copy */
gulp.task("build", function (callback: Function): void {
    runSequence("compile", "copy", callback);
});

/* full clean build */
gulp.task("rebuild", function (callback: Function): void {
    runSequence("clean", "build", callback);
});

/* Task to install the compiled modules */
gulp.task("install-build", ["build", "prepare-templates"], function (): Q.Promise<any> {
    return gulpUtil.installModules(tacoModules, buildConfig.buildSrc);
});

/* Runs style cop on the sources. */
gulp.task("run-stylecop", function (callback: Function): void {
    var styleCop = new stylecopUtil.StyleCopUtil();
    styleCop.runCop(buildConfig.src, buildConfig.copPath, buildConfig.copConfig, callback);
}); 

/* Cleans up the build location, will have to call "gulp prep" again */
gulp.task("clean", function (callback: (err: Error) => void): void {
    gulpUtil.deleteDirectoryRecursive(path.resolve(buildConfig.build), callback);
});

/* Cleans up only the templates in the build folder */
gulp.task("clean-templates", function (callback: (err: Error) => void): void {
    gulpUtil.deleteDirectoryRecursive(path.resolve(buildConfig.buildTemplates), callback);
});

/* copy package.json and resources.json files from source to bin */
gulp.task("copy", function (): Q.Promise<any> {

    return gulpUtil.copyFiles(
        [
            "build_config.json",
            "/**/package.json",
            "/**/resources.json",
            "/**/test/**",
            "/**/commands.json",
            "/**/bin/**",
            "/**/templates/**",
            "/**/examples/**",
            "/**/*.ps1"
        ],
        buildConfig.src, buildConfig.buildSrc);
});

/* Task to run tests */
gulp.task("run-tests", ["install-build"], function (): Q.Promise<any> {
    return gulpUtil.runAllTests(tacoModules, buildConfig.buildSrc);
});

/* Task to archive template folders */
gulp.task("prepare-templates", ["clean-templates"], function (): Q.Promise<any> {
    return gulpUtil.prepareTemplates(buildConfig.templates, buildConfig.buildTemplates);
});

module.exports = gulp;
