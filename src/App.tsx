import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";

import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import CreateAccount from "./pages/Forms/CreateAccountForm";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import CreateNotif from "./pages/Notification/CreateNotification";
import NotificationsPage from "./pages/Notification/Notification";
import ResumeLists from "./pages/ResumeLists";

import { initializeApp } from "firebase/app";
import ForgotPassword from "./components/auth/ForgotPassword";
const firebaseConfig = {
  apiKey: "AIzaSyBVVzJHj2a8z8DEjBAGuvO4zc8fjrm92N8",
  authDomain: "iain-f7c30.firebaseapp.com",
  projectId: "iain-f7c30",
  storageBucket: "iain-f7c30.firebasestorage.app",
  messagingSenderId: "854098983635",
  appId: "1:854098983635:web:30a821bfed2ada47093226",
  measurementId: "G-4BRVSXBWKJ",
};
// Initialize Firebase
initializeApp(firebaseConfig);

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Home />} />

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />

            {/* Forms */}
            <Route path="/form-elements" element={<CreateAccount />} />
            <Route path="/create-notification" element={<CreateNotif />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/resume-lists" element={<ResumeLists />} />

            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />

            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/reset-password" element={<ForgotPassword />} />
          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
