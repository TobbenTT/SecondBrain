const path = require('path');
const fs = require('fs');

function safePath(baseDir, userInput) {
    const resolved = path.resolve(baseDir, userInput);
    if (!resolved.startsWith(path.resolve(baseDir))) return null;
    return resolved;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// ─── Skill Functional Group Mapping ──────────────────────────────────────────
const SKILL_FUNCTIONAL_GROUP = {
    // engineering — Ingenieria & Activos
    'analyze-benchmark': 'engineering',
    'analyze-equipment-criticality': 'engineering',
    'analyze-failure-patterns': 'engineering',
    'analyze-gap-assessment': 'engineering',
    'analyze-lifecycle-cost': 'engineering',
    'analyze-reliability': 'engineering',
    'analyze-scenarios': 'engineering',
    'assess-am-maturity': 'engineering',
    'assess-digital-maturity': 'engineering',
    'benchmark-maintenance-kpis': 'engineering',
    'calculate-operational-kpis': 'engineering',
    'create-asset-register': 'engineering',
    'create-kpi-dashboard': 'engineering',
    'create-maintenance-manual': 'engineering',
    'create-maintenance-strategy': 'engineering',
    'create-spare-parts-strategy': 'engineering',
    'create-shutdown-plan': 'engineering',
    'create-work-management-manual': 'engineering',
    'design-sap-pm-blueprint': 'engineering',
    'develop-maintenance-strategy': 'engineering',
    'develop-samp': 'engineering',
    'embed-risk-based-decisions': 'engineering',
    'generate-initial-spares-list': 'engineering',
    'generate-operating-procedures': 'engineering',
    'identify-improvement-opportunities': 'engineering',
    'manage-equipment-preservation': 'engineering',
    'manage-moc-workflow': 'engineering',
    'manage-change-control': 'engineering',
    'manage-vendor-documentation': 'engineering',
    'model-opex-budget': 'engineering',
    'model-ram-simulation': 'engineering',
    'optimize-mro-inventory': 'engineering',
    'optimize-pm-program': 'engineering',
    'plan-turnaround': 'engineering',
    'track-document-currency': 'engineering',
    'unify-operational-data': 'engineering',
    'load-sap-master-data': 'engineering',
    // commissioning — Comisionamiento & Construccion
    'certify-system-readiness': 'commissioning',
    'create-commissioning-plan': 'commissioning',
    'create-or-framework': 'commissioning',
    'create-or-plan': 'commissioning',
    'create-or-playbook': 'commissioning',
    'create-or-strategy': 'commissioning',
    'create-rampup-plan': 'commissioning',
    'design-adoption-roadmap': 'commissioning',
    'forecast-program-completion': 'commissioning',
    'generate-or-gate-review': 'commissioning',
    'generate-or-report': 'commissioning',
    'manage-epc-interfaces': 'commissioning',
    'manage-loop-checking': 'commissioning',
    'model-commissioning-sequence': 'commissioning',
    'model-rampup-trajectory': 'commissioning',
    'orchestrate-or-agents': 'commissioning',
    'orchestrate-or-program': 'commissioning',
    'prepare-pssr-package': 'commissioning',
    'track-long-lead-procurement': 'commissioning',
    'track-or-deliverables': 'commissioning',
    'track-progressive-handover': 'commissioning',
    'track-punchlist-items': 'commissioning',
    'verify-construction-quality': 'commissioning',
    // compliance — Cumplimiento & Riesgo
    'audit-ai-workflow': 'compliance',
    'audit-compliance-readiness': 'compliance',
    'create-contract-scope': 'compliance',
    'create-risk-assessment': 'compliance',
    'design-quality-gate': 'compliance',
    'generate-esg-report': 'compliance',
    'generate-performance-report': 'compliance',
    'map-regulatory-requirements': 'compliance',
    'resolve-cross-functional-conflicts': 'compliance',
    'review-document-quality': 'compliance',
    'validate-output-quality': 'compliance',
    // workforce — Fuerza Laboral & Capacitacion
    'calc-training-hours': 'workforce',
    'cost-per-worker': 'workforce',
    'create-change-mgmt-plan': 'workforce',
    'create-org-design': 'workforce',
    'create-staffing-plan': 'workforce',
    'create-training-plan': 'workforce',
    'facilitate-change-management': 'workforce',
    'model-staffing-requirements': 'workforce',
    'plan-training-program': 'workforce',
    'track-competency-matrix': 'workforce',
    'verify-critical-staffing': 'workforce',
    // knowledge — Gestion del Conocimiento
    'build-second-brain': 'knowledge',
    'capture-and-classify-knowledge': 'knowledge',
    'capture-expert-knowledge': 'knowledge',
    'capture-knowledge-artifact': 'knowledge',
    'curate-knowledge-flow': 'knowledge',
    'define-intent-specification': 'knowledge',
    'deliver-contextual-knowledge': 'knowledge',
    'extract-data-from-docs': 'knowledge',
    'generate-lessons-learned': 'knowledge',
    'maintain-knowledge-currency': 'knowledge',
    'notebooklm-context-builder': 'knowledge',
    'research-deep-topic': 'knowledge',
    'summarize-documents': 'knowledge',
    'track-incident-learnings': 'knowledge',
    // gtd — GTD & Productividad
    'classify-idea': 'gtd',
    'decompose-project': 'gtd',
    'identify-next-action': 'gtd',
    'weekly-review': 'gtd',
    // communication — Comunicacion & Entregables
    'create-case-study': 'communication',
    'create-client-presentation': 'communication',
    'create-email-followup': 'communication',
    'create-executive-briefing': 'communication',
    'create-linkedin-content': 'communication',
    'create-meeting-minutes': 'communication',
    'create-operations-manual': 'communication',
    'create-vsc-proposals': 'communication',
    'create-weekly-report': 'communication',
    'executive-summary': 'communication',
    'generate-daily-nudge': 'communication',
    'genspark-pptx-enhancer': 'communication',
    'translate-technical': 'communication',
    'vibe-working-session': 'communication',
    // ai-dev — IA, Automatizacion & Dev
    'airtable-report-generator': 'ai-dev',
    'create-agent-specification': 'ai-dev',
    'create-prompt-contract': 'ai-dev',
    'demo-local-db': 'ai-dev',
    'execute-consulting-task': 'ai-dev',
    'generate-python-code': 'ai-dev',
    'github-prompt-manager': 'ai-dev',
    'github-skill-deployer': 'ai-dev',
    'measure-ai-roi': 'ai-dev',
    'review-code-quality': 'ai-dev',
    'sync-airtable-jira': 'ai-dev',
    'sync-memory-agents': 'ai-dev',
};

const CATEGORY_DEFAULT_GROUP = {
    core: 'engineering',
    customizable: 'communication',
    integration: 'ai-dev',
};

function getFilesRecursively(dir, fileList = [], baseDir = null) {
    if (!baseDir) baseDir = dir;
    if (!fs.existsSync(dir)) return [];

    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            getFilesRecursively(filePath, fileList, baseDir);
        } else {
            if (path.extname(file).toLowerCase() === '.md') {
                const skillName = path.basename(file, '.md');
                const category = path.basename(path.dirname(filePath));
                const functionalGroup = SKILL_FUNCTIONAL_GROUP[skillName]
                    || CATEGORY_DEFAULT_GROUP[category]
                    || 'engineering';
                fileList.push({
                    name: file,
                    path: path.relative(baseDir, filePath).replace(/\\/g, '/'),
                    size: stat.size,
                    category,
                    functionalGroup
                });
            }
        }
    });
    return fileList;
}

function findDynamicPage(filename, dinamicsDir) {
    const base = path.basename(filename, path.extname(filename)).toLowerCase();
    if (!fs.existsSync(dinamicsDir)) return null;

    const dirs = fs.readdirSync(dinamicsDir, { withFileTypes: true })
        .filter(d => d.isDirectory() && d.name !== 'Proximamente');

    // 1. Exact match (folder name === file basename, case-insensitive)
    for (const dir of dirs) {
        if (dir.name.toLowerCase() === base) {
            const folderPath = path.join(dinamicsDir, dir.name);
            const htmlFiles = fs.readdirSync(folderPath).filter(f => f.endsWith('.html'));
            if (htmlFiles.length > 0) {
                return {
                    folder: dir.name,
                    htmlFile: htmlFiles[0],
                    url: `/dinamicas/${encodeURIComponent(dir.name)}/${encodeURIComponent(htmlFiles[0])}`
                };
            }
        }
    }

    // 2. Fuzzy match — include ALL words (no length filter) to distinguish ES/EN/PT variants
    let bestMatch = null;
    let bestScore = 0;

    for (const dir of dirs) {
        const dirWords = dir.name.toLowerCase().split(/[\s\-_]+/);
        const fileWords = base.split(/[\s\-_]+/);
        const longer = Math.max(dirWords.length, fileWords.length);
        const overlap = dirWords.filter(w => fileWords.some(fw => fw === w));

        // Require exact equality: all words must match both ways
        if (overlap.length === dirWords.length && overlap.length === fileWords.length) {
            const folderPath = path.join(dinamicsDir, dir.name);
            const htmlFiles = fs.readdirSync(folderPath).filter(f => f.endsWith('.html'));
            if (htmlFiles.length > 0) {
                return { folder: dir.name, htmlFile: htmlFiles[0], url: `/dinamicas/${encodeURIComponent(dir.name)}/${encodeURIComponent(htmlFiles[0])}` };
            }
        }

        // Score by percentage of matching words (both directions)
        const score = (overlap.length * 2) / (dirWords.length + fileWords.length);
        const threshold = Math.max(2, Math.ceil(Math.min(dirWords.length, fileWords.length) * 0.75));
        if (overlap.length >= threshold && score > bestScore) {
            const folderPath = path.join(dinamicsDir, dir.name);
            const htmlFiles = fs.readdirSync(folderPath).filter(f => f.endsWith('.html'));
            if (htmlFiles.length > 0) {
                bestScore = score;
                bestMatch = { folder: dir.name, htmlFile: htmlFiles[0], url: `/dinamicas/${encodeURIComponent(dir.name)}/${encodeURIComponent(htmlFiles[0])}` };
            }
        }
    }
    return bestMatch;
}

function loadTags(tagsFile) {
    try {
        return JSON.parse(fs.readFileSync(tagsFile, 'utf-8'));
    } catch { return {}; }
}

function saveTags(tagsFile, data) {
    fs.writeFileSync(tagsFile, JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = { safePath, formatFileSize, getFilesRecursively, findDynamicPage, loadTags, saveTags };
