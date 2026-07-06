import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { CartProvider } from "../context/CartContext";

export default function App() {
  return (
    <CartProvider>
      <RouterProvider router={router} />
    </CartProvider>
  );
}
