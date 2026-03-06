export type Message = {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  nodeIds: string[];
  autoMapped: boolean;
  assignedManually: boolean;
};

export type NodeMeta = {
  firstDiscussed?: string;
  lastActive?: string;
  totalMessages?: number;
};

export type MapNodeData = {
  id: string;
  title: string;
  parentId: string | null;
  summary: string;
  metadata: NodeMeta;
  decisions?: string[];
  supportingMessageIds: string[];
  childrenIds: string[];
  depth: number;
};

export type AssignmentLog = {
  messageId: string;
  nodeId: string | null;
  mode: 'auto' | 'manual' | 'unassigned';
  at: string;
};
