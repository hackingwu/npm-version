'use strict';
import program from 'commander'
import fs from 'fs'
import path from 'path'

program
  .version('0.0.1')
  .option('-d, --diff', 'list the different version package')
  .option('-l, --list', 'list all package')
  .option('-f, --fix', 'fix package version')
  .parse(process.argv);
const packageJsonPath = path.join(process.cwd(), 'package.json');
const nodeModulePath = path.join(process.cwd(), 'node_modules');
const packageVersion = {}
const packageDiff = (thePackegeVersion) => {
  const diffKeys = []
  Object.keys(thePackegeVersion).forEach(key => {
    let versions = key.substring(1).split('.')
    const currentVersion = key.split('.')
    if (key.startsWith('~')) { // match 1.2.x
      if (versions.length > 2 && currentVersion.length > 2 && versions[2] > currentVersion[2]) {
        diffKeys.push(key)
      }
    } else if (key.startsWith('^')) { // match 1.x.x
      if (versions.length > 1 && currentVersion.length > 1 && versions[1] > currentVersion[1]
        || (versions.length > 2 && current.length > 2 && versions[2] >)) {
        diffKeys.push(key)
      }
    } else {
      versions = key.split('.')
    }
  })
}
new Promise((resolve, reject) => {
  fs.readFile(packageJsonPath, (err, data) => {
    if (err) reject(err);
    else resolve(data);
  })
}).then((data) => {
  const packageJson = JSON.parse(data);
  Object.keys(packageJson.dependencies).forEach(key => {
    packageVersion[key] = {
      expect: packageJson.dependencies[key],
      current: ' '
    }
  });
  Object.keys(packageJson.devDependencies).forEach(key => {
    packageVersion[key] = {
      expect: packageJson.devDependencies[key],
      current: ' '
    }
  });
}, (err) => {
  console.log('error occured when reading the package.json');
  console.log(err);
}).then(() => {
  new Promise((resolve, reject) => {
    fs.readdir(nodeModulePath, (err, files) => {
      if (err) reject(err);
      else resolve(files);
    })
  }).then(files => {

    const promises = []
    files.forEach(file => {
      if (packageVersion[file]) {
        promises.push(
          new Promise((resolve, reject) => {
            fs.readFile(path.join(nodeModulePath, file, 'package.json'), (err, data) => {
              if (err) console.err("error occured when reading"+file+"\'s package.json");
              else resolve(JSON.parse(data).version)
            });
          }).then((version) =>{
            packageVersion[file].current = version
          })
        )
      }
    })

    const nameTitleLength = 'name'.length;
    const expectVersionTitleLength = 'expect-version'.length;
    const currentVersionTitleLength = 'current-version'.length;
    let maxNameLength = nameTitleLength;
    let maxExpectVersionLength = expectVersionTitleLength;
    let maxCurrentVersionLength = currentVersionTitleLength;
    
    Promise.all(promises).then(()=>{

      Object.keys(packageVersion).forEach(key => {
        const keyLength = key.length;
        const expectVersionLength = packageVersion[key].expect.length
        const currentVersionLenght = packageVersion[key].current.length
        if (keyLength > maxNameLength) maxNameLength = keyLength
        if (expectVersionLength > maxExpectVersionLength) maxExpectVersionLength = expectVersionLength
        if (currentVersionLenght > maxCurrentVersionLength) maxCurrentVersionLength = currentVersionLenght
      });

      const seperatorLength = maxNameLength + maxExpectVersionLength + maxCurrentVersionLength;
      const seperator = '-'.repeat(seperatorLength);
      console.log('name', ' '.repeat(maxNameLength - nameTitleLength),
                  'expect-version', ' '.repeat(maxExpectVersionLength - expectVersionTitleLength),
                  'current-version', ' '.repeat(maxCurrentVersionLength - currentVersionTitleLength));
      console.log(seperator);
      if (program.list) {
        Object.keys(packageVersion).forEach(key => {
          const expectVersion = packageVersion[key].expect;
          const currentVersion = packageVersion[key].current;
          console.log(key, ' '.repeat(maxNameLength - key.length),
                      expectVersion, ' '.repeat(maxExpectVersionLength - expectVersion.length),
                      currentVersion, ' '.repeat(maxCurrentVersionLength - currentVersion.length));
          console.log(seperator);
        })
      } else if (program.diff) {
        Object.keys(packageVersion).forEach(key => {
          if (key.startsWith('~')) {

          } else if(key.startsWith('^')) {

          } else {

          }
        })
      } else if (program.fix) {

      }
    })
  })
})

