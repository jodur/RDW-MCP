# NPM Publishing Guide for RDW MCP Server

## Prerequisites

1. **npm account**: Create account at https://www.npmjs.com/signup
2. **npm CLI**: Ensure npm is installed and updated
3. **Git repository**: Push your code to GitHub (optional but recommended)

## Step-by-Step Publishing Process

### 1. Setup npm Account

```bash
# Login to npm
npm login

# Verify login
npm whoami
```

### 2. Prepare for Publishing

```bash
# Build the project
npm run build

# Test the package locally
npm pack

# This creates a .tgz file you can inspect
```

### 3. Test Installation Locally

```bash
# Install the packed version locally
npm install -g ./rdw-mcp-server-1.0.0.tgz

# Test the command
rdw-mcp --help
```

### 4. Version Management

```bash
# Patch version (1.0.0 -> 1.0.1)
npm version patch

# Minor version (1.0.0 -> 1.1.0)
npm version minor

# Major version (1.0.0 -> 2.0.0)
npm version major
```

### 5. Publish to npm

```bash
# Dry run to see what would be published
npm publish --dry-run

# Publish to npm
npm publish

# For scoped packages (if using @yourname/rdw-mcp-server)
npm publish --access public
```

### 6. Post-Publishing

```bash
# Check your package
npm info rdw-mcp-server

# Test installation
npm install -g rdw-mcp-server
```

## Package Configuration Details

### Key package.json fields for npm:

- **name**: Must be unique on npm registry
- **version**: Semantic versioning (major.minor.patch)
- **description**: Shown in npm search
- **keywords**: Help users find your package
- **main**: Entry point for require()
- **bin**: Command-line executable
- **files**: What gets included in the package
- **engines**: Node.js version requirements
- **repository**: GitHub repository URL
- **bugs**: Issue tracker URL
- **homepage**: Package homepage

### Files Included in Package:

The `.npmignore` and `files` field in package.json control what gets published:

✅ **Included:**
- `build/` - Compiled JavaScript
- `README.md` - Package documentation
- `LICENSE` - License file
- `package.json` - Package configuration

❌ **Excluded:**
- `src/` - TypeScript source files
- `node_modules/` - Dependencies
- `.git/` - Git repository
- Development and test files

## Testing Your Published Package

### 1. Global Installation Test

```bash
# Uninstall any local version
npm uninstall -g rdw-mcp-server

# Install from npm
npm install -g rdw-mcp-server

# Test the command
rdw-mcp
```

### 2. Local Project Test

```bash
# In a test directory
mkdir test-rdw-mcp
cd test-rdw-mcp
npm init -y
npm install rdw-mcp-server

# Test programmatic usage
node -e "console.log(require('rdw-mcp-server'))"
```

### 3. MCP Client Test

Configure in your MCP client:

```json
{
  "servers": {
    "rdw": {
      "command": "rdw-mcp"
    }
  }
}
```

## Updating Your Package

### 1. Make Changes

```bash
# Edit your code
# Update version in package.json or use npm version
npm version patch

# Build
npm run build
```

### 2. Republish

```bash
npm publish
```

## Package Maintenance

### Checking Package Stats

```bash
# View package info
npm info rdw-mcp-server

# View download stats
npm view rdw-mcp-server

# View all versions
npm view rdw-mcp-server versions --json
```

### Deprecating Versions

```bash
# Deprecate a specific version
npm deprecate rdw-mcp-server@1.0.0 "Please upgrade to 1.0.1"
```

## Troubleshooting

### Common Issues:

1. **Package name taken**: Choose a different name or use scoped package
2. **Permission denied**: Make sure you're logged in with `npm login`
3. **Build errors**: Run `npm run build` before publishing
4. **Missing files**: Check `files` field in package.json

### Best Practices:

- Always run `npm run build` before publishing
- Use semantic versioning
- Test your package after publishing
- Keep README.md updated
- Use meaningful commit messages
- Tag releases in Git

## Scoped Packages (Alternative)

If the package name is taken, you can use a scoped package:

```json
{
  "name": "@yourusername/rdw-mcp-server"
}
```

Then publish with:
```bash
npm publish --access public
```

Users install with:
```bash
npm install -g @yourusername/rdw-mcp-server
```
