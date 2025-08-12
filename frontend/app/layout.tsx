"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import NotificationToast from "@/components/NotificationToast";
import AuthGuard from "@/components/AuthGuard";
import { Provider } from "react-redux";
import { store } from "@/lib/store";
import { usePathname } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

// Routes that don't require authentication
const publicRoutes = ["/", "/login", "/register"];

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicRoute = publicRoutes.includes(pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      {!isPublicRoute && <Navigation />}
      <main className={!isPublicRoute ? "lg:pl-64" : ""}>
        {isPublicRoute ? children : <AuthGuard>{children}</AuthGuard>}
      </main>
      <NotificationToast />
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Provider store={store}>
          <LayoutContent>{children}</LayoutContent>
        </Provider>
      </body>
    </html>
  );
}
