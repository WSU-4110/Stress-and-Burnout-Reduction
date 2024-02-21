// Import forum API endpoints
import { onCreateForumPost, onUpdateLikesDislikes, onFetchForumPosts } from './api/forum';

addEventListener('fetch', event => {
    const { request } = event;
    const { pathname } = new URL(request.url);

    if (pathname.startsWith('/api/forum/posts') && request.method === 'GET') {
        return event.respondWith(onFetchForumPosts(request));
    }

    if (pathname.startsWith('/api/forum/post') && request.method === 'POST') {
        return event.respondWith(onCreateForumPost(request));
    }

    if (pathname.startsWith('/api/forum/likes') && request.method === 'POST') {
        return event.respondWith(onUpdateLikesDislikes(request));
    }

});
