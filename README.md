# 🎯 Habit Tracker - Material You

A beautiful, modern habit tracking web application built with Material Design 3 (Material You) principles. Track your daily habits, visualize your progress, and build lasting routines with an elegant, responsive interface.

![Habit Tracker Interface](/Users/sharath/.gemini/antigravity/brain/9f2e5292-012b-4c05-bd8c-012a4283284c/habit_tracker_main_1763663013262.png)

## ✨ Features

### 📊 Core Functionality
- **Daily Habit Tracking**: Create and track unlimited habits with customizable names and icons
- **Visual Progress Indicators**: See your completion status at a glance with intuitive checkmarks
- **Streak Tracking**: Monitor your current and best streaks for each habit
- **Calendar Heatmap**: Visualize your habit completion history with an interactive heatmap
- **Advanced Analytics**: Track weekly progress, total check-ins, and average completion rates

### 🎨 Design & User Experience
- **Material You Design**: Implements Google's latest Material Design 3 expressive principles
- **Dark Mode Support**: Seamless light/dark theme switching with system preference detection
- **Responsive Layout**: Optimized for desktop, tablet, and mobile devices
- **Smooth Animations**: Expressive motion design with accessibility considerations
- **Tonal Elevation**: Sophisticated depth and hierarchy using Material 3 elevation system

### 🔐 Data & Sync
- **Firebase Authentication**: Secure email/password authentication
- **Real-time Sync**: Automatic cloud synchronization across devices
- **Offline Support**: Works offline with local storage fallback
- **Data Persistence**: Never lose your progress with cloud backup

### 📈 Analytics Dashboard
- **Week Progress**: Track completion percentage for the current week
- **Total Check-ins**: Lifetime habit completion counter
- **Best Streak**: See your longest consecutive completion streak
- **Average Completion**: Monitor your overall completion rate

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Python 3.x (for local development server) or any HTTP server
- Firebase account (for authentication and data sync)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/habit-tracker.git
   cd habit-tracker
   ```

2. **Configure Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Email/Password authentication in Authentication settings
   - Create a Firestore database
   - Copy your Firebase configuration
   - Update `assets/js/firebase-config.js` with your credentials:
   
   ```javascript
   const firebaseConfig = {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_AUTH_DOMAIN",
       projectId: "YOUR_PROJECT_ID",
       storageBucket: "YOUR_STORAGE_BUCKET",
       messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
       appId: "YOUR_APP_ID",
       measurementId: "YOUR_MEASUREMENT_ID"
   };
   ```

3. **Run the application**
   ```bash
   # Using Python 3
   python3 -m http.server 8080
   
   # Or using Python 2
   python -m SimpleHTTPServer 8080
   
   # Or using Node.js http-server
   npx http-server -p 8080
   ```

4. **Access the app**
   - Open your browser and navigate to `http://localhost:8080`
   - Create an account or sign in
   - Start tracking your habits!

## 📖 Usage Guide

### Creating Your First Habit
1. Click the **"+ Create New Habit"** button
2. Enter a habit name (e.g., "Morning Exercise")
3. Select an icon from the Material Symbols library
4. Click **"Create"** to save

### Tracking Daily Progress
1. Navigate to the desired date using the date picker
2. Click the checkbox next to any habit to mark it complete
3. Your streak and progress stats update automatically
4. View your completion history in the heatmap

### Managing Habits
- **Edit**: Click the three-dot menu next to a habit and select "Edit"
- **Delete**: Click the three-dot menu and select "Delete"
- **Reorder**: Habits are displayed in creation order

### Viewing Analytics
- **Stats Cards**: View key metrics at the top of the dashboard
- **Heatmap**: Click "View Heatmap" to see your completion history
- **Charts**: Analyze trends with interactive Chart.js visualizations

## 🏗️ Technical Architecture

### Technology Stack
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Design System**: Material Design 3 (Material You)
- **Icons**: Material Symbols Outlined
- **Charts**: Chart.js 4.4.1
- **Backend**: Firebase (Authentication + Firestore)
- **Hosting**: Static web hosting compatible

### Project Structure
```
habit-tracker/
├── index.html              # Main application file (single-page app)
├── assets/
│   ├── js/
│   │   ├── firebase-config.js   # Firebase initialization
│   │   └── app.js               # Application logic (if separated)
│   └── css/
│       └── styles.css           # Additional styles (if separated)
├── Design Principles       # Material 3 design documentation
└── README.md              # This file
```

### Design System

The application implements a comprehensive Material 3 design system:

#### Color Tokens
- **Primary**: `#1A73E8` (Light) / `#8AB4F8` (Dark)
- **Surface Tones**: Three-level tonal hierarchy
- **Status Colors**: Error, Success, Warning states
- **Semantic Colors**: On-surface, on-primary variants

#### Typography Scale
- **Display**: 57px Google Sans (hero sections)
- **Headline**: 32px Google Sans (page titles)
- **Title**: 22px Google Sans (card headers)
- **Body**: 16px Roboto (content)
- **Label**: 14px Roboto (UI elements)

#### Shape System
- **Small**: 4px (chips, small elements)
- **Medium**: 8px (buttons, inputs)
- **Large**: 12px (cards, modals)
- **Extra**: 16px (prominent cards)
- **Full**: 9999px (circular buttons)

#### Motion Design
- **Fast**: 150ms ease-out (micro-interactions)
- **Medium**: 250ms cubic-bezier (standard transitions)
- **Slow**: 400ms cubic-bezier (page transitions)

### Data Model

#### Habit Object
```javascript
{
  id: "unique-id",
  name: "Habit Name",
  icon: "material-icon-name",
  createdAt: timestamp,
  userId: "user-id"
}
```

#### Check-in Object
```javascript
{
  habitId: "habit-id",
  date: "YYYY-MM-DD",
  completed: true,
  timestamp: timestamp,
  userId: "user-id"
}
```

### Firebase Security Rules

Recommended Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/habits/{habitId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId}/checkins/{checkinId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🎨 Customization

### Changing Colors
Edit the CSS custom properties in `index.html`:

```css
:root {
  --color-primary: #1A73E8;        /* Your brand color */
  --color-secondary: #5F6368;      /* Secondary color */
  --color-accent-gold: #FBBC04;    /* Accent color */
}
```

### Adding Custom Icons
The app uses Material Symbols. Browse available icons at [Google Fonts Icons](https://fonts.google.com/icons) and use the icon name in your habit configuration.

### Modifying Analytics
Chart configurations are in the `renderAnalytics()` function. Customize:
- Chart types (line, bar, doughnut)
- Color schemes
- Data aggregation periods
- Display metrics

## 🔒 Privacy & Security

- **Authentication**: Secure Firebase Authentication with email/password
- **Data Isolation**: User data is completely isolated per account
- **HTTPS**: Use HTTPS in production for secure data transmission
- **No Third-party Tracking**: No analytics or tracking scripts
- **Local Storage**: Sensitive data never stored in localStorage

## 🌐 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 📱 Progressive Web App (PWA)

To convert this into a PWA, add:
1. `manifest.json` for app metadata
2. Service worker for offline functionality
3. App icons in various sizes

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow Material Design 3 principles
- Maintain accessibility standards (WCAG 2.1 AA)
- Write clean, commented code
- Test on multiple browsers and devices
- Respect the existing design system

## 🐛 Known Issues

- Heatmap may take a moment to load with large datasets
- Date picker requires manual navigation (no quick jump to date)
- Bulk habit operations not yet supported

## 🗺️ Roadmap

- [ ] Habit categories and tags
- [ ] Custom habit frequencies (weekly, monthly)
- [ ] Habit reminders and notifications
- [ ] Export data to CSV/JSON
- [ ] Social features (share progress)
- [ ] Habit templates library
- [ ] Advanced statistics and insights
- [ ] Mobile app (React Native)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Material Design Team** - For Material Design 3 principles
- **Firebase Team** - For excellent backend services
- **Chart.js** - For beautiful, responsive charts
- **Material Symbols** - For comprehensive icon library

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Email: sharath141201@gmail.com
- Twitter: @sharath1661

## 🌟 Show Your Support

If you find this project helpful, please consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting new features
- 🔀 Contributing code

---

**Built with ❤️ using Material Design 3**

*Last updated: November 2025*
