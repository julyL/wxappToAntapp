const fs = require('fs');
const path = require('path');
const addStringToPageObject = require('./utils/addStringToPageObject');
const extractSelectComponent = require('./utils/extractSelectComponent');
const extractTagsAndClasses = require('./utils/extractTagsAndClasses');

function parseRef(str) {
  const regex = /<([-\w]+)[^>]*ref=['"]([^'"]+)['"][^>]*>/g;
  const matches = [...str.matchAll(regex)];
  const refs = matches.map(match => {
    const nodeName = match[1];
    const ref = match[2];
    return { nodeName, ref };
  });
  return refs;
}

function generateRefMethod(nodeName) {
  let refName = nodeName.charAt(0).toUpperCase() + nodeName.slice(1);
  const methodName = 'getRef' + refName;
  return {
    fnStr: `${methodName}(ref) {
      this.ref${refName} = ref.init();
    }`,
    methodName,
    refName: `ref${refName}`
  };
}





// 1. 输入某个目录读取该目录下所有的.js文件，读取每个js文件的内容，执行 extractSelectComponent 方法，获取结果数组 componentList。
// 2. 如果结果数组长度大于0，则获取该js文件同名的axml文件内容。使用 extractTagsAndClasses 方法，获取数组withClassTagList。新建一个空数组list.遍历componentList,如果withClassTagList中有nodeName和componentList中的相同,则将该对象push到list中。
const directoryPath = path.resolve(__dirname, './createCard');
const files = fs.readdirSync(directoryPath);
const componentClassNameList = [];

files.forEach(file => {
  if (file.endsWith('.js')) {
    const filePath = path.join(directoryPath, file);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const selectComponents = extractSelectComponent(fileContent);
    componentClassNameList.push(...selectComponents);

    if (componentClassNameList.length > 0) {
      const axmlFileName = file.replace('.js', '.axml');
      const axmlFilePath = path.join(directoryPath, axmlFileName);
      const axmlContent = fs.readFileSync(axmlFilePath, 'utf8');
      const withClassTagList = extractTagsAndClasses(axmlContent);
      const list = [];
      componentClassNameList.forEach(className => {
        const foundComponent = withClassTagList.find(item => {
          if (item.className) {
            const classNames = item.className.split(' ');
            return classNames.includes(className);
          }
          return false;
        });
        if (foundComponent) {
          list.push(foundComponent);
        }
      });

      // Function to convert kebab-case to camelCase
      function toCamelCase(str) {
        return str.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
      }

      // Remove duplicates from list
      const uniqueList = Array.from(new Set(list.map(item => JSON.stringify(item)))).map(item => JSON.parse(item));

      // Generate ref methods
      const refMethods = uniqueList.map(item => {
        return {
          ...item,
          ...generateRefMethod(toCamelCase(item.nodeName))
        }
      });

      // Insert the generated ref methods into the js file
      let jsContent = fs.readFileSync(filePath, 'utf8');
      refMethods.forEach(({ className, fnStr, methodName, refName, nodeName }) => {
        // jsContent = addStringToPageObject({ code: jsContent, methodName, refName });
        // Replace this.selectComponet('.x1') with this.refX2()
        const regex = new RegExp(`\\.selectComponent\\(\\s*['"]\\.${className}['"]\\s*\\)`, 'gs');
        let newNodeName = toCamelCase(nodeName)
        let refName2 = newNodeName.charAt(0).toUpperCase() + newNodeName.slice(1);
        jsContent = jsContent.replace(regex, `.ref${refName2}()`);
      });
      fs.writeFileSync(filePath, jsContent, 'utf8');
    }
  }
});



