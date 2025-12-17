
![n8n_Workflow](./screen.png)

## How to Run

```bash
docker build -t mcp-server .

docker run -p 3000:3000 mcp-server
```

create a Port 3000, make it Public and assign the URL to the n8n

# to use it with Claude Desktop

To use the Dockerized server with Claude Desktop, update your config file (located at ~/Library/Application Support/Claude/claude_desktop_config.json on macOS).

Instead of running node directly, you will tell Claude to run the docker command. The -i flag is crucial as it keeps the input stream open for MCP communication.

```bash
{
  "mcpServers": {
    "rechtsinformationen-bund-de": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "rechtsinformationen-mcp"
      ]
    }
  }
}
```


# Rechtsinformationen Bund DE MCP Server

An MCP (Model Context Protocol) server that provides access to the official German Federal Legal Information Portal (rechtsinformationen.bund.de). **Any AI agent can use this server for German legal questions** to provide authoritative, fact-based answers with proper legal citations from official sources.

## 🚀 Quick Setup

**The fastest way to get started:**

1. **Run the setup script:**
```bash
./quick-setup.sh
```

2. **Restart Claude Desktop completely** (or your MCP client)

3. **Test with:** "Wie lange kann ich in Elternzeit gehen?"

## 🎯 What This Server Provides

**AI agents will automatically use this MCP server for:**
- **German legal questions** ("What happens if I miss a Jobcenter appointment?")
- **Legal rights and obligations** ("How long can I take parental leave?")
- **Court decisions and precedents** ("Recent BGH decisions on trademark law")
- **Specific law lookups** ("What does § 32 SGB II say?")
- **Administrative law questions** ("When do I need a hearing in administrative proceedings?")

**Purpose:** Ensures all German legal answers are grounded in official sources with proper citations.

## ✨ Features

### Core Capabilities
- **Full-text search** across German federal laws and legislation
- **Case law search** through German federal court decisions (BGH, BVerfG, BAG, BFH, BSG, BVerwG)
- **Intelligent search** with English-to-German translation and misconception correction
- **German compound word decomposition** (e.g., "Mieterhöhungsantrag" → "Mieterhöhung")
- **HTML URLs for users** (clickable, readable documents)
- **Model-agnostic** - works with Claude, Qwen, DeepSeek, LLaMA, and other models

### Recent Improvements (2025-10-06)
✅ **HTML URLs**: Returns human-readable web links, not just JSON API URLs
✅ **Compound word handling**: Decomposes German compound words for better search
✅ **Fallback search**: Never returns zero results for valid queries
✅ **English translation**: Automatically translates English legal terms to German
✅ **Type coercion**: Works with models that pass strings instead of numbers

## 📚 Available Tools

The server provides **6 specialized tools** with intelligent routing:

### 1. 🧠 semantische_rechtssuche (PRIMARY TOOL)
**Intelligent Legal Search** - Use this FIRST for any German legal question

**What it does automatically:**
- ✓ Translates English → German ("employee rights" → "Arbeitnehmerrechte")
- ✓ Corrects misconceptions ("Überprüfungsantrag" → "Widerspruch")
- ✓ Extracts legal references (§ patterns)
- ✓ Searches multiple related terms
- ✓ Returns both legislation AND case law

**What it does NOT do:**
- ✗ Does NOT generate semantically similar terms (agent must provide variations)
- ✗ Does NOT try multiple query phrasings automatically
- ✗ Does NOT use ML embeddings (uses keyword matching + Fuse.js fuzzy search)

**Parameters:**
- `query` (required): Search query in German or English
- `threshold` (optional): Fuzzy match threshold 0.0-1.0 (default: 0.3)
- `limit` (optional): Max results (default: 10, max: 100)

**URLs returned:**
```
🌐 READ ONLINE (HTML): https://testphase.rechtsinformationen.bund.de/.../regelungstext-1.html
📊 API ACCESS (JSON): https://testphase.rechtsinformationen.bund.de/v1/legislation/...
```

### 2. 🇩🇪 deutsche_gesetze_suchen (SECONDARY TOOL)
Search German federal legislation (laws, ordinances)

**When to use:**
- Follow-up after semantische_rechtssuche
- Legislation-only results needed
- Searching for specific law abbreviations (BEEG, BGB, SGB)

**Limitations:**
⚠️ Date filters may exclude relevant results

### 3. ⚖️ rechtsprechung_suchen (SECONDARY TOOL)
Search German court decisions

**When to use:**
- Follow-up after semantische_rechtssuche
- Court-specific filtering needed
- Searching for specific judges or case types

**Common courts:**
- BGH (Federal Court of Justice)
- BVerfG (Constitutional Court)
- BAG (Federal Labour Court)
- BFH (Federal Fiscal Court)
- BSG (Federal Social Court)
- BVerwG (Federal Administrative Court)

### 4. 🔍 alle_rechtsdokumente_suchen (SECONDARY TOOL)
Comprehensive search across all document types

**When to use:**
- After other specialized tools
- Mixed results needed (legislation + case law)
- Broad topic exploration

### 5. 📄 dokument_details_abrufen (RETRIEVAL TOOL)
Get full text of specific documents

**When to use:**
- After finding document in search results
- Need complete document text (searches only return snippets)
- Want HTML or XML format

### 6. 🏛️ gesetz_per_eli_abrufen (RETRIEVAL TOOL)
Get legislation by ELI identifier

**When to use:**
- Have specific ELI from search results
- Need exact version/date of legislation

## 🤖 Model Compatibility

### Tested & Working
- ✅ **Claude 3.5 Sonnet** - Excellent tool selection, proper citations
- ✅ **Qwen 2.5-72B** - Best open-source option, good German support
- ✅ **DeepSeek-R1** - Strong reasoning, needs recursion limit
- ✅ **LLaMA 3.3-70B** - Reliable, good for straightforward queries
- ✅ **GLM-4.6** - Works with type coercion fixes

### Recommended Agent Configuration (LibreChat)

For best results with any model:

```json
{
  "name": "German Legal Research Assistant",
  "description": "Searches official German legal database",
  "model": "qwen2.5:72b",
  "tools": [
    "mcp__rechtsinformationen__semantische_rechtssuche",
    "mcp__rechtsinformationen__deutsche_gesetze_suchen",
    "mcp__rechtsinformationen__rechtsprechung_suchen"
  ],
  "recursionLimit": 5,
  "temperature": 0.3,
  "instructions": "CRITICAL: Always use semantische_rechtssuche FIRST. If search returns results, STOP immediately and generate answer. Maximum 2-3 tool calls total. MUST include ALL URLs in 'Quellen:' or 'Sources:' section."
}
```

**Key settings:**
- `recursionLimit: 5` - Prevents endless searching
- `temperature: 0.3` - More deterministic for legal queries
- Stop condition - Generate answer immediately after finding results

## 📦 Installation

### Quick Setup
```bash
git clone <repo-url>
cd rechtsinformationen
./quick-setup.sh
```

### Manual Installation
```bash
npm install
npm run build
npm test  # Should show passing tests
```

### Claude Desktop Configuration

**macOS:** Edit `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "rechtsinformationen": {
      "command": "node",
      "args": ["/absolute/path/to/rechtsinformationen/dist/index.js"]
    }
  }
}
```

**Windows:** Edit `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "rechtsinformationen": {
      "command": "node",
      "args": ["C:\\absolute\\path\\to\\rechtsinformationen\\dist\\index.js"]
    }
  }
}
```

**Important:**
- Use absolute paths (not relative like `./dist/index.js`)
- Restart Claude Desktop completely after config changes
- Run `npm run check-config` to verify setup

### LibreChat Agent Configuration

For optimal performance with LibreChat and Ollama models (Qwen, DeepSeek, LLaMA):

```json
{
  "name": "German Legal Research Assistant",
  "model": "qwen2.5:72b",
  "provider": "ollama",
  "recursionLimit": 5,
  "temperature": 0.3,
  "instructions": "CRITICAL RULES:\n- MAXIMUM 2-3 tool calls per query\n- STOP searching after finding 3+ relevant documents\n- ALWAYS include URLs in 'Quellen' section\n- Use semantische_rechtssuche first\n\nCitation Format (MANDATORY):\n## Quellen\n1. [Law name] - [URL]\n2. [Law name] - [URL]",
  "tools": [
    "semantische_rechtssuche_mcp_rechtsinformationen",
    "deutsche_gesetze_suchen_mcp_rechtsinformationen",
    "rechtsprechung_suchen_mcp_rechtsinformationen"
  ]
}
```

**Key Settings:**
- **recursionLimit: 5** - Prevents endless searching (typical issue with some models)
- **temperature: 0.3** - Accuracy over creativity for legal research
- **STOP instructions** - Forces agent to synthesize answer after finding results
- **Citation requirements** - Mandatory URL inclusion in responses

See [LIBRECHAT_AGENT_CONFIG.md](LIBRECHAT_AGENT_CONFIG.md) for complete configuration details.

## 🧪 Testing & Evaluation

### Run Tests
```bash
# Run golden test cases
npm test

# Test API connectivity
npm run test:api

# Verify complete setup
npm run verify
```

### Agentic Evaluation

To evaluate agent performance with different models:

```bash
# Analyze LibreChat conversation exports
node tests/eval-simple.js tests/your-conversation.json
```

**Metrics tracked:**
- Tool call efficiency (target: ≤3 calls)
- Document accuracy (found correct ECLI/ELI)
- Citation completeness (URLs in sources)
- Recursion safety (no limit hits)
- Answer quality (comprehensive + cited)

See [AGENTIC_EVAL_GUIDE.md](AGENTIC_EVAL_GUIDE.md) for detailed evaluation framework.

## 🔧 Troubleshooting

### Common Issues

#### 1. No Search Results
```bash
# Test API connectivity
npm run test:api

# Check if you have internet connection
curl https://testphase.rechtsinformationen.bund.de/v1/legislation
```

#### 2. Server Won't Start
```bash
# Check Node.js version (needs v18+)
node --version

# Rebuild
npm install && npm run build
```

#### 3. Recursion Limit Hit
**Symptom:** Agent makes 10+ tool calls without stopping

**Solution:**
- Set `recursionLimit: 5` in agent config
- Add explicit STOP instructions
- Use semantische_rechtssuche as primary tool

#### 4. Missing Citations in Output
**Symptom:** Agent doesn't include URLs despite MCP response containing them

**Solution:**
- This is a model behavior issue, not server issue
- Strengthen instructions: "MUST include ALL URLs"
- Consider agentic architecture with dedicated citation agent

#### 5. Schema Validation Errors
**Symptom:** "Received tool input did not match expected schema"

**Solution:** ✅ Fixed - server now handles string→number type coercion

## 📖 Usage Examples

### Simple Query
```
User: "Wie lange kann ich in Elternzeit gehen?"

Agent: Uses semantische_rechtssuche("Elternzeit Dauer")
→ Finds BEEG § 15
→ Answer: Up to 3 years per child

Sources:
1. https://testphase.rechtsinformationen.bund.de/.../regelungstext-1.html
```

### Compound Word Query
```
User: "Was passiert bei einem Mieterhöhungsantrag?"

Agent: Uses semantische_rechtssuche("Mieterhöhungsantrag")
→ Decomposes to "Mieterhöhung"
→ Finds § 558 BGB
→ Answer: Rent increase procedures

Sources:
1. https://testphase.rechtsinformationen.bund.de/.../regelungstext-1.html
```

### English Query
```
User: "What are employee rights during company restructuring?"

Agent: Uses semantische_rechtssuche(translates to "Arbeitnehmerrechte Betriebsumstrukturierung")
→ Finds KSchG, BetrVG
→ Answer: Dismissal protection and works council participation

Sources:
1. https://testphase.rechtsinformationen.bund.de/.../regelungstext-1.html
```

## 🏗️ Architecture

### How It Works

```
User Query
    ↓
AI Agent (Claude/Qwen/etc)
    ↓
MCP Server (this project)
    ↓
rechtsinformationen.bund.de API
    ↓
German Federal Legal Database
```

**Communication:** Local stdio (no HTTP ports)
**Data Flow:** Real-time API calls for each query
**URLs:** Returns both HTML (users) and JSON (developers)

### Intelligent Search Features

**1. English Translation**
```typescript
"employee rights" → "Arbeitnehmerrechte"
"data protection" → "Datenschutz"
"dismissal" → "Kündigung"
```

**2. Misconception Correction**
```typescript
"Überprüfungsantrag" → ["Widerspruch", "Rücknahme", "Widerruf"]
"§ 535 BGB Mieterhöhung" → "§ 558 BGB" (correct law)
```

**3. Compound Word Decomposition**
```typescript
"Mieterhöhungsantrag" → "Mieterhöhung" (309 results)
"Kündigungsschutzantrag" → "Kündigungsschutz"
"Sozialhilfeantrag" → "Sozialhilfe"
```

**4. Legal Reference Extraction**
```typescript
Detects: § 44 SGB X, Art. 3 GG, § 558 Abs. 2 BGB
Validates: Law abbreviations (BEEG, BGB, SGB, etc.)
```

## 📊 API Source

**Base URL:** `https://testphase.rechtsinformationen.bund.de/v1`
**Documentation:** https://docs.rechtsinformationen.bund.de
**Standards:** ELI (European Legislation Identifier), ECLI (European Case Law Identifier)
**Status:** Trial service - may be subject to changes

**Coverage:**
- ✅ Current federal legislation
- ✅ Federal court decisions (2010-2024)
- ✅ Historical versions of laws
- ⚠️ Amendment laws (partial coverage)
- ❌ Legislative materials (not included)

## ⚠️ Known Limitations

### 1. Date Filtering Issues
**Problem:** Temporal filters may exclude relevant results when laws enacted in one year become effective in another.

**Example:** Searching for "§ 44 SGB X Änderung 2021" with date filter 2021 misses the 7. SGB-IV-Änderungsgesetz from June 2020 (effective January 1, 2021).

**Workaround:** Search without date filters, manually review effective dates.

### 2. Amendment Law Discovery
**Problem:** Amendment laws are poorly indexed and may not show which paragraphs they modify.

**Workaround:**
- Search for "BGBl [year]" to find Federal Law Gazette entries
- Look for "Artikelgesetz" or amendment law names
- Search effective dates like "2021-01-01 Inkrafttreten"

### 3. Historical Versions
**Problem:** Only current versions easily accessible through ELI identifiers.

**Workaround:** Search Federal Law Gazette references for specific dates.

### 4. Model Behavior
**Citations not appearing:** Some models ignore citation instructions despite clear guidance in MCP response. This is a model limitation, not server issue.

**Solution:** Use agent configuration with explicit citation requirements or consider multi-agent architecture.

## 🚀 Recent Fixes (2025-10-06)

### Major Improvements

✅ **HTML URLs for Users**
- Returns clickable HTML links instead of JSON API URLs
- Users can now read laws in browsers
- Both HTML and JSON URLs provided

✅ **German Compound Word Handling**
- Decomposes "Mieterhöhungsantrag" → "Mieterhöhung"
- Removes suffixes: -antrag, -verfahren, -klage, -gesetz, -verordnung
- Special handling for common legal terms

✅ **Fallback Search**
- Never returns zero results for valid queries
- Searches with original query if no legal references found
- Provides helpful suggestions when nothing found

✅ **Type Coercion**
- Handles models passing "10" (string) instead of 10 (number)
- Schema validation now works with GLM-4.6 and similar models

✅ **Model-Agnostic Instructions**
- Removed Claude-specific language
- Works with any AI model
- Clear imperative instructions

## 📝 Development

### Build Commands
```bash
npm run build       # Compile TypeScript
npm run dev         # Development mode with tsx
npm start           # Run production build
npm test            # Run test suite
```

### Helper Commands
```bash
npm run claude-config  # Generate config for Claude Desktop
npm run check-config   # Show config file path
npm run verify         # Complete verification
npm run setup          # Install + build + test
```

### Project Structure
```
src/
├── index.ts                 # Main MCP server
tests/
├── golden_case_tests.json   # Test cases
├── test-golden.js           # Test runner
├── eval-simple.js           # Agent evaluation
debug/
├── test-*.js                # API debugging tools
```

## 🤝 Contributing

Contributions welcome! Areas for improvement:

1. **More compound word patterns** - Expand German word decomposition
2. **Better concept mappings** - Add common legal misconceptions
3. **English translation coverage** - More legal term translations
4. **Historical version access** - Better handling of law amendments
5. **Literature search** - Add `/v1/literature` endpoint support

## 📄 License

MIT

## 🔗 Related Documentation

- [CLAUDE.md](CLAUDE.md) - Detailed instructions for Claude Code
- [AGENTIC_EVAL_GUIDE.md](AGENTIC_EVAL_GUIDE.md) - Agent evaluation framework
- [LIBRECHAT_AGENT_CONFIG.md](LIBRECHAT_AGENT_CONFIG.md) - LibreChat configuration
- [RECOMMENDED_MODELS.md](RECOMMENDED_MODELS.md) - Model comparison and recommendations
- [FIXES_APPLIED.md](FIXES_APPLIED.md) - Detailed change log

---

**Last Updated:** 2025-10-06
**Version:** 1.1.0
**Status:** Production-ready with test phase API
