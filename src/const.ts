export const EXTENSION_NAME = 'vscode-just';
export const COMMANDS = {
    formatDocument: `${EXTENSION_NAME}.formatDocument`,
    runRecipeFromTree: `${EXTENSION_NAME}.runRecipeFromTree`,
    runRecipeWithArgsFromTree: `${EXTENSION_NAME}.runRecipeWithArgsFromTree`,
    refreshRecipes: `${EXTENSION_NAME}.refreshRecipes`,
    openJustfile: `${EXTENSION_NAME}.openJustfile`,
    goToRecipe: `${EXTENSION_NAME}.goToRecipe`,
};
export const SETTINGS = {
    justPath: 'justPath',
    lspPath: 'lspPath',
    runInTerminal: 'runInTerminal',
    useSingleTerminal: 'useSingleTerminal',
    logLevel: 'logLevel',
    contributeTasks: 'contributeTasks',
};
