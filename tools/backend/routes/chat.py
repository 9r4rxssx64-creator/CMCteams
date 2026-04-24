"""AI chat — multi-provider (Anthropic primary, OpenAI fallback)."""

import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from services.anthropic_client import call_anthropic
from services.openai_client import call_openai

router = APIRouter()


class Message(BaseModel):
    role: str  # user | assistant
    content: str


class ChatRequest(BaseModel):
    messages: List[Message]
    system: Optional[str] = None
    model: Optional[str] = None
    max_tokens: int = 4096
    provider: Optional[str] = None  # "anthropic" | "openai" | None (auto)


class ChatResponse(BaseModel):
    content: str
    provider_used: str
    model: str
    tokens_in: int
    tokens_out: int


@router.post("/completion", response_model=ChatResponse)
async def chat_completion(req: ChatRequest):
    """
    Chat completion avec fallback multi-provider.
    Priorité : Anthropic (Claude Sonnet 4.6) → OpenAI (GPT-4o-mini) si Anthropic fail.
    Le PAT/API key reste côté serveur, jamais exposé au client.
    """
    provider = req.provider or "anthropic"

    if provider == "anthropic":
        try:
            result = await call_anthropic(
                messages=[m.dict() for m in req.messages],
                system=req.system,
                model=req.model or "claude-sonnet-4-6",
                max_tokens=req.max_tokens,
            )
            return ChatResponse(
                content=result["content"],
                provider_used="anthropic",
                model=result["model"],
                tokens_in=result["tokens_in"],
                tokens_out=result["tokens_out"],
            )
        except Exception as e:
            print(f"[CHAT] Anthropic failed: {e}, trying OpenAI fallback")
            # Auto-fallback
            try:
                result = await call_openai(
                    messages=[m.dict() for m in req.messages],
                    system=req.system,
                    model="gpt-4o-mini",
                    max_tokens=req.max_tokens,
                )
                return ChatResponse(
                    content=result["content"],
                    provider_used="openai-fallback",
                    model=result["model"],
                    tokens_in=result["tokens_in"],
                    tokens_out=result["tokens_out"],
                )
            except Exception as e2:
                raise HTTPException(status_code=503, detail=f"Both providers failed: {e} / {e2}")

    elif provider == "openai":
        result = await call_openai(
            messages=[m.dict() for m in req.messages],
            system=req.system,
            model=req.model or "gpt-4o-mini",
            max_tokens=req.max_tokens,
        )
        return ChatResponse(
            content=result["content"],
            provider_used="openai",
            model=result["model"],
            tokens_in=result["tokens_in"],
            tokens_out=result["tokens_out"],
        )

    raise HTTPException(status_code=400, detail=f"Unknown provider {provider}")
