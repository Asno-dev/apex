import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { topic, slideNumber, prompt, precedingSlides = [] } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;

    // Standard high-quality deterministic design templates for seamless offline-first fallback
    const systemPromptText = `You are PRESENT OS Design Director and Story Architect.
Your task is to generate Slide #${slideNumber} (one slide only) of a stunning pitch deck or presentation about the topic: "${topic}".
The slide description or context given by the user is: "${prompt}".

The presentation structure should be cinematic and highly professional. Following are the preceding slides in the deck:
${JSON.stringify(precedingSlides)}

Based on the preceding slides, decide the optimal type and layout for this slide to maintain a beautiful, fluid story arc (Beginning -> Conflict -> Solution -> TAM/Charts -> 3D isometric systems -> Interactive features -> Call to Action).

Choose ONE slide type from: "hero", "statistic", "problem", "solution", "grid", "data", "timeline", "cta".
Choose ONE layout from: "full-bleed", "split-left", "split-right", "magazine", "isometric-grid".

You must output a single, valid JSON object matching this schema. Do not enclose it in markdown blocks, output raw JSON only:
{
  "slide_id": "s${slideNumber}",
  "type": "hero|statistic|problem|solution|grid|data|timeline|cta",
  "layout": "full-bleed|split-left|split-right|magazine|isometric-grid",
  "background": {
    "type": "gradient|starfield|mesh|solid",
    "bg_color": "hex",
    "gradient_from": "hex",
    "gradient_to": "hex"
  },
  "headline": "A grand, punchy, Apple-level heading",
  "subheadline": "A structured, insightful subtitle supporting the heading",
  "body": "Rich text description, or bullet items separated by '\\n'",
  "statistic": {
    "value": "78%",
    "label": "Total TAM Capture"
  },
  "interactiveWidget": {
    "type": "poll|form|simulated-agent|slider",
    "question": "What is your main priority?",
    "options": ["Speed", "Design Quality", "Customizability"]
  },
  "diagram": {
    "type": "flowchart|architecture|roadmap",
    "nodes": [
      {"label": "Insight", "desc": "Agent research"},
      {"label": "Direct Design", "desc": "Theme orchestration"},
      {"label": "Execute", "desc": "Export asset"}
    ]
  },
  "chart": {
    "type": "donut|bar|line",
    "dataPoints": [
      {"name": "TAM", "value": 140},
      {"name": "SAM", "value": 85},
      {"name": "SOM", "value": 30}
    ]
  },
  "speaker_notes": "Presenting talking points guiding the live run.",
  "visual_prompt": "A highly detailed, cinematic, Midjourney-quality visual prompt describing this slide's core visual idea."
}`;

    if (!apiKey) {
      // Return procedural fallback slide structures curated based on the slide count to feel completely real
      const fallbackSlide = generateProceduralSlide(topic, slideNumber, prompt);
      return NextResponse.json({ success: true, slide: fallbackSlide, fallbackUsed: true });
    }

    try {
      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: systemPromptText }],
              },
            ],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.7,
            },
          }),
        }
      );

      if (!resp.ok) {
        throw new Error(`Gemini API returned status: ${resp.status}`);
      }

      const rawJson = await resp.json();
      const contentText = rawJson.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!contentText) {
        throw new Error("No slide content generated from API.");
      }

      const parsedSlide = JSON.parse(contentText);
      return NextResponse.json({ success: true, slide: parsedSlide });
    } catch (apiErr: any) {
      console.warn("Direct Gemini call failed, returning premium procedural fallback slide:", apiErr.message);
      const fallbackSlide = generateProceduralSlide(topic, slideNumber, prompt);
      return NextResponse.json({ success: true, slide: fallbackSlide, fallbackUsed: true, error: apiErr.message });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// Generates incredibly high-fidelity, customized slides procedurally when no API key is available
function generateProceduralSlide(topic: string, slideNumber: number, prompt: string) {
  const normalizedPrompt = (prompt || "").toLowerCase();
  const normalizedTopic = (topic || "").toLowerCase();

  // Color theme generator based on slide number and topic
  let themeColors = {
    gradient_from: "#4f46e5", // Indigo
    gradient_to: "#06b6d4",   // Cyan
    bg_color: "#0a0a0f",
    type: "gradient" as const
  };

  if (slideNumber === 1 || slideNumber % 4 === 1) {
    // Hero splash
    themeColors.gradient_from = "#3b82f6"; // Blue
    themeColors.gradient_to = "#8b5cf6";   // Purple
    themeColors.type = "mesh";
  } else if (slideNumber % 4 === 2) {
    // Problem / Stats
    themeColors.gradient_from = "#f43f5e"; // Rose
    themeColors.gradient_to = "#d946ef";   // Fuchsia
    themeColors.type = "gradient";
  } else if (slideNumber % 4 === 3) {
    // Tech Content / Data
    themeColors.gradient_from = "#10b981"; // Emerald
    themeColors.gradient_to = "#3b82f6";   // Blue
    themeColors.type = "solid";
    themeColors.bg_color = "#09090b";
  } else {
    // Solutions / Pitch CTA
    themeColors.gradient_from = "#f59e0b"; // Amber
    themeColors.gradient_to = "#ef4444";   // Red
    themeColors.type = "starfield";
  }

  // Multi-type slide generation logic
  if (slideNumber === 1) {
    return {
      slide_id: "s1",
      type: "hero",
      layout: "full-bleed",
      background: themeColors,
      headline: topic ? `${topic.toUpperCase()}: The Next Frontier` : "PRESENT OS ENGINE",
      subheadline: prompt || "Redefining cinematic slides and spatial storytelling through multi-agent collaboration.",
      body: "• Real-time Agentic Storyboards\n• Immersive 3D Render Spheres\n• Reactive SVG Interactive Schematics",
      speaker_notes: `Welcome everyone. Today, I am proud to showcase our core vision for ${topic || "this initiative"}. This pitch represents a radical leap in presentation creation, powered entirely by asynchronous AI agents mapping concepts in real-time.`,
      visual_prompt: `Cinematic wide-angle aerial shot of futuristic digital nodes floating in an endless dark starfield, glowing electric cyan and neon violet, photorealistic, 8K, luxury asset`,
      interactiveWidget: {
        type: "slider",
        question: "Adjust Interactive Presentation Depth:",
        options: ["Minimalist Overview", "Standard Core Deck", "Immersive Interactive Simulation"]
      }
    };
  }

  // Problem slide (Slide 2)
  if (slideNumber === 2 || normalizedPrompt.includes("problem") || normalizedPrompt.includes("conflict")) {
    return {
      slide_id: `s${slideNumber}`,
      type: "problem",
      layout: "split-left",
      background: themeColors,
      headline: "The Friction Point in Today's Ecosystem",
      subheadline: "Static slides limit conversion. Traditional layouts are linear, flat, and fail to evoke real participant interaction.",
      body: "❌ All slides generated at once causes uniform text soup\n❌ Monotonous white backgrounds lacking sensory polish\n❌ Complete absence of 3D objects, custom maps, or live components",
      statistic: {
        value: "84%",
        label: "Retention loss during non-interactive static pitches"
      },
      speaker_notes: "Let's align on the root problem. Most slides fail because they ignore human cognitive patterns. Bullet text points cause visual exhaustion, while dynamic elements drive high engagement.",
      visual_prompt: "Documentary-style shallow depth of field portrait of a designer with eyes closed in concentration, desaturated copper background screen lines, editorial matte",
      diagram: {
        type: "flowchart",
        nodes: [
          { label: "Boring Deck", desc: "Uniform linear slides" },
          { label: "Attention Drops", desc: "No dynamic feedback nodes" },
          { label: "Lost Opportunity", desc: "Audience exits mentally" }
        ]
      }
    };
  }

  // Data / Trends (Slide 3)
  if (slideNumber === 3 || normalizedPrompt.includes("data") || normalizedPrompt.includes("market") || normalizedPrompt.includes("chart")) {
    return {
      slide_id: `s${slideNumber}`,
      type: "data",
      layout: "split-right",
      background: themeColors,
      headline: "Market Trajectory & Growth Horizon",
      subheadline: "Quantitating the sheer demand with verifiable metrics curated across key platforms.",
      body: "• Addressable Market Expansion (TAM): $4.8B by Q4\n• Integrated Workspace Adoption rate spikes 2.4X\n• White-label direct client conversion metrics shine",
      chart: {
        type: "donut",
        dataPoints: [
          { name: "Enterprise Hubs", value: 45 },
          { name: "Direct Designers", value: 35 },
          { name: "Global Agencies", value: 20 }
        ]
      },
      statistic: {
        value: "2.4X",
        label: "Year-on-Year Expansion"
      },
      speaker_notes: "The market signals are highly decisive. By shifting from static slide documents to fully reactive visual platforms, we capture and maintain double the attention bandwidth.",
      visual_prompt: "Sleek isometric 3D chart displaying double-ring donuts floating in dark void, emerald green and cyber-blue gradients, studio rim light, 8K asset"
    };
  }

  // Solution Slide / Schema
  if (normalizedPrompt.includes("solution") || normalizedPrompt.includes("features") || slideNumber === 4) {
    return {
      slide_id: `s${slideNumber}`,
      type: "solution",
      layout: "magazine",
      background: themeColors,
      headline: "The Architecture of PRESENT OS",
      subheadline: "A multi-agent design matrix generating cinematic slides page by page.",
      body: "🤖 Story Architect Agent maps investor-grade emotional hooks\n🎨 Design Director Agent auto-propositions font pair tokens\n🌀 Motion Agent builds fluid micro-animations dynamically",
      diagram: {
        type: "roadmap",
        nodes: [
          { label: "Phase 1: Story Architect", desc: "Determines logical sequencing of narrative conflict" },
          { label: "Phase 2: Designer Sandbox", desc: "Selects colors and custom SVG diagram layouts" },
          { label: "Phase 3: Spatial Engine", desc: "Compiles WebGL rotatable 3D wireframe scenes" }
        ]
      },
      speaker_notes: "Our solution is not just an editing board—it is an intelligent agent workspace. Every slide is customized dynamically under strict supervision of specialized design systems.",
      visual_prompt: "Exploded blueprint schematic of a floating circular microprocessor showing high-contrast electrical lines glowing in golden light, black matte finish, 8K",
      interactiveWidget: {
        type: "poll",
        question: "Vote for the defining feature:",
        options: ["Agentic Slide Generator", "WebGL 3D Meshes", "Responsive Embedded Flowcharts"]
      }
    };
  }

  // Dynamic Fallback slides
  return {
    slide_id: `s${slideNumber}`,
    type: "solution",
    layout: "full-bleed",
    background: themeColors,
    headline: `Pivotal Element #${slideNumber}: Core Integration`,
    subheadline: `A customized conceptual module mapping "${prompt || "Next key insights"}".`,
    body: "• Seamless visual alignment engineered via specialized modules\n• Absolute interactive authority given to presenters\n• Cross-functional diagram nodes showing live state flows",
    speaker_notes: `Let's deep dive into Slide ${slideNumber}. Here, the agents mapped this specific topic item. We can interactively configure the element margins or toggle the custom color contrast parameters.`,
    visual_prompt: `Sleek architectural structural schematic of a glass skyscraper at night, deep copper and teal shadows, glossy texture, rendering style`,
    diagram: {
      type: "architecture",
      nodes: [
        { label: "Inbound Intent", desc: "System triggers topic parsing" },
        { label: "Design Synthesis", desc: "Renders layout matrix patterns" },
        { label: "Live Deployment", desc: "Client visualizes smooth animations" }
      ]
    }
  };
}
