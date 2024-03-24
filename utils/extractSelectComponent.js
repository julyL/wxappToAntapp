const { pageJs } = require('./testData');
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;

/**
 * Parses the given JavaScript code and extracts the arguments of all calls to `selectComponent`.
 *
 * @param {string} pageJs - The JavaScript code to parse.
 * @returns {string[]} The arguments of all calls to `selectComponent`.
 */
function extractSelectComponent(pageJs) {
    // Parse the JavaScript code into an AST.
    const ast = parser.parse(pageJs, {
        sourceType: "module",
        plugins: ["jsx"]
    });

    let components = [];

    // Traverse the AST.
    traverse(ast, {
        // For each call expression...
        CallExpression(path) {
            // If the call is a `selectComponent` call...
            if (
                path.node.callee.type === "MemberExpression" &&
                path.node.callee.property.name === "selectComponent"
            ) {
                // Add the argument of the call to the `components` array.
                components.push(path.node.arguments[0].value);
            }
        }
    });
    components = components.map(c => c.slice(1));
    return components;
}

module.exports = extractSelectComponent;

console.log(extractSelectComponent(pageJs));  // ['.comp', '.comp']
