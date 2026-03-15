/**
 * Promise Engine Glossary — formal terminology for promise network analysis.
 *
 * Terms marked [PE] are original to Promise Engine / Promise Pipeline.
 * Others are drawn from Promise Theory (Mark Burgess) or network science.
 */

export interface GlossaryEntry {
  term: string;
  tag: "PE" | "PT" | "NS"; // Promise Engine, Promise Theory, Network Science
  firstIdentified?: string;
  definition: string;
  architecturalImplication?: string;
}

export const glossary: GlossaryEntry[] = [
  {
    term: "Verification Dependency Chain",
    tag: "PE",
    firstIdentified: "JCPOA analysis (IAEA verification → Additional Protocol → sanctions relief)",
    definition:
      "A sequence of promises where each link enables the verification of downstream promises. When any link in the chain fails, verification capability propagates downward: every promise verified by the broken link loses its verification mechanism, even if its compliance status hasn't changed. Distinguished from a standard dependency edge: dependency edges propagate status changes, verification dependency chains propagate certainty changes. In the JCPOA, the verification dependency chain ran: sanctions relief → cooperation (Additional Protocol) → IAEA monitoring → enrichment verification. When sanctions relief collapsed, the entire chain failed, and the international community lost the ability to verify any of Iran's nuclear commitments.",
    architecturalImplication:
      "Verification infrastructure is a node in the promise graph, not external to it. Any promise that enables verification should be identified and tracked with the same rigor as the promises it verifies.",
  },
  {
    term: "Shallow Enforcement Floor",
    tag: "PE",
    firstIdentified: "JCPOA analysis ('political commitments' framing)",
    definition:
      "A property of a promise network where the promises lack binding enforcement mechanisms — the entire network rests on voluntary cooperation with no legal recourse for non-compliance. The JCPOA was explicitly characterized by the U.S. State Department as 'political commitments,' not a binding treaty. This created a structural vulnerability: any party could withdraw without legal consequence, and one party's withdrawal triggered cascading non-compliance by others. Distinguished from a verification gap: a verification gap means you can't tell whether promises are being kept. A shallow enforcement floor means you can't compel them to be kept even when you know they're being broken.",
  },
  {
    term: "Certainty Cascade",
    tag: "PE",
    firstIdentified: "JCPOA analysis (AP suspension → verification collapse)",
    definition:
      "The propagation of uncertainty through a promise network when verification infrastructure fails. Distinguished from a status cascade: in a status cascade, a violated promise causes dependent promises to degrade. In a certainty cascade, a failed verification mechanism causes verified promises to become uncertain — their status label may not change, but the confidence in that label drops. A promise can be simultaneously 'violated' and 'certain' (evidence confirms the violation) or 'violated' and 'uncertain' (the violation was confirmed by a mechanism that no longer functions). The distinction matters for intervention targeting: status cascades tell you what's broken, certainty cascades tell you what you can no longer see.",
  },
];
