#!/bin/bash

echo "🚀 Setting up Supabase MCP for Kiro..."

# Check if uv is installed
if ! command -v uv &> /dev/null; then
    echo "📦 Installing uv (Python package manager)..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
    
    # Add uv to PATH for current session
    export PATH="$HOME/.cargo/bin:$PATH"
    
    echo "✅ uv installed successfully!"
else
    echo "✅ uv is already installed"
fi

# Test uv installation
echo "🧪 Testing uv installation..."
uv --version

# Test Supabase MCP server
echo "🧪 Testing Supabase MCP server..."
uvx mcp-server-supabase --help

echo ""
echo "🎉 Setup complete! Next steps:"
echo "1. Get your Supabase Service Role Key from: https://supabase.com/dashboard/project/kepvtlgmtwhjsryfqexg/settings/api"
echo "2. Update .kiro/settings/mcp.json with your service role key"
echo "3. Restart Kiro to load the MCP configuration"
echo "4. Test MCP tools in Kiro chat"

echo ""
echo "⚠️  Important: Keep your service role key secure - it has admin access to your database!"