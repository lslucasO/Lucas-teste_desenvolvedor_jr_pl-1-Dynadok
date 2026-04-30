import os
from typing import Dict

from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI


class LLMService:
    def __init__(self):
        self.llm = ChatOpenAI(
            model=os.getenv("HF_MODEL", "Qwen/Qwen2.5-72B-Instruct"),
            temperature=0.5,
            api_key=os.getenv("HF_TOKEN"),
            base_url="https://router.huggingface.co/v1",
        )
        self.prompt_template = PromptTemplate.from_template(
            "Resuma o texto a seguir na seguinte linguagem: {language}. Deixe ele conciso e claro.\n\nText:\n{text}"
        )

    def summarize_text(self, text: str, lang: str) -> str:
        languages: Dict[str, str] = {
            "pt": "Portuguese",
            "en": "English",
            "es": "Spanish",
        }
        prompt = self.prompt_template.format(text=text, language=languages[lang])
        response = self.llm.invoke(prompt)

        if isinstance(response.content, str):
            return response.content.strip()

        return str(response.content).strip()
