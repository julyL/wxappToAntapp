const { pageAxml } = require('./testData');

function extractTagsAndClasses(input) {
    const regex = /<([\w-]+)[^>]*class=(['"])([^'"]+)\2[^>]*>/g;
    let match;
    const results = [];

    while ((match = regex.exec(input)) !== null) {
        const nodeName = match[1];
        const className = match[3];
        results.push({ nodeName, className });
    }

    return results;
}

module.exports = extractTagsAndClasses;

console.log('extractTagsAndClasses(pageAxml):', extractTagsAndClasses(pageAxml));