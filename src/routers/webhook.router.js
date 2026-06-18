const express = require("express")
const router = express.Router()

const { handleUpdate } = require("../handlers/update.handler")


router.post("/receiveUpdate", async (req, res) => {

    try {
        console.log(JSON.stringify(req.body, null, 2))
        await handleUpdate(req.body);
        return res.sendStatus(200);

    }
    catch (err) {
        console.log("WEBHOOK ERROR:", err);
        return res.sendStatus(200);
    }
});
router.post("/receiveInlineMessage", async (req, res) => {
    try {
        console.log(JSON.stringify(req.body, null, 2))
        await handleUpdate(req.body);

        return res.sendStatus(200);


    } catch (err) {
        console.log("WEBHOOK ERROR:", err);
        return res.sendStatus(200);
    }
})

module.exports = router