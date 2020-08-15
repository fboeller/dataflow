import { readJiftConfig, readWorkflow } from "../file.service";
import { promptWorkflow } from "../inquirer.service";

export async function view(name?: string) {
  const jiftConfig = await readJiftConfig();
  if (!name) {
    name = await promptWorkflow(jiftConfig, "view");
  }
  if (name) {
    const message = await readWorkflow(jiftConfig, name)
      .then((state) => JSON.stringify(state, null, 2))
      .catch(() => "This workflow does not exist.");
    console.log(message);
  }
}
