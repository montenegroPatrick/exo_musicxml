#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get module name from arguments
const moduleName = process.argv[2];

if (!moduleName) {
  console.error('Error: Please provide a module name');
  console.error('Usage: npm run g:module <module-name>');
  process.exit(1);
}

// Validate module name (kebab-case)
if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(moduleName)) {
  console.error('Error: Module name must be in kebab-case (e.g., my-module)');
  process.exit(1);
}

// Helper functions for name transformations
function toPascalCase(str) {
  return str
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function toCamelCase(str) {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function toUpperSnakeCase(str) {
  return str.toUpperCase().replace(/-/g, '_');
}

const pascalName = toPascalCase(moduleName);
const camelName = toCamelCase(moduleName);
const upperSnakeName = toUpperSnakeCase(moduleName);

// Base path for modules
const modulesBasePath = path.join(process.cwd(), 'src', 'app', 'modules');
const modulePath = path.join(modulesBasePath, moduleName);

// Check if module already exists
if (fs.existsSync(modulePath)) {
  console.error(`Error: Module "${moduleName}" already exists at ${modulePath}`);
  process.exit(1);
}

console.log(`\nCreating module: ${moduleName}`);
console.log(`Location: ${modulePath}\n`);

// Create directory structure
const directories = [
  modulePath,
  path.join(modulePath, 'components'),
  path.join(modulePath, 'interfaces'),
  path.join(modulePath, 'resolvers'),
  path.join(modulePath, 'services'),
];

directories.forEach(dir => {
  fs.mkdirSync(dir, { recursive: true });
  console.log(`Created: ${path.relative(process.cwd(), dir)}/`);
});

// Generate main component using Angular CLI
console.log(`\nGenerating component...`);
try {
  execSync(
    `ng generate component modules/${moduleName}/${moduleName} --flat --skip-tests`,
    { stdio: 'inherit' }
  );
} catch (error) {
  console.error('Error generating component:', error.message);
  process.exit(1);
}

// Template for routes file
const routesTemplate = `import { Routes } from '@angular/router';
import { ${pascalName}Component } from './${moduleName}.component';

export const ${upperSnakeName}_ROUTES: Routes = [
  {
    path: '',
    component: ${pascalName}Component,
  },
];
`;

// Template for interface file
const interfaceTemplate = `export interface I${pascalName} {
  // TODO: Define interface properties
}
`;

// Template for resolver file
const resolverTemplate = `import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

export const ${camelName}Resolver: ResolveFn<unknown> = (route, state) => {
  // TODO: Implement resolver logic
  return null;
};
`;

// Write files
const files = [
  { path: path.join(modulePath, `${moduleName}.routes.ts`), content: routesTemplate },
  { path: path.join(modulePath, 'interfaces', `${moduleName}.interface.ts`), content: interfaceTemplate },
  { path: path.join(modulePath, 'resolvers', `${moduleName}.resolver.ts`), content: resolverTemplate },
];

console.log(`\nCreating files...`);
files.forEach(file => {
  fs.writeFileSync(file.path, file.content);
  console.log(`Created: ${path.relative(process.cwd(), file.path)}`);
});

console.log(`\n Module "${moduleName}" created successfully!`);
console.log(`\nStructure:`);
console.log(`src/app/modules/${moduleName}/`);
console.log(`├── components/`);
console.log(`├── interfaces/`);
console.log(`│   └── ${moduleName}.interface.ts`);
console.log(`├── resolvers/`);
console.log(`│   └── ${moduleName}.resolver.ts`);
console.log(`├── services/`);
console.log(`├── ${moduleName}.component.ts`);
console.log(`├── ${moduleName}.component.html`);
console.log(`└── ${moduleName}.routes.ts`);
console.log(`\nTo add routes, import ${upperSnakeName}_ROUTES in your app.routes.ts`);
