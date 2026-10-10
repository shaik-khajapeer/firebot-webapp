import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Project Setup | Everon FireBOT",
  description: "FireBOT demo project setup and building plan configuration.",
};

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  return children;
}
