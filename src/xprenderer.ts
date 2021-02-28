const notebookApi = acquireNotebookRendererApi('xpath-html-renderer');

notebookApi.onDidCreateOutput(evt => {
  const output = evt.output.data[evt.mimeType];
  evt.element.innerHTML= `<pre><code style="color: green">${output}</code></pre>`;
});

