import * as vscode from 'vscode';
import { StatusBarManager } from './statusBar';

export function activate(context: vscode.ExtensionContext) {
	vscode.window.showInformationMessage('Extension Focus Task activée!');
	
	console.log('Extension Focus Task démarrée');
	
	const statusBar = new StatusBarManager();
	
	let disposable = vscode.commands.registerCommand('focus-task.selectTask', () => {
		vscode.window.showInformationMessage('Commande Focus Task exécutée!');
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(statusBar);
}

export function deactivate() {}
