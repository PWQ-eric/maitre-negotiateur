const Anthropic = require('@anthropic-ai/sdk');

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { scenario, previousChoices, relationship, language } = JSON.parse(event.body);
        
        const isEnglish = language === 'en';
        
        // Construire l'historique
        let history = '';
        if (previousChoices && previousChoices.length > 0) {
            history = isEnglish 
                ? '\n\nPrevious choices made:\n' + previousChoices.map((c, i) => `${i + 1}. ${c}`).join('\n')
                : '\n\nChoix précédents effectués :\n' + previousChoices.map((c, i) => `${i + 1}. ${c}`).join('\n');
        }

        // Prompts multilingues
        const prompts = {
            fr: {
                system: "Tu es un expert en négociation. Génère des choix stratégiques réalistes basés sur des techniques de négociation éprouvées.",
                user: `Situation : ${scenario.situation}
Relation actuelle : ${relationship}%${history}

Génère 4 choix de négociation DIFFÉRENTS. Chaque choix doit :
- Être une phrase d'action concrète (pas de description)
- Utiliser une technique différente (empathie, ancrage, BATNA, concession, etc.)
- Avoir un impact distinct sur la relation et la pression

Format JSON requis :
{
  "choices": [
    {
      "text": "Action concrète à entreprendre",
      "technique": "Nom de la technique utilisée",
      "relationship_impact": -10 à +10,
      "pressure_impact": -15 à +15,
      "score_potential": 50 à 150
    }
  ]
}

Les 4 choix doivent représenter différentes approches (collaborative, assertive, conciliante, créative).`
            },
            en: {
                system: "You are a negotiation expert. Generate realistic strategic choices based on proven negotiation techniques.",
                user: `Situation: ${scenario.situation}
Current relationship: ${relationship}%${history}

Generate 4 DIFFERENT negotiation choices. Each choice must:
- Be a concrete action phrase (not a description)
- Use a different technique (empathy, anchoring, BATNA, concession, etc.)
- Have a distinct impact on relationship and pressure

Required JSON format:
{
  "choices": [
    {
      "text": "Concrete action to take",
      "technique": "Name of technique used",
      "relationship_impact": -10 to +10,
      "pressure_impact": -15 to +15,
      "score_potential": 50 to 150
    }
  ]
}

The 4 choices must represent different approaches (collaborative, assertive, conciliatory, creative).`
            }
        };
        
        const promptSet = isEnglish ? prompts.en : prompts.fr;

        const anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY
        });

        const message = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1024,
            system: promptSet.system,
            messages: [{
                role: 'user',
                content: promptSet.user
            }]
        });

        const responseText = message.content[0].text;
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        
        if (!jsonMatch) {
            throw new Error('Invalid response format');
        }

        const data = JSON.parse(jsonMatch[0]);

        return {
            statusCode: 200,
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        };

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: 'Failed to generate choices',
                details: error.message 
            })
        };
    }
};
