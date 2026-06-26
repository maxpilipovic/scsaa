import React, { useEffect, useState } from 'react';
import { Calendar, Heart, MessageCircle, Send } from 'lucide-react';
import { toast } from 'react-toastify';
import { supabase } from '../lib/supabaseClient';

const ActivityFeedPage = ({ profile, upcomingEvents = [], onEventRsvpUpdated, highlightedItem }) => {
  const [posts, setPosts] = useState([]);
  const [postBody, setPostBody] = useState('');
  const [commentBodies, setCommentBodies] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [updatingEventId, setUpdatingEventId] = useState(null);

  const getHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error('Your session expired. Please sign in again.');
    }

    return {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    };
  };

  const formatDate = (value) => {
    if (!value) return '';

    return new Date(value).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getAuthorName = (author) => {
    if (!author) return 'SCSAA Member';
    return `${author.first_name} ${author.last_name}`.trim();
  };

  const getInitials = (author) => {
    if (!author) return 'SM';
    return `${author.first_name?.[0] || ''}${author.last_name?.[0] || ''}` || 'SM';
  };

  const renderAvatar = (author, sizeClass = 'h-11 w-11', textClass = 'text-sm') => (
    <div className={`${sizeClass} shrink-0 overflow-hidden rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold ${textClass}`}>
      {author?.profile_picture_url ? (
        <img src={author.profile_picture_url} alt="" className="h-full w-full object-cover" />
      ) : (
        getInitials(author)
      )}
    </div>
  );

  const loadFeed = async () => {
    try {
      setIsLoading(true);
      const headers = await getHeaders();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/activity/feed`, { headers });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not load activity feed.');
      }

      setPosts(data);
    } catch (error) {
      console.error('Activity feed load error:', error);
      toast.error(error.message || 'Could not load activity feed.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);

  useEffect(() => {
    if (!highlightedItem || isLoading) return;

    const element = document.getElementById(`activity-${highlightedItem.type}-${highlightedItem.id}`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [highlightedItem, isLoading, posts]);

  const handleCreatePost = async (event) => {
    event.preventDefault();

    const body = postBody.trim();
    if (!body) return;

    try {
      setIsPosting(true);
      const headers = await getHeaders();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/activity/posts`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ body }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not create post.');
      }

      setPosts((currentPosts) => [data, ...currentPosts]);
      setPostBody('');
    } catch (error) {
      console.error('Create post error:', error);
      toast.error(error.message || 'Could not create post.');
    } finally {
      setIsPosting(false);
    }
  };

  const getItemId = (item) => item.item_id || item.post_id;

  const getLikeEndpoint = (item) => {
    if (item.item_type === 'announcement') {
      return `${import.meta.env.VITE_API_URL}/api/v1/activity/announcements/${getItemId(item)}/like`;
    }

    return `${import.meta.env.VITE_API_URL}/api/v1/activity/posts/${getItemId(item)}/like`;
  };

  const getCommentEndpoint = (item) => {
    if (item.item_type === 'announcement') {
      return `${import.meta.env.VITE_API_URL}/api/v1/activity/announcements/${getItemId(item)}/comments`;
    }

    return `${import.meta.env.VITE_API_URL}/api/v1/activity/posts/${getItemId(item)}/comments`;
  };

  const handleToggleLike = async (item) => {
    const itemId = getItemId(item);

    try {
      setPosts((currentPosts) => currentPosts.map((post) => (
        getItemId(post) === itemId && post.item_type === item.item_type
          ? {
              ...post,
              liked_by_me: !post.liked_by_me,
              likes_count: post.liked_by_me ? Math.max(post.likes_count - 1, 0) : post.likes_count + 1,
            }
          : post
      )));

      const headers = await getHeaders();
      const response = await fetch(getLikeEndpoint(item), {
        method: 'POST',
        headers,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not update like.');
      }

      setPosts((currentPosts) => currentPosts.map((post) => (
        getItemId(post) === itemId && post.item_type === item.item_type
          ? { ...post, liked_by_me: data.liked_by_me, likes_count: data.likes_count }
          : post
      )));
    } catch (error) {
      console.error('Like update error:', error);
      toast.error(error.message || 'Could not update like.');
      loadFeed();
    }
  };

  const handleCreateComment = async (event, item) => {
    event.preventDefault();

    const itemId = getItemId(item);
    const body = commentBodies[`${item.item_type}:${itemId}`]?.trim();
    if (!body) return;

    try {
      const headers = await getHeaders();
      const response = await fetch(getCommentEndpoint(item), {
        method: 'POST',
        headers,
        body: JSON.stringify({ body }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not add comment.');
      }

      setPosts((currentPosts) => currentPosts.map((post) => (
        getItemId(post) === itemId && post.item_type === item.item_type
          ? { ...post, comments: [...post.comments, data] }
          : post
      )));
      setCommentBodies((currentBodies) => ({ ...currentBodies, [`${item.item_type}:${itemId}`]: '' }));
    } catch (error) {
      console.error('Create comment error:', error);
      toast.error(error.message || 'Could not add comment.');
    }
  };

  const handleRsvp = async (eventId, status) => {
    try {
      setUpdatingEventId(eventId);
      const headers = await getHeaders();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/activity/events/${eventId}/rsvp`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not update RSVP.');
      }

      onEventRsvpUpdated?.(eventId, data);
    } catch (error) {
      console.error('RSVP update error:', error);
      toast.error(error.message || 'Could not update RSVP.');
    } finally {
      setUpdatingEventId(null);
    }
  };

  const featuredEvents = upcomingEvents.slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Activity</h1>
        <p className="text-gray-600 mt-1">Share updates, discuss events, and keep up with SCSAA.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6">
        <div className="space-y-6">
          <form onSubmit={handleCreatePost} className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
            <div className="flex gap-4">
              {renderAvatar(profile)}
              <div className="flex-1">
                <textarea
                  value={postBody}
                  onChange={(event) => setPostBody(event.target.value)}
                  maxLength={2000}
                  rows={4}
                  placeholder="Share an update with the association..."
                  className="w-full resize-none rounded-lg border border-gray-200 px-4 py-3 text-gray-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-xs text-gray-500">{postBody.length}/2000</p>
                  <button
                    type="submit"
                    disabled={isPosting || !postBody.trim()}
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
                  >
                    <Send size={17} />
                    {isPosting ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </div>
            </div>
          </form>

          {isLoading ? (
            <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100 text-center text-gray-500">
              Loading activity...
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100 text-center text-gray-500">
              No posts yet. Start the first conversation.
            </div>
          ) : (
            posts.map((post) => {
              const itemId = getItemId(post);
              const commentKey = `${post.item_type}:${itemId}`;
              const isHighlighted = highlightedItem?.type === post.item_type && highlightedItem?.id === itemId;

              return (
              <article
                key={`${post.item_type}-${itemId}`}
                id={`activity-${post.item_type}-${itemId}`}
                className={`bg-white rounded-xl shadow-md p-5 border transition ${
                  isHighlighted ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-gray-100'
                }`}
              >
                <div className="flex gap-4">
                  {renderAvatar(post.author)}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <h2 className="font-semibold text-gray-900">{getAuthorName(post.author)}</h2>
                      {post.item_type === 'announcement' && (
                        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                          Announcement
                        </span>
                      )}
                      <span className="text-sm text-gray-500">{formatDate(post.created_at)}</span>
                    </div>
                    {post.title && (
                      <h3 className="mt-3 text-lg font-bold text-gray-900">{post.title}</h3>
                    )}
                    <p className="mt-3 whitespace-pre-wrap text-gray-700">{post.body}</p>

                    <div className="mt-4 flex items-center gap-4 border-t border-gray-100 pt-3">
                      <button
                        type="button"
                        onClick={() => handleToggleLike(post)}
                        className={`inline-flex items-center gap-2 text-sm font-semibold transition ${
                          post.liked_by_me ? 'text-red-600' : 'text-gray-600 hover:text-red-600'
                        }`}
                      >
                        <Heart size={18} fill={post.liked_by_me ? 'currentColor' : 'none'} />
                        {post.likes_count}
                      </button>
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600">
                        <MessageCircle size={18} />
                        {post.comments.length}
                      </span>
                    </div>

                    {post.comments.length > 0 && (
                      <div className="mt-4 space-y-3">
                        {post.comments.map((comment) => (
                          <div key={comment.comment_id} className="flex gap-3">
                            {renderAvatar(comment.author, 'h-8 w-8', 'text-xs')}
                            <div className="min-w-0 flex-1 rounded-lg bg-gray-50 px-3 py-2">
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                <p className="text-sm font-semibold text-gray-800">{getAuthorName(comment.author)}</p>
                                <span className="text-xs text-gray-500">{formatDate(comment.created_at)}</span>
                              </div>
                              <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{comment.body}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <form onSubmit={(event) => handleCreateComment(event, post)} className="mt-4 flex gap-3">
                      <input
                        value={commentBodies[commentKey] || ''}
                        onChange={(event) => setCommentBodies((currentBodies) => ({
                          ...currentBodies,
                          [commentKey]: event.target.value,
                        }))}
                        maxLength={1000}
                        placeholder="Write a comment..."
                        className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      />
                      <button
                        type="submit"
                        disabled={!commentBodies[commentKey]?.trim()}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
                        aria-label="Post comment"
                      >
                        <Send size={17} />
                      </button>
                    </form>
                  </div>
                </div>
              </article>
              );
            })
          )}
        </div>

        <aside className="space-y-4">
          <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
            <div className="mb-4 flex items-center gap-2">
              <Calendar className="text-indigo-600" size={20} />
              <h2 className="text-lg font-bold text-gray-800">Upcoming Events</h2>
            </div>

            {featuredEvents.length === 0 ? (
              <p className="text-sm text-gray-500">No upcoming events.</p>
            ) : (
              <div className="space-y-4">
                {featuredEvents.map((event) => (
                  <div key={event.event_id} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                    <h3 className="font-semibold text-gray-900">{event.name}</h3>
                    <p className="mt-1 text-sm text-gray-600">{formatDate(event.start_time)} at {event.location}</p>
                    <p className="mt-2 text-xs font-medium text-gray-500">
                      {event.rsvp_counts?.going || 0} going
                      {event.rsvp_counts?.maybe ? `, ${event.rsvp_counts.maybe} maybe` : ''}
                    </p>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {[
                        ['going', 'Going'],
                        ['maybe', 'Maybe'],
                        ['not_going', 'No'],
                      ].map(([status, label]) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => handleRsvp(event.event_id, status)}
                          disabled={updatingEventId === event.event_id}
                          className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                            event.my_rsvp === status
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ActivityFeedPage;
