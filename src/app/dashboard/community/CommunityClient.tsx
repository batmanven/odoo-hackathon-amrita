/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Search,
  Plus,
  Loader2,
  X,
  Trash2,
  Heart,
  SlidersHorizontal,
  MessageSquare,
} from 'lucide-react'
import { toast } from 'sonner'
import { createPostAction, likePostAction, deletePostAction } from '@/app/actions/community'

export default function CommunityClient({
  posts: initialPosts,
  currentUserId
}: {
  posts: any[]
  currentUserId: string
}) {
  const [posts, setPosts] = useState(initialPosts)
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('newest')
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [isPosting, setIsPosting] = useState(false)
  const [likingId, setLikingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let result = posts.filter(
      (p: any) =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.content.toLowerCase().includes(query.toLowerCase())
    )
    if (sortBy === 'popular') {
      result = [...result].sort((a: any, b: any) => b.likes - a.likes)
    }
    return result
  }, [posts, query, sortBy])

  const handlePost = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error('Fill in title and content')
      return
    }
    setIsPosting(true)
    try {
      await createPostAction({ title: newTitle.trim(), content: newContent.trim() })
      toast.success('Post published')
      setNewTitle('')
      setNewContent('')
      setShowAddForm(false)
      window.location.reload()
    } catch {
      toast.error('Failed to post')
    } finally {
      setIsPosting(false)
    }
  }

  const handleLike = async (postId: string) => {
    setLikingId(postId)
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p))
    try {
      await likePostAction(postId)
    } catch {
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes - 1 } : p))
      toast.error('Failed to like')
    } finally {
      setLikingId(null)
    }
  }

  const handleDelete = async (postId: string) => {
    setDeletingId(postId)
    try {
      await deletePostAction(postId)
      setPosts(prev => prev.filter(p => p.id !== postId))
      toast.success('Post deleted')
    } catch {
      toast.error('Failed to delete')
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (date: string) => {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getInitials = (first: string, last: string) => {
    return `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase()
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 pt-2 px-4">

      <div className="space-y-2">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Community</h1>
        <p className="text-gray-500 font-medium text-lg">Share experiences and discover travel stories</p>
      </div>

      <section className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts..."
            className="pl-14 pr-12 h-14 text-base bg-white border-none rounded-2xl shadow-sm focus-visible:ring-primary font-medium"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="h-14 px-6 rounded-2xl border-none bg-white shadow-sm hover:bg-gray-50 text-gray-700 font-bold cursor-pointer"
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Sort by...
            </Button>
            {showSortMenu && (
              <Card className="absolute top-16 right-0 z-50 rounded-2xl border-none shadow-2xl p-2 min-w-[160px]">
                <button
                  onClick={() => { setSortBy('newest'); setShowSortMenu(false) }}
                  className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm cursor-pointer ${sortBy === 'newest' ? 'bg-primary/5 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  Newest
                </button>
                <button
                  onClick={() => { setSortBy('popular'); setShowSortMenu(false) }}
                  className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm cursor-pointer ${sortBy === 'popular' ? 'bg-primary/5 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  Most Popular
                </button>
              </Card>
            )}
          </div>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="h-14 px-6 rounded-2xl font-bold cursor-pointer bg-gray-900 hover:bg-gray-800"
          >
            <Plus className="w-4 h-4 mr-2" /> New Post
          </Button>
        </div>
      </section>

      {showAddForm && (
        <Card className="p-6 rounded-2xl border-none shadow-lg bg-white space-y-4 animate-in fade-in slide-in-from-top-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Title</label>
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="My amazing trip to..."
              className="h-12 bg-gray-50 border-none rounded-xl font-bold"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Share your experience</label>
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Tell the community about your trip, a hidden gem you found, or tips for fellow travelers..."
              rows={5}
              className="w-full bg-gray-50 border-none rounded-xl p-4 font-medium text-gray-700 text-sm resize-none focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              variant="ghost"
              onClick={() => { setShowAddForm(false); setNewTitle(''); setNewContent('') }}
              className="rounded-xl font-bold cursor-pointer text-gray-400"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePost}
              disabled={isPosting}
              className="rounded-xl font-bold cursor-pointer px-6"
            >
              {isPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publish'}
            </Button>
          </div>
        </Card>
      )}

      <section className="space-y-4">
        {filtered.length > 0 ? filtered.map((post: any) => (
          <Card
            key={post.id}
            className="p-6 rounded-2xl border-none shadow-sm bg-white hover:shadow-md transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                <span className="text-sm font-black text-gray-500">
                  {getInitials(post.user.firstName, post.user.lastName)}
                </span>
              </div>

              <div className="flex-1 min-w-0 space-y-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-sm">
                      {post.user.firstName} {post.user.lastName}
                    </span>
                    <span className="text-xs font-bold text-gray-400">
                      {formatDate(post.createdAt)}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-gray-900 mt-1">{post.title}</h3>
                </div>

                <p className="text-gray-600 font-medium text-sm leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>

                <div className="flex items-center gap-4 pt-1">
                  <button
                    onClick={() => handleLike(post.id)}
                    disabled={likingId === post.id}
                    className="flex items-center gap-1.5 text-gray-400 hover:text-red-500 transition-colors cursor-pointer text-sm font-bold"
                  >
                    <Heart className={`w-4 h-4 ${post.likes > 0 ? 'fill-red-500 text-red-500' : ''}`} />
                    {post.likes}
                  </button>
                  <div className="flex items-center gap-1.5 text-gray-300 text-sm font-bold">
                    <MessageSquare className="w-4 h-4" />
                    0
                  </div>
                </div>
              </div>

              {post.user.id === currentUserId && (
                <button
                  onClick={() => handleDelete(post.id)}
                  disabled={deletingId === post.id}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-500 cursor-pointer p-2 rounded-lg hover:bg-red-50 shrink-0"
                >
                  {deletingId === post.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              )}
            </div>
          </Card>
        )) : (
          <div className="py-16 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 font-bold text-lg">No posts yet.</p>
            <p className="text-gray-300 font-medium text-sm mt-1">Be the first to share your travel experience.</p>
          </div>
        )}
      </section>
    </div>
  )
}
