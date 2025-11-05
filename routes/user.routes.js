const {Router} = require('express')
const userRouter = Router()
const {z, email} = require('zod')
const bcrypt = require('bcrypt')
const {UserModel, PurchaseModel, CourseModel} = require('../db')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
const userMiddleware = require('../middleware/user.middleware')

dotenv.config()

userRouter.post('/signup', async (req, res) => {
    const requiredBody = z.object({
        email : z.string().email(),
        password : z.string().min(5).max(20),
        firstName : z.string(),
        lastName : z.string()
    })

    const parsedData = requiredBody.safeParse(req.body)
    if(!parsedData.success){
        res.json({
            message: "invalid input",
            err: parsedData.error
        })
        return
    }

    // const {email, password, firstName, lastName} = req.body
    const email = req.body.email
    const password = req.body.password
    const firstName = req.body.firstName
    const lastName = req.body.lastName


    try {
        const hashPassword = await bcrypt.hash(password, 5)
        await UserModel.create({
            firstName : firstName,
            lastName : lastName,
            email : email,
            password : hashPassword
        })
    } catch (error) {
        res.json({
            message : "sign-up failed",
            error : error
        })
        return
    }

    res.json({
        message : "sign-up completed"
    })

})

userRouter.post('/signin', async (req, res) => {
    const requiredBody = z.object({
        email : z.string().email(),
        password : z.string().min(5).max(20)
    })

    const parsedData = requiredBody.safeParse(req.body)

    if(!parsedData.success){
        res.json({
            message: "invalid input",
            error : parsedData.error
        })
        return
    }

    const email = req.body.email
    const password = req.body.password

    const user = await UserModel.findOne({
        email : email
    })

    if(!user){
        res.json({
            message : "user doesnot exist"
        })
    }

    const passwordMatch = bcrypt.compare(password, user.password)

    if(passwordMatch){
            const token = jwt.sign({
                id : user.id
            }, process.env.JWT_SECRET_USER);

        res.json({
            token : token
        })

    }else{
        res.status(403).json({
            message : "incorrect email or password"
        })
    }
})

userRouter.get('/purchases', userMiddleware, async(req, res) => {
    const userId = req.userId

    const purchases =  await PurchaseModel.find({
        userId : userId
    })

    const courseData = await CourseModel.find({
        _id : { $in : purchases.map(x => x.courseId) }
    })

    res.json({
        purchase : purchases,
        course : courseData
    })
})

module.exports = {
    userRouter : userRouter
}