const express = require('express')
const {userRouter} = require('./routes/user.routes')
const { adminRouter } = require('./routes/admin.routes')
const { courseRouter } = require('./routes/course.routes')

const app = express()
app.use(express.json())

// routes
app.use('/api/v1/user', userRouter)
app.use('/api/v1/admin', adminRouter)
app.use('/api/v1/course', courseRouter)


app.listen(3000)