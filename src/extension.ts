/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { config } from 'process';
import * as vscode from 'vscode';
import { NodebookContentProvider } from './nodebookProvider';
import { XpathResultTokenProvider } from './xpathResultTokenProvider';
import { JsonDefinitionProvider } from './jsonDefinitionProvider';
import * as path from 'path';
import * as url from 'url';

const tokenModifiers = new Map<string, number>();

const legend = (function () {
	const tokenTypesLegend = XpathResultTokenProvider.getTextmateTypeLegend();

	const tokenModifiersLegend = [
		'declaration', 'documentation', 'member', 'static', 'abstract', 'deprecated',
		'modification', 'async'
	];
	tokenModifiersLegend.forEach((tokenModifier, index) => tokenModifiers.set(tokenModifier, index));

	return new vscode.SemanticTokensLegend(tokenTypesLegend, tokenModifiersLegend);
})();

export function activate(context: vscode.ExtensionContext) {

	const nodebookContentProvider = new NodebookContentProvider();
	ExtensionData.extensionPath = context.extensionPath;

	const setActiveEditorUri = (editor: vscode.TextEditor | undefined) => {
		const nbScheme = 'vscode-notebook-cell';
		if (editor) {
			if (editor.document.uri.scheme !== nbScheme) {
				ExtensionData.lastEditorUri = editor.document.uri.toString();
				ExtensionData.setBaseUri(editor.document.uri);
			}
		} else if (!ExtensionData.lastEditorUri && vscode.workspace.textDocuments.length > 0) {
			const documents = vscode.workspace.textDocuments;
			for (let i = documents.length; i--; i > -1) {
				const document = documents[i];
				if (document.uri.scheme !== nbScheme) {
					ExtensionData.lastEditorUri = document.uri.toString();
					ExtensionData.setBaseUri(document.uri);
				}
			}
		}
	};

	setActiveEditorUri(vscode.window.activeTextEditor);

	context.subscriptions.push(
		vscode.languages.registerDocumentSemanticTokensProvider({ language: 'json' }, new XpathResultTokenProvider(), legend),
		vscode.notebook.registerNotebookContentProvider('xbook', nodebookContentProvider),
		vscode.languages.registerDefinitionProvider({ language: 'json' }, new JsonDefinitionProvider()),

		vscode.commands.registerCommand('xbook.toggleDebugging', () => {
			if (vscode.window.activeNotebookEditor) {
				const { document } = vscode.window.activeNotebookEditor;
				const nodebook = nodebookContentProvider.lookupNodebook(document.uri);
				if (nodebook) {
					nodebook.toggleDebugging(document);
				}
			}
		}),

		vscode.commands.registerCommand('xbook.restartKernel', () => {
			if (vscode.window.activeNotebookEditor) {
				const { document } = vscode.window.activeNotebookEditor;
				const nodebook = nodebookContentProvider.lookupNodebook(document.uri);
				if (nodebook) {
					nodebook.restartKernel();
				}
			}
		}),

		vscode.window.onDidChangeActiveTextEditor(setActiveEditorUri)
	);
}

export function deactivate() {
}

// const openFile = async () => {
// 	// display open file dialog
// 	// let openFolderUri: vscode.Uri = ExtensionData.lastEditorUri;
// 	if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length >= 1) {
// 		// change open file folder uri to the 1st workspace folder, usuallay workspace root
// 		openFolderUri = vscode.workspace.workspaceFolders[0].uri;
// 	}
// 	const selectedFiles: Array<vscode.Uri> | undefined = await vscode.window.showOpenDialog({
// 		defaultUri: openFolderUri,
// 		canSelectMany: false,
// 		canSelectFolders: false,
// 	});
// 	if (selectedFiles && selectedFiles.length >= 1) {
// 		// this.loadView('data.preview', selectedFiles[0].toString(true)); // skip encoding
// 	}
// }

export class ExtensionData {
	static extensionPath: string = '';
	static lastEditorUri: string | undefined;
	private static baseUri: string|undefined;

	static calcBaseUri(uri: vscode.Uri) {
		const path = uri.toString();
		const pathEnd = path.lastIndexOf('/');
		const result = path.substring(0, pathEnd);
		return result;
	}
	static setBaseUri(uri: vscode.Uri) {
		const result = this.calcBaseUri(uri);
		ExtensionData.baseUri = result;
	}

	static getBaseUri() {
		if (this.baseUri) {
			return this.baseUri;
		}
		const f = vscode.workspace.workspaceFolders;
		if (f && f.length > 0) {
			return this.calcBaseUri(f[0].uri);
		} else {
			return undefined;
		}
	}
} 
