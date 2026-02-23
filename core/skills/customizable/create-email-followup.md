# Create Email Follow-up

## Skill ID: C-EMAIL-017

## Version: 1.0.0

## Category: C. Consultant Productivity

## Priority: P2 - High (critical for sales pipeline and client relationship management)

---

## Purpose

Draft professional follow-up emails for commercial and project contexts, maintaining client engagement, advancing sales opportunities, and ensuring timely communication. This skill produces contextually appropriate emails that reflect VSC's professional standards and the specific relationship stage with each client.

---

## Intent & Specification

This skill enables the AI agent to:

1. **Draft** follow-up emails tailored to the specific client context and relationship stage.
2. **Adapt** tone and content for different purposes: post-meeting, proposal follow-up, project update, relationship nurturing.
3. **Include** relevant action items, next steps, and value propositions.
4. **Produce** ready-to-send email drafts with subject line and body.
5. **Deliver** output as email draft text.

---

## Trigger / Invocation

**Command:** `/create-email-followup`

**Trigger Conditions:**
- User requests a follow-up email after a meeting, call, or event.
- Sales pipeline requires prospect outreach.
- Project communication needs professional drafting.
- Client relationship management requires periodic touch points.

**Aliases:**
- `/followup-email`
- `/email`
- `/email-draft`

---

## Input Requirements

### Required Inputs

| Input | Format | Description |
|-------|--------|-------------|
| `client_context` | Text | Client name, company, industry, and relationship context |
| `previous_interaction` | Text | What happened last (meeting, call, proposal sent, event) |
| `objective` | Text | Goal of the email: schedule next meeting, follow up on proposal, share information, reactivate contact |

### Optional Inputs

| Input | Format | Description |
|-------|--------|-------------|
| `recipient_name` | Text | Name and title of the recipient |
| `relationship_stage` | Text | Prospect, active proposal, current client, past client |
| `key_points` | List | Specific points to address or mention |
| `attachments_to_mention` | List | Documents or materials being attached |
| `urgency` | Text | Time-sensitive (high urgency) or standard follow-up |
| `language` | Text | Email language: ES, EN, PT (default: match context) |
| `tone` | Text | Formal, professional, warm, casual-professional |
| `sender_name` | Text | Sender's name and title for signature |
| `previous_emails` | Text | Previous email thread for context and tone matching |
| `value_proposition` | Text | Specific value or benefit to highlight |

---

## Output Specification

### Primary Output: Email Draft

**Output structure:**

```markdown
# Email Follow-up Draft

## Email Details
- **To:** [Recipient name and email placeholder]
- **Subject:** [Subject line]
- **Type:** [Post-meeting / Proposal follow-up / Project update / etc.]
- **Urgency:** [Standard / High]

## Email Body

[Complete email text ready to send]

## Sender Signature
[Name]
[Title]
[Company]
[Phone/Email]

## Notes
- [Any context notes for the sender about timing or follow-up]

## Alternative Subject Lines
1. [Alternative 1]
2. [Alternative 2]
```

---

## Methodology & Standards

### Email Follow-up Framework

#### Post-Meeting Follow-up
```
Structure:
1. Thank / acknowledge the meeting.
2. Summarize key takeaways (2-3 bullets).
3. Restate agreed next steps.
4. Offer additional value (resource, insight).
5. Propose next interaction date.
6. Professional close.

Timing: Within 24 hours of the meeting.
```

#### Proposal Follow-up
```
Structure:
1. Reference the proposal sent (date, title).
2. Ask if they have questions or need clarification.
3. Reinforce the key value proposition (1-2 sentences).
4. Propose a brief call to discuss.
5. Gentle urgency (without pressure).

Timing: 5-7 business days after proposal submission.
```

#### Project Update / Check-in
```
Structure:
1. Brief project status update.
2. Key achievements or milestones reached.
3. Any items needing client input or decision.
4. Next steps and timeline.
5. Invitation for feedback or questions.

Timing: As appropriate to project cadence.
```

#### Relationship Nurturing (re-engagement)
```
Structure:
1. Personal reference (last interaction, shared interest).
2. Share something of value (article, insight, industry news).
3. Brief mention of how VSC might help with current challenges.
4. Low-pressure invitation to reconnect.

Timing: 3-6 months after last interaction.
```

### Email Writing Principles

1. **Subject Line:** Specific, action-oriented, < 50 characters. Avoid generic subjects.
2. **Opening:** Personal, reference-specific. Never generic ("I hope this email finds you well...").
3. **Body:** Clear, concise, structured. Maximum 3-4 short paragraphs.
4. **Value:** Every email should offer something of value to the recipient.
5. **CTA:** One clear, specific call to action per email.
6. **Length:** Target 150-250 words. Respect the reader's time.
7. **Tone:** Professional but warm. Match the relationship stage.

### Subject Line Templates

| Context | Template | Example |
|---------|----------|---------|
| Post-meeting | "[Topic] - Siguientes pasos" | "Proyecto Criticidad - Siguientes pasos" |
| Proposal follow-up | "Re: [Proposal title] - Consulta" | "Re: Propuesta Gestion de Activos - Consulta" |
| Information sharing | "[Relevant topic] - Material de interes" | "Mantenimiento Predictivo - Material de interes" |
| Scheduling | "Reunion [topic] - Propuesta de fecha" | "Reunion Revision RAM - Propuesta de fecha" |
| Re-engagement | "[Personal reference] + [Value offer]" | "Felicitaciones por la expansion + tendencias AM 2025" |

### Cultural Considerations (LATAM)

| Aspect | Guideline |
|--------|-----------|
| Salutation | "Estimado/a [Name]" (formal) or "Hola [Name]" (professional-warm) |
| Closing | "Saludos cordiales" (formal), "Un saludo" (professional), "Quedo atento/a" (follow-up) |
| Tone | Warmer and more personal than Anglo-Saxon business culture. Brief personal touch acceptable. |
| Formality | Use "usted" for first interactions; shift to informal with relationship building. |
| Follow-up frequency | Less aggressive than US norms; 7-10 days between follow-ups is appropriate. |

---

## Step-by-Step Execution

### Phase 1: Context Analysis (Steps 1-2)

**Step 1: Understand the situation.**
- Identify the relationship stage (prospect, active, current, past client).
- Understand the previous interaction context.
- Clarify the email objective and desired outcome.
- Determine appropriate tone and formality level.

**Step 2: Plan the email.**
- Select the appropriate email framework (post-meeting, proposal, etc.).
- Identify the key value proposition or information to share.
- Define the single, clear call to action.
- Draft subject line options.

### Phase 2: Email Drafting (Steps 3-4)

**Step 3: Write the email.**
- Open with specific, personal reference.
- Develop the body following the selected framework.
- Include relevant details, next steps, or value offering.
- Close with clear call to action.
- Keep under 250 words.

**Step 4: Refine and polish.**
- Review for tone appropriateness.
- Check that the CTA is clear and specific.
- Verify name spelling and company references.
- Generate alternative subject lines.
- Add notes for the sender on timing and context.

### Phase 3: Delivery (Step 5)

**Step 5: Deliver draft.**
- Present complete email draft ready for review.
- Include subject line with alternatives.
- Add contextual notes for the sender.
- Suggest optimal send timing.

---

## Quality Criteria

### Content
- [ ] Email has a clear, singular objective.
- [ ] Subject line is specific and compelling (< 50 characters).
- [ ] Opening is personal and specific (not generic).
- [ ] Body provides value to the recipient.
- [ ] Call to action is clear and specific.
- [ ] Length is appropriate (150-250 words).

### Professionalism
- [ ] Tone matches the relationship stage.
- [ ] No spelling or grammar errors.
- [ ] Names and company references are correct.
- [ ] Cultural considerations are respected.
- [ ] Consistent with VSC brand voice.

### Effectiveness
- [ ] Email advances the relationship or sales process.
- [ ] Next steps are clearly defined.
- [ ] Urgency is appropriate (not pushy, not passive).
- [ ] Reader can respond easily (question is easy to answer, action is easy to take).

---

## Inter-Agent Dependencies

### Upstream Dependencies

| Agent/Skill | Data Received | Purpose |
|-------------|---------------|---------|
| `create-meeting-minutes` (C-MIN-015) | Action items and decisions from meetings | Post-meeting follow-up content |
| `create-executive-briefing` (C-BRIEF-018) | Client context and preparation notes | Email context |
| User | Client context, interaction history, objective | Task specification |

### Downstream Consumers

| Agent/Skill | Data Provided | Purpose |
|-------------|---------------|---------|
| None (final output for human review and sending) | | |

---

## Templates & References

### Templates
- `templates/email_followup_postmeeting.md` - Post-meeting follow-up template.
- `templates/email_followup_proposal.md` - Proposal follow-up template.
- `templates/email_followup_nurture.md` - Relationship nurturing template.

### Reference Documents
- VSC internal: "Guia de Comunicacion Comercial v1.0"
- VSC internal: "Tono y Voz de Marca VSC"

---

## Examples

### Example 1: Post-Meeting Follow-up (ES)

**Input:**
- Client: Maria Lopez, Gerente de Mantenimiento, Minera Norte Grande.
- Previous interaction: Meeting yesterday to discuss AM assessment project.
- Objective: Confirm next steps and send preliminary scope document.
- Language: Spanish, professional-warm tone.

**Expected Output:**

Subject: Proyecto Evaluacion AM - Siguientes pasos

```
Hola Maria,

Muchas gracias por la reunion de ayer. Fue muy valioso entender
la situacion actual de la gestion de mantenimiento en la planta
y los desafios que enfrentan con la disponibilidad del circuito
de molienda.

Como conversamos, los siguientes pasos serian:

1. Envio de nuestra propuesta de alcance preliminar (adjunta).
2. Revision interna de su parte con el equipo de operaciones.
3. Reunion de alineamiento la semana del 24 de febrero.

Adjunto el documento de alcance preliminar para su revision.
Quedo disponible para cualquier consulta que surja durante
la revision.

Te parece si agendamos la proxima reunion para el martes 25
o miercoles 26?

Saludos cordiales,
[Firma]
```

### Example 2: Proposal Follow-up (EN)

**Input:**
- Client: John Smith, VP Asset Management, Pacific Water Corp.
- Previous interaction: Proposal sent 7 days ago for LCC study.
- Objective: Check status and offer to clarify questions.
- Language: English, professional tone.

**Expected Output:**

Subject: LCC Study Proposal - Any Questions?

```
Hi John,

I wanted to follow up on the Life Cycle Cost study proposal
we sent last week for the desalination plant expansion.

I understand your team may still be reviewing it internally.
If any questions have come up about the methodology, timeline,
or investment, I would be happy to schedule a brief 20-minute
call to walk through any specific areas.

One point I wanted to highlight: our approach includes a
Monte Carlo sensitivity analysis that has helped similar
clients reduce decision uncertainty by quantifying the
probability distribution of outcomes rather than relying
on single-point estimates.

Would Thursday or Friday afternoon work for a brief call?

Best regards,
[Signature]
```
