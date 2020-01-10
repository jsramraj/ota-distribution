'use strict';

var async = require('async');
var plist = require('simple-plist');
var decompress = require('decompress-zip');
// var provisioning = require('@stendahls/provision-parse');
// var entitlements = require('entitlements');

var rimraf = require('rimraf');
var tmp = require('temporary');
var glob = require("glob");
var Path = require('path');

module.exports = function (file, callback) {
    var data = {};
    var output = new tmp.Dir();

    var unzipper = new decompress(file);
    unzipper.extract({
        path: output.path
    });

    unzipper.on('error', cleanUp);
    unzipper.on('extract', function (log) {
        console.log('extraced ');

        var path = glob.sync(output.path + '/Payload/*/')[0];
        async.parallel([
            function (asyncCallback) {
                plist.readFile(Path.join(path, 'Info.plist'), function (plistReadError, plistData) {
                    if (plistReadError) {
                        return asyncCallback(plistReadError);
                    }
                    data.metadata = plistData;

                    return asyncCallback();
                });
            }
        ], function (error) {
            return cleanUp(error);
        });
    });

    function cleanUp(error) {
        rimraf.sync(output.path);
        return callback(error, data);
    }
};