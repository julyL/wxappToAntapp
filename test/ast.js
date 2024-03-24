const parser = require("@babel/parser");
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

console.log(JSON.stringify(ast, null, 2));