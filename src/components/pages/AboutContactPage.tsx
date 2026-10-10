import React, { useState } from 'react';
import {
  Mail,
  MapPin,
  Phone,
  Clock,
  Send,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  Building2,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AboutContactPageProps {
  navigate: (path: string) => void;
  activeSection?: 'about' | 'contact' | 'faq';
}

export const AboutContactPage: React.FC<AboutContactPageProps> = ({ navigate, activeSection = 'about' }) => {
  const { submitContactMessage, contactMessages, replyContactMessage, currentUser } = useApp();

  const [activeTab, setActiveTab] = useState<'about' | 'contact' | 'faq'>(activeSection);

  // Contact form
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('General Inquiry');
  const [message, setMessage] = useState('');

  // Admin reply states
  const [replyText, setReplyText] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);

  // FAQ Accordion
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How do students apply to faculty-led research projects?',
      a: 'Browse the Projects catalog, select a project of interest, review the prerequisite skill set and duration, and click "Apply to Join". You will submit a short statement of motivation and CV. The supervising professor receives your application in their dashboard and reviews candidates.',
    },
    {
      q: 'Can researchers and supervisors publish funded theses?',
      a: 'Yes. Faculty supervisors and researchers can click "+ Publish Project" on their dashboard or project catalog to define project objectives, required student positions, duration, and milestone timelines.',
    },
    {
      q: 'How does the AI Research Paper Writer adhere to academic integrity?',
      a: 'The CollabX AI Paper Writer assists scholars in formulating outlines, synthesizing literature references from verified databases (OpenAlex/arXiv/Crossref), and polishing academic tone. All published papers generated with AI assistance receive an explicit "AI-Assisted Draft" transparency badge.',
    },
    {
      q: 'Who can read and download papers in the repository?',
      a: 'CollabX maintains an Open Access scholarly repository. All students, faculty, and peer researchers can read abstracts, download manuscripts, copy formatted APA/IEEE citations, and comment on papers.',
    },
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    submitContactMessage({
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim() || 'Portal Inquiry',
      category,
      message: message.trim(),
    });

    setMessage('');
    setSubject('');
  };

  const handleReplySubmit = (id: string) => {
    if (!replyText.trim()) return;
    replyContactMessage(id, replyText.trim());
    setReplyingToId(null);
    setReplyText('');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E3EAF3] pb-2 text-xs">
        <button
          onClick={() => setActiveTab('about')}
          className={`px-4 py-2 rounded-xl font-bold transition-colors cursor-pointer ${
            activeTab === 'about'
              ? 'bg-[#0B2A55] text-white shadow-xs'
              : 'bg-white border border-[#E3EAF3] text-[#0B2A55] hover:bg-slate-50'
          }`}
        >
          About CollabX
        </button>
        <button
          onClick={() => setActiveTab('contact')}
          className={`px-4 py-2 rounded-xl font-bold transition-colors cursor-pointer ${
            activeTab === 'contact'
              ? 'bg-[#0B2A55] text-white shadow-xs'
              : 'bg-white border border-[#E3EAF3] text-[#0B2A55] hover:bg-slate-50'
          }`}
        >
          Contact Support & Feedback
        </button>
        <button
          onClick={() => setActiveTab('faq')}
          className={`px-4 py-2 rounded-xl font-bold transition-colors cursor-pointer ${
            activeTab === 'faq'
              ? 'bg-[#0B2A55] text-white shadow-xs'
              : 'bg-white border border-[#E3EAF3] text-[#0B2A55] hover:bg-slate-50'
          }`}
        >
          Frequently Asked Questions
        </button>
      </div>

      {/* SECTION: ABOUT COLLABX */}
      {activeTab === 'about' && (
        <div className="space-y-8">
          <div className="bg-white p-6 sm:p-10 rounded-3xl border border-[#E3EAF3] shadow-xs space-y-6">
            <div className="max-w-3xl space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0B6BE6] bg-blue-50 px-3 py-1 rounded-full">
                Institutional Mission
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-[#0B2A55] tracking-tight">
                About CollabX Portal
              </h1>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                CollabX is a centralized Research & Innovation Collaboration Portal built for the Department of
                Computer Science & Engineering (CSE 222 DBMS Sessional) at Port City International University.
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Our mission is to democratize laboratory participation for undergraduate scholars, streamline faculty
                grant administration, connect students with interdisciplinary supervisors, and provide cutting-edge
                tools for peer-reviewed publication.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0B6BE6] flex items-center justify-center font-bold">
                  01
                </div>
                <h4 className="font-extrabold text-base text-[#0B2A55]">Discover</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Browse categorized project initiatives across AI, Cyber Security, IoT, Data Science, and Bio-informatics.
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  02
                </div>
                <h4 className="font-extrabold text-base text-[#0B2A55]">Collaborate</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Synchronize milestone checklists, share dataset repositories, and chat in project workspaces.
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  03
                </div>
                <h4 className="font-extrabold text-base text-[#0B2A55]">Publish & Impact</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Ground academic references in OpenAlex databases, utilize AI paper assistance, and share manuscripts.
                </p>
              </div>
            </div>
          </div>

          {/* Academic Integrity Policy */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E3EAF3] shadow-xs space-y-4">
            <h3 className="font-black text-lg text-[#0B2A55] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#0E9F6E]" />
              <span>Academic Integrity & Authorship Policy</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              All students and researchers publishing on CollabX affirm that submissions represent original research,
              appropriate co-authorship attribution, and adherence to IEEE/ACM citation ethics. Plagiarism or
              undisclosed automated generation without author verification will result in account moderation.
            </p>
          </div>
        </div>
      )}

      {/* SECTION: CONTACT US */}
      {activeTab === 'contact' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left 5 Cols: Contact Details */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-[#E3EAF3] shadow-xs space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-black text-[#0B2A55]">Get in Touch</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Have questions regarding supervisor applications, research area configurations, or platform bugs?
                Our faculty coordinators are here to assist.
              </p>
            </div>

            <div className="space-y-4 text-xs text-slate-700">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#0B6BE6] shrink-0 mt-0.5" />
                <span>Dept. of Computer Science & Engineering, Port City International University, Chattogram, Bangladesh</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#0B6BE6] shrink-0" />
                <span>support.cse@portcity.edu.bd</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#0B6BE6] shrink-0" />
                <span>+880 31 2869877</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-[#0B6BE6] shrink-0" />
                <span>Sunday – Thursday: 9:00 AM – 5:00 PM</span>
              </div>
            </div>
          </div>

          {/* Right 7 Cols: Contact Form */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-[#E3EAF3] shadow-xs space-y-6">
            <h3 className="font-black text-lg text-[#0B2A55]">Send Inquiry or Report Problem</h3>

            <form onSubmit={handleContactSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-[#0B2A55] block mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#F5F8FC] border border-[#E3EAF3] p-2.5 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#0B2A55] block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#F5F8FC] border border-[#E3EAF3] p-2.5 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-[#0B2A55] block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#F5F8FC] border border-[#E3EAF3] p-2.5 rounded-xl font-medium"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Supervision Inquiry">Supervision Inquiry</option>
                    <option value="Report a Problem">Report a Problem / Bug</option>
                    <option value="Research Proposal">Research Proposal</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[#0B2A55] block mb-1">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief summary..."
                    className="w-full bg-[#F5F8FC] border border-[#E3EAF3] p-2.5 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#0B2A55] block mb-1">Detailed Message *</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your inquiry or the technical problem encountered..."
                  className="w-full bg-[#F5F8FC] border border-[#E3EAF3] p-3 rounded-xl font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#0B6BE6] hover:bg-blue-600 text-white font-extrabold rounded-xl shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Message</span>
                </button>
              </div>
            </form>

            {/* Admin Inbox Display if logged in as Admin */}
            {currentUser?.role === 'admin' && (
              <div className="pt-6 border-t border-slate-100 space-y-3">
                <h4 className="font-extrabold text-sm text-[#0B2A55]">Admin Inbound Messages Inbox</h4>
                <div className="space-y-3">
                  {contactMessages.map((msg) => (
                    <div key={msg.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#0B2A55]">{msg.name} ({msg.email})</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${msg.status === 'replied' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {msg.status}
                        </span>
                      </div>
                      <p className="text-slate-700">"{msg.message}"</p>
                      {msg.replyText ? (
                        <p className="text-emerald-700 font-medium">Reply: "{msg.replyText}"</p>
                      ) : (
                        <div>
                          {replyingToId === msg.id ? (
                            <div className="flex gap-2 mt-2">
                              <input
                                type="text"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Type response..."
                                className="flex-1 bg-white border border-slate-200 p-1.5 rounded-lg"
                              />
                              <button
                                onClick={() => handleReplySubmit(msg.id)}
                                className="px-3 py-1.5 bg-[#0B6BE6] text-white font-bold rounded-lg"
                              >
                                Send
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setReplyingToId(msg.id)}
                              className="text-[#0B6BE6] font-bold hover:underline"
                            >
                              Reply to Inquirer
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION: FAQ ACCORDION */}
      {activeTab === 'faq' && (
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-[#E3EAF3] shadow-xs space-y-6 max-w-4xl mx-auto">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-3xl font-black text-[#0B2A55]">Frequently Asked Questions</h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Guidance for students, research assistants, and faculty principal investigators
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-[#E3EAF3] overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left font-bold text-sm text-[#0B2A55] flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      openFaq === idx ? 'rotate-180 text-[#0B6BE6]' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="p-4 sm:p-5 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
