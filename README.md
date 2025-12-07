# Course Stack

A course-selling platform with Express + MongoDB backend and vanilla JS frontend.

## Structure

```
routes/        → API endpoints
db.js          → Mongoose models
public/        → Frontend (HTML/CSS/JS)
middleware/    → JWT auth
```

## API

**Base:** `/api/v1`

### User
- `POST /user/signup` - Register (email, password, firstName, lastName)
- `POST /user/signin` - Login → returns `{ token }`
- `GET /user/purchases` - My courses (protected)

### Course
- `GET /course/preview` - Browse courses
- `POST /course/purchase` - Enroll (protected, body: `{ courseId }`)

### Admin
- `POST /admin/signup` - Register admin
- `POST /admin/signin` - Login
- `POST /admin/course` - Create course (protected)
- `PUT /admin/course` - Update course (protected)
- `GET /admin/course/bulk` - List courses (protected)
