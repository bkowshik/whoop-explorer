# Implementation Audit Checklist: Table Readability Improvements

**Purpose**: Thorough cross-check of spec requirements against actual implementation — focused on sticky headers and all other FR/SC items
**Created**: 2026-03-10
**Feature**: [spec.md](../spec.md)

## Requirement Completeness — Sticky Headers (FR-014)

- [ ] CHK001 - Is the sticky header implementation compatible with the nested overflow containers? The `ui/table.tsx` wraps `<table>` in a `div` with `overflow-x-auto`, while `data-table.tsx` adds `max-h-[70vh] overflow-auto` on an outer div — `sticky` only works relative to the nearest scrolling ancestor. [Consistency, Spec §FR-014, Plan §T030]
- [ ] CHK002 - Are sticky header `z-index` and `bg-background` sufficient to prevent content bleeding through the header when scrolling? [Completeness, Spec §FR-014]
- [ ] CHK003 - Does the spec define sticky header behavior when the table has horizontal overflow (wide tables with many columns)? Headers should remain sticky vertically while scrolling horizontally. [Coverage, Spec §FR-014, Gap]
- [ ] CHK004 - Are sticky header requirements defined for all four tables (sleep, cycles, recovery, workouts), or only implicitly via the shared DataTable component? [Clarity, Spec §FR-014]

## Requirement Completeness — Units in Headers (FR-001, FR-010)

- [ ] CHK005 - Are all unit-bearing columns across all four table definitions explicitly enumerated in the spec, or is the requirement stated generically? [Completeness, Spec §FR-001]
- [ ] CHK006 - Is the parenthetical format "Column Name (unit)" consistently specified for all column types, including body measurement card labels? [Consistency, Spec §FR-001, §FR-010]
- [ ] CHK007 - Does the spec define what happens when a column has no unit (e.g., date, boolean columns)? Is the absence of a unit parenthetical the expected behavior? [Edge Case, Spec §FR-001, Gap]

## Requirement Completeness — Duration Formatting (FR-002, FR-003)

- [ ] CHK008 - Is "two decimal places" for decimal hours specified as a hard requirement or a guideline? Are there cases where different precision might be needed? [Clarity, Spec §FR-002]
- [ ] CHK009 - Are all duration columns across all four tables explicitly identified in the spec? [Completeness, Spec §FR-002, Gap]
- [ ] CHK010 - Is the cycles Duration column computation (end - start) defined with timezone handling requirements? [Clarity, Spec §FR-003, Gap]
- [ ] CHK011 - Does the spec define the display for a duration of exactly 0 milliseconds? The edge cases section says "0.00" — is this consistent with the em dash rule for null values? [Consistency, Spec §FR-002, §FR-008]

## Requirement Completeness — Typography & Alignment (FR-005, FR-006, FR-007)

- [ ] CHK012 - Is the Geist Mono font specified as the primary monospace font with explicit fallback chain? [Completeness, Spec §FR-005]
- [ ] CHK013 - Are comma separator requirements defined for all numeric columns, or only those ≥1,000? Does this apply to decimal values (e.g., "1,234.50") or only integers? [Clarity, Spec §FR-006]
- [ ] CHK014 - Is "consistent decimal places within each column" defined per-column, or is a global rule specified? Different columns may need different precision. [Clarity, Spec §FR-007]
- [ ] CHK015 - Does the spec define whether header cells for numeric columns should also be right-aligned to match the data cells? [Gap, Spec §FR-007]

## Requirement Completeness — Visual Row Differentiation (FR-011, FR-012, FR-013)

- [ ] CHK016 - Is "subtle alternating background tint" quantified with specific contrast ratios or opacity values, or left to implementation judgment? [Measurability, Spec §FR-011]
- [ ] CHK017 - Does the spec define the interaction between hover highlight and the alternating row tint? Should hover override or layer on top? [Clarity, Spec §FR-012, Gap]
- [ ] CHK018 - Is "moderate row density" defined with specific padding values or a reference density scale? [Measurability, Spec §FR-013]
- [ ] CHK019 - Are row differentiation requirements consistent with dark mode? The tint and hover values may need different treatment in dark theme. [Coverage, Spec §FR-011, §FR-012, Gap]

## Requirement Completeness — Body Measurement API (FR-009)

- [ ] CHK020 - Does the spec define the expected API response schema for body measurements? [Completeness, Spec §FR-009, Gap]
- [ ] CHK021 - Are error handling requirements for the body measurement API defined beyond "clear error message"? What constitutes a clear error message? [Clarity, Spec §US4-AS2]
- [ ] CHK022 - Is the root cause of the 502 error documented in the spec or only in the assumptions? [Traceability, Spec §FR-009, Assumption]

## Requirement Consistency

- [ ] CHK023 - Do the percentage column exception requirements (FR-004: "%" stays inline) conflict with the general unit-in-header rule (FR-001)? Is the exception clearly scoped? [Consistency, Spec §FR-001, §FR-004]
- [ ] CHK024 - Are the `TableRow` hover classes in `ui/table.tsx` (`hover:bg-muted/50`) consistent with the `data-table.tsx` hover class (`hover:bg-muted/60`)? The base UI component and the feature component may conflict. [Consistency, Spec §FR-012]
- [ ] CHK025 - Does the existing `requirements.md` checklist align with the current spec state, or is it stale from an earlier draft? [Traceability]

## Acceptance Criteria Quality

- [ ] CHK026 - Are all seven success criteria (SC-001 through SC-007) objectively measurable without subjective interpretation? [Measurability, Spec §SC]
- [ ] CHK027 - Does SC-006 ("vertical scanning is improved") have a measurable definition? "Improved" is subjective without baseline comparison. [Measurability, Spec §SC-006]
- [ ] CHK028 - Does SC-007 reference sticky headers, or is sticky header success not captured in any success criterion? [Gap, Spec §SC-007, §FR-014]

## Edge Case & Scenario Coverage

- [ ] CHK029 - Are requirements defined for tables with zero rows? The empty state message exists but is it specified in the spec? [Coverage, Gap]
- [ ] CHK030 - Are requirements defined for extremely long column header text when units are appended (e.g., "Max Heart Rate (bpm)")? Could this cause layout issues? [Coverage, Gap]
- [ ] CHK031 - Are requirements defined for browser/device compatibility of the Geist Mono font and `tabular-nums` CSS feature? [Coverage, Spec §FR-005, Gap]
- [ ] CHK032 - Does the spec address what happens when the table container is shorter than the header height (very small viewport)? [Edge Case, Spec §FR-014, Gap]

## Notes

- **Critical finding**: Sticky headers (FR-014) may not work as intended due to nested `overflow` containers in the DOM — `sticky` positioning requires the scroll container to be a direct ancestor. The `ui/table.tsx` inner wrapper with `overflow-x-auto` may break vertical sticky behavior.
- **Hover conflict**: `ui/table.tsx` defines `hover:bg-muted/50` on `TableRow`, while `data-table.tsx` applies `hover:bg-muted/60` — both will apply, with specificity determining the winner.
- SC-007 covers zebra rows and hover but does not mention sticky headers — FR-014 has no corresponding success criterion.
