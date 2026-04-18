import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Layout from "./router/layout";
import Login from "./components/Login";
import History from "./components/History";
import Canvas from "./components/Canvas";
import EmailEditor from "./components/EmailEditor";
import HomeHero from "./components/heroSection/HomeHero";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";

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