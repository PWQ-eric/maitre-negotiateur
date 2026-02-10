javascriptconst Anthropic = require('@anthropic-ai/sdk');

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { 
            situation, 
            dialogue, 
            techniques, 
            playerName, 
            opponentName, 
            opponentPersonality,
            language 
        } = JSON.parse(event.body);
        
        const isEnglish = language === 'en';
        
        // Construire le contexte des techniques utilisées
        let techniquesContext = '';
        if (techniques && techniques.length > 0) {
            techniquesContext = isEnglish 
                ? `\n\nTechniques already used: ${techniques.join(', ')}`
                : `\n\nTechniques déjà utilisées : ${techniques.join(', ')}`;
        }

        // Construire le dialogue
        let dialogueContext = '';
        if (dialogue) {
            dialogueContext = isEnglish 
                ? `\n\nCurrent dialogue:\n${dialogue}`
                : `\n\nDialogue actuel :\n${dialogue}`;
        }

        // Prompts multilingues
        const prompts = {
            fr: {
                system: "Tu es un expert en négociation. Génère des choix stratégiques réalistes basés sur des techniques de négociation éprouvées. Les choix doivent être adaptés à la personnalité de l'interlocuteur et à la situation.",
                user: `Situation de négociation :
${situation}

Personnages :
- Joueur : ${playerName}
- Interlocuteur : ${opponentName}${opponentPersonality ? ` (Personnalité : ${opponentPersonality})` : ''}
${dialogueContext}
${techniquesContext}

Génère 4 choix de négociation DIFFÉRENTS. Chaque choix doit :
- Être une phrase d'action concrète que ${playerName} peut dire ou faire
- Utiliser une technique de négociation différente (empathie tactique, ancrage, BATNA, concession stratégique, recadrage, silence stratégique, questions ouvertes, etc.)
- Éviter de réutiliser les techniques déjà employées
- Tenir compte de la personnalité de ${opponentName}
- Avoir un impact distinct sur la relation et la pression

Format JSON STRICT requis :
{
  "choices": [
    {
      "text": "Ce que ${playerName} dit ou fait (phrase directe, max 150 caractères)",
      "technique": "Nom de la technique utilisée",
      "relationship_impact": nombre entre -10 et +10,
      "pressure_impact": nombre entre -15 et +15,
      "score_potential": nombre entre 50 et 150
    }
  ]
}

IMPORTANT : 
- Les 4 choix doivent représenter des approches variées (collaborative, assertive, conciliante, créative)
- Adapte les choix à la personnalité de l'interlocuteur
- Retourne UNIQUEMENT le JSON, sans texte avant ou après`
            },
            en: {
                system: "You are a negotiation expert. Generate realistic strategic choices based on proven negotiation techniques. Choices must be adapted to the counterpart's personality and the situation.",
                user: `Negotiation situation:
${situation}

Characters:
- Player: ${playerName}
- Counterpart: ${opponentName}${opponentPersonality ? ` (Personality: ${opponentPersonality})` : ''}
${dialogueContext}
${techniquesContext}

Generate 4 DIFFERENT negotiation choices. Each choice must:
- Be a concrete action phrase that ${playerName} can say or do
- Use a different negotiation technique (tactical empathy, anchoring, BATNA, strategic concession, reframing, strategic silence, open questions, etc.)
- Avoid reusing techniques already employed
- Take into account ${opponentName}'s personality
- Have a distinct impact on relationship and pressure

STRICT JSON format required:
{
  "choices": [
    {
      "text": "What ${playerName} says or does (direct phrase, max 150 characters)",
      "technique": "Name of technique used",
      "relationship_impact": number between -10 and +10,
      "pressure_impact": number between -15 and +15,
      "score_potential": number between 50 and 150
    }
  ]
}

IMPORTANT:
- The 4 choices must represent varied approaches (collaborative, assertive, conciliatory, creative)
- Adapt choices to the counterpart's personality
- Return ONLY the JSON, with no text before or after`
            }
        };
        
        const promptSet = isEnglish ? prompts.en : prompts.fr;

        const anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY
        });

        const message = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1500,
            system: promptSet.system,
            messages: [{
                role: 'user',
                content: promptSet.user
            }]
        });

        const responseText = message.content[0].text;
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        
        if (!jsonMatch) {
            console.error('Invalid response format:', responseText);
            throw new Error('Invalid response format from AI');
        }

        const data = JSON.parse(jsonMatch[0]);

        // Validation basique
        if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
            throw new Error('Invalid choices format');
        }

        return {
            statusCode: 200,
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        };

    } catch (error) {
        console.error('Error generating choices:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: 'Failed to generate choices',
                details: error.message 
            })
        };
    }
};
