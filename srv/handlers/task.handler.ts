import cds from "@sap/cds";
import { resumeExecution, retryTask } from "../services/task.service";
import { boundKey } from "../utils/request";

const { SELECT } = cds.ql;

export default async function taskHandler(srv: cds.Service) {
  const { Tasks } = srv.entities;

  srv.on("retry", Tasks, async (req) => {
    const taskId = boundKey(req);
    const goalId = await retryTask(taskId);
    req.on("succeeded", () => resumeExecution(goalId));
    return SELECT.one.from(Tasks, taskId);
  });
}
