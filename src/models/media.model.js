const mongoose = require('mongoose');

const MediaSchema = new mongoose.Schema({
    url: { type: String, required: true }, // Đường dẫn không bảo mật (http)
    secure_url: { type: String }, // Đường dẫn bảo mật (https)
    public_id: { type: String, required: true }, // ID công khai do Cloudinary cung cấp hoặc bạn đặt
    format: { type: String }, // Định dạng file (jpg, png, mp4, mp3, v.v.)
    resource_type: { type: String }, // Loại tài nguyên (image, video, audio, raw)
    width: { type: Number }, // Chiều rộng (nếu là ảnh/video)
    height: { type: Number }, // Chiều cao (nếu là ảnh/video)
    bytes: { type: Number }, // Kích thước file (tính bằng byte)
    original_filename: { type: String }, // Tên gốc của file khi upload

    // Dành cho video/audio
    duration: { type: Number }, // Thời lượng (tính bằng giây)
    frame_rate: { type: Number }, // Tốc độ khung hình (chỉ với video)
    bit_rate: { type: Number }, // Tổng bitrate của file

    audio: {
        codec: { type: String }, // Loại codec âm thanh (vd: aac)
        frequency: { type: Number }, // Tần số âm thanh (Hz)
        channels: { type: Number }, // Số kênh âm thanh (vd: 2 = stereo)
        bit_rate: { type: Number }, // Bitrate của phần âm thanh
    },

    video: {
        codec: { type: String }, // Loại codec video (vd: h264)
        level: { type: Number }, // Level của codec video (vd: 4.0)
        profile: { type: String }, // Profile video (vd: high, main)
        bit_rate: { type: Number }, // Bitrate phần video
        bit_rate_mode: { type: String }, // Chế độ bitrate (vd: cbr, vbr)
    },
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

const Media = mongoose.model('Media', MediaSchema);

module.exports = Media;
