const AWS = require('aws-sdk');
const fs = require('fs');
const { options } = require('./config');

const encryptData = (file) => {
  const kms = new AWS.KMS(options);
  const params = {
    KeyId: 'alias/conformity',
    Plaintext: Buffer.from(fs.readFileSync(file)),
  };
  const encryptedData = new Promise((resolve, reject) => {
    kms.encrypt(params, (err, data) => {
      if (err) {
        reject(err);
      } else if (!data.CiphertextBlob) {
        reject(new Error('No data received'));
      } else {
        const { CiphertextBlob } = data;

        resolve(CiphertextBlob);
      }
    });
  });

  return encryptedData;
};

module.exports = {
  encryptData,
};
