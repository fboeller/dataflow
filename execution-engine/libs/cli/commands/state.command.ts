import { readJiftConfig, readState } from "../files/file.service";
import { promptWorkflow } from "../inquirer.service";

export async function state(name?: string) {
  const jiftConfig = await readJiftConfig();
  if (!name) {
    name = await promptWorkflow(jiftConfig, "The state of which workflow do you want to see?");
  }
  if (name) {
    const message = await readState(jiftConfig, name)
      .then((state) => JSON.stringify(state, null, 2))
      .catch(() => process.exit(1));
    console.log(message);
  }
}
