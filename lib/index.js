'use strict';

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_commander2.default.version('0.0.1').option('-d, --diff', 'list the different version package').option('-l, --list', 'list all package').option('-f, --fix', 'fix package version').parse(process.argv);

var packageJsonPath = _path2.default.join(process.cwd(), 'package.json');
var nodeModulePath = _path2.default.join(process.cwd(), 'node_modules');
var packageVersion = {};
new Promise(function (resolve, reject) {
  _fs2.default.readFile(packageJsonPath, function (err, data) {
    if (err) reject(err);else resolve(data);
  });
}).then(function (data) {
  var packageJson = JSON.parse(data);
  Object.keys(packageJson.dependencies).forEach(function (key) {
    packageVersion[key] = {
      expect: packageJson.dependencies[key]
    };
  });
  Object.keys(packageJson.devDependencies).forEach(function (key) {
    packageVersion[key] = {
      expect: packageJson.devDependencies[key]
    };
  });
}, function (err) {
  console.log('error occured when reading the package.json');
  console.log(err);
}).then(function () {
  new Promise(function (resolve, reject) {
    _fs2.default.readdir(nodeModulePath, function (err, files) {
      if (err) reject(err);else resolve(files);
    });
  }).then(function (files) {

    var promises = [];
    files.forEach(function (file) {
      if (packageVersion[file]) {
        promises.push(_fs2.default.readFile(_path2.default.join(nodeModulePath, file, 'package.json'), function (err, data) {
          if (err) console.err("error occured when reading" + file + "\'s package.json");else packageVersion[file].current = JSON.parse(data).version;
        }));
      }
    });

    var nameTitleLength = 'name'.length;
    var exceptVersionTitleLength = 'except-version'.length;
    var currentVersionTitleLength = 'current-version'.length;
    var maxNameLength = nameTitleLength;
    var maxExceptVersionLength = exceptVersionTitleLength;
    var maxCurrentVersionLength = currentVersionTitleLength;
    console.log('!!!!!!!!!!!', promises);

    Promise.all(promises).then(function () {
      console.log(packageVersion);
      Object.keys(packageVersion).forEach(function (key) {
        var keyLenth = key.length;
        var expectVersionLength = packageVersion[key].expect.length;
        var currentVersionLenght = packageVersion[key].current.length;
        if (keyLength > maxNameLength) maxNameLength = keyLength;
        if (pexpectVersionLength > maxExceptVersionLength) maxExceptVersionLength = expectVersionLength;
        if (currentVersionLenght > maxCurrentVersionLength) maxCurrentVersionLength = currentVersionLenght;
      });
      console.log('!!!!!!!!!!!!!');
      var seperatorLength = maxNameLength + maxExceptVersionLength + maxCurrentVersionLength;
      var seperator = '-'.repeat(seperatorLength);
      console.log(_commander2.default);
      if (_commander2.default.list) {
        console.log(seperator);
        console.log('name', ' '.repeat(maxNameLength - nameTitleLength), 'except-version', ' '.repeat(maxExceptVersionLength - exceptVersionTitleLength), 'current-version', ' '.repeat(maxCurrentVersionLength - currentVersionTitleLength));
        Object.keys(packageVersion).forEach(function (key) {
          var exceptVersion = packageVersion[key].except;
          var currentVersion = packageVersion[key].current;
          console.log(key, ' '.repeat(maxNameLength - key.length), exceptVersion, ' '.repeat(maxExceptVersionLength - exceptVersion.length), currentVersion, ' '.repeat(maxCurrentVersionLength - currentVersion.length));
          console.log(seperator);
        });
      }
    });
  });
});