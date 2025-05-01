# For Server Developers

> Get started building your own server to use in Claude for Desktop and other clients.

In this tutorial, you'll build a simple MCP weather server and connect it to a host (Claude for Desktop). We'll start with a basic setup, then progress to more complex use cases.

---

## What We'll Be Building

Many LLMs can't fetch weather forecasts or severe weather alerts. Let's use MCP to solve that!

We'll build a server that exposes two tools: `get-alerts` and `get-forecast`. Then we'll connect the server to an MCP host (Claude for Desktop):

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/mcp/images/weather-alerts.png" alt="Weather Alerts UI" />
</Frame>
<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/mcp/images/current-weather.png" alt="Current Weather UI" />
</Frame>

<Note>
  Servers can connect to any client. We've chosen Claude for Desktop here for simplicity, but we also have guides on [building your own client](/quickstart/client) and a [list of other clients here](/clients).
</Note>

<Accordion title="Why Claude for Desktop and not Claude.ai?">
  Because servers are locally run, MCP currently only supports desktop hosts. Remote hosts are in active development.
</Accordion>

---

## Core MCP Concepts

MCP servers can provide three main types of capabilities:

1. **Resources**: File-like data that can be read by clients (like API responses or file contents)
2. **Tools**: Functions that can be called by the LLM (with user approval)
3. **Prompts**: Pre-written templates that help users accomplish specific tasks

This tutorial will primarily focus on tools.

---

## Quickstart Guides

<Tabs>
  <Tab title="Python">

See the [complete code here](https://github.com/modelcontextprotocol/quickstart-resources/tree/main/weather-server-python).

### Prerequisites

- Python 3.10+ installed
- Familiarity with Python and LLMs like Claude
- Python MCP SDK 1.2.0+

### Setup

Install `uv` and set up your project:

<CodeGroup>
  ```bash MacOS/Linux
  curl -LsSf https://astral.sh/uv/install.sh | sh
  ```
  ```powershell Windows
  powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
  ```
</CodeGroup>

Restart your terminal to ensure `uv` is available.

Create and set up your project:

<CodeGroup>
  ```bash MacOS/Linux
  uv init weather
  cd weather
  uv venv
  source .venv/bin/activate
  uv add "mcp[cli]" httpx
  touch weather.py
  ```
  ```powershell Windows
  uv init weather
  cd weather
  uv venv
  .venv\Scripts\activate
  uv add mcp[cli] httpx
  new-item weather.py
  ```
</CodeGroup>

### Building Your Server

**Import packages and set up the instance:**

```python
from typing import Any
import httpx
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("weather")
NWS_API_BASE = "https://api.weather.gov"
USER_AGENT = "weather-app/1.0"
```

**Helper functions:**

```python
async def make_nws_request(url: str) -> dict[str, Any] | None:
    headers = {"User-Agent": USER_AGENT, "Accept": "application/geo+json"}
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, headers=headers, timeout=30.0)
            response.raise_for_status()
            return response.json()
        except Exception:
            return None

def format_alert(feature: dict) -> str:
    props = feature["properties"]
    return f"""
Event: {props.get('event', 'Unknown')}
Area: {props.get('areaDesc', 'Unknown')}
Severity: {props.get('severity', 'Unknown')}
Description: {props.get('description', 'No description available')}
Instructions: {props.get('instruction', 'No specific instructions provided')}
"""
```

**Implementing tool execution:**

```python
@mcp.tool()
async def get_alerts(state: str) -> str:
    """Get weather alerts for a US state."""
    url = f"{NWS_API_BASE}/alerts/active/area/{state}"
    data = await make_nws_request(url)
    if not data or "features" not in data:
        return "Unable to fetch alerts or no alerts found."
    if not data["features"]:
        return "No active alerts for this state."
    alerts = [format_alert(feature) for feature in data["features"]]
    return "\n---\n".join(alerts)

@mcp.tool()
async def get_forecast(latitude: float, longitude: float) -> str:
    """Get weather forecast for a location."""
    points_url = f"{NWS_API_BASE}/points/{latitude},{longitude}"
    points_data = await make_nws_request(points_url)
    if not points_data:
        return "Unable to fetch forecast data for this location."
    forecast_url = points_data["properties"]["forecast"]
    forecast_data = await make_nws_request(forecast_url)
    if not forecast_data:
        return "Unable to fetch detailed forecast."
    periods = forecast_data["properties"]["periods"]
    forecasts = []
    for period in periods[:5]:
        forecast = f"""
{period['name']}:
Temperature: {period['temperature']}°{period['temperatureUnit']}
Wind: {period['windSpeed']} {period['windDirection']}
Forecast: {period['detailedForecast']}
"""
        forecasts.append(forecast)
    return "\n---\n".join(forecasts)
```

**Running the server:**

```python
if __name__ == "__main__":
    mcp.run(transport='stdio')
```

Run your server with:

```bash
uv run weather.py
```

**Configure Claude for Desktop:**

Open `claude_desktop_config.json` and add:

<Tabs>
  <Tab title="MacOS/Linux">
    ```json
    {
      "mcpServers": {
        "weather": {
          "command": "uv",
          "args": [
            "--directory",
            "/ABSOLUTE/PATH/TO/PARENT/FOLDER/weather",
            "run",
            "weather.py"
          ]
        }
      }
    }
    ```
  </Tab>
  <Tab title="Windows">
    ```json
    {
      "mcpServers": {
        "weather": {
          "command": "uv",
          "args": [
            "--directory",
            "C:\\ABSOLUTE\\PATH\\TO\\PARENT\\FOLDER\\weather",
            "run",
            "weather.py"
          ]
        }
      }
    }
    ```
  </Tab>
</Tabs>

<Warning>
  You may need to use the full path to `uv`. Use `which uv` (Mac/Linux) or `where uv` (Windows).
</Warning>

Restart Claude for Desktop.

  </Tab>
  <!-- Node, Java, Kotlin, C# tabs omitted for brevity but should be similarly formatted as above, with clear headings, code blocks, and concise instructions. -->
</Tabs>

---

## Testing Your Server with Claude for Desktop

Look for the hammer <img src="https://mintlify.s3.us-west-1.amazonaws.com/mcp/images/claude-desktop-mcp-hammer-icon.svg" style="display:inline; margin:0; height:1.3em" /> icon in Claude for Desktop.

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/mcp/images/visual-indicator-mcp-tools.png" alt="MCP Tools Indicator" />
</Frame>

After clicking the hammer, you should see two tools listed:

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/mcp/images/available-mcp-tools.png" alt="Available MCP Tools" />
</Frame>

Try commands like:

- What's the weather in Sacramento?
- What are the active weather alerts in Texas?

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/mcp/images/current-weather.png" alt="Current Weather Example" />
</Frame>
<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/mcp/images/weather-alerts.png" alt="Weather Alerts Example" />
</Frame>

<Note>
  The US National Weather Service only supports US locations.
</Note>

---

## What's Happening Under the Hood

1. The client sends your question to Claude.
2. Claude analyzes available tools and decides which to use.
3. The client executes the chosen tool(s) via the MCP server.
4. Results are sent back to Claude.
5. Claude formulates a natural language response.
6. The response is displayed to you!

---

## Troubleshooting

<AccordionGroup>
  <Accordion title="Claude for Desktop Integration Issues">
    **Getting logs from Claude for Desktop**

    Claude.app logs MCP activity in `~/Library/Logs/Claude`:

    - `mcp.log`: General MCP connections and failures.
    - `mcp-server-SERVERNAME.log`: Error logs from the named server.

    ```bash
    tail -n 20 -f ~/Library/Logs/Claude/mcp*.log
    ```

    **If your server isn't showing up:**

    1. Check your `claude_desktop_config.json` syntax.
    2. Ensure all paths are absolute.
    3. Restart Claude for Desktop.

    **If tool calls fail silently:**

    1. Check Claude's logs for errors.
    2. Verify your server builds and runs without errors.
    3. Restart Claude for Desktop.

    **Still stuck?**

    See our [debugging guide](/docs/tools/debugging).
  </Accordion>

  <Accordion title="Weather API Issues">
    **Error: Failed to retrieve grid point data**

    - Coordinates may be outside the US.
    - NWS API may be down or rate-limiting.
    - Add a delay between requests or check the NWS API status.

    **Error: No active alerts for [STATE]**

    - This just means there are no current alerts for that state.
  </Accordion>
</AccordionGroup>

<Note>
  For advanced troubleshooting, see [Debugging MCP](/docs/tools/debugging).
</Note>

---

## Next Steps

<CardGroup cols={2}>
  <Card title="Building a client" icon="outlet" href="/quickstart/client">
    Learn how to build your own MCP client that can connect to your server.
  </Card>
  <Card title="Example servers" icon="grid" href="/examples">
    Check out our gallery of official MCP servers and implementations.
  </Card>
  <Card title="Debugging Guide" icon="bug" href="/docs/tools/debugging">
    Learn how to effectively debug MCP servers and integrations.
  </Card>
  <Card title="Building MCP with LLMs" icon="comments" href="/tutorials/building-mcp-with-llms">
    Learn how to use LLMs like Claude to speed up your MCP development.
  </Card>
</CardGroup>
