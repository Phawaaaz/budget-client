import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Folio | Your money, in perspective",
  description: "Your personal money planner. Track cash flow, understand spending, and give every naira a direction.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script id="folio-design-contract" type="application/json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          THESIS: "A monthly money planner that makes spending and room in the budget tangible.",
          OWN_WORLD: "Graphite, white, yellow planner panel, mint budget field, green income and coral expenses; Geist typography and crisp compact controls.",
          STORY: "See balance, compare money in and out, inspect spending, and set category budgets.",
          FIRST_VIEWPORT: "Fixed navigation beside an unframed financial summary; comparative cash-flow bars, daily chart, category strip; add transaction at upper right.",
          FORM: "Calendar planner, candidate 7, seed 7954bc83. User steered toward a more expressive execution.",
          FINISH: "unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md",
        }) }} />
        {children}
      </body>
    </html>
  );
}
