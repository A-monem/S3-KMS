/* eslint-disable no-undef */
const AWSMock = require('aws-sdk-mock');
const { it } = require('mocha');
const { assert } = require('chai');
const { encryptData } = require('../packages/kms');

AWSMock.mock('KMS', 'encrypt', { CiphertextBlob: Buffer.from('hi\n') });

describe('KMS api', () => {
  it('encrypt data correctly', async () => {
    const data = await encryptData('test/encrypt.txt');

    assert.deepEqual(data, Buffer.from('hi\n'));
  });
});
