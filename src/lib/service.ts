import { invoke } from "@tauri-apps/api/core";

interface ServiceResponse {
  response: unknown | null;
  status: "Success" | { Error: string };
}

interface ServiceRequest {
  api_type: "Service" | "UserMessage";
  request_type?: string;
  params: Record<string, unknown> | null;
}

async function callService(request: ServiceRequest): Promise<unknown> {
  const raw = await invoke<ServiceResponse>("handle_request", { request });

  if (raw.status !== "Success") {
    const errMsg =
      typeof raw.status === "object" && "Error" in raw.status
        ? raw.status.Error
        : "Unknown error from backend";
    throw new Error(errMsg);
  }

  return raw.response;
}

export interface Book {
  id: number;
  title: string;
  table_of_content: Chapter[];
}

export interface Chapter {
  title: string;
  topics: Topic[];
}

export interface Topic {
  title: string;
}

export async function getAllBooks(): Promise<Book[]> {
  const data = await callService({
    api_type: "Service",
    request_type: "GetAllBooks",
    params: null,
  });
  return data as Book[];
}
