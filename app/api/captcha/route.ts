import { NextResponse } from "next/server";

type HCaptchaVerifyResponse = {
  success: boolean;
  "error-codes"?: string[] | string;
  challenge_ts?: string;
  hostname?: string;
  credit?: boolean;
  score?: number;
  score_reason?: string[];
};

export async function POST(request: Request) {
  let body: Record<string, unknown> = {};

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  const token =
    (body["h-captcha-response"] as string | undefined) ??
    (body.token as string | undefined);

  if (!token) {
    return NextResponse.json(
      { success: false, message: "missing-input-response" },
      { status: 400 },
    );
  }

  const secret = process.env.HCAPTCHA_SECRET_KEY;
  if (!secret) {
    return NextResponse.json(
      { success: false, message: "missing-input-secret" },
      { status: 500 },
    );
  }

  const verifyResponse = await fetch("https://hcaptcha.com/siteverify", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      secret,
      response: token,
    }),
  });

  if (!verifyResponse.ok) {
    return NextResponse.json(
      { success: false, message: "captcha-verify-failed" },
      { status: 502 },
    );
  }

  const data = (await verifyResponse.json()) as HCaptchaVerifyResponse;

  if (!data.success) {
    return NextResponse.json(
      {
        success: false,
        message: data["error-codes"] ?? "captcha-invalid",
      },
      { status: 400 },
    );
  }

  return NextResponse.json({ success: true });
}