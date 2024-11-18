import * as vscode from 'vscode';
import { ClickupService, ClickupTask } from '../services/clickupService';
import { StatusBarManager } from '../statusBar';

interface TaskQuickPickItem extends vscode.QuickPickItem {
    task: ClickupTask;
}

export class TaskCommands {
    constructor(
        private clickupService: ClickupService,
        private statusBar: StatusBarManager,
        private context: vscode.ExtensionContext
    ) {}

    public async updateSourceControlMessage(task: ClickupTask) {
        const config = vscode.workspace.getConfiguration('focusTask');
        const template = config.get<string>('commitMessageTemplate') || '[{taskId}] {taskName}';

        const commitMessage = template
            .replace('{taskId}', task.id)
            .replace('{taskName}', task.name)
            .replace('{taskStatus}', task.status);

        const gitExtension = vscode.extensions.getExtension('vscode.git');
        if (gitExtension) {
            const git = gitExtension.exports.getAPI(1);
            const repo = git.repositories[0];
            if (repo) {
                repo.inputBox.value = commitMessage;
            }
        }
    }

    public async selectTask() {
        try {
            const config = vscode.workspace.getConfiguration('focusTask');
            const listId = config.get<string>('defaultListId');
            
            if (!listId) {
                throw new Error('ListId non configuré');
            }

            const quickPick = vscode.window.createQuickPick<TaskQuickPickItem>();
            quickPick.placeholder = 'Chargement des tâches...';
            quickPick.busy = true;
            quickPick.show();

            const tasks = await this.clickupService.getTasks(listId);

            const items: TaskQuickPickItem[] = tasks.map(task => ({
                label: `$(tasklist) ${task.name}`,
                description: task.status,
                detail: `ID: ${task.id}`,
                task: task
            }));

            quickPick.items = items;
            quickPick.placeholder = 'Sélectionner une tâche';
            quickPick.busy = false;

            quickPick.onDidAccept(async () => {
                const selection = quickPick.selectedItems[0];
                if (selection) {
                    this.statusBar.updateTask(selection.task);
                    await this.saveCurrentTask(selection.task);
                    await this.updateSourceControlMessage(selection.task);
                    vscode.window.showInformationMessage(`Tâche sélectionnée : ${selection.task.name}`);
                }
                quickPick.dispose();
            });

            quickPick.onDidHide(() => quickPick.dispose());

        } catch (error) {
            vscode.window.showErrorMessage(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    }

    public async openCurrentTask() {
        const task = await this.getCurrentTask();
        if (task) {
            vscode.env.openExternal(vscode.Uri.parse(task.url));
        }
    }

    private async saveCurrentTask(task: ClickupTask) {
        await this.context.globalState.update('currentTask', task);
    }

    private async getCurrentTask(): Promise<ClickupTask | undefined> {
        return this.context.globalState.get('currentTask');
    }

    public async copyCommitMessage() {
        const task = await this.getCurrentTask();
        if (!task) {
            vscode.window.showWarningMessage('Aucune tâche sélectionnée');
            return;
        }

        const config = vscode.workspace.getConfiguration('focusTask');
        const template = config.get<string>('commitMessageTemplate') || '[{taskId}] {taskName}';

        const commitMessage = template
            .replace('{taskId}', task.id)
            .replace('{taskName}', task.name)
            .replace('{taskStatus}', task.status);

        await vscode.env.clipboard.writeText(commitMessage);
        vscode.window.showInformationMessage('Message de commit copié dans le presse-papier');
    }
} 