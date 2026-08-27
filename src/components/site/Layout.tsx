import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { SupportChatProvider } from "./SupportChat";

export function Layout() {
  return (
    <SupportChatProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </SupportChatProvider>
  );
}
