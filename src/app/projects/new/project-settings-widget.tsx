"use client";

import { useId, useState } from "react";
import { Box, Button, Drawer, IconButton, Typography } from "@mui/material";
import SettingsOutlined from "@mui/icons-material/SettingsOutlined";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import ProjectForm from "./project-form";

export default function ProjectSettingsWidget() {
  const [open, setOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const widgetId = useId();

  return (
    <>
      <Button
        startIcon={<SettingsOutlined />}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={hasOpened ? widgetId : undefined}
        onClick={() => { setHasOpened(true); setOpen(true); }}
        sx={{ color: "#fff", minHeight: 44 }}
      >
        Settings
      </Button>
      {hasOpened && (
        <Drawer
          anchor="right"
          open={open}
          onClose={() => setOpen(false)}
          ModalProps={{ keepMounted: true }}
          slotProps={{
            paper: {
              id: widgetId,
              role: "dialog",
              "aria-modal": true,
              "aria-labelledby": `${widgetId}-title`,
              sx: { width: 360, maxWidth: "100vw", p: 2, bgcolor: "#fafafa" },
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
            <Typography id={`${widgetId}-title`} component="h2" fontSize={14} color="text.secondary">
              Configure
            </Typography>
            <IconButton aria-label="Close settings" onClick={() => setOpen(false)}>
              <CloseOutlined fontSize="small" />
            </IconButton>
          </Box>
          <ProjectForm compact />
          <Typography fontSize={11} color="text.secondary" sx={{ mt: 1 }}>
            Standalone demo widget. Changes stay here while this page is open;
            they do not update the main project form.
          </Typography>
        </Drawer>
      )}
    </>
  );
}
