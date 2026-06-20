import { exec } from 'child_process';
import * as path from 'path';
import { promisify } from 'util';
import * as vscode from 'vscode';

import { EXTENSION_NAME } from './const';
import { RecipeResponse } from './types';
import { getJustPath } from './utils';

const asyncExec = promisify(exec);

const JUSTFILE_GLOB = '**/{justfile,Justfile,.justfile,*.just}';

interface RecipeWithSource {
    recipe: RecipeResponse;
    justfilePath: string;
    fileLabel: string;
}

export interface TaskDefinition extends vscode.TaskDefinition {
    task: string;
    args?: string[];
    justfilePath?: string;
}

export class TaskProvider implements vscode.TaskProvider {
    private _onDidChangeTasks = new vscode.EventEmitter<void>();
    readonly onDidChangeTasks: vscode.Event<void> = this._onDidChangeTasks.event;

    private watcher: vscode.FileSystemWatcher | undefined;
    private allRecipes: RecipeWithSource[] | undefined;

    constructor() {
        this.setupFileWatcher();
    }

    private setupFileWatcher(): void {
        this.watcher = vscode.workspace.createFileSystemWatcher(JUSTFILE_GLOB);

        const refresh = () => {
            this.allRecipes = undefined;
            this._onDidChangeTasks.fire();
        };

        this.watcher.onDidChange(refresh);
        this.watcher.onDidCreate(refresh);
        this.watcher.onDidDelete(refresh);
    }

    public async provideTasks(): Promise<vscode.Task[]> {
        try {
            const recipes = await this.getAllRecipes();
            if (recipes.length === 0) return [getDefaultRecipeTask()];

            return recipes.map((r) => this.createTask(r));
        } catch {
            return [getDefaultRecipeTask()];
        }
    }

    public resolveTask(_task: vscode.Task): vscode.Task | undefined {
        if (_task.definition.type !== EXTENSION_NAME) return undefined;

        const definition = _task.definition as TaskDefinition;
        const args = definition.args ?? [];
        const jp = definition.justfilePath;
        const shellArgs = jp
            ? ['--justfile', jp, definition.task, ...args]
            : [definition.task, ...args];

        return new vscode.Task(
            definition,
            _task.scope ?? vscode.TaskScope.Workspace,
            definition.label ?? 'Run recipe',
            definition.type,
            new vscode.ShellExecution(getJustPath(), shellArgs),
        );
    }

    public refresh(): void {
        this.allRecipes = undefined;
        this._onDidChangeTasks.fire();
    }

    private async getAllRecipes(): Promise<RecipeWithSource[]> {
        if (this.allRecipes) return this.allRecipes;

        try {
            const justfileUris = await vscode.workspace.findFiles(
                JUSTFILE_GLOB,
                '**/node_modules/**',
            );

            if (justfileUris.length === 0) {
                this.allRecipes = [];
                return [];
            }

            const fileLabels = new Map(
                justfileUris.map((uri) => {
                    const wsFolder = vscode.workspace.getWorkspaceFolder(uri);
                    const relPath = wsFolder
                        ? path.relative(wsFolder.uri.fsPath, uri.fsPath)
                        : uri.fsPath;
                    return [uri.fsPath, relPath] as const;
                }),
            );

            const results = await Promise.allSettled(
                justfileUris.map((uri) => this.fetchRecipesForFile(uri, fileLabels)),
            );

            this.allRecipes = results
                .filter(
                    (r): r is PromiseFulfilledResult<RecipeWithSource[]> =>
                        r.status === 'fulfilled',
                )
                .flatMap((r) => r.value);

            return this.allRecipes;
        } catch {
            this.allRecipes = [];
            return [];
        }
    }

    private async fetchRecipesForFile(
        uri: vscode.Uri,
        fileLabels: Map<string, string>,
    ): Promise<RecipeWithSource[]> {
        const justfilePath = uri.fsPath;
        const fileLabel = fileLabels.get(justfilePath) ?? path.basename(justfilePath);

        try {
            const { stdout } = await asyncExec(
                `${getJustPath()} --justfile "${justfilePath}" --dump --dump-format=json`,
            );
            const data = JSON.parse(stdout);
            return (Object.values(data.recipes || {}) as RecipeResponse[])
                .filter((r) => !r.private && !r.attributes?.some((attr) => attr === 'private'))
                .map((recipe) => ({ recipe, justfilePath, fileLabel }));
        } catch {
            return [];
        }
    }

    private createTask(r: RecipeWithSource): vscode.Task {
        const { recipe, justfilePath, fileLabel } = r;

        const label = this.multipleFiles() ? `${fileLabel}: ${recipe.name}` : recipe.name;

        const args = this.buildArgs(recipe);
        const shellArgs = ['--justfile', justfilePath, recipe.name, ...args];

        const definition: TaskDefinition = {
            type: EXTENSION_NAME,
            task: recipe.name,
            args,
            justfilePath,
        };

        const task = new vscode.Task(
            definition,
            vscode.TaskScope.Workspace,
            label,
            EXTENSION_NAME,
            new vscode.ShellExecution(getJustPath(), shellArgs),
        );

        task.detail = recipe.doc || undefined;
        task.presentationOptions = {
            showReuseMessage: false,
            close: false,
        };

        return task;
    }

    private buildArgs(recipe: RecipeResponse): string[] {
        return (recipe.parameters || [])
            .filter((p) => p.default != null && p.default !== '')
            .map((p) => p.default);
    }

    private multipleFiles(): boolean {
        if (!this.allRecipes) return false;
        const paths = new Set(this.allRecipes.map((r) => r.justfilePath));
        return paths.size > 1;
    }

    dispose(): void {
        this.watcher?.dispose();
        this._onDidChangeTasks.dispose();
    }
}

export const getDefaultRecipeTask = () => {
    const runDefaultRecipeTask = new vscode.Task(
        { type: EXTENSION_NAME, task: 'just' },
        vscode.TaskScope.Workspace,
        'Run default recipe',
        EXTENSION_NAME,
        new vscode.ShellExecution(getJustPath()),
    );
    runDefaultRecipeTask.presentationOptions = {
        showReuseMessage: false,
        close: false,
    };

    return runDefaultRecipeTask;
};
