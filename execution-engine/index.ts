import * as fs from "fs";
import * as nodePath from "path";
import { Command } from "commander";
import { createExecutionEngine } from "libs/services/engine.factory";
import { map, flatMap, tap } from "rxjs/operators";
import { of, from } from "rxjs";

interface JiftConfig {
  sourceRoot: string;
  outRoot: string;
}

function readJson(path: string) {
  return fs.promises.readFile(path, "utf8").then(JSON.parse);
}

function fileExists(path: string): Promise<boolean> {
  return fs.promises
    .stat(path)
    .then(() => true)
    .catch(() => false);
}

async function ensureDirExists(path: string) {
  const exists = await fileExists(path);
  if (!exists) {
    await fs.promises.mkdir(path);
  }
}

const defaultJiftConfig: JiftConfig = {
  sourceRoot: "./src",
  outRoot: "./out",
};

function readJiftConfig(): Promise<JiftConfig> {
  return readJson("jift.json").catch((err) => defaultJiftConfig);
}

const program = new Command();
program.version("0.0.1");

program
  .command("run <path>")
  .description("run a dataflow")
  .action(async (path) => {
    const jiftConfig = await readJiftConfig();
    const dataflow = await readJson(
      nodePath.resolve(jiftConfig.sourceRoot, path)
    );
    const engine = createExecutionEngine();
    engine.executeDataflow(dataflow).subscribe(console.log);
  });

program
  .command("tick [path] [destination]")
  .description(
    "reads the tick state, executes the next tick and writes back the new tick state"
  )
  .action(async (path, destination) => {
    const jiftConfig = await readJiftConfig();
    const fullPath = nodePath.resolve(jiftConfig.sourceRoot, path);
    const fullStatePath = nodePath.resolve(
      jiftConfig.outRoot,
      "jift.state.json"
    );
    await ensureDirExists(jiftConfig.outRoot);
    const dataflow = await readJson(fullPath);
    const stateExists = await fs.promises
      .stat(fullStatePath)
      .then(() => true)
      .catch(() => false);
    const tickState = stateExists
      ? await readJson(fullStatePath)
      : { dataflow, path: [0], evaluations: [] };
    if (tickState.path.length === 0) {
      console.log("Dataflow execution already completed");
    } else {
      const engine = createExecutionEngine();
      engine
        .executeTick(tickState)
        .pipe(
          map((pathedEvaluation) => pathedEvaluation.evaluation),
          map((evaluation) => engine.nextTickState(tickState, evaluation)),
          map((nextTickState) => JSON.stringify(nextTickState, null, 2)),
          flatMap((string) =>
            destination
              ? from(
                  fs.promises.writeFile(
                    nodePath.resolve(jiftConfig.outRoot, destination),
                    string,
                    "utf8"
                  )
                )
              : of(string).pipe(tap(console.log))
          )
        )
        .subscribe();
    }
  });

program.parse(process.argv);
