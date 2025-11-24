import { StartNode } from './StartNode';
import { AgentNode } from './AgentNode';
import { EndNode } from './EndNode';
import { NotesNode } from './NotesNode';

export const nodeTypes = {
  start: StartNode,
  agent: AgentNode,
  end: EndNode,
  notes: NotesNode
};
