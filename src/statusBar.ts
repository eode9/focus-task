import * as vscode from 'vscode';

export class StatusBarManager {
    private statusBarItem: vscode.StatusBarItem;

    constructor() {
        // Créer l'élément de la barre d'état
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Left,
            100
        );

        // Configuration initiale
        this.statusBarItem.text = "$(tasklist) Sélectionner une tâche";
        this.statusBarItem.tooltip = "Cliquez pour sélectionner une tâche Clickup";
        this.statusBarItem.command = 'focus-task.selectTask';
        
        // Afficher l'élément
        this.statusBarItem.show();
    }

    public show(): void {
        this.statusBarItem.show();
    }

    // Mettre à jour avec les informations de la tâche
    public updateTask(taskId: string, taskName: string): void {
        const color = vscode.workspace.getConfiguration('focusTask').get('statusBarColor');
        this.statusBarItem.backgroundColor = new vscode.ThemeColor(color as string);
        this.statusBarItem.text = `$(tasklist) ${taskId}: ${taskName}`;
        this.statusBarItem.tooltip = `Tâche en cours : ${taskName}`;
    }

    // Réinitialiser la barre d'état
    public reset(): void {
        this.statusBarItem.text = "$(tasklist) Sélectionner une tâche";
        this.statusBarItem.tooltip = "Cliquez pour sélectionner une tâche Clickup";
        this.statusBarItem.backgroundColor = undefined;
    }

    // Nettoyer lors de la désactivation de l'extension
    public dispose(): void {
        this.statusBarItem.dispose();
    }
}