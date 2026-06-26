import { supabase } from '../../../config/supabaseClient.js';

const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

const sanitizeBody = (body, maxLength = 2000) => {
  if (typeof body !== 'string') {
    return '';
  }

  return body.trim().slice(0, maxLength);
};

const buildUserMap = async (userIds) => {
  const uniqueUserIds = [...new Set(userIds.filter(Boolean))];

  if (uniqueUserIds.length === 0) {
    return new Map();
  }

  const { data: users, error } = await supabase
    .from('users')
    .select('id, first_name, last_name, profile_picture_url')
    .in('id', uniqueUserIds);

  if (error) {
    throw error;
  }

  return new Map(users.map((user) => [user.id, user]));
};

export const getActivityFeed = async (req, res) => {
  try {
    const [postsResult, announcementsResult] = await Promise.all([
      supabase
        .from('activity_posts')
        .select('post_id, user_id, body, created_at, updated_at')
        .order('created_at', { ascending: false })
        .limit(25),
      supabase
        .from('announcements')
        .select('announcements_id, user_id, title, preview, created_at')
        .order('created_at', { ascending: false })
        .limit(25),
    ]);

    if (postsResult.error) {
      throw postsResult.error;
    }

    if (announcementsResult.error) {
      throw announcementsResult.error;
    }

    const posts = postsResult.data || [];
    const announcements = announcementsResult.data || [];
    const postIds = posts.map((post) => post.post_id);
    const announcementIds = announcements.map((announcement) => announcement.announcements_id);
    const [postCommentsResult, postLikesResult, announcementCommentsResult, announcementLikesResult] = await Promise.all([
      postIds.length
        ? supabase
            .from('activity_comments')
            .select('comment_id, post_id, user_id, body, created_at')
            .in('post_id', postIds)
            .order('created_at', { ascending: true })
        : { data: [], error: null },
      postIds.length
        ? supabase
            .from('activity_likes')
            .select('post_id, user_id')
            .in('post_id', postIds)
        : { data: [], error: null },
      announcementIds.length
        ? supabase
            .from('announcement_comments')
            .select('comment_id, announcement_id, user_id, body, created_at')
            .in('announcement_id', announcementIds)
            .order('created_at', { ascending: true })
        : { data: [], error: null },
      announcementIds.length
        ? supabase
            .from('announcement_likes')
            .select('announcement_id, user_id')
            .in('announcement_id', announcementIds)
        : { data: [], error: null },
    ]);

    if (postCommentsResult.error) {
      throw postCommentsResult.error;
    }

    if (postLikesResult.error) {
      throw postLikesResult.error;
    }

    if (announcementCommentsResult.error) {
      throw announcementCommentsResult.error;
    }

    if (announcementLikesResult.error) {
      throw announcementLikesResult.error;
    }

    const allUserIds = [
      ...posts.map((post) => post.user_id),
      ...announcements.map((announcement) => announcement.user_id),
      ...postCommentsResult.data.map((comment) => comment.user_id),
      ...announcementCommentsResult.data.map((comment) => comment.user_id),
    ];
    const usersById = await buildUserMap(allUserIds);

    const commentsByPostId = postCommentsResult.data.reduce((acc, comment) => {
      const comments = acc.get(comment.post_id) || [];
      comments.push({
        ...comment,
        author: usersById.get(comment.user_id) || null,
      });
      acc.set(comment.post_id, comments);
      return acc;
    }, new Map());

    const likesByPostId = postLikesResult.data.reduce((acc, like) => {
      const likes = acc.get(like.post_id) || [];
      likes.push(like.user_id);
      acc.set(like.post_id, likes);
      return acc;
    }, new Map());

    const commentsByAnnouncementId = announcementCommentsResult.data.reduce((acc, comment) => {
      const comments = acc.get(comment.announcement_id) || [];
      comments.push({
        ...comment,
        post_id: comment.announcement_id,
        author: usersById.get(comment.user_id) || null,
      });
      acc.set(comment.announcement_id, comments);
      return acc;
    }, new Map());

    const likesByAnnouncementId = announcementLikesResult.data.reduce((acc, like) => {
      const likes = acc.get(like.announcement_id) || [];
      likes.push(like.user_id);
      acc.set(like.announcement_id, likes);
      return acc;
    }, new Map());

    const postFeedItems = posts.map((post) => {
      const likes = likesByPostId.get(post.post_id) || [];

      return {
        item_type: 'post',
        item_id: post.post_id,
        ...post,
        author: usersById.get(post.user_id) || null,
        comments: commentsByPostId.get(post.post_id) || [],
        likes_count: likes.length,
        liked_by_me: likes.includes(req.user.id),
      };
    });

    const announcementFeedItems = announcements.map((announcement) => {
      const likes = likesByAnnouncementId.get(announcement.announcements_id) || [];

      return {
        item_type: 'announcement',
        item_id: announcement.announcements_id,
        post_id: announcement.announcements_id,
        user_id: announcement.user_id,
        title: announcement.title,
        body: announcement.preview,
        created_at: announcement.created_at,
        updated_at: announcement.created_at,
        author: usersById.get(announcement.user_id) || null,
        comments: commentsByAnnouncementId.get(announcement.announcements_id) || [],
        likes_count: likes.length,
        liked_by_me: likes.includes(req.user.id),
      };
    });

    const feed = [...postFeedItems, ...announcementFeedItems]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 50);

    res.status(200).json(feed);
  } catch (error) {
    console.error('Error fetching activity feed:', error);
    res.status(500).json({ message: 'Server error while fetching activity feed.' });
  }
};

export const createPost = async (req, res) => {
  const body = sanitizeBody(req.body.body);

  if (!body) {
    return res.status(400).json({ message: 'Post body is required.' });
  }

  try {
    const { data: post, error } = await supabase
      .from('activity_posts')
      .insert([{ user_id: req.user.id, body }])
      .select('post_id, user_id, body, created_at, updated_at')
      .single();

    if (error) {
      throw error;
    }

    const usersById = await buildUserMap([req.user.id]);

    res.status(201).json({
      item_type: 'post',
      item_id: post.post_id,
      ...post,
      author: usersById.get(req.user.id) || null,
      comments: [],
      likes_count: 0,
      liked_by_me: false,
    });
  } catch (error) {
    console.error('Error creating activity post:', error);
    res.status(500).json({ message: 'Server error while creating post.' });
  }
};

export const createAnnouncementComment = async (req, res) => {
  const { announcementId } = req.params;
  const body = sanitizeBody(req.body.body, 1000);

  if (!isValidUUID(announcementId)) {
    return res.status(400).json({ message: 'Invalid announcement ID format.' });
  }

  if (!body) {
    return res.status(400).json({ message: 'Comment body is required.' });
  }

  try {
    const { data: comment, error } = await supabase
      .from('announcement_comments')
      .insert([{ announcement_id: announcementId, user_id: req.user.id, body }])
      .select('comment_id, announcement_id, user_id, body, created_at')
      .single();

    if (error) {
      throw error;
    }

    const usersById = await buildUserMap([req.user.id]);

    res.status(201).json({
      ...comment,
      post_id: comment.announcement_id,
      author: usersById.get(req.user.id) || null,
    });
  } catch (error) {
    console.error('Error creating announcement comment:', error);
    res.status(500).json({ message: 'Server error while creating announcement comment.' });
  }
};

export const createComment = async (req, res) => {
  const { postId } = req.params;
  const body = sanitizeBody(req.body.body, 1000);

  if (!isValidUUID(postId)) {
    return res.status(400).json({ message: 'Invalid post ID format.' });
  }

  if (!body) {
    return res.status(400).json({ message: 'Comment body is required.' });
  }

  try {
    const { data: comment, error } = await supabase
      .from('activity_comments')
      .insert([{ post_id: postId, user_id: req.user.id, body }])
      .select('comment_id, post_id, user_id, body, created_at')
      .single();

    if (error) {
      throw error;
    }

    const usersById = await buildUserMap([req.user.id]);

    res.status(201).json({
      ...comment,
      author: usersById.get(req.user.id) || null,
    });
  } catch (error) {
    console.error('Error creating activity comment:', error);
    res.status(500).json({ message: 'Server error while creating comment.' });
  }
};

export const togglePostLike = async (req, res) => {
  const { postId } = req.params;

  if (!isValidUUID(postId)) {
    return res.status(400).json({ message: 'Invalid post ID format.' });
  }

  try {
    const { data: existingLike, error: lookupError } = await supabase
      .from('activity_likes')
      .select('post_id')
      .eq('post_id', postId)
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (lookupError) {
      throw lookupError;
    }

    if (existingLike) {
      const { error: deleteError } = await supabase
        .from('activity_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', req.user.id);

      if (deleteError) {
        throw deleteError;
      }
    } else {
      const { error: insertError } = await supabase
        .from('activity_likes')
        .insert([{ post_id: postId, user_id: req.user.id }]);

      if (insertError) {
        throw insertError;
      }
    }

    const { count, error: countError } = await supabase
      .from('activity_likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    if (countError) {
      throw countError;
    }

    res.status(200).json({
      liked_by_me: !existingLike,
      likes_count: count || 0,
    });
  } catch (error) {
    console.error('Error toggling activity like:', error);
    res.status(500).json({ message: 'Server error while updating like.' });
  }
};

export const toggleAnnouncementLike = async (req, res) => {
  const { announcementId } = req.params;

  if (!isValidUUID(announcementId)) {
    return res.status(400).json({ message: 'Invalid announcement ID format.' });
  }

  try {
    const { data: existingLike, error: lookupError } = await supabase
      .from('announcement_likes')
      .select('announcement_id')
      .eq('announcement_id', announcementId)
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (lookupError) {
      throw lookupError;
    }

    if (existingLike) {
      const { error: deleteError } = await supabase
        .from('announcement_likes')
        .delete()
        .eq('announcement_id', announcementId)
        .eq('user_id', req.user.id);

      if (deleteError) {
        throw deleteError;
      }
    } else {
      const { error: insertError } = await supabase
        .from('announcement_likes')
        .insert([{ announcement_id: announcementId, user_id: req.user.id }]);

      if (insertError) {
        throw insertError;
      }
    }

    const { count, error: countError } = await supabase
      .from('announcement_likes')
      .select('*', { count: 'exact', head: true })
      .eq('announcement_id', announcementId);

    if (countError) {
      throw countError;
    }

    res.status(200).json({
      liked_by_me: !existingLike,
      likes_count: count || 0,
    });
  } catch (error) {
    console.error('Error toggling announcement like:', error);
    res.status(500).json({ message: 'Server error while updating announcement like.' });
  }
};

export const updateEventRsvp = async (req, res) => {
  const { eventId } = req.params;
  const { status } = req.body;
  const allowedStatuses = new Set(['going', 'maybe', 'not_going']);

  if (!isValidUUID(eventId)) {
    return res.status(400).json({ message: 'Invalid event ID format.' });
  }

  if (!allowedStatuses.has(status)) {
    return res.status(400).json({ message: 'RSVP status must be going, maybe, or not_going.' });
  }

  try {
    const { data: rsvp, error } = await supabase
      .from('event_rsvp')
      .upsert(
        {
          event_id: eventId,
          user_id: req.user.id,
          status,
        },
        { onConflict: 'event_id,user_id' }
      )
      .select('rsvp_id, event_id, user_id, status, created_at')
      .single();

    if (error) {
      throw error;
    }

    const { data: rsvps, error: rsvpCountError } = await supabase
      .from('event_rsvp')
      .select('status')
      .eq('event_id', eventId);

    if (rsvpCountError) {
      throw rsvpCountError;
    }

    const rsvp_counts = rsvps.reduce(
      (counts, item) => ({
        ...counts,
        [item.status]: (counts[item.status] || 0) + 1,
      }),
      { going: 0, maybe: 0, not_going: 0 }
    );

    res.status(200).json({
      rsvp,
      rsvp_counts,
      my_rsvp: status,
    });
  } catch (error) {
    console.error('Error updating event RSVP:', error);
    res.status(500).json({ message: 'Server error while updating RSVP.' });
  }
};
