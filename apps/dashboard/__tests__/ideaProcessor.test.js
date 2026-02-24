/**
 * Unit tests for helpers/ideaProcessor.js
 * Tests the core idea processing pipeline: AI analysis, splitting, sub-task creation, audit logging.
 */

process.env.NODE_ENV = 'test';
process.env.GEMINI_API_KEY = 'test-key';

// Mock logger
jest.mock('../helpers/logger', () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
}));

// Mock database
const mockRun = jest.fn();
const mockGet = jest.fn();
const mockAll = jest.fn();
jest.mock('../database', () => ({
    run: (...args) => mockRun(...args),
    get: (...args) => mockGet(...args),
    all: (...args) => mockAll(...args),
}));

// Mock AI service
const mockProcessIdea = jest.fn();
const mockDecomposeProject = jest.fn();
jest.mock('../services/ai', () => ({
    processIdea: (...args) => mockProcessIdea(...args),
    decomposeProject: (...args) => mockDecomposeProject(...args),
}));

const { processAndSaveIdea } = require('../helpers/ideaProcessor');

beforeEach(() => {
    jest.clearAllMocks();

    // Default DB responses
    mockAll.mockImplementation((sql) => {
        if (sql.includes('FROM users')) return Promise.resolve([
            { username: 'gonzalo', role: 'manager', department: 'Ops', expertise: 'Operations' },
            { username: 'jose', role: 'analyst', department: 'Eng', expertise: 'Engineering' },
        ]);
        if (sql.includes('FROM areas')) return Promise.resolve([
            { name: 'Operaciones' }, { name: 'HSE' },
        ]);
        if (sql.includes('FROM context_items')) return Promise.resolve([
            { key: 'company', content: 'VSC Consulting' },
        ]);
        if (sql.includes('FROM ideas WHERE id IN')) return Promise.resolve([]);
        return Promise.resolve([]);
    });

    mockGet.mockImplementation((sql) => {
        if (sql.includes('FROM areas WHERE name')) return Promise.resolve({ id: 1 });
        return Promise.resolve(null);
    });

    mockRun.mockResolvedValue({ lastID: 100 });
});

describe('ideaProcessor — processAndSaveIdea', () => {
    it('processes a single idea and updates the database', async () => {
        const analysis = {
            tipo: 'Tarea',
            categoria: 'Operaciones',
            resumen: 'Review safety procedures',
            accion_inmediata: 'Check docs',
            confidence: 0.9,
            suggested_area: 'Operaciones',
            para_type: 'project',
            assigned_to: 'gonzalo',
            estimated_time: '2h',
            priority: 'alta',
            suggested_agent: 'staffing',
            suggested_skills: ['safety-review'],
            contexto: '@oficina',
            energia: 'alta',
            tipo_compromiso: 'esta_semana',
            proxima_accion: true,
            objetivo: 'Improve safety',
            notas: 'Important',
            is_project: false,
        };
        mockProcessIdea.mockResolvedValue(analysis);

        const result = await processAndSaveIdea(1, 'Review safety', 'gonzalo');

        expect(result.tipo).toBe('Tarea');
        // Should update the idea
        expect(mockRun).toHaveBeenCalledWith(
            expect.stringContaining('UPDATE ideas SET'),
            expect.arrayContaining(['Tarea', 'Operaciones'])
        );
        // Should log to inbox_log
        expect(mockRun).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO inbox_log'),
            expect.any(Array)
        );
    });

    it('handles multi-idea split (array from AI)', async () => {
        const analyses = [
            { tipo: 'Tarea', categoria: 'Operaciones', resumen: 'Task 1', confidence: 0.8, is_project: false },
            { tipo: 'Nota', categoria: 'HSE', resumen: 'Note 2', confidence: 0.7, is_project: false },
        ];
        mockProcessIdea.mockResolvedValue(analyses);

        const result = await processAndSaveIdea(1, 'Two things to do', 'gonzalo');

        expect(result.split).toBe(true);
        expect(result.count).toBe(2);
        expect(result.savedIds.length).toBeGreaterThanOrEqual(2);
        // Second idea should be inserted as a new row
        expect(mockRun).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO ideas'),
            expect.arrayContaining(['Note 2'])
        );
    });

    it('creates sub-tasks for projects with sub_tasks', async () => {
        const analysis = {
            tipo: 'Proyecto',
            categoria: 'Operaciones',
            resumen: 'Big project',
            confidence: 0.9,
            is_project: true,
            sub_tasks: [
                { texto: 'Sub 1', assigned_to: 'gonzalo', es_proxima_accion: true },
                { texto: 'Sub 2', assigned_to: 'jose', es_proxima_accion: false },
            ],
        };
        mockProcessIdea.mockResolvedValue(analysis);

        await processAndSaveIdea(1, 'Big project idea', 'gonzalo');

        // Check sub-task insertions
        const subInserts = mockRun.mock.calls.filter(c =>
            c[0].includes('INSERT INTO ideas') && c[0].includes('parent_idea_id')
        );
        expect(subInserts.length).toBe(2);
    });

    it('decomposes project via AI when no sub_tasks provided', async () => {
        const analysis = {
            tipo: 'Proyecto',
            categoria: 'Operaciones',
            resumen: 'Auto decompose project',
            confidence: 0.9,
            is_project: true,
        };
        mockProcessIdea.mockResolvedValue(analysis);
        mockDecomposeProject.mockResolvedValue({
            sub_tasks: [
                { texto: 'Auto sub 1', assigned_to: 'gonzalo', es_proxima_accion: true },
            ],
        });

        await processAndSaveIdea(1, 'Auto decompose', 'gonzalo');

        expect(mockDecomposeProject).toHaveBeenCalled();
        const subInserts = mockRun.mock.calls.filter(c =>
            c[0].includes('INSERT INTO ideas') && c[0].includes('parent_idea_id')
        );
        expect(subInserts.length).toBe(1);
    });

    it('creates waiting_for entry when delegation detected', async () => {
        const analysis = {
            tipo: 'Tarea',
            categoria: 'Operaciones',
            resumen: 'Delegated task',
            accion_inmediata: 'Review report',
            confidence: 0.9,
            is_project: false,
            waiting_for: {
                delegated_to: 'jose',
                description: 'Waiting for report review',
            },
        };
        mockProcessIdea.mockResolvedValue(analysis);

        await processAndSaveIdea(1, 'Delegate review', 'gonzalo');

        const waitingInserts = mockRun.mock.calls.filter(c =>
            c[0].includes('INSERT INTO waiting_for')
        );
        expect(waitingInserts.length).toBe(1);
        expect(waitingInserts[0][1]).toContain('jose');
    });

    it('uses preComputedAnalysis when provided', async () => {
        const preComputed = {
            tipo: 'Nota',
            categoria: 'HSE',
            resumen: 'Pre-computed note',
            confidence: 0.95,
            is_project: false,
        };

        await processAndSaveIdea(1, 'Test', 'gonzalo', preComputed);

        // Should NOT call processIdea
        expect(mockProcessIdea).not.toHaveBeenCalled();
        // Should still update the idea
        expect(mockRun).toHaveBeenCalledWith(
            expect.stringContaining('UPDATE ideas SET'),
            expect.arrayContaining(['Nota', 'HSE'])
        );
    });

    it('handles AI errors gracefully', async () => {
        mockProcessIdea.mockRejectedValue(new Error('AI timeout'));

        const result = await processAndSaveIdea(1, 'Test', 'gonzalo');

        expect(result).toBeNull();
    });

    it('skips items with tipo Error', async () => {
        const analysis = {
            tipo: 'Error',
            confidence: 0,
        };
        mockProcessIdea.mockResolvedValue(analysis);

        const result = await processAndSaveIdea(1, 'Test', 'gonzalo');

        // Should not call UPDATE on the idea
        const updates = mockRun.mock.calls.filter(c => c[0].includes('UPDATE ideas SET'));
        expect(updates.length).toBe(0);
    });

    it('sets needs_review for low confidence', async () => {
        const analysis = {
            tipo: 'Tarea',
            categoria: 'Operaciones',
            resumen: 'Low confidence task',
            confidence: 0.3,
            is_project: false,
        };
        mockProcessIdea.mockResolvedValue(analysis);

        await processAndSaveIdea(1, 'Vague input', 'gonzalo');

        const updateCall = mockRun.mock.calls.find(c => c[0].includes('UPDATE ideas SET'));
        // needs_review should be 1 (true) when confidence < 0.6
        const params = updateCall[1];
        // Find the needs_review param (it's after ai_confidence)
        const confidenceIndex = params.indexOf(0.3);
        expect(params[confidenceIndex + 1]).toBe(1); // needs_review = 1
    });

    it('cleans text if texto_limpio differs from original', async () => {
        const analysis = {
            tipo: 'Tarea',
            categoria: 'Operaciones',
            resumen: 'Cleaned',
            texto_limpio: 'Cleaned text version',
            confidence: 0.9,
            is_project: false,
        };
        mockProcessIdea.mockResolvedValue(analysis);

        await processAndSaveIdea(1, 'Original messy text', 'gonzalo');

        const textUpdate = mockRun.mock.calls.find(c =>
            c[0].includes('UPDATE ideas SET text')
        );
        expect(textUpdate).toBeDefined();
        expect(textUpdate[1]).toContain('Cleaned text version');
    });
});
