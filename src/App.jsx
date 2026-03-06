import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Layout from "./router/layout";
// import Upload from "./components/heroSection/Upload";
import DesignTemplate from "./components/heroSection/DesignTemplate";
import EmailConfig from "./components/heroSection/EmailConfig";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
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
    <div className="bg-gray-200 min-h-screen">
      <div className="font-roboto text-4xl pt-6 px-7 font-bold">
        AutoCerts
      </div>

      <div className="text-md text-gray-600 py-2.5 px-7">
        Upload Excel data, customize templates, and send personalized
        certificates or ID cards via email
      </div>

      <RouterProvider router={router} />
    </div>
  );
}

export default App;