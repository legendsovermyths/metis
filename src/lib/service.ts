import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";

// -- AppContext types (mirrors Rust AppContext) --

export type MetisPhase = "Idle" | "Onboarding" | "Advising" | "Teaching";

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

export interface ChatState {
  phase: MetisPhase;
  notes: string | null;
  is_done: boolean;
  event_history: EventHistory;
}

export interface AppContext {
  chapter_title: string;
  selected_book_id: number | null;
  chapter_content_dir: string | null;
  onboarded: boolean;
  chat_state: ChatState;
  teaching_state: TeachingState | null;
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

export interface Blackboard {
  description: string;
  image_url?: string | null;
}

export interface Dialogue {
  journey_id: number;
  arc_idx: number;
  topic_idx: number;
  idx: number;
  content: string;
  blackboard: Blackboard;
  heading: string;
  marked_complete: boolean;
}

export interface Dialogues {
  data: Dialogue[];
  dirty: Dialogue[];
}

export interface JourneyProgress {
  journey_id: number;
  arc_idx: number;
  topic_idx: number;
  dialogues: { data: Dialogues };
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
  completed_topics: number;
  total_topics: number;
}

// -- Global context setter (registered by AppContextProvider) --

type ContextSetter = ((ctx: AppContext) => void) | null;
let _contextSetter: ContextSetter = null;

export function registerContextSetter(setter: ContextSetter) {
  _contextSetter = setter;
}

// -- Service layer --

interface ServiceResponse {
  response: unknown | null;
  status: "Success" | { Error: string };
  context: AppContext | null;
}

interface ServiceRequest {
  api_type: "Service" | "UserMessage";
  request_type?: string;
  params: Record<string, unknown> | null;
}

async function callService(request: ServiceRequest): Promise<unknown> {
  const raw = await invoke<ServiceResponse>("handle_request", { request });

  if (raw.context && _contextSetter) {
    _contextSetter(raw.context);
  }

  if (raw.status !== "Success") {
    const errMsg =
      typeof raw.status === "object" && "Error" in raw.status
        ? raw.status.Error
        : "Unknown error from backend";
    console.error(`[Metis] ${request.request_type ?? request.api_type}: ${errMsg}`);
    toast.error("Something went wrong", { description: errMsg, duration: 8000 });
    throw new Error(errMsg);
  }

  return raw.response;
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

// -- API functions --

export async function analyseBook(path: string): Promise<BackendBook> {
  const data = await callService({
    api_type: "Service",
    request_type: "AnalyseBook",
    params: { path },
  });
  return data as BackendBook;
}

export async function getAllBooks(): Promise<BackendBook[]> {
  const data = await callService({
    api_type: "Service",
    request_type: "GetAllBooks",
    params: null,
  });
  return data as BackendBook[];
}

export async function getAllJourneys(): Promise<JourneyRow[]> {
  const data = await callService({
    api_type: "Service",
    request_type: "GetAllJourneys",
    params: null,
  });
  return data as JourneyRow[];
}

export async function getJourney(id: number): Promise<JourneyRow> {
  const data = await callService({
    api_type: "Service",
    request_type: "GetJourney",
    params: { id },
  });
  return data as JourneyRow;
}

/** Runs course generation, inserts DB row, returns artifacts; context is updated from the response. */
export async function generateCourse(chapterTitle?: string): Promise<JourneyArtifacts> {
  const data = await callService({
    api_type: "Service",
    request_type: "GenerateCourse",
    params: chapterTitle?.trim() ? { chapter_title: chapterTitle.trim() } : {},
  });
  return data as JourneyArtifacts;
}

export async function getContext(): Promise<AppContext> {
  const data = await callService({
    api_type: "Service",
    request_type: "GetContext",
    params: null,
  });
  return data as AppContext;
}

export async function setContext(context: AppContext): Promise<void> {
  await callService({
    api_type: "Service",
    request_type: "SetContext",
    params: { context },
  });
}

export interface AgentResponse {
  message: string;
  message_type: "Chat" | "Dialogue";
}

export async function sendMessage(message?: string): Promise<AgentResponse> {
  const data = await callService({
    api_type: "UserMessage",
    params: { message: message ?? null },
  });
  return data as AgentResponse;
}

export interface TeachingState {
  artifacts: { data: JourneyArtifacts };
}

export async function teachingInit(journeyId: number): Promise<void> {
  await callService({
    api_type: "Service",
    request_type: "TeachingInit",
    params: { journey_id: journeyId },
  });
}
