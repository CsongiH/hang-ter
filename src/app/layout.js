import "./globals.css";
import Navbar from "../../components/layout/navbar";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "../../lib/AuthContext";
import Footer from "../../components/layout/footer";

export default function RootLayout({ children }) {
    return (
        <html lang="hu">
            <body>
                <Toaster toastOptions={{ className: 'toast' }} />
                <AuthProvider>
                    <div className="page">
                        <Navbar />
                        {children}
                        <Footer />
                    </div>
                </AuthProvider>
            </body>
        </html>
    );
}
