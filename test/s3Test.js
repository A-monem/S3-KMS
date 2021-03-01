/* eslint-disable no-undef */
const AWSMock = require('aws-sdk-mock');
const { it } = require('mocha');
const { assert } = require('chai');
const {
  getFile, getStructure, sortBucketObjects, bucketName,
} = require('../packages/s3');

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

describe('S3 api', () => {
  afterEach(() => {
    AWSMock.restore();
  });

  it('get structure runs correctly', async () => {
    AWSMock.mock('S3', 'listObjects', { Contents: [{ Key: 'folder1/' }, { Key: 'folder1/text1.txt' }] });

    const data = await getStructure();

    assert.deepEqual(data, { directories: [{ Key: 'folder1/' }], files: [{ Key: 'folder1/text1.txt' }] });
  });

  it('s3.listObjects receives bad response', async () => {
    AWSMock.mock('S3', 'listObjects', { nothing: [{ Key: 'folder1/' }, { Key: 'folder1/text1.txt' }] });

    await getStructure().catch((error) => {
      assert.equal(error, 'Error: No data received');
    });
  });

  it('s3.listObjects receives empty response', async () => {
    AWSMock.mock('S3', 'listObjects');

    await getStructure().catch((error) => {
      assert.equal(error, "TypeError: Cannot read property 'Contents' of undefined");
    });
  });

  it('get object runs correctly', async () => {
    AWSMock.mock('S3', 'getObject', { Body: Buffer.from('Test file!\n') });

    const data = await getFile({ Key: 'mockFolder1/mockFile1.txt' });

    assert.deepEqual(data, Buffer.from('Test file!\n'));
  });

  it('s3.listObjects receives bad response', async () => {
    AWSMock.mock('S3', 'getObject', { Nothing: Buffer.from('Test file!\n') });

    await getFile({ Key: 'mockFolder1/mockFile1.txt' }).catch((error) => {
      assert.equal(error, 'Error: No data received');
    });
  });

  it('s3.listObjects receives empty response', async () => {
    AWSMock.mock('S3', 'getObject');

    await getFile({ Key: 'mockFolder1/mockFile1.txt' }).catch((error) => {
      assert.equal(error, "TypeError: Cannot read property 'Body' of undefined");
    });
  });
});
