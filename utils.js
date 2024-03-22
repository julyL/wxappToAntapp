
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


function generateRefMethod(refName) {
  const methodName = 'getRef' + refName.charAt(0).toUpperCase() + refName.slice(1);
  return `${methodName}(ref) {
    this.ref${refName} = ref.init();
  }`;
}


