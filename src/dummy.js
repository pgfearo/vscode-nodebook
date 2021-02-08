let process = function(result, parts) {
  if (typeof result === 'object')
  {
    if (Array.isArray(result)) {
      const len = result.length;
      parts.push('[\n');
      result.forEach((item, index) => {
        process(item, parts);
        if (index + 1 < len) {
          parts.push(',');
        }      
      });
      parts.push('\n]');
    } else if (result.constructor.name.includes('xmldom')) {
      parts.push(SaxonJS.serialize(result));
    } else if (result.qname && result.value) {
      parts.push(result.qname.local + ' = "' + result.value + '"');
    } else {
      parts.push(JSON.stringify(result));
    }
  } 
  else {
    return parts.push(JSON.stringify(result));
    ;
  }
};