const notebookApi = acquireNotebookRendererApi('xpath-html-renderer');

notebookApi.onDidCreateOutput(evt => {
  const output = evt.output.data[evt.mimeType];
  evt.element.innerText = `<pre>${output}</pre>`;
});

