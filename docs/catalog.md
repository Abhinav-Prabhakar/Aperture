# Aperture Catalog

The complete inventory of building blocks. This is a living document; an item is
not real until it has a registry entry, docs, tests, and a domain review.

**Priority**

| Label | Meaning |
| --- | --- |
| **P0** | Foundation. Ships in the first release (target: months 1–6). The first 90 days focus on the 12 founding instruments plus support. |
| **P1** | Public beta. Prioritized for the first year; not every item is a 1.0 blocker. |
| **P2** | Post-1.0, community, or design-partner driven. |

**Layers**

- **Element** — primitive, inherited from coss/ui.
- **Instrument** — focused research component.
- **Workbench** — full page/layout composition.

---

## 1. Elements (56 primitives + Date Picker pattern)

Vendored from coss/ui at `b2336c4`, kept in sync, extended only when the research
layer needs a new variant. Date Picker is a composed pattern rather than a
standalone primitive, but it is documented as part of the element layer.

Accordion · Alert · Alert Dialog · Autocomplete · Avatar · Badge · Breadcrumb ·
Button · Calendar · Card · Checkbox · Checkbox Group · Collapsible · Combobox ·
Command · Composer · Context Menu · Date Picker · Dialog · Drawer · Empty ·
Field · Fieldset · Form · Frame · Group · Input · Input Group · Kbd · Label ·
Menu · Meter · Number Field · OTP Field · Pagination · Popover · Preview Card ·
Progress · Radio Group · Scroll Area · Segmented Control · Select · Separator ·
Sheet · Sidebar · Skeleton · Slider · Spinner · Switch · Table · Tabs · Textarea ·
Toast · Toggle · Toggle Group · Toolbar · Tooltip.

**Aperture additions to the element layer (P0):**

| Item | Why |
| --- | --- |
| `DescriptionList` | Semantic label/value list; the Key Value List instrument builds on it. |
| `InlineEdit` | Click-to-edit a single value without opening a form. |
| `CopyButton` | One-click copy with success state; used by IDs, hashes, citations. |
| `TruncatedText` | Middle/end truncation with a tooltip and copy. |
| `NumericText` | Low-level tabular numeral renderer; Scientific Number wraps it. |
| `VisuallyHidden` | Accessible fallback content for charts and icons. |
| `SplitPane` | Keyboard-accessible resizable panels for workbenches. |
| `ResizablePanel` | The primitive behind SplitPane. |

---

## 2. Universal instruments

These are useful to every researcher, regardless of discipline. This is where
the product earns trust.

### 2.1 Data intake and structure

| Instrument | What it does | Priority |
| --- | --- | --- |
| **File Dropzone** | Drag/drop + picker, multi-file, progress, validation, retry. | P0 |
| **Upload Queue** | Per-file status, pause/resume, cancel, errors, checksum. | P0 |
| **Schema Preview** | Parse a sample, infer column types, show row/column counts before import. | P0 |
| **Import Wizard** | Steps: file → schema → mapping → validation → destination. | P1 |
| **Dataset Card** | Name, description, owner, size, format, license, version, actions. | P0 |
| **Dataset Header** | Title, DOI, visibility, version switcher, export/share. | P1 |
| **Data Dictionary** | Column names, types, units, descriptions, allowed values, missing codes. | P0 |
| **Metadata Editor** | Typed key/value editor with schema suggestions and validation. | P0 |
| **Metadata Badge** | Compact display of a key/value with copy and edit affordance. | P1 |
| **Data Table** | Virtualized, typed columns, sorting, filtering, selection, density, saved views. | P0 |
| **Table Toolbar** | Search, filters, column visibility, density, export, saved views. | P0 |
| **Column Picker** | Show/hide/reorder columns; persists per view. | P0 |
| **Filter Bar** | Composable filters with chips, operators, and type-aware inputs. | P0 |
| **Filter Chip** | Removable active filter with an inline editor. | P0 |
| **Saved Views** | Named snapshots of sort/filter/columns/density. | P0 |
| **Row Detail Panel** | Side panel with fields, provenance, comments, and actions. | P0 |
| **Cell Editor** | Type-aware inline editing with validation and undo. | P1 |
| **Copy As Menu** | TSV, CSV, JSON, Markdown table, citation. | P1 |
| **Export Menu** | Current view vs. full dataset, format, precision, metadata. | P0 |
| **Pagination Bar** | Page size, range, jump; opt-in for very large sets. | P1 |
| **Provenance Trail** | Source → transformation → artifact, with version and actor. | P1 |
| **Version Switcher** | Dataset/artifact version history with diff entry points. | P1 |
| **Checksum Badge** | Hash display with copy and verification status. | P2 |
| **Lineage Graph** | Upstream/downstream data and run relationships. | P2 |
| **Record Card** | Summary card for a sample, run, participant, or dataset. | P1 |
| **Key Value List** | Dense metadata list with copy, units, and grouping. | P0 |
| **JSON Viewer** | Collapsible, searchable, copyable structured data. | P1 |
| **JSON Editor** | Schema-aware editor with validation. | P2 |
| **File Preview** | Preview CSV, image, PDF, text, and domain formats. | P1 |
| **Storage Meter** | Quota usage by dataset/type with cleanup actions. | P2 |

### 2.2 Measurement and quantities

| Instrument | What it does | Priority |
| --- | --- | --- |
| **Quantity Input** | Number + unit + conversion + precision + validation. | P0 |
| **Unit Select** | Searchable unit picker with dimension filtering and SI prefixes. | P0 |
| **Unit Converter** | Convert a value across compatible units, with full precision. | P1 |
| **Uncertainty Input** | Value ± error, asymmetric errors, significant figures. | P0 |
| **Scientific Number** | Display/format notation, sig-figs, locale, copy full precision. | P0 |
| **Significant Figures** | Control display precision without changing stored value. | P1 |
| **Range Input** | Min/max with units, validation, and optional step. | P0 |
| **Log Scale Toggle** | Axis/scale control with zero handling and labels. | P1 |
| **Coordinate Input** | Lat/long, decimal/DMS, RA/Dec, validation, map pick. | P1 |
| **Geo Coordinate** | Read-only coordinate display with copy and map link. | P1 |
| **Timestamp Input** | Date + time + time zone, ISO storage, relative preview. | P1 |
| **Duration Input** | Human duration with units, normalization, and validation. | P1 |
| **Percent Input** | Percent vs. fraction, precision, clamping. | P2 |
| **Slider With Ticks** | Slider with labeled stops, value input, and keyboard steps. | P1 |
| **Value With Error** | Compact `value ± error` display for tables and cards. | P0 |
| **Detection Limit** | `<` / `>` rendering and parsing for censored values. | P1 |
| **Stat** | Label, value, unit, delta, trend, and context. | P0 |
| **Stat Grid** | Responsive grid of stats with consistent sizing. | P0 |
| **Delta Stat** | Change vs. baseline with direction, significance, and period. | P0 |
| **Sparkline** | Tiny inline time series, accessible summary, no axes. | P0 |
| **Mini Bar** | Tiny categorical comparison for table cells. | P1 |
| **Gauge** | Value in a range with thresholds and target band. | P1 |
| **Threshold Bar** | Value vs. limits with warning/critical zones. | P1 |
| **Signal Quality** | Signal/noise or confidence indicator with explanation. | P2 |
| **Status Dot** | Minimal live status with label and tooltip. | P0 |
| **Trend Arrow** | Direction with color + icon + accessible label. | P1 |
| **Color Scale Legend** | Sequential/diverging legend with min/max and units. | P1 |
| **Axis Control** | Label, units, scale, range, ticks, and transform. | P1 |
| **Plot Toolbar** | Zoom, pan, reset, export, table view, fullscreen. | P1 |
| **Chart Frame** | Consistent title, subtitle, actions, legend, footer, empty state. | P0 |
| **Chart Empty** | No data vs. no results vs. error, with next action. | P0 |
| **Data Tooltip** | Series, value, unit, precision, and source. | P0 |
| **Legend** | Interactive series toggle with accessible labels. | P1 |
| **Brush Range** | Select a time/value range with numeric readout and keyboard. | P1 |
| **Annotation Layer** | Pins, regions, and labels on a chart, tied to data. | P2 |

### 2.3 Scientific text and notation

| Instrument | What it does | Priority |
| --- | --- | --- |
| **Math** | Inline/block KaTeX with accessible fallback text. | P0 |
| **Math Editor** | LaTeX input with live preview and symbol palette. | P1 |
| **Equation Builder** | Visual equation composition for non-LaTeX users. | P2 |
| **Symbol Picker** | Greek letters, operators, units, and constants. | P1 |
| **Citation** | Inline citation with author/year, popover details, copy. | P1 |
| **Citation List** | Numbered/author-date reference list with DOI links. | P1 |
| **Reference Manager** | Add/edit/import references, attach PDFs, cite. | P2 |
| **BibTeX Import** | Paste/upload `.bib`, map fields, detect duplicates. | P1 |
| **DOI Badge** | Validated DOI with resolver link and copy. | P1 |
| **ORCID Badge** | Verified ORCID with link and copy. | P2 |
| **Latex Block** | Code + rendered output toggle for papers/notes. | P1 |
| **Code Block** | Syntax highlighting, line numbers, highlight, copy, filename. | P0 |
| **Code Editor Shell** | CodeMirror wrapper with language, theme, and status. | P1 |
| **Terminal Log** | ANSI-aware, virtualized, searchable log surface. | P0 |
| **Log Viewer** | Levels, filters, timestamps, follow-tail, download. | P0 |
| **Diff Viewer** | Side-by-side/unified text diff with word-level highlights. | P1 |
| **Markdown Editor** | Write/preview, toolbar, shortcuts, image paste. | P1 |
| **Footnote** | Reference marker with popover and list entry. | P2 |
| **Glossary Term** | Inline definition with tooltip and glossary link. | P2 |
| **Taxon** | Italicized scientific name with authority and link. | P2 |
| **Sequence Text** | Monospace, wrapped, indexed biological sequence. | P2 |

### 2.4 Time, runs, and scheduling

| Instrument | What it does | Priority |
| --- | --- | --- |
| **Timeline** | Vertical event history with actors, types, and details. | P0 |
| **Track Timeline** | Horizontal lanes (Gantt) for instruments, people, or jobs. | P1 |
| **Run Timeline** | Steps, durations, retries, and status for a single run. | P1 |
| **Calendar Heatmap** | Contribution-style activity over time, with tooltip. | P1 |
| **Event Log** | Filterable audit/event list with severity and actor. | P1 |
| **Relative Time** | "2 min ago" with absolute tooltip and live update. | P0 |
| **Timezone Label** | Explicit zone with offset and source. | P0 |
| **Schedule Picker** | Date + time + duration + recurrence + zone. | P1 |
| **Recurrence Editor** | RRULE builder with human-readable summary. | P2 |
| **Duration Badge** | Compact elapsed/estimated time with units. | P1 |
| **Countdown Timer** | Deadline/ETA with pause and notifications. | P2 |
| **Stopwatch** | Start/stop/lap with monospace display and export. | P1 |
| **Time Range Picker** | Presets + custom range for charts and tables. | P1 |
| **Playback Controls** | Play/pause/step/speed for time-series and simulations. | P2 |

### 2.5 Workflow, jobs, and collaboration

| Instrument | What it does | Priority |
| --- | --- | --- |
| **Job Card** | State, progress, ETA, owner, actions, failure reason. | P0 |
| **Job Queue** | List/board of jobs with filters, bulk actions, and priority. | P1 |
| **Job Status** | Compact status with live updates and accessible announcements. | P0 |
| **Step Tracker** | Multi-step progress with current, done, failed, skipped. | P0 |
| **Pipeline DAG** | Directed graph of steps with status and selection. | P2 |
| **Run Summary** | Parameters, metrics, artifacts, logs, provenance, actions. | P1 |
| **Resource Meter** | CPU/GPU/RAM/disk with limits, sparkline, and warnings. | P1 |
| **Cluster Node List** | Nodes, partitions, load, state, and allocation. | P2 |
| **Log Stream** | Live tail with pause, filter, and download. | P1 |
| **Cancel Run Dialog** | Confirmation with consequence and optional reason. | P1 |
| **Activity Feed** | Append-only project activity with filters and links. | P1 |
| **Comment Thread** | Anchored comments, replies, resolve, mentions. | P1 |
| **Annotation Pin** | Numbered pin on an image/chart with a comment thread. | P2 |
| **Presence Avatars** | Who is viewing/editing, with quiet status. | P2 |
| **Review Checklist** | Required checks before approval, with assignees. | P1 |
| **Approval Bar** | Approve/request changes with state and history. | P2 |
| **Share Dialog** | Link, permissions, expiry, embed, and copy. | P1 |
| **Permission Matrix** | Roles × resources with inheritance and explanations. | P2 |
| **Contributor List** | CRediT roles with reorder and affiliation. | P1 |
| **Role Badge** | Role display with tooltip and scope. | P1 |
| **Audit Log** | Who did what, when, from where, with filters. | P2 |
| **Notification Inbox** | Grouped notifications with read/unread and actions. | P2 |

### 2.6 Experiment and sample management

| Instrument | What it does | Priority |
| --- | --- | --- |
| **Protocol Steps** | Ordered, checkable steps with timing, notes, and attachments. | P0 |
| **Protocol Checklist** | Compact run-time checklist with progress and sign-off. | P0 |
| **Run Sheet** | Printable execution sheet with parameters, steps, and notes. | P1 |
| **Experiment Card** | Hypothesis, status, owner, dates, samples, runs. | P1 |
| **Sample Card** | ID, type, volume, location, chain of custody, status. | P1 |
| **Sample Table** | Sample registry with typed columns and filters. | P0 |
| **Sample Map** | Freezer/rack/box grid with occupancy and search. | P1 |
| **Well Plate** | 6/24/96/384-well plate with wells, contents, and selection. | P1 |
| **Specimen Chain** | Collection → processing → storage → analysis, with timestamps. | P2 |
| **Instrument Card** | Name, status, location, next booking, calibration due. | P0 |
| **Instrument Status** | Live state (idle/running/error/maintenance) with last update. | P0 |
| **Calibration Log** | Date, standard, result, operator, certificate. | P1 |
| **Reagent Inventory** | Lot, quantity, expiry, location, low-stock alerts. | P1 |
| **Measurement Log** | Timestamped values with units, instrument, and operator. | P1 |
| **ELN Entry** | Rich note with attachments, samples, runs, and signatures. | P1 |
| **Attachment List** | Files with preview, type, size, and provenance. | P1 |
| **Tag Input** | Freeform/controlled tags with suggestions and colors. | P1 |
| **Label Print Sheet** | Barcode/QR label layout for samples and boxes. | P2 |
| **Barcode Scanner** | Camera/manual scan with validation and lookup. | P2 |
| **Timer Card** | Multiple lab timers with labels, alarms, and persistence. | P2 |

### 2.7 Forms and participants

| Instrument | What it does | Priority |
| --- | --- | --- |
| **Survey Builder** | Add/reorder questions, types, logic, preview, publish. | P2 |
| **Question Card** | One question with type, required, help, validation. | P2 |
| **Likert Scale** | 5/7-point scale with labels and accessible radios. | P2 |
| **Matrix Question** | Rows × columns of radios/checkboxes with mobile fallback. | P2 |
| **Consent Tracker** | Consent status, version, date, withdrawal, document. | P2 |
| **Participant Table** | IDs, status, visits, consent, flags (no PHI by default). | P1 |
| **Form Renderer** | Render a schema-driven form with validation and drafts. | P2 |
| **Repeatable Group** | Add/remove/reorder repeated field groups. | P2 |
| **Conditional Logic Builder** | Show/hide/branch rules with a readable summary. | P2 |
| **Validation Summary** | Errors grouped by section with jump links. | P1 |
| **Signature Pad** | Draw/type signature with timestamp and consent text. | P2 |

### 2.8 Search and navigation

| Instrument | What it does | Priority |
| --- | --- | --- |
| **Command Palette** | Global + domain actions, recent, keyboard-first. | P0 |
| **Global Search** | Search across projects, samples, datasets, runs, people. | P1 |
| **Faceted Filter** | Counts + multi-select facets for large collections. | P1 |
| **Search Result** | Typed result row with highlight, metadata, and actions. | P1 |
| **Workspace Switcher** | Switch lab/project/workspace with search and create. | P1 |
| **Project Switcher** | Recent + pinned projects. | P1 |
| **Quick Open** | Jump to a record by ID or name. | P1 |
| **Shortcut Sheet** | `?` overlay with the current context's shortcuts. | P1 |

### 2.9 Export, publishing, and identifiers

| Instrument | What it does | Priority |
| --- | --- | --- |
| **Export Dialog** | Format, scope, precision, metadata, destination. | P0 |
| **Figure Export Panel** | Size, DPI, format, color space, font embedding, preview. | P1 |
| **Data Export Panel** | CSV/TSV/JSON/Parquet, current view vs. full, dictionary. | P1 |
| **Share Link** | Create/copy/revoke with permission and expiry. | P1 |
| **Embed Snippet** | iframe/JS embed with size and theme options. | P2 |
| **License Picker** | SPDX list with explanations and compatibility hints. | P2 |
| **DOI Minter** | Metadata completeness check + mint action (host-app API). | P2 |
| **Citation Block** | Formatted citation in multiple styles with copy. | P1 |
| **Authorship Editor** | Ordered authors, affiliations, CRediT roles, corresponding. | P1 |
| **Data Availability Editor** | Repository, accession, embargo, conditions. | P2 |

---

## 3. Domain packs

Each pack ships 8–15 instruments and 1–2 workbenches. A pack is not "done" until a
domain advisor has reviewed terminology, defaults, and one real workflow.

### 3.1 Life sciences and lab

| Instrument | What it does | Priority |
| --- | --- | --- |
| **Sequence Viewer** | FASTA/GenBank with features, translation, and search. | P1 |
| **Sequence Editor** | Editable sequence with validation and undo. | P2 |
| **Alignment Viewer** | MSA with conservation, gaps, and coloring. | P2 |
| **Variant Table** | Genomic variants with consequence, frequency, and filters. | P2 |
| **Genome Track** | Tracks, zoom, genes, and annotations. | P2 |
| **Gene Search** | Gene/symbol lookup with organism and synonyms. | P2 |
| **Protein Viewer** | 3D structure via Mol* with selection and labels. | P2 |
| **Plasmid Map** | Circular features, cut sites, and selection. | P2 |
| **Flow Cytometry Gate** | Scatter plot with polygon/rect gates and stats. | P2 |
| **Plate Reader Curve** | Kinetic plate data with wells, blanks, and fits. | P1 |
| **Growth Curve** | OD/time with replicates, error bands, and log phase. | P1 |
| **Dose–Response Curve** | 4PL/IC50 fit with confidence bands. | P1 |
| **Survival Curve** | Kaplan–Meier with censoring and risk table. | P1 |
| **Microscope Viewer** | Multi-channel, z-stack, ROI, scale bar, LUT. | P2 |
| **Cell Counter** | Click-to-count with categories and export. | P2 |
| **PCR Program** | Steps, temperatures, cycles, and gradient. | P1 |
| **Gel Lane** | Lane/band annotation with molecular weight. | P2 |
| **Phylogenetic Tree** | Interactive tree with support values and clades. | P2 |
| **BLAST Result** | Hits, alignment, e-values, and filters. | P2 |
| **Taxonomy Picker** | Searchable taxonomic tree with authority. | P2 |
| **Clinical Timeline** | Visits, labs, meds, adverse events. | P2 |
| **Adverse Event Table** | CTCAE grading, relationship, action, outcome. | P2 |

### 3.2 Physics, astronomy, and chemistry

| Instrument | What it does | Priority |
| --- | --- | --- |
| **FITS Viewer** | Image display with stretch, colormap, WCS, and ROI. | P2 |
| **Sky Map** | Coordinate map with survey layers and source overlay. | P2 |
| **Coordinate Picker** | RA/Dec, alt/az, epochs, and observatory site. | P2 |
| **Observation Log** | Target, instrument, conditions, exposure, status. | P2 |
| **Telescope Scheduler** | Requests, constraints, priorities, and timeline. | P2 |
| **Spectrum Plot** | Wavelength/intensity with lines, smoothing, and peaks. | P1 |
| **Spectral Line Table** | Rest wavelengths, species, intensity, and identification. | P2 |
| **Peak Picker** | Detect/annotate peaks with fit and baseline. | P2 |
| **XRD Plot** | 2θ/intensity with phase markers and references. | P2 |
| **Phase Diagram** | Regions, boundaries, and composition/temperature. | P2 |
| **Periodic Table** | Element picker with properties and trends. | P1 |
| **Element Card** | Atomic data, isotopes, and electron configuration. | P1 |
| **Isotope Picker** | Mass number, abundance, half-life. | P2 |
| **Molecule Viewer** | 2D/3D structure with labels and properties. | P2 |
| **Crystal Structure** | Lattice, unit cell, and symmetry. | P2 |
| **Stoichiometry Calculator** | Balanced equations and molar masses. | P2 |
| **Detector Layout** | Sensor/array geometry with ROI and bad channels. | P2 |
| **ROI Editor** | Rect/polygon/ellipse regions with stats. | P2 |
| **Oscilloscope** | Waveform display with triggers and cursors. | P2 |
| **Bode Plot** | Magnitude/phase vs. frequency with cursor readout. | P2 |
| **Nyquist Plot** | Impedance with fit overlay. | P2 |
| **Waveform Viewer** | Multi-channel signals with zoom and markers. | P2 |
| **Constants Reference** | CODATA constants with units, uncertainty, and copy. | P1 |
| **Uncertainty Calculator** | Propagation for formulas with step-by-step output. | P1 |

### 3.3 Earth, environment, and GIS

| Instrument | What it does | Priority |
| --- | --- | --- |
| **Map View** | MapLibre canvas with layers, selection, and controls. | P2 |
| **Layer Control** | Basemap + data layers with opacity and ordering. | P2 |
| **Coordinate Readout** | Live pointer coordinates with CRS and copy. | P2 |
| **Region Draw** | Polygon/rectangle/circle with area and export. | P2 |
| **Time Slider** | Temporal raster/vector playback with speed. | P2 |
| **Raster Legend** | Continuous/categorical scale with units and nodata. | P2 |
| **Station Map** | Station network with status and series preview. | P2 |
| **Climate Stripes** | Warming stripes with period and source. | P2 |
| **Station Chart** | Temperature/precipitation with anomalies. | P2 |
| **Sample Site Card** | Site metadata, visits, measurements, photos. | P2 |
| **GeoJSON Import** | Validate, preview, and import geometries. | P2 |
| **Projection Picker** | CRS search with common presets. | P2 |
| **Scale Bar** | Dynamic scale with units and print style. | P2 |
| **North Arrow** | Orientation control for maps and figures. | P2 |
| **Elevation Profile** | Distance/elevation with slope and markers. | P2 |
| **Hydrograph** | Discharge/precipitation with event annotations. | P2 |

### 3.4 Social science, economics, and policy

| Instrument | What it does | Priority |
| --- | --- | --- |
| **Regression Table** | Coefficients, SE, stars, N, R², fixed effects. | P1 |
| **Coefficient Plot** | Point estimates with CIs and reference line. | P1 |
| **Forest Plot** | Pooled + subgroup effects with heterogeneity. | P2 |
| **Survey Weight Panel** | Design weights, strata, clusters, and diagnostics. | P2 |
| **Panel Data Table** | Entities × time with gaps and balance indicator. | P2 |
| **Difference-in-Differences Setup** | Treatment/control, pre/post, parallel trends. | P2 |
| **Power Calculator** | Effect size, alpha, power, sample size with curve. | P1 |
| **Descriptive Stats Table** | N, mean, SD, median, IQR, missing, by group. | P1 |
| **Codebook** | Variable metadata, value labels, missing codes, notes. | P1 |
| **De-identification Tool** | Detect and redact names, dates, locations, IDs. | P2 |
| **Interview Transcript** | Timestamped turns, speaker labels, search. | P2 |
| **Qualitative Coding** | Select text, apply codes, compare coders. | P2 |
| **Codebook Manager** | Hierarchical codes, definitions, examples, color. | P2 |
| **Memo Pad** | Research memos linked to codes/data. | P2 |
| **Consent Status** | Consent version, date, withdrawal, document. | P2 |
| **Participant Flow (CONSORT)** | Enrollment → allocation → follow-up → analysis. | P2 |
| **PRISMA Flow** | Identification → screening → included, with counts. | P2 |
| **Thematic Network** | Codes/themes as a network with edge strength. | P2 |
| **Survey Preview** | Desktop/mobile preview with logic paths. | P2 |
| **Regression Diagnostics** | Residuals, leverage, QQ, VIF. | P2 |

### 3.5 Humanities and digital scholarship

| Instrument | What it does | Priority |
| --- | --- | --- |
| **Text Annotation** | Select text, add tags, notes, and links. | P2 |
| **TEI Viewer** | Render TEI with apparatus and editorial notes. | P2 |
| **Manuscript Viewer** | Page image + transcription side by side. | P2 |
| **Image Annotation** | Regions, labels, and notes on a zoomable image. | P2 |
| **Deep Zoom Viewer** | Tiled zoom with minimap and coordinates. | P2 |
| **Text Diff** | Compare editions/versions at word and line level. | P2 |
| **Concordance** | Keyword-in-context with frequency and filters. | P2 |
| **Timeline Editor** | Events, periods, sources, and narrative. | P2 |
| **Archival Item Card** | Collection, box/folder, date, rights, provenance. | P2 |
| **Catalog Record** | Dublin Core/MARC-like fields with authority control. | P2 |
| **Citation Style Picker** | Chicago/MLA/APA with locale variants. | P2 |
| **Footnote Editor** | Numbered notes with renumbering and export. | P2 |
| **Translation Pane** | Source/target columns with alignment. | P2 |
| **Exhibit Builder** | Ordered narrative with objects and captions. | P2 |
| **Map Story** | Map + narrative stops with media. | P2 |
| **Provenance Chain** | Custody/history of an object with sources. | P2 |

### 3.6 Clinical and biomedical

| Instrument | What it does | Priority |
| --- | --- | --- |
| **Patient Timeline** | Encounters, diagnoses, meds, labs, procedures. | P2 |
| **Vitals Chart** | Multi-series vitals with reference ranges. | P2 |
| **Medication List** | Drug, dose, route, frequency, start/stop, indication. | P2 |
| **DICOM Viewer** | Study/series, window/level, measurements, annotations. | P2 |
| **Study Series** | Thumbnail strip with modality and description. | P2 |
| **Annotation Tool** | Length/area/angle/ROI with labels. | P2 |
| **Radiology Report** | Structured findings, impression, signing. | P2 |
| **Risk Score** | Inputs, score, category, and explanation. | P2 |
| **Enrollment Tracker** | Screening, eligibility, consent, enrollment. | P2 |
| **Visit Schedule** | Windows, procedures, status, deviations. | P2 |
| **Lab Result Table** | Analyte, value, unit, reference range, flag. | P2 |
| **Adverse Events** | Grade, relationship, action, outcome, seriousness. | P2 |
| **Participant Flow (CONSORT)** | Consort diagram with counts and exclusions. | P2 |

### 3.7 Data science, ML, and computer science

| Instrument | What it does | Priority |
| --- | --- | --- |
| **Notebook Runner** | Cells, outputs, execution order, kernel state. | P2 |
| **Kernel Picker** | Python/R/Julia kernels with environment details. | P2 |
| **Environment Picker** | Conda/uv/venv with package diff. | P2 |
| **Parameter Sweep** | Grid/random sweep builder with run matrix. | P1 |
| **Experiment Tracker** | Runs, params, metrics, artifacts, compare. | P1 |
| **Metric Chart** | Train/val curves with smoothing and step selection. | P1 |
| **Confusion Matrix** | Counts, normalized, per-class metrics. | P1 |
| **ROC / PR Curve** | Curves with AUC/AP and threshold selection. | P1 |
| **Embedding Scatter** | 2D projection with search, selection, and labels. | P2 |
| **Attention Heatmap** | Tokens × tokens with zoom and export. | P2 |
| **Leaderboard Table** | Rank, model, metrics, params, compute, citations. | P1 |
| **Ablation Table** | Grouped ablations with deltas and significance. | P2 |
| **Dataset License Matrix** | Train/test usage rights and restrictions. | P2 |
| **Compute Meter** | GPU-hours, cost, carbon estimate. | P2 |
| **GPU Status** | Utilization, memory, temperature, processes. | P2 |
| **Prompt Editor** | Template, variables, preview, versions. | P2 |
| **Eval Grid** | Cases × metrics with pass/fail and filters. | P2 |
| **Error Analysis Grid** | Samples, predictions, labels, notes. | P2 |
| **Model Card** | Intended use, data, metrics, limitations, ethics. | P2 |
| **Checkpoint Table** | Step, loss, metric, size, path. | P2 |
| **DAG Editor** | Nodes, edges, config, validation. | P2 |
| **Benchmark Table** | Methods × datasets with significance and citations. | P2 |

### 3.8 Engineering and instrumentation

| Instrument | What it does | Priority |
| --- | --- | --- |
| **Schematic Canvas** | Nodes, wires, labels, and validation. | P2 |
| **Pinout Diagram** | Pins, functions, voltages, and notes. | P2 |
| **Measurement Table** | Channel, value, unit, timestamp, uncertainty. | P2 |
| **BOM Table** | Part, manufacturer, qty, cost, supplier, substitutes. | P2 |
| **Sensor Dashboard** | Live values, thresholds, and history. | P2 |
| **Firmware Log** | Device log with levels, timestamps, and filters. | P2 |
| **Serial Monitor** | Send/receive with hex/ASCII and timestamps. | P2 |
| **Calibration Wizard** | Standards, readings, fit, residuals, certificate. | P2 |
| **Tolerance Input** | Nominal + upper/lower tolerance with status. | P2 |
| **Logic Analyzer** | Digital channels with protocol decode. | P2 |
| **PID Tuner** | Setpoint, response, gains, and stability. | P2 |

---

## 4. Workbenches

A workbench is a full page or application shell. It installs route files and
composes instruments; it is not a single component.

### 4.1 Core workbenches

| Workbench | What it contains | Priority |
| --- | --- | --- |
| **Workspace Shell** | Top bar, nav, canvas, inspector, status bar, command palette. | P0 |
| **Data Explorer** | Filter rail, table, chart, row detail, export. | P0 |
| **Lab Dashboard** | Instrument status, samples, alerts, schedule, activity. | P1 |
| **Run Detail** | Parameters, status, logs, metrics, artifacts, provenance. | P1 |
| **Sample Registry** | Index, filters, sample detail, chain of custody. | P1 |
| **Notebook** | File tree, cells, variables, plots, kernel, run all. | P2 |
| **Experiment Planner** | Hypothesis, protocol, parameters, schedule, approvals. | P2 |
| **Public Dataset Page** | Hero, metadata, files, citation, license, provenance. | P1 |
| **Auth & Onboarding** | Sign in, SSO, invite, lab creation, first-run. | P1 |
| **Admin & Settings** | Lab, members, roles, integrations, storage, data policy. | P1 |

### 4.2 Domain workbenches

| Workbench | What it contains | Priority |
| --- | --- | --- |
| **Field Console** | Map, observation entry, offline queue, media, GPS. | P2 |
| **Survey Studio** | Builder, preview, participants, responses, export. | P2 |
| **Coding Room** | Transcript, codebook, coding, memos, agreement. | P2 |
| **Figure Composer** | Canvas, layers, plot library, annotations, export. | P2 |
| **Literature Room** | Outline, PDFs, notes, references, citations. | P2 |
| **Microscopy Workbench** | Image browser, channels, ROI, measurements, export. | P2 |
| **Spectroscopy Workbench** | Spectra, peaks, fits, baselines, export. | P2 |
| **Genomics Workbench** | Sequences, tracks, variants, alignments. | P2 |
| **Clinical Workbench** | Patient timeline, visits, meds, labs, consent. | P2 |
| **ML Experiment Workbench** | Runs, metrics, compare, evals, artifacts. | P2 |
| **Instrument Console** | Live readings, controls, calibration, logs. | P2 |

### 4.3 Print and export packs

| Pack | What it contains | Priority |
| --- | --- | --- |
| **Protocol Sheet** | Steps, timings, notes, sign-off, page numbers. | P1 |
| **Run Sheet** | Parameters, samples, measurements, notes. | P1 |
| **Sample Labels** | Barcode/QR, ID, date, hazard, storage. | P2 |
| **Figure Page** | Figure, caption, methods note, attribution. | P2 |
| **Poster** | A0/A1 grid, sections, figures, references. | P2 |

---

## 5. Recipes (documentation, not components)

Recipes are first-class because they teach composition. Each one is a working
example with copyable code.

| Recipe | What it teaches | Priority |
| --- | --- | --- |
| **CSV → Data Explorer** | Dropzone, schema, table, filters, export. | P0 |
| **Units and uncertainty** | Quantity input, conversion, propagation, display. | P0 |
| **Run a job and watch it** | Job card, log stream, status, cancel, completion. | P1 |
| **Protocol runner** | Steps, timer, notes, sign-off, print. | P1 |
| **Sample registry** | Table, map, detail, chain of custody. | P1 |
| **Spectrum viewer** | Plot frame, peaks, annotations, export. | P1 |
| **Survey → analysis** | Survey builder, responses, descriptive stats. | P2 |
| **Transcript coding** | Transcript, codebook, coding, agreement. | P2 |
| **Paper figure** | Chart, annotation, panel layout, export. | P2 |
| **Public dataset** | Metadata, files, citation, DOI, license. | P1 |
| **FastAPI + Aperture** | Python backend, typed API, React frontend. | P1 |
| **Jupyter anywidget** | Embed a table/plot in a notebook. | P2 |
| **Gradio migration** | Map Gradio inputs/outputs to Aperture instruments. | P2 |
| **Streamlit migration** | Map a Streamlit app to workbenches. | P2 |

---

## 6. What ships first

### First release (target: months 1–6)

The first 90 days are the 12 founding instruments plus support. The rest of the
P0 set follows in months 4–6, before the first public alpha.

**Elements:** all 56, plus DescriptionList, CopyButton, NumericText, SplitPane,
ResizablePanel, InlineEdit, TruncatedText, VisuallyHidden.

**Instruments (12 founding + support):**

1. Quantity Input
2. Scientific Number
3. Uncertainty Input
4. Stat + Stat Grid
5. Sparkline
6. Status Badge + Status Dot
7. Metadata Editor
8. File Dropzone + Upload Queue + Schema Preview
9. Data Table + Toolbar + Filters + Saved Views + Row Detail + Export
10. Log Viewer
11. Timeline
12. Protocol Steps

Support: Chart Frame, Math, Code Block, Command Palette, Key Value List,
Provenance Trail, Sample Table, Instrument Status, Comment Thread, Empty
patterns.

**Workbenches:** Workspace Shell, Data Explorer, Public Dataset Page, Auth &
Settings scaffolds.

**Domain packs:** one to three, chosen with design partners. Recommendation: life
sciences if the first partners are labs; social science if the first partners are
survey teams; physics/astro if the first partners are observatories. Sequence
them; do not build all three at once unless there are two engineers and three
advisors. The first pack must have three external users before the second starts.

### Before 1.0

- 50+ instruments.
- 10+ workbenches.
- 3 domain packs reviewed.
- Python bridge alpha.
- Landing page and docs complete.
- External accessibility audit.

### After 1.0

- Remaining domain packs.
- Vue and Svelte ports.
- R/Shiny and Julia feasibility.
- Studio (visual workbench composer), only if demand is proven.

---

## 7. A workbench is not done until…

- [ ] It composes only registry items; no private one-off components.
- [ ] It has loading, empty, error, offline, and permission-denied states.
- [ ] Filters, tabs, selection, and the selected record are URL-addressable.
- [ ] It has a mock adapter with realistic, non-sensitive data.
- [ ] It has a documented data contract with the three integration points for a
      real backend.
- [ ] It works at 375, 768, 1280, and 1600 px.
- [ ] It has a keyboard path for the primary workflow.
- [ ] It has a print layout where the output is a document (protocol, run sheet,
      labels, figure).
- [ ] It installs into a fresh Next.js app and runs without manual edits.
- [ ] It has a full-page preview and an install command in the docs.
- [ ] It appears in at least one recipe.
- [ ] Its initial JS stays within the workbench budget.

---

## 8. An instrument is not done until…

- [ ] It has a registry item and a docs page.
- [ ] Its docs example is its visual test fixture.
- [ ] It works in light, dark, and Contrast themes.
- [ ] It works at 375, 768, and 1280 px.
- [ ] It works keyboard-only and with a screen reader.
- [ ] It works in RTL.
- [ ] It respects reduced motion.
- [ ] It has unit tests for any logic, with cited reference values.
- [ ] A domain advisor has reviewed terminology and defaults.
- [ ] It has an export path or an accessible fallback where relevant.
- [ ] It meets its bundle budget.
- [ ] It appears in at least one recipe.
