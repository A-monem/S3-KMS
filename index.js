/* eslint-disable no-console */
const Promise = require('bluebird');
const AWS = require('aws-sdk');
const fs = require('fs');
const os = require('os');

Promise.promisifyAll(fs);

// access keys
const ACCESS_KEY_ID = 'AKIAUQDEMWIOUUFKCEUH';
const SECRET_ACCESS_KEY = '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';

// bucket name
const bucketName = 'conformity-anafea';
const localDirectory = 'data';
const downloadedFileName = 'data/downloadedFiles.txt';

const options = {
  accessKeyId: ACCESS_KEY_ID,
  secretAccessKey: SECRET_ACCESS_KEY,
  region: 'ap-southeast-2',
};

const s3 = new AWS.S3(options);
const kms = new AWS.KMS(options);

function clearDataDirectory() {
  fs.rmdirSync(localDirectory, { recursive: true });
  fs.mkdirSync(localDirectory);
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
    console.log(`File ${i + 1} downloading started`);

    const params = {
      Bucket: bucketName,
      Key: file.Key,
    };

    s3.getObject(params, (err, data) => {
      if (err) {
        console.log(err, err.stack);
      } else {
        fs.writeFileAsync(`${localDirectory}/${file.Key}`, data.Body)
          .then(() => {
            console.log(`File ${i + 1} downloading finished`);

            const appendFileNamePromise = new Promise((resolveAppend) => (
              fs.appendFileAsync(downloadedFileName, `${file.Key.match(/\w*.\w{3}$/i)[0]}${os.EOL}`, 'utf8')
                .then(() => resolveAppend())
            ));

            resolve(appendFileNamePromise);
          })
          .catch((error) => console.log(error, error.stack));
      }
    });
  });
}

//

// function decryptFile(file) {
//   const params = {
//     KeyId: 'alias/conformity',
//     CiphertextBlob: Buffer.from(file, 'base64'),
//   };

//   kms.decrypt(params, (err, data) => {
//     if (err) {
//       throw err;
//     } else {
//       console.log(data.Plaintext.toString('utf-8'));
//     }
//   });
// }

function encryptFile(file) {
  const params = {
    KeyId: 'alias/conformity',
    Plaintext: Buffer.from(fs.readFileSync(file)),
  };

  kms.encrypt(params, (err, data) => {
    if (err) {
      console.log(err, err.stack);
    } else {
      const { CiphertextBlob } = data;

      fs.truncateSync(downloadedFileName, 0);
      fs.writeFile(downloadedFileName, CiphertextBlob.toString('base64'), () => {
        console.log('downloadedFiles.txt has been successfully encrypted');
      });
    }
  });
}

s3.listObjects({ Bucket: bucketName }, (err, data) => {
  if (err) {
    console.log(err, err.stack);
  } else {
    const { directories, files } = sortBucketObjects(data.Contents);

    clearDataDirectory();
    createDirectory(directories);

    Promise.map(files, (file, i) => downloadFile(file, i), { concurrency: 4 })
      .then((fileNames) => {
        Promise.all(fileNames);
      })
      .then(() => {
        console.log('*************************************************');
        console.log('downloadedFiles.txt has been successfully created');
        encryptFile(downloadedFileName);
      })
      .catch((error) => console.log(error, error.stack));
  }
});
