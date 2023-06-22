import * as ejs from "ejs";
import * as fs from "fs";
import * as path from "path";
import * as picocolors from "picocolors";
import * as shell from "shelljs";

type TemplateData = {
  projectName: string;
};

type TemplateConfig = {
  files?: string[];
  postMessage?: string;
  ignores?: string[][];
};

type CliOptions = {
  projectName: string;
  templateName: string;
  templatePath: string;
  tartgetPath: string;
  config: TemplateConfig;
};

const render = (content: string, data: TemplateData) => {
  return ejs.render(content, data);
};

export const showFinishMessage = (options: CliOptions) => {
  console.log("");
  console.log(picocolors.green("Done."));
  console.log(
    picocolors.green(`Go into the project: cd ${options.projectName}`)
  );

  const message = options.config.postMessage;

  if (message) {
    console.log("");
    console.log(picocolors.yellow(message));
    console.log("");
  }
};

export const getTemplateConfig = (templatePath: string): TemplateConfig => {
  const configPath = path.join(templatePath, ".template.json");

  if (!fs.existsSync(configPath)) return {};

  const templateConfigContent = fs.readFileSync(configPath);

  if (templateConfigContent) {
    return JSON.parse(templateConfigContent.toString());
  }

  return {};
};

export const createProject = (projectPath: string) => {
  if (fs.existsSync(projectPath)) {
    console.log(
      picocolors.red(
        `Folder ${projectPath} exists. Delete or use another name.`
      )
    );
    return false;
  }

  fs.mkdirSync(projectPath);
  return true;
};

export const postProcess = (options: CliOptions) => {
  if (isNode(options)) {
    return postProcessNode(options);
  }
  return true;
};

const isNode = (options: CliOptions) => {
  return fs.existsSync(path.join(options.templatePath, "package.json"));
};

const postProcessNode = (options: CliOptions) => {
  shell.cd(options.tartgetPath);

  let cmd = "";

  if (shell.which("yarn")) {
    cmd = "yarn";
  } else if (shell.which("npm")) {
    cmd = "npm install";
  }

  if (cmd) {
    const result = shell.exec(cmd);

    if (result.code !== 0) {
      return false;
    }
  } else {
    console.log(
      picocolors.red("No yarn or npm found. Cannot run installation.")
    );
  }

  return true;
};

export const createDirectoryContents = (
  currentDirectory: string,
  templatePath: string,
  projectName: string,
  ignores: RegExp[] = []
) => {
  const filesToCreate = fs.readdirSync(templatePath);

  filesToCreate.forEach((file) => {
    const origFilePath = path.join(templatePath, file);

    // get stats about the current file
    const stats = fs.statSync(origFilePath);

    if (ignores.some((v) => origFilePath.match(v))) {
      return;
    }

    if (stats.isFile()) {
      let contents = fs.readFileSync(origFilePath, "utf8");

      contents = render(contents, { projectName });

      const writePath = path.join(currentDirectory, projectName, file);
      fs.writeFileSync(writePath, contents, "utf8");
    } else if (stats.isDirectory()) {
      fs.mkdirSync(path.join(currentDirectory, projectName, file));

      // recursive call
      createDirectoryContents(
        currentDirectory,
        path.join(templatePath, file),
        path.join(projectName, file),
        ignores
      );
    }
  });
};
