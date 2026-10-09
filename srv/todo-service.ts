import cds from "@sap/cds";
import goalHandler from "./handlers/goal.handler";
import planHandler from "./handlers/plan.handler";
import taskHandler from "./handlers/task.handler";

export class TODO_SERVICE extends cds.ApplicationService {
  async init() {
    await goalHandler(this);
    await planHandler(this);
    await taskHandler(this);
    await super.init();
  }
}
