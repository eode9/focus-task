import * as vscode from 'vscode';

export interface ClickupTask {
    id: string;
    name: string;
    status: string;
    url: string;
}

export class ClickupService {
    private apiKey: string;
    private baseUrl = 'https://api.clickup.com/api/v2';

    constructor() {
        const config = vscode.workspace.getConfiguration('focusTask');
        this.apiKey = config.get('apiKey') || '';
    }

    public async getTasks(listId: string | undefined): Promise<ClickupTask[]> {
        if (!listId) {
            throw new Error('ListId non défini');
        }

        if (!this.apiKey) {
            throw new Error('Clé API non configurée');
        }

        try {
            console.log(`Récupération des tâches pour la liste ${listId}`);
            console.log(`Utilisation de la clé API: ${this.apiKey.substring(0, 5)}...`);

            const data = await this.request(`/list/${listId}/task`);
            
            if (!data.tasks) {
                console.error('Réponse API inattendue:', data);
                throw new Error('Format de réponse API inattendu');
            }

            return data.tasks.map((task: any) => ({
                id: task.id,
                name: task.name,
                status: task.status.status,
                url: task.url
            }));
        } catch (error) {
            console.error('Erreur détaillée:', error);
            throw error;
        }
    }

    private async request(endpoint: string): Promise<any> {
        const nodeFetch = await import('node-fetch');
        const fetch = nodeFetch.default;
        
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                headers: {
                    'Authorization': this.apiKey,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Réponse API complète:', errorText);
                throw new Error(`Erreur API Clickup (${response.status}): ${errorText}`);
            }

            return response.json();
        } catch (error) {
            console.error('Erreur lors de la requête:', error);
            throw error;
        }
    }
} 