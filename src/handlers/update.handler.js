const { User, Message, Counter } = require("../../models.js");
const { randomData } = require("../../RandomMessage");
const { aliasRegex, profanityRegex } = require("../constants/regex.js")
const { CANCEL_KEYPAD, MAIN_KEYPAD, getActionInlineKeyboard,
    shadowShapKeybord, listAgeChat, listProvincesChat,
    anonymousChatKeypad, AnanomuseChat, complateProfile,
    hiddenChatKeypad, paymentKeyboard, cancelShadowcoin, cancelNextUser,
    createChatRequestKeyboard, createAcceptChatKeyboard,
    mainList,
    shadowCoinGiftKeyboard, editProfile } = require("../keybord/AllKeybord")
const { STATES } = require("../constants/state")
const { sendSmartMessage, sendSmartFile, editMessageKeypad, deleteMessage, editChatKeypad } = require("../services/rubikaApi.service");
const { streamTransferFile } = require("../util/downAndUplod.js");
const { createLink } = require("../services/hiddenLink.service.js")
const { findOrCreateUser } = require("../services/user.service");
const { hiddenActionHandler } = require("./hiddenChatAction")
const { findHiddenHandler } = require("./findHiddenHandler.js")
const { baseUrl } = require("../constants/urls.js")
const { startHandler } = require("./start.handler.js");
const { cancelHandler } = require("./cancelHandler.js")
const { findCodeHandler } = require("./findCodeHandler.js")
const { blockUSerHandler } = require("./blockUserHandler.js")
const { writingMessageHandler } = require("./writingMessageHandler.js");
const { checkAntiSpam, lockUser, unlockUser, setCooldown } = require("../util/antispam.js")
const { handleLocationInlineButtons, showProvinces } = require("../keybord/provinces.js")
const { startAnonymousSearch } = require("../handlers/startAnonymousSearchhandler.js");
const { AnonymousChatHandler } = require("../handlers/AnonymousChatHandler.js")
const { requestchatHandler } = require("../handlers/requestchatHandler.js")
const { acceptChatHandler } = require("../handlers/acceptChatHandler.js")
const { rejectChatHandler } = require("../handlers/rejectChatHandler.js")
const { sendDirectHandler } = require("../handlers/sendDirectHandler.js")
const { UserListAnonymousChat } = require("../handlers/userListChatingHandler.js")
const { sendDirectMessage } = require("../handlers/sendDirectMessage.js")
const { sendUserListPage } = require("../handlers/userListHandler.js")
async function handleUpdate(update) {
    const messageData = update.update?.new_message || {}
    const type = update.update?.type;
    const chatId = update.update?.chat_id;
    const buttonId = messageData?.aux_data?.button_id
    const chatreply = messageData?.reply_to_message_id
    const { text, message_id: messageId, sender_id: senderId, aux_data } = messageData
    const fileObj = messageData?.file;
    const hasFile = fileObj ? true : false;
    const fileId = messageData.file?.file_id || null
    console.log(`fileObj :${fileObj} ,fileId:${fileId}`);
    const fileName = messageData.file?.file_name || null
    const fileSize = messageData.file?.size || null
    const time = update?.update?.time;
    // ----------------------------------------------------------------------------------------
    const inlineMsg = update?.inline_message
    const inlineButtonId = inlineMsg?.aux_data?.button_id;
    const inlineChatid = inlineMsg?.chat_id
    const anyChatId = chatId || inlineChatid
    const clickerChatId = inlineMsg?.chat_id;
    const clickerId = inlineMsg?.sender_id
    const textBtn = inlineMsg?.text
    const rubikaKeyPadMessageId = inlineMsg?.message_id
    const rubikaUserId = senderId || clickerId;
    let targetMessageId = null
    const action = inlineButtonId || buttonId || null;
    const antiSpam = checkAntiSpam(rubikaUserId)
    if (!antiSpam.ok) {
        console.log("Anti spam blocked:", antiSpam.reason, rubikaUserId)
        return
    }

    let user = await User.findOne({ rubikaId: rubikaUserId });


    const emptyValue = "ثبت نشده"
    function getSmartLastOnline(lastOnline) {
        if (!lastOnline) return "نامشخص";

        const now = Date.now();
        const diffMs = now - lastOnline;

        const minutes = Math.floor(diffMs / 60000);
        const hours = Math.floor(diffMs / 3600000);
        const days = Math.floor(diffMs / 86400000);

        if (minutes < 3) return "آنلاين👀";
        if (minutes < 60) return `${minutes} دقیقه پیش`;
        if (hours < 24) return `${hours} ساعت پیش`;
        if (days <= 7) return `${days} روز پیش`;

        return "خیلی وقت پیش";
    }


    function getPersianDateTime(timestamp = Date.now()) {
        const date = new Date(timestamp);

        const options = {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",

        };

        return new Intl.DateTimeFormat("fa-IR-u-nu-latn", options).format(date);
    }


    let shadowCard = `
🦇✨ شدو کارت | ShadowCart ✨🦇

سلام ${user?.firstName || emptyValue} عزیز! 👋 
آیدی کارت شما: /${user?.idCard || emptyValue}  🕵️‍♂️

- - - - - - - - - - - - - - - - - - - - - - - - - - 

👤 نام پروفایل: ${user?.profileName || emptyValue}
🎭 جنسیت: ${user?.gender || emptyValue}
🎂 سن: ${user?.age || emptyValue} (بزنم به تخته😎)
🏙️ استان: ${user?.province || emptyValue}
📍 شهر: ${user?.city || emptyValue}
⌛آخرين بازديد : ${getSmartLastOnline(user?.lastOnline || emptyValue)}
${user?.isChating ? "درحال چت💬" : ""} 
- - - - - - - - - - - - - - - - - - -  - - - - - -

    امیدواریم از سایه‌ها لذت ببری! 🥷🔥
`;

    let info = `
62198618795054 به نام مهبد خالدی
رسید متنی رو ارسال کنید 💌
در صورت ارسال فیش فیک به مدت سه روز بن می شوید
`
    let previousState = user ? user.state : "NORMAL";
    let nextState = null;
    lockUser(rubikaUserId)

    await findOrCreateUser(rubikaUserId, anyChatId, time)


    try {
        if (text === "/start") {

            let random = Math.floor(Math.random() * randomData.startMessages.length)
            let showMessage = randomData.startMessages[random] + "\n \n + اگه می خوای به کسی پیام بدی لینکشو برام بفرست 🕵🏼 :)\n" + "ربات كار مي كنه فقط بخاطر روبيكا كنده";
            await sendSmartMessage(chatId, showMessage, { keypad: MAIN_KEYPAD })
            user.targetId = null
            user.anonymousPreference = ""
            user.anonymousPartnerId = null
            user.sentCount = 0
            user.coinDeducted = false
            nextState = "NORMAL"

        }
        else if (action == "cancel_main") {

            await cancelHandler({ user, chatId })
        }
        else if (text == "بازگشت 🏠") {

            await sendSmartMessage(chatId, "به صفحه اصلي بازگشتيد", { keypad: MAIN_KEYPAD })
            nextState = "NORMAL"
        }
        else if (action == "go_back") {

            await sendSmartMessage(chatId, "به صفحه اصلی بازگشتید 🎊", { keypad: hiddenChatKeypad })

            user.anonymousPreference = ""

            nextState = "NORMAL"
        }
        else if (action == "cancel_Next_User") {

            user.anonymousPreference = ""
            user.anonymousPartnerId = ""
            await sendSmartMessage(chatId, "عملیات لغو شد ! برگشتیم به منوی اصلی🚫", { keypad: hiddenChatKeypad });
            nextState = "NORMAL"
        }
        else if (action == "cancel_Shadow_coin") {
            user.anonymousPreference = ""
            user.anonymousPartnerId = ""
            await sendSmartMessage(chatId, " عملیات لغو  شد! برگشتیم به منوی شدو کوین 🚫", { keypad: shadowShapKeybord });
            user.giftTargetRubikaId = null
            nextState = "NORMAL"

        }
        else if (previousState == "ENTER_CARD_ID") {
            try {

                if (text && aliasRegex.test(text)) {

                    const idcard = text.startsWith("/") ? text.substring(1) : text;
                    const globalUser = await User.findOne({ idCard: idcard });

                    if (!globalUser) {
                        await sendSmartMessage(
                            anyChatId,
                            `همچین کاربری یافت نشد، دوباره بررسی کن چون اشتباس 😅
                            عزیزم لطفاً با این ساختار پیام رو ارسال کن: \n\n / shh123abc
    `,
                            { keypad: cancelShadowcoin }
                        );

                        return {
                            nextState: "ENTER_CARD_ID"
                        };
                    }

                    if (globalUser.rubikaId == user.chatId) {
                        await sendSmartMessage(
                            anyChatId,
                            "عزیزم به خودت نمی‌تونی شدوکوین هدیه بدی 😄",
                            { keypad: cancelShadowcoin }
                        );

                        return {
                            nextState: "ENTER_CARD_ID"
                        };
                    }

                    await User.updateOne(
                        { rubikaId: user.chatId },
                        {
                            $set: {
                                giftTargetRubikaId: globalUser.rubikaId,
                            }
                        }
                    );

                    const textss = `
بعد از انتخاب گزینه‌های زیر، می‌تونی به ${globalUser?.profileName || "این کاربر"} در ${globalUser?.city || "شهر نامشخص"} شدوکوین بفرستی 🎁
`;
                    await sendSmartMessage(anyChatId, textss, { inlineKeypad: shadowCoinGiftKeyboard });


                    nextState = "SEND_SHADOW_COIN_TO_USER"


                }
            } catch (error) {
                console.log("ERROR IN ENTER_CARD_ID", error);
            }
        }
        else if (previousState === "SEND_SHADOW_COIN_TO_USER") {
            try {
                const giftMap = {
                    gift_5_shadowcoin: 5,
                    gift_10_shadowcoin: 10,
                    gift_15_shadowcoin: 15,
                    gift_25_shadowcoin: 25,
                    gift_50_shadowcoin: 50,
                    gift_100_shadowcoin: 100
                };

                const giftAmount = giftMap[action];

                if (!giftAmount) {
                    await sendSmartMessage(
                        anyChatId,
                        "لطفاً یکی از گزینه‌های هدیه شدوکوین را انتخاب کن 🎁",
                        { inlineKeypad: shadowCoinGiftKeyboard }
                    );

                    return {
                        nextState: "SEND_SHADOW_COIN_TO_USER"
                    };
                }

                const sender = await User.findOne({ rubikaId: user.chatId });

                if (!sender || !sender.giftTargetRubikaId) {
                    await sendSmartMessage(
                        anyChatId,
                        "کاربر مقصد پیدا نشد. لطفاً دوباره آیدی کارت کاربر را وارد کن.",
                        { keypad: cancelShadowcoin }
                    );

                    return {
                        nextState: "ENTER_CARD_ID"
                    };
                }

                const receiver = await User.findOne({
                    rubikaId: sender.giftTargetRubikaId
                });

                if (!receiver) {
                    await sendSmartMessage(
                        anyChatId,
                        "کاربر مقصد دیگر پیدا نشد. لطفاً دوباره تلاش کن.",
                        { keypad: cancelShadowcoin }
                    );

                    await User.updateOne(
                        { rubikaId: sender.rubikaId },
                        {
                            $set: {
                                giftTargetRubikaId: "",
                            }
                        }
                    );

                    return {
                        nextState: "ENTER_CARD_ID"
                    };
                }

                if ((sender.shadowCoin || 0) < giftAmount) {
                    await sendSmartMessage(
                        anyChatId,
                        `موجودی شدوکوینت کافی نیست 😅\n\nموجودی شما: ${sender.shadowCoin || 0} \nمقدار هدیه: ${giftAmount} `,
                        { keypad: shadowCoinGiftKeyboard }
                    );

                    return {
                        nextState: "SEND_SHADOW_COIN_TO_USER"
                    };
                }

                await User.updateOne(
                    { rubikaId: sender.rubikaId },
                    {
                        $inc: {
                            shadowCoin: -giftAmount
                        },
                        $set: {
                            giftTargetRubikaId: "",
                        }
                    }
                );

                await User.updateOne(
                    { rubikaId: receiver.rubikaId },
                    {
                        $inc: {
                            shadowCoin: giftAmount
                        }
                    }
                );

                await sendSmartMessage(
                    anyChatId,
                    `✅ با موفقیت ${giftAmount} شدوکوین به ${receiver.profileName || "کاربر موردنظر"} هدیه دادی 🎁`,
                    { keypad: hiddenChatKeypad }
                );

                await sendSmartMessage(
                    receiver.chatId,
                    `🎁 تبریک!\n${sender.profileName || "یک کاربر"} بهت ${giftAmount} شدوکوین هدیه داد.`
                );
                return {
                    nextState: "NORMAL"
                };

            } catch (error) {
                console.log(`ERROR IN SEND_SHADOW_COIN_TO_USER: `, error);

                await sendSmartMessage(
                    anyChatId,
                    "یه خطا پیش اومد. لطفاً دوباره تلاش کن 🙏"
                );

                return {
                    nextState: "NORMAL"
                };
            }
        }
        else if (text && aliasRegex.test(text)) {

            const idcard = text.startsWith("/") ? text.substring(1) : text;

            const grobaleUesr = await User.findOne({ idCard: idcard })

            let shadowUserCard = `
🦇✨ شدو کارت | ShadowCart ✨🦇

آیدی کارت: /${grobaleUesr?.idCard || emptyValue}  🕵️‍♂️

    - - - - - - - - - - - - - - - - - - - - - - - - - 
👤 نام پروفایل: ${grobaleUesr?.profileName || emptyValue}
🎭 جنسیت: ${grobaleUesr?.gender || emptyValue}
🎂 سن: ${grobaleUesr?.age || emptyValue} 
🏙️ استان: ${grobaleUesr?.province || emptyValue}
📍 شهر: ${grobaleUesr?.city || emptyValue}
⌛آخرين بازديد: ${getSmartLastOnline(grobaleUesr?.lastOnline || emptyValue)}
${user.isChating ? "درحال چت💬" : ""} 
- - - - - - - - - - - - - - - - - - - - - - - - -
    `;

            if (!grobaleUesr) {
                await sendSmartMessage(anyChatId, "همچین کاربری یافت نشد دوباره ببین چون اشتباس ")
                return {
                    nextState: "NORMAL"
                }
            }

            const keyboard = createChatRequestKeyboard(grobaleUesr.rubikaId);

            await sendSmartMessage(anyChatId, shadowUserCard, { inlineKeypad: keyboard })
        }
        else if (previousState === "CHATING_USERS_LIST") {

            await UserListAnonymousChat({
                rubikaUserId,
                text,
                action,
                emptyValue,
            })

        }
        else if (action == "Edit_Name") { }
        else if (action == "Edit_gender") { }
        else if (action == "Edit_age") { }
        else if (action == "Edit_city") { }

        else if (action && action.startsWith("REQUEST_CHAT_")) {
            await requestchatHandler({ action, user, anyChatId })
        }
        else if (action && action.startsWith("ACCEPT_CHAT_")) {
            await acceptChatHandler({ action, user, anyChatId })
        }
        else if (action && action.startsWith("REJECT_CHAT_")) {
            await rejectChatHandler({ action, user, anyChatId })
        }
        else if (action && action.startsWith("SEND_DIRECT_")) {
            await sendDirectHandler({ action, anyChatId, user, previousState })
        }
        else if (previousState === "SEND_DIRECT_MESSAGE") {
            await sendDirectMessage({ user, text, anyChatId })
        }
        else if (textBtn == `پاسخ 💬` || textBtn == "سین شد ✔️" || textBtn == "بلاک 🚫" || textBtn == "آنبلاک 🔓") {
            let hiddenReturn = await hiddenActionHandler({
                inlineButtonId,
                clickerChatId,
                previousState,
                rubikaKeyPadMessageId,
                user,
                senderId
            })

            nextState = hiddenReturn.nextState
            targetMessageId = hiddenReturn?.targetMessageId
        }
        else if (text && text.startsWith(baseUrl)) {

            let resalt = await findHiddenHandler({ chatId, baseUrl, user, text, senderId })


            if (resalt?.nextState) {
                nextState = resalt.nextState;
            };


        }
        else if (text && profanityRegex.test(text)) {

            let rand = Math.floor(Math.random() * randomData.sadReplies.length)
            sadRepliess = randomData.sadReplies[rand]
            await sendSmartMessage(chatId, sadRepliess, { replyToMessageId: messageId })

        }
        else if (previousState == "WRITING_MESSAGE") {

            let state = await writingMessageHandler({
                user,
                senderId,
                chatId,
                text,
                messageId,
                hasFile,
                fileId,
                fileName,
                fileSize,
                targetMessageId
            })

            nextState = state.nextState

        }
        else if (text == "چت با ناشناس💬" || text == "/hidden_chat") {

            await sendSmartMessage(chatId, "به چت با ناشناس خوش آمدي 🎊", { keypad: hiddenChatKeypad })
        }
        else if (action == "602" && text == "پروفايل 👤") {

            if (user.completeProfile) {
                await sendSmartMessage(chatId, shadowCard, { inlineKeypad: complateProfile })
            }
            await sendSmartMessage(chatId, shadowCard, { inlineKeypad: complateProfile })
            nextState = "NORMAL"

        }
        else if (action == "603") {

            let shadwowShap = `
🏦💸 بخش مالی «شدو باکس» 💸🏦

🛒 فروشگاه: خرید شدوکوین برای وقتایی که خشابت خالیه!
🔄 انتقال وجه: جابجایی کوین بین کاربرا(کارت به کارت بدون کارمزد! 💳)

    - - - - - - - - - - - - - - - 
💰 تعداد شددو کوین ها: ${user.shadowCoin}
- - - - - -  - - - - - - - - -
📜 تعرفه‌های چت(خرج و مخارج):

🕵️‍♂️ چت ناشناس: کسر 2 کوین(یک‌بار در شروع)
✉️ دایرکت: کسر 1 شدو کوین(هر پیام - کم گویی و گزیده گو)
🙋‍♂️ درخواست چت: کسر 4 کوین(پیش‌قدم شدن هزینه داره دیگه!)

    `

            await sendSmartMessage(anyChatId, shadwowShap, { keypad: shadowShapKeybord })

        }
        else if (action == "transfer_shadow_coin") {

            await sendSmartMessage(anyChatId, "شدو ایدی اون کاربری که می خواهی بهش کوین بدی رو اینجا وارد کن ", { keypad: cancelNextUser })

            nextState = "ENTER_CARD_ID"
        }
        else if (action == "buy_shadow_coin") {
            let buyinfo = `
سلام و درود به تو رفیقِ شفیق! 👋❤️

راست و حسینی بخوام بهت بگم... سرپا نگه داشتن این ربات، اونم تو بدترین حالت، ماهی چند میلیون تومن هزینه‌های جانبی رو دستمون می‌ذاره! 😅💸 
واقعیتش این کار درآمد خاصی برای من نداره و فقط و فقط به عشق شما و علاقه‌ام به این حوزه توسعه‌اش دادم.پس دمت گرم که شرایط رو درک می‌کنی و با حمایتت بهمون انرژی می‌دی! 🫂🛠️


🛒 💳 قوانین خرید شدوکوین

1. 📝 ارسال فیش متنی: وقتی گزینه ارسال فیش رو زدی، حتماً فیش واریزی رو به صورت «متنی» بفرست.

2. ⏳ زمان واریز: شدوکوین‌های شما بین 24 الی 48 ساعت کاری به حسابتون اضافه می‌شه. (یکم صبوری کن، کوین‌هات تو راهه! 😉)

3. ⚠️ دقت در مبلغ: لطفاً مبلغ رو دقیقاً مطابق تعرفه‌ها واریز کن.اگه مبلغ کمتر یا بیشتر از تعرفه باشه، متأسفانه شدوکوینی واریز نمی‌شه!(حساب و کتابه دیگه، مو لا درزش نمی‌ره! 🧐🧮)

4. 📬 محل ارسال فیش: لطفاً فیش‌ها رو فقط همینجا(داخل ربات) بفرستید.پی‌وی به‌شدت شلوغه و اولویت بررسی با پیام‌های داخل رباته.

💳 اطلاعات حساب:

شماره کارت: 62198618795054
به نام: مهبد خالدی

👨‍💻 در صورت بروز هرگونه مشکل اساسی، می‌تونی به آیدی پشتیبانی پیام بدی:

🆔 @mahbodkhaldi


مرسی که هستی و حمایت می‌کنی! بریم واسه ترکوندن! 💥🚀

`
            await sendSmartMessage(anyChatId, buyinfo, { inlineKeypad: paymentKeyboard })
        }
        else if (action == "back_Coin") {

            await sendSmartMessage(chatId, "از قسمت شدو کوین بیرون اومدیم ", { keypad: hiddenChatKeypad });
            nextState = "NORMAL"
        }
        else if (action == "complateProfile") {

            console.log("complateProfile clicked")

            await sendSmartMessage(anyChatId, "در حال تكلميل پروفايل ")
            await sendSmartMessage(anyChatId, "اسم تو جيه ؟ ")

            nextState = "TYPENAME"

        }
        else if (previousState == "TYPENAME") {
            let name = text.trim()

            if (!name) {
                await sendSmartMessage(chatId, "اسمي وارد نشده است لطفا دوباره تلاش كنيد", { replyToMessageId: messageId })
            }

            user.profileName = text

            let titles = ` چه اسم قشنگي داري ${name} خوش امديي `

            await sendSmartMessage(chatId, titles, { replyToMessageId: messageId })

            await sendSmartMessage(chatId, shadowCard)

            let choseGender = {
                "rows": [{ "buttons": [{ "id": "boy", "type": "Simple", "button_text": "پسر👦🏻" }, { "id": "girl", "type": "Simple", "button_text": "دختر👧🏻" }] },]
            }

            await sendSmartMessage(chatId, "جنسيت خود رو وارد كنيد ", { inlineKeypad: choseGender })
            nextState = "CHOSEGENDER"
        }
        else if (previousState == "CHOSEGENDER") {

            console.log("CHOSEGENDER  block ");

            if (inlineButtonId == "boy") {
                user.gender = "پسر"
                await sendSmartMessage(anyChatId, "سلام به تو داداش گلم : 👦🏻")
                nextState = "CHOSEAGE"
            }

            else if (inlineButtonId == "girl") {
                user.gender = "دختر"
                await sendSmartMessage(anyChatId, "سلام به تو سيسي گلم : 👧🏻")
                nextState = "CHOSEAGE"
            }
            else {
                await sendSmartMessage(chatId, "لطفا يكي از گزينه هاي بالا رو انتخاب كن ", { replyToMessageId: messageId })
                nextState = "CHOSEGENDER"
            }

            const rows = []
            let buttons = []

            for (let age = 12; age <= 60; age++) {

                buttons.push(
                    {
                        id: age.toString(),
                        type: "Simple",
                        button_text: age.toString()
                    })

                if (buttons.length === 6) {
                    rows.push({
                        buttons: buttons

                    })
                    buttons = []
                }
            }
            if (buttons.length > 0) {
                rows.push({
                    buttons: buttons
                })
            }
            const keybord = {
                rows: rows
            }
            console.log(JSON.stringify(rows), null, 2);
            await sendSmartMessage(anyChatId, "سن خود را انتخاب كن", { inlineKeypad: keybord })

        }
        else if (previousState == "CHOSEAGE") {


            if (inlineButtonId) {
                await sendSmartMessage(anyChatId, `سن شما  ${inlineButtonId} است `)
            };

            user.age = inlineButtonId
            await showProvinces(anyChatId)
            nextState = "CHOSEPROVINCES"


        }
        else if (previousState == "CHOSEPROVINCES") {
            console.log(`rubikaKeyPadMessageId 2 : ${rubikaKeyPadMessageId} `);
            let next = await handleLocationInlineButtons({ anyChatId, inlineButtonId, rubikaKeyPadMessageId, user })
            user.completeProfile = true
            nextState = next.nextState

        }
        else if (text == "جست و جو در كاربران📜🔎") {
            const isComplateProfile = user.completeProfile;

            if (!isComplateProfile) {
                await sendSmartMessage(
                    anyChatId,
                    "اول پروفایلتو کامل کن بعد می‌تونی از این بخش استفاده کنی 🌚"
                );
                return;
            }

            user.userListFilter = {
                gender: null,
                minAge: null,
                maxAge: null,
                provinceMode: null
            };

            user.userListPage = 0;
            user.userListUseFallback = false;

            await user.save();

            await sendSmartMessage(anyChatId, "لطفا جنسیت موردنظر برای جست‌وجو رو انتخاب کن", {
                inlineKeypad: AnanomuseChat
            });

            nextState = "CHOSE_GENDER_USERLIST";
        }

        else if (previousState == "CHOSE_GENDER_USERLIST") {
            let preference = null;

            if (inlineButtonId == "justGirl") preference = "دختر";
            else if (inlineButtonId == "justBoy") preference = "پسر";
            else if (inlineButtonId == "justHuman") preference = null;
            else {
                await sendSmartMessage(anyChatId, "لطفا یکی از گزینه‌های جنسیت رو انتخاب کن");
                return;
            }

            user.userListFilter = {
                ...user.userListFilter,
                gender: preference
            };

            await user.save();

            await sendSmartMessage(anyChatId, "رنج سنی موردنظر رو انتخاب کن", {
                inlineKeypad: listAgeChat
            });

            nextState = "CHOSE_AGE_USERLIST";
        }

        else if (previousState == "CHOSE_AGE_USERLIST") {
            let minAge = null;
            let maxAge = null;

            if (inlineButtonId == "1224") {
                minAge = 12;
                maxAge = 24;
            }
            else if (inlineButtonId == "2540") {
                minAge = 25;
                maxAge = 40;
            }
            else if (inlineButtonId == "4160") {
                minAge = 41;
                maxAge = 60;
            }
            else if (inlineButtonId == "allAge") {
                minAge = null;
                maxAge = null;
            }
            else {
                await sendSmartMessage(anyChatId, "لطفا یکی از رنج‌های سنی رو انتخاب کن");
                return;
            }

            user.userListFilter = {
                ...user.userListFilter,
                minAge,
                maxAge
            };

            await user.save();

            await sendSmartMessage(anyChatId, "دوست داری فقط هم‌استانی‌ها نمایش داده بشن؟", {
                inlineKeypad: listProvincesChat
            });

            nextState = "CHOSE_PROVINCES_USERLIST";
        }

        else if (previousState == "CHOSE_PROVINCES_USERLIST") {
            let provinceMode = null;

            if (inlineButtonId == "myprovinces") {
                provinceMode = "MY_PROVINCE";
            }
            else if (inlineButtonId == "allIran") {
                provinceMode = "ALL_IRAN";
            }
            else {
                await sendSmartMessage(anyChatId, "لطفا یکی از گزینه‌ها رو انتخاب کن");
                return;
            }

            user.userListFilter = {
                ...user.userListFilter,
                provinceMode
            };

            user.userListPage = 0;
            user.userListUseFallback = false;

            await user.save();

            const result = await sendUserListPage(user, anyChatId, 0, {
                useFallback: false
            });

            if (result.success) {
                user.userListPage = result.page;
                user.userListUseFallback = result.useFallback;
                await user.save();
            }

            nextState = "NORMAL";
        }

        else if (action == "next_Page") {
            const currentPage = user.userListPage || 0;
            const nextPage = currentPage + 1;

            const result = await sendUserListPage(user, anyChatId, nextPage, {
                useFallback: user.userListUseFallback || false
            });

            if (!result.success) {
                await sendSmartMessage(anyChatId, "صفحه بعدی وجود ندارد 😐");
                return;
            }

            user.userListPage = nextPage;
            user.userListUseFallback = result.useFallback;
            await user.save();

            nextState = "NORMAL";
        }

        else if (action == "previous_Page") {
            const currentPage = user.userListPage || 0;

            if (currentPage <= 0) {
                await sendSmartMessage(anyChatId, "شما در صفحه اول هستی 😐");
                return;
            }

            const previousPage = currentPage - 1;

            const result = await sendUserListPage(user, anyChatId, previousPage, {
                useFallback: user.userListUseFallback || false
            });

            if (!result.success) {
                await sendSmartMessage(anyChatId, "صفحه قبلی وجود ندارد 😐");
                return;
            }

            user.userListPage = previousPage;
            user.userListUseFallback = result.useFallback;
            await user.save();

            nextState = "NORMAL";
        }


        else if (text == "به يه ناشناس وصلم كن 🎲") {

            const isComplateProfile = user.completeProfile


            if (!isComplateProfile) {

                await sendSmartMessage(anyChatId, "اول پروفايل  تو تكميل كن بعدش مي توني از اين استفاده كني  كار يه ديفه اس ")
                return
            }

            await sendSmartMessage(anyChatId, "جنسيت را در جست و جوي تصادفي مشخض كنيد ", { inlineKeypad: AnanomuseChat });

            nextState = "ANONYMOUS_GENDER_SELECT"

        }
        else if (action == "search_again_kaypad") {

            await sendSmartMessage(anyChatId, "جنسيت را در جست و جوي تصادفي مشخض كنيد ", { inlineKeypad: AnanomuseChat })
            await deleteMessage(anyChatId, rubikaKeyPadMessageId);
            nextState = "ANONYMOUS_GENDER_SELECT";

        }
        else if (previousState === "ANONYMOUS_GENDER_SELECT") {



            let preference = "";
            if (inlineButtonId === "justGirl") {
                preference = "دختر";
            } else if (inlineButtonId === "justBoy") {
                preference = "پسر";
            } else if (inlineButtonId === "justHuman") {
                preference = "فرقی ندارد";
            }
            if (!preference) {
                await sendSmartMessage(anyChatId, "شما در حالت انتخاب جنسیت درچت ناشناس بودید اما الان به حالت اولیه خود برگشتی 😅");

                return { nextState: "NORMAL" };
            }
            const result = await startAnonymousSearch(user, preference);

            if (!result.matched) {

                await sendSmartMessage(user.chatId, `🔎 در حال جست‌وجوی کاربر...
درصورت كه كاربري پيدا نشد  و  مي خواستي كار ديگري كني  رو بزن  /start                     `);

                setTimeout(async () => {

                    try {
                        const freshUser = await User.findOne({ rubikaId: user.chatId });

                        if (!freshUser) return;

                        const stillSearching = freshUser.state === "ANONYMOUS_USER_SEARCH" && !freshUser.anonymousPartnerId;

                        if (!stillSearching) return;

                        await User.updateOne(
                            { rubikaId: freshUser.rubikaId },
                            {
                                $set: {
                                    state: "ANONYMOUS_GENDER_SELECT",
                                    anonymousPartnerId: null,
                                    anonymousPreference: ""
                                }
                            }
                        );
                        await sendSmartMessage(
                            freshUser.chatId,
                            "❌ کاربری پیدا نشد. لطفاً دوباره جست‌وجو کنید."
                        );


                    } catch (err) {
                        console.log("anonymous search timeout error:", err);
                    }
                }, 300000);

                return { nextState: "ANONYMOUS_USER_SEARCH" };

            }

            await sendSmartMessage(user.chatId, `سلام به یه ناشناس وصل شدی ${result.partner.profileName} `, { keypad: anonymousChatKeypad });
            await sendSmartMessage(result.partner.chatId, `سلام به یه ناشناس وصل شدی ${user.profileName} `, { keypad: anonymousChatKeypad });



            return { nextState: "ANONYMOUS_CHATTING" };
        }
        else if (previousState === "ANONYMOUS_CHATTING") {

            await AnonymousChatHandler({
                rubikaUserId,
                text,
                action,
                anyChatId,
                emptyValue,
                chatreply,
                hasFile,
                fileId,
                fileName,
                fileSize
            })

        }
        else if (text == "لینک ناشناس من 🔗" || text == "/create_link") {

            const anonymousNamess = await User.findOne({ rubikaId: senderId }).select("anonymousName -_id")
            await createLink(senderId, anyChatId, anonymousNamess.anonymousName)

        }

        else if (text == "لیست بلاکی ها ❌" || text == "/blocked_users") {

            if (text && aliasRegex.test(text)) {
                await findCodeHandler({ chatId, senderId, text })
            }

            await blockUSerHandler({ senderId, chatId })

        }
        else if (text == "تکست باکس🖊️" || text == "/text_box") {
            await sendSmartMessage(chatId, "به تکست باکس خوش آمدی  قراره به زودی این قسمت توسعه داده بشه لطفا منتظر باش:>")

        }
        else if (text === "/balance" || text === "موجودی پیام 💳") {

            if (user.isUnlimited) {
                await sendSmartMessage(chatId, "رفیق تو اکانتت 🚀 نامحدوده! با خیال راحت تا صبح پیام بده.", { keypad: MAIN_KEYPAD });
            } else {
                await sendSmartMessage(chatId, `تعداد پیام‌های باقی‌مانده شما: ${user.messageLimit} پیام 📦\n\nبرای خرید پکیج روی دکمه‌های زیر کلیک کن`, { inlineKeypad: paymentKeyboard });
            }
            nextState = 'NORMAL';

            return;

        }
        else if (action === "buy_25_shadowcoin") {
            await sendSmartMessage(anyChatId, `

🪙 25 شدوکوین | 50 هزار تومان

${info}

`, { keypad: cancelShadowcoin })

            nextState = "SEND_RECEIPT_TO_ADMIN"
        }
        else if (action === "buy_40_shadowcoin") {
            await sendSmartMessage(anyChatId, `

🪙 40 شدوکوین | 60 هزار تومان

${info}

`, { keypad: cancelShadowcoin })

            nextState = "SEND_RECEIPT_TO_ADMIN"
        }
        else if (action === "buy_50_shadowcoin") {
            await sendSmartMessage(anyChatId, `

🪙 50 شدوکوین | 75 هزار تومان

${info}

`, { keypad: cancelShadowcoin })

            nextState = "SEND_RECEIPT_TO_ADMIN"
        }
        else if (action === "buy_100_shadowcoin") {
            await sendSmartMessage(anyChatId, `

🪙 100 شدوکوین | 110 هزار تومان

${info}

`, { keypad: cancelShadowcoin })

            nextState = "SEND_RECEIPT_TO_ADMIN"
        }
        else if (action === "buy_200_shadowcoin") {
            await sendSmartMessage(anyChatId, `

🪙 200 شدوکوین | 160 هزار تومان

${info}

`, { keypad: cancelShadowcoin })

            nextState = "SEND_RECEIPT_TO_ADMIN"
        }
        else if (action === "financial_support") {
            await sendSmartMessage(anyChatId, `

💓 حمایت مالی

سلام دوست عزیزم
برای ساخت و توسعه این ربات واقعاً زحمت زیادی کشیده شده.
ممنونم که با حمایتت کمک می‌کنی این پروژه ادامه پیدا کنه 🙏

${info}

`, { keypad: cancelShadowcoin })

            nextState = "SEND_RECEIPT_TO_ADMIN"
        }
        else {
            console.log("reply Any message  : > ")
            let random = Math.floor(Math.random() * randomData.replyAnyMessage.length)
            let replyMessag = randomData.replyAnyMessage[random]
            await sendSmartMessage(chatId, replyMessag, { replyToMessageId: messageId })
        }
        setCooldown(rubikaUserId)
    }


    catch (error) {

        console.error("یه جای کار لنگید:", error);

    }
    finally {
        if (user) {
            user.state = nextState || ((previousState && previousState !== "LOADING") ? previousState : "NORMAL");
            console.log(`user.state :${user.state} `)
            await user.save();
            unlockUser(rubikaUserId)
        }
    }
}

module.exports = {
    handleUpdate
}
