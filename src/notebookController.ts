/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { Nodebook } from './nodebook';
import { NotebookCellOutput, NotebookCellOutputItem } from 'vscode';
import { HtmlTables } from './htmlTables';

interface RawNotebookCell {
	language: string;
	value: string;
	kind: vscode.NotebookCellKind;
	editable?: boolean;
}

interface ProjectAssociation {
	(key: string): boolean;
}

const debugTypes = ['node', 'node2', 'pwa-node', 'pwa-chrome'];

export class NodebookContentProvider implements vscode {

	readonly id = 'nodebookKernel';
	public label = 'Node.js Kernel';

	private _localDisposables: vscode.Disposable[] = [];
	private readonly _associations = new Map<string, [ProjectAssociation, Nodebook]>();
	private runIndex = 0;
	private _cells: vscode.NotebookCellData[] = [];
	private _documentUri: vscode.Uri | undefined;


	public async executeCellsRequest(document: vscode.NotebookDocument, ranges: vscode.NotebookCellRange[]) {
		for(let range of ranges) {
            for(let cell of document.getCells(range)) {
                const execution = vscode.notebook.createNotebookCellExecutionTask(cell.notebook.uri, cell.index, this.id)!;
			    await this.executeCell(execution);
            }
        }
	}

	private async executeCell(cellExecTask: vscode.NotebookCellExecutionTask): Promise<void> {
		const cell: vscode.NotebookCell = cellExecTask.cell;
		let output = '';
		let error: Error | undefined;
		const nodebook = this.lookupNodebook(cell.document.uri);
		const start = Date.now();

		cellExecTask.executionOrder = ++this.runIndex;
		const metaData = { startTime: start }
		cellExecTask.start(metaData);

		if (nodebook && this._documentUri) {
			try {
				const preEdit = new vscode.WorkspaceEdit();
				await vscode.workspace.applyEdit(preEdit);
				output = await nodebook.eval(cell);
				if (output.startsWith('Uncaught Error')) {
					const msgs: string[] = [];
					const lines = output.split('\n');
					lines.forEach(line => line.trim().startsWith('message:') || line.trim().startsWith('code:') ? msgs.push(line) : null);
					const msgsString = msgs.join('\n');
					error = new Error(msgsString);
				}
			} catch (e) {
				error = e;
			}
		}

		if (error) {
			const cellErrorItem: NotebookCellOutputItem = new NotebookCellOutputItem('text/plain', error.toString());
			const cellErrorOuput = new NotebookCellOutput([cellErrorItem]);
			cellExecTask.replaceOutput(cellErrorOuput);
			cellExecTask.end({ success: false });
		} else {
			console.log('parsed', output);
			if (cell.document.languageId === 'xpath') {
				const jsonObj = JSON.parse(output);
				const cellOutItem: NotebookCellOutputItem = new NotebookCellOutputItem('application/json', jsonObj);
				const cellRichOutItem: NotebookCellOutputItem = new NotebookCellOutputItem('xpath-notebook/xpath', output);
				const htmlText = HtmlTables.constructTableForObject(jsonObj);
				const cellMarkdownOutItem: NotebookCellOutputItem = new NotebookCellOutputItem('text/html', htmlText);
				const cellOutOutput = new NotebookCellOutput([cellOutItem, cellMarkdownOutItem, cellRichOutItem], metaData);
				cellExecTask.replaceOutput(cellOutOutput);
			} else {
				const cellOutItem: NotebookCellOutputItem = new NotebookCellOutputItem('text/plain', output);
				const cellOutOutput = new NotebookCellOutput([cellOutItem], metaData);
				cellExecTask.replaceOutput(cellOutOutput);
			}
			cellExecTask.end({ success: true });
		}
	}

	public cancelCellExecution(_document: vscode.NotebookDocument, _cell: vscode.NotebookCell): void {
		// not yet supported
	}

	cancelAllCellsExecution(_document: vscode.NotebookDocument): void {
		// not yet supported
	}

	public dispose() {
		this._localDisposables.forEach(d => d.dispose());
	}
}
