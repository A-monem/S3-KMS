/* eslint-disable no-undef */
const AWSMock = require('aws-sdk-mock');
const { it } = require('mocha');
const { assert } = require('chai');
const {
  getFile, getStructure, sortBucketObjects, bucketName,
} = require('../packages/s3');

AWSMock.mock('S3', 'listObjects', { Contents: [{ Key: 'mockFolder1/' }, { Key: 'mockFolder1/mockFile1.txt' }] });
AWSMock.mock('S3', 'getObject', { Body: Buffer.from('Test file!\n') });

describe('S3 api', () => {
  after(() => {
    AWSMock.restore();
  });

  it('get structure correctly', async () => {
    const data = await getStructure();

    assert.deepEqual(data, { directories: [{ Key: 'mockFolder1/' }], files: [{ Key: 'mockFolder1/mockFile1.txt' }] });
  });

  it('get object', async () => {
    const data = await getFile({ Key: 'mockFolder1/mockFile1.txt' });

    assert.deepEqual(data, Buffer.from('Test file!\n'));
  });
});

describe('Data manipulation', () => {
  it('sort data into folders and files', () => {
    const data = [{ Key: 'test/folder1/' }, { Key: 'test/folder1/text1.txt' },
      { Key: 'test/folder2/' }, { Key: 'test/folder2/text2.txt' }];

    const { directories, files } = sortBucketObjects(data);

    assert.deepEqual(directories, [{ Key: 'test/folder1/' }, { Key: 'test/folder2/' }]);
    assert.deepEqual(files, [{ Key: 'test/folder1/text1.txt' }, { Key: 'test/folder2/text2.txt' }]);
  });
});

describe('Bucket name', () => {
  it('bucket name is conformity-anafea', () => {
    assert.equal(bucketName, 'conformity-anafea');
  });
});
