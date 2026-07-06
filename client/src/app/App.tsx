import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { CartProvider } from "../context/CartContext";
import { ThemeProvider } from "../context/ThemeContext";

export default function App() {
  return (
    <ThemeProvider>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </ThemeProvider>
  );
}
