using {cnma.todotasks as todotasks} from '../db/schema';
using {cnma.todotasks.agents as agents} from '../db/agents';


@path    : '/todo-service'
@impl    : './todo-service'
@requires: 'authenticated-user'
service TODO_SERVICE {
    // ---------------------------------------------------------------------
    // Business state
    // ---------------------------------------------------------------------
    entity Users               as projection on todotasks.Users;

    entity Goals               as projection on todotasks.Goals
        actions {
            // (Re)start Goal analysis + planning in the background.
            action   generatePlan()      returns Goals;
            // Stop all running Agent work for this Goal.
            action   cancel()            returns Goals;
            // Accepted Artifacts as a .zip file (annotation on the return type => streamed).
            function downloadArtifacts() returns @Core.MediaType: 'application/zip' LargeBinary;
        };

    entity Plans               as projection on todotasks.Plans
        actions {
            // Human approval gate: PROPOSED -> ACTIVE, starts Task execution.
            action approve()                         returns Plans;
            // Human feedback: revise the PROPOSED plan with the Planner.
            action requestChanges(feedback : String) returns Plans;
        };

    entity Tasks               as projection on todotasks.Tasks
        actions {
            // BLOCKED -> TODO and let the Orchestrator pick it up again.
            action retry() returns Tasks;
        };

    entity TaskDependencies    as projection on todotasks.TaskDependencies;

    // ---------------------------------------------------------------------
    // Conversation, context and outputs (written by the runtime only)
    // ---------------------------------------------------------------------
    @readonly
    entity Sessions            as projection on todotasks.Sessions;

    @readonly
    entity Messages            as projection on todotasks.Messages;

    @readonly
    entity GoalContexts        as projection on todotasks.GoalContexts;

    @readonly
    entity ContextPackages     as projection on todotasks.ContextPackages;

    @readonly
    entity Artifacts           as projection on todotasks.Artifacts;

    // ---------------------------------------------------------------------
    // Agent configuration + runtime audit
    // ---------------------------------------------------------------------
    entity Agents              as projection on agents.Agents;
    entity Tools               as projection on agents.Tools;
    entity AgentTools          as projection on agents.AgentTools;
    entity ModelConfigurations as projection on agents.ModelConfigurations;

    @readonly
    entity AgentRuns           as projection on agents.AgentRuns;

    @readonly
    entity ToolExecutions      as projection on agents.ToolExecutions;

    // History of the event stream (load it, then continue live by seq).
    @readonly
    entity GoalEvents          as projection on agents.GoalEvents;
}
