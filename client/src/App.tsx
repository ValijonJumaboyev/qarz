import { Route, Routes } from "react-router-dom"
import SignUp from "./pages/SignUp"
import LandingPage from "./pages/LandingPage"
import SignIn from "./pages/SignIn"
import PrivateRoute from "./components/PrivateRoute"
import Dashboard from "./pages/Dashboard"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/signin" element={<SignIn />} />
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
    </Routes>
  )
}
