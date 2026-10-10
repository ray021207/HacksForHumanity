import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getAuthSession } from "@/lib/getAuthSession";
import { db } from "@/db";
import { caregiverProfiles, children } from "@/db/schema";
import type { AppState, ChildInfo, RawResponses } from "@/lib/appState";

export async function GET() {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const [profile] = await db
    .select()
    .from(caregiverProfiles)
    .where(eq(caregiverProfiles.userId, userId))
    .limit(1);

  const childRows = await db.select().from(children).where(eq(children.userId, userId));

  const state: AppState = {
    consentAccepted: Boolean(profile),
    children: childRows.map(
      (c): ChildInfo => ({
        id: c.id,
        relationshipType: c.relationshipType as ChildInfo["relationshipType"],
        relationshipTypeOther: c.relationshipTypeOther ?? undefined,
        ageBand: c.ageBand as ChildInfo["ageBand"],
        livingSituation: c.livingSituation,
        nickname: c.nickname ?? undefined,
      })
    ),
    activeChildId: null,
    responses: (profile?.responses as RawResponses) ?? {},
    goals: profile?.goals ?? [],
    completedBlocks: profile?.completedBlocks ?? [],
  };

  return NextResponse.json(state);
}

export async function PATCH(req: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  let body: Partial<AppState>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  await db
    .insert(caregiverProfiles)
    .values({
      userId,
      responses: body.responses ?? {},
      goals: body.goals ?? [],
      completedBlocks: body.completedBlocks ?? [],
    })
    .onConflictDoUpdate({
      target: caregiverProfiles.userId,
      set: {
        responses: body.responses ?? {},
        goals: body.goals ?? [],
        completedBlocks: body.completedBlocks ?? [],
        updatedAt: new Date(),
      },
    });

  // Full-replace the children rows for this user — simplest given maxChildren
  // is small (4), and avoids reconciling individual row diffs client-side.
  // The server assigns new row ids on every replace, so the response hands
  // them back in order — the client must adopt these as the new ChildInfo
  // ids, since a generation's childId FK only resolves against these.
  // Sequential delete+insert, not a transaction: Neon's HTTP driver doesn't
  // support multi-statement transactions.
  let insertedChildren: ChildInfo[] = [];
  if (body.children) {
    await db.delete(children).where(eq(children.userId, userId));
    if (body.children.length > 0) {
      const rows = await db
        .insert(children)
        .values(
          body.children.map((c) => ({
            userId,
            relationshipType: c.relationshipType,
            relationshipTypeOther: c.relationshipTypeOther,
            ageBand: c.ageBand,
            livingSituation: c.livingSituation,
            nickname: c.nickname,
          }))
        )
        .returning();
      insertedChildren = rows.map(
        (c): ChildInfo => ({
          id: c.id,
          relationshipType: c.relationshipType as ChildInfo["relationshipType"],
          relationshipTypeOther: c.relationshipTypeOther ?? undefined,
          ageBand: c.ageBand as ChildInfo["ageBand"],
          livingSituation: c.livingSituation,
          nickname: c.nickname ?? undefined,
        })
      );
    }
  }

  return NextResponse.json({ ok: true, children: insertedChildren });
}
