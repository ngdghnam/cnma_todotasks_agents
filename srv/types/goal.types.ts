import type { Readable } from "node:stream";
import type { GoalStatus as GoalStatusValues } from "../constants/goal.constants";

/** One of the GoalStatus values (see constants/goal.constants.ts). */
export type GoalStatus = (typeof GoalStatusValues)[keyof typeof GoalStatusValues];

/** Streamed result of Goals.downloadArtifacts() (CAP reads value/mimetype/filename). */
export interface ArtifactsDownload {
  value: Readable;
  mimetype: string;
  filename: string;
}
