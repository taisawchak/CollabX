import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Paperclip,
  Download,
  Users,
  Search,
  MoreVertical,
  Check,
  FileText,
  Info,
  Archive,
  ArrowLeft,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ProjectDiscussionPageProps {
  projectId: string;
  navigate: (path: string) => void;
}

export const ProjectDiscussionPage: React.FC<ProjectDiscussionPageProps> = ({ projectId, navigate }) => {
  const { projects, messages, sendMessage, currentUser, members, showToast } = useApp();

  if (!currentUser) {
    return null;
  }

  const [inputMessage, setInputMessage] = useState('');
  const [memberSearch, setMemberSearch] = useState('');
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: string; type: string } | null>(null);

  const project = projects.find((p) => p.id === projectId) || projects[0];
  const projectMessages = messages.filter((m) => m.projectId === project.id);
  const projectMembers = members.filter((m) => m.projectId === project.id);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() && !selectedFile) return;

    sendMessage(
      project.id,
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

    setInputMessage('');
    setSelectedFile(null);
    showToast('Message sent to project channel', 'success');
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

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-4">
      {/* Back button */}
      <div className="flex items-center justify-between pb-2">
        <button
          onClick={() => navigate(`/projects/${project.id}`)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B6BE6] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {project.title}</span>
        </button>

        <span className="text-xs text-slate-500 font-semibold">
          Collaborator Chat · {projectMembers.length} active researchers
        </span>
      </div>

      {/* 2-Pane Chat Layout matching Page 13 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 bg-white rounded-3xl border border-[#E3EAF3] shadow-xs overflow-hidden min-h-[680px]">
        {/* Left Pane: Conversation / Member List matching Page 13 */}
        <div className="lg:col-span-1 border-r border-[#E3EAF3] flex flex-col bg-[#F5F8FC]/50">
          <div className="p-4 border-b border-[#E3EAF3] space-y-3">
            <h3 className="font-extrabold text-sm text-[#0B2A55] flex items-center justify-between">
              <span>Project Messages</span>
              <span className="text-[10px] bg-blue-100 text-[#0B6BE6] px-2 py-0.5 rounded-full font-bold">
                Live
              </span>
            </h3>

            {/* Member search */}
            <div className="relative">
              <input
                type="text"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="Search discussions..."
                className="w-full bg-white border border-[#E3EAF3] text-xs pl-8 pr-3 py-1.5 rounded-xl text-[#0B2A55]"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Members list in project room */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
            {projectMembers.map((mem) => (
              <div
                key={mem.id}
                className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-white transition-colors cursor-pointer"
              >
                <div className="relative">
                  <img src={mem.avatar} alt={mem.name} className="w-9 h-9 rounded-full object-cover" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white absolute bottom-0 right-0" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#0B2A55] truncate">{mem.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{mem.positionTitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Pane: Active Chat Room matching Page 13 */}
        <div className="lg:col-span-3 flex flex-col justify-between">
          {/* Header */}
          <div className="p-4 border-b border-[#E3EAF3] flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <img
                src={project.thumbnail}
                alt={project.title}
                className="w-10 h-10 rounded-xl object-cover border border-slate-100"
              />
              <div>
                <h4 className="font-extrabold text-sm text-[#0B2A55] leading-snug">{project.title}</h4>
                <p className="text-[11px] text-[#6B7A90]">General Discussion & Data Sharing Channel</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/projects/${project.id}/team`)}
                className="p-2 text-slate-400 hover:text-[#0B2A55] hover:bg-slate-50 rounded-xl transition-colors"
                title="View Team"
              >
                <Users className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Message History matching Page 13 bubbles */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#F5F8FC]/30">
            {projectMessages.length === 0 ? (
              <div className="text-center py-16 text-slate-400 space-y-2">
                <MessageSquare className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-xs font-semibold">No messages yet. Start the discussion!</p>
              </div>
            ) : (
              projectMessages.map((msg) => {
                const isMe = msg.senderId === currentUser?.id;

                return (
                  <div key={msg.id} className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <img
                      src={msg.senderAvatar}
                      alt={msg.senderName}
                      className="w-8 h-8 rounded-full object-cover shrink-0 mt-1"
                    />

                    <div className={`space-y-1 max-w-lg ${isMe ? 'items-end' : ''}`}>
                      <div className="flex items-center gap-2 px-1 text-[11px] text-slate-500">
                        <span className="font-bold text-[#0B2A55]">{msg.senderName}</span>
                        <span>·</span>
                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      {/* Bubble (pale blue) */}
                      <div
                        className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                          isMe
                            ? 'bg-[#0B6BE6] text-white rounded-tr-xs'
                            : 'bg-white border border-[#E3EAF3] text-[#0B2A55] rounded-tl-xs'
                        }`}
                      >
                        <p>{msg.body}</p>

                        {/* File Attachment Bubble matching Page 13 (dataset.zip) */}
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
          </div>

          {/* Composer matching Page 13 */}
          <div className="p-4 border-t border-[#E3EAF3] bg-white space-y-2">
            {selectedFile && (
              <div className="flex items-center justify-between bg-blue-50 border border-blue-200 p-2 rounded-xl text-xs text-[#0B6BE6]">
                <span className="font-semibold truncate">Attachment: {selectedFile.name} ({selectedFile.size})</span>
                <button onClick={() => setSelectedFile(null)} className="text-red-500 font-bold p-1">
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
                placeholder="Type a message or discuss milestone progress..."
                className="flex-1 bg-[#F5F8FC] border border-[#E3EAF3] text-xs font-medium text-[#0B2A55] px-4 py-3 rounded-xl focus:outline-hidden focus:border-[#0B6BE6]"
              />

              {/* Green Send Button matching Page 13 */}
              <button
                type="submit"
                className="px-5 py-3 bg-[#0E9F6E] hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1 shrink-0"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
