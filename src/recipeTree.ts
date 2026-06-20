import { exec } from 'child_process';
import * as path from 'path';
import { promisify } from 'util';
import * as vscode from 'vscode';

import { RecipeParameter, RecipeParsed, RecipeResponse } from './types';
import { getJustPath } from './utils';

const asyncExec = promisify(exec);

const JUSTFILE_GLOB = '**/{justfile,Justfile,.justfile,*.just}';

export class RecipeTreeItem extends vscode.TreeItem {
    constructor(public readonly recipe: RecipeParsed) {
        super(recipe.name, vscode.TreeItemCollapsibleState.None);

        this.description = recipe.doc || undefined;
        this.tooltip = recipe.doc ? `${recipe.name}\n${recipe.doc}` : recipe.name;

        const hasParams = recipe.parameters.length > 0;
        this.contextValue = hasParams ? 'recipeWithParams' : 'recipe';

        this.resourceUri = vscode.Uri.parse(
            `just-recipe:/recipes/${recipe.name}?p=${hasParams ? '1' : '0'}`,
        );

        this.iconPath = hasParams
            ? new vscode.ThemeIcon('gear', new vscode.ThemeColor('charts.yellow'))
            : new vscode.ThemeIcon('play', new vscode.ThemeColor('charts.green'));

        if (hasParams) {
            const paramList = recipe.parameters
                .map((p) => `${p.kind === 'plus' ? '+' : ''}${p.name}`)
                .join(', ');
            this.description = paramList;
        }

        this.command = {
            command: 'vscode-just.goToRecipe',
            title: 'Go to Recipe',
            arguments: [this],
        };
    }
}

export class JustfileGroup extends vscode.TreeItem {
    public readonly children: RecipeTreeItem[];

    constructor(
        public readonly justfileUri: vscode.Uri,
        children: RecipeTreeItem[],
    ) {
        const wsFolder = vscode.workspace.getWorkspaceFolder(justfileUri);
        const relPath = wsFolder
            ? path.relative(wsFolder.uri.fsPath, justfileUri.fsPath)
            : justfileUri.fsPath;

        const dir = path.dirname(relPath);
        const base = path.basename(relPath);

        super(base, vscode.TreeItemCollapsibleState.Expanded);

        this.children = children;
        this.description = `${dir !== '.' ? dir + '/ ' : ''}${children.length} recipe${children.length !== 1 ? 's' : ''}`;
        this.tooltip = `${justfileUri.fsPath}\n${children.length} recipe${children.length !== 1 ? 's' : ''}`;
        this.contextValue = 'justfile';
        this.iconPath = new vscode.ThemeIcon('file-text');

        this.command = {
            command: 'vscode-just.openJustfile',
            title: 'Open File',
            arguments: [this],
        };
    }
}

export class RecipeDecorationProvider implements vscode.FileDecorationProvider {
    onDidChangeFileDecorations?: vscode.Event<vscode.Uri | vscode.Uri[] | undefined>;

    provideFileDecoration(uri: vscode.Uri): vscode.ProviderResult<vscode.FileDecoration> {
        if (uri.scheme !== 'just-recipe') {
            return undefined;
        }

        const query = JSON.parse(uri.query || '{}');
        const hasParams = query.p === '1';

        if (hasParams) {
            return {
                badge: '~',
                color: new vscode.ThemeColor('charts.yellow'),
                tooltip: 'Has parameters',
            };
        }

        return {
            badge: '▶',
            color: new vscode.ThemeColor('charts.green'),
            tooltip: 'Run without arguments',
        };
    }
}

export class RecipeTreeDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    private _onDidChangeTreeData = new vscode.EventEmitter<vscode.TreeItem | undefined>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    private watcher: vscode.FileSystemWatcher | undefined;
    private groups: JustfileGroup[] = [];

    constructor() {
        this.refresh();
        this.setupFileWatcher();
    }

    private setupFileWatcher(): void {
        this.watcher = vscode.workspace.createFileSystemWatcher(JUSTFILE_GLOB);

        this.watcher.onDidChange(() => this.refresh());
        this.watcher.onDidCreate(() => this.refresh());
        this.watcher.onDidDelete(() => this.refresh());
    }

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: vscode.TreeItem): vscode.TreeItem[] {
        if (!element) {
            return this.groups;
        }
        if (element instanceof JustfileGroup) {
            return element.children;
        }
        return [];
    }

    refresh(): void {
        this.fetchAllRecipes().then(() => {
            this._onDidChangeTreeData.fire(undefined);
        });
    }

    private async fetchAllRecipes(): Promise<void> {
        try {
            const justfileUris = await vscode.workspace.findFiles(
                JUSTFILE_GLOB,
                '**/node_modules/**',
            );

            justfileUris.sort((a, b) => a.fsPath.localeCompare(b.fsPath));

            const results = await Promise.allSettled(
                justfileUris.map((uri) => this.loadRecipesFromFile(uri)),
            );

            const newGroups: JustfileGroup[] = [];
            for (const result of results) {
                if (result.status === 'fulfilled' && result.value) {
                    newGroups.push(result.value);
                }
            }
            this.groups = newGroups;
        } catch {
            /* silently ignore individual justfile errors */
        }
    }

    private async loadRecipesFromFile(
        justfileUri: vscode.Uri,
    ): Promise<JustfileGroup | null> {
        const justfilePath = justfileUri.fsPath;

        try {
            const { stdout } = await asyncExec(
                `${getJustPath()} --justfile "${justfilePath}" --dump --dump-format=json`,
            );

            const data = JSON.parse(stdout);
            const rawRecipes: RecipeResponse[] = Object.values(data.recipes || {});

            const children = rawRecipes
                .filter((r) => !r.private && !r.attributes?.some((a) => a === 'private'))
                .map((r) => {
                    const parsed: RecipeParsed = {
                        name: r.name,
                        doc: r.doc || '',
                        parameters: (r.parameters || []).map((p: RecipeParameter) => ({
                            default: p.default,
                            kind: p.kind,
                            name: p.name,
                        })),
                        groups: (r.attributes || [])
                            .filter(
                                (a): a is Record<string, string> =>
                                    typeof a === 'object' && a !== null && 'group' in a,
                            )
                            .map((a) => a.group),
                        justfilePath,
                    };
                    return new RecipeTreeItem(parsed);
                });

            if (children.length === 0) return null;
            return new JustfileGroup(justfileUri, children);
        } catch {
            return null;
        }
    }

    getAllRecipes(): RecipeParsed[] {
        return this.groups.flatMap((g) => g.children.map((c) => c.recipe));
    }

    dispose(): void {
        this.watcher?.dispose();
        this._onDidChangeTreeData.dispose();
    }
}
