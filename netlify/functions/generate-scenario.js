const Anthropic = require('@anthropic-ai/sdk');

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { scenarioType, language, currency } = JSON.parse(event.body);
        
        // Adapter selon la langue
        const isEnglish = language === 'en';
        const currencySymbol = currency === 'usd' ? '$' : '€';
        
        // Prompts multilingues
        const prompts = {
            fr: {
                system: "Tu es un expert en négociation. Crée des scénarios réalistes et engageants. Utilise un ton professionnel mais accessible.",
                user: `Crée un scénario de négociation ${scenarioType} en français.

Le scénario doit :
- Être réaliste et professionnel
- Contenir un contexte clair
- Définir ton rôle (Acheteur, Vendeur, Employé, etc.)
- Définir la situation avec un enjeu précis
- Mentionner un interlocuteur avec nom et fonction
- Utiliser ${currencySymbol} pour les montants

Format JSON requis :
{
  "context": "Description du contexte (2-3 phrases)",
  "your_role": "Ton rôle précis",
  "situation": "La situation de négociation (3-4 phrases)",
  "counterpart": "Nom et fonction de l'interlocuteur",
  "objective": "L'objectif à atteindre",
  "initial_relationship": 70
}

Scénarios à éviter : montants irréalistes, situations trop simples, conflits artificiels.`
            },
            en: {
                system: "You are a negotiation expert. Create realistic and engaging scenarios. Use a professional yet accessible tone.",
                user: `Create a ${scenarioType} negotiation scenario in English.

The scenario must:
- Be realistic and professional
- Contain clear context
- Define your role (Buyer, Seller, Employee, etc.)
- Define the situation with a specific stake
- Mention a counterpart with name and function
- Use ${currencySymbol} for amounts

Required JSON format:
{
  "context": "Context description (2-3 sentences)",
  "your_role": "Your precise role",
  "situation": "The negotiation situation (3-4 sentences)",
  "counterpart": "Name and function of the counterpart",
  "objective": "The objective to achieve",
  "initial_relationship": 70
}

Scenarios to avoid: unrealistic amounts, too simple situations, artificial conflicts.`
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

        const scenario = JSON.parse(jsonMatch[0]);

        return {
            statusCode: 200,
            body: JSON.stringify(scenario),
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
                error: 'Failed to generate scenario',
                details: error.message 
            })
        };
    }
};
