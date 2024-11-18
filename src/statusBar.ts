import * as vscode from 'vscode';
import { ClickupTask } from './services/clickupService';

export class StatusBarManager {
    private taskBarItem: vscode.StatusBarItem;
    private openTaskItem: vscode.StatusBarItem;
    private currentTask?: ClickupTask;

    constructor() {
        this.taskBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );

        this.openTaskItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            99
        );

        this.updateColor();

        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('focusTask.statusBarColor')) {
                this.updateColor();
            }
        });

        this.reset();
        this.taskBarItem.show();
    }

    private updateColor() {
        const config = vscode.workspace.getConfiguration('focusTask');
        const color = config.get<string>('statusBarColor') || '#98FF98';
        
        this.taskBarItem.backgroundColor = new vscode.ThemeColor(color);
        this.taskBarItem.color = color;
        this.openTaskItem.backgroundColor = new vscode.ThemeColor(color);
        this.openTaskItem.color = color;
    }

    public updateTask(task: ClickupTask): void {
        this.currentTask = task;
        this.taskBarItem.text = `$(tasklist) ${task.name}`;
        this.taskBarItem.tooltip = `Status: ${task.status}\nCliquez pour changer de tâche`;
        this.taskBarItem.command = 'focus-task.selectTask';

        this.openTaskItem.text = `$(link-external)`;
        this.openTaskItem.tooltip = 'Ouvrir dans Clickup';
        this.openTaskItem.command = {
            command: 'focus-task.openTask',
            title: 'Ouvrir la tâche',
            arguments: [task.url]
        };
        this.openTaskItem.show();
    }

    public reset(): void {
        this.currentTask = undefined;
        this.taskBarItem.text = "$(tasklist) Sélectionner une tâche";
        this.taskBarItem.tooltip = "Cliquez pour sélectionner une tâche";
        this.taskBarItem.command = 'focus-task.selectTask';
        this.openTaskItem.hide();
    }

    public dispose(): void {
        this.taskBarItem.dispose();
        this.openTaskItem.dispose();
    }
}