
const { getFile, requestSendFile } = require("../services/rubikaApi.service")




function detectFileType(fileName, fileSize) {
    if (!fileName) return null;

    const extension = fileName.split('.').pop().toLowerCase();

    const imageExts = ['jpg', 'jpeg', 'png', 'webp'];
    const voiceExts = ['ogg', 'mp3', 'wav', 'm4a'];
    const videoExt = 'mp4';

    if (imageExts.includes(extension)) return "Image";
    if (voiceExts.includes(extension)) return "Voice";

    if (extension === videoExt) {
        return fileSize && fileSize <= 1.1 * 1024 * 1024 ? "Gif" : "Video";
    }

    return null;
}


async function getDownloadUrl(fileId) {
    try {

        const data = await getFile(fileId)

        if (data.status !== 'OK') {
            console.error("❌ روبیکا به getFile پاسخ خطا داد:", data.status_det || data);
            return null;
        }
        return data.data.download_url;
    } catch (e) {
        console.error("❌ خطا هنگام گرفتن لینک دانلود:", e);
        return null;
    }
}

async function requestUploadUrl(fileType) {
    try {
        const data = await requestSendFile(fileType);

        if (!data?.data?.upload_url) {
            console.error("❌ upload url not found:", data);
            return null;
        }

        return data.data.upload_url;
    } catch (e) {
        console.error("❌ requestUploadUrl error:", e);
        return null;
    }
}


async function streamTransferFile(fileId,fileName, fileSize) {

    try {

        const downloadUrl = await getDownloadUrl(fileId);
        console.log(`📥 downlod link: ${downloadUrl}`);

        if (!downloadUrl) return null;

        const fileType = detectFileType(fileName, fileSize);


        if (!fileType) {
            console.log("❌ نوع فایل پشتیبانی نمیشه (شاید ویدیوعه!)");
            return null;
        }

        const uploadUrl = await requestUploadUrl(fileType);
        console.log(`📤 لینک آپلود : ${uploadUrl}`);

        if (!uploadUrl) return null;

        const downloadResponse = await fetch(downloadUrl);

        console.log("وضعیت دانلود:", downloadResponse.status);
        console.log("نوع محتوا:", downloadResponse.headers.get("content-type"));

        if (!downloadResponse.ok) {
            throw new Error("❌ خطا در دانلود فایل از روبیکا");
        }

        console.log("✅ دانلود انجام شد، در حال آماده‌سازی برای آپلود...");

        const fileBuffer = Buffer.from(await downloadResponse.arrayBuffer());
        const formData = new FormData();

        formData.append("file", fileBuffer, fileName);

        const uploadResponse = await fetch(uploadUrl, {
            method: "POST",
            body: formData
        });

        const uploadData = await uploadResponse.json();

        console.log("------------------ خروجی روبیکا ------------------");
        console.log(JSON.stringify(uploadData, null, 2));
        console.log("--------------------------------------------------");

        if (!uploadData.data?.file_id && !uploadData.file_id) {
            console.log("❌ آپلود شکست خورد:", uploadData);
            return null;
        }

        console.log("✅ فایل با موفقیت و در کمترین زمان منتقل شد 😎");

        // برگردوندن file_id جدید
        return uploadData.data?.file_id || uploadData.file_id;

    } catch (error) {
        console.error("❌ خطای انتقال فایل:", error);
        return null;
    }
}

module.exports = {
    getDownloadUrl,
    requestUploadUrl,
    streamTransferFile,
}