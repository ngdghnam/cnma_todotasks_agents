# 🧠 Antigravity Agent Team
> *The "A-Team" for SAP Cloud Application Programming Model*

**Mission:** We are a deployable squad of expert AI Agents designed to co-pilot, review, and build SAP CAP solutions. We don't just "complete code"; we understand Architecture, Security, and Business Process.

---

## 🚀 How to Hire Us
To add this team to your project, install this repository as a submodule:

```bash
# In your project root
git submodule add git@ssh.dev.azure.com:v3/conarumdc/cdk/cap-agent-team .agent
```

Once installed, your AI Assistant (Cursor, Windsurf, etc.) will have access to our personalities, skills, and rules.

---

## 👥 The Roster (Who We Are)

We are a cross-functional team covering the entire SDLC.

| Agent | Role | Superpower |
| :--- | :--- | :--- |
| **[Principal Architect](agents/Principal%20Agent%20Architect.md)** | **The Manager** | Builds the team, optimizes prompts, ensures **Multi-Agent Orchestration**. |
| **[Solution Architect](agents/Solution%20Architect.md)** | **City Planner** | Translates business needs into high-level system design & **Adaptive RAG**. |
| **[CAP Architect](agents/Lead%20CAP%20Architect.md)** | **Engine Builder** | Guardian of the `srv/` and `db/` folders. Enforces **LangGraph** & **Vector Engine**. |
| **[Frontend Lead](agents/Lead%20Frontend%20Engineer.md)** | **Pixel Architect** | Master of React, Fiori UX, **Chat Interfaces**, and **HITL Flows**. |
| **[Security Consultant](agents/Security%20Consultant.md)** | **The Guardian** | Penetration testing, OWASP compliance, **Defense in Depth**. |
| **[DevOps Engineer](agents/DevOps%20Platform%20Engineer.md)** | **The Mechanic** | Owns the "Path to Production", CI/CD pipelines, and **AI Observability**. |
| **[QA Engineer](agents/Lead%20QA%20Automation%20Engineer.md)** | **The Safety Net** | Destructive testing, E2E automation, and **LLM Evals**. |

---

## 🛠️ Capabilities (What We Do)

Don't just ask us to "write code". Ask us to **own outcomes**.

### 🏗️ Build
*   **"Scaffold a new Service"** -> The CAP Architect will design the Schema, Service, and Types.
*   **"Create a Freelancer Profile Page"** -> The Frontend Lead will build the Fiori-compliant UI.
*   **"Setup CI/CD"** -> The DevOps Engineer will generate the Azure Pipeline and MTA config.

### 🔍 Review
*   **"Audit my Security"** -> The Security Consultant will perform penetration testing and OWASP checks.
*   **"Why is this query slow?"** -> The CAP Architect will analyze for N+1 issues.
*   **"Check for regressions"** -> The QA Engineer will run the E2E suite.
*   **"Test authorization boundaries"** -> The Security Consultant will verify RLS and action-level controls.

### 🧠 Plan
*   **"Design a solution for Document Management"** -> The Solution Architect will propose an S/4HANA integration pattern.

---

## 📚 The Knowledge Base (Our Training)

We are trained on strict **Antigravity Standards**. We reference these documents to make decisions.

### 📐 Core Guidelines
| Document | Purpose |
| :--- | :--- |
| **[Backend Guidelines](guidelines/backend-guidelines.md)** | The "Bible" for SAP CAP Architecture, Layers, and Patterns. |
| **[Design Guidelines](guidelines/design-guidelines.md)** | The "Bible" for UI/UX, React Component standards, and Theming. |
| **[Team Roster](general%20concepts/agent-team-roster.md)** | The complete definition of our team's skills and roles. |
| **[Operational Model](general%20concepts/operational-model.md)** | How we work together (The Sequential Swarm). |
| **[Prompt Guide (Manual)](general%20concepts/agent-best-practices.md)** | **50+ Best Practice Prompts** and Use Cases for End Users. |

### 🔧 Operational Standards
*   **[Testing Guidelines](guidelines/testing-guidelines.md)** - Strategy for Unit, Integration, and E2E testing.
*   **[Git Workflow](guidelines/git-workflow-guidelines.md)** - How we branch, commit, and merge.
*   **[Security Guidelines](guidelines/security-guidelines.md)** - Authentication & Authorization rules.
*   **[Deployment Guide](DEPLOYMENT.md)** - **⭐ Consolidated BTP deployment workflow** (use `/deploy-btp-production`).

### 🧩 Architectural Concepts
*   **[Status & Action](general%20concepts/status-action-concept.md)** - Our standard pattern for dynamic object lifecycles.

### 📦 CNMA Internal Package Skills

Source-verified consumption guides for our reusable `@cnma` CAP modules. **Reuse before you build** (Simplicity Manifesto). Each skill was extracted from the shipped `dist/`/`db/` source, not the package README (which has drifted).

| Skill | Package | What it wires |
| :--- | :--- | :--- |
| **[cnma-cap-core](skills/cnma-cap-core/SKILL.md)** | `@cnma/cap-core` | Service base classes, response envelopes, i18n text bundle, logger, BTP destination client |
| **[cnma-cap-identity](skills/cnma-cap-identity/SKILL.md)** | `@cnma/cap-identity` | Shadow Directory, JIT provisioning, SAML sync, `OrganizationManager` admin UI |
| **[cnma-cap-valuehelp](skills/cnma-cap-valuehelp/SKILL.md)** | `@cnma/cap-valuehelp` | F4 value help, AI prompt-injection + validation, 5 React widgets |
| **[cnma-cap-workflow](skills/cnma-cap-workflow/SKILL.md)** | `@cnma/cap-workflow` | DAG approval engine, `workflow.statusChanged` sync, `AUTO_COMPLETE` auto-posting |
| **[cnma-sap-aicore-integrate](skills/cnma-sap-aicore-integrate/SKILL.md)** | `@cnma/sap-aicore-integrate` (v3) | SAP AI Core LLM transport (no deployment IDs — routes by model name), retry + concurrency semaphore, per-activity model resolution via host-registered activities (`registerActivities`), embeddings with runtime-selectable model (`configureEmbeddings`) + corpus registry, `AIModels` registry + admin UI |

> Equipped to the **CAP Architect** (backend + CDS) and **React Frontend Engineer** (widgets).

---

## 🤖 Global Rules (AI Enforcement)

To ensure we stay in line, these rules are hard-coded into our behavior:

*   `rules/coding-standards.md` - No `any`, No `console.log`.
*   `rules/git-workflow.md` - Strict betting on `feature/*` branches.
*   `rules/security-basics.md` - Zero tolerance for hardcoded secrets.
*   `rules/documentation-standards.md` - **The README must always be up-to-date.**
*   `rules/simplicity-manifesto.md` - **Reject Over-Engineering. Stay BTP Native.**

---

**Last Updated:** 2026-07-22
**Version:** 2.3 (Added CNMA internal-package skills: cap-core, cap-identity, cap-valuehelp, cap-workflow, sap-aicore-integrate)
