"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import ProjectSettingsWidget from "./project-settings-widget";
import styles from "./project.module.css";

const ProjectForm = dynamic(() => import("./project-form"), {
  ssr: false,
  loading: () => <p role="status">Loading project setup...</p>,
});

export default function NewProjectPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Image src="/everon-logo-white.png" alt="Everon" width={682} height={146} priority />
        <div className={styles.headerActions}>
          <Link href="/login" className={styles.exit}>Exit demo</Link>
          <ProjectSettingsWidget />
        </div>
      </header>
      <nav className={styles.breadcrumb} aria-label="Project">
        &lt;Design Project 01&gt;
        <span>Demo workspace</span>
      </nav>
      <main className={styles.main}>
        <ProjectForm />
      </main>
    </div>
  );
}
