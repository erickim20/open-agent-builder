import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { streamAgent } from '@/lib/runtime';
import type { Flow, AgentNode } from '@/types/flow';
import { Send, ChevronDown, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface PreviewChatPanelProps {
  flow: Flow;
  onNodeSelect: (nodeId: string | null) => void;
  onStreamingAgentsChange?: (agentIds: Set<string>) => void;
}

/**
 * Gets all agent nodes that are connected to end nodes
 */
function getConnectedAgents(flow: Flow): AgentNode[] {
  const startNode = flow.nodes.find((n) => n.type === 'start');
  if (!startNode) return [];

  // Find agents connected to start
  const startEdges = flow.edges.filter((e) => e.sourceNodeId === startNode.id);
  const agentNodes = startEdges
    .map((edge) => flow.nodes.find((n) => n.id === edge.targetNodeId))
    .filter((n): n is AgentNode => n?.type === 'agent');

  // Filter to only agents connected to end nodes
  return agentNodes.filter((agentNode) => {
    return flow.edges.some(
      (edge) =>
        edge.sourceNodeId === agentNode.id &&
        flow.nodes.some((n) => n.id === edge.targetNodeId && n.type === 'end')
    );
  });
}

export function PreviewChatPanel({ flow, onStreamingAgentsChange }: PreviewChatPanelProps) {
  const connectedAgents = useMemo(() => getConnectedAgents(flow), [flow]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(
    connectedAgents.length > 0 ? connectedAgents[0].id : null
  );
  // Shared initial message (first user message)
  const [initialUserMessage, setInitialUserMessage] = useState<Message | null>(null);
  // Agent-specific responses to the initial message
  const [initialResponses, setInitialResponses] = useState<Record<string, Message>>({});
  // Agent-specific messages after the initial exchange
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sendToAllAgents, setSendToAllAgents] = useState(true);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [streamingAgentIds, setStreamingAgentIds] = useState<Set<string>>(new Set());
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Notify parent of streaming agents changes
  useEffect(() => {
    onStreamingAgentsChange?.(streamingAgentIds);
  }, [streamingAgentIds, onStreamingAgentsChange]);

  // Auto-scroll to bottom when new messages arrive (including during streaming)
  useEffect(() => {
    if (scrollAreaRef.current && selectedAgentId) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        '[data-radix-scroll-area-viewport]'
      );
      if (scrollContainer) {
        // Use requestAnimationFrame for smooth scrolling during streaming
        requestAnimationFrame(() => {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        });
      }
    }
  }, [messages, initialUserMessage, initialResponses, selectedAgentId]);

  // Update selected agent when agents change
  useEffect(() => {
    if (connectedAgents.length > 0 && !selectedAgentId) {
      setSelectedAgentId(connectedAgents[0].id);
    } else if (selectedAgentId && !connectedAgents.find((a) => a.id === selectedAgentId)) {
      setSelectedAgentId(connectedAgents.length > 0 ? connectedAgents[0].id : null);
    }
  }, [connectedAgents, selectedAgentId]);

  const handleSendMessage = useCallback(async () => {
    if (!selectedAgentId || !inputValue.trim() || isLoading) return;

    const agent = connectedAgents.find((a) => a.id === selectedAgentId);
    if (!agent) return;

    const messageContent = inputValue.trim();
    const isInitialMessage = initialUserMessage === null;

    if (sendToAllAgents) {
      // User wants to send to all agents
      if (isInitialMessage) {
        // Set as shared initial message only if it's the first message
        const userMessage: Message = {
          id: crypto.randomUUID(),
          role: 'user',
          content: messageContent,
          timestamp: new Date()
        };
        setInitialUserMessage(userMessage);
      } else {
        // Add user message to all agents' message arrays
        const userMessage: Message = {
          id: crypto.randomUUID(),
          role: 'user',
          content: messageContent,
          timestamp: new Date()
        };
        setMessages((prev) => {
          const updated = { ...prev };
          connectedAgents.forEach((a) => {
            updated[a.id] = [...(updated[a.id] || []), userMessage];
          });
          return updated;
        });
      }

      setInputValue('');
      setIsLoading(true);

      // Create assistant messages for all agents with empty content initially
      const assistantMessageIds: Record<string, string> = {};
      connectedAgents.forEach((a) => {
        assistantMessageIds[a.id] = crypto.randomUUID();
      });

      // Mark all agents as streaming
      setStreamingAgentIds((prev) => {
        const updated = new Set(prev);
        connectedAgents.forEach((a) => updated.add(a.id));
        return updated;
      });

      if (isInitialMessage) {
        // Create initial responses with empty content
        const responses: Record<string, Message> = {};
        connectedAgents.forEach((a) => {
          responses[a.id] = {
            id: assistantMessageIds[a.id],
            role: 'assistant',
            content: '',
            timestamp: new Date()
          };
        });
        setInitialResponses(responses);
      } else {
        // Add empty assistant messages to each agent's message array
        setMessages((prev) => {
          const updated = { ...prev };
          connectedAgents.forEach((a) => {
            updated[a.id] = [
              ...(updated[a.id] || []),
              {
                id: assistantMessageIds[a.id],
                role: 'assistant' as const,
                content: '',
                timestamp: new Date()
              }
            ];
          });
          return updated;
        });
      }

      // Stream to all agents in parallel
      const agentPromises = connectedAgents.map(async (a) => {
        try {
          await streamAgent(a, { prompt: messageContent }, (chunk: string) => {
            // Update the message content as chunks arrive
            if (isInitialMessage) {
              setInitialResponses((prev) => {
                const current = prev[a.id];
                if (!current) return prev;
                return {
                  ...prev,
                  [a.id]: {
                    ...current,
                    content: current.content + chunk
                  }
                };
              });
            } else {
              setMessages((prev) => {
                const agentMessages = prev[a.id] || [];
                const updatedMessages = agentMessages.map((msg) =>
                  msg.id === assistantMessageIds[a.id]
                    ? { ...msg, content: msg.content + chunk }
                    : msg
                );
                return {
                  ...prev,
                  [a.id]: updatedMessages
                };
              });
            }
          });
          // Remove agent from streaming set when done
          setStreamingAgentIds((prev) => {
            const updated = new Set(prev);
            updated.delete(a.id);
            return updated;
          });
          return { agentId: a.id, success: true };
        } catch (error) {
          const errorMessage = `Error: ${error instanceof Error ? error.message : 'Failed to get response'}`;
          // Update the message with error
          if (isInitialMessage) {
            setInitialResponses((prev) => {
              const current = prev[a.id];
              if (!current) return prev;
              return {
                ...prev,
                [a.id]: {
                  ...current,
                  content: errorMessage
                }
              };
            });
          } else {
            setMessages((prev) => {
              const agentMessages = prev[a.id] || [];
              const updatedMessages = agentMessages.map((msg) =>
                msg.id === assistantMessageIds[a.id] ? { ...msg, content: errorMessage } : msg
              );
              return {
                ...prev,
                [a.id]: updatedMessages
              };
            });
          }
          // Remove agent from streaming set on error
          setStreamingAgentIds((prev) => {
            const updated = new Set(prev);
            updated.delete(a.id);
            return updated;
          });
          return { agentId: a.id, success: false };
        }
      });

      try {
        await Promise.all(agentPromises);
      } catch {
        toast.error('Failed to get responses from some agents');
      } finally {
        setIsLoading(false);
        textareaRef.current?.focus();
      }
    } else {
      // This is a follow-up message - agent-specific only
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: messageContent,
        timestamp: new Date()
      };

      setMessages((prev) => ({
        ...prev,
        [selectedAgentId]: [...(prev[selectedAgentId] || []), userMessage]
      }));

      setInputValue('');
      setIsLoading(true);

      // Create assistant message with empty content initially
      const assistantMessageId = crypto.randomUUID();
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date()
      };

      // Mark agent as streaming
      setStreamingAgentIds((prev) => new Set(prev).add(selectedAgentId));

      setMessages((prev) => ({
        ...prev,
        [selectedAgentId]: [...(prev[selectedAgentId] || []), assistantMessage]
      }));

      try {
        await streamAgent(agent, { prompt: messageContent }, (chunk: string) => {
          // Update the message content as chunks arrive
          setMessages((prev) => {
            const agentMessages = prev[selectedAgentId] || [];
            const updatedMessages = agentMessages.map((msg) =>
              msg.id === assistantMessageId ? { ...msg, content: msg.content + chunk } : msg
            );
            return {
              ...prev,
              [selectedAgentId]: updatedMessages
            };
          });
        });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to get response');
        const errorMessage = `Error: ${error instanceof Error ? error.message : 'Failed to get response'}`;
        // Update the message with error
        setMessages((prev) => {
          const agentMessages = prev[selectedAgentId] || [];
          const updatedMessages = agentMessages.map((msg) =>
            msg.id === assistantMessageId ? { ...msg, content: errorMessage } : msg
          );
          return {
            ...prev,
            [selectedAgentId]: updatedMessages
          };
        });
      } finally {
        // Remove agent from streaming set
        setStreamingAgentIds((prev) => {
          const updated = new Set(prev);
          updated.delete(selectedAgentId);
          return updated;
        });
        setIsLoading(false);
        textareaRef.current?.focus();
      }
    }
  }, [
    selectedAgentId,
    inputValue,
    isLoading,
    connectedAgents,
    initialUserMessage,
    sendToAllAgents
  ]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  const handleCopyMessage = useCallback(async (messageContent: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(messageContent);
      setCopiedMessageId(messageId);
      toast.success('Message copied to clipboard');
      setTimeout(() => {
        setCopiedMessageId(null);
      }, 2000);
    } catch {
      toast.error('Failed to copy message');
    }
  }, []);

  if (connectedAgents.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <div className="text-muted-foreground">
          <p className="mb-2 text-sm font-medium">No agents available</p>
          <p className="text-xs">
            Connect at least one Agent node to the Start node and an End node to preview.
          </p>
        </div>
      </div>
    );
  }

  const selectedAgent = connectedAgents.find((a) => a.id === selectedAgentId);
  const agentMessages = selectedAgentId ? messages[selectedAgentId] || [] : [];
  const initialResponse = selectedAgentId ? initialResponses[selectedAgentId] : undefined;

  // Combine initial message (if exists) with agent-specific messages
  const allMessages: Message[] = [];
  if (initialUserMessage) {
    allMessages.push(initialUserMessage);
    if (initialResponse) {
      allMessages.push(initialResponse);
    }
  }
  allMessages.push(...agentMessages);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg bg-card">
      <div className="p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="justify-between"
              disabled={connectedAgents.length === 0}
            >
              <span>{selectedAgent?.label || 'Select agent'}</span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48">
            {connectedAgents.map((agent) => (
              <DropdownMenuItem
                key={agent.id}
                onClick={() => setSelectedAgentId(agent.id)}
                className={cn(selectedAgentId === agent.id && 'bg-muted')}
              >
                {agent.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="relative flex flex-1 flex-col overflow-hidden">
        <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 h-4 bg-gradient-to-b from-card to-transparent" />
        <ScrollArea ref={scrollAreaRef} className="flex-1 px-4">
          <div className="space-y-4 py-4 pb-40">
            {allMessages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                <div className="text-muted-foreground">
                  <p className="mb-2 text-sm font-medium">Preview your agent</p>
                  <p className="text-xs">Prompt the agent as if you&apos;re the user.</p>
                </div>
              </div>
            ) : (
              <TooltipProvider>
                {allMessages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      'flex w-full',
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        'group relative flex max-w-[80%] items-start gap-2 rounded-lg px-4 py-4',
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      )}
                    >
                      <div className="flex-1 whitespace-pre-wrap text-sm">
                        {message.content}
                        {message.role === 'assistant' &&
                          selectedAgentId &&
                          streamingAgentIds.has(selectedAgentId) && (
                            <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-current align-middle" />
                          )}
                      </div>
                      {message.role === 'assistant' && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={cn(
                                'h-6 w-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100',
                                message.role === 'assistant' &&
                                  'text-foreground hover:bg-muted-foreground/10'
                              )}
                              onClick={() => handleCopyMessage(message.content, message.id)}
                            >
                              {copiedMessageId === message.id ? (
                                <Check className="h-3.5 w-3.5" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{copiedMessageId === message.id ? 'Copied!' : 'Copy message'}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                ))}
              </TooltipProvider>
            )}
          </div>
        </ScrollArea>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background to-transparent">
          <div className="z-10 mx-4 mb-4 flex flex-col gap-2 rounded-xl border bg-card p-2 shadow-xl">
            <div className="flex items-center gap-2 px-1">
              <Switch
                id="send-to-all"
                size="sm"
                checked={sendToAllAgents}
                onCheckedChange={setSendToAllAgents}
                disabled={isLoading}
              />
              <Label htmlFor="send-to-all" className="cursor-pointer text-xs text-muted-foreground">
                Send to all agents
              </Label>
            </div>
            <div className="flex items-end gap-2">
              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Send a message..."
                rows={1}
                className="max-h-32 resize-none bg-transparent"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                variant={'default'}
                disabled={!inputValue.trim() || isLoading}
                className="h-8 w-8 shrink-0 rounded-lg"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
