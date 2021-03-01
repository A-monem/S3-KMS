/* eslint-disable no-console */
const Promise = require('bluebird');
const fs = require('fs');
const os = require('os');
const { getStructure, getFile } = require('./packages/s3');
const { encryptData } = require('./packages/kms');

Promise.promisifyAll(fs);

// constants
const localDirectory = 'data';
const downloadedFileName = 'data/downloadedFiles.txt';

// clear data directory
const clearDataDirectory = () => {
  fs.rmdirSync(localDirectory, { recursive: true });
  fs.mkdirSync(localDirectory);
};

// create s3 bucket folder structure
const createDirectory = (directories) => {
  directories.forEach((directory) => {
    fs.mkdirSync(`${localDirectory}/${directory.Key}`);
  });
};

// encrypt downloadFiles.txt using KMS
const encryptFile = (file) => {
  encryptData(file)
    .then((CiphertextBlob) => {
      fs.truncateSync(downloadedFileName, 0);
      fs.writeFile(downloadedFileName, CiphertextBlob.toString('base64'), () => {
        console.log('downloadedFiles.txt has been successfully encrypted');
      });
    })
    .catch((error) => console.error(error));
};

// download single file from s3 bucket
const downloadFile = (file, i) => new Promise((resolve) => {
  console.log(`File ${i + 1} downloading started`);

  getFile(file)
    .then((data) => fs.writeFileAsync(`${localDirectory}/${file.Key}`, data.Body))
    .then(() => {
      console.log(`File ${i + 1} downloading finished`);

      const appendFileNamePromise = new Promise((resolveAppend) => (
        fs.appendFileAsync(downloadedFileName, `${file.Key.match(/\w*.\w{3}$/i)[0]}${os.EOL}`, 'utf8')
          .then(() => resolveAppend())
      ));

      resolve(appendFileNamePromise);
    })
    .catch((error) => console.error(error));
});

// initiate downloads
const downloadConcurrentFiles = (files) => {
  Promise.map(files, (file, i) => downloadFile(file, i), { concurrency: 4 })
    .then((fileNames) => {
      Promise.all(fileNames);
    })
    .then(() => {
      console.log('*************************************************');
      console.log('downloadedFiles.txt has been successfully created');
      encryptFile(downloadedFileName);
    })
    .catch((error) => console.error(new Error(error)));
};

// list objects in s3 bucket and start downloading
const downloadS3Bucket = () => {
  getStructure()
    .then((data) => {
      const { directories, files } = data;

      clearDataDirectory();
      createDirectory(directories);
      downloadConcurrentFiles(files);
    })
    .catch((error) => console.error(error));
};

downloadS3Bucket();

module.exports = {
  localDirectory,
  downloadedFileName,
  clearDataDirectory,
  createDirectory,
  downloadFile,
  encryptFile,
  downloadConcurrentFiles,
};
