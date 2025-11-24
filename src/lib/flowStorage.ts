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

