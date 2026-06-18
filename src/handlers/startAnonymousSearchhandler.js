const { User, Message, Counter } = require("../../models");

async function startAnonymousSearch(user, preference) {

    const searchingUser = await User.findOneAndUpdate(

        { rubikaId: user.rubikaId },

        {
            $set: {
                state: "ANONYMOUS_USER_SEARCH",
                anonymousPreference: preference,
                anonymousPartnerId: null
            }

        },

        { returnDocument: "after" }

    );
    const partner = await findAndReserveAnonymousPartner(searchingUser, preference);

    if (!partner) {
        return { matched: false };
    }

    return { matched: true, partner };

}

async function findAndReserveAnonymousPartner(user, preference) {

    const query = {
        rubikaId: { $ne: user.rubikaId },
        state: "ANONYMOUS_USER_SEARCH",
        anonymousPartnerId: null,
        isBlocked: false,
        blockedUsers: { $ne: user.rubikaId }
    };


    if (preference === "دختر") query.gender = "دختر";
    else if (preference === "پسر") query.gender = "پسر";


    const candidates = await User.find(query).limit(20);

    if (!candidates.length) {
        return null;
    }

    const shuffled = candidates.sort(() => Math.random() - 0.5);

    for (const candidate of shuffled) {

        if ((user.blockedUsers || []).includes(candidate.rubikaId)) {
            continue;
        }

        if (
            candidate.anonymousPreference !== "فرقي ندارد" &&
            candidate.anonymousPreference !== "فرقی ندارد" &&
            candidate.anonymousPreference !== user.gender
        ) {
            continue;
        }


        const reservedPartner = await User.findOneAndUpdate(
            {
                rubikaId: candidate.rubikaId,
                state: "ANONYMOUS_USER_SEARCH",
                anonymousPartnerId: null
            },
            {
                $set: {
                    state: "ANONYMOUS_CHATTING",
                    anonymousPartnerId: user.rubikaId,
                    isChating: true
                }
            },
            { returnDocument: 'after' }
        );

        if (!reservedPartner) {
            continue;
        }

        const updatedUser = await User.findOneAndUpdate(
            {
                rubikaId: user.rubikaId,
                state: "ANONYMOUS_USER_SEARCH",
                anonymousPartnerId: null
            },
            {
                $set: {
                    state: "ANONYMOUS_CHATTING",
                    anonymousPartnerId: reservedPartner.rubikaId,
                    isChating: true


                }
            },
            { returnDocument: 'after' }
        );

        if (!updatedUser) {

            await User.updateOne(
                { rubikaId: reservedPartner.rubikaId },
                {
                    $set: {
                        state: "ANONYMOUS_USER_SEARCH",
                        anonymousPartnerId: null,
                        isChating: false

                    }
                }
            );

            continue;
        }

        return reservedPartner;
    }

    return null;
}
module.exports = {
    startAnonymousSearch
}