import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { PwaRegister } from "@/components/pwa";
import { GA_MEASUREMENT_ID } from "@/lib/analytics";
import appCss from "../styles.css?url";

const APP_NAME = "Thirukkural";

function AnalyticsHead() {
  if (!GA_MEASUREMENT_ID) return null;
  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `,
        }}
      />
    </>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, viewport-fit=cover",
      },
      { title: APP_NAME },
      {
        name: "description",
        content:
          "Walk the 1,330 couplets of the Thirukkural in English, with Tamil and transliteration. Swipe, keep your path, install as an app.",
      },
      { name: "theme-color", content: "#14110e" },
      { name: "apple-mobile-web-app-title", content: APP_NAME },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "icon-192.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400;1,6..72,500&family=Noto+Serif+Tamil:wght@400;600;700&display=swap",
      },
    ],
  }),
  component: () => (
    <html lang="en" suppressHydrationWarning className="antialiased">
      <head>
        <HeadContent />
        <AnalyticsHead />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          <PwaRegister />
          <Outlet />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
