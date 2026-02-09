exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }
    try {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            throw new Error('Clé API manquante');
        }
        const { scenarioType } = JSON.parse(event.body);
        const scenarioPrompts = {
            business: 'une négociation commerciale complexe',
            politics: 'une négociation diplomatique internationale',
            conflict: 'une médiation de conflit',
            career: 'une négociation de carrière',
            couple: 'une négociation de couple',
            family: 'une négociation familiale',
            selling: 'une négociation de vente',
            buying: 'une négociation achat',
            hostage: 'une négociation de crise'
        };
        const prompt = `Crée un scénario de négociation pour ${scenarioPrompts[scenarioType]}. Réponds UNIQUEMENT en JSON: {"title":"titre","context":"contexte","player":{"name":"nom","avatar":"emoji","goal":"objectif"},"opponent":{"name":"nom","avatar":"emoji","goal":"objectif","personality":"trait"},"steps":[{"narrative":"texte","dialogue":"texte","situation":"texte","pressure":40,"relationship":60}]}. Crée 5 étapes.`;
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 5000,
                messages: [{ role: 'user', content: prompt }]
            })
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API erreur: ${response.status}`);
        }
        const data = await response.json();
        const content = data.content.find(c => c.type === 'text')?.text || '';
        let jsonText = content.trim().replace(/```json\s*/g, '').replace(/```\s*/g, '');
        const firstBrace = jsonText.indexOf('{');
        if (firstBrace > 0) jsonText = jsonText.substring(firstBrace);
        const lastBrace = jsonText.lastIndexOf('}');
        if (lastBrace !== -1) jsonText = jsonText.substring(0, lastBrace + 1);
        const scenario = JSON.parse(jsonText);
        if (!scenario.title || !scenario.steps) {
            throw new Error('JSON invalide');
        }
        return { statusCode: 200, headers, body: JSON.stringify({ success: true, scenario }) };
    } catch (error) {
        console.error('Erreur:', error);
        return { statusCode: 500, headers, body: JSON.stringify({ success: false, error: error.message }) };
    }
};
