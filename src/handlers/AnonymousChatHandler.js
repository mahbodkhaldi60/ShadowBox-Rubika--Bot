
const { startAnonymousSearch } = require("../handlers/startAnonymousSearchhandler")
const { hiddenChatKeypad, reportUserKeybord, cancelNextUser, blockUserKeybord, retryOrBackKeyboard, giftShadowCoinKeybord, CANCEL_KEYPAD, AnanomuseChat } = require("../keybord/AllKeybord");
const { sendSmartMessage, editChatkeypad, sendSmartFile, } = require("../services/rubikaApi.service");
const { streamTransferFile } = require("../util/downAndUplod")
const { User } = require("../../models")

async function disconnectAnonymousChat(user1, user2, options = {}) {
    const {
        keepUser1Preference = "",
        keepUser2Preference = "",
        user1State = "NORMAL",
        user2State = "NORMAL"
    } = options;

    user1.anonymousPartnerId = null;
    user1.anonymousPreference = keepUser1Preference
        ? user1.anonymousPreference
        : null;
    user1.state = user1State;

    user2.anonymousPartnerId = null;
    user2.anonymousPreference = keepUser2Preference
        ? user2.anonymousPreference
        : null;
    user2.state = user2State;

    // ریست شمارنده پیام و وضعیت کسر سکه
    user1.sentCount = 0;
    user1.coinDeducted = false;
    user1.isChating = false
    user2.sentCount = 0;
    user2.coinDeducted = false;
    user2.isChating = false
    await Promise.all([
        user1.save(),
        user2.save()
    ]);
}

async function AnonymousChatHandler({
    rubikaUserId,
    text,
    action,
    anyChatId,
    emptyValue,
    chatreply,
    hasFile,
    fileId,
    fileName,
    fileSize,
    messageId
}) {

    const specialTexts = [
        "قطع کردن چت  ❌",
        "ریپورت کاربر ⚠️",
        "بلاک کردن کاربر 🚫",
        "نفر بعدی ⏭️",
        "شدوکارت📄",
        "اهدا شدو کوین 🎁",
        "جست و جوی مجدد 🔎"
    ];
    try {

        console.log(`action  :: ${action}`);


        const NORMAL_STATE = "NORMAL";
        const CHATTING_STATE = "ANONYMOUS_CHATTING";
        const GENDER_SELECT_STATE = "ANONYMOUS_GENDER_SELECT";
        const USER_SEARCH_STATE = "ANONYMOUS_USER_SEARCH";

        const userchat = await User.findOne({ rubikaId: rubikaUserId });

        if (!userchat) {
            return { nextState: NORMAL_STATE };
        }


        if (userchat.state !== CHATTING_STATE || !userchat.anonymousPartnerId) {
            await sendSmartMessage(
                userchat.chatId,
                "❌ شما در چت ناشناس فعالی نیستید.",
                { keypad: hiddenChatKeypad }
            );
            return { nextState: NORMAL_STATE };
        }

        const userchat2 = await User.findOne({ rubikaId: userchat.anonymousPartnerId });

        if (!userchat2) {

            userchat.anonymousPartnerId = null;
            userchat.anonymousPreference = null;
            userchat.state = NORMAL_STATE;
            await userchat.save();

            await sendSmartMessage(
                userchat.chatId,
                "❌ ارتباط ناشناس پیدا نشد. چت بسته شد.",
                { keypad: hiddenChatKeypad }
            );

            return { nextState: NORMAL_STATE };
        }
        const stillConnected =
            userchat2.anonymousPartnerId === userchat.rubikaId &&
            userchat2.state === CHATTING_STATE;

        if (!stillConnected) {
            userchat.anonymousPartnerId = null;
            userchat.anonymousPreference = null;
            userchat.state = NORMAL_STATE;
            await userchat.save();

            await sendSmartMessage(
                userchat.chatId,
                "❌ ارتباط ناشناس دیگر فعال نیست.",
                { keypad: hiddenChatKeypad }
            );

            return { nextState: NORMAL_STATE };
        }



        if (action == "end_chat") {

            console.log("CHECK end_chat =>", action == "end_chat");

            await Promise.allSettled([

                sendSmartMessage(
                    userchat.chatId,
                    `چت رو متوقف كردي برو يه استراحت بكن ${userchat2?.profileName || ""}`,
                    { keypad: hiddenChatKeypad }
                ),

                sendSmartMessage(
                    userchat2.chatId,
                    `طرف مقابل چت رو قطع كرد ${userchat?.profileName || ""}`,
                    { keypad: hiddenChatKeypad }
                )
            ]);



            await disconnectAnonymousChat(userchat, userchat2, {
                user1State: NORMAL_STATE,
                user2State: NORMAL_STATE,

            });

            return { nextState: NORMAL_STATE };
        }
        else if (action == "confirm_report") {

            console.log("CHECK confirm_report =>", action == "confirm_report");

            await Promise.allSettled([
                sendSmartMessage(
                    userchat.chatId,
                    `كاربر مورد نظر با موفقيت ريپورت شد ${userchat2?.profileName || ""}`,
                    { keypad: hiddenChatKeypad }
                ),
                sendSmartMessage(
                    userchat2.chatId,
                    `كاربر شما را ريپورت كرد ${userchat?.profileName || ""}`,
                    { keypad: hiddenChatKeypad }
                )
            ]);

            await Promise.all([
                User.updateOne(
                    { rubikaId: userchat.rubikaId },
                    { $addToSet: { blockedUsers: userchat2.rubikaId } }
                ),
                User.updateOne(
                    { rubikaId: userchat2.rubikaId },
                    { $inc: { reportCount: 1 } }
                ),
                disconnectAnonymousChat(userchat, userchat2, {
                    user1State: NORMAL_STATE,
                    user2State: NORMAL_STATE
                })
            ]);

            return { nextState: NORMAL_STATE };
        }

        else if (action == "confirm_block") {

            console.log("CHECK confirm_block =>", action == "confirm_block");

            await Promise.allSettled([
                sendSmartMessage(
                    userchat.chatId,
                    `شما كاربر رو بلاك كرديد ${userchat2?.profileName || ""}`,
                    { keypad: hiddenChatKeypad }
                ),

                sendSmartMessage(
                    userchat2.chatId,
                    `كاربر شما را بلاك كرد ${userchat?.profileName || ""}`,
                    { keypad: hiddenChatKeypad }
                )

            ]);

            await Promise.all([
                User.updateOne(

                    { rubikaId: userchat.rubikaId },
                    {
                        $addToSet: { blockedUsers: userchat2.rubikaId },
                        $set: {
                            anonymousPartnerId: null,
                            anonymousPreference: null,
                            state: NORMAL_STATE
                        }
                    }
                ),
                User.updateOne(
                    { rubikaId: userchat2.rubikaId },
                    {
                        $set: {
                            anonymousPartnerId: null,
                            anonymousPreference: null,
                            state: NORMAL_STATE
                        }
                    }
                )
            ]);

            return { nextState: NORMAL_STATE };


        }

        else if (action == "confirm_gift_shadow_coin") {


            console.log("CHECK confirm_gift_shadow_coin =>", action == "confirm_gift_shadow_coin");

            const amount = 5;


            if ((userchat.shadowCoin || 0) < amount) {
                await sendSmartMessage(
                    userchat.chatId,
                    "عزیز من تو خودت کوین نداری، ولخرجی نکن 😄"
                );
                return { nextState: CHATTING_STATE };
            }

            const updatedSender = await User.findOneAndUpdate(
                {
                    rubikaId: userchat.rubikaId,
                    shadowCoin: { $gte: amount },
                    anonymousPartnerId: userchat2.rubikaId,
                    state: CHATTING_STATE
                },
                {
                    $inc: { shadowCoin: -amount }
                },
                {
                    returnDocument: 'after'
                }

            );

            if (!updatedSender) {
                await sendSmartMessage(userchat.chatId, "❌ موجودی کافی نیست یا چت دیگر فعال نیست.");

                return { nextState: CHATTING_STATE };
            }

            await User.updateOne(
                { rubikaId: userchat2.rubikaId },
                { $inc: { shadowCoin: amount } }
            );

            await Promise.allSettled([

                sendSmartMessage(
                    userchat.chatId,
                    `✅ شما به این کاربر ${amount} کوین دادید. خدا بهت برکت بده 😄 ${userchat2?.profileName || ""}`,
                ),
                sendSmartMessage(
                    userchat2.chatId,
                    `🎁 این کاربر به تو ${amount} کوین داد. حتماً ازش تشکر کن 😄 ${userchat?.profileName || ""}`,
                )
            ]);

            return { nextState: CHATTING_STATE };
        }

        else if (action == "report_user") {
            await sendSmartMessage(userchat.chatId, ` ایا واقعا مطمئینی کاربر ${userchat2.profileName}رو ریپورت  کنی ؟ `, { inlineKeypad: reportUserKeybord })
            return { nextState: CHATTING_STATE };

        }
        else if (action == "block_user") {
            await sendSmartMessage(userchat.chatId, ` ایا واقعا مطمئینی کاربر ${userchat2.profileName}رو بلاک  کنی ؟ `, { inlineKeypad: blockUserKeybord })
            return { nextState: CHATTING_STATE };

        }
        else if (action == "gift_shadow_coin") {
            await sendSmartMessage(userchat.chatId, ` ایا واقعا مطمئینی به  کاربر ${userchat2.profileName} ؟  5 تا شدو کوین بدی ؟ `, { inlinekeypad: giftShadowCoinKeybord })
            return { nextState: CHATTING_STATE };
        }
        else if (action == "search_again") {

            await Promise.allSettled([
                sendSmartMessage(
                    userchat.chatId,
                    `گفت و گو با كاربر قطع شد جست و جوي جديدي را انجام دهيد ${userchat2?.profileName || ""}`,
                    { keypad: retryOrBackKeyboard }),

                sendSmartMessage(
                    userchat2.chatId,
                    `كاربر چت با شما را قطع كرد ${userchat?.profileName || ""}`,
                    { keypad: hiddenChatKeypad })
            ]);

            await disconnectAnonymousChat(userchat, userchat2, {
                user1State: GENDER_SELECT_STATE,
                user2State: NORMAL_STATE
            });

            await sendSmartMessage(anyChatId, "جنسيت را در جست و جوي تصادفي مشخض كنيد ", { inlinekeypad: AnanomuseChat })

            return { nextState: GENDER_SELECT_STATE };
        }

        else if (action == "next_user") {

            await editChatkeypad(anyChatId)

            const previousPreference = userchat.anonymousPreference || "";

            await Promise.allSettled([
                sendSmartMessage(
                    userchat.chatId,
                    "🔎 در حال جست‌وجوی نفر بعدی با همان فیلتر قبلی...",
                ),

                sendSmartMessage(
                    userchat2.chatId,
                    `❌ طرف مقابل چت را ترک کرد ${userchat?.firstName || ""}`,
                    { keypad: hiddenChatKeypad }
                )
            ]);

            await disconnectAnonymousChat(userchat, userchat2, {
                user1Preference: previousPreference,
                user2Preference: "",
                user1State: USER_SEARCH_STATE,
                user2State: NORMAL_STATE
            });

            const result = await startAnonymousSearch(userchat, previousPreference);

            if (!result.matched) {
                setTimeout(async () => {
                    try {
                        const freshUser = await User.findOne({ rubikaId: userchat.rubikaId });

                        if (!freshUser) return;

                        if (
                            freshUser.state === USER_SEARCH_STATE &&
                            !freshUser.anonymousPartnerId
                        ) {
                            await User.updateOne(
                                { rubikaId: freshUser.rubikaId },
                                {
                                    $set: {
                                        state: USER_SEARCH_STATE,
                                        anonymousPartnerId: null,
                                        anonymousPreference: previousPreference
                                    }
                                }
                            );

                            await sendSmartMessage(
                                freshUser.chatId,
                                ` در حال حاضر کاربری پیدای نشد اما اگه صبر کنی 
                               خیلی طول نمیکشه یه کاربر به تو وصل میشه 
                               در غیر این صورت اگه حوصله نداری می تونی با استفاده از دکمه پایین قید همه چیو بزنی و به صفحه اول برگردی `,
                                { keypad: cancelNextUser }
                            );
                        }
                    } catch (err) {
                        console.log(err);
                    }
                }, 300000);

                return { nextState: USER_SEARCH_STATE };
            }



            await sendSmartMessage(
                userchat.chatId,
                `✅ به یک ناشناس جدید وصل شدی. چت رو شروع کن. ${result?.partner?.firstName || ""}`,
                { keypad: anonymousChatkeypad }
            );

            await sendSmartMessage(
                result.partner.chatId,
                `✅ یک ناشناس جدید بهت وصل شد. چت رو شروع کن. ${userchat?.firstName || ""}`,
                { keypad: anonymousChatkeypad }
            );
            return { nextState: CHATTING_STATE };
        }
        else if (action == "show_profile") {
            const shadowCard = `
           كاربر چت شدو کارت | ShadowCart

${userchat2?.firstName || emptyValue}   /${userchat2?.idCard || emptyValue}

نام : ${userchat2?.profileName || emptyValue}
جنسیت : ${userchat2?.gender || emptyValue}
سن : ${userchat2?.age || emptyValue}
استان : ${userchat2?.province || emptyValue}
شهر : ${userchat2?.city || emptyValue}
            `.trim();

            await sendSmartMessage(userchat.chatId, shadowCard);
            return { nextState: CHATTING_STATE };
        }
        else if (hasFile) {
            let dis =
                `روبيكا دسترسي ارسال عكس فيلم گيف و... رو محدود كرده و امكان ارسال هيچ گونه  موردي بجز متن 
امكان پذير نيست باتشكر از درك شما🩶`
            await sendSmartMessage(userchat.chatId, dis, { replyToMessageId: messageId })
            return { nextState: "ANONYMOUS_CHATTING" };

            console.log("hasFile is run  in chat id 🚀");

            let newFileId = await streamTransferFile(fileId, fileName, fileSize);


            if (!newFileId) {

                await sendSmartMessage(chatId, "فایل با مشکل آپلود شد، دوباره امتحان کن 🌚", {
                });

                return { nextState: "ANONYMOUS_CHATTING" };
            }


            if (text) {

                await sendSmartFile(userchat2.chatId, newFileId, text);
                return { nextState: "ANONYMOUS_CHATTING" };


            } else {
                await sendSmartFile(userchat2.chatId, newFileId);
                return { nextState: "ANONYMOUS_CHATTING" };

            }


        }

        else if (text && !specialTexts.includes(text)) {



            const newSentCount = (userchat.sentCount || 0) + 1;

            if (newSentCount >= 15 && !userchat.coinDeducted) {

                await User.updateOne(
                    {
                        rubikaId: userchat.rubikaId,
                        coinDeducted: { $ne: true },
                        sentCount: 14
                    },
                    {
                        $inc: { shadowCoin: -1, sentCount: 1 },
                        $set: { coinDeducted: true }
                    })
                await sendSmartMessage(userchat.chatId, "کاربر گرامی از شما 1 شدو کوین کم شد");
            }
            else {
                await User.updateOne({ rubikaId: userchat.rubikaId }, { $inc: { sentCount: 1 } })
            }

            await sendSmartMessage(userchat2.chatId, text);



            console.log("----------------------------------------------------------------");
            console.log(` chatreply : ${chatreply}`);
            console.log(`${userchat.firstName} : ${text}  to ===>  ${userchat2.firstName} `);
            console.log("----------------------------------------------------------------");

            return { nextState: CHATTING_STATE };
        }

        return { nextState: CHATTING_STATE };
    } catch (error) {
        console.error("AnonymousChatHandler Error:", error);
        return { nextState: "NORMAL" };
    }
}


module.exports = {
    AnonymousChatHandler
}