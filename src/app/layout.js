import "./globals.css";
import Navbar from "../../components/layout/navbar";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "../../lib/AuthContext";
import { ThemeProvider } from "../../lib/ThemeContext";
import Footer from "../../components/layout/footer";

export default function RootLayout({ children }) {
    return (
        <html lang="hu">
            <head>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            (function() {
                                const theme = localStorage.getItem('theme') ||
                                    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                                document.documentElement.setAttribute('data-theme', theme);
                            })();
                        `
                    }}
                />
            </head>
            <body>
                <Toaster toastOptions={{ className: 'toast' }} />
                <ThemeProvider>
                    <AuthProvider>
                        <div className="page">
                            <Navbar />
                            {children}
                            <Footer />
                        </div>
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
