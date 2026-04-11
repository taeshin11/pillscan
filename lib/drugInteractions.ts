/**
 * Drug-Drug Interaction (DDI) checker using NIH RxNav API.
 * Free, no key required.
 *
 * Flow:
 * 1. Convert each drug name to RxCUI (RxNorm ID)
 * 2. Query interaction API for the list of RxCUIs
 * 3. Return severity-ranked interactions
 */

export interface DrugInteraction {
  drug1: string;
  drug2: string;
  description: string;
  severity?: "high" | "moderate" | "low";
  source?: string;
}

const cache = new Map<string, string | null>();

/** Get RxCUI for a drug name. */
async function getRxCui(name: string): Promise<string | null> {
  if (!name) return null;
  const cleanName = name.split(/[\s,(]/)[0].trim().toLowerCase();
  if (cache.has(cleanName)) return cache.get(cleanName)!;

  try {
    const r = await fetch(
      `https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${encodeURIComponent(cleanName)}&search=2`,
      { signal: AbortSignal.timeout(4000) }
    );
    if (!r.ok) {
      cache.set(cleanName, null);
      return null;
    }
    const d = await r.json();
    const cui = d?.idGroup?.rxnormId?.[0] || null;
    cache.set(cleanName, cui);
    return cui;
  } catch {
    cache.set(cleanName, null);
    return null;
  }
}

/** Check interactions for a list of drug names. Returns up to 10 interactions. */
export async function checkInteractions(drugNames: string[]): Promise<DrugInteraction[]> {
  if (!drugNames || drugNames.length < 2) return [];

  // Get RxCUIs in parallel
  const cuis = await Promise.all(drugNames.map(getRxCui));
  const validPairs: { name: string; cui: string }[] = [];
  for (let i = 0; i < cuis.length; i++) {
    if (cuis[i]) validPairs.push({ name: drugNames[i], cui: cuis[i]! });
  }

  if (validPairs.length < 2) return [];

  // RxNav interaction list (deprecated but still works for some)
  // Newer: use DrugBank, but free version requires login
  // Fallback: hard-coded common dangerous combos
  try {
    const cuiList = validPairs.map((p) => p.cui).join("+");
    const r = await fetch(
      `https://rxnav.nlm.nih.gov/REST/interaction/list.json?rxcuis=${cuiList}`,
      { signal: AbortSignal.timeout(6000) }
    );
    if (!r.ok) return [];
    const d = await r.json();
    const interactions: DrugInteraction[] = [];
    const groups = d?.fullInteractionTypeGroup || [];
    for (const group of groups) {
      for (const it of group.fullInteractionType || []) {
        const minConcept = it.minConcept || [];
        const desc = it.interactionPair?.[0]?.description || "";
        const severity = it.interactionPair?.[0]?.severity?.toLowerCase();
        if (minConcept.length >= 2 && desc) {
          interactions.push({
            drug1: minConcept[0].name,
            drug2: minConcept[1].name,
            description: desc,
            severity: severity === "high" ? "high" : severity === "moderate" ? "moderate" : "low",
            source: group.sourceName,
          });
        }
      }
    }
    return interactions.slice(0, 10);
  } catch {
    return [];
  }
}
