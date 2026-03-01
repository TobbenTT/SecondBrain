// Mock for otplib (ESM dependencies incompatible with Jest CJS)
module.exports = {
    generateSecret: () => 'MOCKSECRETBASE32',
    generateURI: ({ secret, label, issuer }) => `otpauth://totp/${issuer}:${label}?secret=${secret}&issuer=${issuer}`,
    verify: ({ token, secret }) => token === '123456',
};
