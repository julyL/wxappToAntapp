function addToPageObject(wxPageContent, methodToInsert) {
  const pageRegex = /Page\(\s*{[\s\S]*?}\s*\)/;
  const pageMatch = wxPageContent.match(pageRegex);

  if (pageMatch) {
    const pageObject = pageMatch[0];
    const methodName = methodToInsert.trim().split('(')[0];
    const methodRegex = new RegExp(`\\b${methodName}\\b`);

    if (methodRegex.test(pageObject)) {
      // 如果已经存在同名方法，不进行添加
      return wxPageContent;
    }

    const lastBraceIndex = pageObject.lastIndexOf('}');
    const modifiedPageObject = pageObject.substring(0, lastBraceIndex) + ',\n' + methodToInsert + '\n' + pageObject.substring(lastBraceIndex);
    const modifiedWxPageContent = wxPageContent.replace(pageRegex, modifiedPageObject);
    return modifiedWxPageContent;
  }

  return wxPageContent;
}

const wxPageContent = `
const mwx = 123;
Page({
  data: { age: 222 }
})
`;

const methodToInsert = `getRefSixCard(ref) {
  this.refSixCard = ref.init();
}`;

const modifiedWxPageContent = addToPageObject(wxPageContent, methodToInsert);
console.log(modifiedWxPageContent);
