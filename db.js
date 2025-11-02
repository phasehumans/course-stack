const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = mongoose.Types.ObjectId
const dotenv = require('dotenv')

// dotenv.config();
// mongoose.connect(process.env.MONGO_URL)


const User = new Schema({
    firstName : String,
    lastName : String,
    email : {
        type : String,
        unique : true
    },
    password : String
})

const Course = new Schema({
    title : String,
    description : String,
    price : Number,
    imageUrl : String,
    creatorId : ObjectId
})

const Admin = new Schema({
    firstName : String,
    lastName : String,
    email : {
        type : String,
        unique : true
    },
    password : String,
})

const Purchase = new Schema({
    courseId : ObjectId,
    userId : ObjectId
})


const UserModel = mongoose.model('user', User)
const AdminModel = mongoose.model('admin', Admin)
const CourseModel = mongoose.model('course', Course)
const PurchaseModel = mongoose.model('purchase', Purchase)


module.exports = {
    UserModel : UserModel,
    AdminModel : AdminModel,
    CourseModel : CourseModel, 
    PurchaseModel : PurchaseModel
}