// Mock for isomorphic-dompurify (ESM module incompatible with Jest CJS)
module.exports = {
    sanitize: (html) => html,
    default: { sanitize: (html) => html }
};
