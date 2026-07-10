"use client";

import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, addDoc, orderBy, doc, updateDoc, increment } from "firebase/firestore";
import { useState, useEffect } from "react";
import {
  MessageSquare,
  Users,
  Award,
  BookOpen,
  Share2,
  ThumbsUp,
  Heart,
  Plus,
  Loader2,
  CheckCircle,
} from "lucide-react";
import type { CommunityPost, CommunityTag, MentorshipRequest } from "@/lib/types";

export default function CommunityPage() {
  const { currentUser, profile } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [mentorships, setMentorships] = useState<MentorshipRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<"discussion" | "mentorship">("discussion");
  const [selectedTag, setSelectedTag] = useState<string>("all");

  // Post form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postBody, setPostBody] = useState("");
  const [postTag, setPostTag] = useState<CommunityTag>("General");
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Mentorship request states
  const [showMentorForm, setShowMentorForm] = useState(false);
  const [mName, setMName] = useState("");
  const [mField, setMField] = useState("");
  const [mGoals, setMGoals] = useState("");
  const [mAvailability, setMAvailability] = useState("");

  // Post replies toggle
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [postReplies, setPostReplies] = useState<Record<string, any[]>>({});

  useEffect(() => {
    // 1. Fetch community posts
    const postQuery = query(collection(db, "community_posts"), orderBy("createdAt", "desc"));
    const unsubPosts = onSnapshot(postQuery, (snap) => {
      const items: CommunityPost[] = [];
      snap.forEach((d) => {
        items.push({ id: d.id, ...d.data() } as CommunityPost);
      });
      setPosts(items);
      setLoading(false);
    });

    // 2. Fetch mentorship requests
    const mentorQuery = query(collection(db, "mentorship_requests"), orderBy("createdAt", "desc"));
    const unsubMentors = onSnapshot(mentorQuery, (snap) => {
      const items: MentorshipRequest[] = [];
      snap.forEach((d) => {
        items.push({ id: d.id, ...d.data() } as MentorshipRequest);
      });
      setMentorships(items);
    });

    return () => {
      unsubPosts();
      unsubMentors();
    };
  }, []);

  // Fetch replies when a post is expanded
  useEffect(() => {
    if (!expandedPostId) return;

    const q = query(
      collection(db, "community_replies"),
      where("postId", "==", expandedPostId),
      orderBy("createdAt", "asc")
    );
    const unsubReplies = onSnapshot(q, (snap) => {
      const items: any[] = [];
      snap.forEach((d) => {
        items.push({ id: d.id, ...d.data() });
      });
      setPostReplies((prev) => ({ ...prev, [expandedPostId]: items }));
    });

    return () => unsubReplies();
  }, [expandedPostId]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !postTitle.trim() || !postBody.trim()) return;

    try {
      const author = isAnonymous ? "Anonymous member" : profile?.name || "Bloom User";
      const initial = author.charAt(0).toUpperCase();

      const newPost = {
        authorUid: currentUser.uid,
        authorName: author,
        authorInitial: initial,
        isAnonymous,
        title: postTitle.trim(),
        body: postBody.trim(),
        tag: postTag,
        likes: 0,
        replyCount: 0,
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, "community_posts"), newPost);

      // Reset
      setPostTitle("");
      setPostBody("");
      setShowAddForm(false);
    } catch (err) {
      console.error("Create post error:", err);
    }
  };

  const handleCreateMentorship = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !mName.trim() || !mField.trim()) return;

    try {
      const newReq = {
        uid: currentUser.uid,
        name: mName.trim(),
        field: mField.trim(),
        goals: mGoals.trim(),
        availability: mAvailability.trim(),
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, "mentorship_requests"), newReq);

      // Reset
      setMName("");
      setMField("");
      setMGoals("");
      setMAvailability("");
      setShowMentorForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await updateDoc(doc(db, "community_posts", postId), {
        likes: increment(1),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddReply = async (postId: string) => {
    if (!currentUser || !replyText.trim()) return;

    try {
      const author = profile?.name || "Bloom User";
      const initial = author.charAt(0).toUpperCase();

      const newReply = {
        postId,
        authorUid: currentUser.uid,
        authorName: author,
        authorInitial: initial,
        isAnonymous: false,
        body: replyText.trim(),
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, "community_replies"), newReply);

      // Increment reply counter on post
      await updateDoc(doc(db, "community_posts", postId), {
        replyCount: increment(1),
      });

      setReplyText("");
    } catch (err) {
      console.error(err);
    }
  };

  const tags: (CommunityTag | "all")[] = [
    "all",
    "Scholarships",
    "Career",
    "Resume",
    "Mentorship",
    "Success Story",
    "General",
  ];

  const filteredPosts = selectedTag === "all"
    ? posts
    : posts.filter((p) => p.tag === selectedTag);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-purple animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-purple" /> Community Ecosystem
          </h1>
          <p className="text-foreground-muted text-sm mt-1">
            Exchange advice, share success stories, check mentorship requests, and build networking relations.
          </p>
        </div>

        <div>
          {activeSubTab === "discussion" ? (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-purple hover:bg-brand-indigo text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Start Discussion
            </button>
          ) : (
            <button
              onClick={() => setShowMentorForm(!showMentorForm)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-purple hover:bg-brand-indigo text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Request Mentor
            </button>
          )}
        </div>
      </div>

      {/* Mode selectors */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveSubTab("discussion")}
          className={`pb-3 px-6 text-sm font-semibold transition-all border-b-2 ${
            activeSubTab === "discussion"
              ? "border-brand-purple text-brand-purple"
              : "border-transparent text-foreground-muted hover:text-foreground"
          }`}
        >
          Discussion Hub
        </button>
        <button
          onClick={() => setActiveSubTab("mentorship")}
          className={`pb-3 px-6 text-sm font-semibold transition-all border-b-2 ${
            activeSubTab === "mentorship"
              ? "border-brand-purple text-brand-purple"
              : "border-transparent text-foreground-muted hover:text-foreground"
          }`}
        >
          Mentorship matchmaking
        </button>
      </div>

      {activeSubTab === "discussion" && (
        <div className="space-y-6">
          {/* Tag filters */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                  selectedTag === tag
                    ? "bg-brand-purple border-brand-purple text-white shadow-sm"
                    : "bg-surface border-border text-foreground-muted hover:bg-surface-raised"
                }`}
              >
                {tag === "all" ? "All Posts" : tag}
              </button>
            ))}
          </div>

          {/* Add Post Form */}
          {showAddForm && (
            <div className="bg-surface border border-border p-6 rounded-3xl shadow-sm animate-in fade-in duration-200">
              <h3 className="font-bold text-foreground text-sm mb-4">Post New Discussion Thread</h3>
              <form onSubmit={handleCreatePost} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">Thread Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Best strategies for Generation Google Scholarship essays"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    required
                    className="w-full text-xs p-3 border border-border rounded-xl outline-none focus:border-brand-purple bg-background text-foreground placeholder:text-foreground-muted"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">Category Tag</label>
                    <select
                      value={postTag}
                      onChange={(e) => setPostTag(e.target.value as CommunityTag)}
                      className="w-full text-xs p-3 border border-border rounded-xl outline-none bg-background text-foreground focus:border-brand-purple"
                    >
                      {tags.slice(1).map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2 pt-5">
                    <input
                      type="checkbox"
                      id="anon"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="rounded text-brand-purple focus:ring-brand-purple border-border w-4 h-4"
                    />
                    <label htmlFor="anon" className="text-xs font-semibold text-foreground-muted">
                      Post Anonymously
                    </label>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">Thread Content</label>
                  <textarea
                    rows={4}
                    placeholder="Share your question, resource, or success details..."
                    value={postBody}
                    onChange={(e) => setPostBody(e.target.value)}
                    required
                    className="w-full text-xs p-3 border border-border rounded-xl outline-none focus:border-brand-purple bg-background text-foreground placeholder:text-foreground-muted"
                  ></textarea>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 border border-border text-foreground-muted rounded-xl text-xs font-semibold hover:bg-surface-raised"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-brand-purple text-white rounded-xl text-xs font-semibold hover:bg-brand-indigo"
                  >
                    Publish Thread
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Posts List */}
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="bg-surface border border-border p-6 rounded-3xl shadow-sm space-y-4 hover:shadow-[0_0_0_1px_rgba(255,92,134,0.15),0_8px_24px_rgba(255,60,110,0.1)] transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-purple/10 text-brand-purple flex items-center justify-center font-bold text-sm">
                      {post.authorInitial}
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground text-sm leading-snug">{post.title}</h4>
                      <p className="text-[10px] text-foreground-muted font-semibold mt-0.5">
                        Posted by {post.authorName} • {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold bg-brand-purple/10 text-brand-purple px-2 py-0.5 rounded">
                    {post.tag}
                  </span>
                </div>

                <p className="text-foreground-muted text-xs leading-relaxed whitespace-pre-wrap">{post.body}</p>

                {/* Actions Bar */}
                <div className="flex items-center gap-4 pt-2 border-t border-border text-xs text-foreground-muted font-bold">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-1 hover:text-red-500 transition-colors"
                  >
                    <Heart className="w-4 h-4" />
                    <span>{post.likes}</span>
                  </button>
                  <button
                    onClick={() => setExpandedPostId(expandedPostId === post.id ? null : post.id)}
                    className="flex items-center gap-1 hover:text-brand-purple transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.replyCount} Replies</span>
                  </button>
                </div>

                {/* Replies Accordion */}
                {expandedPostId === post.id && (
                  <div className="bg-surface-raised border border-border p-4 rounded-2xl space-y-4 animate-in slide-in-from-top duration-200">
                    <div className="space-y-3">
                      {(postReplies[post.id] || []).map((reply) => (
                        <div key={reply.id} className="bg-surface border border-border p-3 rounded-xl flex gap-3">
                          <div className="w-7 h-7 rounded-full bg-brand-purple/10 text-brand-purple flex items-center justify-center font-bold text-xs">
                            {reply.authorInitial}
                          </div>
                          <div className="flex-1 space-y-0.5">
                            <span className="block text-[9px] font-bold text-foreground-muted">
                              {reply.authorName} • {new Date(reply.createdAt).toLocaleDateString()}
                            </span>
                            <p className="text-foreground text-xs font-medium">{reply.body}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Type your reply to this thread..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="flex-1 text-xs p-2.5 border border-border bg-background rounded-xl outline-none focus:border-brand-purple text-foreground placeholder:text-foreground-muted"
                      />
                      <button
                        onClick={() => handleAddReply(post.id)}
                        className="px-4 bg-brand-purple hover:bg-brand-indigo text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {filteredPosts.length === 0 && (
              <div className="text-center py-16 bg-surface border border-border rounded-3xl">
                <MessageSquare className="w-12 h-12 text-foreground-muted mx-auto mb-2" />
                <h4 className="font-bold text-foreground text-sm">No discussion threads found</h4>
                <p className="text-foreground-muted text-xs mt-1">
                  Be the first to create a discussion thread using the button above.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === "mentorship" && (
        <div className="space-y-6">
          {/* Mentorship Requests Form */}
          {showMentorForm && (
            <div className="bg-surface border border-border p-6 rounded-3xl shadow-sm animate-in fade-in duration-200 max-w-xl">
              <h3 className="font-bold text-foreground text-sm mb-4">Post Mentorship Request</h3>
              <form onSubmit={handleCreateMentorship} className="space-y-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">Your Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Priya Sharma"
                    value={mName}
                    onChange={(e) => setMName(e.target.value)}
                    required
                    className="w-full text-xs p-3 border border-border rounded-xl outline-none focus:border-brand-purple bg-background text-foreground placeholder:text-foreground-muted"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">Target Domain / Field</label>
                  <input
                    type="text"
                    placeholder="e.g. Computer Science, Machine Learning"
                    value={mField}
                    onChange={(e) => setMField(e.target.value)}
                    required
                    className="w-full text-xs p-3 border border-border rounded-xl outline-none focus:border-brand-purple bg-background text-foreground placeholder:text-foreground-muted"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">Specific Goals</label>
                  <input
                    type="text"
                    placeholder="e.g. Seeking review of research proposals for UK fellowships."
                    value={mGoals}
                    onChange={(e) => setMGoals(e.target.value)}
                    className="w-full text-xs p-3 border border-border rounded-xl outline-none focus:border-brand-purple bg-background text-foreground placeholder:text-foreground-muted"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">Availability</label>
                  <input
                    type="text"
                    placeholder="e.g. 2 hours/week on weekends"
                    value={mAvailability}
                    onChange={(e) => setMAvailability(e.target.value)}
                    className="w-full text-xs p-3 border border-border rounded-xl outline-none focus:border-brand-purple bg-background text-foreground placeholder:text-foreground-muted"
                  />
                </div>
                <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowMentorForm(false)}
                    className="px-4 py-2 border border-border text-foreground-muted rounded-xl text-xs font-semibold hover:bg-surface-raised"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-brand-purple text-white rounded-xl text-xs font-semibold hover:bg-brand-indigo"
                  >
                    Post Request
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Mentorship list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mentorships.map((req) => (
              <div
                key={req.id}
                className="bg-surface border border-border rounded-3xl p-6 shadow-sm hover:shadow-[0_0_0_1px_rgba(255,92,134,0.2),0_8px_24px_rgba(255,60,110,0.12)] transition-shadow space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 bg-brand-purple/10 text-brand-purple rounded-2xl border border-brand-purple/20">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-foreground text-sm leading-snug">{req.name}</h4>
                      <span className="text-[9px] font-extrabold text-brand-purple bg-brand-purple/10 px-2 py-0.5 rounded uppercase">
                        {req.field}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-foreground-muted font-semibold">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="space-y-2 border-t border-border pt-3">
                  <div>
                    <h5 className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">Goals</h5>
                    <p className="text-foreground-muted text-xs font-medium">{req.goals || "Not specified"}</p>
                  </div>
                  <div>
                    <h5 className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">Availability</h5>
                    <p className="text-foreground-muted text-xs font-medium">{req.availability || "Flexible"}</p>
                  </div>
                </div>

                <button
                  onClick={() => alert(`Connect request sent to ${req.name}! 🌸`)}
                  className="w-full py-2.5 border border-brand-purple/20 bg-brand-purple/5 hover:bg-brand-purple hover:text-white rounded-xl text-xs font-bold text-brand-purple transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Accept Mentorship Match
                </button>
              </div>
            ))}

            {mentorships.length === 0 && (
              <div className="col-span-2 text-center py-16 bg-surface border border-border rounded-3xl">
                <Users className="w-12 h-12 text-foreground-muted mx-auto mb-2" />
                <h4 className="font-bold text-foreground text-sm">No mentorship requests</h4>
                <p className="text-foreground-muted text-xs mt-1">
                  Be the first to post a mentorship request using the button above.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
