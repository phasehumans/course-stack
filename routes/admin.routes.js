const {Router} = require('express')
const adminRouter= Router()
const {AdminModel, CourseModel} = require('../db')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
const {z, email} = require('zod')
const bcrypt = require('bcrypt')
const {adminMiddleware} = require('../middleware/admin.middleware')

dotenv.config()

adminRouter.post('/signup', async (req, res) => {
    const requiredBody = z.object({
        firstName : z.string(),
        lastName : z.string(),
        email : z.email().string(),
        password : z.string().min(5).max(20)
    })

    const parsedData = requiredBody.safeParse(req.body)

    if(!parsedData.success){
        res.json({
            message : "invalid inputs",
            error : parsedData.error
        })
        return
    }

    const firstName = req.body.firstName
    const lastName = req.body.lastName
    const email = req.body.email
    const password = req.body.password

    try {
        const hashPassword = await bcrypt.hash(password, JWT_SECRET)
        await AdminModel.create({
            firstName : firstName,
            lastName : lastName,
            email : email,
            password : hashPassword
        })
    } catch (error) {
        res.json({
          message: "sign-up failed",
          error: error,
        });
        return;
    }

    res.json({
        message : "sign-up completed"
    })

})

adminRouter.post('signin', async (req, res) => {
    const requiredBody = z.object({
        email : z.string().email(),
        password : z.string().min(5).max(20)
    })

    const parsedData = requiredBody.safeParse(req.body)
    if(!parsedData.success){
        res.json({
            message : "invalid email or password",
            error : parsedData.error
        })
        return
    }

    const email = req.body.email
    const password = req.body.password

    const admin = await AdminModel.findOne({
        email : email
    })

    if(!admin){
        res.json({
            message : "admin doesnot exist"
        })
        return
    }

    const passwordMatch = bcrypt.compare(password, admin.password)

    if(passwordMatch){
        const token = jwt.sign({
            id : admin.id
        }, JWT_SECRET)

        res.json({
            message : token
        })
    }

    res.status(403).json({
      message: "incorrect email or password",
    });

})

adminRouter.post('/course', adminMiddleware, async (req, res) => {
    const adminId = req.userId

    // can add zod validation
    const {title, description, price, imageUrl} = req.body

    const course = await CourseModel.create({
        title : title,
        price : price,
        description : description,
        imageUrl : imageUrl,
        creatorId : adminId
    })

    res.json({
        message : "course created",
        courseId : course._id           // _id of db object
    })

})

adminRouter.put('/course', adminMiddleware, async (req, res) => {
    const adminId = req.userId

    const {title, description, price, imageUrl, courseId} = req.body

    await CourseModel.updateOne({
        // filter change the course w/ this id and of this user
        _id : courseId,
        creatorId : adminId
    }, {
        title : title,
        price : price,
        description : description,
        imageUrl : imageUrl
    })

    res.json({
        message : "course updated"
    })
})

adminRouter.get('/course/bulk', adminMiddleware, async (req, res) => {
    const adminId = req.userId

    const courses = await CourseModel.findOne({
        creatorId : adminId
    })

    res.json({
        message : "all courses",
        courses : courses
    })
})

module.exports = {
    adminRouter : adminRouter
}