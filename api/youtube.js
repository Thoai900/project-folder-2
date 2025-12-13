// Serverless function: Fetch YouTube transcript text
// Note: Ensure dependency installed in project root: npm install youtube-transcript
// Optionally protect this endpoint with auth if needed (similar to gemini.js)

const { YoutubeTranscript } = require('youtube-transcript');

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { url } = req.body || {};
    if (!url) return res.status(400).json({ error: 'Thiếu URL video YouTube' });

    try {
        const transcriptItems = await YoutubeTranscript.fetchTranscript(url);
        const fullText = transcriptItems.map(item => item.text).join(' ');
        return res.status(200).json({ text: fullText });
    } catch (error) {
        console.error('❌ Lỗi lấy phụ đề YouTube:', error);
        return res.status(500).json({ error: 'Không lấy được phụ đề. Video có thể không có CC.' });
    }
};
