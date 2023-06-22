#!/usr/bin/env node

import { input, select } from "@inquirer/prompts";
import * as fs from "fs";
import * as path from "path";
import * as yargs from "yargs";
import {
  createDirectoryContents,
  createProject,
  getTemplateConfig,
  postProcess,
  showFinishMessage,
} from "./lib";

const main = async () => {
  const templateNames = fs
    .readdirSync(path.join(__dirname, "templates"))
    .filter((name) => !name.startsWith("."));
  if (templateNames.length === 0) return;

  const args = yargs
    .options({
      name: { type: "string", alias: "n" },
      template: { type: "string", alias: "t" },
    })
    .parseSync();

  const currentDirectory = process.cwd();

  const templateName =
    args["template"] ||
    (await select({
      message: "What project template would you like to generate?",
      choices: templateNames.map((name) => ({ name, value: name })),
    }));

  const projectName =
    args["name"] ||
    (await input({
      message: "Project name:",
      validate: (input: string) => {
        if (/^([A-Za-z\-\_\d])+$/.test(input)) return true;
        else
          return "Project name may only include letters, numbers, underscores and hashes.";
      },
    }));

  const templatePath = path.join(__dirname, "templates", templateName);
  const tartgetPath = path.join(currentDirectory, projectName);
  const config = getTemplateConfig(templatePath);
  const options = {
    projectName,
    templateName,
    templatePath,
    tartgetPath,
    config,
  };

  if (!createProject(tartgetPath)) {
    return;
  }

  const ignores = ["node_modules", ".template.json", ".git"];
  if (config.ignores) {
    ignores.push(...config.ignores.map((ignore) => path.join(...ignore)));
  }
  const ignoreRegExp = ignores.map((ignore) => new RegExp(`${ignore}$`));
  createDirectoryContents(
    currentDirectory,
    templatePath,
    projectName,
    ignoreRegExp
  );

  if (!postProcess(options)) {
    return;
  }

  showFinishMessage(options);
};

main();
