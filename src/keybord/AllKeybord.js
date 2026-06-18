const CANCEL_KEYPAD = {
    "rows": [
        { "buttons": [{ "id": "cancel_main", "type": "Simple", "button_text": "انصراف ❌" }] }
    ],
    "resize_keyboard": true,
    "one_time_keyboard": false
};


const cancelShadowcoin =

{
    "rows": [
        { "buttons": [{ "id": "cancel_Shadow_coin", "type": "Simple", "button_text": "انصراف ❌" }] }
    ],
    "resize_keyboard": true,
    "one_time_keyboard": false
};

function createChatRequestKeyboard(targetRubikaId) {
    return {
        rows: [
            {
                buttons: [

                    {
                        id: `SEND_DIRECT_${targetRubikaId}`,
                        type: "Simple",
                        button_text: "📩 دایرکت دادن"
                    },
                    {
                        id: `REQUEST_CHAT_${targetRubikaId}`,
                        type: "Simple",
                        button_text: "💬 درخواست چت"
                    },
                ]
            },
        ],
        resize_keyboard: true,
        one_time_keyboard: false
    };
}


const shadowShapKeybord = {
    rows: [
        {
            buttons: [
                {
                    id: "buy_shadow_coin",
                    type: "Simple",
                    button_text: "🛒✨ خرید شدوکوین"
                },
                {
                    id: "transfer_shadow_coin",
                    type: "Simple",
                    button_text: "🔄💸انتقال شدوکوین"
                }
            ]
        },
        {
            buttons: [


                { "id": "back_Coin", "type": "Simple", "button_text": "بازگشت 🏡" },

            ]
        }
    ],
    resize_keyboard: true,
    one_time_keyboard: false
};

const cancelNextUser = {
    "rows": [
        { "buttons": [{ "id": "cancel_Next_User", "type": "Simple", "button_text": "انصراف ❌" }] }
    ],
    "resize_keyboard": true,
    "one_time_keyboard": false
};

function getActionInlineKeyboard(senderId, messageId, isCurrentlyBlocked = false) {

    let blockOrUnblockButton = isCurrentlyBlocked
    if (blockOrUnblockButton) {

        blockOrUnblockButton = { "id": `unblock_${senderId}`, "type": "Simple", "button_text": "آنبلاک 🔓" }
    }
    else {
        blockOrUnblockButton = { "id": `block_${senderId}`, "type": "Simple", "button_text": "بلاک 🚫" }
    }
    return {

        "rows": [
            {
                "buttons": [
                    blockOrUnblockButton,
                    { "id": `seen_${senderId}_${messageId}`, "type": "Simple", "button_text": "سین شد ✔️" },
                    { "id": `reply_${senderId}_${messageId}`, "type": "Simple", "button_text": "پاسخ 💬" }
                ]
            },
            {
                "buttons": [
                    { "id": "show_ads", "type": "Simple", "button_text": "تبلیغات شما 📢" }
                ]
            }
        ]
    }
        ;
}

const hiddenChatKeypad = {

    "rows": [
        { "buttons": [{ "id": "600", "type": "Simple", "button_text": "به يه ناشناس وصلم كن 🎲" }] },
        {
            "buttons": [{ "id": "601", "type": "Simple", "button_text": "جست و جو در كاربران📜🔎" },]
        },
        {
            "buttons": [{ "id": "602", "type": "Simple", "button_text": "پروفايل 👤" },]
        },
        {
            "buttons": [

                { "id": "603", "type": "Simple", "button_text": "شدو کوین🪙💬" },

                { "id": "604", "type": "Simple", "button_text": "بازگشت 🏠" },

            ]
        }
    ],
    "resize_keyboard": true,
    "one_time_keyboard": false
};

const MAIN_KEYPAD = {
    "rows": [
        { "buttons": [{ "id": "900", "type": "Simple", "button_text": "چت با ناشناس💬" }] },
        {
            "buttons": [
                { "id": "901", "type": "Simple", "button_text": "لیست بلاکی ها ❌" },
                { "id": "902", "type": "Simple", "button_text": "تکست باکس🖊️" }
            ]
        },
        { "buttons": [{ "id": "903", "type": "Simple", "button_text": "لینک ناشناس من 🔗" }] }
    ],
    "resize_keyboard": true,
    "one_time_keyboard": false
};


const paymentKeyboard = {
    rows: [
        {
            buttons: [
                {
                    id: "buy_25_shadowcoin",
                    type: "Simple",
                    button_text: "🪙 25 شدوکوین - 50 هزار تومان"
                },
                {
                    id: "buy_40_shadowcoin",
                    type: "Simple",
                    button_text: "🪙 40 شدوکوین - 60 هزار تومان"
                },


            ]
        },
        {
            buttons: [

                {
                    id: "buy_50_shadowcoin",
                    type: "Simple",
                    button_text: "🪙 50 شدوکوین - 75 هزار تومان"
                },
                {
                    id: "buy_100_shadowcoin",
                    type: "Simple",
                    button_text: "🪙 100 شدوکوین - 110 هزار تومان"
                },
            ]
        },
        {
            buttons: [


                {
                    id: "buy_200_shadowcoin",
                    type: "Simple",
                    button_text: "🪙 200 شدوکوین - 160 هزار تومان"
                },
                {
                    id: "financial_support",
                    type: "Simple",
                    button_text: "💓 حمایت مالی"
                }
            ]
        },


    ]
};

const UserListKeybord = {
    rows: [
        {
            buttons: [
                { id: "end_chat", type: "Simple", button_text: "قطع کردن چت  ❌" },
            ]
        },
        {
            buttons: [
                { id: "report_user", type: "Simple", button_text: "ریپورت کاربر ⚠️" },
                { id: "block_user", type: "Simple", button_text: "بلاک کردن کاربر 🚫" }
            ]
        },
        {
            buttons: [
                { id: "show_profile", type: "Simple", button_text: "شدوکارت📄" },
                { id: "gift_shadow_coin", type: "Simple", button_text: "اهدا شدو کوین 🎁" }
            ]
        },

    ],
    resize_keyboard: true,
    one_time_keyboard: false

}

const complateProfile = {

    "rows": [
        {
            "buttons": [
                {
                    "id": "complateProfile",
                    "type": "Simple",
                    "button_text": "تكلميل اطلاعات "
                }
            ]
        }]
}

const editProfile = {

    "rows": [
        {
            "buttons": [
                {
                    "id": "Edit_Name",
                    "type": "Simple",
                    "button_text": "ویرایش نام ✏️"
                },
                {
                    "id": "Edit_gender",
                    "type": "Simple",
                    "button_text": "ویرایش  جنسیت✏️"
                },
                {
                    "id": "Edit_age",
                    "type": "Simple",
                    "button_text": "ویرایش سن✏️"
                },
                {
                    "id": "Edit_city",
                    "type": "Simple",
                    "button_text": "ویرایش استان و شهر✏️"
                }
            ]
        }]
}


const AnanomuseChat = {

    "rows": [

        {
            "buttons": [
                {
                    "id": "justGirl",
                    "type": "Simple",
                    "button_text": "فقط دختر "
                },
                {
                    "id": "justBoy",
                    "type": "Simple",
                    "button_text": "فقط پسر "
                }
            ]

        },

        {

            "buttons": [
                {
                    "id": "justHuman",
                    "type": "Simple",
                    "button_text": "فقط ادم باشه(شايدم نباشه )"
                },

            ]

        }

    ]
}

const listAgeChat = {

    "rows": [
        {
            "buttons": [
                {
                    "id": "1224",
                    "type": "Simple",
                    "button_text": "رده سنی 12 تا 24"
                },
            ],

        },
        {
            "buttons": [
                {
                    "id": "2540",
                    "type": "Simple",
                    "button_text": "رده سني 25 تا 40"
                },
            ],

        },
        {
            "buttons": [
                {
                    "id": "4160",
                    "type": "Simple",
                    "button_text": "رده سني 41 تا 60"
                },
            ],

        },
        {
            "buttons": [
                {
                    "id": "allAge",
                    "type": "Simple",
                    "button_text": "سن يه عدده (همه رده سني ها)"
                },
            ]
        }
    ]
}

const listProvincesChat = {

    "rows": [
        {
            "buttons": [
                {
                    "id": "myprovinces",
                    "type": "Simple",
                    "button_text": "انتخاب هم كردن هم استاني "
                },
            ],

        },
        {
            "buttons": [
                {
                    "id": "allIran",
                    "type": "Simple",
                    "button_text": "كل ايران سراي من است (انتخاب كل استان ها)"
                },
            ],

        },

    ]
}

const anonymousChatKeypad = {
    rows: [
        {
            buttons: [
                { id: "end_chat", type: "Simple", button_text: "قطع کردن چت  ❌" },
            ]
        },
        {
            buttons: [
                { id: "report_user", type: "Simple", button_text: "ریپورت کاربر ⚠️" },
                { id: "block_user", type: "Simple", button_text: "بلاک کردن کاربر 🚫" }
            ]
        },
        {
            buttons: [
                { id: "next_user", type: "Simple", button_text: "نفر بعدی ⏭️" },
            ]
        },
        {
            buttons: [
                { id: "show_profile", type: "Simple", button_text: "شدوکارت📄" },
                { id: "gift_shadow_coin", type: "Simple", button_text: "اهدا شدو کوین 🎁" }
            ]
        },
        {

            buttons: [
                { id: "search_again", type: "Simple", button_text: "جست و جوی مجدد 🔎" },
            ]
        }
    ],
    resize_keyboard: true,
    one_time_keyboard: false
};

const reportUserKeybord = {
    rows: [
        {
            buttons: [
                { id: "confirm_report", type: "Simple", button_text: "🚨 ریپورت کن" },
            ]
        },
    ],

};

const blockUserKeybord = {
    rows: [
        {
            buttons: [
                { id: "confirm_block", type: "Simple", button_text: "🚫 بلاک کن" },
            ]
        },

    ],

};

const giftShadowCoinKeybord = {

    rows: [
        {
            buttons: [
                { id: "confirm_gift_shadow_coin", type: "Simple", button_text: "🎁 شدو کوین بده" },
            ]
        },
    ],

};


const acceptOrRejact = {

    rows: [
        {
            buttons: [
                { id: "accept-btn", type: "Simple", button_text: "قبول کردن درخواست " },
                { id: "rejact", type: "Simple", button_text: "رد کردن درخواست" },

            ]
        },
    ],

};

const mainList = {

    rows: [
        {
            buttons: [
                { id: "next_Page", type: "Simple", button_text: "صفحه بعد " },
                { id: "previous_Page", type: "Simple", button_text: "صفحه قبل" },
            ]
        },
    ],

};

const userProfile = {

    rows: [
        {
            buttons: [
                { id: "next_Page", type: "Simple", button_text: "پیام دایرکت " },
                { id: "previous_Page", type: "Simple", button_text: "درخواست چت" },
            ]
        },
    ],

};

const retryOrBackKeyboard = {
    rows: [
        {
            buttons: [
                { id: "search_again_kaypad", type: "Simple", button_text: "🔎 جست‌وجوی مجدد" },
            ]
        },
        {
            buttons: [
                { id: "go_back", type: "Simple", button_text: "↩️ بازگشت" },

            ]
        },


    ],

    resize_keyboard: true,
    one_time_keyboard: false
};

const shadowCoinGiftKeyboard = {
    rows: [
        {
            buttons: [
                {
                    id: "gift_5_shadowcoin",
                    type: "Simple",
                    button_text: "🪙 اهدای 5 شدوکوین"
                },
                {
                    id: "gift_10_shadowcoin",
                    type: "Simple",
                    button_text: "🪙 اهدای 10 شدوکوین"
                }
            ]
        },
        {
            buttons: [
                {
                    id: "gift_15_shadowcoin",
                    type: "Simple",
                    button_text: "🪙 اهدای 15 شدوکوین"
                },
                {
                    id: "gift_25_shadowcoin",
                    type: "Simple",
                    button_text: "🪙 اهدای 25 شدوکوین"
                }
            ]
        },
        {
            buttons: [
                {
                    id: "gift_50_shadowcoin",
                    type: "Simple",
                    button_text: "🪙 اهدای 50 شدوکوین"
                },
                {
                    id: "gift_100_shadowcoin",
                    type: "Simple",
                    button_text: "🪙 اهدای 100 شدوکوین"
                }
            ]
        }
    ],
    resize_keyboard: true,
    one_time_keyboard: false
};
function createAcceptChatKeyboard(senderRubikaId) {
    return {
        rows: [
            {
                buttons: [
                    {
                        id: `ACCEPT_CHAT_${senderRubikaId}`,
                        type: "Simple",
                        button_text: "✅ قبول درخواست"
                    },
                    {
                        id: `REJECT_CHAT_${senderRubikaId}`,
                        type: "Simple",
                        button_text: "❌ رد درخواست"
                    }
                ]
            }
        ],
        resize_keyboard: true,
        one_time_keyboard: false
    };
}


module.exports = {
    CANCEL_KEYPAD,
    getActionInlineKeyboard,
    hiddenChatKeypad,
    MAIN_KEYPAD,
    AnanomuseChat,
    paymentKeyboard,
    complateProfile,
    anonymousChatKeypad,
    listAgeChat,
    listProvincesChat,
    reportUserKeybord,
    blockUserKeybord,
    giftShadowCoinKeybord,
    retryOrBackKeyboard,
    acceptOrRejact,
    mainList,
    userProfile,
    cancelNextUser,
    shadowShapKeybord,
    shadowCoinGiftKeyboard,
    cancelShadowcoin,
    createChatRequestKeyboard,
    createAcceptChatKeyboard,
    UserListKeybord,
    editProfile
}