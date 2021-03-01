// These keys are S3 read only and KMS non adminetrative
const ACCESS_KEY_ID = 'AKIAUQDEMWIOUUFKCEUH';
const SECRET_ACCESS_KEY = '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';

module.exports = {
  options: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
    region: 'ap-southeast-2',
  },
};
