

const { User } = require("../../models.js")
const { sendSmartMessage } = require("../services/rubikaApi.service")

async function rejectChatHandler({ action, user, anyChatId }) {

    const requesterRubikaId = action.replace("REJECT_CHAT_", "");

    const requesterUser = await User.findOne({ rubikaId: requesterRubikaId });

    if (!requesterUser) {
        await sendSmartMessage(anyChatId, "کاربری که درخواست داده بود پیدا نشد 😕");
        return { nextState: "NORMAL" };
    }

    const findpendingChatRequest = user.pendingChatRequestFrom.find(
        item => item.rubikaId === requesterRubikaId
    );

    if (!findpendingChatRequest) {
        await sendSmartMessage(anyChatId, "این درخواست چت معتبر نیست یا قبلاً بررسی شده 😕");
        return { nextState: "NORMAL" };
    }

    await User.updateOne(
    
        { rubikaId: user.rubikaId },
        {
            $pull: {
                pendingChatRequestFrom: {
                    rubikaId: requesterRubikaId
                }
            }
        }
    );


    await sendSmartMessage(
        requesterUser.chatId,
        `❌ درخواست چتت توسط ${user.profileName || "کاربر مقصد"} رد شد.\n\n` +
        `اشکال نداره، دریا پر از ماهیه 🐟😄`
    );

    await sendSmartMessage(
        anyChatId,
        "درخواست چت رو رد کردی ❌"
    );


    return {
        nextState: "NORMAL"
    };
}

module.exports = { rejectChatHandler }