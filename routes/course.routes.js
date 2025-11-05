const {Router} = require('express')
const courseRouter = Router()
const {PurchaseModel, CourseModel} = require('../db')
const {userMiddleware} = require('../middleware/user.middleware')

courseRouter.post('/purchase', userMiddleware, async (req, res) => {
    const userId = req.userId
    const courseId = req.body.courseId

    await PurchaseModel.create({
        userId : userId,
        courseId : courseId
    })

    res.json({
        message : "you have bought the course"
    })
    
})

courseRouter.get('/preview', async(req, res) => {
    // empty array : gets all the courses
    const courses = await CourseModel.find({})

    res.json({
        courses : courses
    })
})

module.exports = {
    courseRouter : courseRouter
}