# Battleship Game Frontend

This is the frontend for a Battleship game built with React. The project uses Vite as the build tool and includes various dependencies for UI components and data visualization.

## Dependencies

### Core Dependencies
- **React** (^19.1.0) - UI library
- **React Router DOM** (^7.6.3) - Client-side routing
- **Tailwind CSS** (^4.1.11) - Utility-first CSS framework

### Chart Dependencies
- **Chart.js** (^4.5.0) - Charting library for JavaScript
- **React Chart.js 2** (^5.3.0) - React wrapper for Chart.js

### Development Dependencies
- **Vite** (^7.0.6) - Build tool and dev server
- **@vitejs/plugin-react** (^4.7.0) - Vite plugin for React
- **PostCSS** (^8.5.6) - CSS processing
- **Autoprefixer** (^10.4.21) - CSS vendor prefixing

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Available Scripts

In the project directory, you can run:

### `npm run dev`

Runs the app in development mode using Vite.\
Open [http://localhost:5173](http://localhost:5173) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `dist` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

### `npm run preview`

Serves the production build locally for preview.\
This is useful for testing the production build before deployment.

## Learn More

To learn more about the technologies used in this project:

- [React documentation](https://reactjs.org/)
- [Vite documentation](https://vitejs.dev/)
- [Tailwind CSS documentation](https://tailwindcss.com/)
- [Chart.js documentation](https://www.chartjs.org/)
- [React Router documentation](https://reactrouter.com/)

## Features

- **Ship Placement**: Drag and drop ships onto the game board
- **Real-time Gameplay**: Turn-based battleship gameplay with real-time updates
- **Player Statistics**: Track wins, losses, accuracy, and other combat stats
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Mode Support**: Automatic dark/light theme switching
