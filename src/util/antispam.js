
const userLocks = new Map()
const userCooldowns = new Map()

const LOCK_TTL = 10000       // 10 seconds
const COOLDOWN_TTL = 600    // 2 seconds

function isUserLocked(userKey) {
    const lockedUntil = userLocks.get(userKey)

    if (!lockedUntil) {
        return false
    }

    if (Date.now() > lockedUntil) {
        userLocks.delete(userKey)
        return false
    }

    return true
}

function lockUser(userKey) {
    userLocks.set(userKey, Date.now() + LOCK_TTL)
}

function unlockUser(userKey) {
    userLocks.delete(userKey)
}

function isInCooldown(userKey) {
    const cooldownUntil = userCooldowns.get(userKey)

    if (!cooldownUntil) {
        return false
    }

    if (Date.now() > cooldownUntil) {
        userCooldowns.delete(userKey)
        return false
    }

    return true
}

function setCooldown(userKey) {
    userCooldowns.set(userKey, Date.now() + COOLDOWN_TTL)
}

function getCooldownRemaining(userKey) {
    const cooldownUntil = userCooldowns.get(userKey)

    if (!cooldownUntil) {
        return 0
    }

    const remaining = cooldownUntil - Date.now()

    return remaining > 0 ? remaining : 0
}

function checkAntiSpam(userKey) {
    if (!userKey) {
        return {
            ok: false,
            reason: "NO_USER_KEY"
        }
    }

    if (isUserLocked(userKey)) {
        return {
            ok: false,
            reason: "LOCKED"
        }
    }

    if (isInCooldown(userKey)) {
        return {
            ok: false,
            reason: "COOLDOWN",
            remaining: getCooldownRemaining(userKey)
        }
    }

    return {
        ok: true
    }
}

setInterval(() => {
    const now = Date.now()

    for (const [userKey, lockedUntil] of userLocks.entries()) {
        if (now > lockedUntil) {
            userLocks.delete(userKey)
        }
    }

    for (const [userKey, cooldownUntil] of userCooldowns.entries()) {
        if (now > cooldownUntil) {
            userCooldowns.delete(userKey)
        }
    }
}, 60000)

module.exports = {
    checkAntiSpam,
    lockUser,
    unlockUser,
    setCooldown,
    isUserLocked,
    isInCooldown,
    getCooldownRemaining
}
