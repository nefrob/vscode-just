import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import * as vscode from 'vscode';
import yargsParser from 'yargs-parser';

import { EXTENSION_NAME } from './const';
import { LOGGER } from './extension';
import { RecipeParameterKind, RecipeParsed, RecipeResponse } from './types';
import { workspaceRoot } from './utils';

const asyncExec = promisify(exec);

export const runRecipeCommand = async () => {
  const recipes = await getRecipes();
  if (!recipes.length) return;

  const choices: vscode.QuickPickItem[] = recipes
    .map((r) => ({
      label: r.name,
      description: r.doc,
      detail: r.groups.length ? `Groups: ${r.groups.sort().join(', ')}` : '',
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const recipeToRun = await vscode.window.showQuickPick(choices, {
    placeHolder: 'Select a recipe to run',
  });
  if (!recipeToRun) return;

  const recipe = recipes.find((r) => r.name === recipeToRun?.label);
  if (!recipe) {
    const errorMsg = 'Failed to find recipe';
    vscode.window.showErrorMessage(errorMsg);
    LOGGER.error(errorMsg);
    return;
  }

  let args: string | undefined = '';
  if (recipe.parameters.length) {
    args = await vscode.window.showInputBox({
      placeHolder: `Enter arguments: ${paramsToString(recipe.parameters)}`,
    });
  }

  if (args === undefined) return;
  runRecipe(recipe, yargsParser(args));
};

const getRecipes = async (): Promise<RecipeParsed[]> => {
  const justPath =
    (vscode.workspace.getConfiguration(EXTENSION_NAME).get('justPath') as string) ||
    'just';

  const cmd = `${justPath} --dump --dump-format=json`;
  try {
    const { stdout, stderr } = await asyncExec(cmd, { cwd: workspaceRoot() ?? '~' });

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
    .map((r) => ({
      name: r.name,
      doc: r.doc,
      parameters: r.parameters,
      groups: r.attributes
        .filter((attr) => typeof attr === 'object' && attr.group)
        .map((attr) => (attr as Record<string, string>).group),
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
  const justPath =
    (vscode.workspace.getConfiguration(EXTENSION_NAME).get('justPath') as string) ||
    'just';
  const args = [recipe.name, ...optionalArgs._.map((arg) => arg.toString())];

  const childProcess = spawn(justPath, args, { cwd: workspaceRoot() ?? '~' });
  childProcess.stdout.on('data', (data: string) => {
    LOGGER.info(data);
  });
  childProcess.stderr.on('data', (data: string) => {
    // TODO: successfully run recipes also log to stderr
    // so treat everything as info for now
    LOGGER.info(data);
    // showErrorWithLink('Error running recipe.');
  });
};
