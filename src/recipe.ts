import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import * as vscode from 'vscode';
import yargsParser from 'yargs-parser';

import { EXTENSION_NAME, SETTINGS } from './const';
import { getLauncher } from './launcher';
import { getLogger } from './logger';
import { RecipeParameterKind, RecipeParsed, RecipeResponse } from './types';
import { getJustPath, workspaceRoot } from './utils';

const LOGGER = getLogger();

const asyncExec = promisify(exec);

export const runRecipeCommand = async () => {
  const recipes = await getRecipes();
  if (!recipes.length) return;

  const recipeToRun = await selectRecipe(recipes);
  if (!recipeToRun) return;

  const args = await getRecipeArgs(recipeToRun);
  if (args === undefined) return;

  runRecipe(recipeToRun, yargsParser(args));
};

const selectRecipe = async (
  recipes: RecipeParsed[],
): Promise<RecipeParsed | undefined> => {
  const choices: vscode.QuickPickItem[] = recipes
    .map((r) => ({
      label: r.name,
      description: r.doc,
      detail: r.groups.length ? `Groups: ${r.groups.sort().join(', ')}` : '',
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const selected = await vscode.window.showQuickPick(choices, {
    placeHolder: 'Select a recipe to run',
  });

  return selected ? recipes.find((r) => r.name === selected.label) : undefined;
};

const getRecipeArgs = async (recipe: RecipeParsed): Promise<string | undefined> => {
  if (!recipe.parameters.length) return '';

  return vscode.window.showInputBox({
    placeHolder: `Enter arguments: ${paramsToString(recipe.parameters)}`,
  });
};

const getRecipes = async (): Promise<RecipeParsed[]> => {
  const cmd = `${getJustPath()} --dump --dump-format=json`;
  try {
    const { stdout, stderr } = await asyncExec(cmd, { cwd: workspaceRoot() });

    if (stderr) {
      vscode.window.showErrorMessage('Failed to fetch recipes.');
      LOGGER.error(stderr);
      return [];
    }

    return parseRecipes(stdout);
  } catch (error) {
    if (error instanceof Error) {
      vscode.window.showErrorMessage('Failed to fetch recipes.');
      LOGGER.error(error.message);
    } else {
      vscode.window.showErrorMessage('Failed to fetch recipes.');
      LOGGER.error('An unknown error occurred.');
    }

    return [];
  }
};

const parseRecipes = (output: string): RecipeParsed[] => {
  return (Object.values(JSON.parse(output).recipes) as RecipeResponse[])
    .filter((r) => !r.private && !r.attributes.some((attr) => attr === 'private'))
    .map(({ name, doc, parameters, attributes }) => ({
      name,
      doc,
      parameters,
      groups: attributes
        .filter(
          (attr): attr is Record<string, string> =>
            typeof attr === 'object' && 'group' in attr,
        )
        .map((attr) => attr.group),
    }));
};

const paramsToString = (params: RecipeParsed['parameters']): string => {
  return params
    .sort((a, b) =>
      a.kind === RecipeParameterKind.PLUS ? 1 : a.name.localeCompare(b.name),
    )
    .map((p) => {
      let formatted = `${p.kind === RecipeParameterKind.PLUS ? '+' : ''}${p.name}`;
      if (p.default != null) formatted += `=${p.default}`;
      return formatted;
    })
    .join(' ');
};

const runRecipe = async (recipe: RecipeParsed, optionalArgs: yargsParser.Arguments) => {
  const args = [recipe.name, ...optionalArgs._.map(String)];

  LOGGER.info(`Running recipe: ${recipe.name} with args: ${args.join(' ')}`);
  if (vscode.workspace.getConfiguration(EXTENSION_NAME).get(SETTINGS.runInTerminal)) {
    getLauncher().launch(getJustPath(), args);
  } else {
    runRecipeInBackground(args);
  }
};

const runRecipeInBackground = async (args: string[]) => {
  const childProcess = spawn(getJustPath(), args, { cwd: workspaceRoot() });
  childProcess.stdout.on('data', (data: string) => {
    LOGGER.info(data);
  });
  childProcess.stderr.on('data', (data: string) => {
    // TODO: successfully run recipes also log to stderr
    // so treat everything as info for now
    LOGGER.info(data);
    // showErrorWithLink('Error running recipe.');
  });

  // Kill the child process when the extension is disposed
  const disposable = new vscode.Disposable(() => {
    if (!childProcess.killed) {
      childProcess.kill();
    }
  });
  context.subscriptions.push(disposable);
};
