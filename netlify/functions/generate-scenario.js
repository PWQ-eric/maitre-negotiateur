Voici le code complet pour generate-scenario.js :
javascriptexports.handler = async (event, context) => {
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
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        
        if (!apiKey) {
            throw new Error('Clé API manquante. Configurez ANTHROPIC_API_KEY dans Netlify.');
        }

        const { scenarioType } = JSON.parse(event.body);

        const scenarioPrompts = {
            business: 'une négociation commerciale complexe entre deux entreprises',
            politics: 'une négociation diplomatique internationale',
            conflict: 'une médiation de conflit complexe',
            career: 'une négociation de carrière importante',
            couple: 'une négociation de couple délicate',
            family: 'une négociation familiale complexe',
            selling: 'une négociation de vente',
            buying: 'une négociation d\'achat',
            hostage: 'une négociation de crise lors d\'une prise d\'otage'
        };

        const prompt = `Tu es un expert en négociation. Crée un scénario de négociation immersif et narratif pour ${scenarioPrompts[scenarioType]}. Le scénario doit être présenté comme un livre dont vous êtes le héros avec des personnages nommés et caractérisés, des dialogues réalistes, une narration vivante et des enjeux émotionnels. STRUCTURE JSON REQUISE (réponds UNIQUEMENT en JSON, sans texte avant/après) : {"title": "Titre accrocheur du scénario", "context": "Mise en contexte narrative (5-6 phrases)", "scene_image_prompt": "Prompt pour générer une image de la scène principale (en anglais)", "player": {"name": "Votre nom/rôle", "avatar": "emoji représentant le joueur", "goal": "Votre objectif principal"}, "opponent": {"name": "Nom de l'interlocuteur principal", "avatar": "emoji représentant l'opposant", "goal": "Son objectif principal", "personality": "Trait de personnalité dominant"}, "steps": [{"narrative": "Narration de ce qui se passe (2-3 phrases, style narratif)", "dialogue": "Ce que dit votre interlocuteur (dialogue direct, 2-3 phrases)", "thought": "Votre réflexion interne (optionnel, 1-2 phrases)", "situation": "État de la négociation et enjeux actuels (3-4 phrases détaillées)", "image_prompt": "Prompt pour image montrant cette étape (en anglais)", "pressure": 40, "relationship": 60}]}. IMPORTANT : Utilisez des guillemets simples dans tous les textes. Les dialogues doivent être réalistes et refléter la personnalité. La narration doit créer une atmosphère immersive. Crée exactement 5 étapes. Pressure et relationship sont des valeurs entre 0 et 100. Chaque étape fait progresser l'histoire.`;

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
                messages: [
                    { role: 'user', content: prompt }
                ]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Claude erreur: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const content = data.content.find(c => c.type === 'text')?.text || '';
        
        let jsonText = content.trim();
        jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
        
        const firstBrace = jsonText.indexOf('{');
        if (firstBrace > 0) {
            jsonText = jsonText.substring(firstBrace);
        }
        
        const lastBrace = jsonText.lastIndexOf('}');
        if (lastBrace !== -1 && lastBrace < jsonText.length - 1) {
            jsonText = jsonText.substring(0, lastBrace + 1);
        }

        const scenario = JSON.parse(jsonText);
        
        if (!scenario.title || !scenario.steps || scenario.steps.length === 0) {
            throw new Error('Structure JSON invalide');
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, scenario })
        };

    } catch (error) {
        console.error('Erreur:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                success: false, 
                error: error.message 
            })
        };
    }
};
