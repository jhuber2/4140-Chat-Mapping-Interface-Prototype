import type { FormEvent } from 'react';
import { useState } from 'react';
import type { MapNodeData } from '../types';
import { NodeFinderColumns, useNodeFinderState } from './nodeFinder';

type CreateTopicColumnPickerProps = {
  nodes: MapNodeData[];
  nodeById: Map<string, MapNodeData>;
  onCreateNode: (title: string, parentId: string) => void;
};

export function CreateTopicColumnPicker({ nodes, nodeById, onCreateNode }: CreateTopicColumnPickerProps) {
  const { path, setPath, columns, currentPath, selectedNode } = useNodeFinderState(nodes, nodeById, null);
  const [title, setTitle] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!selectedNode) return;
    const trimmed = title.trim();
    if (!trimmed) return;
    onCreateNode(trimmed, selectedNode.id);
    setTitle('');
  };

  return (
    <form className="create-topic-picker-form" onSubmit={handleSubmit}>
      <label className="create-topic-title-label">
        <span className="muted">New topic title</span>
        <input
          className="create-topic-title-input"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Enter a name for the new topic"
          aria-label="New topic title"
        />
      </label>

      <div className="create-topic-parent-block">
        <span className="muted create-topic-parent-label">Parent topic</span>
        <div className="operator-topic-tree create-topic-parent-shell">
          <NodeFinderColumns path={path} setPath={setPath} columns={columns} currentPath={currentPath} nodeById={nodeById} />
        </div>
      </div>

      <button type="submit" className="node-picker-done create-topic-submit" disabled={!selectedNode || !title.trim()}>
        Create topic
      </button>
    </form>
  );
}
