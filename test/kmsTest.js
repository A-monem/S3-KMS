/* eslint-disable no-undef */
const AWSMock = require('aws-sdk-mock');
const { it } = require('mocha');
const { assert } = require('chai');
const fs = require('fs');
const AWS = require('aws-sdk');
const { encryptData } = require('../packages/kms');
const { options } = require('../packages/config');

describe('KMS api', () => {
  before(() => {
    fs.openSync('test/encrypt.txt', 'w');
  });
  after(() => {
    fs.unlinkSync('test/encrypt.txt');
  });
  afterEach(() => {
    AWSMock.restore();
  });

  it('encrypt data runs correctly', async () => {
    AWSMock.mock('KMS', 'encrypt', { CiphertextBlob: Buffer.from('hi\n') });

    const data = await encryptData('test/encrypt.txt');

    assert.deepEqual(data, Buffer.from('hi\n'));
  });

  it('kms.encrypt receives bad response', async () => {
    AWSMock.mock('KMS', 'encrypt', { Nothing: Buffer.from('hi\n') });
    await encryptData('test/encrypt.txt').catch((error) => {
      assert.equal(error, 'Error: No data received');
    });
  });

  it('kms.encrypt receives empty response', async () => {
    AWSMock.mock('KMS', 'encrypt');

    await encryptData('test/encrypt.txt').catch((error) => {
      assert.equal(error, "TypeError: Cannot read property 'CiphertextBlob' of undefined");
    });
  });
});

describe('KMS encryption-decryption', () => {
  before(() => {
    fs.openSync('test/encrypt_1.txt', 'w');
    fs.writeFileAsync('test/encrypt_1.txt', 'hi\n');
  });
  after(() => {
    fs.unlinkSync('test/encrypt_1.txt');
  });

  it('encrypt-decrypt data', async () => {
    const data = await encryptData('test/encrypt_1.txt');

    const kms = new AWS.KMS(options);
    const params = {
      KeyId: 'alias/conformity',
      CiphertextBlob: data,
    };

    kms.decrypt(params, (err, decryptedData) => {
      if (err) {
        throw err;
      } else {
        assert.equal(decryptedData.Plaintext.toString('utf-8'), 'hi\n');
      }
    });
  });
});
