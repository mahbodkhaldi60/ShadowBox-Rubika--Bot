const { cancelNextUser } = require("../keybord/AllKeybord")
const { sendSmartMessage, } = require("../services/rubikaApi.service");
const { User } = require("../../models")

async function sendDirectHandler({ action, anyChatId, user, previousState }) {


    const targetRubikaId = action.replace("SEND_DIRECT_", "");

    const targetUser = await User.findOne({ rubikaId: targetRubikaId });

    if (!targetUser) {
        await sendSmartMessage(anyChatId, "کاربر مقصد پیدا نشد 😕");
        return { nextState: "NORMAL" };
    }

    if (targetUser.rubikaId === user.rubikaId) {
        await sendSmartMessage(anyChatId, "به خودت دایرکت بدی؟ 😄 آینه که نیست داداش!");
        return { nextState: "NORMAL" };
    }

    if (previousState == "SEND_DIRECT_MESSAGE") {
        await sendSmartMessage(anyChatId, "اروم تر بابا روبيكا كنده كند ترش نكن تو در حال دايركت دادني 😂");
        return { nextState: "SEND_DIRECT_MESSAGE" };


    }

    await User.updateOne(
        { rubikaId: user.rubikaId },
        {
            $set: {
                state: "SEND_DIRECT_MESSAGE",
                directTargetRubikaId: targetUser.rubikaId
            }

        }
    );

    await sendSmartMessage(
        anyChatId,
        `📩 پیام دایرکتت رو برای ${targetUser.profileName || "این کاربر"} بنویس:\n` +
        `هرچی می‌خوای بگو، فقط باکلاس 😄`
        , { keypad: cancelNextUser });

    return {
        nextState: "SEND_DIRECT_MESSAGE"
    };

}
module.exports = { sendDirectHandler }