const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const t = require("@babel/types");
const generate = require("@babel/generator").default;

const code = `
const a = 1;
Page({
    data: {

    },
    setAge() {
        this.selectComponent('.comp').setData();
        this.selectComponent('.comp').setData();
    }
})
`;

const ast = parser.parse(code, {
    sourceType: "module",
    plugins: ["jsx"]
});

traverse(ast, {
    ObjectExpression(path) {
        if (path.parent.type === 'CallExpression' && path.parent.callee.name === 'Page') {
            const setNameMethod = t.objectMethod(
                "method",
                t.identifier("setName"),
                [],
                t.blockStatement([])
            );
            path.node.properties.push(setNameMethod);
        }
    }
});

const output = generate(ast, {}, code);

console.log(output.code);