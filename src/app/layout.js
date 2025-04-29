import "./globals.css";
import Navbar from "../../components/navbar";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "../../lib/AuthContext";

export default function RootLayout({ children }) {
    return (
        <html lang="hu">
        <body>
        <AuthProvider>
            <Navbar />
            {children}
            <Toaster toastOptions={{
                className: '',
                style: {
                    padding: '16px',
                    color: '#ffffff',
                    backgroundColor: '#000000',
                },
            }
            }
            />
        </AuthProvider>
        </body>
        </html>
    );
}