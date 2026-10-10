import { useState } from "react";
import { WizardShell } from "./WizardShell";
import type { ChildInfo, RelationshipType } from "@/lib/appState";
import questionnaire from "@/data/questionnaire.json";

const familyBlock = (questionnaire.blocks as any[]).find((b) => b.id === "family");
const relationshipField = familyBlock.fields.relationshipType;

function newChild(): ChildInfo {
  return {
    id: crypto.randomUUID(),
    relationshipType: relationshipField.options[0].value,
    ageBand: "13-15",
    livingSituation: familyBlock.fields.livingSituation.options[0].value,
    nickname: "",
  };
}

export function FamilyStep({
  familyChildren,
  onChange,
  onNext,
  onBack,
  progress,
}: {
  familyChildren: ChildInfo[];
  onChange: (children: ChildInfo[]) => void;
  onNext: () => void;
  onBack: () => void;
  progress?: number;
}) {
  const [local, setLocal] = useState<ChildInfo[]>(familyChildren.length ? familyChildren : [newChild()]);

  function update(id: string, patch: Partial<ChildInfo>) {
    const next = local.map((c) => (c.id === id ? { ...c, ...patch } : c));
    setLocal(next);
    onChange(next);
  }

  function addChild() {
    if (local.length >= familyBlock.maxChildren) return;
    const next = [...local, newChild()];
    setLocal(next);
    onChange(next);
  }

  function removeChild(id: string) {
    const next = local.filter((c) => c.id !== id);
    setLocal(next);
    onChange(next);
  }

  return (
    <WizardShell
      title={familyBlock.title}
      description={familyBlock.description}
      onBack={onBack}
      progress={progress}
      primaryLabel="Continue"
      onPrimary={onNext}
      primaryDisabled={local.length === 0}
    >
      <div className="space-y-5">
        {local.map((child, idx) => (
          <div key={child.id} className="rounded-2xl border border-ink/10 bg-white/60 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink">
                {relationshipField.nounLabels[child.relationshipType] ?? "Child"} {idx + 1}
              </h3>
              {local.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeChild(child.id)}
                  className="text-xs text-ink/50 underline"
                >
                  Remove
                </button>
              )}
            </div>

            <label className="mt-3 block text-sm text-ink/70">
              {relationshipField.label}
              <select
                className="mt-1 block w-full rounded-xl border border-ink/15 bg-white p-2 text-sm text-ink"
                value={child.relationshipType}
                onChange={(e) =>
                  update(child.id, { relationshipType: e.target.value as RelationshipType })
                }
              >
                {relationshipField.options.map((opt: any) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>

            {child.relationshipType === "other" && (
              <label className="mt-3 block text-sm text-ink/70">
                Tell us what to call it (optional)
                <input
                  type="text"
                  className="mt-1 block w-full rounded-xl border border-ink/15 bg-white p-2 text-sm text-ink"
                  value={child.relationshipTypeOther ?? ""}
                  onChange={(e) => update(child.id, { relationshipTypeOther: e.target.value })}
                  placeholder="e.g. great-aunt, family friend"
                />
              </label>
            )}

            <label className="mt-3 block text-sm text-ink/70">
              {familyBlock.fields.ageBand.label}
              <select
                className="mt-1 block w-full rounded-xl border border-ink/15 bg-white p-2 text-sm text-ink"
                value={child.ageBand}
                onChange={(e) => update(child.id, { ageBand: e.target.value as ChildInfo["ageBand"] })}
              >
                {familyBlock.fields.ageBand.options.map((opt: any) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-3 block text-sm text-ink/70">
              {familyBlock.fields.livingSituation.label}
              <select
                className="mt-1 block w-full rounded-xl border border-ink/15 bg-white p-2 text-sm text-ink"
                value={child.livingSituation}
                onChange={(e) => update(child.id, { livingSituation: e.target.value })}
              >
                {familyBlock.fields.livingSituation.options.map((opt: any) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-3 block text-sm text-ink/70">
              {familyBlock.fields.nickname.label}
              <input
                type="text"
                className="mt-1 block w-full rounded-xl border border-ink/15 bg-white p-2 text-sm text-ink"
                value={child.nickname ?? ""}
                onChange={(e) => update(child.id, { nickname: e.target.value })}
                placeholder="Optional, shown only on your screen"
              />
              <span className="mt-1 block text-xs text-ink/40">{familyBlock.fields.nickname.helpText}</span>
            </label>
          </div>
        ))}

        {local.length < familyBlock.maxChildren && (
          <button type="button" onClick={addChild} className="text-sm font-semibold text-ink underline">
            + Add another child
          </button>
        )}
      </div>
    </WizardShell>
  );
}
