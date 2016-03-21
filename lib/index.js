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
        promises.push(new Promise(function (resolve, reject) {
          _fs2.default.readFile(_path2.default.join(nodeModulePath, file, 'package.json'), function (err, data) {
            if (err) {
              console.err("error occured when reading" + file + "\'s package.json");
              resolve.log(" (haven't be installed!)");
            } else resolve(JSON.parse(data).version);
          });
        }).then(function (version) {
          packageVersion[file].current = version;
        }));
      }
    });

    var nameTitleLength = 'name'.length;
    var expectVersionTitleLength = 'expect-version'.length;
    var currentVersionTitleLength = 'current-version'.length;
    var maxNameLength = nameTitleLength;
    var maxExpectVersionLength = expectVersionTitleLength;
    var maxCurrentVersionLength = currentVersionTitleLength;

    Promise.all(promises).then(function () {

      Object.keys(packageVersion).forEach(function (key) {
        var keyLength = key.length;
        var expectVersionLength = packageVersion[key].expect.length;
        var currentVersionLenght = packageVersion[key].current.length;
        if (keyLength > maxNameLength) maxNameLength = keyLength;
        if (expectVersionLength > maxExpectVersionLength) maxExpectVersionLength = expectVersionLength;
        if (currentVersionLenght > maxCurrentVersionLength) maxCurrentVersionLength = currentVersionLenght;
      });

      var seperatorLength = maxNameLength + maxExpectVersionLength + maxCurrentVersionLength;
      var seperator = '-'.repeat(seperatorLength);
      console.log('name', ' '.repeat(maxNameLength - nameTitleLength), 'expect-version', ' '.repeat(maxExpectVersionLength - expectVersionTitleLength), 'current-version', ' '.repeat(maxCurrentVersionLength - currentVersionTitleLength));
      console.log(seperator);
      if (_commander2.default.list) {
        Object.keys(packageVersion).forEach(function (key) {
          var expectVersion = packageVersion[key].expect;
          var currentVersion = packageVersion[key].current;
          console.log(key, ' '.repeat(maxNameLength - key.length), expectVersion, ' '.repeat(maxExpectVersionLength - expectVersion.length), currentVersion, ' '.repeat(maxCurrentVersionLength - currentVersion.length));
          console.log(seperator);
        });
      }
    });
  });
});