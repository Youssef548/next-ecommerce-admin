import { ModalProvider } from "@/providers/modalProvider";
import AuthContext from "./context/AuthContext";
import ToasterContext from "./context/ToasterContext";
import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metaData = {
  title: "Admin Dashboard",
  describtion: "Generated by create-next-app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className}`}>
        <AuthContext>
          <ModalProvider />
          <ToasterContext />
          {children}
        </AuthContext>
      </body>
    </html>
  );
}
