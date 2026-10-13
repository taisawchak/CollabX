import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  MessageSquare,
  Send,
  Paperclip,
  Download,
  Users,
  Search,
  Check,
  Archive,
  ArrowLeft,
  User as UserIcon,
  Plus,
  FolderKanban,
  CheckCheck,
  X,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User, Project, Message } from '../../types';

interface ProjectDiscussionPageProps {
  projectId?: string;
  initialUserId?: string;
  initialProjectId?: string;
  navigate: (path: string) => void;
}

export const ProjectDiscussionPage: React.FC<ProjectDiscussionPageProps> = ({
  projectId,
  initialUserId,
  initialProjectId,
  navigate,
}) => {
  const {
    projects,
    messages,
    sendMessage,
    currentUser,
    users,
    members,
    showToast,
    markConversationAsRead,
  } = useApp();

  if (!currentUser) {
    return null;
  }

  // Determine active project or user from props/query
  const defaultProjectId = projectId || initialProjectId;

  // Conversations state
  const [activeTab, setActiveTab] = useState<'all' | 'direct' | 'projects'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversationId, setSelectedConversationId] = useState<string>(() => {
    if (initialUserId) {
      return ['dm', ...[currentUser.id, initialUserId].sort()].join('_');
    }
    if (defaultProjectId) {
      return defaultProjectId;
    }
    return '';
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: string; type: string } | null>(null);
  const [isNewDirectModalOpen, setIsNewDirectModalOpen] = useState(false);
  const [newDirectSearch, setNewDirectSearch] = useState('');
  const [showMembersDrawer, setShowMembersDrawer] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // 1. Compute Projects the user is authorized to participate in
  const authorizedProjects = useMemo(() => {
    return projects.filter((p) => {
      if (currentUser.role === 'admin') return true;
      if (p.supervisor.id === currentUser.id) return true;
      if (members.some((m) => m.projectId === p.id && m.userId === currentUser.id)) return true;
      return false;
    });
  }, [projects, members, currentUser]);

  // Fallback if user has no projects yet
  const availableProjects = authorizedProjects.length > 0 ? authorizedProjects : projects.slice(0, 3);

  // 2. Compute Direct Conversations for current user
  const directConversations = useMemo(() => {
    const map = new Map<string, { otherUser: User; messages: Message[]; lastMessage?: Message; unreadCount: number }>();

    // Scan all messages where currentUser is sender or recipient
    messages.forEach((msg) => {
      const isDirect =
        Boolean(msg.recipientId) ||
        (msg.conversationId && msg.conversationId.startsWith('dm_')) ||
        (!msg.projectId && msg.senderId && msg.recipientId);

      if (!isDirect) return;

      const isSender = msg.senderId === currentUser.id;
      const otherId = isSender ? msg.recipientId : msg.senderId;

      if (!otherId || otherId === currentUser.id) return;

      const otherUser = users.find((u) => u.id === otherId) || {
        id: otherId,
        name: isSender ? msg.recipientName || 'Collaborator' : msg.senderName,
        email: '',
        role: 'student' as const,
        department: 'Academic Collaboration',
        institution: 'CollabX University',
        headline: 'Collaborator',
        bio: '',
        avatar: isSender ? msg.recipientAvatar || '' : msg.senderAvatar,
        skills: [],
        interests: [],
        links: {},
        status: 'active' as const,
        createdAt: '',
      };

      const convKey = ['dm', ...[currentUser.id, otherId].sort()].join('_');

      if (!map.has(convKey)) {
        map.set(convKey, {
          otherUser,
          messages: [],
          unreadCount: 0,
        });
      }

      const item = map.get(convKey)!;
      item.messages.push(msg);
      if (!msg.isRead && msg.recipientId === currentUser.id) {
        item.unreadCount += 1;
      }
    });

    // If an initialUserId was supplied in URL (e.g. from clicking Message on Profile), ensure it exists in map
    if (initialUserId && initialUserId !== currentUser.id) {
      const convKey = ['dm', ...[currentUser.id, initialUserId].sort()].join('_');
      if (!map.has(convKey)) {
        const targetUser = users.find((u) => u.id === initialUserId);
        if (targetUser) {
          map.set(convKey, {
            otherUser: targetUser,
            messages: [],
            unreadCount: 0,
          });
        }
      }
    }

    // Sort messages in each conversation by createdAt and find latest
    const list = Array.from(map.entries()).map(([convKey, data]) => {
      data.messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      return {
        id: convKey,
        type: 'direct' as const,
        otherUser: data.otherUser,
        messages: data.messages,
        lastMessage: data.messages[data.messages.length - 1],
        unreadCount: data.unreadCount,
      };
    });

    // Sort conversations by latest message timestamp
    list.sort((a, b) => {
      const timeA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const timeB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
      return timeB - timeA;
    });

    return list;
  }, [messages, currentUser, users, initialUserId]);

  // 3. Compute Project Conversations
  const projectConversations = useMemo(() => {
    return availableProjects.map((p) => {
      const projMessages = messages.filter(
        (m) => m.projectId === p.id || (m.conversationId === p.id && !m.conversationId.startsWith('dm_'))
      );
      projMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      const lastMessage = projMessages[projMessages.length - 1];
      const unreadCount = projMessages.filter(
        (m) => !m.isRead && m.senderId !== currentUser.id
      ).length;

      return {
        id: p.id,
        type: 'project' as const,
        project: p,
        messages: projMessages,
        lastMessage,
        unreadCount,
      };
    });
  }, [availableProjects, messages, currentUser]);

  // Set default selected conversation if not set or invalid
  useEffect(() => {
    if (initialUserId) {
      const key = ['dm', ...[currentUser.id, initialUserId].sort()].join('_');
      setSelectedConversationId(key);
      setActiveTab('direct');
      return;
    }
    if (defaultProjectId) {
      setSelectedConversationId(defaultProjectId);
      setActiveTab('projects');
      return;
    }
    if (!selectedConversationId) {
      if (projectConversations.length > 0) {
        setSelectedConversationId(projectConversations[0].id);
      } else if (directConversations.length > 0) {
        setSelectedConversationId(directConversations[0].id);
      }
    }
  }, [initialUserId, defaultProjectId, projectConversations, directConversations, selectedConversationId, currentUser]);

  // Active conversation determination
  const isDirectActive = selectedConversationId.startsWith('dm_');
  const activeDirectConv = isDirectActive
    ? directConversations.find((c) => c.id === selectedConversationId) || {
        id: selectedConversationId,
        type: 'direct' as const,
        otherUser:
          users.find((u) => u.id === selectedConversationId.split('_').find((id) => id !== 'dm' && id !== currentUser.id)) ||
          users[0],
        messages: messages.filter((m) => m.conversationId === selectedConversationId),
        unreadCount: 0,
      }
    : null;

  const activeProjectConv = !isDirectActive
    ? projectConversations.find((c) => c.id === selectedConversationId) || projectConversations[0]
    : null;

  // Check authorization for project discussion
  const isProjectAuthorized = useMemo(() => {
    if (!activeProjectConv) return true;
    if (currentUser.role === 'admin') return true;
    if (activeProjectConv.project.supervisor.id === currentUser.id) return true;
    return members.some((m) => m.projectId === activeProjectConv.project.id && m.userId === currentUser.id);
  }, [activeProjectConv, currentUser, members]);

  const activeMessages = useMemo(() => {
    if (isDirectActive) {
      return messages
        .filter((m) => m.conversationId === selectedConversationId)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (activeProjectConv) {
      if (!isProjectAuthorized) return [];
      return messages
        .filter(
          (m) =>
            m.projectId === activeProjectConv.id ||
            (m.conversationId === activeProjectConv.id && !m.conversationId.startsWith('dm_'))
        )
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
    return [];
  }, [isDirectActive, selectedConversationId, activeProjectConv, messages, isProjectAuthorized]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages.length, selectedConversationId]);

  // Mark active conversation as read
  useEffect(() => {
    if (selectedConversationId) {
      markConversationAsRead(selectedConversationId);
    }
  }, [selectedConversationId, activeMessages.length]);

  // Handlers
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputMessage.trim() && !selectedFile) || isSending) return;

    setIsSending(true);
    try {
      if (isDirectActive && activeDirectConv) {
        sendMessage(
          activeDirectConv.id,
          inputMessage.trim(),
          selectedFile
            ? {
                name: selectedFile.name,
                size: selectedFile.size,
                url: '#',
                type: selectedFile.type,
              }
            : undefined,
          {
            id: activeDirectConv.otherUser.id,
            name: activeDirectConv.otherUser.name,
            avatar: activeDirectConv.otherUser.avatar,
          }
        );
        showToast(`Message sent to ${activeDirectConv.otherUser.name}`, 'success');
      } else if (activeProjectConv) {
        sendMessage(
          activeProjectConv.id,
          inputMessage.trim(),
          selectedFile
            ? {
                name: selectedFile.name,
                size: selectedFile.size,
                url: '#',
                type: selectedFile.type,
              }
            : undefined
        );
        showToast('Message posted to project channel', 'success');
      }

      setInputMessage('');
      setSelectedFile(null);
    } finally {
      setIsSending(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        type: file.name.split('.').pop() || 'file',
      });
      showToast(`Attached ${file.name}`, 'info');
    }
  };

  const startDirectMessageWithUser = (targetUser: User) => {
    if (targetUser.id === currentUser.id) {
      showToast('You cannot start a direct conversation with yourself', 'warning');
      return;
    }
    const convKey = ['dm', ...[currentUser.id, targetUser.id].sort()].join('_');
    setSelectedConversationId(convKey);
    setActiveTab('direct');
    setIsNewDirectModalOpen(false);
  };

  // Filter conversations for left pane search
  const q = searchQuery.toLowerCase().trim();
  const filteredDirect = directConversations.filter(
    (c) =>
      c.otherUser.name.toLowerCase().includes(q) ||
      c.otherUser.department.toLowerCase().includes(q) ||
      (c.lastMessage && c.lastMessage.body.toLowerCase().includes(q))
  );

  const filteredProjects = projectConversations.filter(
    (c) =>
      c.project.title.toLowerCase().includes(q) ||
      c.project.areaName.toLowerCase().includes(q) ||
      (c.lastMessage && c.lastMessage.body.toLowerCase().includes(q))
  );

  const projectMembersList = activeProjectConv
    ? members.filter((m) => m.projectId === activeProjectConv.project.id)
    : [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-4">
      {/* Top Breadcrumb Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-3">
          {activeProjectConv ? (
            <button
              onClick={() => navigate(`/projects/${activeProjectConv.project.id}`)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B6BE6] hover:underline cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to {activeProjectConv.project.title}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#0B6BE6]" />
              <h1 className="font-extrabold text-base text-[#0B2A55]">Messages & Collaborative Discussions</h1>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold">
          {isDirectActive && activeDirectConv ? (
            <span>
              1-on-1 Direct Chat with{' '}
              <button
                onClick={() => navigate(`/u/${activeDirectConv.otherUser.id}`)}
                className="font-bold text-[#0B6BE6] hover:underline"
              >
                {activeDirectConv.otherUser.name}
              </button>
            </span>
          ) : activeProjectConv ? (
            <span>
              Project Workspace · {projectMembersList.length} members
            </span>
          ) : null}
        </div>
      </div>

      {/* 2-Pane Chat Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl border border-[#E3EAF3] shadow-xs overflow-hidden min-h-[700px]">
        {/* Left Pane: Unified Conversation List (4 Cols) */}
        <div className="lg:col-span-4 border-r border-[#E3EAF3] flex flex-col bg-[#F5F8FC]/50">
          {/* Header & Tabs */}
          <div className="p-4 border-b border-[#E3EAF3] space-y-3 bg-white">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-[#0B2A55] flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#0B6BE6]" />
                <span>Conversations</span>
              </h3>
              <button
                onClick={() => setIsNewDirectModalOpen(true)}
                className="p-1.5 bg-[#DCE6FB] hover:bg-blue-200 text-[#0B6BE6] rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                title="Start a new direct message"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Chat</span>
              </button>
            </div>

            {/* Search Box */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats, projects, researchers..."
                className="w-full bg-[#F5F8FC] border border-[#E3EAF3] text-xs pl-8 pr-3 py-2 rounded-xl text-[#0B2A55] focus:outline-hidden focus:border-[#0B6BE6]"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 pt-1">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 py-1.5 text-center text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-[#0B6BE6] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab('direct')}
                className={`flex-1 py-1.5 text-center text-[11px] font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                  activeTab === 'direct'
                    ? 'bg-[#0B6BE6] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>Direct</span>
                {directConversations.reduce((sum, c) => sum + c.unreadCount, 0) > 0 && (
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('projects')}
                className={`flex-1 py-1.5 text-center text-[11px] font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                  activeTab === 'projects'
                    ? 'bg-[#0B6BE6] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>Projects</span>
                {projectConversations.reduce((sum, c) => sum + c.unreadCount, 0) > 0 && (
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                )}
              </button>
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
            {/* Direct Conversations Section */}
            {(activeTab === 'all' || activeTab === 'direct') && (
              <div className="space-y-1">
                {activeTab === 'all' && filteredDirect.length > 0 && (
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Direct Messages
                  </div>
                )}
                {filteredDirect.map((conv) => {
                  const isSelected = selectedConversationId === conv.id;
                  return (
                    <div
                      key={conv.id}
                      onClick={() => setSelectedConversationId(conv.id)}
                      className={`flex items-start gap-3 p-3 rounded-2xl cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-white shadow-xs border border-blue-200 ring-1 ring-blue-100'
                          : 'hover:bg-white/80 border border-transparent'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <img
                          src={conv.otherUser.avatar}
                          alt={conv.otherUser.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200"
                        />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white absolute bottom-0 right-0" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-extrabold text-[#0B2A55] truncate">
                            {conv.otherUser.name}
                          </p>
                          {conv.lastMessage && (
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-1 mt-0.5">
                          <p className="text-[11px] text-slate-500 truncate">
                            {conv.lastMessage ? conv.lastMessage.body : conv.otherUser.headline || 'Start a conversation'}
                          </p>
                          {conv.unreadCount > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#E53935] text-white shrink-0">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Project Channels Section */}
            {(activeTab === 'all' || activeTab === 'projects') && (
              <div className="space-y-1 pt-1">
                {activeTab === 'all' && filteredProjects.length > 0 && (
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Project Group Channels
                  </div>
                )}
                {filteredProjects.map((pConv) => {
                  const isSelected = selectedConversationId === pConv.id;
                  return (
                    <div
                      key={pConv.id}
                      onClick={() => setSelectedConversationId(pConv.id)}
                      className={`flex items-start gap-3 p-3 rounded-2xl cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-white shadow-xs border border-blue-200 ring-1 ring-blue-100'
                          : 'hover:bg-white/80 border border-transparent'
                      }`}
                    >
                      <img
                        src={pConv.project.thumbnail}
                        alt={pConv.project.title}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-extrabold text-[#0B2A55] truncate">
                            {pConv.project.title}
                          </p>
                          {pConv.lastMessage && (
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {new Date(pConv.lastMessage.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-1 mt-0.5">
                          <p className="text-[11px] text-slate-500 truncate">
                            {pConv.lastMessage
                              ? `${pConv.lastMessage.senderName.split(' ')[0]}: ${pConv.lastMessage.body}`
                              : `${pConv.project.areaName} Group`}
                          </p>
                          {pConv.unreadCount > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#0B6BE6] text-white shrink-0">
                              {pConv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {filteredDirect.length === 0 && filteredProjects.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                <Search className="w-6 h-6 mx-auto text-slate-300" />
                <p>No conversations matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Active Chat Room (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col justify-between min-h-[600px]">
          {/* Room Header */}
          <div className="p-4 border-b border-[#E3EAF3] flex items-center justify-between bg-white">
            {isDirectActive && activeDirectConv ? (
              <div className="flex items-center gap-3 min-w-0">
                <div
                  onClick={() => navigate(`/u/${activeDirectConv.otherUser.id}`)}
                  className="cursor-pointer group flex items-center gap-3 min-w-0"
                >
                  <img
                    src={activeDirectConv.otherUser.avatar}
                    alt={activeDirectConv.otherUser.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 group-hover:scale-105 transition-transform"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-[#0B2A55] leading-snug group-hover:text-[#0B6BE6] transition-colors truncate">
                        {activeDirectConv.otherUser.name}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#DCE6FB] text-[#0B6BE6] capitalize">
                        {activeDirectConv.otherUser.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6B7A90] truncate">
                      {activeDirectConv.otherUser.department} · {activeDirectConv.otherUser.institution}
                    </p>
                  </div>
                </div>
              </div>
            ) : activeProjectConv ? (
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={activeProjectConv.project.thumbnail}
                  alt={activeProjectConv.project.title}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-100 shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="font-extrabold text-sm text-[#0B2A55] leading-snug truncate">
                    {activeProjectConv.project.title}
                  </h4>
                  <p className="text-[11px] text-[#6B7A90] truncate">
                    {activeProjectConv.project.areaName} · Collaborative Research Channel
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-sm font-bold text-slate-400">Select a conversation</div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              {isDirectActive && activeDirectConv ? (
                <button
                  onClick={() => navigate(`/u/${activeDirectConv.otherUser.id}`)}
                  className="px-3 py-1.5 bg-[#F5F8FC] hover:bg-slate-100 text-[#0B2A55] border border-[#E3EAF3] rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                  <span>View Profile</span>
                </button>
              ) : activeProjectConv ? (
                <>
                  <button
                    onClick={() => setShowMembersDrawer(!showMembersDrawer)}
                    className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                      showMembersDrawer
                        ? 'bg-[#0B6BE6] text-white shadow-2xs'
                        : 'bg-[#F5F8FC] hover:bg-slate-100 text-[#0B2A55] border border-[#E3EAF3]'
                    }`}
                    title="Toggle authorized participants panel"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Members ({projectMembersList.length})</span>
                  </button>
                  <button
                    onClick={() => navigate(`/projects/${activeProjectConv.project.id}`)}
                    className="px-3 py-1.5 bg-[#DCE6FB] hover:bg-blue-200 text-[#0B6BE6] rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Project Details
                  </button>
                </>
              ) : null}
            </div>
          </div>

          {/* Collapsible Project Participants Panel */}
          {showMembersDrawer && activeProjectConv && (
            <div className="p-4 bg-slate-50 border-b border-[#E3EAF3] animate-in slide-in-from-top-2">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#0B6BE6]" />
                  <h5 className="font-extrabold text-xs text-[#0B2A55] uppercase tracking-wider">
                    Authorized Project Collaborators ({projectMembersList.length})
                  </h5>
                </div>
                <button
                  onClick={() => setShowMembersDrawer(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {projectMembersList.map((mem) => {
                  const isCurrent = mem.userId === currentUser.id;
                  const targetUser = users.find((u) => u.id === mem.userId);
                  return (
                    <div
                      key={mem.id}
                      className="p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between gap-2.5"
                    >
                      <div
                        onClick={() => navigate(`/u/${mem.userId}`)}
                        className="flex items-center gap-2.5 min-w-0 cursor-pointer group flex-1"
                        title={`View ${mem.name}'s profile`}
                      >
                        <img
                          src={mem.avatar}
                          alt={mem.name}
                          className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200 group-hover:scale-105 transition-transform"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#0B2A55] group-hover:text-[#0B6BE6] transition-colors truncate">
                            {mem.name} {isCurrent && '(You)'}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate capitalize">
                            {mem.positionTitle || mem.role}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => navigate(`/u/${mem.userId}`)}
                          className="p-1 text-slate-400 hover:text-[#0B6BE6] rounded-md transition-colors cursor-pointer"
                          title="View Profile"
                        >
                          <UserIcon className="w-3.5 h-3.5" />
                        </button>
                        {!isCurrent && (
                          <button
                            onClick={() => {
                              if (targetUser) {
                                startDirectMessageWithUser(targetUser);
                              } else {
                                navigate(`/messages?user=${mem.userId}`);
                              }
                            }}
                            className="p-1 text-[#0B6BE6] hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                            title={`Start direct chat with ${mem.name}`}
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Message History */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#F5F8FC]/40">
            {activeMessages.length === 0 ? (
              <div className="text-center py-20 text-slate-400 space-y-3">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-[#0B6BE6] flex items-center justify-center mx-auto">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-extrabold text-[#0B2A55]">
                  {isDirectActive && activeDirectConv
                    ? `Start a conversation with ${activeDirectConv.otherUser.name}`
                    : 'No messages in this channel yet'}
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Send a message to discuss research topics, methodologies, datasets, or laboratory updates.
                </p>
              </div>
            ) : (
              activeMessages.map((msg) => {
                const isMe = msg.senderId === currentUser.id;

                return (
                  <div key={msg.id} className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <img
                      src={msg.senderAvatar}
                      alt={msg.senderName}
                      onClick={() => navigate(`/u/${msg.senderId}`)}
                      className="w-8 h-8 rounded-full object-cover shrink-0 mt-1 cursor-pointer hover:ring-2 hover:ring-[#0B6BE6] transition-all"
                      title={`View ${msg.senderName}'s profile`}
                    />

                    <div className={`space-y-1 max-w-lg ${isMe ? 'items-end' : ''}`}>
                      <div className="flex items-center gap-2 px-1 text-[11px] text-slate-500">
                        <span
                          onClick={() => navigate(`/u/${msg.senderId}`)}
                          className="font-bold text-[#0B2A55] hover:text-[#0B6BE6] cursor-pointer hover:underline"
                        >
                          {msg.senderName}
                        </span>
                        <span>·</span>
                        <span>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Bubble */}
                      <div
                        className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                          isMe
                            ? 'bg-[#0B6BE6] text-white rounded-tr-xs'
                            : 'bg-white border border-[#E3EAF3] text-[#0B2A55] rounded-tl-xs'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.body}</p>

                        {/* File Attachment */}
                        {msg.attachment && (
                          <div
                            className={`mt-3 p-2.5 rounded-xl flex items-center justify-between gap-3 border ${
                              isMe ? 'bg-white/10 border-white/20' : 'bg-[#DCE6FB] border-[#A3BFF5]'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Archive className={`w-5 h-5 shrink-0 ${isMe ? 'text-white' : 'text-[#0B6BE6]'}`} />
                              <div className="truncate">
                                <p className={`font-bold text-xs truncate ${isMe ? 'text-white' : 'text-[#0B2A55]'}`}>
                                  {msg.attachment.name}
                                </p>
                                <p className={`text-[10px] ${isMe ? 'text-white/80' : 'text-slate-500'}`}>
                                  {msg.attachment.size}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => showToast(`Downloaded ${msg.attachment?.name}`, 'info')}
                              className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                                isMe ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-white hover:bg-slate-100 text-[#0B6BE6]'
                              }`}
                              title="Download Attachment"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Composer or Access Notice */}
          {activeProjectConv && !isProjectAuthorized ? (
            <div className="p-6 border-t border-[#E3EAF3] bg-amber-50/70 text-center space-y-2">
              <p className="text-xs font-bold text-amber-900">
                This project workspace discussion is private to accepted team members and faculty supervisors.
              </p>
              <p className="text-[11px] text-slate-500">
                Submit an application or collaboration statement to participate in this project group.
              </p>
              <button
                onClick={() => navigate(`/projects/${activeProjectConv.project.id}`)}
                className="mt-1 px-4 py-2 bg-[#0B6BE6] hover:bg-blue-600 text-white text-xs font-bold rounded-xl shadow-2xs transition-colors cursor-pointer"
              >
                View Project Details & Apply
              </button>
            </div>
          ) : (
            <div className="p-4 border-t border-[#E3EAF3] bg-white space-y-2">
              {selectedFile && (
                <div className="flex items-center justify-between bg-blue-50 border border-blue-200 p-2 rounded-xl text-xs text-[#0B6BE6]">
                  <span className="font-semibold truncate">Attachment: {selectedFile.name} ({selectedFile.size})</span>
                  <button onClick={() => setSelectedFile(null)} className="text-red-500 font-bold p-1 cursor-pointer">
                    ✕
                  </button>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <label className="p-2.5 text-slate-500 hover:text-[#0B2A55] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shrink-0">
                  <Paperclip className="w-5 h-5" />
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={
                    isDirectActive && activeDirectConv
                      ? `Message ${activeDirectConv.otherUser.name}...`
                      : 'Type a message or discuss milestone progress...'
                  }
                  className="flex-1 bg-[#F5F8FC] border border-[#E3EAF3] text-xs font-medium text-[#0B2A55] px-4 py-3 rounded-xl focus:outline-hidden focus:border-[#0B6BE6]"
                />

                <button
                  type="submit"
                  disabled={isSending || (!inputMessage.trim() && !selectedFile)}
                  className="px-5 py-3 bg-[#0E9F6E] hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* New Direct Message Modal */}
      {isNewDirectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-base text-[#0B2A55]">New Direct Conversation</h3>
                <p className="text-xs text-slate-500">Select a faculty supervisor, researcher, or student</p>
              </div>
              <button
                onClick={() => setIsNewDirectModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                value={newDirectSearch}
                onChange={(e) => setNewDirectSearch(e.target.value)}
                placeholder="Search by name, role, or department..."
                className="w-full bg-[#F5F8FC] border border-[#E3EAF3] text-xs pl-8 pr-3 py-2.5 rounded-xl text-[#0B2A55] focus:outline-hidden focus:border-[#0B6BE6]"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>

            <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 space-y-1">
              {users
                .filter(
                  (u) =>
                    u.id !== currentUser.id &&
                    (u.name.toLowerCase().includes(newDirectSearch.toLowerCase()) ||
                      u.role.toLowerCase().includes(newDirectSearch.toLowerCase()) ||
                      u.department.toLowerCase().includes(newDirectSearch.toLowerCase()))
                )
                .map((u) => (
                  <div
                    key={u.id}
                    onClick={() => startDirectMessageWithUser(u)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F5F8FC] cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-[#0B2A55] truncate">{u.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{u.headline || u.department}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#DCE6FB] text-[#0B6BE6] capitalize shrink-0">
                      {u.role}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
