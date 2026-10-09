/** What the mock provider recognises about the goal's tech stack. */
export interface DetectedStack {
  /** SAP CAP backend (also the default for code goals without React). */
  cap: boolean;
  react: boolean;
  /** The goal produces software (vs. documents, e.g. a learning goal). */
  code: boolean;
}
