const express = require('express');
const { run, all } = require('../database');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const areas = await all(`SELECT a.*,
            COALESCE(ic.c, 0) as ideas_count,
            COALESCE(cc.c, 0) as context_count
            FROM areas a
            LEFT JOIN (SELECT related_area_id, count(*) as c FROM ideas GROUP BY related_area_id) ic ON ic.related_area_id = a.id
            LEFT JOIN (SELECT related_area_id, count(*) as c FROM context_items GROUP BY related_area_id) cc ON cc.related_area_id = a.id
            ORDER BY a.status, a.name`);
        res.json(areas);
    } catch (_err) {
        res.status(500).json({ error: 'Failed to fetch areas' });
    }
});

router.post('/', async (req, res) => {
    const { name, description, icon, horizon } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });
    try {
        await run('INSERT INTO areas (name, description, icon, horizon) VALUES (?, ?, ?, ?)',
            [name, description || '', icon || '📂', horizon || 'h2']);
        res.json({ success: true });
    } catch (_err) {
        res.status(500).json({ error: 'Failed to create area' });
    }
});

router.put('/:id', async (req, res) => {
    const { name, description, icon, horizon, status } = req.body;
    try {
        await run('UPDATE areas SET name = ?, description = ?, icon = ?, horizon = ?, status = ? WHERE id = ?',
            [name, description, icon, horizon, status, req.params.id]);
        res.json({ success: true });
    } catch (_err) {
        res.status(500).json({ error: 'Failed to update area' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await run('UPDATE areas SET status = "archived" WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (_err) {
        res.status(500).json({ error: 'Failed to archive area' });
    }
});

module.exports = router;
