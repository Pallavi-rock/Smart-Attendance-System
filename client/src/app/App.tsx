import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { Toaster } from "react-hot-toast";

/**
 * Root application component — delegates routing to React Router.
 */
export default function App() {
  return <><RouterProvider router={router} /><Toaster position="top-right" /></>;
}
