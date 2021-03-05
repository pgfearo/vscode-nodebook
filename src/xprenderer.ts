const notebookApi = acquireNotebookRendererApi('xpath-html-renderer');

const punctuation = (text: string) => {
  if (text.length === 0) {
    return '';
  }
  return `<span style="color: rgba(255,255,255, 0.5)">${text}</span>`
}

const propName = (text: string) => {
  if (text.length === 0) {
    return '';
  }
  return `<span style="color: red">${text}</span>`
}

enum LineType {
  Array,
  Object,
  None
}

type Stack = LineType[]

notebookApi.onDidCreateOutput(evt => {
  const output: string = evt.output.data[evt.mimeType] as string;
  const stack: Stack = [];
  const lines = output.split(/\r?\n/);
  const outLines: string[] = [];
  lines.forEach((line) => {
    const lineType = stack.length > 0? stack[stack.length - 1] : LineType.None;
    let tLine = line.trimLeft();
    const char = tLine.charAt(0);
    switch (char) {
      case '/':
        const tLineLen = tLine.length;
        const comma = tLine.endsWith(', ') ? ',' : '';
        if (comma.length === 1) {
          tLine = tLine.substring(0, tLineLen - 2);
        }
        const pad = ' '.repeat(line.length - tLineLen);
        outLines.push(`${pad}<a>${tLine}</a>${punctuation(comma)}\n`)
        break;
      case '{':
        stack.push(LineType.Object);
        outLines.push(line + '\n');
        break;
      case '[':
        stack.push(LineType.Array);
        outLines.push(line + '\n');
        break;
      case '}':
      case ']':
        stack.pop();
        outLines.push(line + '\n');
        break;
      default:
        if (lineType === LineType.Object) {
          const pos = tLine.indexOf(': ');
          const propName = tLine.substring(0, pos);
          const value = tLine.substring(pos + 1);
          const pad = ' '.repeat(line.length - tLine.length);

        }
        outLines.push(line + '\n');
    }
  });
  const markedLines = outLines.join('');
  evt.element.innerHTML = `
  <ul>
  <li style="border-style: solid; border-width: 1px; border-color: #ffffff50; padding: 1px 1px 1px 1px">A list item</li>
  <li style="border-style: solid; border-width: 1px; border-color: #ffffff50; padding: 1px 1px 1px 1px">Second list item</li>
  </ul>
  <pre><code style="text-decoration: none">${markedLines}</code></pre>
  `;
});

