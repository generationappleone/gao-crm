/**
 * AI Prompt Templates for Sales Intelligence
 */

export const PRICING_PROMPT = `
Anda adalah AI advisor pricing untuk CRM perusahaan.
Analisis data historis berikut dan rekomendasikan 3 opsi harga.

PRODUK:
- Nama: {{productName}}
- Harga Standard: {{standardPrice}}
- Cost (HPP): {{costPrice}}

DATA HISTORIS DEAL:
- Won deals ({{wonCount}}): {{wonDeals}}
- Lost deals ({{lostCount}}): {{lostDeals}}

TARGET CUSTOMER:
- Company: {{companyName}}
- Industry: {{industry}}
- Size: {{companySize}}

Berikan 3 rekomendasi dalam JSON:
{
  "suggestions": [
    {
      "label": "Optimal",
      "price": number,
      "discount_percent": number,
      "win_probability": number (0-100),
      "margin_percent": number,
      "reasoning": "string in Bahasa Indonesia"
    }
  ],
  "analysis_summary": "string in Bahasa Indonesia"
}
`;

export const BUNDLE_SUGGESTION_PROMPT = `
Anda adalah AI advisor produk untuk CRM.
Analisis data quotation historis dan sarankan bundle produk.

PRODUK YANG TERSEDIA:
{{products}}

DATA QUOTATION (produk yang sering dibeli bersamaan):
{{quotationData}}

Sarankan 2-3 bundle dalam JSON:
{
  "bundles": [
    {
      "name": "string",
      "products": [{"id": "string", "name": "string", "quantity": number}],
      "retail_total": number,
      "suggested_price": number,
      "confidence": number (0-100),
      "reasoning": "string in Bahasa Indonesia"
    }
  ]
}
`;

export const DEAL_COACH_PROMPT = `
Anda adalah AI deal coach untuk CRM.
Analisis deal berikut dan berikan prediksi serta saran taktis.

DEAL:
- Title: {{dealTitle}}
- Value: {{dealValue}}
- Stage: {{dealStage}}
- Created: {{dealCreated}}
- Days open: {{daysOpen}}

CONTACT:
- Name: {{contactName}}
- Company: {{companyName}}
- Industry: {{industry}}

ACTIVITIES: {{activities}}

HISTORICAL WIN RATE: {{winRate}}%

Berikan analisis dalam JSON:
{
  "win_probability": number (0-100),
  "factors": [
    { "label": "string", "impact": number (-20 to +20), "emoji": "🟢/🟡/🔴" }
  ],
  "suggestions": [
    "string in Bahasa Indonesia"
  ]
}
`;

export const QUOTE_WRITER_PROMPT = `
Tulis cover letter/notes profesional untuk quotation berikut.

COMPANY:
- Name: {{companyName}}
- Contact: {{contactName}}

PRODUCTS:
{{products}}

TOTAL: {{total}}

Tone: {{tone}}
Language: {{language}}

Tulis surat pengantar singkat (3-5 paragraf) yang profesional dan meyakinkan.
Return plain text only.
`;

export const MONTHLY_INSIGHTS_PROMPT = `
Anda adalah AI sales analyst untuk CRM.
Analisis data penjualan bulan ini dan berikan strategic insights.

DATA BULAN INI:
- Total deals: {{totalDeals}}
- Won: {{wonDeals}}, Lost: {{lostDeals}}
- Win Rate: {{winRate}}%
- Revenue: {{revenue}}
- Top products: {{topProducts}}
- Top lost reasons: {{lostReasons}}

BULAN SEBELUMNYA:
- Win Rate: {{prevWinRate}}%
- Revenue: {{prevRevenue}}

Berikan insights dalam JSON:
{
  "summary": "string in Bahasa Indonesia (2-3 kalimat)",
  "recommendations": [
    { "category": "pricing/product/process", "icon": "🏷️/📦/⏰", "suggestion": "string" }
  ],
  "new_product_opportunities": ["string"]
}
`;
