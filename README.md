# XPath 3.1 Notebook

A work in progress. The *XPath 3.1 Notebook* extension for Visual Studio Code provides Jupyter style notebook functionality for the XPath 3.1 language.

## Evaluation

Notebook cells set to the XPath language are evaluated using Saxon-JS. The evaluation context is the document node of the most recently selected non-notebook editor.

## XPath cell features
- Syntax highlighting
- XPath code formatting
- Expression checking
- Context item set to document node of most recent XML editor contents
- XML namespace context extracted from the context item
- The `$_` variable is set to the result of the last XPath cell evaluated
- Evaluation result is represented as JSON and formatted accordingly
- Evaluation result showså the XPath location of any XML nodes in the result 

## Implementation

This extension wraps a Node.js REPL NodeKernel.