const AWS = require('aws-sdk');
const { options } = require('./config');
// bucket name
const bucketName = 'conformity-anafea';

// sort data returned from listing S3 object into folders and files
const sortBucketObjects = (data) => ({
  directories: data.filter((element) => element.Key.endsWith('/')),
  files: data.filter((element) => !element.Key.endsWith('/')),
});

const getStructure = () => {
  const s3 = new AWS.S3(options);
  const params = {
    Bucket: bucketName,
  };
  const sortedData = new Promise((resolve, reject) => {
    s3.listObjects(params, (err, data) => {
      if (err) {
        reject(err);
      } else if (!data.Contents) {
        reject(err);
      } else {
        resolve(sortBucketObjects(data.Contents));
      }
    });
  });

  return sortedData;
};
const getFile = (file) => {
  const s3 = new AWS.S3(options);
  const params = {
    Bucket: bucketName,
    Key: file.Key,
  };
  const fileData = new Promise((resolve, reject) => {
    s3.getObject(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.Body);
      }
    });
  });

  return fileData;
};

module.exports = {
  getStructure,
  getFile,
  sortBucketObjects,
  bucketName,
};
