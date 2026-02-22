const path = require('path');
const fs = require('fs');

function safePath(baseDir, userInput) {
    const resolved = path.resolve(baseDir, userInput);
    if (!resolved.startsWith(path.resolve(baseDir))) return null;
    return resolved;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function getFilesRecursively(dir, fileList = [], baseDir = null) {
    if (!baseDir) baseDir = dir;
    if (!fs.existsSync(dir)) return [];

    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            getFilesRecursively(filePath, fileList, baseDir);
        } else {
            if (path.extname(file).toLowerCase() === '.md') {
                fileList.push({
                    name: file,
                    path: path.relative(baseDir, filePath).replace(/\\/g, '/'),
                    size: stat.size,
                    category: path.basename(path.dirname(filePath))
                });
            }
        }
    });
    return fileList;
}

function findDynamicPage(filename, dinamicsDir) {
    const base = path.basename(filename, path.extname(filename)).toLowerCase();
    if (!fs.existsSync(dinamicsDir)) return null;

    const dirs = fs.readdirSync(dinamicsDir, { withFileTypes: true })
        .filter(d => d.isDirectory() && d.name !== 'Proximamente');

    for (const dir of dirs) {
        const dirWords = dir.name.toLowerCase().split(/[\s\-_]+/).filter(w => w.length > 3);
        const fileWords = base.split(/[\s\-_]+/).filter(w => w.length > 3);
        const overlap = dirWords.filter(w => fileWords.some(fw => fw.includes(w) || w.includes(fw)));

        if (overlap.length >= 2) {
            const folderPath = path.join(dinamicsDir, dir.name);
            const htmlFiles = fs.readdirSync(folderPath).filter(f => f.endsWith('.html'));
            if (htmlFiles.length > 0) {
                return {
                    folder: dir.name,
                    htmlFile: htmlFiles[0],
                    url: `/dinamicas/${encodeURIComponent(dir.name)}/${encodeURIComponent(htmlFiles[0])}`
                };
            }
        }
    }
    return null;
}

function loadTags(tagsFile) {
    try {
        return JSON.parse(fs.readFileSync(tagsFile, 'utf-8'));
    } catch { return {}; }
}

function saveTags(tagsFile, data) {
    fs.writeFileSync(tagsFile, JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = { safePath, formatFileSize, getFilesRecursively, findDynamicPage, loadTags, saveTags };
