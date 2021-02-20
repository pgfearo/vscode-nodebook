# XPath 3.1 Notebook

A work in progress. The *XPath 3.1 Notebook* extension for Visual Studio Code provides Jupyter style notebook functionality for the XPath 3.1 language.

## Evaluation

Notebook cells set to the XPath language are evaluated using [Saxon-JS](https://www.saxonica.com/saxon-js/index.xml). The evaluation context is the document node of the most recently selected non-notebook editor.

## XPath cell features
- Syntax highlighting
- XPath code formatting
- XPath expression checking - basic syntax problems highlighted
- Evaluation context item -  set to document node from XML in last open editor
- In-scope XML namespace prefix checking - using last open XML document element
- XML namespace context extracted from the context item
- The `$_` variable is set to the result of the last XPath cell evaluated
- Evaluation result is shown with JSON-like syntax and formatting
- Evaluation result showså the XPath location of any XML nodes in the result 
- XPath runtime error reporting - parses Node.js exception

## Implementation

This extension provides a Notebook Kernel that effectively wraps the Node.js REPL based [NodeKernel](https://github.com/microsoft/vscode-nodebook).