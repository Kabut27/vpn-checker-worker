import { Hono } from "hono";
import { cors } from "hono/cors";

type Bindings = {
  XUI_PANEL_URL: string;
  XUI_API_TOKEN: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// CORS - ruhusu frontend yako tu
app.use(
  "*",
  cors({
    origin: ["https://vpn-checker.pages.dev", "http://localhost:3000"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

// Health check
app.get("/", (c) => c.json({ status: "VPN Checker API Running" }));

// Get client traffic by email
app.post("/api/traffic", async (c) => {
  try {
    const body = await c.req.json();
    const { email, action } = body;

    if (!email || !action) {
      return c.json({ error: "Email na action zinahitajika" }, 400);
    }

    const panelUrl = c.env.XUI_PANEL_URL;
    const token = c.env.XUI_API_TOKEN;

    if (!panelUrl || !token) {
      return c.json({ error: "Server configuration missing" }, 500);
    }

    let endpoint = "";
    
    if (action === "getClientTraffic") {
      endpoint = `/panel/api/inbounds/getClientTraffics/${encodeURIComponent(email)}`;
    } else if (action === "listInbounds") {
      endpoint = `/panel/api/inbounds/list`;
    } else if (action === "getClientIps") {
      endpoint = `/panel/api/inbounds/clientIps/${encodeURIComponent(email)}`;
    } else {
      return c.json({ error: "Invalid action" }, 400);
    }

    const response = await fetch(`${panelUrl}${endpoint}`, {
      method: action === "listInbounds" ? "GET" : "POST",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return c.json(
        { error: `3x-ui Error: ${errorText}` },
        response.status as any
      );
    }

    const data = await response.json();
    return c.json(data);

  } catch (error: any) {
    return c.json({ error: error.message || "Internal error" }, 500);
  }
});

// Admin verify endpoint
app.post("/api/admin/verify", async (c) => {
  try {
    const body = await c.req.json();
    const { token } = body;

    if (!token) {
      return c.json({ error: "Token required" }, 400);
    }

    // Verify kwa kufetch list inbounds
    const panelUrl = c.env.XUI_PANEL_URL;
    const apiToken = c.env.XUI_API_TOKEN;

    const response = await fetch(`${panelUrl}/panel/api/inbounds/list`, {
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${apiToken}`,
      },
    });

    if (!response.ok) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    return c.json({ success: true });

  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

export default app;
