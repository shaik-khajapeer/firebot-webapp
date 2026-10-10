"use client";

import { useRef,useState,type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Paper,
  Typography,
} from "@mui/material";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlined from "@mui/icons-material/VisibilityOffOutlined";
import styles from "./page.module.css";

export default function LoginForm() {
  const router = useRouter();
  const [username,setUsername]=useState("");
  const [password,setPassword]=useState("");
  const [showPassword,setShowPassword]=useState(false);
  const [rememberMe,setRememberMe]=useState(true);
  const [submitted,setSubmitted]=useState(false);
  const [notice,setNotice]=useState("");
  const usernameRef=useRef<HTMLInputElement>(null);
  const passwordRef=useRef<HTMLInputElement>(null);
  const usernameError=submitted&&!username.trim();
  const passwordError=submitted&&!password;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    setNotice("");

    if(!username.trim()) {
      usernameRef.current?.focus();
      return;
    }

    if(!password) {
      passwordRef.current?.focus();
      return;
    }

    router.push("/projects/new");
  }

  return (
    <Paper
      component="section"
      aria-labelledby="login-title"
      elevation={0}
      className={styles.card}
    >
      <Typography component="h2" id="login-title" className={styles.title}>
        Login
      </Typography>

      <form noValidate onSubmit={handleSubmit}>
        <div className={styles.fields}>
          <FormControl fullWidth required error={usernameError}>
            <FormLabel htmlFor="username" className={styles.label}>
              User Name/Email
            </FormLabel>
            <OutlinedInput
              id="username"
              name="username"
              inputRef={usernameRef}
              value={username}
              onChange={(event) => {
                setUsername(event.target.value);
                setNotice("");
              }}
              placeholder="Enter Here"
              autoComplete="username"
              inputProps={{
                "aria-describedby": usernameError? "username-error":undefined,
                autoCapitalize: "none",
                spellCheck: false,
              }}
            />
            {usernameError&&(
              <FormHelperText id="username-error" sx={{ mx: 0 }}>
                Enter your user name or email.
              </FormHelperText>
            )}
          </FormControl>

          <FormControl fullWidth required error={passwordError}>
            <FormLabel htmlFor="password" className={styles.label}>
              Password
            </FormLabel>
            <OutlinedInput
              id="password"
              name="password"
              inputRef={passwordRef}
              type={showPassword? "text":"password"}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setNotice("");
              }}
              placeholder="Enter Here"
              autoComplete="current-password"
              inputProps={{
                "aria-describedby": passwordError? "password-error":undefined,
              }}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showPassword? "Hide password":"Show password"}
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((visible) => !visible)}
                    edge="end"
                    size="small"
                    sx={{ p: "6px" }}
                  >
                    {showPassword? (
                      <VisibilityOffOutlined sx={{ fontSize: 17 }} />
                    ):(
                      <VisibilityOutlined sx={{ fontSize: 17 }} />
                    )}
                  </IconButton>
                </InputAdornment>
              }
            />
            {passwordError&&(
              <FormHelperText id="password-error" sx={{ mx: 0 }}>
                Enter your password.
              </FormHelperText>
            )}
          </FormControl>
        </div>

        <FormControlLabel
          className={styles.remember}
          control={
            <Checkbox
              name="rememberMe"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              size="small"
              sx={{
                p: 0,
                mr: "6px",
                color: "#767676",
                "&.Mui-checked": { color: "#767676" },
                "& .MuiSvgIcon-root": { fontSize: 17 },
              }}
            />
          }
          label="Remember me"
          slotProps={{ typography: { fontSize: 12 } }}
        />

        <Button type="submit" variant="contained" fullWidth>
          Login
        </Button>
        <Typography color="text.secondary" sx={{ mt: 1, fontSize: 11 }}>
          Demo mode: enter any user name and password. No credentials are sent or saved.
        </Typography>

        <div className={styles.separator} aria-hidden="true" />

        <Button
          type="button"
          variant="outlined"
          fullWidth
          onClick={() =>
            setNotice(
              "Company Single Sign-On is not configured yet. Connect your organization's identity provider to enable SSO.",
            )
          }
        >
          Sign in with Company Single Sign-On
        </Button>

        {notice&&(
          <Alert severity="info" role="status" sx={{ mt: 2,fontSize: 12 }}>
            {notice}
          </Alert>
        )}
      </form>
    </Paper>
  );
}
