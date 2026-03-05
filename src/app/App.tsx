import { useState } from 'react';
import { NavigationBar } from './components/NavigationBar';
import { MindMapNode } from './components/MindMapNode';
import { MindMapConnector } from './components/MindMapConnector';
import { EmptyDetailPanel } from './components/EmptyDetailPanel';
import { BranchDetailPanel } from './components/BranchDetailPanel';
import { LeafDetailPanel } from './components/LeafDetailPanel';
import { MessagesModal } from './components/MessagesModal';

type NodeId = 
  | 'root' 
  | 'authQuestions' 
  | 'apiClarifications' 
  | 'uiFrontend' 
  | 'deployment' 
  | 'meeting' 
  | 'general'
  | 'errors401'
  | 'refreshToken'
  | 'logoutBehavior'
  | 'tokenMissing'
  | 'tokenExpiration';

export default function App() {
  const [selectedNode, setSelectedNode] = useState<NodeId | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<NodeId>>(new Set());
  const [isMessagesModalOpen, setIsMessagesModalOpen] = useState(false);

  // Node positions
  const nodes = {
    root: { x: 120, y: 380, width: 110, text: 'Dev Team' },
    
    // First level categories
    authQuestions: { x: 350, y: 150, width: 210, text: 'Authentication Questions' },
    apiClarifications: { x: 350, y: 250, width: 150, text: 'API Clarifications' },
    uiFrontend: { x: 350, y: 350, width: 200, text: 'UI & Frontend Adjustments' },
    deployment: { x: 350, y: 450, width: 260, text: 'Deployment & Environment Issues' },
    meeting: { x: 350, y: 550, width: 195, text: 'Meeting & Coordination' },
    general: { x: 350, y: 650, width: 165, text: 'General Conversation' },
    
    // Second level under Authentication Questions
    errors401: { x: 590, y: 100, width: 210, text: '401 Errors from Frontend' },
    refreshToken: { x: 590, y: 180, width: 225, text: 'Refresh Token Not Triggering' },
    logoutBehavior: { x: 590, y: 240, width: 230, text: 'Logout Behavior Inconsistency' },
    
    // Third level under 401 Errors
    tokenMissing: { x: 830, y: 80, width: 200, text: 'Token Missing in Headers' },
    tokenExpiration: { x: 830, y: 140, width: 240, text: 'Access Token Expiration Timing' },
  };

  // Define node hierarchy
  const nodeChildren: Record<NodeId, NodeId[]> = {
    root: ['authQuestions', 'apiClarifications', 'uiFrontend', 'deployment', 'meeting', 'general'],
    authQuestions: ['errors401', 'refreshToken', 'logoutBehavior'],
    errors401: ['tokenMissing', 'tokenExpiration'],
    apiClarifications: [],
    uiFrontend: [],
    deployment: [],
    meeting: [],
    general: [],
    refreshToken: [],
    logoutBehavior: [],
    tokenMissing: [],
    tokenExpiration: [],
  };

  const nodeParents: Record<NodeId, NodeId | null> = {
    root: null,
    authQuestions: 'root',
    apiClarifications: 'root',
    uiFrontend: 'root',
    deployment: 'root',
    meeting: 'root',
    general: 'root',
    errors401: 'authQuestions',
    refreshToken: 'authQuestions',
    logoutBehavior: 'authQuestions',
    tokenMissing: 'errors401',
    tokenExpiration: 'errors401',
  };

  const getConnectionPoints = (parent: typeof nodes.root, child: typeof nodes.root) => {
    return {
      x1: parent.x + parent.width,
      y1: parent.y + 20,
      x2: child.x,
      y2: child.y + 20,
    };
  };

  const handleNodeClick = (nodeId: NodeId) => {
    const children = nodeChildren[nodeId];
    const hasChildren = children.length > 0;

    if (hasChildren) {
      // Toggle expansion for branch nodes
      const newExpanded = new Set(expandedNodes);
      if (expandedNodes.has(nodeId)) {
        // Collapse this node and all its descendants
        const collapseRecursive = (id: NodeId) => {
          newExpanded.delete(id);
          nodeChildren[id].forEach(collapseRecursive);
        };
        collapseRecursive(nodeId);
      } else {
        // Expand this node and ensure parent path is expanded
        newExpanded.add(nodeId);
        let parent = nodeParents[nodeId];
        while (parent) {
          newExpanded.add(parent);
          parent = nodeParents[parent];
        }
      }
      setExpandedNodes(newExpanded);
    }
    
    // Always select the node
    setSelectedNode(nodeId);
  };

  const getNodeVariant = (nodeId: NodeId): 'root' | 'category' | 'standard' | 'selected' | 'path' => {
    if (selectedNode === nodeId) {
      return 'selected';
    }
    
    // Check if this node is in the path to the selected node
    if (selectedNode) {
      let current: NodeId | null = selectedNode;
      while (current) {
        if (nodeParents[current] === nodeId) {
          return 'path';
        }
        current = nodeParents[current];
      }
    }
    
    if (nodeId === 'root') {
      return 'root';
    }
    
    if (nodeParents[nodeId] === 'root') {
      return 'category';
    }
    
    return 'standard';
  };

  const isNodeVisible = (nodeId: NodeId): boolean => {
    if (nodeId === 'root') return true;
    
    const parent = nodeParents[nodeId];
    if (!parent) return true;
    
    // Node is visible if its parent is expanded
    return expandedNodes.has(parent);
  };

  const isConnectorActive = (parentId: NodeId, childId: NodeId): boolean => {
    if (!selectedNode) return false;
    
    // Check if both nodes are in the path to selected node
    let current: NodeId | null = selectedNode;
    const pathNodes = new Set<NodeId>();
    while (current) {
      pathNodes.add(current);
      current = nodeParents[current];
    }
    
    return pathNodes.has(parentId) && pathNodes.has(childId);
  };

  // Messages for different leaf nodes
  const tokenExpirationMessages = [
    {
      author: 'Jack',
      initials: 'J',
      avatarColor: '#2F6BFF',
      timestamp: 'Mar 3, 4:07 PM',
      content: 'Frontend is getting 401 errors again after login. Happens after ~15 min of inactivity.',
    },
    {
      author: 'Priya',
      initials: 'P',
      avatarColor: '#22C55E',
      timestamp: 'Mar 3, 4:12 PM',
      content: 'Yeah, I think the access token is expiring. Should we increase the lifetime or add refresh logic?',
    },
    {
      author: 'Alex',
      initials: 'A',
      avatarColor: '#F59E0B',
      timestamp: 'Mar 3, 4:18 PM',
      content: 'I can update it to 30 minutes and implement silent refresh before expiry.',
    },
    {
      author: 'Jack',
      initials: 'J',
      avatarColor: '#2F6BFF',
      timestamp: 'Mar 4, 9:22 AM',
      content: 'Works now, no more 401s after testing.',
    },
  ];

  const refreshTokenMessages = [
    {
      author: 'Sarah',
      initials: 'S',
      avatarColor: '#8B5CF6',
      timestamp: 'Mar 2, 2:15 PM',
      content: 'Users are getting logged out even though their session should still be valid. Looks like refresh token isn\'t being called.',
    },
    {
      author: 'Jack',
      initials: 'J',
      avatarColor: '#2F6BFF',
      timestamp: 'Mar 2, 2:34 PM',
      content: 'Checked the interceptor - it\'s not catching the token expiry event properly.',
    },
    {
      author: 'Priya',
      initials: 'P',
      avatarColor: '#22C55E',
      timestamp: 'Mar 2, 3:02 PM',
      content: 'We need to add a listener that triggers refresh 2 minutes before the access token expires, not after.',
    },
    {
      author: 'Sarah',
      initials: 'S',
      avatarColor: '#8B5CF6',
      timestamp: 'Mar 2, 4:45 PM',
      content: 'Added the proactive refresh logic. Testing now and it looks good!',
    },
  ];

  const renderDetailPanel = () => {
    if (!selectedNode) {
      return null;
    }

    switch (selectedNode) {
      case 'authQuestions':
        return (
          <BranchDetailPanel
            title="Authentication Questions"
            summary="Collection of all authentication-related issues and questions discussed by the team."
            firstDiscussed="Mar 1, 2023"
            lastActive="Mar 6, 2023"
            totalMessages={47}
          />
        );
      
      case 'errors401':
        return (
          <BranchDetailPanel
            title="401 Errors from Frontend"
            summary="Users experiencing unauthorized errors when making API requests after being logged in for some time."
            firstDiscussed="Mar 3, 2023"
            lastActive="Mar 5, 2023"
            totalMessages={19}
          />
        );
      
      case 'refreshToken':
        return (
          <LeafDetailPanel
            title="Refresh Token Not Triggering"
            summary="The refresh token mechanism was failing to trigger before access token expiration, causing users to be logged out unexpectedly."
            decisions={[
              'Add listener for token expiration events',
              'Implement proactive refresh 2 minutes before expiry',
              'Add error handling for failed refresh attempts',
            ]}
            onViewMessages={() => setIsMessagesModalOpen(true)}
          />
        );
      
      case 'tokenExpiration':
        return (
          <LeafDetailPanel
            title="Access Token Expiration Timing"
            summary="Team identified 401 errors were caused by access tokens expiring after 15 minutes without silent refresh."
            decisions={[
              'Increase access token lifetime to 30 minutes',
              'Implement automatic refresh before expiry',
            ]}
            onViewMessages={() => setIsMessagesModalOpen(true)}
          />
        );
      
      default:
        return null;
    }
  };

  const getMessagesForSelectedNode = () => {
    if (selectedNode === 'refreshToken') {
      return refreshTokenMessages;
    }
    return tokenExpirationMessages;
  };

  return (
    <div 
      className="w-[1440px] h-[900px] mx-auto"
      style={{
        background: 'linear-gradient(135deg, #0D1626 0%, #0F1C33 100%)',
        position: 'relative',
      }}
    >
      {/* Vignette Overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.2) 100%)',
        }}
      />

      {/* Navigation Bar */}
      <NavigationBar />

      {/* Main Content Area */}
      <div className="relative h-[828px]">
        {/* SVG Connectors */}
        <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
          {/* Root to first level */}
          <MindMapConnector 
            {...getConnectionPoints(nodes.root, nodes.authQuestions)} 
            isActive={isConnectorActive('root', 'authQuestions')}
          />
          <MindMapConnector {...getConnectionPoints(nodes.root, nodes.apiClarifications)} />
          <MindMapConnector {...getConnectionPoints(nodes.root, nodes.uiFrontend)} />
          <MindMapConnector {...getConnectionPoints(nodes.root, nodes.deployment)} />
          <MindMapConnector {...getConnectionPoints(nodes.root, nodes.meeting)} />
          <MindMapConnector {...getConnectionPoints(nodes.root, nodes.general)} />
          
          {/* Auth Questions to second level */}
          {isNodeVisible('errors401') && (
            <MindMapConnector 
              {...getConnectionPoints(nodes.authQuestions, nodes.errors401)} 
              isActive={isConnectorActive('authQuestions', 'errors401')}
            />
          )}
          {isNodeVisible('refreshToken') && (
            <MindMapConnector 
              {...getConnectionPoints(nodes.authQuestions, nodes.refreshToken)} 
              isActive={isConnectorActive('authQuestions', 'refreshToken')}
            />
          )}
          {isNodeVisible('logoutBehavior') && (
            <MindMapConnector {...getConnectionPoints(nodes.authQuestions, nodes.logoutBehavior)} />
          )}
          
          {/* 401 Errors to third level */}
          {isNodeVisible('tokenMissing') && (
            <MindMapConnector {...getConnectionPoints(nodes.errors401, nodes.tokenMissing)} />
          )}
          {isNodeVisible('tokenExpiration') && (
            <MindMapConnector 
              {...getConnectionPoints(nodes.errors401, nodes.tokenExpiration)} 
              isActive={isConnectorActive('errors401', 'tokenExpiration')}
            />
          )}
        </svg>

        {/* Nodes */}
        <MindMapNode 
          id="root" 
          text={nodes.root.text} 
          variant={getNodeVariant('root')} 
          x={nodes.root.x} 
          y={nodes.root.y}
          onClick={() => handleNodeClick('root')}
        />
        
        {/* First level */}
        <MindMapNode 
          id="authQuestions" 
          text={nodes.authQuestions.text} 
          variant={getNodeVariant('authQuestions')} 
          x={nodes.authQuestions.x} 
          y={nodes.authQuestions.y}
          onClick={() => handleNodeClick('authQuestions')}
        />
        <MindMapNode 
          id="apiClarifications" 
          text={nodes.apiClarifications.text} 
          variant={getNodeVariant('apiClarifications')} 
          x={nodes.apiClarifications.x} 
          y={nodes.apiClarifications.y}
          onClick={() => handleNodeClick('apiClarifications')}
        />
        <MindMapNode 
          id="uiFrontend" 
          text={nodes.uiFrontend.text} 
          variant={getNodeVariant('uiFrontend')} 
          x={nodes.uiFrontend.x} 
          y={nodes.uiFrontend.y}
          onClick={() => handleNodeClick('uiFrontend')}
        />
        <MindMapNode 
          id="deployment" 
          text={nodes.deployment.text} 
          variant={getNodeVariant('deployment')} 
          x={nodes.deployment.x} 
          y={nodes.deployment.y}
          onClick={() => handleNodeClick('deployment')}
        />
        <MindMapNode 
          id="meeting" 
          text={nodes.meeting.text} 
          variant={getNodeVariant('meeting')} 
          x={nodes.meeting.x} 
          y={nodes.meeting.y}
          onClick={() => handleNodeClick('meeting')}
        />
        <MindMapNode 
          id="general" 
          text={nodes.general.text} 
          variant={getNodeVariant('general')} 
          x={nodes.general.x} 
          y={nodes.general.y}
          onClick={() => handleNodeClick('general')}
        />
        
        {/* Second level under Auth Questions */}
        {isNodeVisible('errors401') && (
          <MindMapNode 
            id="errors401" 
            text={nodes.errors401.text} 
            variant={getNodeVariant('errors401')} 
            x={nodes.errors401.x} 
            y={nodes.errors401.y}
            onClick={() => handleNodeClick('errors401')}
          />
        )}
        {isNodeVisible('refreshToken') && (
          <MindMapNode 
            id="refreshToken" 
            text={nodes.refreshToken.text} 
            variant={getNodeVariant('refreshToken')} 
            x={nodes.refreshToken.x} 
            y={nodes.refreshToken.y}
            onClick={() => handleNodeClick('refreshToken')}
          />
        )}
        {isNodeVisible('logoutBehavior') && (
          <MindMapNode 
            id="logoutBehavior" 
            text={nodes.logoutBehavior.text} 
            variant={getNodeVariant('logoutBehavior')} 
            x={nodes.logoutBehavior.x} 
            y={nodes.logoutBehavior.y}
            onClick={() => handleNodeClick('logoutBehavior')}
          />
        )}
        
        {/* Third level under 401 Errors */}
        {isNodeVisible('tokenMissing') && (
          <MindMapNode 
            id="tokenMissing" 
            text={nodes.tokenMissing.text} 
            variant={getNodeVariant('tokenMissing')} 
            x={nodes.tokenMissing.x} 
            y={nodes.tokenMissing.y}
            onClick={() => handleNodeClick('tokenMissing')}
          />
        )}
        {isNodeVisible('tokenExpiration') && (
          <MindMapNode 
            id="tokenExpiration" 
            text={nodes.tokenExpiration.text} 
            variant={getNodeVariant('tokenExpiration')} 
            x={nodes.tokenExpiration.x} 
            y={nodes.tokenExpiration.y}
            onClick={() => handleNodeClick('tokenExpiration')}
          />
        )}

        {/* Detail Panel */}
        {renderDetailPanel()}
      </div>

      {/* Messages Modal */}
      <MessagesModal 
        isOpen={isMessagesModalOpen} 
        onClose={() => setIsMessagesModalOpen(false)}
        messages={getMessagesForSelectedNode()}
      />
    </div>
  );
}
