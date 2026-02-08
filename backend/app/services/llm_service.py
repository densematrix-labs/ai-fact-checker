import httpx
import json
from app.config import get_settings

SYSTEM_PROMPT = """You are an AI fact-checker and misinformation analyst. Your job is to analyze claims and provide credibility assessments.

For each claim, you must:
1. Assess overall credibility (0-100 score)
2. Break down key points and evaluate each
3. Identify contradictions with known facts
4. Analyze likely sources and spread patterns

Be objective and evidence-based. Acknowledge uncertainty when appropriate.

IMPORTANT: Your analysis is advisory only. Always include the disclaimer that AI analysis should not be taken as definitive fact verification.

Respond in JSON format with this structure:
{
  "credibility_score": <0-100>,
  "credibility_level": "high" | "medium" | "low",
  "summary": "<brief assessment>",
  "key_points": [
    {
      "point": "<extracted claim point>",
      "assessment": "likely_true" | "uncertain" | "likely_false",
      "explanation": "<why>"
    }
  ],
  "contradictions": ["<contradiction with known facts>"],
  "source_analysis": {
    "likely_origin": "<type of source: news, social media, satire, etc>",
    "spread_pattern": "<how this type of claim typically spreads>",
    "red_flags": ["<warning signs if any>"]
  }
}"""

LANGUAGE_INSTRUCTIONS = {
    "en": "Respond in English.",
    "zh": "用中文回复。",
    "ja": "日本語で回答してください。",
    "de": "Antworten Sie auf Deutsch.",
    "fr": "Répondez en français.",
    "ko": "한국어로 답변해 주세요.",
    "es": "Responda en español."
}


async def analyze_claim(claim: str, language: str = "en") -> dict:
    """Analyze a claim using LLM proxy."""
    settings = get_settings()
    
    lang_instruction = LANGUAGE_INSTRUCTIONS.get(language, LANGUAGE_INSTRUCTIONS["en"])
    
    user_prompt = f"""Analyze this claim for factual accuracy:

"{claim}"

{lang_instruction}

Provide your analysis in the JSON format specified."""

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            f"{settings.LLM_PROXY_URL}/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.LLM_PROXY_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "claude-sonnet-4-20250514",
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt}
                ],
                "max_tokens": 2000,
                "temperature": 0.3
            }
        )
        
        if response.status_code != 200:
            raise Exception(f"LLM API error: {response.status_code} - {response.text}")
        
        data = response.json()
        content = data["choices"][0]["message"]["content"]
        
        # Parse JSON from response
        try:
            # Handle potential markdown code blocks
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]
            
            result = json.loads(content.strip())
        except json.JSONDecodeError:
            raise Exception("Failed to parse LLM response as JSON")
        
        # Add disclaimer based on language
        disclaimers = {
            "en": "This AI analysis is for reference only and does not constitute definitive fact verification. Please verify important claims through authoritative sources.",
            "zh": "此 AI 分析仅供参考，不构成权威事实认定。重要信息请通过权威来源核实。",
            "ja": "このAI分析は参考用であり、決定的な事実確認ではありません。重要な主張は信頼できる情報源で確認してください。",
            "de": "Diese KI-Analyse dient nur als Referenz und stellt keine endgültige Faktenüberprüfung dar. Bitte überprüfen Sie wichtige Behauptungen anhand zuverlässiger Quellen.",
            "fr": "Cette analyse IA est fournie à titre indicatif et ne constitue pas une vérification factuelle définitive. Veuillez vérifier les affirmations importantes auprès de sources fiables.",
            "ko": "이 AI 분석은 참고용이며 확정적인 사실 확인이 아닙니다. 중요한 주장은 신뢰할 수 있는 출처를 통해 확인하세요.",
            "es": "Este análisis de IA es solo de referencia y no constituye una verificación de hechos definitiva. Por favor, verifique las afirmaciones importantes a través de fuentes confiables."
        }
        
        result["disclaimer"] = disclaimers.get(language, disclaimers["en"])
        
        return result
