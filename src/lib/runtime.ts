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

  // GPT-5 models use max_completion_tokens instead of max_tokens
  // GPT-5 models only support default temperature (1), so we don't include it
  const isGPT5 = model.startsWith('gpt-5');
  const requestBody: Record<string, unknown> = {
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]
  };

  if (isGPT5) {
    requestBody.max_completion_tokens = maxTokens;
  } else {
    requestBody.max_tokens = maxTokens;
    requestBody.temperature = temperature;
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'API call failed');
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || 'No response';
}

/**
 * Streams OpenAI API response with Server-Sent Events
 */
async function streamOpenAI(
  model: string,
  systemPrompt: string,
  userPrompt: string,
  temperature: number,
  maxTokens: number,
  onChunk: (chunk: string) => void
): Promise<string> {
  // Get API key from localStorage or fallback to env variable
  const apiKey = getApiKeyFromStorage();

  if (!apiKey) {
    // Return a mock response for development
    const mockResponse = `[Mock response for ${model}]\n\nSystem: ${systemPrompt}\n\nUser: ${userPrompt}\n\nThis is a placeholder response. Please set your OpenAI API key in the settings dialog to enable real API calls.`;
    // Simulate streaming by sending chunks
    for (let i = 0; i < mockResponse.length; i += 10) {
      const chunk = mockResponse.slice(i, i + 10);
      onChunk(chunk);
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    return mockResponse;
  }

  // GPT-5 models use max_completion_tokens instead of max_tokens
  // GPT-5 models only support default temperature (1), so we don't include it
  const isGPT5 = model.startsWith('gpt-5');
  const requestBody: Record<string, unknown> = {
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    stream: true
  };

  if (isGPT5) {
    requestBody.max_completion_tokens = maxTokens;
  } else {
    requestBody.max_tokens = maxTokens;
    requestBody.temperature = temperature;
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'API call failed');
  }

  if (!response.body) {
    throw new Error('Response body is null');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullContent = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            continue;
          }

          try {
            const json = JSON.parse(data);
            const content = json.choices[0]?.delta?.content || '';
            if (content) {
              fullContent += content;
              onChunk(content);
            }
          } catch {
            // Ignore parse errors for incomplete JSON
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return fullContent;
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
 * Checks if an agent node is connected to an end node
 */
function isAgentConnectedToEnd(flow: Flow, agentId: string): boolean {
  return flow.edges.some(
    (edge) =>
      edge.sourceNodeId === agentId &&
      flow.nodes.some((n) => n.id === edge.targetNodeId && n.type === 'end')
  );
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
  const allAgentNodes = startEdges
    .map((edge) => flow.nodes.find((n) => n.id === edge.targetNodeId))
    .filter((n): n is AgentNode => n?.type === 'agent');

  // Only execute agents that are connected to end nodes
  const agentNodes = allAgentNodes.filter((agentNode) => isAgentConnectedToEnd(flow, agentNode.id));

  if (agentNodes.length === 0) {
    throw new Error('No agent nodes connected to start and end nodes');
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

/**
 * Executes a single agent with the given input
 */
export async function runAgent(
  agent: AgentNode,
  input: { prompt: string }
): Promise<AgentRunResult> {
  try {
    const output = await callOpenAI(
      agent.model,
      agent.systemPrompt,
      input.prompt,
      agent.temperature,
      agent.maxTokens
    );

    return {
      output,
      raw: {
        providerResponse: output
      }
    };
  } catch (error) {
    return {
      output: `Error: ${error instanceof Error ? error.message : String(error)}`,
      raw: {
        error: error instanceof Error ? error.message : String(error)
      }
    };
  }
}

/**
 * Streams a single agent execution with the given input
 * Calls onChunk for each chunk of the response as it arrives
 */
export async function streamAgent(
  agent: AgentNode,
  input: { prompt: string },
  onChunk: (chunk: string) => void
): Promise<AgentRunResult> {
  try {
    const output = await streamOpenAI(
      agent.model,
      agent.systemPrompt,
      input.prompt,
      agent.temperature,
      agent.maxTokens,
      onChunk
    );

    return {
      output,
      raw: {
        providerResponse: output
      }
    };
  } catch (error) {
    const errorMessage = `Error: ${error instanceof Error ? error.message : String(error)}`;
    onChunk(errorMessage);
    return {
      output: errorMessage,
      raw: {
        error: error instanceof Error ? error.message : String(error)
      }
    };
  }
}
