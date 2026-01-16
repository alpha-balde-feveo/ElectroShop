import { createBrowserRouter } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Shop from "../pages/Shop";

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Shop /> },
      { path: "/shop", element: <Shop /> },
    ],
  },
]);
