# Create VSC Proposals
## Skill ID: create-vsc-proposals
## Version: 1.0.0
## Category: A - Document Generation
## Priority: Critical

## Purpose
Generates comprehensive technical-economic proposals (.docx, .xlsx, .pptx) for VSC Operational Readiness consulting engagements. This skill is the primary revenue-generating document capability, producing client-facing proposals that define scope, methodology, deliverables, timelines, team composition, and pricing for OR projects across mining, energy, oil & gas, and industrial sectors.

A well-crafted proposal is the gateway to every engagement. It must communicate VSC's differentiated value proposition, demonstrate deep understanding of the client's operational challenges, and present a credible, structured approach to achieving Operational Readiness before asset commissioning.

## Intent & Specification
The AI agent MUST understand that:

1. **Business Context**: VSC proposals compete against international consultancies (Hatch, Bechtel, Fluor) and must demonstrate equivalent or superior technical depth while emphasizing VSC's Latin American operational expertise and cost-effectiveness.
2. **Dual Audience**: Proposals are read by both technical managers (who evaluate methodology and team) and commercial/procurement teams (who evaluate pricing and terms). The document must satisfy both.
3. **Customization is Non-Negotiable**: Every proposal must be tailored to the specific client, project, industry, and regulatory context. Generic proposals are unacceptable.
4. **Three-Document Deliverable**: The skill produces three coordinated outputs:
   - `.docx` - Technical-economic proposal (narrative document)
   - `.xlsx` - Detailed pricing breakdown and resource loading
   - `.pptx` - Executive summary presentation for client meetings
5. **Quality Standard**: Output must be indistinguishable from a proposal prepared by a senior consultant with 15+ years of OR experience.
6. **Language**: Default language is Spanish (Latin American). English versions may be requested for international clients.

## Trigger / Invocation
```
/create-vsc-proposals
```

### Natural Language Triggers
- "Create a proposal for [client name]"
- "Generate a technical-economic proposal for the [project name] project"
- "Prepare a bid/offer for [description]"
- "Draft an OR proposal for [industry/client]"
- "Necesito una propuesta para [cliente/proyecto]"
- "Generar propuesta tecnico-economica"

## Input Requirements

### Required Inputs
| Input | Description | Source |
|-------|-------------|--------|
| `client_name` | Full legal name of the client organization | User / CRM |
| `project_name` | Name of the project or asset | User / Client RFP |
| `industry_sector` | Mining, Energy, Oil & Gas, Water, Infrastructure | User |
| `project_description` | High-level description of the asset/project | User / Client RFP |
| `scope_of_work` | Requested OR services (can be from RFP or user-defined) | User / Client RFP |
| `project_location` | Country, region, site location | User |
| `estimated_duration` | Expected project timeline | User |
| `budget_range` | Indicative budget or pricing constraints (if known) | User |

### Optional Inputs
| Input | Description | Default |
|-------|-------------|---------|
| `rfp_document` | Client's Request for Proposal document | None |
| `client_standards` | Client-specific standards and requirements | Industry defaults |
| `team_preferences` | Preferred team members or roles | Auto-assigned |
| `competitor_intel` | Known competitors in the bid | None |
| `previous_proposals` | Past proposals for same client or similar projects | Search knowledge base |
| `language` | Output language | `es-CL` (Spanish, Chile) |
| `currency` | Pricing currency | `USD` |
| `vsc_rate_card` | Current rate card for consultants | Latest approved rates |
| `template_version` | Specific proposal template to use | Latest |
| `commercial_terms` | Payment terms, warranties, exclusions | VSC standard terms |

### Context Enrichment
The agent should automatically:
- Search the knowledge base for similar past proposals
- Retrieve the latest VSC rate card and team availability
- Pull relevant industry benchmarks and regulatory requirements
- Identify applicable VSC methodologies and tools
- Check for existing client relationship history

## Output Specification

### Document 1: Technical-Economic Proposal (.docx)
**Filename**: `VSC_Propuesta_{ClientCode}_{ProjectCode}_{Version}_{Date}.docx`

**Structure**:
1. **Cover Page** - VSC branding, project name, client logo, date, confidentiality notice
2. **Table of Contents** - Auto-generated
3. **Executive Summary** (1-2 pages) - Key value proposition, scope summary, investment summary
4. **Company Profile** (1-2 pages) - VSC overview, relevant experience, differentiators
5. **Understanding of the Project** (2-4 pages) - Demonstration of understanding client's needs, challenges, and context
6. **Scope of Services** (3-6 pages)
   - 6.1 OR Workstreams (Operations, Maintenance, HSE, Training, Organization, Systems)
   - 6.2 Deliverables Matrix (deliverable, format, responsible, milestone)
   - 6.3 Exclusions and Assumptions
7. **Methodology** (3-5 pages)
   - 7.1 VSC OR Framework overview
   - 7.2 Phase-gate approach (Assessment, Design, Implementation, Commissioning Support)
   - 7.3 Tools and systems used
   - 7.4 Quality assurance approach
8. **Work Plan & Schedule** (2-3 pages)
   - 8.1 Master schedule (Gantt chart description)
   - 8.2 Phase milestones
   - 8.3 Critical path and dependencies
9. **Project Team** (2-3 pages)
   - 9.1 Organization chart
   - 9.2 Key personnel CVs (summary)
   - 9.3 Roles and responsibilities
10. **Investment** (2-3 pages)
    - 10.1 Fee summary by phase/workstream
    - 10.2 Rate basis and assumptions
    - 10.3 Reimbursable expenses
    - 10.4 Payment schedule
11. **Commercial Terms** (1-2 pages)
    - 11.1 Validity period
    - 11.2 Payment terms
    - 11.3 Change order procedure
    - 11.4 Confidentiality
12. **Appendices**
    - A: Detailed CVs
    - B: Relevant project experience sheets
    - C: Detailed schedule
    - D: Detailed pricing breakdown (reference to .xlsx)

**Formatting Standards**:
- Font: Calibri 11pt body, Calibri Bold 14pt/12pt headings
- Margins: 2.5cm all sides
- Headers/Footers: VSC logo, document code, page numbers
- Tables: VSC branded style with header row
- Maximum 40 pages (excluding appendices)

### Document 2: Pricing Workbook (.xlsx)
**Filename**: `VSC_Pricing_{ClientCode}_{ProjectCode}_{Version}_{Date}.xlsx`

**Sheets**:
1. **Summary** - Total investment by phase and workstream
2. **Resource Loading** - Person-months by role, by phase, by month
3. **Rate Card** - Applied rates by role category
4. **Fee Calculation** - Detailed fee = hours x rate by resource by month
5. **Reimbursables** - Travel, accommodation, per diem, materials
6. **Cash Flow** - Monthly invoicing projection
7. **Assumptions** - All pricing assumptions listed
8. **Sensitivity** - Scenario analysis (base, optimistic, pessimistic)

### Document 3: Executive Presentation (.pptx)
**Filename**: `VSC_Presentacion_{ClientCode}_{ProjectCode}_{Version}_{Date}.pptx`

**Slides** (12-18 slides):
1. Title slide
2. Agenda
3. VSC at a Glance
4. Understanding Your Challenge
5. Our Approach to OR
6-8. Scope of Services (key workstreams)
9. Methodology & Framework
10. Project Timeline
11. Your Team
12. Investment Summary
13. Why VSC (differentiators)
14. Relevant Experience (2-3 case studies)
15. Next Steps
16. Contact Information

## Methodology & Standards

### VSC OR Framework
The proposal must reference and align with VSC's proprietary Operational Readiness framework, which includes:
- **OR Assessment**: Readiness gap analysis against best practices
- **OR Design**: Development of operations/maintenance/organizational models
- **OR Implementation**: Execution of plans, training, systems setup
- **OR Commissioning Support**: Handover support during commissioning and ramp-up

### Industry Standards Referenced
- **ISO 55000** - Asset Management
- **ISO 14224** - Petroleum/natural gas/petrochemical industries - Collection and exchange of reliability and maintenance data
- **SAE JA1011/JA1012** - Reliability Centered Maintenance
- **ISA-95** - Enterprise-Control System Integration
- **PMBOK** - Project Management Body of Knowledge (for project execution approach)
- **AACE** - Cost estimation standards for pricing methodology
- **ISO 45001** - Occupational Health and Safety
- **ISO 14001** - Environmental Management Systems

### Pricing Methodology
- Time & Materials (T&M) with cap
- Lump Sum by deliverable
- Hybrid (Lump Sum phases + T&M advisory)
- Cost-plus (for embedded team models)

## Step-by-Step Execution

### Phase 1: Input Gathering & Analysis (Steps 1-4)
1. **Parse Input Data**: Extract all provided information from user inputs and any attached RFP documents. Identify gaps.
2. **Client & Industry Research**: Search knowledge base for:
   - Previous proposals to this client
   - Similar projects in the same industry/region
   - Applicable regulatory requirements
   - Industry-specific OR challenges and benchmarks
3. **Scope Definition**: Based on the project description and RFP requirements, define the OR workstreams and deliverables. Map to VSC standard service catalog.
4. **Gap Identification**: Identify any missing information required to complete the proposal. Generate clarification questions for the user if critical gaps exist.

### Phase 2: Technical Content Generation (Steps 5-9)
5. **Executive Summary Draft**: Write a compelling 1-2 page summary that:
   - Opens with the client's strategic challenge
   - Positions VSC's understanding of their needs
   - Summarizes the proposed approach
   - States the investment range
   - Ends with a clear value proposition
6. **Scope Development**: For each OR workstream:
   - Define specific activities and tasks
   - List deliverables with format and quality criteria
   - State assumptions and exclusions
   - Define acceptance criteria
7. **Methodology Section**: Customize VSC's standard OR methodology to the project:
   - Select relevant phase-gate approach
   - Define tools and systems to be used
   - Describe quality assurance mechanisms
   - Include client collaboration model
8. **Schedule Development**: Create a work breakdown structure and derive:
   - Phase durations based on scope complexity
   - Milestone dates aligned with project commissioning schedule
   - Resource loading profile
   - Critical dependencies (client-provided inputs, access, decisions)
9. **Team Composition**: Based on scope and schedule:
   - Define required roles and competencies
   - Assign team members (or role placeholders)
   - Create project organization chart
   - Prepare CV summaries for key personnel

### Phase 3: Commercial Content Generation (Steps 10-12)
10. **Resource Estimation**: For each deliverable/workstream:
    - Estimate person-hours by role
    - Apply productivity factors for location/complexity
    - Calculate total person-months by phase
11. **Pricing Calculation**: Apply rate card to resource estimates:
    - Calculate professional fees by workstream and phase
    - Estimate reimbursable expenses (travel, accommodation, materials)
    - Apply any volume discounts or strategic pricing
    - Generate payment milestone schedule
12. **Commercial Terms**: Apply standard VSC commercial terms, adjusted for:
    - Client-specific requirements from RFP
    - Country-specific legal/tax considerations
    - Risk allocation preferences

### Phase 4: Document Assembly & Quality (Steps 13-16)
13. **Document Assembly**: Compile all sections into the three output documents using VSC templates.
14. **Cross-Document Consistency Check**: Verify that:
    - Scope descriptions match across .docx and .pptx
    - Pricing in .docx matches .xlsx calculations
    - Team composition is consistent across all documents
    - Dates and milestones are aligned
15. **Quality Review**: Apply quality checklist (see Quality Criteria below).
16. **Final Output**: Generate all three documents with correct naming conventions and metadata.

## Quality Criteria

### Content Quality (Target: >91% SME Approval)
| Criterion | Weight | Description |
|-----------|--------|-------------|
| Technical Accuracy | 25% | Methodology, standards references, and technical content are correct and current |
| Scope Completeness | 20% | All required OR workstreams are addressed; no critical gaps |
| Commercial Viability | 15% | Pricing is competitive, realistic, and internally consistent |
| Client Customization | 15% | Proposal clearly demonstrates understanding of this specific client/project |
| Persuasiveness | 10% | Value proposition is clear; differentiators are compelling |
| Professional Quality | 10% | Formatting, language, grammar are impeccable |
| Internal Consistency | 5% | All three documents tell the same story with matching data |

### Automated Quality Checks
- [ ] All required sections present and non-empty
- [ ] Pricing totals in .docx match .xlsx calculations (variance < 0.01%)
- [ ] No placeholder text remaining (e.g., [INSERT], TBD, XXX)
- [ ] Client name and project name used consistently (no typos)
- [ ] All deliverables in scope have corresponding resource estimates
- [ ] Schedule milestones are chronologically valid
- [ ] Team roles in org chart match roles in pricing
- [ ] Page count within limits (max 40 pages body)
- [ ] All appendix references resolve to actual appendices
- [ ] Confidentiality notice present on cover and footer
- [ ] Language consistency (no mixed Spanish/English unless intentional)
- [ ] Currency and number formatting consistent throughout

### Review Workflow
1. **Automated QC**: Agent runs quality checklist (above)
2. **Peer Agent Review**: Sent to review-documents agent for cross-check
3. **SME Validation**: Flagged for human SME review if confidence < 91%
4. **Client-Ready**: Only released after passing all quality gates

## Inter-Agent Dependencies

### Upstream Dependencies (Inputs From)
| Agent/Skill | Input Provided | Criticality |
|-------------|---------------|-------------|
| `knowledge-base-agent` | Past proposals, client history, templates | High |
| `industry-research-agent` | Market data, benchmarks, regulatory context | Medium |
| `resource-management-agent` | Team availability, rate cards | High |
| `rfp-analyzer` (if applicable) | Parsed RFP requirements and evaluation criteria | High |

### Downstream Dependencies (Outputs To)
| Agent/Skill | Output Provided | Trigger |
|-------------|----------------|---------|
| `review-documents` | Draft proposal for quality review | Automatic |
| `project-setup-agent` | Approved proposal for project initialization | On contract award |
| `create-staffing-plan` | Scope and team as input for detailed staffing | On contract award |
| `create-kpi-dashboard` | Proposed KPIs for dashboard setup | On contract award |

### Collaboration During Execution
| Agent/Skill | Collaboration Type | When |
|-------------|-------------------|------|
| `hse-agent` | HSE scope validation | During scope development |
| `maintenance-strategy-agent` | Maintenance scope alignment | During scope development |
| `commercial-agent` | Pricing strategy and terms review | During commercial development |

## Templates & References

### Document Templates
- `VSC_Proposal_Template_v3.2.docx` - Master proposal template with VSC branding
- `VSC_Pricing_Template_v2.1.xlsx` - Standard pricing workbook template
- `VSC_Presentation_Template_v3.0.pptx` - Executive presentation template
- `VSC_CV_Template_v1.5.docx` - Personnel CV format

### Reference Documents
- `VSC_OR_Framework_v4.0.pdf` - Complete OR methodology description
- `VSC_Service_Catalog_2024.xlsx` - Standard service offerings and descriptions
- `VSC_Rate_Card_2024.xlsx` - Current consultant rate card by level
- `VSC_Commercial_Terms_Standard.docx` - Standard terms and conditions
- `VSC_Brand_Guidelines_v2.0.pdf` - Visual identity and formatting standards

### Knowledge Base Queries
- Past proposals by industry sector
- Past proposals by client
- Project experience sheets by service type
- Consultant CVs and availability

## Examples

### Example 1: Mining OR Proposal Structure

**Input Summary**:
- Client: Minera Centinela (Antofagasta Minerals)
- Project: Planta Concentradora Phase 2 Expansion
- Industry: Copper Mining
- Location: Region de Antofagasta, Chile
- Duration: 18 months
- Scope: Full OR (Operations + Maintenance + HSE + Training + Organization)

**Expected Output Structure (abbreviated)**:

#### .docx Executive Summary Extract:
```
RESUMEN EJECUTIVO

VSC Consultores presenta a Minera Centinela su propuesta para los servicios de
Preparacion para la Operacion (Operational Readiness) de la expansion Fase 2 de
la Planta Concentradora, ubicada en la Region de Antofagasta.

Nuestra comprension del proyecto indica que Centinela requiere asegurar que la
nueva capacidad de procesamiento de 120 ktpd se integre de manera segura y
eficiente con las operaciones existentes, minimizando el tiempo de ramp-up y
maximizando la disponibilidad de planta desde el primer dia de operacion.

VSC propone un enfoque estructurado en cuatro fases...
[continues with methodology overview, team summary, investment range]
```

#### .xlsx Pricing Summary:
```
| Fase                    | Meses | Equipo (PM) | Honorarios (USD) | Reembolsables (USD) | Total (USD)   |
|-------------------------|-------|-------------|------------------|---------------------|---------------|
| 1. Evaluacion OR        | 3     | 8.5         | 425,000          | 85,000              | 510,000       |
| 2. Diseno OR            | 6     | 22.0        | 1,100,000        | 180,000             | 1,280,000     |
| 3. Implementacion OR    | 7     | 35.0        | 1,750,000        | 280,000             | 2,030,000     |
| 4. Soporte Commissioning| 2     | 12.0        | 600,000          | 120,000             | 720,000       |
|-------------------------|-------|-------------|------------------|---------------------|---------------|
| TOTAL                   | 18    | 77.5        | 3,875,000        | 665,000             | 4,540,000     |
```

#### .pptx Slide 4 (Understanding Your Challenge):
```
COMPRENDEMOS SU DESAFIO

- Expansion Fase 2 incrementa capacidad de procesamiento en un 60%
- Integracion con operaciones existentes requiere coordinacion precisa
- Ventana de commissioning limitada a 4 meses (oct 2025 - ene 2026)
- Necesidad de personal operacional capacitado y certificado
- Cumplimiento regulatorio DS 132, DS 40, Ley 20.551

VSC ha ejecutado +15 proyectos de OR en mineria del cobre en Chile,
incluyendo [2-3 relevant project references]
```

### Example 2: Energy Sector Proposal (Simplified Scope)

**Input Summary**:
- Client: Enel Green Power Chile
- Project: Parque Solar Atacama 400MW
- Scope: Maintenance Strategy + Training only
- Duration: 8 months

**Expected Adaptation**:
- Scope limited to maintenance and training workstreams
- Methodology focuses on RCM for solar PV and BESS equipment
- Team scaled down (5-7 consultants vs 12-15 for full OR)
- Pricing reflects reduced scope (~USD 800K-1.2M range)
- References to renewable energy projects and standards (IEC 61724, IEC 62446)
