"use client";

import { useId, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import {
  Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, FormControlLabel, FormLabel, OutlinedInput, Paper,
  Radio, RadioGroup,
} from "@mui/material";
import AutoAwesomeOutlined from "@mui/icons-material/AutoAwesomeOutlined";
import StraightenOutlined from "@mui/icons-material/StraightenOutlined";
import styles from "./project.module.css";

const scales = ['1/16" = 1\'-0"', '1/8" = 1\'-0"', '1/4" = 1\'-0"', "1:50", "1:100", "1:200"];

function SelectField({ id, label, value, options, required = false, onChange }: {
  id: string;
  label: string;
  value: string;
  options: string[];
  required?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}{required && <span aria-hidden="true"> *</span>}
      </label>
      <select id={id} className={styles.select} required={required} value={value}
        onChange={(event) => onChange(event.target.value)}>
        <option value="">Select</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </div>
  );
}

export default function ProjectForm({ compact = false }: { compact?: boolean }) {
  const formId = useId();
  const [projectName, setProjectName] = useState("Emerald House - Fire System Design");
  const [occupancy, setOccupancy] = useState("Business (Group B)");
  const [edition, setEdition] = useState("NFPA 72 - 2022");
  const [panel, setPanel] = useState("Addressable");
  const [brand, setBrand] = useState("Notifier");
  const [sprinklers, setSprinklers] = useState("Yes");
  const [voice, setVoice] = useState("Yes");
  const [scale, setScale] = useState(scales[1]);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [notice, setNotice] = useState("");
  const [prepared, setPrepared] = useState(false);
  const [calibrating, setCalibrating] = useState(false);
  const uploadRef = useRef<HTMLInputElement>(null);
  const uploadButtonRef = useRef<HTMLButtonElement>(null);
  const fileName = file?.name ?? "Emerald House - Ground Floor.pdf (sample)";
  const brandField = (
    <SelectField id={`${formId}-brand`} label="Preferred Brand (Optional):"
      value={brand} onChange={setBrand} options={["Notifier", "Edwards", "Siemens", "Potter", "No preference"]} />
  );

  function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    if (!selected) return;
    setNotice("");
    if (!/\.(pdf|png|jpe?g|dwg|dxf)$/i.test(selected.name)) {
      setFileError("Choose a PDF, PNG, JPG, DWG, or DXF floor plan.");
      event.target.value = "";
      return;
    }
    if (selected.size === 0 || selected.size > 10 * 1024 * 1024) {
      setFileError("Choose a non-empty file no larger than 10 MB.");
      event.target.value = "";
      return;
    }
    setFile(selected);
    setFileError("");
  }

  function prepareFloorPlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (fileError) {
      uploadButtonRef.current?.focus();
      return;
    }
    setPrepared(true);
  }

  return (
    <Paper component="form" onSubmit={prepareFloorPlan} elevation={0}
      className={`${styles.card} ${compact ? styles.compact : ""}`}>
      {compact
        ? <h2 className={styles.sectionTitle}>System &amp; Project Setup</h2>
        : <h1 className={styles.sectionTitle}>Project Setup</h1>}
      <div className={styles.grid}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor={`${formId}-project-name`}>Project/Design Name (Optional):</label>
          <OutlinedInput id={`${formId}-project-name`} value={projectName}
            onChange={(event) => setProjectName(event.target.value)} fullWidth />
        </div>
        {!compact && <div className={styles.field}>
          <label className={styles.label} htmlFor={`${formId}-request-id`}>Design Request ID: <span>*</span></label>
          <OutlinedInput id={`${formId}-request-id`} value="0123456789" readOnly
            sx={{ maxWidth: 280, bgcolor: "#ddd" }} />
        </div>}
        <SelectField id={`${formId}-occupancy`} label="IBC Occupancy Group (for AI context):" required
          value={occupancy} onChange={setOccupancy}
          options={["Assembly (Group A)", "Business (Group B)", "Educational (Group E)", "Factory (Group F)", "Mercantile (Group M)", "Residential (Group R)", "Storage (Group S)"]} />
        <SelectField id={`${formId}-edition`} label="NFPA 72 Edition (for AI context):" required
          value={edition} onChange={setEdition}
          options={["NFPA 72 - 2019", "NFPA 72 - 2022", "NFPA 72 - 2025"]} />
        <SelectField id={`${formId}-panel`} label="Panel Installation Type:" required
          value={panel} onChange={setPanel} options={["Addressable", "Conventional", "Hybrid"]} />
        {!compact && brandField}
        <FormControl required>
          <FormLabel id={`${formId}-sprinkler-label`} className={styles.label}>Is this building Sprinkler?</FormLabel>
          <RadioGroup row aria-labelledby={`${formId}-sprinkler-label`} value={sprinklers}
            onChange={(event) => setSprinklers(event.target.value)}>
            {["Yes", "No", "Unknown"].map((option) => (
              <FormControlLabel key={option} value={option} label={option}
                control={<Radio size="small" />} slotProps={{ typography: { fontSize: 12 } }} />
            ))}
          </RadioGroup>
        </FormControl>
        <FormControl required>
          <FormLabel id={`${formId}-voice-label`} className={styles.label}>Is this a voice evacuation system?</FormLabel>
          <RadioGroup row aria-labelledby={`${formId}-voice-label`} value={voice}
            onChange={(event) => setVoice(event.target.value)}>
            {["Yes", "No"].map((option) => (
              <FormControlLabel key={option} value={option} label={option}
                control={<Radio size="small" />} slotProps={{ typography: { fontSize: 12 } }} />
            ))}
          </RadioGroup>
        </FormControl>
        {compact && brandField}
      </div>

      <h2 className={styles.sectionTitle}>Building Plan and Scale</h2>
      <div className={styles.grid}>
        <div className={styles.field}>
          <span className={styles.label}>Upload Plan</span>
          <input ref={uploadRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.dwg,.dxf" hidden
            aria-label="Upload floor plan" onChange={chooseFile} />
          <Button ref={uploadButtonRef} variant={compact ? "contained" : "outlined"} type="button" onClick={() => uploadRef.current?.click()}
            fullWidth={compact} sx={{ alignSelf: "flex-start", minWidth: compact ? 0 : 185 }}>
            Upload the Floor Plan
          </Button>
          <span className={styles.fileName}>{fileName}</span>
          <p className={styles.hint}>Supported: PDF, PNG, JPG, DWG, DXF. Max. 10 MB.</p>
          {file && <Button size="small" sx={{ alignSelf: "flex-start" }} onClick={() => {
            setFile(null);
            setFileError("");
            setNotice("");
            if (uploadRef.current) uploadRef.current.value = "";
          }}>Use sample plan</Button>}
          {fileError && <Alert severity="error">{fileError}</Alert>}
        </div>
        <div className={styles.field}>
          <SelectField id={`${formId}-scale`} label="Architectural Scale" value={scale} required
            options={scales} onChange={(value) => { setScale(value); setNotice(""); }} />
          <div className={styles.actions}>
            <Button type="button" variant="outlined" size="small" startIcon={<AutoAwesomeOutlined />}
              onClick={() => {
                if (file) {
                  setNotice("AI detection is not connected in this demo. Select the scale shown on your plan manually.");
                } else {
                  setScale(scales[1]);
                  setNotice('Sample scale applied: 1/8" = 1\'-0". This is dummy data, not an AI measurement.');
                }
              }}>
              Detect with AI
            </Button>
            <Button type="button" variant="outlined" size="small" color="inherit"
              startIcon={<StraightenOutlined />} onClick={() => setCalibrating(true)}>
              Calibrate by Door (3&apos; 0&quot;)
            </Button>
          </div>
        </div>
      </div>
      {notice && <Alert severity="info" role="status" sx={{ mb: 2 }}>{notice}</Alert>}
      <Button type="submit" variant="contained" className={styles.prepare}>Prepare Floor Plan</Button>
      <p className={styles.hint} style={{ marginTop: 12 }}>
        Demo with dummy data. Files stay in this browser tab; no upload, AI analysis, or fire-safety design is performed.
      </p>

      <Dialog open={calibrating} onClose={() => setCalibrating(false)} fullWidth maxWidth="xs">
        <DialogTitle>Calibrate by Door (3&apos; 0&quot;)</DialogTitle>
        <DialogContent>
          <Alert severity="info">
            Interactive measurement is not connected in this demo. You can apply the sample
            door calibration to the sample plan, or select an architectural scale manually.
            This is not a measured or verified scale.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCalibrating(false)}>Cancel</Button>
          <Button disabled={Boolean(file)} onClick={() => {
            setScale(scales[1]);
            setNotice("Sample door calibration applied. This dummy scale is not a real measurement.");
            setCalibrating(false);
          }}>Apply sample calibration</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={prepared} onClose={() => setPrepared(false)} fullWidth maxWidth="sm">
        <DialogTitle>Floor plan setup summary</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            Demo only. These selections have not been saved or processed. No compliant design has been generated.
          </Alert>
          <dl className={styles.summary}>
            <dt>Project</dt><dd>{projectName.trim() || "Untitled project"}</dd>
            <dt>Design Request ID</dt><dd>0123456789</dd>
            <dt>Occupancy</dt><dd>{occupancy}</dd>
            <dt>NFPA edition</dt><dd>{edition}</dd>
            <dt>Panel / Brand</dt><dd>{panel} / {brand || "No preference"}</dd>
            <dt>Sprinkler / Voice evacuation</dt><dd>{sprinklers} / {voice}</dd>
            <dt>Plan</dt><dd>{fileName}</dd>
            <dt>Scale</dt><dd>{scale}</dd>
          </dl>
        </DialogContent>
        <DialogActions><Button onClick={() => setPrepared(false)}>Back to setup</Button></DialogActions>
      </Dialog>
    </Paper>
  );
}
