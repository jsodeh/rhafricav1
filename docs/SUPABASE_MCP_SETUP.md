# Supabase MCP Setup Guide for Kiro

## Overview
This guide walks you through setting up Supabase MCP (Model Context Protocol) in Kiro, which allows you to interact with your Supabase database directly through chat.

## Prerequisites
- Kiro IDE installed
- Supabase project created
- Terminal access

## Step-by-Step Setup

### 1. Install UV (Python Package Manager)

Choose one of these methods:

**Option A: Using curl (Recommended)**
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

**Option B: Using Homebrew**
```bash
brew install uv
```

**Option C: Using pip**
```bash
pip install uv
```

After installation, restart your terminal or run:
```bash
source ~/.bashrc  # or ~/.zshrc for zsh users
```

### 2. Get Your Supabase Service Role Key

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to **Settings** → **API**
3. Copy the **service_role** key (NOT the anon key)
4. ⚠️ **Important**: This key has admin privileges - keep it secure!

### 3. Update MCP Configuration

Edit `.kiro/settings/mcp.json` and replace `your_service_role_key_here` with your actual service role key:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "uvx",
      "args": ["mcp-server-supabase"],
      "env": {
        "SUPABASE_URL": "https://kepvtlgmtwhjsryfqexg.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "your_actual_service_role_key_here",
        "FASTMCP_LOG_LEVEL": "INFO"
      },
      "disabled": false,
      "autoApprove": [
        "list_tables",
        "describe_table",
        "select_data",
        "get_table_info",
        "count_rows",
        "get_schema"
      ]
    }
  }
}
```

### 4. Test the Setup

Run the setup script:
```bash
./scripts/setup-supabase-mcp.sh
```

Or test manually:
```bash
# Test uv installation
uv --version

# Test Supabase MCP server
uvx mcp-server-supabase --help
```

### 5. Restart Kiro

1. Close Kiro completely
2. Reopen Kiro
3. The MCP server should automatically connect

### 6. Test MCP Tools in Kiro

Try these commands in Kiro chat:

```
List all tables in my database
```

```
Show me the structure of the properties table
```

```
How many properties are in my database?
```

```
Show me the first 5 properties
```

## Available MCP Tools

### Supabase Tools
- `list_tables` - List all tables in your database
- `describe_table` - Get table structure and column info
- `select_data` - Query data from tables
- `get_table_info` - Get detailed table information
- `count_rows` - Count rows in a table
- `get_schema` - Get database schema information

### Filesystem Tools (Bonus)
- `read_file` - Read file contents
- `list_directory` - List directory contents

## Troubleshooting

### Common Issues

**1. "uvx command not found"**
- Make sure uv is installed and in your PATH
- Restart your terminal after installation
- Try: `source ~/.bashrc` or `source ~/.zshrc`

**2. "Permission denied" errors**
- Check your service role key is correct
- Ensure RLS policies allow the operations you're trying

**3. "Connection failed"**
- Verify your Supabase URL is correct
- Check your internet connection
- Ensure your Supabase project is active

**4. MCP server not connecting**
- Restart Kiro completely
- Check the MCP configuration syntax in `.kiro/settings/mcp.json`
- Look for errors in Kiro's MCP server view

### Debug Mode

Enable debug logging by changing:
```json
"FASTMCP_LOG_LEVEL": "DEBUG"
```

## Security Notes

⚠️ **Important Security Considerations:**

1. **Service Role Key**: Has admin access to your database
2. **Never commit**: Add `.kiro/settings/mcp.json` to `.gitignore`
3. **Environment Variables**: Consider using environment variables for keys
4. **Access Control**: Be careful with auto-approved tools

## Advanced Configuration

### Environment Variables Approach

Instead of hardcoding keys, you can use environment variables:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "uvx",
      "args": ["mcp-server-supabase"],
      "env": {
        "SUPABASE_URL": "${SUPABASE_URL}",
        "SUPABASE_SERVICE_ROLE_KEY": "${SUPABASE_SERVICE_ROLE_KEY}",
        "FASTMCP_LOG_LEVEL": "INFO"
      }
    }
  }
}
```

Then set environment variables:
```bash
export SUPABASE_URL="https://kepvtlgmtwhjsryfqexg.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
```

### Custom Auto-Approve List

Customize which tools are auto-approved:

```json
"autoApprove": [
  "list_tables",
  "describe_table",
  "select_data"
]
```

Remove tools you want manual approval for.

## Next Steps

Once MCP is set up, you can:

1. **Query your database** directly through chat
2. **Analyze data** with natural language
3. **Debug issues** by inspecting table structures
4. **Monitor data** by checking row counts and recent entries
5. **Generate reports** by combining multiple queries

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify your Supabase project is accessible
3. Test the MCP server manually with `uvx mcp-server-supabase --help`
4. Check Kiro's MCP server logs in the IDE

Happy coding! 🚀