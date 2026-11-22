# Methodology: SADC STEM Standardisation Framework

## Context

The landscape of schooling standardisation across SADC reveals a paradox: there is significant
structural alignment in how education systems are organised, but minimal standardisation of
curriculum content, assessment benchmarks, or external accreditation comparable to global
frameworks like the IB or Cambridge. The region operates largely through policy harmonisation
rather than shared external examinations, creating both opportunities and challenges for STEM
education.

## Comparative analysis of SADC schooling standardisation

| Standardisation criterion | Status in SADC | Key evidence |
|---|---|---|
| Accreditation & Quality Assurance | Fragmented, emerging | No regional body accredits primary/secondary schools. Efforts focus on higher education through the SADC Qualifications Framework (SADCQF) and UNESCO/HAQAA workshops. |
| Standardised Curriculum Frameworks | National control, structural similarity | Each country maintains its own national curriculum, typically reviewed every 5 years. Systems are structurally similar (12-13 years of schooling, English as medium of instruction in senior secondary). |
| Externally Benchmarked Assessments | Absent at regional level | No SADC-wide school-leaving exam. Individual countries use national examination boards. Some use Cambridge/IB in private international schools, but these are not the regional standard. |
| Academic Continuity | Limited by fragmentation | Qualification recognition systems are under development (SADCQF), but implementation is slow and political barriers persist. |

## Scope for improvement in STEM education

The lack of standardisation creates specific barriers for STEM, but also highlights where
targeted regional action could yield high impact. This framework operationalises five areas
of improvement into a measurable, seven-dimension maturity model (see
`framework/dimensions.json`):

1. **Curriculum and assessment alignment** — develop a SADC STEM Competency Framework
   defining minimum learning outcomes for primary and secondary STEM, linked to the SADCQF,
   enabling comparability without mandating a single curriculum.
2. **Teacher quality and mobility** — establish regional STEM teacher certification standards
   and promote exchange programmes, extending the SADC Protocol's principle of treating
   students as local in member states to STEM teachers.
3. **Gender equity in STEM** — standardise gender-disaggregated data collection on STEM
   participation and achievement; coordinate regional campaigns and targeted financial support.
4. **Regional collaboration and centres of excellence** — scale bilateral partnerships (e.g.
   South Africa-Eswatini, South Africa-Mozambique) into a network of SADC STEM Centres of
   Excellence for secondary education.
5. **Qualification recognition for mobility** — prioritise operationalising the SADCQF for
   STEM qualifications specifically, requiring technical alignment and political will to
   streamline verification and build mutual trust in QA mechanisms.

## From analysis to a tracked framework

Each improvement area above maps to one or more of the seven tracked dimensions in
`framework/dimensions.json`:

- Accreditation & Quality Assurance
- Standardised Curriculum Frameworks
- Externally Benchmarked Assessments
- Teacher Quality & Mobility
- Gender Equity in STEM
- Regional Collaboration & Centres of Excellence
- Qualification Recognition for Mobility

Each dimension is scored on a common 0-4 maturity scale (Absent, Emerging, Developing,
Established, Advanced) so that:

- Countries can be compared on a like-for-like basis without forcing curriculum uniformity.
- Regional averages surface which dimensions most need coordinated SADC-level action.
- Each dimension carries concrete `actions` (see `framework/dimensions.json`) that translate
  directly into a country's or the region's improvement roadmap.

## Harmonised identification and demographics

Qualification recognition for mobility (improvement area 5) depends on member states being
able to identify a learner or teacher consistently across borders. `framework/identification.json`
proposes a **SADC Harmonised Identification Number**: it keeps the two ideas that make South
Africa's Home Affairs ID workable at scale (an embedded date of birth and a Luhn check digit),
and adds the two fields a multi-country scheme needs — an explicit 2-digit country code, and a
sex digit standardised on ISO/IEC 5218 rather than a country-specific convention. This is a
proposed format for format-compliance testing, not a live population register.

`data/demographics.json` adds population, school-age cohort size, gender split, urban/rural
split and GDP per capita per country, so the standardisation scores in `data/assessments.json`
can be read alongside the size of the population they affect — e.g. a low score in a
high-population, high-school-age-cohort country represents a larger absolute number of
affected learners than the same score in a small state.

## Data and updates

The seed dataset in `data/assessments.json` is **illustrative**, built from the qualitative
regional analysis above rather than verified national statistics. It exists so the dashboard
and reports are usable immediately; it should be progressively replaced with data sourced from:

- SADCQF implementation reports
- UNESCO / HAQAA (Harmonisation of African Higher Education Quality Assurance) publications
- National ministries of education and examination boards
- SACMEQ / TIMSS-style regional learning assessments, where available

See the root `README.md` for how to update the dataset via the dashboard's edit mode or by
editing `data/assessments.json` directly.
