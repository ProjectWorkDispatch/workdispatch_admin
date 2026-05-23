'use strict';

import Category from '../Categories/category.model.js';

export const estimateBudgetAI = async (req, res) => {
    try {
        const { title, description, categoryId, address } = req.body;

        if (!title || !description || !categoryId || !address) {
            return res.status(400).json({
                success: false,
                message: 'Se requieren: title, description, categoryId y address'
            });
        }

        const category = await Category.findById(categoryId);
        const categoryName = category ? category.name : 'Servicio general';

        const prompt = `Eres un experto en precios de servicios del hogar y construcción en Guatemala.
            Analiza la siguiente solicitud de servicio y proporciona una estimación de presupuesto realista en Quetzales (GTQ).

            Datos de la solicitud:
            - Título: ${title}
            - Categoría: ${categoryName}
            - Dirección: ${address}
            - Descripción: ${description}

            Responde ÚNICAMENTE con un objeto JSON válido con esta estructura exacta, sin texto adicional ni markdown:
            {
            "budgetMin": <número entero en GTQ>,
            "budgetMax": <número entero en GTQ>,
            "confidence": "<LOW | MEDIUM | HIGH>",
            "justification": "<explicación breve en español de 1-2 oraciones>",
            "factors": ["<factor 1>", "<factor 2>", "<factor 3>"]
            }

            Reglas:
            - Los valores deben ser realistas para el mercado guatemalteco actual (2025-2026).
            - budgetMax debe ser mayor que budgetMin.
            - confidence: HIGH si la descripción tiene suficiente detalle, MEDIUM si es moderada, LOW si es muy vaga.
            - factors: lista de 2-4 factores clave que influyen en el precio (ej: "Materiales", "Mano de obra", "Zona geográfica").
            - Responde solo con el JSON, sin explicaciones ni backticks.`;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        if (!response.ok) {
            const errBody = await response.text();
            console.error('Gemini API error:', errBody);
            return res.status(502).json({
                success: false,
                message: 'Error al conectar con el servicio de IA'
            });
        }

        const aiResponse = await response.json();
        const rawText = aiResponse.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

        let estimation;
        try {
            const clean = rawText.replace(/```json|```/g, '').trim();
            estimation = JSON.parse(clean);
        } catch (parseErr) {
            console.error('Error parseando respuesta de IA:', rawText);
            return res.status(502).json({
                success: false,
                message: 'La IA devolvió una respuesta inválida. Intenta de nuevo.'
            });
        }

        if (
            typeof estimation.budgetMin !== 'number' ||
            typeof estimation.budgetMax !== 'number' ||
            !estimation.confidence ||
            !estimation.justification
        ) {
            return res.status(502).json({
                success: false,
                message: 'Respuesta de IA incompleta. Intenta de nuevo.'
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                budgetMin: estimation.budgetMin,
                budgetMax: estimation.budgetMax,
                confidence: estimation.confidence,
                justification: estimation.justification,
                factors: estimation.factors ?? []
            }
        });

    } catch (error) {
        console.error('estimateBudgetAI error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno al procesar la estimación',
            error: error.message
        });
    }
};