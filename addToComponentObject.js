
function addToComponentObject(wxComponentContent, methodToInsert) {
  const componentRegex = /Component\(\s*{[\s\S]*?}\s*\)/;
  const componentMatch = wxComponentContent.match(componentRegex);

  if (componentMatch) {
    const componentObject = componentMatch[0];
    const methodName = methodToInsert.trim().split('(')[0];
    const methodRegex = new RegExp(`\\b${methodName}\\b`);

    if (methodRegex.test(componentObject)) {
      // 如果已经存在同名方法，不进行添加
      return wxComponentContent;
    }

    const methodsIndex = componentObject.indexOf('methods:');
    if (methodsIndex === -1) {
      return wxComponentContent; // 如果没有methods属性，不进行添加
    }

    const methodsLastBraceIndex = componentObject.indexOf('}', methodsIndex);
    const modifiedComponentObject = componentObject.substring(0, methodsLastBraceIndex) + ',\n' + methodToInsert + '\n' + componentObject.substring(methodsLastBraceIndex);
    const modifiedWxComponentContent = wxComponentContent.replace(componentRegex, modifiedComponentObject);
    return modifiedWxComponentContent;
  }

  return wxComponentContent;
}

const wxComponentContent = `
const mwx = 123;
Component({
  data: { age: 222 },
  methods: {}
})
`;

const methodToInsert = `getRefSixCard(ref) {
  this.refSixCard = ref.init();
}`;

const modifiedWxComponentContent = addToComponentObject(wxComponentContent, methodToInsert);
console.log(modifiedWxComponentContent);
