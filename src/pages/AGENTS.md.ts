// Serves the raw AGENTS.md at /AGENTS.md so visitors can download / reuse it.
import raw from '../ai/AGENTS.md?raw';

export function GET() {
  return new Response(raw, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
}
