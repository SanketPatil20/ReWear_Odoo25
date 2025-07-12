# ReWear - Community Clothing Exchange Platform

A full-stack web application built with the MERN stack (MongoDB, Express.js, React.js, Node.js) that allows users to exchange clothing items through a points-based system or direct swaps.

## 🌟 Features

- **User Authentication** - Register, login, and profile management
- **Item Management** - List, browse, and manage clothing items
- **Swap System** - Request swaps with points or direct item exchange
- **Image Upload** - Upload multiple images for items
- **Real-time Updates** - Live status updates for swap requests
- **Responsive Design** - Mobile-friendly interface with Tailwind CSS
- **Admin Panel** - Manage users, items, and platform statistics

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Multer** - File upload handling
- **bcryptjs** - Password hashing

### Frontend
- **React.js** - UI library
- **React Router** - Navigation
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **React Icons** - Icon library
- **React Hot Toast** - Notifications

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Git

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Oddo_Hackathon
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Configuration**
   
   Create `backend/config.env`:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=5001
   ```

5. **Start the servers**

   **Backend (Terminal 1):**
   ```bash
   cd backend
   npm start
   ```

   **Frontend (Terminal 2):**
   ```bash
   cd frontend
   npm start
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001

## 🚀 Usage

### For Users
1. **Register/Login** - Create an account or sign in
2. **Browse Items** - View available clothing items
3. **List Items** - Upload your clothing items
4. **Request Swaps** - Use points or offer items for swaps
5. **Manage Requests** - Accept/reject incoming swap requests

### For Admins
1. **Access Admin Panel** - Navigate to `/admin`
2. **Review Items** - Approve or reject pending items
3. **Monitor Statistics** - View platform metrics
4. **Manage Users** - Update user roles and permissions

## 📁 Project Structure

```
Oddo_Hackathon/
├── backend/
│   ├── config.env          # Environment variables
│   ├── server.js           # Main server file
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   └── uploads/            # Image uploads
├── frontend/
│   ├── public/             # Static files
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   └── App.js          # Main app component
│   └── package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Items
- `GET /api/items` - Get all items
- `POST /api/items` - Create new item
- `GET /api/items/:id` - Get single item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

### Swaps
- `POST /api/swaps` - Create swap request
- `GET /api/swaps/my-requests` - Get user's swap requests
- `GET /api/swaps/my-items` - Get swap requests for user's items
- `PUT /api/swaps/:id/accept` - Accept swap request
- `PUT /api/swaps/:id/reject` - Reject swap request

### Admin
- `GET /api/admin/pending-items` - Get pending items
- `PUT /api/admin/approve-item/:id` - Approve item
- `PUT /api/admin/reject-item/:id` - Reject item
- `GET /api/admin/stats` - Get platform statistics

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- File upload restrictions
- CORS configuration

## 🎨 UI/UX Features

- Responsive design
- Modern UI with Tailwind CSS
- Loading states and error handling
- Toast notifications
- Image preview and upload
- Search and filtering

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- React.js community
- Tailwind CSS team
- MongoDB Atlas for database hosting
- All contributors and testers

---

**Note:** Make sure to replace placeholder values (MongoDB URI, JWT secret, etc.) with your actual configuration before deploying. 