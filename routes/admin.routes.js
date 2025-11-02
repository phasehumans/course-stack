const {Router} = require('express')
const adminRouter= Router()
const {AdminModel} = require('../db')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')

dotenv.config()


function authMiddleware(req, res, next){
    const token = req.headers.token
    const decodedData= jwt.verify(token, process.env.JWT_SECRET)

    if(decodedData){
        
    }

}

adminRouter.post('/signup', (req, res) => {

})

adminRouter.post('signin', (req, res) => {

})

adminRouter.post('/course', (req, res) => {

})

adminRouter.put('/course', (req, res) => {

})

adminRouter.get('/course/bulk', (req, res) => {
    
})

adminRouter.post('/addcontent', (req, res) => {

})

module.exports = {
    adminRouter : adminRouter
}