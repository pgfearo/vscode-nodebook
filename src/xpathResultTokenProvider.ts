import * as vscode from 'vscode';

export interface BaseToken {
    line: number;
    startCharacter: number;
    length: number;
    value: string;
    tokenType: number;
}

enum LineType {
    Array,
    Object,
    None
}

enum TokenType {
    punctuation,
    keyword,
    variable
}


export class XpathResultTokenProvider implements vscode.DocumentSemanticTokensProvider {

    private static textmateTypes: string[] = [];

    public static getTextmateTypeLegend(): string[] {

        // concat xsl legend to xpath legend
        if (XpathResultTokenProvider.textmateTypes.length === 0) {
            let keyCount: number = Object.keys(TokenType).length / 2;
            for (let i = 0; i < keyCount; i++) {
                XpathResultTokenProvider.textmateTypes.push(TokenType[i]);
            }
        }       

        return XpathResultTokenProvider.textmateTypes;
    }

    async provideDocumentSemanticTokens(document: vscode.TextDocument, token: vscode.CancellationToken): Promise<vscode.SemanticTokens> {
        // console.log('provideDocumentSemanticTokens');
        const builder = new vscode.SemanticTokensBuilder();
        const stack: Stack = [];
        const lines = document.getText().split(/\r?\n/);
        const outLines: string[] = [];
        lines.forEach((line, lineNum) => {
            const lineType = stack.length > 0 ? stack[stack.length - 1] : LineType.None;
            const tLine = line.trimLeft();
            const padding = line.length - tLine.length;
            let char = tLine.charAt(0);
            const isLineStartString = char === '"';
            if (isLineStartString) {
                const cp = tLine.codePointAt(1);
                char = cp? String.fromCodePoint(cp) : '';
            }
            switch (char) {
                case '\ue0ee':
                    const spacePos = tLine.indexOf(' ', 3);
                    const pathStart = padding + 3;
                    builder.push(lineNum, padding, 2, TokenType.variable, 0);
                    const endPos = tLine.endsWith(',')? line.length - 2 : line.length - 1;
                    builder.push(lineNum, endPos, 1, TokenType.variable, 0);
                    builder.push(lineNum, pathStart, spacePos - 2, TokenType.keyword, 0);
                    break;
                case '{':
                    stack.push(LineType.Object);
                    break;
                case '[':
                    stack.push(LineType.Array);
                    break;
                case '}':
                case ']':
                    stack.pop();
                    break;
                default:
                    if (lineType === LineType.Object) {

                    }
            }
        });

        return builder.build();
    }
}