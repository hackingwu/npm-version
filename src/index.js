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
new Promise((resolve, reject) => {
  fs.readFile(packageJsonPath, (err, data) => {
    if (err) reject(err);
    else resolve(data);
  })
}).then((data) => {
  const packageJson = JSON.parse(data);
  Object.keys(packageJson.dependencies).forEach(key => {
    packageVersion[key] = {
      expect: packageJson.dependencies[key]
    }
  });
  Object.keys(packageJson.devDependencies).forEach(key => {
    packageVersion[key] = {
      expect: packageJson.devDependencies[key]
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
          fs.readFile(path.join(nodeModulePath, file, 'package.json'), (err, data) => {
            if (err) console.err("error occured when reading"+file+"\'s package.json");
            else packageVersion[file].current = JSON.parse(data).version
          }));
      }
    })

    const nameTitleLength = 'name'.length;
    const exceptVersionTitleLength = 'except-version'.length;
    const currentVersionTitleLength = 'current-version'.length;
    let maxNameLength = nameTitleLength;
    let maxExceptVersionLength = exceptVersionTitleLength;
    let maxCurrentVersionLength = currentVersionTitleLength;
    console.log('!!!!!!!!!!!', promises)

    Promise.all(promises).then(()=>{
      console.log(packageVersion)
      Object.keys(packageVersion).forEach(key => {
        const keyLenth = key.length;
        const expectVersionLength = packageVersion[key].expect.length
        const currentVersionLenght = packageVersion[key].current.length
        if (keyLength > maxNameLength) maxNameLength = keyLength
        if (pexpectVersionLength > maxExceptVersionLength) maxExceptVersionLength = expectVersionLength
        if (currentVersionLenght > maxCurrentVersionLength) maxCurrentVersionLength = currentVersionLenght
      });
      console.log('!!!!!!!!!!!!!')
      const seperatorLength = maxNameLength + maxExceptVersionLength + maxCurrentVersionLength;
      const seperator = '-'.repeat(seperatorLength);
      console.log(program);
      if (program.list) {
        console.log(seperator);
        console.log('name', ' '.repeat(maxNameLength - nameTitleLength),
                    'except-version', ' '.repeat(maxExceptVersionLength - exceptVersionTitleLength),
                    'current-version', ' '.repeat(maxCurrentVersionLength - currentVersionTitleLength));
        Object.keys(packageVersion).forEach(key => {
          const exceptVersion = packageVersion[key].except;
          const currentVersion = packageVersion[key].current;
          console.log(key, ' '.repeat(maxNameLength - key.length),
                      exceptVersion, ' '.repeat(maxExceptVersionLength - exceptVersion.length),
                      currentVersion, ' '.repeat(maxCurrentVersionLength - currentVersion.length));
          console.log(seperator);
        })
      }
    })
  })
})
