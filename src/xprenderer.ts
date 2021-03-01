const notebookApi = acquireNotebookRendererApi('xpath-html-renderer');

notebookApi.onDidCreateOutput(evt => {
  const output: string = evt.output.data[evt.mimeType] as string;
  const lines = output.split(/\r?\n/);
  const outLines: string[] = [];
  lines.forEach((line) => {
    let tLine = line.trimLeft();
    if (tLine.startsWith('/')) {
      const tLineLen = tLine.length;
      const comma = tLine.endsWith(', ')? ',' : '';
      if (comma.length === 1) {
        tLine = tLine.substring(0, tLineLen - 2);
      }
      const pad = ' '.repeat(line.length - tLineLen);
      outLines.push(`${pad}<a>${tLine}</a><span style="color: rgba(255,255,255, 0.5)">${comma}</span>\n`)
    } else {
      outLines.push(line + '\n');
    }
  });
  const markedLines = outLines.join('');
  evt.element.innerHTML= `<pre><code style="text-decoration: none">${markedLines}</code></pre>`;
});

