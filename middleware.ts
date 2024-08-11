// src/lib/rateLimit.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function rateLimit(request: NextRequest) {
  const ip = request.ip ?? "127.0.0.1";
  const key = `ratelimit_${ip}`;

  const current = await redis.get<number>(key) || 0;

  if (current > 10) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  await redis.set(key, current + 1, { ex: 60 });
}