import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddSubscription from "./pages/AddSubscription";
import EditSubscription from "./pages/EditSubscription";
import { Analytics } from "@vercel/analytics/next"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subscriptions/add"
          element={
            <ProtectedRoute>
              <AddSubscription />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subscriptions/update/:id"
          element={
            <ProtectedRoute>
              <EditSubscription />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;