const { UploadcareClient } = require('@uploadcare/rest-client');

const uploadcare = new UploadcareClient({
    publicKey: '7a205f34fa9762f1dbb0',
    secretKey: 'ab8f936f3c659f61604e',
});

module.exports = uploadcare;