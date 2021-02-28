/* eslint-disable no-undef */
const fs = require('fs');
const { assert } = require('chai');
const { it } = require('mocha');

const {
  localDirectory,
  downloadedFileName,
  clearDataDirectory,
  createDirectory,
} = require('../index');

describe('Strings', () => {
  it('local directory is data', () => {
    assert.equal(localDirectory, 'data');
  });

  it('downloadedFileName is data/downloadedFiles.txt', () => {
    assert.equal(downloadedFileName, 'data/downloadedFiles.txt');
  });
});

describe('Directory manipulation', () => {
  it('creates data/folder directory', () => {
    const directories = [{ Key: 'test/folder1/' }, { Key: 'test/folder2/' }];

    fs.mkdirSync('data/test/');
    createDirectory(directories);
    fs.readdir('data/test/', (err, files) => {
      assert.deepEqual(files, ['folder1', 'folder2']);
    });
  });

  it('clears data directory', () => {
    clearDataDirectory();
    fs.readdir('data', (err, files) => {
      assert.isEmpty(files);
    });
  });
});
