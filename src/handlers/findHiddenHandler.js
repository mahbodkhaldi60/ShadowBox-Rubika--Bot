const { sendSmartMessage } = require("../services/rubikaApi.service");
const { User, Message, Counter } = require("../../models.js");
const { CANCEL_KEYPAD } = require("../keybord/AllKeybord.js")

async function findHiddenHandler({ chatId, baseUrl, user, text, senderId }) {


    const extractedCode = text.replace(baseUrl, "").trim();


    if (extractedCode.length > 0) {

        try {

            const targetUser = await User.findOne({ anonymousName: extractedCode });
            if (!targetUser) {
                await sendSmartMessage(chatId, "❌ همچین کاربری رو پیدا نکردم! لینک خرابه.");
                return;
            }


            if (targetUser.rubikaId !== senderId) {

                await sendSmartMessage(chatId, `🎯 شما در حال ارسال پیام ناشناس به  ${targetUser.firstName}  هستید  هر چي تو دلته رو بهش بگو :) `, { keypad: CANCEL_KEYPAD });


                user.targetId = targetUser.rubikaId;
                return { nextState: "WRITING_MESSAGE" }


            } else {
                await sendSmartMessage(chatId, "ببین عزیزم نمی‌تونی به خودت پیام بدی، عب نداره خودم بعداً بهت پیام میدم!😂");
            }


        }
        catch (error) {
            console.error("Database Error:", error);
            await sendSmartMessage(chatId, "⚠️ خطای سرور. لطفاً بعداً تلاش کنید.");
        }
    }
}

module.exports = {
    findHiddenHandler
}