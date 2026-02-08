# CLAUDE.md

This file provides guidance for Claude Code when working with this repository.

## Project Overview

Personal portfolio/landing page website hosted on GitHub Pages with a custom domain.

## Technology Stack

- **Templating:** Pug (formerly Jade) - `index.pug` compiles to `index.html`
- **Styling:** Vanilla CSS (`style.css`)
- **Hosting:** GitHub Pages (auto-deploys from master branch)
- **No JavaScript frameworks** - static site with minimal dependencies

## File Structure

```
├── index.pug                      # Main template source (edit this, not index.html)
├── index.html                     # Compiled output (auto-generated)
├── style.css                      # All styling
├── CNAME                          # Custom domain configuration
├── flourish.gif                   # Decorative asset
└── .github/workflows/build.yml    # Auto-compiles Pug on push
```

## Development Workflow

1. Edit `index.pug` for content/structure changes
2. Push to master branch
3. GitHub Actions automatically compiles Pug to HTML and commits the result
4. GitHub Pages deploys the updated site

**Local development (optional):** Run `pug index.pug` to preview changes before pushing.

## Coding Conventions

- **Pug:** Use clean semantic HTML5 structure
- **CSS:** Minimalist approach, max-width 500px for readability
- **Commits:** Short, descriptive messages (e.g., "update bio", "fix link")
- **Output:** HTML is minified to a single line

## Fonts

Loaded from Google Fonts:
- Source Sans Pro (body text, light weight)
- Permanent Marker (headings)

## Important Notes

- Always edit `index.pug`, not `index.html` directly
- The site is intentionally minimal - avoid adding complexity
- Deployment is automatic on push to master
