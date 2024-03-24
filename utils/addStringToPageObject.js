const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const generator = require("@babel/generator").default;
const t = require("@babel/types");

/**
 * Adds a method to the Page object.
 * @param {Object} options - The options for adding the method.
 * @param {string} options.code - The original code.
 * @param {string} options.methodName - The name of the method to add.
 * @param {string} options.refName - The name of the reference.
 * @returns {string} - The modified code.
 */
function addMethodToPageObject({ code, methodName, refName }) {
    const methodArgs = [t.identifier('ref')];
    const methodBody = createMethodBody(refName);
    const ast = parser.parse(code, {
        sourceType: "module",
        plugins: ["jsx"]
    });

    traverse(ast, {
        CallExpression(path) {
            if (
                path.node.callee.type === "Identifier" &&
                path.node.callee.name === "Page"
            ) {
                const newMethod = t.objectMethod(
                    "method",
                    t.identifier(methodName),
                    methodArgs,
                    t.blockStatement(methodBody)
                );
                path.node.arguments[0].properties.push(newMethod);
            }
        }
    });

    const { code: newCode } = generator(ast, {
        comments: true
    });

    return newCode;
}

const code = `Page({
    data: {

    },
    setAge() {
        this.selectComponent('.comp').setData();
        this.selectComponent('.comp').setData();
    },
    setName() {

    }
})`;

// 输出 this[refName] = ref.init();
const createMethodBody = (refName) => {
    return [
        t.expressionStatement(
            t.assignmentExpression(
                '=',
                t.memberExpression(
                    t.thisExpression(),
                    t.identifier(refName)
                ),
                t.callExpression(
                    t.memberExpression(
                        t.identifier('ref'),
                        t.identifier('init')
                    ),
                    []
                )
            )
        )
    ];
}

module.exports = addMethodToPageObject;

const newCode = addMethodToPageObject({ code, methodName: "getSixCard", refName: 'sixCard' });

console.log(newCode);