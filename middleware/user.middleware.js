const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')

dotenv.config()

function userMiddleware(req, res, next){
    const token = req.headers.token
    const decodedData = jwt.verify(token, process.env.JWT_SECRET_USER);

    if(decodedData){
        req.userid = decodedData.id
        next()
    }else{
        res.status(403).json({
            message : "you are not signed in"
        })
    }

}

module.exports = {
    userMiddleware : userMiddleware
}