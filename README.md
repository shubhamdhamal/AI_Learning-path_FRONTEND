# AI Learning Path Generator - Mobile App v2

A React Native mobile application for generating personalized AI-powered learning paths with job market insights.

## 🚀 Features

- **AI-Powered Learning Paths**: Generate personalized learning paths based on your goals
- **Real-time Progress Tracking**: Monitor your learning journey with milestone tracking
- **Job Market Insights**: Get salary estimates, job demand, and required skills
- **Offline Support**: Access your saved learning paths offline
- **User Authentication**: Secure login/register with Google OAuth support
- **Beautiful UI**: Modern gradient-based design with smooth animations

## 📱 Screens

1. **Login/Register** - User authentication
2. **Dashboard** - View saved learning paths and progress
3. **Generate Path** - Create new AI-powered learning paths
4. **Path Details** - View complete learning path with milestones
5. **Progress Tracker** - Real-time generation progress
6. **Profile** - User settings and preferences

## 🛠 Tech Stack

- **React Native** with Expo
- **React Navigation** for routing
- **Zustand** for state management
- **Axios** for API calls
- **Expo Linear Gradient** for UI effects
- **React Native Reanimated** for animations

## 📦 Installation

```bash
# Navigate to the mobile app directory
cd project/mobile-appv2

# Install dependencies
npm install

# Start the development server
npm start

# Run on specific platform
npm run android  # For Android
npm run ios      # For iOS
npm run web      # For Web
```

## 🔧 Configuration

Create a `.env` file in the root directory:

```env
API_BASE_URL=http://localhost:5000
```

## 📁 Project Structure

```
mobile-appv2/
├── App.js                 # Main app entry point
├── app.json              # Expo configuration
├── package.json          # Dependencies
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── common/       # Buttons, Inputs, Cards
│   │   ├── forms/        # Form components
│   │   └── learning/     # Learning path specific components
│   ├── context/          # React Context providers
│   ├── hooks/            # Custom React hooks
│   ├── navigation/       # Navigation configuration
│   ├── screens/          # App screens
│   ├── services/         # API services
│   ├── store/            # Zustand state stores
│   ├── theme/            # Colors, typography, spacing
│   └── utils/            # Helper functions
└── assets/               # Images, fonts, icons
```

## 🎨 Design System

The app uses a consistent design system with:
- Primary gradient: Purple to Blue (#667eea → #764ba2)
- Glass-morphism cards with blur effects
- Consistent spacing and typography scales

## 📄 API Endpoints

- `POST /api/generate` - Generate a new learning path
- `GET /api/status/:taskId` - Check generation status
- `GET /api/result/:taskId` - Get completed learning path
- `POST /api/save-path` - Save learning path for user
- `GET /health` - API health check

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.
