import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

/** Fallback challenges when external APIs are unavailable */
const FALLBACK_HACKERRANK_CHALLENGES = [
  { title: "Array Manipulation", difficulty: "INTERMEDIATE", xp: 50 },
  { title: "Dynamic Programming: Knapsack", difficulty: "ADVANCED", xp: 100 },
  { title: "Graph Algorithms: Shortest Path", difficulty: "ADVANCED", xp: 100 },
  { title: "String Matching: KMP Algorithm", difficulty: "INTERMEDIATE", xp: 50 },
  { title: "Tree Traversal: Inorder, Preorder, Postorder", difficulty: "BEGINNER", xp: 30 },
  { title: "Hash Map: Two Sum Problem", difficulty: "BEGINNER", xp: 30 },
  { title: "Binary Search: Search in Rotated Array", difficulty: "INTERMEDIATE", xp: 50 },
  { title: "Greedy: Activity Selection Problem", difficulty: "INTERMEDIATE", xp: 50 },
];

const FALLBACK_W3SCHOOLS_CHALLENGES = [
  { title: "HTML Semantic Elements", difficulty: "BEGINNER", xp: 20 },
  { title: "CSS Flexbox Layout", difficulty: "BEGINNER", xp: 20 },
  { title: "JavaScript Array Methods", difficulty: "BEGINNER", xp: 25 },
  { title: "Python Lists and Dictionaries", difficulty: "BEGINNER", xp: 25 },
  { title: "SQL SELECT Queries", difficulty: "BEGINNER", xp: 25 },
  { title: "React useState Hook", difficulty: "INTERMEDIATE", xp: 40 },
  { title: "Node.js Express Routes", difficulty: "INTERMEDIATE", xp: 40 },
  { title: "Git Basic Commands", difficulty: "BEGINNER", xp: 20 },
];

/** Fetch live hackathon challenges from HackerRank API */
async function fetchHackerRankChallenges(): Promise<any[]> {
  const apiKey = process.env.HACKERRANK_API_KEY;
  if (!apiKey) {
    console.warn("HACKERRANK_API_KEY not configured, using fallback challenges");
    return FALLBACK_HACKERRANK_CHALLENGES.map((c, i) => ({
      id: `hr-fallback-${i}`,
      title: c.title,
      platform: "HackerRank",
      cadence: "ONE_TIME",
      difficulty: c.difficulty,
      xp: c.xp,
    }));
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
      return FALLBACK_HACKERRANK_CHALLENGES.map((c, i) => ({
        id: `hr-fallback-${i}`,
        title: c.title,
        platform: "HackerRank",
        cadence: "ONE_TIME",
        difficulty: c.difficulty,
        xp: c.xp,
      }));
    }

    const data = await response.json();
    return (data.challenges || []).map((c: any) => ({
      id: `hr-${c.id || c.slug || Date.now()}`,
      title: c.title || c.name || "HackerRank Challenge",
      platform: "HackerRank",
      cadence: c.cadence || "ONE_TIME",
      difficulty: c.difficulty || "INTERMEDIATE",
      xp: c.xp || 50,
    }));
  } catch (error) {
    console.error("Failed to fetch HackerRank challenges:", error);
    return FALLBACK_HACKERRANK_CHALLENGES.map((c, i) => ({
      id: `hr-fallback-${i}`,
      title: c.title,
      platform: "HackerRank",
      cadence: "ONE_TIME",
      difficulty: c.difficulty,
      xp: c.xp,
    }));
  }
}

/** Fetch live hackathon challenges from w3schools */
async function fetchW3SchoolsChallenges(): Promise<any[]> {
  try {
    const response = await fetch("https://www.w3schools.com/challenges/default.asp", {
      method: "GET",
      headers: {
        "Accept": "text/html",
      },
    });

    if (!response.ok) {
      console.error("w3schools API error:", response.status);
      return FALLBACK_W3SCHOOLS_CHALLENGES.map((c, i) => ({
        id: `ws-fallback-${i}`,
        title: c.title,
        platform: "w3schools",
        cadence: "ONE_TIME",
        difficulty: c.difficulty,
        xp: c.xp,
      }));
    }

    // Parse the HTML to extract challenge information
    const html = await response.text();
    
    // Try multiple regex patterns to extract challenge titles
    const patterns = [
      /<[^>]*class="[^"]*challenge[^"]*"[^>]*>([^<]+)<\/[^>]*>/gi,
      /<h3[^>]*>([^<]+)<\/h3>/gi,
      /<a[^>]*class="[^"]*challenge[^"]*"[^>]*>([^<]+)<\/a>/gi,
    ];

    const matches = new Set<string>();
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        const title = match[1].trim();
        if (title.length > 5 && title.length < 100) {
          matches.add(title);
        }
      }
    }

    const extractedChallenges = Array.from(matches).slice(0, 10).map((title, i) => ({
      id: `ws-extracted-${i}`,
      title,
      platform: "w3schools",
      cadence: "ONE_TIME",
      difficulty: "BEGINNER",
      xp: 30,
    }));

    if (extractedChallenges.length > 0) {
      return extractedChallenges;
    }

    // Fallback to predefined challenges
    return FALLBACK_W3SCHOOLS_CHALLENGES.map((c, i) => ({
      id: `ws-fallback-${i}`,
      title: c.title,
      platform: "w3schools",
      cadence: "ONE_TIME",
      difficulty: c.difficulty,
      xp: c.xp,
    }));
  } catch (error) {
    console.error("Failed to fetch w3schools challenges:", error);
    return FALLBACK_W3SCHOOLS_CHALLENGES.map((c, i) => ({
      id: `ws-fallback-${i}`,
      title: c.title,
      platform: "w3schools",
      cadence: "ONE_TIME",
      difficulty: c.difficulty,
      xp: c.xp,
    }));
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
        id: c.id || `hr-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        title: c.title,
        platform: c.platform || "HackerRank",
        cadence: c.cadence || "ONE_TIME",
        difficulty: c.difficulty || "INTERMEDIATE",
        xp: c.xp || 50,
      })),
      ...wsChallenges.map((c: any) => ({
        id: c.id || `ws-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        title: c.title,
        platform: c.platform || "w3schools",
        cadence: c.cadence || "ONE_TIME",
        difficulty: c.difficulty || "BEGINNER",
        xp: c.xp || 30,
      })),
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
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized - Admin required" }, { status: 401 });
  }

  try {
    const { platform } = await req.json();
    let newChallenges: any[] = [];

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