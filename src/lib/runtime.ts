import type { Flow, FlowRunResult, AgentNode, StartNode, AgentRunResult } from '@/types/flow';
import { getApiKeyFromStorage } from './flowStorage';

// Simple OpenAI adapter (can be swapped later)
async function callOpenAI(
  model: string,
  systemPrompt: string,
  userPrompt: string,
  temperature: number,
  maxTokens: number
): Promise<string> {
  // Get API key from localStorage or fallback to env variable
  const apiKey = getApiKeyFromStorage();

  if (!apiKey) {
    // Return a mock response for development
    return `[Mock response for ${model}]\n\nSystem: ${systemPrompt}\n\nUser: ${userPrompt}\n\nThis is a placeholder response. Please set your OpenAI API key in the settings dialog to enable real API calls.`;
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature,
      max_tokens: maxTokens
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'API call failed');
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || 'No response';
}

/**
 * Validates a flow structure
 */
export function validateFlow(flow: Flow): { valid: boolean; error?: string } {
  const startNodes = flow.nodes.filter((n) => n.type === 'start');
  if (startNodes.length === 0) {
    return { valid: false, error: 'Flow must have exactly one Start node' };
  }
  if (startNodes.length > 1) {
    return { valid: false, error: 'Flow can only have one Start node' };
  }

  const agentNodes = flow.nodes.filter((n) => n.type === 'agent');
  if (agentNodes.length === 0) {
    return { valid: false, error: 'Flow must have at least one Agent node' };
  }

  // Check that all agents are reachable from start
  const startNode = startNodes[0];
  const reachableAgentIds = new Set<string>();
  const startEdges = flow.edges.filter((e) => e.sourceNodeId === startNode.id);
  startEdges.forEach((edge) => {
    const targetNode = flow.nodes.find((n) => n.id === edge.targetNodeId);
    if (targetNode?.type === 'agent') {
      reachableAgentIds.add(targetNode.id);
    }
  });

  if (reachableAgentIds.size === 0) {
    return {
      valid: false,
      error: 'At least one Agent node must be connected to the Start node'
    };
  }

  return { valid: true };
}

/**
 * Executes a flow with the given input
 */
export async function runFlow(flow: Flow, input: { prompt: string }): Promise<FlowRunResult> {
  const validation = validateFlow(flow);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid flow');
  }

  const startNode = flow.nodes.find((n) => n.type === 'start') as StartNode;
  if (!startNode) {
    throw new Error('Start node not found');
  }

  // Find all agents connected directly to start
  const startEdges = flow.edges.filter((e) => e.sourceNodeId === startNode.id);
  const agentNodes = startEdges
    .map((edge) => flow.nodes.find((n) => n.id === edge.targetNodeId))
    .filter((n): n is AgentNode => n?.type === 'agent');

  if (agentNodes.length === 0) {
    throw new Error('No agent nodes connected to start');
  }

  // Execute all agents in parallel
  const runId = crypto.randomUUID();
  const agentPromises = agentNodes.map(async (agentNode) => {
    try {
      const output = await callOpenAI(
        agentNode.model,
        agentNode.systemPrompt,
        input.prompt,
        agentNode.temperature,
        agentNode.maxTokens
      );

      return {
        agentId: agentNode.id,
        result: {
          output,
          raw: {
            providerResponse: output
          }
        }
      };
    } catch (error) {
      return {
        agentId: agentNode.id,
        result: {
          output: `Error: ${error instanceof Error ? error.message : String(error)}`,
          raw: {
            error: error instanceof Error ? error.message : String(error)
          }
        }
      };
    }
  });

  const results = await Promise.all(agentPromises);
  const agents: Record<string, AgentRunResult> = {};
  results.forEach(({ agentId, result }) => {
    agents[agentId] = result;
  });

  return {
    runId,
    agents
  };
}
