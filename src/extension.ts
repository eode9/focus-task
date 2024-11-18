import * as vscode from 'vscode';
import { StatusBarManager } from './statusBar';
import { ClickupService } from './services/clickupService';
import { TaskCommands } from './commands/taskCommands';
import { ClickupTask } from './services/clickupService';

export function activate(context: vscode.ExtensionContext) {
	console.log('Extension "focus-task" est activée');
	
	const clickupService = new ClickupService();
	const statusBar = new StatusBarManager();
	const taskCommands = new TaskCommands(clickupService, statusBar, context);

	let disposables = [
		vscode.commands.registerCommand('focus-task.selectTask', () => 
			taskCommands.selectTask()
		),
		vscode.commands.registerCommand('focus-task.openTask', (url: string) => 
			vscode.env.openExternal(vscode.Uri.parse(url))
		),
		vscode.commands.registerCommand('focus-task.copyCommitMessage', () =>
			taskCommands.copyCommitMessage()
		)
	];

	const lastTask = context.globalState.get<ClickupTask>('currentTask');
	if (lastTask && 'id' in lastTask) {
		statusBar.updateTask(lastTask);
		taskCommands.updateSourceControlMessage(lastTask);
	}

	context.subscriptions.push(...disposables, statusBar);
}

export function deactivate() {}
