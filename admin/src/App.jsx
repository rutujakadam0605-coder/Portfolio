import {
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import AdminLayout from "./components/AdminLayout";

function App() {
  return (
    <Routes>

      <Route
        path="/"
        element={
          <Navigate to="/admin" />
        }
      />

      <Route
        path="/admin"
        element={
          <AdminLayout />
        }
      />

    </Routes>
  );
}

export default App;
