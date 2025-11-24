import type { Flow } from "@/types/flow";

const STORAGE_KEY = "open-agent-builder-flows";
const CURRENT_FLOW_KEY = "open-agent-builder-current-flow";

/**
 * Save a flow to localStorage
 */
export function saveFlowToStorage(flow: Flow): void {
  try {
    const flows = getFlowsFromStorage();
    const existingIndex = flows.findIndex((f) => f.id === flow.id);
    
    if (existingIndex >= 0) {
      flows[existingIndex] = flow;
    } else {
      flows.push(flow);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(flows));
    localStorage.setItem(CURRENT_FLOW_KEY, JSON.stringify(flow));
  } catch (error) {
    console.error("Failed to save flow to storage:", error);
  }
}

/**
 * Get all flows from localStorage
 */
export function getFlowsFromStorage(): Flow[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load flows from storage:", error);
    return [];
  }
}

/**
 * Get the current flow from localStorage
 */
export function getCurrentFlowFromStorage(): Flow | null {
  try {
    const data = localStorage.getItem(CURRENT_FLOW_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Failed to load current flow from storage:", error);
    return null;
  }
}

/**
 * Delete a flow from localStorage
 */
export function deleteFlowFromStorage(flowId: string): void {
  try {
    const flows = getFlowsFromStorage();
    const filtered = flows.filter((f) => f.id !== flowId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to delete flow from storage:", error);
  }
}

/**
 * Export flow as JSON file
 */
export function exportFlowAsJSON(flow: Flow): void {
  const dataStr = JSON.stringify(flow, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${flow.name || "flow"}-${flow.id}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Import flow from JSON file
 */
export function importFlowFromJSON(file: File): Promise<Flow> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const flow = JSON.parse(e.target?.result as string) as Flow;
        // Basic validation
        if (!flow.id || !flow.nodes || !flow.edges) {
          reject(new Error("Invalid flow format"));
          return;
        }
        resolve(flow);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

const API_KEY_STORAGE_KEY = "open-agent-builder-openai-api-key";

/**
 * Save OpenAI API key to localStorage
 */
export function saveApiKeyToStorage(apiKey: string): void {
  try {
    localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
  } catch (error) {
    console.error("Failed to save API key to storage:", error);
  }
}

/**
 * Get OpenAI API key from localStorage
 */
export function getApiKeyFromStorage(): string | null {
  try {
    return localStorage.getItem(API_KEY_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to load API key from storage:", error);
    return null;
  }
}

/**
 * Delete OpenAI API key from localStorage
 */
export function deleteApiKeyFromStorage(): void {
  try {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to delete API key from storage:", error);
  }
}

// Chat History Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string; // ISO string for serialization
}

export interface ChatHistory {
  id: string;
  flowId: string;
  name: string;
  initialUserMessage: ChatMessage | null;
  initialResponses: Record<string, ChatMessage>;
  messages: Record<string, ChatMessage[]>;
  createdAt: string;
  updatedAt: string;
}

const CHAT_HISTORIES_KEY_PREFIX = "open-agent-builder-chat-histories";

/**
 * Get storage key for chat histories of a specific flow
 */
function getChatHistoriesKey(flowId: string): string {
  return `${CHAT_HISTORIES_KEY_PREFIX}-${flowId}`;
}

/**
 * Get all chat histories for a flow
 */
export function getChatHistoriesFromStorage(flowId: string): ChatHistory[] {
  try {
    const data = localStorage.getItem(getChatHistoriesKey(flowId));
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load chat histories from storage:", error);
    return [];
  }
}

/**
 * Save a chat history to localStorage
 */
export function saveChatHistoryToStorage(history: ChatHistory): void {
  try {
    const histories = getChatHistoriesFromStorage(history.flowId);
    const existingIndex = histories.findIndex((h) => h.id === history.id);
    
    if (existingIndex >= 0) {
      histories[existingIndex] = history;
    } else {
      histories.push(history);
    }
    
    // Sort by updatedAt descending (most recent first)
    histories.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    
    localStorage.setItem(getChatHistoriesKey(history.flowId), JSON.stringify(histories));
  } catch (error) {
    console.error("Failed to save chat history to storage:", error);
  }
}

/**
 * Delete a chat history from localStorage
 */
export function deleteChatHistoryFromStorage(flowId: string, historyId: string): void {
  try {
    const histories = getChatHistoriesFromStorage(flowId);
    const filtered = histories.filter((h) => h.id !== historyId);
    localStorage.setItem(getChatHistoriesKey(flowId), JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to delete chat history from storage:", error);
  }
}

