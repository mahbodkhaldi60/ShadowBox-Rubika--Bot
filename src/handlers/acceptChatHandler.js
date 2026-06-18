const { User } = require("../../models.js");
const { sendSmartMessage } = require("../services/rubikaApi.service");
const { UserListKeybord } = require("../keybord/AllKeybord.js");

async function acceptChatHandler({ action, user, anyChatId }) {
    const requesterRubikaId = action.replace("ACCEPT_CHAT_", "");
    const requesterUser = await User.findOne({ rubikaId: requesterRubikaId });
    if (!requesterUser) {
        await sendSmartMessage(anyChatId, "کاربری که درخواست داده بود پیدا نشد 😕");
        return { nextState: "NORMAL" };
    }
    if (requesterUser.rubikaId === user.rubikaId) {
        await sendSmartMessage(anyChatId, "خودت با خودت چت کنی؟ 😄 این دیگه گفت‌وگوی درونیه!");
        return { nextState: "NORMAL" };
    }
    const pendingList = user.pendingChatRequestFrom || [];
    const foundPendingChatRequest = pendingList.find(
        (item) => item.rubikaId === requesterUser.rubikaId
    );
    if (!foundPendingChatRequest) {
        await sendSmartMessage(anyChatId, "این درخواست چت معتبر نیست یا قبلاً بررسی شده 😕");
        return { nextState: "NORMAL" };
    }

    await User.updateOne(
        { rubikaId: user.rubikaId },

        {
            $set: {
                state: "CHATING_USERS_LIST",
                anonymousPartnerId: requesterUser.rubikaId,
                isChating: true,
            },
            $pull: {
                pendingChatRequestFrom: {
                    rubikaId: requesterUser.rubikaId
                }
            }
        }
    );

    await User.updateOne(
        { rubikaId: requesterUser.rubikaId },
        {
            $set: {
                state: "CHATING_USERS_LIST",
                anonymousPartnerId: user.rubikaId,
                isChating: true,
                isRequester: true
            }
        }
    );


    await Promise.allSettled([
        sendSmartMessage(
            requesterUser.chatId,
            `✅ درخواست چتت توسط ${user.profileName || "کاربر مقصد"} قبول شد!\n\nحالا می‌تونی با این کاربر گفت‌وگو کنی 💬`,
            { keypad: UserListKeybord }
        )
        ,
        sendSmartMessage(
            anyChatId,
            `✅ درخواست چت رو قبول کردی.\n\nحالا می‌تونید با هم حرف بزنید 💬`,
            { keypad: UserListKeybord }

        )
    ]);

    return { nextState: "CHATING_USERS_LIST" };
}

module.exports = { acceptChatHandler };
