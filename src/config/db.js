const mongoose = require("mongoose");

async function connectDB() {

    try {
        console.log("this is to connectDb")
        await mongoose.connect(process.env.MONGOOSEURL).then(() => {
            console.log("this db is connect")
        }).catch(() => {
            console.log("i cant connect to db")
        })
    }
    catch (error) {
        console.error("this is a error ", error)
        process.exit(1);
    }
}

module.exports = {
    connectDB
}
