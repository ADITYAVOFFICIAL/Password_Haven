import { ReactNode } from "react";
import { Navbar } from "@/components/Navbar";
import {Footer} from "@/components/ui/Footer";
interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      {/* Use the new Navbar component */}
      <Navbar />
      
      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}