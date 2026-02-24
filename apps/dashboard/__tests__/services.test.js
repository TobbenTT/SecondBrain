/**
 * Tests for service modules: ai.js, orchestratorBridge.js, researchAgent.js, reviewAgent.js
 * All Gemini API calls are mocked.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// Mock setup
// ═══════════════════════════════════════════════════════════════════════════════

// Mock Gemini API
const mockSendMessage = jest.fn();
const mockGenerateContent = jest.fn();
const mockStartChat = jest.fn().mockReturnValue({ sendMessage: mockSendMessage });
const mockGetGenerativeModel = jest.fn().mockReturnValue({
    startChat: mockStartChat,
    generateContent: mockGenerateContent,
});

jest.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: mockGetGenerativeModel,
    })),
}));

// Mock logger
jest.mock('../helpers/logger', () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
}));

// Mock Ollama client (returns null to trigger Gemini fallback)
jest.mock('../services/ollamaClient', () => ({
    generate: jest.fn().mockResolvedValue(null),
    chat: jest.fn().mockResolvedValue(null),
    OLLAMA_URL: 'http://localhost:11434',
    OLLAMA_MODEL: 'llama3',
}));

// Mock fs for ai.js error logging
jest.mock('fs', () => {
    const actual = jest.requireActual('fs');
    return {
        ...actual,
        appendFileSync: jest.fn(),
        existsSync: jest.fn().mockReturnValue(true),
        mkdirSync: jest.fn(),
        readFileSync: jest.fn().mockReturnValue('# Mock skill content'),
    };
});

// Ensure GEMINI_API_KEY is set so model gets created
process.env.GEMINI_API_KEY = 'test-key-for-mock';

// ═══════════════════════════════════════════════════════════════════════════════
// AI Service
// ═══════════════════════════════════════════════════════════════════════════════

const aiService = require('../services/ai');

describe('AI Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Clear response cache between tests to avoid stale results
        aiService._clearResponseCache?.();
    });

    describe('generateResponse', () => {
        it('returns AI response text', async () => {
            mockSendMessage.mockResolvedValue({
                response: { text: () => 'Respuesta del AI' },
            });

            const result = await aiService.generateResponse('Hola', []);
            expect(result).toBe('Respuesta del AI');
        });

        it('passes chat history correctly', async () => {
            mockSendMessage.mockResolvedValue({
                response: { text: () => 'response' },
            });

            await aiService.generateResponse('test', [
                { role: 'user', message: 'hello' },
                { role: 'model', message: 'hi' },
            ]);

            const chatConfig = mockStartChat.mock.calls[0][0];
            expect(chatConfig.history).toHaveLength(2);
            expect(chatConfig.history[0].role).toBe('user');
            expect(chatConfig.history[1].role).toBe('model');
        });

        it('returns error message on failure', async () => {
            mockSendMessage.mockRejectedValue(new Error('API down'));

            const result = await aiService.generateResponse('test');
            expect(result).toContain('error');
        });

        it('accepts custom system instruction', async () => {
            mockSendMessage.mockResolvedValue({
                response: { text: () => 'custom response' },
            });

            await aiService.generateResponse('test', [], 'Custom instruction');
            const chatConfig = mockStartChat.mock.calls[0][0];
            expect(chatConfig.systemInstruction.parts[0].text).toBe('Custom instruction');
        });
    });

    describe('processIdea', () => {
        it('returns parsed JSON for a single idea', async () => {
            const mockResult = {
                tipo: 'Tarea',
                categoria: 'Operaciones',
                resumen: 'Test task',
                accion_inmediata: 'Do something',
                confidence: 0.9,
                suggested_agent: 'staffing',
                suggested_skills: [],
            };

            mockGenerateContent.mockResolvedValue({
                response: { text: () => JSON.stringify(mockResult) },
            });

            const result = await aiService.processIdea('Test idea');
            expect(result.tipo).toBe('Tarea');
            expect(result.categoria).toBe('Operaciones');
            expect(result.confidence).toBe(0.9);
        });

        it('returns array for multiple ideas', async () => {
            const mockResults = [
                { tipo: 'Tarea', categoria: 'Operaciones', confidence: 0.8 },
                { tipo: 'Nota', categoria: 'HSE', confidence: 0.7 },
            ];

            mockGenerateContent.mockResolvedValue({
                response: { text: () => JSON.stringify(mockResults) },
            });

            const result = await aiService.processIdea('Two ideas');
            expect(Array.isArray(result)).toBe(true);
            expect(result).toHaveLength(2);
        });

        it('strips markdown code fences from response', async () => {
            const json = { tipo: 'Tarea', categoria: 'Finanzas', confidence: 0.9 };

            mockGenerateContent.mockResolvedValue({
                response: { text: () => '```json\n' + JSON.stringify(json) + '\n```' },
            });

            const result = await aiService.processIdea('Test');
            expect(result.tipo).toBe('Tarea');
        });

        it('sets needs_review for low confidence', async () => {
            const json = { tipo: 'Tarea', confidence: 0.3 };

            mockGenerateContent.mockResolvedValue({
                response: { text: () => JSON.stringify(json) },
            });

            const result = await aiService.processIdea('Vague input');
            expect(result.needs_review).toBe(true);
        });

        it('maps category to agent deterministically', async () => {
            const json = {
                tipo: 'Tarea',
                categoria: 'Operaciones',
                confidence: 0.9,
                suggested_agent: null,
            };

            mockGenerateContent.mockResolvedValue({
                response: { text: () => JSON.stringify(json) },
            });

            const result = await aiService.processIdea('Staffing task');
            expect(result.suggested_agent).toBe('staffing');
            expect(result.suggested_skills.length).toBeGreaterThan(0);
        });

        it('returns error object on API failure', async () => {
            mockGenerateContent.mockRejectedValue(new Error('API timeout'));

            const result = await aiService.processIdea('Test');
            expect(result.tipo).toBe('Error');
            expect(result.confidence).toBe(0);
            expect(result.needs_review).toBe(true);
        });

        it('handles malformed JSON response', async () => {
            mockGenerateContent.mockResolvedValue({
                response: { text: () => 'This is not JSON at all' },
            });

            const result = await aiService.processIdea('Test');
            expect(result.tipo).toBe('Error');
        });
    });

    describe('distillContent', () => {
        it('returns parsed distillation result', async () => {
            const mockResult = {
                insight_principal: 'Key insight',
                accion_clave: 'Take action',
                conexiones: ['Area 1'],
                resumen_destilado: 'Summary',
            };

            mockGenerateContent.mockResolvedValue({
                response: { text: () => JSON.stringify(mockResult) },
            });

            const result = await aiService.distillContent('Long text to distill');
            expect(result.insight_principal).toBe('Key insight');
            expect(result.conexiones).toHaveLength(1);
        });

        it('returns fallback on API error', async () => {
            mockGenerateContent.mockRejectedValue(new Error('fail'));

            const result = await aiService.distillContent('text');
            expect(result.insight_principal).toContain('No se pudo');
            expect(result.accion_clave).toContain('Revisar');
        });
    });

    describe('autoAssign', () => {
        it('returns assignment result', async () => {
            const mockResult = {
                assigned_to: 'gonzalo',
                reason: 'Expert in operations',
                estimated_time: '4 horas',
                priority: 'alta',
            };

            mockGenerateContent.mockResolvedValue({
                response: { text: () => JSON.stringify(mockResult) },
            });

            const users = [
                { username: 'gonzalo', role: 'manager', department: 'Ops', expertise: 'Operations' },
            ];
            const result = await aiService.autoAssign('Review shifts', users);
            expect(result.assigned_to).toBe('gonzalo');
        });

        it('returns fallback on error', async () => {
            mockGenerateContent.mockRejectedValue(new Error('fail'));

            const result = await aiService.autoAssign('task', []);
            expect(result.assigned_to).toBeNull();
            expect(result.priority).toBe('media');
        });
    });

    describe('generateDigest', () => {
        it('returns markdown digest text', async () => {
            mockGenerateContent.mockResolvedValue({
                response: { text: () => '## Resumen\nTodo bien.' },
            });

            const result = await aiService.generateDigest([], [], '', []);
            expect(result).toContain('Resumen');
        });

        it('returns error message on failure', async () => {
            mockGenerateContent.mockRejectedValue(new Error('fail'));

            const result = await aiService.generateDigest([], [], '', []);
            expect(result).toContain('Error');
        });
    });

    describe('executeWithAgent', () => {
        it('returns success with output', async () => {
            mockSendMessage.mockResolvedValue({
                response: { text: () => '## Plan de Dotacion\nContenido...' },
            });

            const result = await aiService.executeWithAgent(
                'Plan staffing', 'staffing', ['# Skill content'], 'context'
            );
            expect(result.success).toBe(true);
            expect(result.output).toContain('Plan de Dotacion');
        });

        it('returns failure on error', async () => {
            mockSendMessage.mockRejectedValue(new Error('timeout'));

            const result = await aiService.executeWithAgent(
                'Plan', 'staffing', [], ''
            );
            expect(result.success).toBe(false);
            expect(result.error).toBeTruthy();
        });
    });

    describe('decomposeProject', () => {
        it('returns decomposed sub-tasks', async () => {
            const mockResult = {
                project_name: 'Test Project',
                objetivo: 'Test objective',
                sub_tasks: [
                    { texto: 'Task 1', assigned_to: 'gonzalo', es_proxima_accion: true },
                    { texto: 'Task 2', assigned_to: 'jose', es_proxima_accion: false },
                ],
            };

            mockGenerateContent.mockResolvedValue({
                response: { text: () => JSON.stringify(mockResult) },
            });

            const result = await aiService.decomposeProject('Complex project');
            expect(result.sub_tasks).toHaveLength(2);
            expect(result.project_name).toBe('Test Project');
        });

        it('returns null on error', async () => {
            mockGenerateContent.mockRejectedValue(new Error('fail'));

            const result = await aiService.decomposeProject('project');
            expect(result).toBeNull();
        });
    });

    describe('generateDailyReport', () => {
        it('returns markdown report', async () => {
            mockGenerateContent.mockResolvedValue({
                response: { text: () => '# Reporte\n## Resumen del Dia\nContenido' },
            });

            const data = {
                ideas: [],
                projects: [],
                waitingFor: [],
                completedToday: [],
                userStats: [],
                areas: [],
            };
            const result = await aiService.generateDailyReport(data);
            expect(result).toContain('Reporte');
        });

        it('returns error message on failure', async () => {
            mockGenerateContent.mockRejectedValue(new Error('fail'));

            const data = {
                ideas: [],
                projects: [],
                waitingFor: [],
                completedToday: [],
                userStats: [],
                areas: [],
            };
            const result = await aiService.generateDailyReport(data);
            expect(result).toContain('Error');
        });
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Orchestrator Bridge
// ═══════════════════════════════════════════════════════════════════════════════

jest.mock('child_process', () => ({
    exec: jest.fn(),
}));

const { exec } = require('child_process');
const { executeCommand } = require('../services/orchestratorBridge');

describe('OrchestratorBridge', () => {
    beforeEach(() => jest.clearAllMocks());

    it('opens project folder', async () => {
        exec.mockImplementation((_cmd, callback) => callback(null, 'ok', ''));

        const result = await executeCommand('open-project', ['C:\\Projects\\test']);
        expect(result.success).toBe(true);
        expect(exec).toHaveBeenCalled();
    });

    it('rejects open-project without path', async () => {
        await expect(executeCommand('open-project', [])).rejects.toThrow('No path provided');
    });

    it('rejects unknown commands', async () => {
        await expect(executeCommand('hack-system')).rejects.toThrow('Unknown command');
    });

    it('rejects script names with directory traversal', async () => {
        await expect(executeCommand('run-script', ['../../../etc/passwd']))
            .rejects.toThrow('Invalid script name');
    });

    it('rejects script names with path separators', async () => {
        await expect(executeCommand('run-script', ['sub/script.bat']))
            .rejects.toThrow('Invalid script name');
        await expect(executeCommand('run-script', ['sub\\script.bat']))
            .rejects.toThrow('Invalid script name');
    });

    it('handles exec errors gracefully', async () => {
        exec.mockImplementation((_cmd, callback) =>
            callback(new Error('Process failed'), '', 'error output'));

        const result = await executeCommand('open-project', ['C:\\test']);
        expect(result.success).toBe(false);
        expect(result.error).toContain('Process failed');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Research Agent
// ═══════════════════════════════════════════════════════════════════════════════

const { researchTopic } = require('../services/researchAgent');

describe('Research Agent', () => {
    beforeEach(() => jest.clearAllMocks());

    it('returns research result', async () => {
        mockSendMessage.mockResolvedValue({
            response: { text: () => '# Analisis\n## Hallazgos\nResultados aqui' },
        });

        const result = await researchTopic('Node.js best practices');
        expect(result).toContain('Analisis');
    });

    it('returns error message on failure', async () => {
        mockSendMessage.mockRejectedValue(new Error('API error'));

        const result = await researchTopic('test query');
        expect(result).toContain('Error');
    });

    it('includes context in chat history', async () => {
        mockSendMessage.mockResolvedValue({
            response: { text: () => 'result' },
        });

        await researchTopic('query', 'some context');
        // Verify startChat was called with history containing context
        const chatConfig = mockStartChat.mock.calls[0][0];
        expect(chatConfig.history[0].parts[0].text).toContain('some context');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Review Agent
// ═══════════════════════════════════════════════════════════════════════════════

const { generateWeeklyReview } = require('../services/reviewAgent');

describe('Review Agent', () => {
    beforeEach(() => jest.clearAllMocks());

    it('returns weekly review markdown', async () => {
        mockGenerateContent.mockResolvedValue({
            response: { text: () => '# Revision Semanal\n## Logros\n- Task done' },
        });

        const ideas = [
            { created_at: '2024-01-15', text: 'Test idea', status: 'processed' },
        ];
        const result = await generateWeeklyReview(ideas);
        expect(result).toContain('Revision Semanal');
    });

    it('returns error message on failure', async () => {
        mockGenerateContent.mockRejectedValue(new Error('fail'));

        const result = await generateWeeklyReview([]);
        expect(result).toContain('Error');
    });

    it('maps ideas to text format', async () => {
        mockGenerateContent.mockResolvedValue({
            response: { text: () => 'review' },
        });

        const ideas = [
            { created_at: '2024-01-15', text: 'Idea 1', status: 'active' },
            { created_at: '2024-01-16', text: 'Idea 2', status: 'done' },
        ];
        await generateWeeklyReview(ideas);

        const callArg = mockGenerateContent.mock.calls[0][0];
        const promptText = callArg.contents[0].parts[0].text;
        expect(promptText).toContain('Idea 1');
        expect(promptText).toContain('Idea 2');
    });
});
