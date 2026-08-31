"""Parser PDF — robuste pour planning cadres casino SBM."""

import io
import re
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
from pypdf import PdfReader

router = APIRouter()


class CadreResult(BaseModel):
    name: str
    initial: Optional[str]
    horaires: Dict[str, str]  # {"1": "22/6", "2": "RH", ...}
    strategy_used: str
    raw_line: Optional[str] = None


class ParseCadresResponse(BaseModel):
    cadres_trouves: List[CadreResult]
    cadres_manquants: List[str]
    pdf_pages: int
    total_chars: int


@router.post("/parse-cadres", response_model=ParseCadresResponse)
async def parse_cadres(
    file: UploadFile = File(...),
    expected_names: str = "",  # "ETTORI M,FOUQUE V,PLACENTI L,DOGLIOLO Y,MUS L,BOUVIER JF"
):
    """
    Parse un PDF planning cadres SBM et extrait les horaires par employé.
    Beaucoup plus robuste que le parser JS côté client (regex multi-lignes + contexte).
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files accepted")

    content = await file.read()
    try:
        reader = PdfReader(io.BytesIO(content))
        pages_text = [page.extract_text() or "" for page in reader.pages]
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"PDF read error: {e}")

    full_text = "\n".join(pages_text)
    expected = [n.strip() for n in expected_names.split(",") if n.strip()]

    # Parser avec 5 strategies (port du frontend v9.468)
    results = []
    missing = []

    for name in expected:
        parts = name.split()
        surname = parts[0] if parts else ""
        initial = parts[1] if len(parts) > 1 else ""

        horaires = _extract_horaires(full_text, surname, initial)
        if horaires:
            results.append(CadreResult(
                name=name,
                initial=initial,
                horaires=horaires["data"],
                strategy_used=horaires["strategy"],
                raw_line=horaires.get("line"),
            ))
        else:
            missing.append(name)

    return ParseCadresResponse(
        cadres_trouves=results,
        cadres_manquants=missing,
        pdf_pages=len(reader.pages),
        total_chars=len(full_text),
    )


def _extract_horaires(text: str, surname: str, initial: str) -> Optional[Dict]:
    """5 strategies pour matcher le cadre dans le PDF."""
    lines = text.split("\n")

    strategies = [
        ("nom_complet", rf"\b{re.escape(surname)}\s+{re.escape(initial)}\b"),
        ("ordre_inverse", rf"\b{re.escape(initial)}\.?\s+{re.escape(surname)}\b"),
        ("surname_seul", rf"\b{re.escape(surname)}\b"),
        ("fuzzy4", re.escape(surname[:4]) if len(surname) >= 4 else None),
    ]

    for strat_name, pattern in strategies:
        if not pattern:
            continue
        for i, line in enumerate(lines):
            if re.search(pattern, line, re.IGNORECASE):
                # Extract horaire tokens après le nom
                codes = _extract_codes_from_line(line, surname, initial)
                if codes:
                    return {"strategy": strat_name, "data": codes, "line": line[:200]}
                # Strategy 5: aggrégation ligne N + N+1
                if i + 1 < len(lines):
                    combined = line + " " + lines[i + 1]
                    codes2 = _extract_codes_from_line(combined, surname, initial)
                    if codes2:
                        return {"strategy": strat_name + "+next_line", "data": codes2, "line": combined[:200]}

    return None


VALID_CODES = {
    "22/6", "19/2", "19/6", "23/6", "12H30/19", "12h30/19", "16/3", "16/22",
    "19/4", "20/5", "22/6*", "19/2*", "19/6*", "23/6*",
    "RH", "R", "CP", "AF", "M", "RRT", "PRT", "PAT", "HC", "FL", "ABS",
    "CL", "AT", "CPM", "FCP", "FRH", "DP", "CEO",
}


def _extract_codes_from_line(line: str, surname: str, initial: str) -> Optional[Dict[str, str]]:
    """Extrait les codes horaires après le nom dans la ligne."""
    idx = line.upper().find(surname.upper())
    if idx < 0:
        return None
    rest = line[idx + len(surname):].strip()
    # Split par espaces ou tabs
    tokens = re.split(r"[\t|,;]+|\s{2,}|\s+", rest)
    tokens = [t.strip() for t in tokens if t.strip()]

    # Skip initiale résiduelle si présente
    if tokens and initial and tokens[0].rstrip(".").upper() == initial.upper():
        tokens = tokens[1:]

    # Skip numéros (1, 30 = métadonnées dates)
    while tokens and re.match(r"^[\d*\-.]+$", tokens[0]):
        tokens = tokens[1:]

    # Extraire codes valides
    horaires = {}
    day = 1
    for t in tokens[:31]:
        if not t:
            continue
        clean = t.strip().replace('"', "").replace("'", "")
        for variant in [t, clean, clean.upper(), clean.lower()]:
            if variant in VALID_CODES:
                horaires[str(day)] = variant
                break
        day += 1
        if day > 31:
            break

    return horaires if horaires else None
