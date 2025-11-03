const jwt = require('jsonwebtoken')
const dotenv= require('dotenv')

dotenv.config()

function adminMiddleware (req, res, next){
    const token = req.headers.token
    const decodedData = jwt.verify(token, JWT_SECRET);

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
    adminMiddleware : adminMiddleware
}