"use client";

import { usePathname } from "next/navigation";
import ChatWidget from "./ChatWidget";

// Render the chat widget on all public pages, but not admin or login
export default function ChatWidgetPortal() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin") || pathname.startsWith("/login")) {
    return null;
  }

  return <ChatWidget />;
}
