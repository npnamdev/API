const axios = require('axios');
const YOUTUBE_API_KEY = 'AIzaSyBSXzFCz9QuWej6LwD9zDjkyu9us_sItn4';

// Chuyển "PT1H3M40S" => 3820 (giây)
function parseISODuration(isoDuration) {
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    const hours = parseInt(match?.[1] || 0, 10);
    const minutes = parseInt(match?.[2] || 0, 10);
    const seconds = parseInt(match?.[3] || 0, 10);
    return hours * 3600 + minutes * 60 + seconds;
}

async function getYoutubeVideoDuration(videoUrl) {
    const videoId = extractVideoId(videoUrl);
    if (!videoId) return null;

    const url = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`;
    try {
        const res = await axios.get(url);
        const isoDuration = res.data.items?.[0]?.contentDetails?.duration;
        if (!isoDuration) return null;

        return parseISODuration(isoDuration); // Trả về số giây
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
