import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Search from "./pages/Search";
import Feed from "./pages/Feed";
import Home from "./pages/Home";
import Watch from "./pages/Watch";
import Account from "./pages/Account";
import Premium from "./pages/Premium";
import ProtectedRoute from "./components/ProtectedRoute";
import History from "./pages/History";
import Subscriptions from "./pages/Subscriptions";
import Downloads from "./pages/Downloads";
import Help from "./pages/Help";
import PlaceholderPage from "./pages/PlaceholderPage";
import Shorts from "./pages/Shorts";
import MainLayout from "./components/MainLayout";


function App() {
  console.log("App.jsx: render start");
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* 🔒 Protected Routes using MainLayout */}
        <Route element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route path="/main" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/watch/:id" element={<Watch />} />
          <Route path="/shorts" element={<Shorts />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
          <Route path="/history" element={<History />} />
          <Route path="/downloads" element={<Downloads />} />
          <Route path="/dashboard" element={<Feed />} />
          <Route path="/premium" element={<Premium />} />
          <Route path="/account" element={<Account />} /> {/* New Account Page */}
          <Route path="/help" element={<Help />} />
          <Route path="/feed/:category" element={<Feed />} />

          {/* Category Routes reusing Feed */}
          {["/trending", "/shopping", "/music", "/movies", "/live", "/gaming",
            "/news", "/sports", "/courses", "/fashion", "/podcasts"].map(path => (
              <Route key={path} path={path} element={<Feed />} />
            ))}

          {/* Placeholder Routes */}
          {["/playlists", "/watch-later", "/liked", "/your-videos", "/channel",
            "/studio", "/music-app", "/kids",
            "/settings", "/report", "/feedback"].map(path => (
              <Route key={path} path={path} element={<PlaceholderPage />} />
            ))}
        </Route>

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/main" replace />} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/main" />} />
      </Routes>
    </Router>
  );
}

export default App;
