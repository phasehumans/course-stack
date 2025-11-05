const express = require('express')
const {userRouter} = require('./routes/user.routes')
const { adminRouter } = require('./routes/admin.routes')
const { courseRouter } = require('./routes/course.routes')
const mongoose = require('mongoose')
const dotenv = require('dotenv')

const app = express()
app.use(express.json())
dotenv.config()

// serve frontend static files from public/
app.use(express.static('public'))

// fallback to index.html for root (useful when opening / in browser)
app.get('/', (req, res) => {
    res.sendFile(require('path').join(__dirname, 'public', 'index.html'))
})

// routes
app.use('/api/v1/user', userRouter)
app.use('/api/v1/admin', adminRouter)
app.use('/api/v1/course', courseRouter)

async function main(){
    await mongoose.connect(process.env.MONGO_URL);
    app.listen(3000);
    console.log('listening on port 3000')
}

main()