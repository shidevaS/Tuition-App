import { NextResponse } from "next/server";

/** Fetch live hackathon challenges from HackerRank API */
async function fetchHackerRankChallenges() {
  const apiKey = process.env.HACKERRANK_API_KEY;
  if (!apiKey) {
    console.warn("HACKERRANK_API_KEY not configured, returning empty challenges");
    return [];
  }

  try {
    const response = await fetch(`https://api.hackerrank.com/v1/challenges`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      console.error("HackerRank API error:", response.status);
      return [];
    }

    const data = await response.json();
    return data.challenges || [];
  } catch (error) {
    console.error("Failed to fetch HackerRank challenges:", error);
    return [];
  }
}

/** Fetch live hackathon challenges from w3schools */
async function fetchW3SchoolsChallenges() {
  try {
    const response = await fetch("https://www.w3schools.com/challenges/default.asp", {
      method: "GET",
      headers: {
        "Accept": "text/html",
      },
    });

    if (!response.ok) {
      console.error("w3schools API error:", response.status);
      return [];
    }

    // Parse the HTML to extract challenge information
    const html = await response.text();
    // Simple parsing - extract challenge names and details
    const challengeRegex = /<[^>]*class="[^"]*challenge[^"]*"[^>]*>([^<]+)<\/[^>]*>/gi;
    const matches = [];
    let match;
    while ((match = challengeRegex.exec(html)) !== null) {
      matches.push(match[1].trim());
    }

    return matches.slice(0, 10).map(title => ({
      title,
      platform: "w3schools",
      cadence: "ONE_TIME",
      difficulty: "BEGINNER",
      xp: 30,
    }));
  } catch (error) {
    console.error("Failed to fetch w3schools challenges:", error);
    return [];
  }
}

/** GET - Fetch live hackathon challenges from external platforms */
export async function GET() {
  try {
    const [hrChallenges, wsChallenges] = await Promise.all([
      fetchHackerRankChallenges(),
      fetchW3SchoolsChallenges(),
    ]);

    const challenges = [
      ...hrChallenges.map((c: any) => ({
        id: `hr-${c.id || Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        title: c.title || c.name || "HackerRank Challenge",
        platform: "HackerRank",
        cadence: c.cadence || "ONE_TIME",
        difficulty: c.difficulty || "INTERMEDIATE",
        xp: c.xp || 50,
      })),
      ...wsChallenges,
    ];

    return NextResponse.json({ challenges });
  } catch (error) {
    console.error("Failed to fetch external challenges:", error);
    return NextResponse.json({ challenges: [] }, { status: 500 });
  }
}

/** POST - Manually sync external challenges (admin only) */
export async function POST(
  req: Request
) {
  const session = await (await import("@/lib/session")).getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized - Admin required" }, { status: 401 });
  }

  try {
    const { platform } = await req.json();
    let newChallenges = [];

    if (platform === "hackerrank") {
      newChallenges = await fetchHackerRankChallenges();
    } else if (platform === "w3schools") {
      newChallenges = await fetchW3SchoolsChallenges();
    }

    return NextResponse.json({ 
      success: true, 
      count: newChallenges.length,
      message: `Synced ${newChallenges.length} ${platform} challenges`
    });
  } catch (error) {
    console.error("Failed to sync external challenges:", error);
    return NextResponse.json({ error: "Failed to sync challenges" }, { status: 500 });
  }
}