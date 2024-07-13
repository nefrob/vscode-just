import { readFileSync, writeFileSync } from 'fs';

const GRAMMAR_FILE = 'syntaxes/just.tmLanguage.json';
const OUTPUT_FILE = 'syntaxes/scopes.json';

const grammar = readFileSync(GRAMMAR_FILE, 'utf8');
const regex = /"name"\s*:\s*"(.*?\.just)"/g;

const scopeMatches = grammar.matchAll(regex);
const scopes = new Set();
for (const match of scopeMatches) {
  scopes.add(match[1]);
}

const scopesOutput = Array.from(scopes).sort();
writeFileSync(OUTPUT_FILE, JSON.stringify(scopesOutput));
