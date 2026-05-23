import Script from "next/script";
import { TgProvider } from "./tg-context";
import { TgShell } from "./TgShell";

export default function TgLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="beforeInteractive"
      />
      <TgProvider>
        <TgShell>{children}</TgShell>
      </TgProvider>
    </>
  );
}
