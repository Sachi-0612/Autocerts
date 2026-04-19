import React from "react";
import { createBrowserRouter, RouterProvider, useNavigate } from "react-router-dom";

import Layout from "./router/layout";
import Login from "./components/Login";
import History from "./components/History";
import Canvas from "./components/Canvas";
import EmailEditor from "./components/EmailEditor";
import HomeHero from "./components/heroSection/HomeHero";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";

function AuthCallback() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  React.useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const token = params.get('token');
    const userData = params.get('user');

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_data', userData);
        setUser(user);
        navigate('/');
      } catch (error) {
        console.error('Error parsing auth data:', error);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate, setUser]);

  return <div>Loading...</div>;
}

function App() {
  const router = createBrowserRouter([
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/signup",
      element: <Login />,
    },
    {
      path: "/auth/callback",
      element: <AuthCallback />,
    },
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <DataProvider>
            <Layout />
          </DataProvider>
        </ProtectedRoute>
      ),
      children: [
        {
          path: "",
          element: <HomeHero />,
        },
        {
          path: "canvas",
          element: <Canvas />,
        },
        {
          path: "email-editor",
          element: <EmailEditor />,
        },
        {
          path: "history",
          element: <History />,
        },
      ],
    },
  ]);

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;