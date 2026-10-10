import type { Metadata } from "next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Login | Everon FireBOT",
  description: "Sign in to Everon FireBOT.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // Browser extensions add root attributes before hydration; descendants remain checked.
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <Providers>{children}</Providers>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
