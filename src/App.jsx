import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Layout from "./router/layout";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";
// import Upload from "./components/heroSection/Upload";
import DesignTemplate from "./components/heroSection/DesignTemplate";
import EmailConfig from "./components/heroSection/EmailConfig";

function App() {
  const router = createBrowserRouter([
    {
      path: "/login",
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
          element: (
            <div className="flex flex-col md:flex-row justify-center gap-4 px-7">
              {/* <Upload /> */}
              <DesignTemplate />
            </div>
          ),
        },
        {
          path: "uploaddata",
          element: (
            <div className="flex flex-col md:flex-row justify-center gap-4 px-7">
              {/* <Upload /> */}
              <DesignTemplate />
            </div>
          ),
        },
        {
          path: "previewsend",
          element: (
            <div className="flex justify-center gap-4 px-7">
              <EmailConfig />
            </div>
          ),
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