import * as vscode from 'vscode';
import * as renderer from 'vscode-notebook-renderer'

const notebookApi = acquireNotebookRendererApi('github-issue-static-renderer');

notebookApi.onDidCreateOutput(evt => {
  const output = evt.output.data[evt.mimeType];
  evt.element.innerText = JSON.stringify(output);
});

