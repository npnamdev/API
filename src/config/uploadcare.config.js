const { UploadClient } = require('@uploadcare/upload-client');

const uploadcare = new UploadClient({
    publicKey: '7a205f34fa9762f1dbb0',
    secretKey: 'ab8f936f3c659f61604e',
})

module.exports = uploadcare;