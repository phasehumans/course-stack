const {Router} = require('express')
const userRouter = Router()
const {z} = require('zod')
const bcrypt = require('bcrypt')
const {UserModel} = require('../db')


userRouter.post('/signup', async (req, res) => {
    const requiredBody = z.object({
        email : z.email().string(),
        password : z.string().string().min(5).max(20),
        firstName : z.string(),
        lastName : z.string()
    })

    const parsedData = requiredBody.safeParse(req.body)
    if(!parsedData.success){
        res.json({
            message: "invalid input",
            err: parsedData.error
        })
    }

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
        
    }

    res.json({
        message : "you are logged in"
    })

})

userRouter.post('/signin', (req, res) => {

})

userRouter.get('/purchases', (req, res) => {
    res.json({
        message : "all courses"
    })
})

module.exports = {
    userRouter : userRouter
}