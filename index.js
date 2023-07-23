const express = require("express")
const fileUpload = require('express-fileupload')
const mongoose = require("mongoose")
const cors = require('cors')
const config = require("config")
const authRouter = require('./routes/auth.routes')
const clusterboardRouter = require('./routes/cluster.routes')

const app = express()
const PORT = config.get('serverPort')

app.use(cors({credentials: true, origin: 'http://localhost:5173'}))
app.use(express.json())
app.use(fileUpload())

app.use('/api/auth', authRouter)
app.use('/api/clusterboards', clusterboardRouter)

const start = async () => {
    try {
        await mongoose.connect(config.get("dbUrl"))
        app.listen(PORT, () => {
            console.log('Server started on port ', PORT)
        })
    } catch (e) {
        console.log(e)
    }
}
start()

