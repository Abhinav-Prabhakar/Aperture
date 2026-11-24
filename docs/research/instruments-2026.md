# What researchers actually need from Aperture

Research memo · 24 November 2026

## Summary

The first 18 instruments proved that a research design system can exist. They
did not yet prove why it needs to exist.

Eight of the 18 are generic patterns with research styling: Stat, Sparkline,
Timeline, Status Badge, Log Viewer, Metadata Editor, File Dropzone, Data Table.
Three are genuine measurement primitives: Scientific Number, Quantity Input,
Uncertainty Input. Seven are domain or workflow views: Sequence Viewer, Growth
Curve, Dose–Response, Spectrum Plot, Periodic Table, Constants Reference, and —
more thinly — Protocol Steps. None of the 18 records what happens between acquisition
and publication: what was excluded, how an instrument was calibrated, which
sample became which aliquot, which run produced which figure, or who approved
the result.

That is the gap. Research software is hard not because drawing a line chart is
hard, but because the **epistemic state** around the chart is hard: identity,
provenance, uncertainty, disposition, comparability, and compliance. Generic UI
kits have no representation for those states, so every research team invents a
worse one in a spreadsheet.

This memo proposes 20 **compound instruments** for that layer, scored against a
strict test, plus a build order. The recommendation is to stop adding charts
until the semantic layer exists, and to reclassify the generic patterns
honestly.

**Method.** Desk research: peer-reviewed studies of research data practice and
reproducibility, reporting standards (ARRIVE, PRISMA, MIQE, GUM, PROV, FAIR),
publisher figure requirements, and a review of adjacent component libraries and
platforms. No primary interviews were conducted for this memo; the scores are a
design judgment, not a usability study.

## 1. The audit

| Current instrument | What it really is | Research invariant it encodes |
| --- | --- | --- |
| Scientific Number | Measurement primitive | Notation, significant figures, full precision |
| Quantity Input | Measurement primitive | Unit, conversion, precision, validation |
| Uncertainty Input | Measurement primitive | Value ± error, asymmetric errors |
| Stat + Stat Grid | Generic metric display | None beyond a label and unit |
| Sparkline | Generic micro-chart | None |
| Status Badge + Dot | Generic status | None |
| Log Viewer | Generic log surface | None |
| Timeline | Generic event list | None |
| Metadata Editor | Generic key/value editor | Schema suggestions only |
| File Dropzone + Queue | Generic upload | Checksum only |
| Data Table | Generic table | None |
| Protocol Steps | Workflow checklist | Ordering, timing, notes |
| Sequence Viewer | Domain view | Sequence, features, translation |
| Growth Curve | Domain view | Replicates, log phase, doubling time |
| Dose–Response Curve | Domain view | 4PL fit, confidence band, IC50 |
| Spectrum Plot | Domain view | Peaks, FWHM, reference lines |
| Periodic Table | Domain view | Elements, blocks, trends |
| Constants Reference | Domain view | Value, unit, uncertainty, exactness |

The count is not the problem; the **semantic density** is. A competent team with
a generic component library can build eight of these in a sprint. A research
team cannot build the missing layer without domain knowledge, standards, and
edge cases — which is exactly what a registry should package.

## 2. What the evidence says

### 2.1 The spreadsheet is still the lab database

A mixed-method study of 286 biomedical researchers found that **84% had
experienced data-handling problems**, 41% said those problems caused a backlog,
and more than half spent over five person-hours per week on data handling. Only
14% had a LIMS. The researchers described spreadsheets as "our main workhorse,
unfortunately" and admitted their data were often unorganized, unsearchable, or
stored in incompatible files. The study's recommendations included better
provenance tooling and standards, not more charts.

Spreadsheets also corrupt identifiers. A scan of 35,175 supplementary Excel
files found gene-name conversion errors in **19.6% of papers with Excel gene
lists** — 704 papers, 987 files, 23,861 converted names. A 2021 PMC-wide
follow-up found the rate had risen to **30.9%** — 3,436 papers across 5,086
spreadsheets — six years after the problem was publicized. The failure is not
user carelessness; it is a generic table accepting a typed value without
knowing that `SEPT2` is an identifier, not a date.

### 2.2 Metadata is lost at acquisition

A 2021 *Nature Methods* focus issue on microscopy metadata reported that even
basic acquisition details are routinely missing from papers, and that the tools
for capturing them are fragmented across formats and vendors. A 2023 study of
omics metadata found the barriers were perceptual and technical: no uniform
standards, privacy and legal concerns, limited incentives, inadequate
infrastructure, and too few trained people. A free-text "notes" field is not
metadata capture.

### 2.3 Computational provenance is not captured

A large-scale study of Jupyter notebooks found that only **24.11% executed
without errors**, and only **4.03% produced the same results**. Hidden state,
out-of-order cells, missing dependencies, hard-coded paths, and non-executed
cells were common. A "Run" button is not reproducibility; a notebook is not a
manifest.

### 2.4 Uncertainty is displayed, not communicated

A review of *Nature Methods* articles found that **49% of error bars conveyed
standard error, 42% standard deviation, 5% were unspecified, and only one
occurrence conveyed a 95% confidence interval**. Readers routinely infer
significance from non-overlapping intervals, which is not what non-overlap
means. The problem is not the absence of error bars; it is the absence of a
result contract that states what the interval is, what n is, and what test
produced it.

### 2.5 Reporting compliance is reconstructed at submission

ARRIVE 2.0 notes that randomization is reported in only **30–40%** of animal
studies, blinding in about **20%**, and sample-size justification in **under
10%**. PRISMA, CONSORT, STROBE, and MIQE are applied at the end of a project,
usually by re-reading methods and guessing. A PDF checklist is not a workflow;
the decisions were made months earlier and never recorded.

### 2.6 Identity and randomization fail silently

One biobank reported four misidentifications in 284 sample isolations — a 1.4%
rate — even with SOPs in place; the failure was usually a label, an aliquot, or
a handoff. Randomization and allocation-concealment errors are a recurring
source of retractions and corrections. These are not statistical problems; they are record-keeping
problems with statistical consequences.

### 2.7 Figures are a manual, publisher-specific craft

Journals specify column widths, physical dimensions, font families, minimum
point sizes, DPI (often 300 for halftones and 600–1200 for line art), color
mode, and file format. Researchers rebuild the same figure for each submission,
usually by exporting from a plotting library and fixing it in Illustrator. The
wasted time is real, but the deeper problem is that the figure loses its link
to the data and the analysis that produced it.

## 3. The missing layer: six kinds of state

| State | The question it answers | Generic UI | Compound instrument |
| --- | --- | --- | --- |
| **Identity** | What is this, exactly? | ID field, title | Dataset Card, Sample Lineage, Run Card |
| **Provenance** | Where did it come from, and what happened to it? | Activity log | Import Mapper, Exclusion Ledger, Provenance Graph, Manifest |
| **Uncertainty** | How sure are we, and what is missing? | Error bar | Measurement Table, Missingness Map, Statistical Result Block, Uncertainty Budget |
| **Disposition** | What did we decide to do with it? | Checkbox | Exclusion Ledger, Calibration & QC, Review Queue, Reporting Checklist |
| **Comparability** | Can these be compared? | Side-by-side table | Measurement Table, Run Comparison, Plate Layout, Ontology Picker |
| **Compliance** | Does it meet the standard? | Checklist | Reporting Checklist, Preregistration Diff, Screening Flow, Figure Spec |

This taxonomy is the real product architecture. Domain packs are a second axis:
the same six states recur in life sciences, physical sciences, social sciences,
and computational research.

## 4. The bar

### 4.1 Research Semantics Test

A candidate is an instrument only if it scores well on all six:

1. **Object or act.** It represents a research object (sample, dataset, run,
   figure) or a research act (exclude, calibrate, compare, approve, publish).
2. **Prevents a known error.** It blocks a documented failure mode — unit
   mismatch, silent exclusion, identifier corruption, uncorrected p-values,
   lost metadata.
3. **Cross-domain.** It is useful in at least three disciplines, or two domain
   packs plus a computational workflow.
4. **Not generic.** A competent team cannot build it correctly from a generic
   UI kit without domain rules or standards.
5. **Copy-paste sized.** One compound component or a small family, no backend
   required for the demo.
6. **Produces an artifact.** CSV, JSON, manifest, audit trail, figure, or
   submission-ready text — not just a view.

Score each 0–2. Shortlist at 9/12. Build at 10/12 with a clear owner.

### 4.2 The compound instrument rule

An instrument must compose at least three atoms and enforce at least one
research invariant. If it can be assembled from elements in an afternoon
without domain knowledge, it is an element, not an instrument.

This is the correction to the catalog's flat list of ~200 atoms. Atoms are
useful, but they invite building the easiest ones. The unit of value is the
compound instrument that carries a research act end-to-end.

## 5. The list

Scores are out of 12. Effort is S (days), M (1–2 weeks), L (3–4 weeks) for a
complete instrument with docs, tests, and a demo.

### 5.1 Identity

#### 1. Dataset Card

**Job.** One dataset's identity: title, description, owner, contributors,
version, format, size, checksum, license, DOI, methods, related files, and
access conditions.

**Prevents.** `final_v3_REAL.xlsx` with no owner, no method, no license, no
hash, and no way to tell which version produced a figure.

**Why a generic card fails.** A card displays fields. This validates
completeness, links to the provenance chain, shows the version, and generates
citation and repository metadata. It knows the difference between a raw,
derived, and published dataset.

**Contract.** `id, title, description, version, createdAt, updatedAt, owner,
contributors, license, doi, format, size, checksum, method, related[{id, relation}],
access`.

**Anchor → generalizes.** Any dataset → any research object. The same card
works for a sample collection, a model, or a figure with a different schema.

**Atoms.** Dataset Card · Dataset Header · Checksum Badge · Version Switcher ·
License Picker · Citation Block.

**Effort.** S · **Score.** 11/12

#### 2. Sample Lineage

**Job.** A parent/child material tree: aliquots, pools, splits, derivatives,
storage locations, volumes, concentrations, freeze–thaw counts, and links to
assays and datasets.

**Prevents.** Sample misidentification, lost aliquots, unlinked derivatives,
and the "which tube is this?" conversation.

**Why a generic tree fails.** It does not know aliquot semantics, volume
arithmetic, concentration units, chain of custody, or the difference between a
split and a pool.

**Contract.** `samples[{id, type, parentId, children, volume, volumeUnit,
concentration, concentrationUnit, location, collectedAt, processedAt,
freezeThawCount, status, labels}]`.

**Anchor → generalizes.** Biobank → chemistry, environmental cores, cell
culture, archaeology, and any material that is divided, pooled, or stored.

**Atoms.** Sample Card · Specimen Chain · Sample Map · Label Print Sheet ·
Audit Log.

**Effort.** M · **Score.** 10/12

#### 3. Run Card

**Job.** A reusable record of an instrument run: instrument, method, operator,
start/end, conditions, calibration, raw files, checksums, status, and notes.

**Prevents.** Results without acquisition context; two runs that look
comparable but used different settings.

**Why a generic metadata list fails.** It does not know which fields are
required for a method, how calibration links to results, or how to compare
conditions across runs.

**Contract.** `runId, instrument, method, operator, startedAt, endedAt,
conditions, calibrationId, rawFiles[{path, hash}], status, notes`.

**Anchor → generalizes.** Any instrument → any computational run.

**Atoms.** Instrument Card · Run Summary · Metadata Editor · Checksum Badge ·
Status Badge.

**Effort.** S · **Score.** 10/12

### 5.2 Provenance

#### 4. Import Mapper

**Job.** Ingest an instrument or vendor export through detect → map → validate
→ preview → commit, retaining the original file and its checksum.

**Prevents.** Copy-paste into Excel; lost columns, units, and metadata;
identifier corruption; silent type coercion.

**Why a file upload and table preview fail.** They do not know instrument
formats, unit inference, missing-code conventions, or validation rules. They
cannot tell you that a column is a gene identifier, not a date.

**Contract.** `file, detectedFormat, sourceMetadata, columns[{source, target,
type, unit, missingCodes, identifier}], rowCount, issues[], checksum,
importedAt`.

**Anchor → generalizes.** Lab instrument → any tabular import, including
surveys, clinical extracts, and logs.

**Atoms.** File Dropzone · Schema Preview · Import Wizard · Data Dictionary ·
Checksum Badge · Validation Summary.

**Effort.** L · **Score.** 11/12

#### 5. Exclusion & Transformation Ledger

**Job.** An append-only record of every filter, exclusion, imputation, unit
conversion, and derivation, with reason, actor, time, counts before and after,
and a reversibility flag.

**Prevents.** Silent data cleaning. "n = 48" with no record of the six dropped
rows, the two outliers, or the imputed value.

**Why an activity log fails.** It does not reconcile counts, distinguish
exclusion from transformation, or connect a decision to the analysis that
depended on it.

**Contract.** `entries[{id, action, target, reason, reasonCode, actor, at,
before, after, rows, reversible, linkedRun}], summary{raw, included, excluded,
imputed}, export`.

**Anchor → generalizes.** Any data cleaning → any analysis, in any discipline.

**Atoms.** Provenance Trail · Audit Log · Diff Viewer · Review Checklist ·
Export Menu.

**Effort.** S · **Score.** 12/12

#### 6. Provenance Graph

**Job.** An interactive DAG of datasets, runs, transformations, and artifacts,
with versions, hashes, actors, and timestamps.

**Prevents.** "Where did this figure come from?" and "which dataset produced
this table?"

**Why a flow chart fails.** It does not know PROV semantics, entity/activity/
agent relationships, version edges, or hash verification.

**Contract.** `nodes[{id, type, label, version, hash, createdAt}],
edges[{from, to, activity, at}], selection`.

**Anchor → generalizes.** Computational science → any pipeline, including
wet-lab workflows.

**Atoms.** Lineage Graph · Pipeline DAG · Provenance Trail · JSON Viewer.

**Effort.** L · **Score.** 11/12

#### 7. Reproducibility Manifest

**Job.** A portable record of code version, environment, dependencies,
parameters, seeds, input hashes, commands, and outputs; export as JSON/YAML and
copy as a recipe.

**Prevents.** "It worked on my machine"; missing seeds, packages, or input
versions.

**Why an environment card fails.** It does not capture the command, the dirty
state, the input hashes, or the difference between the environment that ran and
the environment that is documented.

**Contract.** `project, commit, dirty, environment{language, version,
packages[]}, command, params, seeds, inputs[{path, hash}], outputs[], createdAt`.

**Anchor → generalizes.** Computational science → any analysis that must be
re-run.

**Atoms.** Environment Picker · Code Block · Checksum Badge · JSON Viewer ·
Copy As Menu.

**Effort.** M · **Score.** 11/12

### 5.3 Uncertainty

#### 8. Measurement Table

**Job.** A data table whose columns carry type, unit, precision, missing codes,
detection limits, and uncertainty; cells render values with units and flags;
export preserves the semantics.

**Prevents.** Units buried in headers, `ND`/`-999`/blank confusion, false
precision, and censored values treated as zero.

**Why a generic data table fails.** It is type-agnostic. It does not know that
a column is a quantity with a unit, that a value is below a detection limit, or
that a missing value has a reason.

**Contract.** `columns[{id, label, type: number|quantity|category|datetime,
unit, precision, missingCodes, detectionLimit, uncertainty}], rows, flags`.

**Anchor → generalizes.** Any quantitative table → any discipline. This is the
single highest-leverage upgrade to the existing Data Table.

**Atoms.** Data Table · Quantity Input · Value With Error · Detection Limit ·
Data Dictionary · Export Menu.

**Effort.** M · **Score.** 12/12

#### 9. Missingness & Censoring Map

**Job.** Show missingness patterns by column and row, distinguish missing vs.
below-LOD vs. not-applicable vs. not-collected, and export a coded matrix.

**Prevents.** Missing data silently dropped, imputed as zero, or confused with
a real measurement.

**Why a heatmap fails.** It does not know missing-code semantics or the
difference between a structural gap and a failed assay.

**Contract.** `matrix, codes[{value, label, kind: missing|censored|
notApplicable|notCollected}], summary, coMissingness`.

**Anchor → generalizes.** Clinical and environmental data → any dataset with
structured missingness.

**Atoms.** Data Table · Calendar Heatmap · Color Scale Legend · Data Dictionary.

**Effort.** S/M · **Score.** 11/12

#### 10. Statistical Result Block

**Job.** Report an estimate with CI, n, test, df, effect size, exact p,
correction, assumptions, and a plain-language sentence; export as text/JSON.

**Prevents.** "p < 0.05" with no effect size, n, or assumptions; overclaiming
from non-overlapping error bars.

**Why a stat card fails.** It does not know test semantics, reporting
standards, or the difference between a confidence interval and a prediction
interval.

**Contract.** `estimate, unit, ci, n, test, statistic, df, p, effectSize,
correction, assumptions[{name, status, detail}], method, warning`.

**Anchor → generalizes.** Any quantitative study → any discipline.

**Atoms.** Stat · Value With Error · Descriptive Stats Table · Math · Code Block.

**Effort.** M · **Score.** 11/12

#### 11. Calibration & QC Panel

**Job.** Standards and blanks, calibration fit with residuals, LOD/LOQ,
back-calculated concentrations, a Levey–Jennings control chart, Westgard rules,
acceptance criteria, pass/fail, and a certificate.

**Prevents.** Uncalibrated instruments, drifting QC, LOD treated as zero, and
failed runs released as data.

**Why a line chart fails.** It does not know calibration models, weighting,
LOD/LOQ, control rules, or acceptance criteria.

**Contract.** `standards[{x, y, uncertainty}], model{type, weighting}, blanks,
controls[{at, value, mean, sd}], rules, acceptance, result`.

**Anchor → generalizes.** Analytical chemistry → any instrument or sensor with
standards and controls.

**Atoms.** Calibration Wizard · Calibration Log · Signal Quality · Detection
Limit · Measurement Table · Control Chart.

**Effort.** L · **Score.** 11/12

### 5.4 Disposition

#### 12. Review & Curation Queue

**Job.** A queue of records needing a decision, with assignee, status, reason
codes, comments, bulk actions, and an audit trail.

**Prevents.** Decisions buried in email or chat; no record of who approved
what, when, and why.

**Why a kanban board fails.** It does not know research review states, reason
codes, evidence requirements, or the difference between a technical check and a
scientific judgment.

**Contract.** `items[{id, type, title, assignee, status, priority, reason,
comments, dueAt}], filters, bulkActions`.

**Anchor → generalizes.** Data curation → any review workflow, including
manuscript review and label QA.

**Atoms.** Job Queue · Review Checklist · Comment Thread · Approval Bar · Audit
Log.

**Effort.** M · **Score.** 10/12

#### 13. Inter-rater Agreement Panel

**Job.** Compare two or more coders or annotators, show agreement (Cohen's or
Fleiss' kappa, Krippendorff's alpha), a confusion matrix, and a disagreement
browser with excerpts.

**Prevents.** "We coded independently" with no reliability check; agreement
computed on mismatched spans; a single number hiding systematic disagreement.

**Why a table fails.** It does not know chance-corrected agreement, span
alignment, or the difference between reliability and accuracy.

**Contract.** `units[{id, text, labelsByCoder}], coders, metric, value, ci,
confusion, disagreements`.

**Anchor → generalizes.** Qualitative research → ML labeling, systematic
reviews, radiology, and any multi-rater annotation.

**Atoms.** Data Table · Confusion Matrix · Text Annotation · Stat.

**Effort.** M · **Score.** 10/12

#### 14. Reporting Checklist

**Job.** A guideline pack (ARRIVE, CONSORT, PRISMA, STROBE, MIQE) with items,
status, evidence links, owner, and completeness; export a submission-ready
checklist.

**Prevents.** Compliance reconstructed at submission; missing randomization,
blinding, sample size, or exclusion details.

**Why a generic checklist fails.** It does not know the guideline's items,
dependencies, evidence requirements, or the difference between "not applicable"
and "not reported".

**Contract.** `guideline, version, items[{id, section, text, status, evidence,
owner, note}], completeness`.

**Anchor → generalizes.** Clinical and animal research → any reporting standard,
including institutional and funder checklists.

**Atoms.** Review Checklist · Markdown Editor · Citation · Export Menu.

**Effort.** S/M · **Score.** 11/12

#### 15. Preregistration Plan vs Actual

**Job.** Compare a registered plan (hypotheses, primary outcomes, sample size,
analysis) with the actual study, flag deviations, and generate a disclosure
table.

**Prevents.** HARKing, p-hacking, and silent deviations from the registered
analysis.

**Why a diff viewer fails.** It does not know registered-report semantics or
the difference between a planned exploratory analysis and an unregistered
confirmatory one.

**Contract.** `plan, actual, items[{id, planned, actual, status: match|
deviation|unreported, reason}], summary`.

**Anchor → generalizes.** Psychology and social science → clinical trials and
any registered protocol.

**Atoms.** Diff Viewer · Review Checklist · Metadata Editor · Export Menu.

**Effort.** M · **Score.** 10/12

#### 16. Screening Flow (PRISMA)

**Job.** Counts at each stage (identified, deduplicated, screened, excluded with
reasons, included), arithmetic validation, a flow diagram, and an export.

**Prevents.** PRISMA counts that do not add up; exclusion reasons lost; a
diagram that cannot be reproduced from the data.

**Why a flow chart fails.** It does not know the PRISMA stages, the arithmetic
checks, or the reason taxonomy.

**Contract.** `stages[{id, label, count, reasons[]}], links, totals, checks`.

**Anchor → generalizes.** Systematic reviews → any triage or screening pipeline,
including grant and security review.

**Atoms.** Pipeline DAG · Stat · Review Checklist · Export Menu.

**Effort.** M · **Score.** 10/12

### 5.5 Comparability

#### 17. Run Comparison

**Job.** Compare two or more runs or versions side by side: parameters,
metrics, outputs, units, tolerances, missing values, and deltas; overlay plots;
export a diff.

**Prevents.** "Which run was better?" answered from memory; incompatible units
compared; a regression hidden by a summary metric.

**Why a text diff fails.** It does not know units, tolerances, missing-value
policy, or which differences are scientifically meaningful.

**Contract.** `runs[{id, params, metrics, artifacts}], compareKeys, tolerance,
unitNormalization, missingPolicy`.

**Anchor → generalizes.** Computational science → any experiment or model run.

**Atoms.** Run Summary · Diff Viewer · Data Table · Chart Frame · Export Menu.

**Effort.** M · **Score.** 11/12

#### 18. Plate Layout & Randomization

**Job.** Design a plate or block layout with roles (sample, control, standard,
blank), replicates, randomization with a seed, blocking, stratification, and
instrument-ready export.

**Prevents.** Convenience layouts that confound batch and position; randomization
that cannot be reproduced; missing controls.

**Why a grid fails.** It does not know plate semantics, role constraints,
randomization, blocking, or the difference between a sample and a control.

**Contract.** `format (6/24/96/384), wells[{position, role, sampleId, replicate,
group}], seed, constraints[], export`.

**Anchor → generalizes.** Microplates → greenhouses, animal cages, instrument
slots, and any randomized layout with roles.

**Atoms.** Well Plate · Sample Table · Randomization · Export Menu.

**Effort.** M · **Score.** 10/12

#### 19. Ontology & Vocabulary Picker

**Job.** Search a controlled vocabulary, show definition, synonyms, hierarchy,
obsolete terms, and mapping confidence; store the term ID, not the label.

**Prevents.** Free-text labels diverging across files; obsolete terms; joins
that fail because "grey" and "gray" are different strings.

**Why a combobox fails.** It does not know ontology IDs, synonyms, definitions,
deprecation, or hierarchy.

**Contract.** `vocab, query, results[{id, label, definition, synonyms, obsolete,
parents}], mapping{source, target, confidence}`.

**Anchor → generalizes.** Life sciences → geosciences, social science, and
libraries.

**Atoms.** Combobox · Command Palette · Metadata Badge · Glossary Term.

**Effort.** M · **Score.** 10/12

### 5.6 Output

#### 20. Figure Spec & Panel Export

**Job.** Set physical dimensions, fonts, DPI, color mode, panel labels, and
target journal; preview at print size; check color-vision and grayscale;
export vector or raster with metadata.

**Prevents.** Figures rejected for wrong dimensions, fonts, or DPI; color-only
encoding; inconsistent panels across a paper.

**Why an export dialog fails.** It does not know journal specifications,
physical units, print-size typography, or accessibility checks.

**Contract.** `journalPreset, widthMm, heightMm, font, sizes, dpi, format,
colorMode, panels, checks`.

**Anchor → generalizes.** Any publication → any discipline.

**Atoms.** Figure Export Panel · Chart Frame · Color Scale Legend · Axis
Control · Export Menu.

**Effort.** M · **Score.** 10/12

## 6. The rest of the field

### 6.1 Also strong, not in the first 20

| Instrument | Job | Score | Effort |
| --- | --- | --- | --- |
| Uncertainty Budget | GUM-style source table, combined and expanded uncertainty | 9 | M |
| Data Availability Editor | Repository, accession, license, embargo, conditions | 10 | S |
| Authorship & CRediT | Ordered authors, affiliations, roles, corresponding | 9 | S |
| Method & Instrument Card | Reusable method with settings, calibration, limits, citations | 9 | S |
| Model Fit Report | Parameters, SE/CI, diagnostics, convergence warnings | 10 | M |
| Effect Size & Forest Plot | Estimate, CI, weight, heterogeneity, summary diamond | 10 | M |
| Sensitivity Analysis | One-at-a-time tornado, scenarios, output variance | 9 | M |
| Bland–Altman Agreement | Bias, limits of agreement, proportional bias | 10 | S |
| Image Provenance | Original vs. adjusted, crop, gamma, duplication check | 10 | M |
| Scale Bar & ROI | Pixel-size calibration, regions, measurements, export | 9 | S |
| Storage Map | Freezer/rack/box occupancy, search, capacity | 8 | S |
| Dataset Version Diff | Schema and row changes between versions | 10 | M |
| Chromatogram | Retention time, integration, resolution, tailing | 9 | M |
| Power & Sample Size | Effect size, alpha, power, curve, assumptions | 9 | S |
| Model Card & Slice Table | Intended use, metrics by slice, limitations, n | 9 | M |
| Screening Risk of Bias | Domain judgments, support for judgment, summary plot | 9 | M |

### 6.2 Considered and rejected

These scored below the bar, or failed the copy-paste test. Recording them matters
as much as recording the shortlist: they are the requests Aperture will get, and
the reasons below are the answer.

| Candidate | Why not | What to do instead |
| --- | --- | --- |
| Generic chart pack (bar, line, scatter, box, heatmap) | Commodity. Mature libraries do it well, and a chart carries no research invariant on its own. | Ship `ChartFrame`, axis and legend atoms; spend the effort on what the chart cannot say — intervals, n, censoring. |
| Dashboard / widget grid builder | Generic layout. Every kit has one; it encodes no research act. | Workbench recipes compose real instruments into a review or run page. |
| Kanban board | Generic. The research-specific part is the decision, its reason code, and its evidence — not the column. | Review & Curation Queue. |
| Rich-text or manuscript editor | Scope is a word processor. Competing with Word, LaTeX, and Overleaf is not the opening. | Citation, Math, and Figure Spec atoms that paste into an existing editor. |
| File browser / tree | The OS and every cloud provider already solve it. | Row Detail and Dataset Card link to files; do not rebuild storage. |
| Chat, comments, notifications | Generic collaboration. Also implies a backend and identity. | Comment Thread as an atom inside review instruments; no standalone chat. |
| Notebook cell / code runner | Requires execution, sandboxing, and kernel lifecycle — a platform, not a component. | Run Card and Reproducibility Manifest record what a runner did. |
| Molecule viewer, genome browser, DICOM viewer | Deep domain viewers with mature incumbents and heavy dependencies. Rebuilding them is a different product. | Provide the surrounding record (Sample Lineage, Run Card) and leave a documented slot for the specialist viewer. |
| LIMS inventory, freezer map, storage management | Needs a database, multi-user auth, barcode hardware, and audit guarantees. | Storage Map as a read-only atom inside Sample Lineage; point to LIMS for the system of record. |
| Electronic signatures, 21 CFR Part 11 | Legal and validation scope no component library can honestly claim. | Audit-trail and approval atoms; the regulated system owns the signature. |
| "AI assistant for your data" chat | Not a research invariant. The trust problem is provenance and review, and a chat bubble hides both. | Manifest, Exclusion Ledger, and Statistical Result Block make the claim inspectable; a chat can sit on top. |
| Generic statistics calculator | The arithmetic is a library call; the hard part is the reporting contract. | Statistical Result Block, which forces n, test, interval, and assumptions into the output. |
| PDF annotation / reference manager | Mature ecosystems (Zotero, Hypothes.is) with their own storage and sync. | Citation and Glossary Term atoms. |
| Generic form builder | Generic, and it duplicates the element layer. | Field, Fieldset, and Metadata Editor already compose forms. |

## 7. Build next

The first pack should tell one story: **from instrument file to a comparable,
documented dataset, without losing the evidence.** The order below is by
leverage, not by pipeline order; the workbench recipes show the pipeline.

1. **Measurement Table.** The foundational upgrade. It turns the most-used
   element into a research instrument and makes every later component simpler.
2. **Exclusion & Transformation Ledger.** The smallest, sharpest proof of the
   thesis. It can ship in days and immediately changes how a team talks about
   `n`.
3. **Calibration & QC Panel.** The flagship lab instrument. It is specific
   enough to be credible and general enough to cover every instrument with
   standards and controls.
4. **Run Comparison.** The computational counterpart. It makes reproducibility
   visible instead of rhetorical.
5. **Import Mapper.** The front door. It prevents the spreadsheet corruption
   that the rest of the system exists to catch.
6. **Dataset Card.** The identity layer that ties the other five together and
   generates the citation and repository metadata.

A second pack can then cover **lab operations** (Sample Lineage, Plate Layout,
Run Card, Storage Map, Review Queue) and a third **analysis and reporting**
(Statistical Result Block, Model Fit Report, Figure Spec, Manifest, Reporting
Checklist). The order is deliberate: data integrity first, operations second,
publication third.

## 8. Workbench recipes

These are the compositions that make the instruments feel like a system:

- **Study intake:** Import Mapper → Dataset Card → Measurement Table → Data
  Dictionary.
- **Assay run:** Run Card → Plate Layout → Calibration & QC → Sample Lineage.
- **Analysis review:** Exclusion Ledger → Run Comparison → Statistical Result
  Block → Manifest.
- **Submission:** Figure Spec → Reporting Checklist → Data Availability →
  Authorship.
- **Curation:** Review Queue → Ontology Picker → Inter-rater Agreement.
- **Evidence synthesis:** Screening Flow → Risk of Bias → Forest Plot.

Each recipe is a workbench, not a new component. The workbench composes
registry items and supplies a mock adapter with realistic data.

## 9. What this means for the catalog

1. **Reclassify the eight generic patterns.** Stat, Sparkline, Timeline, Status
   Badge, Log Viewer, Metadata Editor, File Dropzone, and Data Table are
   elements or patterns. Keep them, but stop counting them as research
   instruments.
2. **Promote atoms into compound instruments.** The catalog already contains
   most of the atoms: Dataset Card, Data Dictionary, Provenance Trail,
   Calibration Log, Review Checklist, Figure Export Panel, Detection Limit,
   Well Plate, Codebook. The missing unit is the compound instrument that
   combines them around one research act.
3. **Merge duplicates.** Dataset Card + Dataset Header + Version Switcher +
   Checksum Badge is one instrument. Calibration Log + Calibration Wizard +
   Signal Quality + Detection Limit is one instrument. Run Summary + Experiment
   Tracker + Diff Viewer is one instrument.
4. **Add a semantics badge to docs.** "Generic pattern" vs. "Measurement
   primitive" vs. "Research instrument" vs. "Domain view". This makes the value
   proposition legible and prevents the count from inflating.
5. **Change the headline count.** "18 instruments" is technically true and
   strategically weak. A better line: "56 elements · 3 measurement primitives ·
   7 domain views · 5 workbenches, with the research-act layer next" — or simply
   stop using a single count until the semantic layer is real.

## 10. Where the ecosystem stops

| Layer | What exists | What it does not provide |
| --- | --- | --- |
| Generic UI kits | Buttons, tables, forms, dialogs | Research state |
| Scientific app frameworks | Widgets, charts, layout | Calibration, provenance, review |
| Domain viewers | Genome browsers, molecule viewers, DICOM | Copy-paste components, cross-domain contracts |
| Workflow platforms | Execution, scheduling, history | Epistemic records, reporting |
| Standards bodies | PROV, FAIR, PRISMA, ARRIVE, MIQE, GUM | UI contracts and implementations |
| **Aperture's opening** | **Compound instruments for research acts** | — |

Adjacent scientific design systems, such as Vlak's science collection, already
cover measurement values, quantity fields, experiment runs, spectra, and
sequence alignment. That validates the demand but also marks the boundary: they
stop at display and input. The layer above — exclusion, calibration, lineage,
comparison, review, compliance — is still open.

## 11. Sources

- Anderson NR, Lee ES, Brockenbrough JS, et al. "Issues in Biomedical Research
  Data Management and Analysis: Needs and Barriers." *JAMIA* 2007.
  https://pmc.ncbi.nlm.nih.gov/articles/PMC2244904/
- Ziemann M, Eren Y, El-Osta A. "Gene name errors are widespread in the
  scientific literature." *Genome Biology* 2016.
  https://pmc.ncbi.nlm.nih.gov/articles/PMC4994289/
- Abeysooriya M, et al. "Gene name errors: Lessons not learned." *PLOS
  Computational Biology* 2021.
  https://journals.plos.org/ploscompbiol/article?id=10.1371/journal.pcbi.1008984
- Pimentel JF, Murta L, Braganholo V, Freire J. "A Large-scale Study about
  Quality and Reproducibility of Jupyter Notebooks." *MSR* 2019.
  https://leomurta.github.io/papers/pimentel2019a.pdf
- "Minding microscopy metadata." *Nature Methods* 2021.
  https://www.nature.com/articles/s41592-021-01347-5
- Huang YN, et al. "Perceptual and technical barriers in sharing and formatting
  metadata accompanying omics studies." arXiv 2023.
  https://arxiv.org/abs/2401.02965
- Hullman J, Resnick P, Adar E. "How Visualizing Inferential Uncertainty Can
  Mislead Readers About Treatment Effects in Scientific Results." *CHI* 2020.
  https://dl.acm.org/doi/fullHtml/10.1145/3313831.3376454
- Percie du Sert N, et al. "The ARRIVE guidelines 2.0." *PLOS Biology* 2020.
  https://pmc.ncbi.nlm.nih.gov/articles/PMC7430098/
- Page MJ, et al. "PRISMA 2020 explanation and elaboration." *BMJ* 2021.
  https://pmc.ncbi.nlm.nih.gov/articles/PMC8005925/
- Bustin SA, et al. "The MIQE Guidelines." *Clinical Chemistry* 2009; MIQE 2.0,
  2025. https://pubmed.ncbi.nlm.nih.gov/19246619/
- Wilkinson MD, et al. "The FAIR Guiding Principles for scientific data
  management and stewardship." *Scientific Data* 2016.
  https://pmc.ncbi.nlm.nih.gov/articles/PMC4792175/
- W3C. "PROV-DM: The PROV Data Model." https://www.w3.org/TR/prov-dm/
- JCGM. "Evaluation of measurement data — Guide to the expression of
  uncertainty in measurement" (GUM), 2008.
- Westgard JO. "Westgard Rules and Multirules." https://www.westgard.com/westgard-rules.html
- Nature Portfolio. "Image integrity and standards."
  https://www.nature.com/nature-portfolio/editorial-policies/image-integrity
- Yelland LN, et al. "When randomisation goes horribly wrong: examples of major
  failures." 2025. https://pmc.ncbi.nlm.nih.gov/articles/PMC12837040/
