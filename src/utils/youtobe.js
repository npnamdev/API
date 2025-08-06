const axios = require('axios');
const YOUTUBE_API_KEY = 'AIzaSyBSXzFCz9QuWej6LwD9zDjkyu9us_sItn4';

async function getYoutubeVideoDuration(videoUrl) {
    const videoId = extractVideoId(videoUrl);
    if (!videoId) return null;

    const url = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`;
    try {
        const res = await axios.get(url);
        const duration = res.data.items?.[0]?.contentDetails?.duration;
        return duration || null;
    } catch (err) {
        console.error('YouTube API error:', err.message);
        return null;
    }
}

function extractVideoId(url) {
    const match = url.match(
        /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    return match ? match[1] : null;
}

module.exports = getYoutubeVideoDuration;
