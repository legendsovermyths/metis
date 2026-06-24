import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import { toast } from "sonner";

// -- AppContext types (mirrors Rust AppContext) --

export type MetisPhase = "Idle" | "Onboarding" | "Advising" | "Teaching" | "Exploring";

export type EventType =
  | "UserMessage"
  | "LlmMessage"
  | "FunctionCall"
  | "FunctionResponse"
  | "UserRequest";

export interface ChatEvent {
  name: string;
  event_type: EventType;
  content: string;
  timestamp: string;
}

export interface EventHistory {
  events: ChatEvent[];
}

export type ReferenceKind = "Journey" | "Explanation" | "None";

export type PendingAction =
  | { kind: "explainer"; problem_resource_id: number; solution_resource_id: number }
  | { kind: "journey"; resource_id: number };

export interface ChatContext {
  phase: MetisPhase;
  notes: string | null;
  is_done: boolean;
  event_history: EventHistory;
  dialogue_id: number | null;
  pending_action: PendingAction | null;
}

export interface SessionContext {
  chapter_title: string;
  book_id: number | null;
}

export interface TeachingContext {
  artifact_id: number | null;
  artifact_kind: ReferenceKind | null;
}

export interface AppContext {
  session: SessionContext;
  chat: ChatContext;
  teaching: TeachingContext;
}

export interface Journey {
  journey_title: string;
  arcs: JourneyArc[];
}

export interface JourneyArtifacts {
  id: number | null;
  chapter_title: string;
  chapter_dir: string;
  journey: Journey;
  advisor_notes: string;
  tutor_notes: string;
  progress: JourneyProgress;
}

export interface JourneyArc {
  arc_title: string;
  topics: ArcTopic[];
}

export interface ArcTopic {
  name: string;
  mode: "reinvent" | "discover" | "derive" | "connect" | "introduce";
}

export interface ElementDescriptor {
  id: string;
  desc: string;
}

export interface Blackboard {
  elements: ElementDescriptor[];
  description: string;
  image_url?: string | null;
}

export type SegmentAction =
  | { type: "reveal"; targets: string[] }
  | { type: "focus"; targets: string[] }
  | { type: "morph"; from: string; to: string; duration_ms: number }
  | { type: "trace"; target: string; along: string; duration_ms: number; from_pct: number; to_pct: number }
  | { type: "connect"; from: string; to: string; duration_ms: number }
  | { type: "pulse"; targets: string[]; duration_ms: number };

export interface Segment {
  text: string;
  actions: SegmentAction[];
}

export type DialogueReference =
  | { Journey: { journey_id: number; arc_idx: number; topic_idx: number } }
  | { Explanation: { explanation_id: number; step_idx: number } }
  | "None";

export interface Dialogue {
  id: number | null;
  reference: DialogueReference;
  idx: number;
  content: string;
  blackboard: Blackboard;
  heading: string;
  marked_complete: boolean;
  visible: boolean;
  segments: Segment[];
  is_ready: boolean;
}

export function journeyRef(
  ref: DialogueReference,
): { journey_id: number; arc_idx: number; topic_idx: number } | null {
  return typeof ref === "object" && "Journey" in ref ? ref.Journey : null;
}

export function explanationRef(
  ref: DialogueReference,
): { explanation_id: number; step_idx: number } | null {
  return typeof ref === "object" && "Explanation" in ref ? ref.Explanation : null;
}

export interface JourneyProgress {
  journey_id: number;
  arc_idx: number;
  topic_idx: number;
  is_journey_complete: boolean;
}

/** Row from `journeys` table (API). */
export interface JourneyRow {
  id: number;
  chapter_title: string;
  chapter_dir: string;
  journey: Journey;
  created_at: number;
  advisor_notes: string;
  tutor_notes: string;
  completed_topics: number;
  total_topics: number;
}

// -- Explanations & folders --

export type ExplanationLabel =
  | "Grasp"
  | "Observation"
  | "Deduction"
  | "Conclusion"
  | "Application";

export interface ExplanationStep {
  name: string;
  label: ExplanationLabel;
  brief: string;
}

export interface Explanation {
  steps: ExplanationStep[];
}

/** Row from `explanations` table (API). */
export interface ExplanationRow {
  id: number;
  title: string;
  explanation_dir: string;
  explanation: Explanation;
  created_at: number;
  tutor_notes: string;
  folder_id: number | null;
  completed_steps: number;
  total_steps: number;
}

export interface Folder {
  id: number;
  name: string;
  parent_id: number | null;
  created_at: number;
}

export interface ExplanationProgress {
  explanation_id: number;
  step_idx: number;
  is_complete: boolean;
}

export interface ExplanationArtifacts {
  id: number | null;
  title: string;
  explanation_directory: string;
  explanation: Explanation;
  progress: ExplanationProgress;
  tutor_notes: string;
}

/** Artifact-with-progress for the active teaching session (journey or explanation). */
export type TeachingArtifact =
  | { kind: "Journey"; journey: JourneyArtifacts }
  | { kind: "Explanation"; explanation: ExplanationArtifacts };

// -- Background tasks --

export type TaskStatus = "Pending" | "Running" | "Completed" | "Failed";

export type TaskName =
  | "analyse_book"
  | "create_journey"
  | "generate_dialogues"
  | "create_explanation";

export interface BackgroundTask {
  id: string;
  name: TaskName | string;
  status: TaskStatus;
  params: Record<string, unknown>;
  checkpoint: Record<string, unknown> | null;
  error: string;
  identity: string | null;
}

export interface TaskProgressEvent {
  task_id: string;
  checkpoint: Record<string, unknown> | null;
  status: TaskStatus;
  message: string;
}

// -- Global context setter (registered by AppContextProvider) --

type ContextSetter = ((ctx: AppContext) => void) | null;
let _contextSetter: ContextSetter = null;

export function registerContextSetter(setter: ContextSetter) {
  _contextSetter = setter;
}

// -- Service layer --

type ApiType = "Service" | "UserMessage" | "Task";

interface ServiceResponse {
  response: unknown | null;
  status: "Success" | { Error: string };
  context: AppContext | null;
}

type ServiceRequest =
  | { api_type: "Service"; request_type: string; params: Record<string, unknown> | null }
  | { api_type: "Task"; task_type: TaskName; params: Record<string, unknown> | null }
  | { api_type: "UserMessage"; params: Record<string, unknown> | null };

function describeRequest(req: ServiceRequest): string {
  if (req.api_type === "Service") return req.request_type;
  if (req.api_type === "Task") return `task:${req.task_type}`;
  return "UserMessage";
}

async function callBackend(request: ServiceRequest): Promise<unknown> {
  const raw = await invoke<ServiceResponse>("handle_request", { request });

  if (raw.context && _contextSetter) {
    _contextSetter(raw.context);
  }

  if (raw.status !== "Success") {
    const errMsg =
      typeof raw.status === "object" && "Error" in raw.status
        ? raw.status.Error
        : "Unknown error from backend";
    console.error(`[Metis] ${describeRequest(request)}: ${errMsg}`);
    toast.error("Something went wrong", { description: errMsg, duration: 8000 });
    throw new Error(errMsg);
  }

  return raw.response;
}

function callService(requestType: string, params: Record<string, unknown> | null = null) {
  return callBackend({ api_type: "Service", request_type: requestType, params });
}

async function callTask(
  taskType: TaskName,
  params: Record<string, unknown>,
): Promise<string> {
  const data = (await callBackend({
    api_type: "Task",
    task_type: taskType,
    params,
  })) as { task_id: string };
  return data.task_id;
}

// -- Book types --

export interface BackendChapter {
  title: string;
  topics: { title: string }[];
}

export interface BackendBook {
  id: number;
  title: string;
  table_of_content: BackendChapter[];
}

// -- API: books --

export async function analyseBook(path: string): Promise<string> {
  return callTask("analyse_book", { path });
}

export async function getAllBooks(): Promise<BackendBook[]> {
  return (await callService("GetAllBooks")) as BackendBook[];
}

// -- API: journeys --

export async function getAllJourneys(): Promise<JourneyRow[]> {
  return (await callService("GetAllJourneys")) as JourneyRow[];
}

export async function getJourney(id: number): Promise<JourneyRow> {
  return (await callService("GetJourney", { id })) as JourneyRow;
}

export interface CreateJourneyParams {
  chapter_title: string;
  advisor_notes: string;
  book_id: number;
}

export async function createJourney(params: CreateJourneyParams): Promise<string> {
  return callTask("create_journey", params as unknown as Record<string, unknown>);
}

export async function deleteJourney(id: number): Promise<void> {
  await callService("DeleteJourney", { id });
}

// -- API: explanations & folders --

export async function getArtifact(
  kind: ReferenceKind,
  parentId: number,
): Promise<TeachingArtifact> {
  return (await callService("GetArtifact", { kind, parent_id: parentId })) as TeachingArtifact;
}

export async function getAllExplanations(): Promise<ExplanationRow[]> {
  return (await callService("GetAllExplanations")) as ExplanationRow[];
}

export async function deleteExplanation(id: number): Promise<void> {
  await callService("DeleteExplanation", { id });
}

export async function moveExplanation(id: number, folderId: number | null): Promise<void> {
  await callService("MoveExplanation", { id, folder_id: folderId });
}

/** Build an explanation from a problem + solution resource. Returns a task id. */
export async function createExplanation(
  problemResourceId: number,
  solutionResourceId: number,
): Promise<string> {
  return callTask("create_explanation", {
    problem_resource_id: problemResourceId,
    solution_resource_id: solutionResourceId,
  });
}

export async function getFolders(): Promise<Folder[]> {
  return (await callService("GetFolders")) as Folder[];
}

export async function createFolder(name: string, parentId: number | null): Promise<number> {
  const data = (await callService("CreateFolder", { name, parent_id: parentId })) as {
    id: number;
  };
  return data.id;
}

export async function renameFolder(id: number, name: string): Promise<void> {
  await callService("RenameFolder", { id, name });
}

export async function moveFolder(id: number, parentId: number | null): Promise<void> {
  await callService("MoveFolder", { id, parent_id: parentId });
}

export async function deleteFolder(id: number): Promise<void> {
  await callService("DeleteFolder", { id });
}

// -- API: dialogues --

export async function getAllDialogues(
  kind: ReferenceKind,
  parentId: number,
): Promise<Dialogue[]> {
  return (await callService("GetAllDialogues", { kind, parent_id: parentId })) as Dialogue[];
}

/**
 * Returns the next prefetched dialogue (marking it visible), or null if none are
 * ready yet. When null, the backend has already spawned a `generate_dialogues`
 * task — callers should listen to task events and retry.
 */
export async function getNextDialogue(
  kind: ReferenceKind,
  parentId: number,
): Promise<Dialogue | null> {
  const data = await callService("GetNextDialogue", { kind, parent_id: parentId });
  return (data ?? null) as Dialogue | null;
}

// -- API: context & state --

export async function getContext(): Promise<AppContext> {
  return (await callService("GetContext")) as AppContext;
}

export async function setChat(chat: ChatContext): Promise<void> {
  await callService("SetChat", chat as unknown as Record<string, unknown>);
}

export async function setSession(session: SessionContext): Promise<void> {
  await callService("SetSession", session as unknown as Record<string, unknown>);
}

export async function setTeaching(teaching: TeachingContext): Promise<void> {
  await callService("SetTeaching", teaching as unknown as Record<string, unknown>);
}

export async function teachingInit(
  artifactKind: ReferenceKind,
  artifactId: number,
): Promise<void> {
  await callService("TeachingInit", { artifact_kind: artifactKind, artifact_id: artifactId });
}

export async function setDialogue(dialogueId: number): Promise<void> {
  await callService("SetDialogue", { dialogue_id: dialogueId });
}

// -- API: tasks --

export async function listTasks(): Promise<BackgroundTask[]> {
  return (await callService("ListTasks")) as BackgroundTask[];
}

// -- API: agent message --

export interface AgentResponse {
  content: { message: string };
  message_type: "Chat";
}

export async function sendMessage(message?: string): Promise<AgentResponse> {
  const data = await callBackend({
    api_type: "UserMessage",
    params: { message: message ?? null },
  });
  return data as AgentResponse;
}

// -- API: agent-initiated user input (human-in-the-loop popup) --

/** A request emitted by the backend when a tool needs input from the user. */
export interface AgentInputRequest {
  request_id: string;
  kind: string;
  title?: string;
  prompt?: string;
  /** The agent's own note about this resource — echoed straight back on submit. */
  notes?: string;
}

/**
 * One piece of material, shaped to match the backend `UserInput` enum
 * (externally tagged: the single key names the variant).
 */
export type UserInputItem =
  | { File: string }
  | { Image: { src: string; mime: string } }
  | { Url: string }
  | { Text: string };

/** Deliver the user's gathered material back to the waiting tool. */
export async function submitAgentInput(
  requestId: string,
  inputs: UserInputItem[],
  notes: string,
): Promise<void> {
  await callService("SubmitUserInput", { request_id: requestId, inputs, notes });
}

/** Abandon a pending input request so the waiting tool errors out instead of hanging. */
export async function cancelAgentInput(requestId: string): Promise<void> {
  await callService("CancelUserInput", { request_id: requestId });
}

/** Listen for `agent:request_input` events (one popup request at a time). */
export async function subscribeAgentInput(
  handler: (req: AgentInputRequest) => void,
): Promise<UnlistenFn> {
  return await listen<AgentInputRequest>("agent:request_input", (e) => handler(e.payload));
}

// -- Task event subscription --

export interface TaskDoneEvent {
  task_id: string;
  /** Task-type-specific result payload returned by the runner. */
  result: unknown;
}

export interface TaskEventHandlers {
  onProgress?: (event: TaskProgressEvent) => void;
  onDone?: (event: TaskDoneEvent) => void;
  onError?: (taskId: string) => void;
}

export async function subscribeTaskEvents(handlers: TaskEventHandlers): Promise<UnlistenFn> {
  const unlisteners: UnlistenFn[] = [];
  if (handlers.onProgress) {
    unlisteners.push(
      await listen<TaskProgressEvent>("task:progress", (e) => handlers.onProgress!(e.payload)),
    );
  }
  if (handlers.onDone) {
    unlisteners.push(
      await listen<TaskDoneEvent>("task:done", (e) => handlers.onDone!(e.payload)),
    );
  }
  if (handlers.onError) {
    unlisteners.push(
      await listen<string>("task:error", (e) => handlers.onError!(e.payload)),
    );
  }
  return () => unlisteners.forEach((u) => u());
}
