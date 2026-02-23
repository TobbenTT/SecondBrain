const fs = require('fs');
const path = require('path');

const APP_DIR = path.join(__dirname, '..');

describe('Orchestrator Integrity', () => {
    describe('Core files', () => {
        it('should have root layout', () => {
            expect(fs.existsSync(path.join(APP_DIR, 'app', 'layout.tsx'))).toBe(true);
        });

        it('should have home page', () => {
            expect(fs.existsSync(path.join(APP_DIR, 'app', 'page.tsx'))).toBe(true);
        });

        it('should have package.json', () => {
            expect(fs.existsSync(path.join(APP_DIR, 'package.json'))).toBe(true);
        });

        it('should have next.config.js', () => {
            expect(fs.existsSync(path.join(APP_DIR, 'next.config.js'))).toBe(true);
        });

        it('should have tsconfig.json', () => {
            expect(fs.existsSync(path.join(APP_DIR, 'tsconfig.json'))).toBe(true);
        });
    });

    describe('Module pages', () => {
        const modules = [
            'staffing',
            'training',
            'finance',
            'audit',
            'database',
            'skills-lab',
            'architecture',
        ];

        modules.forEach((mod) => {
            it(`should have ${mod} page`, () => {
                expect(fs.existsSync(path.join(APP_DIR, 'app', mod, 'page.tsx'))).toBe(true);
            });
        });
    });

    describe('API routes', () => {
        const apiRoutes = [
            'staffing',
            'training',
            'finance',
            'audit',
            'database',
            'skills',
        ];

        apiRoutes.forEach((route) => {
            it(`should have /api/${route} route`, () => {
                expect(fs.existsSync(path.join(APP_DIR, 'app', 'api', route, 'route.ts'))).toBe(true);
            });
        });
    });
});
