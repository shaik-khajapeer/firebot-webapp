"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Paper, Typography } from "@mui/material";
import styles from "./page.module.css";

// Mount inputs after hydration so password managers cannot change their server markup.
const LoginForm = dynamic(() => import("./login-form"), {
  ssr: false,
  loading: () => (
    <Paper elevation={0} className={styles.card} sx={{ minHeight: 326 }}>
      <Typography component="h2" className={styles.title}>
        Login
      </Typography>
      <Typography role="status" color="text.secondary" fontSize={14}>
        Loading sign-in form...
      </Typography>
      <noscript>Enable JavaScript to use the sign-in form.</noscript>
    </Paper>
  ),
});

export default function LoginPage() {
  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <Image
          className={styles.logo}
          src="/everon-logo-white.png"
          alt="Everon"
          width={682}
          height={146}
          priority
        />
        <Typography component="h1" className={styles.welcome}>
          Hello! Welcome to FireBOT
        </Typography>
        <LoginForm />
      </div>
    </main>
  );
}
