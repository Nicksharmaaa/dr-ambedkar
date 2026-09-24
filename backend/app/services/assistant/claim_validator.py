"""
Claim Extraction and Validation Engine — Phase 7
Audits generated answers against retrieved evidence chunks.
Classifies assertions into:
  - SUPPORTED
  - PARTIAL
  - UNSUPPORTED
  - CONFLICTING
Enforces claim filtering and abstention when evidence does not support assertions.
"""
from __future__ import annotations

import logging
import re
from typing import Any

from app.schemas.assistant import ClaimStatus, ClaimValidationItem
from app.services.assistant.generator import ABSTENTION_TEXT

logger = logging.getLogger("ambedkar.assistant.claim_validator")

# Words that indicate meta-text rather than factual claims
_META_PREFIXES = (
    "based on",
    "according to",
    "in summary",
    "as stated",
    "in conclusion",
    "to explain",
    "the available archive",
    "dr. ambedkar writes",
    "the evidence shows",
)


class ClaimValidator:
    """Audits generated answers and verifies claim-level grounding."""

    def extract_claims(self, text: str) -> list[str]:
        """Split text into distinct assertional factual statements."""
        if not text or text.strip() == ABSTENTION_TEXT:
            return []

        # Remove bracket citations like [CH-1], [Vol. 13, p. 163]
        cleaned = re.sub(r"\[(CH-\d+|Vol\.[^\]]+|\d+)\]", "", text)

        # Split on sentence boundaries
        raw_sentences = re.split(r"(?<=[.!?])\s+|\n+", cleaned)
        claims: list[str] = []

        for s in raw_sentences:
            s_clean = s.strip()
            # Ignore short phrases or conversational connectors
            if len(s_clean.split()) < 5:
                continue
            # Filter pure meta-commentary
            lower = s_clean.lower()
            if any(lower.startswith(p) for p in _META_PREFIXES) and len(s_clean.split()) < 8:
                continue
            claims.append(s_clean)

        return claims

    def validate_claim(
        self,
        claim: str,
        evidence_chunks: list[dict[str, Any]],
    ) -> tuple[ClaimStatus, list[str], float, str]:
        """
        Validate an atomic claim against all evidence chunks.
        Returns: (status, supporting_chunk_ids, confidence, explanation)
        """
        claim_words = set(re.findall(r"\w{3,}", claim.lower()))
        if not claim_words:
            return ("SUPPORTED", [], 1.0, "Vacuous assertion")

        # Exclude common stop words
        stopwords = {
            "that", "this", "with", "from", "have", "were", "which",
            "their", "there", "about", "could", "would", "should", "other",
            "state", "under", "these", "those", "after", "before", "where"
        }
        salient_words = claim_words - stopwords
        if not salient_words:
            salient_words = claim_words

        best_score = 0.0
        best_chunk_ids: list[str] = []
        contradiction_found = False

        for c in evidence_chunks:
            cid = c.get("chunk_id") or c.get("id") or "CH"
            ev_text = (c.get("text") or "").lower()

            # Word containment ratio
            matched = sum(1 for w in salient_words if w in ev_text)
            overlap = matched / len(salient_words)

            # Check for direct phrase match
            if len(claim) > 20 and claim.lower()[:30] in ev_text:
                overlap = max(overlap, 0.95)

            if overlap > best_score:
                best_score = overlap
                best_chunk_ids = [cid]
            elif overlap == best_score and overlap > 0.4:
                best_chunk_ids.append(cid)

            # Detect polarity contradiction (e.g. claim asserts X was created, text says X was abolished)
            if "not " in claim.lower() and "was " in ev_text and overlap > 0.6:
                if "never" in claim.lower() and "always" in ev_text:
                    contradiction_found = True

        if contradiction_found:
            return ("CONFLICTING", best_chunk_ids, 0.2, "Claim polarity directly conflicts with archival evidence")

        if best_score >= 0.65:
            return ("SUPPORTED", best_chunk_ids, round(best_score, 2), "Substantiated by archival evidence")
        elif best_score >= 0.35:
            return ("PARTIAL", best_chunk_ids, round(best_score, 2), "Partially grounded; conceptual terminology matches")
        else:
            return ("UNSUPPORTED", [], 0.0, "Claim facts not found in retrieved archival evidence")

    def audit_response(
        self,
        answer: str,
        evidence_chunks: list[dict[str, Any]],
    ) -> tuple[str, list[ClaimValidationItem], bool]:
        """
        Audit all claims in generated answer.
        Returns: (final_answer, claim_items, is_abstention)
        """
        # If generator already abstained -> pass through
        if ABSTENTION_TEXT.lower() in answer.lower():
            return (ABSTENTION_TEXT, [], True)

        claims = self.extract_claims(answer)
        if not claims:
            # If answer is non-empty but no distinct claims extracted (e.g. short quote)
            return (answer, [], False)

        claim_items: list[ClaimValidationItem] = []
        supported_count = 0
        unsupported_count = 0
        conflicting_count = 0

        for c in claims:
            status, cids, conf, note = self.validate_claim(c, evidence_chunks)
            claim_items.append(
                ClaimValidationItem(
                    claim=c,
                    status=status,
                    supporting_chunk_ids=cids,
                    confidence=conf,
                    explanation=note,
                )
            )
            if status == "SUPPORTED":
                supported_count += 1
            elif status == "PARTIAL":
                supported_count += 0.5
            elif status == "UNSUPPORTED":
                unsupported_count += 1
            elif status == "CONFLICTING":
                conflicting_count += 1

        total = len(claims)
        # If over 60% of claims are unsupported or any conflicting claim is detected -> ABSTAIN
        if conflicting_count > 0 or (total > 0 and (unsupported_count / total) > 0.6):
            logger.warning(
                "Claim audit failed (supported=%.1f, unsupported=%d, conflicting=%d). Triggering abstention.",
                supported_count, unsupported_count, conflicting_count
            )
            return (ABSTENTION_TEXT, claim_items, True)

        return (answer, claim_items, False)
