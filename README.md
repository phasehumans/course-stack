# Course Stack (Course Selling Website)

## Stack

- Backend: Node.js, Express, MongoDB, Mongoose
- Frontend: HTML, CSS, Vanilla JavaScript
- Auth: JWT, bcryptjs

## Project Layout

```
routes/        - API endpoints
db.js          - Database models
public/        - Frontend files
middleware/    - Auth middleware
```

## API

### User
- `POST /user/signup` - Register with email, password, firstName, lastName
- `POST /user/signin` - Login, returns token
- `GET /user/purchases` - Get user's courses (auth required)

### Course
- `GET /course/preview` - List all courses
- `POST /course/purchase` - Enroll in course (auth required)

### Admin
- `POST /admin/signup` - Register admin
- `POST /admin/signin` - Login admin
- `POST /admin/course` - Create course (auth required)
- `PUT /admin/course` - Update course (auth required)
- `GET /admin/course/bulk` - List admin's courses (auth required)

## Setup

1. Install dependencies: `npm install`
2. Configure `.env` with MONGODB_URI and JWT_SECRET
3. Start: `npm start`
4. Access at `http://localhost:3000`

## Flow

**Authentication**
```
Signup/Signin → Hash password → Generate JWT → Return token
```

**Protected Routes**
```
Request → Verify token → Valid? → Execute action → Response
                            ↓ No
                         Reject 403
```

**User Purchase**
```
Browse courses → Select course → Send courseId + token → Create purchase → Success
```

**Admin Management**
```
Create/Update course → Send with token → Middleware validates → DB operation → Return course
```
