import { useMemo } from 'react';
import type { MapNodeData } from '../types';
import { GENERAL_TOPIC_NODE_ID, ROOT_TEAM_NODE_ID } from '../mockData';
import { NodeFinderColumns, useNodeFinderState } from './nodeFinder';

type DeleteTopicColumnPickerProps = {
  nodes: MapNodeData[];
  nodeById: Map<string, MapNodeData>;
  onDeleteNode: (nodeId: string) => void;
};

export function DeleteTopicColumnPicker({ nodes, nodeById, onDeleteNode }: DeleteTopicColumnPickerProps) {
  const { path, setPath, columns, currentPath, selectedNode } = useNodeFinderState(nodes, nodeById, null);

  const canDelete = useMemo(() => {
    if (!selectedNode) return false;
    if (selectedNode.id === GENERAL_TOPIC_NODE_ID || selectedNode.id === ROOT_TEAM_NODE_ID) return false;
    return true;
  }, [selectedNode]);

  const handleDelete = () => {
    if (!selectedNode || !canDelete) return;
    const title = selectedNode.title;
    if (!window.confirm(`Delete topic "${title}" and all of its subtopics? Messages in those topics will move to General.`)) return;
    onDeleteNode(selectedNode.id);
    setPath([]);
  };

  return (
    <div className="create-topic-picker-form delete-topic-picker">
      <div className="create-topic-parent-block">
        <span className="muted create-topic-parent-label">Topic to delete</span>
        <div className="operator-topic-tree create-topic-parent-shell">
          <NodeFinderColumns path={path} setPath={setPath} columns={columns} currentPath={currentPath} nodeById={nodeById} />
        </div>
      </div>
      <button type="button" className="node-picker-done delete-topic-button" disabled={!canDelete} onClick={handleDelete}>
        Delete topic
      </button>
    </div>
  );
}
