import type { Metadata, Viewport } from "next";
import { EB_Garamond, Inter_Tight } from "next/font/google";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import "./globals.css";

// Cargadas vía next/font/google (auto-hosted, fallback con métricas
// ajustadas) en vez de <link>, para evitar layout shift al cargar
// (ver spec-frontend-ux.md y spec-design-fidelity.md).
const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-eb-garamond",
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter-tight",
});

export const metadata: Metadata = {
  title: "Cinemaloop",
  description: "Encadena actores y películas contra reloj. Llega lo más lejos posible.",
};

// Sin esto, Next.js App Router no inyecta ningún <meta name="viewport">
// por defecto: Safari en iOS asume el ancho de escritorio (~980px) y
// escala toda la página, forzando al usuario a hacer zoom-out a mano.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`h-full antialiased ${ebGaramond.variable} ${interTight.variable}`}>
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
