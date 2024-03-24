const fs = require('fs');
const path = require('path');

const axml = `Page({
    data: {

    },
    setAge() {
        this.selectComponent('.comp').setData();
    },
    setName() {

    }
})`


const pageJs = fs.readFileSync(path.join(__dirname, '../createCard/index.js'), 'utf8');
const pageAxml = fs.readFileSync(path.join(__dirname, '../createCard/index.axml'), 'utf8');

const componentAxml = `const mwx = 123;
Component({
  data: { age: 222 },
  methods: {}
})`


module.exports = {
    axml,
    pageAxml,
    pageJs,
    componentAxml
}
