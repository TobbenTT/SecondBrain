import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import fs from 'fs';
import path from 'path';

// =============================================
// SKILL SOURCES:
// 1. LOCAL:  ./externo/skills/  (for offline demo)
// 2. GITHUB: github.com/TobbenTT/orchestrator-skills (private repo)
// =============================================

const EXTERNO_DIR = path.join(process.cwd(), 'externo', 'skills');
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const GITHUB_REPO = process.env.GITHUB_REPO || 'TobbenTT/orchestrator-skills';
const GITHUB_SKILLS_PATH = process.env.GITHUB_SKILLS_PATH || 'skills';

interface SkillParsed {
    title: string;
    description: string;
    skill_id: string;
    version: string;
    author: string;
    source: string;
    category: string;
    requires: string;
    sql: string;
}

function parseSkillMetadata(content: string): SkillParsed {
    const lines = content.split('\n');
    let title = '';
    let description = '';
    let skill_id = '';
    let version = '';
    let author = '';
    let source = '';
    let category = '';
    let requires = '';
    let sqlQuery = '';
    let inSql = false;
    let sqlBlock = '';

    for (const line of lines) {
        if (line.startsWith('# Skill:') || line.startsWith('# ')) {
            if (!title) title = line.replace(/^#+\s*(?:Skill:\s*)?/, '').trim();
        }
        if (line.startsWith('- **skill_id**:') || line.startsWith('- **skill-id**:')) skill_id = line.split(':').slice(1).join(':').trim().replace(/\*\*/g, '');
        if (line.startsWith('- **version**:')) version = line.split(':').slice(1).join(':').trim().replace(/\*\*/g, '');
        if (line.startsWith('- **author**:')) author = line.split(':').slice(1).join(':').trim().replace(/\*\*/g, '');
        if (line.startsWith('- **source**:')) source = line.split(':').slice(1).join(':').trim().replace(/\*\*/g, '');
        if (line.startsWith('- **category**:') || line.startsWith('- **categoría**:')) category = line.split(':').slice(1).join(':').trim().replace(/\*\*/g, '');
        if (line.startsWith('- **requires**:') || line.startsWith('- **tablas**:')) requires = line.split(':').slice(1).join(':').trim().replace(/\*\*/g, '');
        if (line.match(/^## Descripci[oó]n/)) {
            const idx = lines.indexOf(line);
            if (idx + 1 < lines.length) description = lines[idx + 1].trim();
        }

    }

    // Extract SQL using Regex (more robust)
    const sqlMatch = content.match(/```sql\s*([\s\S]*?)```/i);
    if (sqlMatch) {
        sqlQuery = sqlMatch[1].trim();
    }

    // Fallbacks
    if (!skill_id && title) skill_id = title.toLowerCase().replace(/\s+/g, '-').substring(0, 30);
    if (!source) source = `github.com/${GITHUB_REPO}`;
    if (!category) category = 'General';
    if (!version) version = '1.0.0';
    if (!author) author = 'Unknown';

    return { title, description, skill_id, version, author, source, category, requires, sql: sqlQuery };
}

// =============================================
// GITHUB: List files recursively from repo
// =============================================
async function listGitHubSkills(): Promise<Array<{ filename: string; path: string; size: number; subfolder: string }>> {
    const skills: Array<{ filename: string; path: string; size: number; subfolder: string }> = [];

    async function fetchDir(dirPath: string, subfolder: string) {
        const res = await fetch(
            `https://api.github.com/repos/${GITHUB_REPO}/contents/${dirPath}`,
            {
                headers: {
                    'Authorization': `Bearer ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github+json',
                    'X-GitHub-Api-Version': '2022-11-28',
                },
                cache: 'no-store',
            }
        );
        if (!res.ok) return;
        const items = await res.json() as Array<{ name: string; path: string; size: number; type: string }>;
        for (const item of items) {
            if (item.type === 'file' && item.name.endsWith('.md')) {
                skills.push({ filename: item.name, path: item.path, size: item.size, subfolder });
            } else if (item.type === 'dir') {
                await fetchDir(item.path, item.name);
            }
        }
    }

    await fetchDir(GITHUB_SKILLS_PATH, '');
    return skills;
}

async function fetchGitHubSkillContent(filePath: string): Promise<string> {
    const res = await fetch(
        `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`,
        {
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.raw',
                'X-GitHub-Api-Version': '2022-11-28',
            },
            cache: 'no-store',
        }
    );
    if (!res.ok) throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
    return await res.text();
}

// =============================================
// GET: List all skills (supports ?source=local|github)
// =============================================
export async function GET(req: NextRequest) {
    try {
        const source = req.nextUrl.searchParams.get('source') || 'github';

        if (source === 'github' && GITHUB_TOKEN) {
            const startTime = Date.now();
            const files = await listGitHubSkills();
            const latency = Date.now() - startTime;

            const skills = await Promise.all(
                files.map(async (file) => {
                    try {
                        const content = await fetchGitHubSkillContent(file.path);
                        const parsed = parseSkillMetadata(content);
                        return {
                            filename: file.filename,
                            filepath: file.path,
                            subfolder: file.subfolder,
                            ...parsed,
                            raw: content,
                            size: file.size,
                        };
                    } catch {
                        return null;
                    }
                })
            );

            return NextResponse.json({
                skills: skills.filter(Boolean),
                source: 'github',
                repo: GITHUB_REPO,
                latency_ms: latency,
                github_connected: true,
            });
        }

        // Fallback: local
        if (!fs.existsSync(EXTERNO_DIR)) {
            return NextResponse.json({ skills: [], source: 'local', error: 'Directorio externo no encontrado', github_connected: !!GITHUB_TOKEN });
        }

        const getFilesRecursive = (dir: string, baseDir: string): { filename: string; path: string; subfolder: string; size: number }[] => {
            let results: { filename: string; path: string; subfolder: string; size: number }[] = [];
            const list = fs.readdirSync(dir);

            for (const file of list) {
                const fullPath = path.join(dir, file);
                const stat = fs.statSync(fullPath);

                if (stat && stat.isDirectory()) {
                    results = results.concat(getFilesRecursive(fullPath, baseDir));
                } else if (file.endsWith('.md')) {
                    // Calc relative subfolder
                    const relDir = path.relative(baseDir, dir);
                    results.push({
                        filename: file,
                        path: fullPath,
                        subfolder: relDir,
                        size: stat.size
                    });
                }
            }
            return results;
        };

        const localFiles = getFilesRecursive(EXTERNO_DIR, EXTERNO_DIR);
        const skills = localFiles.map(file => {
            const content = fs.readFileSync(file.path, 'utf-8');
            const parsed = parseSkillMetadata(content);
            return {
                filename: file.filename,
                filepath: `externo/skills/${file.subfolder ? file.subfolder + '/' : ''}${file.filename}`,
                subfolder: file.subfolder,
                ...parsed,
                raw: content,
                size: file.size,
            };
        });

        return NextResponse.json({ skills, source: 'local', github_connected: !!GITHUB_TOKEN });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}

// =============================================
// POST: Fetch or execute a skill
// =============================================
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        if (body.action === 'fetch_skill') {
            const startTime = Date.now();
            let content: string;
            let actualSource: string;

            if (body.source === 'github' && GITHUB_TOKEN) {
                // Fetch from GitHub private repo
                content = await fetchGitHubSkillContent(body.filepath || `${GITHUB_SKILLS_PATH}/${body.filename}`);
                actualSource = `https://github.com/${GITHUB_REPO}/blob/main/${body.filepath || body.filename}`;
            } else {
                // Fetch from local
                const filePath = path.join(EXTERNO_DIR, body.filename);
                if (!fs.existsSync(filePath)) {
                    return NextResponse.json({ error: 'Skill no encontrada' }, { status: 404 });
                }
                content = fs.readFileSync(filePath, 'utf-8');
                actualSource = filePath;
            }

            const parsed = parseSkillMetadata(content);
            const latency = Date.now() - startTime;

            // Log the fetch
            const db = getDb();
            db.prepare("INSERT INTO audit_log (modulo, accion, detalle) VALUES ('SKILLS', 'FETCH', ?)").run(
                `Skill "${parsed.title}" (${parsed.skill_id} v${parsed.version}) descargada desde ${body.source === 'github' ? 'GitHub' : 'local'}`
            );

            return NextResponse.json({
                skill: { ...parsed, raw: content },
                fetch_log: {
                    timestamp: new Date().toISOString(),
                    source: actualSource,
                    from: body.source === 'github' ? `GitHub (${GITHUB_REPO})` : 'Local (externo/)',
                    status: 200,
                    latency_ms: latency,
                    size_bytes: content.length,
                }
            });
        }

        if (body.action === 'execute_skill') {
            const db = getDb();
            const sql = body.sql?.trim();

            if (!sql) {
                return NextResponse.json({ error: 'No SQL query provided' }, { status: 400 });
            }

            // Only allow SELECT queries for safety - strip comments first
            const sqlNoComments = sql.replace(/--.*$/gm, '').trim();
            if (!sqlNoComments.toUpperCase().startsWith('SELECT')) {
                return NextResponse.json({ error: 'Solo se permiten consultas SELECT por seguridad' }, { status: 400 });
            }

            const startTime = Date.now();
            const results = db.prepare(sql).all();
            const queryMs = Date.now() - startTime;

            // Log execution
            db.prepare("INSERT INTO audit_log (modulo, accion, detalle) VALUES ('SKILLS', 'EXECUTE', ?)").run(
                `Skill "${body.skill_name}" ejecutada — ${results.length} registros en ${queryMs}ms`
            );

            return NextResponse.json({
                results,
                execution_log: {
                    timestamp: new Date().toISOString(),
                    skill: body.skill_name,
                    rows_returned: results.length,
                    query_ms: queryMs,
                }
            });
        }

        return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
