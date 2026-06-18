const mongoose = require("mongoose");


const userSchem = mongoose.Schema({

    rubikaId: { type: String, required: true, unique: true, index: true },
    firstName: { type: String, default: "کاربر ناشناس" },
    userName: { type: String, default: "" },
    chatId: { type: String, default: "" },
    idCard: { type: String, required: true },
    lastOnline: { type: Number, default: 0 },
    shadowCoin: {
        type: Number,
        default: 50
    },
    reportCount: { type: Number, default: 0 },

    isBlocked: { type: Boolean, default: false },
    anonymousName: { type: String, required: true, unique: true, index: true },
    state: {
        type: String,
        enum: ['NORMAL',
            'CHATTING_WITH',
            'ANONYMOUS_GENDER_SELECT',
            'ANONYMOUS_USER_SEARCH',
            "CHATING_USERS_LIST",
            "SEND_DIRECT_MESSAGE",
            'ANONYMOUS_CHATTING',
            "ANONYMOUS_CHATTING_REPORTUSER",
            "ANONYMOUS_CHATTING_BLOCKUSER",
            "ANONYMOUS_CHATTING_GIFTSHADOWCOIN",
            "SEND_RECEIPT_TO_ADMIN",
            "ENTER_CARD_ID",
            "SEND_SHADOW_COIN_TO_USER",
            'WRITING_MESSAGE',
            "CHOSEAGE",
            "TYPENAME",
            "CHOSEGENDER",
            "CHOSEPROVINCES",
            "LOADING",
            "CHOSE_GENDER_USERLIST",
            "CHOSE_AGE_USERLIST",
            "CHOSE_PROVINCES_USERLIST"],

        default: "NORMAL",
    },
    targetId: { type: String,default: "" },
    blockedUsers: { type: [String], default: [] },
    pendingChatRequestFrom: [
        {
            rubikaId: { type: String, default: null, index: true },
            requsetLimit: { type: Boolean, default: false }
        }],
    inbox: [
        {
            rubikaId: { type: String, default: null, index: true },
            idCard: { type: String, default: null, index: true },
        }
    ],

    directTargetRubikaId: {
        type: String,
        default: ""
    },

    giftTargetRubikaId: {
        type: String,
        default: ""
    },
    isRequester: {
        type: Boolean,
        default: false
    },

    userListPage: {
        type: Number,
        default: 0
    },

    userListUseFallback: {
        type: Boolean,
        default: false
    },
    isUnlimited: {
        type: Boolean,
        default: false
    },
    profileName: { type: String, default: "" },
    gender: {
        type: String,
        enum: ["پسر", "دختر", ""],
        default: ""
    },
    age: { type: Number, default: null },
    province: { type: String, default: "" },
    city: { type: String, default: "" },
    joinedAt: { type: Date, default: Date.now },
    anonymousPreference: {
        type: String,
        enum: ["پسر", "دختر", "فرقی ندارد", ""],
        default: ""
    },
    anonymousPartnerId: {
        type: String,
        default: null,
        index: true
    },
    anonymousSearchStartedAt: {
        type: Date,
        default: null
    },
    isChating: { type: Boolean, default: false },
    completeProfile: { type: Boolean, default: false },
    userListFilter: {
        gender: { type: String, default: null },
        minAge: { type: Number, default: null },
        maxAge: { type: Number, default: null },
        provinceMode: { type: String, default: null },
    },
    sentCount: { type: Number, default: 0 },
    coinDeducted: { type: Boolean, default: false },

})


userSchem.index({
    completeProfile: 1,
    gender: 1,
    province: 1,
    age: 1,
    lastOnline: -1
});

userSchem.index({ gender: 1 });
userSchem.index({ province: 1 });
userSchem.index({ age: 1 });

userSchem.index({ lastOnline: -1 });

userSchem.index({ state: 1 });

const MessageSchem = mongoose.Schema({

    senderId: { type: String, required: true, index: true },

    receiverId: { type: String, required: true, index: true },

    message: { type: String, required: false },

    MessageIdDB: { type: String, required: true, index: true },

    isSeen: { type: Boolean, default: false },

    fileId: { type: String, default: null, index: true },

    createdAt: { type: Date, default: Date.now, expires: '30d' }

})


const counterSchema = mongoose.Schema({
    _id: { type: String, required: true }, // اسم شمارنده
    seq: { type: Number, default: 1000 }   // از عدد 1000 شروع میشه
});


const stateSchema = new mongoose.Schema({
    botId: { type: String, required: true, unique: true }, // برای اینکه بعدا بتونی چندتا ربات رو مدیریت کنی
    lastOffsetId: { type: String, default: null }
});


const Counter = mongoose.model("Counter", counterSchema);

const User = mongoose.model("user", userSchem)

const Message = mongoose.model("Message", MessageSchem)

const BotState = mongoose.model('BotState', stateSchema);


module.exports = {
    BotState,
    Counter,
    User,
    Message,
}