import { exec } from 'child_process';
import * as path from 'path';
import { promisify } from 'util';
import * as vscode from 'vscode';

import { RecipeCodeLensProvider } from './codeLens';
import { COMMANDS, EXTENSION_NAME, SETTINGS } from './const';
import { formatJustfileTempFile } from './format';
import { getLauncher } from './launcher';
import { getLogger } from './logger';
import { createLanguageClient, stopLanguageClient } from './lsp';
import {
    JustfileGroup,
    RecipeDecorationProvider,
    RecipeTreeDataProvider,
    RecipeTreeItem,
} from './recipeTree';
import { TaskProvider } from './tasks';
import { RecipeParsed, RecipeResponse } from './types';
import { getJustPath } from './utils';

let recipeTreeDataProvider: RecipeTreeDataProvider | undefined;

export const activate = (context: vscode.ExtensionContext) => {
    console.debug(`${EXTENSION_NAME} activated`);

    const documentFormatProviderDisposable =
        vscode.languages.registerDocumentFormattingEditProvider('just', {
            async provideDocumentFormattingEdits(
                document: vscode.TextDocument,
            ): Promise<vscode.TextEdit[] | undefined> {
                try {
                    const formattedText = await formatJustfileTempFile(document.getText());
                    const fullRange = new vscode.Range(0, 0, document.lineCount, 0);
                    return [vscode.TextEdit.replace(fullRange, formattedText)];
                } catch (error) {
                    const message = error instanceof Error ? error.message : 'Unknown error';
                    vscode.window.showErrorMessage(`Failed to format justfile: ${message}`);
                    return [];
                }
            },
        });
    context.subscriptions.push(documentFormatProviderDisposable);

    context.subscriptions.push(
        vscode.commands.registerCommand(COMMANDS.formatDocument, () => {
            const editor = vscode.window.activeTextEditor;
            if (editor && editor.document.languageId === 'just') {
                vscode.commands.executeCommand('editor.action.formatDocument');
            }
        }),
    );

    let currentTaskProvider: TaskProvider | undefined;
    let taskRegistration: vscode.Disposable | undefined;

    const setupTaskProvider = () => {
        const enabled = vscode.workspace
            .getConfiguration(EXTENSION_NAME)
            .get<boolean>(SETTINGS.contributeTasks, false);

        if (!enabled) return;

        currentTaskProvider = new TaskProvider();
        taskRegistration = vscode.tasks.registerTaskProvider(
            EXTENSION_NAME,
            currentTaskProvider,
        );
    };

    const teardownTaskProvider = () => {
        taskRegistration?.dispose();
        taskRegistration = undefined;
        currentTaskProvider?.dispose();
        currentTaskProvider = undefined;
    };

    setupTaskProvider();

    context.subscriptions.push({
        dispose: () => teardownTaskProvider(),
    });

    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration(`${EXTENSION_NAME}.${SETTINGS.contributeTasks}`)) {
                teardownTaskProvider();
                setupTaskProvider();
            }
        }),
    );

    recipeTreeDataProvider = new RecipeTreeDataProvider();
    const treeView = vscode.window.createTreeView('justRecipes', {
        treeDataProvider: recipeTreeDataProvider,
        showCollapseAll: false,
    });
    context.subscriptions.push(treeView);
    context.subscriptions.push(recipeTreeDataProvider);

    const decorationProvider = new RecipeDecorationProvider();
    context.subscriptions.push(
        vscode.window.registerFileDecorationProvider(decorationProvider),
    );

    const recipeCodeLensProvider = new RecipeCodeLensProvider();
    context.subscriptions.push(recipeCodeLensProvider);
    context.subscriptions.push(
        vscode.languages.registerCodeLensProvider(
            { language: 'just' },
            recipeCodeLensProvider,
        ),
    );

    context.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument((doc) => {
            if (doc.languageId === 'just') {
                recipeTreeDataProvider!.refresh();
                recipeCodeLensProvider.refresh();
                currentTaskProvider?.refresh();
            }
        }),
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            COMMANDS.runRecipeFromTree,
            async (item?: RecipeTreeItem | RecipeParsed) => {
                let recipe: RecipeParsed | undefined;

                if (item instanceof RecipeTreeItem) {
                    recipe = item.recipe;
                } else if (item && 'name' in item && 'parameters' in item) {
                    recipe = item as RecipeParsed;
                }

                if (!recipe) {
                    recipe = await pickRecipe();
                    if (!recipe) return;
                }

                const cwd = recipe.justfilePath ? path.dirname(recipe.justfilePath) : undefined;
                const args = recipe.justfilePath
                    ? ['--justfile', recipe.justfilePath, recipe.name]
                    : [recipe.name];
                getLauncher().launchDedicated(getJustPath(), args, cwd);
            },
        ),
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            COMMANDS.runRecipeWithArgsFromTree,
            async (item?: RecipeTreeItem | RecipeParsed) => {
                let recipe: RecipeParsed | undefined;

                if (item instanceof RecipeTreeItem) {
                    recipe = item.recipe;
                } else if (item && 'recipe' in item) {
                    recipe = (item as { recipe: RecipeParsed }).recipe;
                } else if (item && 'name' in item && 'parameters' in item) {
                    recipe = item as RecipeParsed;
                }

                if (!recipe) {
                    recipe = await pickRecipe();
                    if (!recipe) return;
                }

                const enteredArgs: string[] = [];

                let params = recipe.parameters;

                if (params.length === 0 && recipe.justfilePath) {
                    params = await fetchRecipeParameters(recipe.justfilePath, recipe.name);
                }

                for (const param of params) {
                    const paramLabel = param.kind === 'plus' ? `+${param.name}` : param.name;
                    const placeHolder =
                        param.default != null
                            ? `${paramLabel} (default: ${param.default})`
                            : paramLabel;

                    const value = await vscode.window.showInputBox({
                        title: `Just: ${recipe.name}`,
                        prompt: `Enter value for ${paramLabel}`,
                        placeHolder,
                        value: param.default ?? '',
                    });

                    if (value === undefined) return; // user cancelled

                    if (value) {
                        enteredArgs.push(value);
                    }
                }

                const cwd = recipe.justfilePath ? path.dirname(recipe.justfilePath) : undefined;
                const args = recipe.justfilePath
                    ? ['--justfile', recipe.justfilePath, recipe.name, ...enteredArgs]
                    : [recipe.name, ...enteredArgs];
                getLauncher().launchDedicated(getJustPath(), args, cwd);
            },
        ),
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(COMMANDS.refreshRecipes, () => {
            recipeTreeDataProvider!.refresh();
        }),
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(COMMANDS.openJustfile, (item: JustfileGroup) => {
            vscode.window.showTextDocument(item.justfileUri);
        }),
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            COMMANDS.goToRecipe,
            async (item: RecipeTreeItem) => {
                const recipe = item.recipe;
                if (!recipe.justfilePath) return;

                const doc = await vscode.workspace.openTextDocument(recipe.justfilePath);
                const editor = await vscode.window.showTextDocument(doc);

                const text = doc.getText();
                const recipeRegex = new RegExp(`^${escapeRegex(recipe.name)}(\\s|:)`, 'gm');
                const match = recipeRegex.exec(text);
                if (match) {
                    const pos = doc.positionAt(match.index);
                    editor.selection = new vscode.Selection(pos, pos);
                    editor.revealRange(
                        new vscode.Range(pos, pos),
                        vscode.TextEditorRevealType.InCenter,
                    );
                }
            },
        ),
    );

    createLanguageClient();
};

export const deactivate = () => {
    console.debug(`${EXTENSION_NAME} deactivated`);
    getLogger().dispose();
    getLauncher().dispose();
    stopLanguageClient();
};

const asyncExec = promisify(exec);

async function fetchRecipeParameters(
    justfilePath: string,
    recipeName: string,
): Promise<RecipeParsed['parameters']> {
    try {
        const { stdout } = await asyncExec(
            `${getJustPath()} --justfile "${justfilePath}" --dump --dump-format=json`,
        );
        const data = JSON.parse(stdout);
        const recipe: RecipeResponse | undefined = data.recipes?.[recipeName];
        if (!recipe) return [];

        return (recipe.parameters || []).map((p) => ({
            default: p.default,
            kind: p.kind,
            name: p.name,
        }));
    } catch {
        return [];
    }
}

async function pickRecipe(): Promise<RecipeParsed | undefined> {
    if (!recipeTreeDataProvider) return;

    const allRecipes = recipeTreeDataProvider.getAllRecipes();
    if (allRecipes.length === 0) {
        vscode.window.showInformationMessage('No recipes found in workspace.');
        return;
    }

    const sorted = [...allRecipes].sort((a, b) => a.name.localeCompare(b.name));
    const items: vscode.QuickPickItem[] = sorted.map((r) => ({
        label: r.name,
        description: r.doc || undefined,
    }));

    const picked = await vscode.window.showQuickPick(items, {
        placeHolder: 'Select a recipe to run',
    });

    return picked ? sorted.find((r) => r.name === picked.label) : undefined;
}

function escapeRegex(name: string): string {
    return name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
