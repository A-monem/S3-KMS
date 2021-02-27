const Promise = require('bluebird');
const AWS = require('aws-sdk');
const fs = require('fs');

Promise.promisifyAll(fs);

// access keys
const ACCESS_KEY_ID = 'AKIAUQDEMWIOUUFKCEUH';
const SECRET_ACCESS_KEY = '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';

// bucket name
const bucketName = 'conformity-anafea';
const localDirectory = 'data';

const options = {
  accessKeyId: ACCESS_KEY_ID,
  secretAccessKey: SECRET_ACCESS_KEY,
};

const s3 = new AWS.S3(options);

function clearDataDirectory() {
  fs.rmdirSync('data', { recursive: true });
  fs.mkdirSync('data');
}

function createDirectory(directories) {
  directories.forEach((directory) => {
    fs.mkdirSync(`${localDirectory}/${directory.Key}`);
  });
}

function sortBucketObjects(data) {
  return {
    directories: data.filter((element) => element.Key.endsWith('/')),
    files: data.filter((element) => !element.Key.endsWith('/')),
  };
}

function downloadFile(file, i) {
  return new Promise((resolve) => {
    console.log(`File ${i + 1} downloading ...`);

    const params = {
      Bucket: bucketName,
      Key: file.Key,
    };

    s3.getObject(params, (err, data) => {
      if (err) {
        console.log(err, err.stack);
      } else {
        fs.writeFileAsync(`${localDirectory}/${file.Key}`, data.Body).then(() => {
          console.log(`File ${i + 1} done`);
          resolve();
        });
      }
    });
  });
}

s3.listObjects({ Bucket: bucketName }, (err, data) => {
  if (err) {
    console.log(err, err.stack);
  } else {
    const { directories, files } = sortBucketObjects(data.Contents);

    clearDataDirectory();
    createDirectory(directories);

    Promise.map(files, (file, i) => downloadFile(file, i), { concurrency: 4 });
  }
});
