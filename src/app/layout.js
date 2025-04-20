import "./globals.css";
import Navbar from "../../components/navbar";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "../../lib/AuthContext"; // Using AuthProvider instead

export default function RootLayout({ children }) {
    return (
        <html lang="hu">
        <body>
        <AuthProvider>
            <Navbar />
            {children}
            <Toaster />
        </AuthProvider>
        </body>
        </html>
    );
}