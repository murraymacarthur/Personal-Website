Personal Website PRD
Overview
A trippy, interactive personal website with animated abstract visuals inspired by logartis.info, featuring a nested navigation system and easy content management through GitHub/code.
Core Requirements
1. Visual Design & Animation

Abstract animated background: Continuously morphing geometric shapes, particles, or generative art
Trippy aesthetic: Vibrant colors, smooth transitions, psychedelic color schemes
Interactive elements: Mouse-following effects, hover animations, click interactions
Performance: Animations should be GPU-accelerated and performant
Inspiration: logartis.info style - fluid, organic, hypnotic visuals

2. Layout Structure
┌─────────────────────────────────────────┐
│ Murray MacArthur        [Menu] [Folder] │  ← Header
├─────────────────────────────────────────┤
│                                         │
│                                         │
│         Animated Abstract               │
│         Background Content              │
│                                         │
│                                         │
└─────────────────────────────────────────┘
Header Components:

Top left: "Murray MacArthur" (your name)
Top right: Customizable menu items/folders

3. Navigation System
Three navigation types:

Direct Link: Navigates to external URL or downloads

Example: /work/newproject → button that opens link


List Menu: Opens submenu overlay with child items

Example: /work → shows list of work items
Example: /work/resources → shows tools, guides, etc.


Content Page: Displays markdown content with media

Example: /work/resources/tools/prompting-guide
Contains: text, images, download buttons (PDFs, Google Sheets)



Navigation Behavior:

Clicking menu item opens overlay/modal on top of animated background
Nested menus slide in from side or fade in
Back button or close to return to previous level
Breadcrumb trail shows current location

4. Content Management
File-based configuration (easily editable in GitHub):
javascript// config/navigation.js or navigation.json
{
  "navigation": [
    {
      "id": "work",
      "label": "Work",
      "type": "menu",
      "children": [
        {
          "id": "newproject",
          "label": "New Project",
          "type": "link",
          "url": "https://example.com"
        },
        {
          "id": "resources",
          "label": "Resources",
          "type": "menu",
          "children": [
            {
              "id": "tools",
              "label": "Tools",
              "type": "menu",
              "children": [
                {
                  "id": "prompting",
                  "label": "Prompting Guide",
                  "type": "page",
                  "content": "/content/prompting.md"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

**Content pages structure**:
```
/content
  /prompting.md          ← Markdown file
  /prompting-image.jpg   ← Associated image
  /prompting.pdf         ← Downloadable PDF
Markdown page format:
markdown---
title: Guide to Prompting
image: /content/prompting-image.jpg
downloads:
  - label: Download PDF Guide
    file: /content/prompting.pdf
  - label: Open Google Sheet
    url: https://docs.google.com/spreadsheets/...
---

# Guide to Prompting

Your markdown content here...
```

### 5. Technical Stack

**Recommended**:
- **Framework**: Next.js (React) or Vanilla HTML/CSS/JS
- **Animation**: Three.js, Canvas API, or CSS animations
- **Styling**: Tailwind CSS or CSS-in-JS
- **Deployment**: Vercel (via GitHub integration)
- **Content**: Markdown files with frontmatter

**GitHub Workflow**:
1. Push changes to GitHub repository
2. Vercel auto-deploys on push to main branch
3. Edit navigation.json or markdown files to update content
4. No build step required for content changes

### 6. User Experience

**Navigation Flow**:
```
Homepage (animated background)
  ↓ Click "Work"
Overlay opens with work menu
  ↓ Click "Resources"
Submenu slides in with resources
  ↓ Click "Tools"
Submenu shows tools list
  ↓ Click "Prompting Guide"
Content page displays markdown
UI States:

Default: Animated background, name + menu visible
Menu open: Semi-transparent overlay, blurred background, menu items listed
Content view: Full overlay with content, close/back button, animated background still visible underneath
Loading: Smooth transitions between states

7. Customization Requirements
Easy to modify:

Navigation structure (single JSON/JS file)
Menu labels and links
Content pages (markdown files)
Color scheme (CSS variables)
Animation parameters (config file)

No code changes needed for:

Adding/removing menu items
Creating new content pages
Updating links
Changing downloads

8. Accessibility

Keyboard navigation support
Reduced motion option (respects prefers-reduced-motion)
Semantic HTML
ARIA labels for interactive elements
Focus indicators

9. Performance Goals

First Contentful Paint: < 1.5s
Time to Interactive: < 3s
Smooth 60fps animations
Lazy load content pages
Optimize images and assets

10. Browser Support

Chrome/Edge (latest 2 versions)
Firefox (latest 2 versions)
Safari (latest 2 versions)
Mobile responsive

Success Criteria
✅ Visually striking animated background inspired by logartis.info
✅ Intuitive nested navigation system
✅ Content manageable via GitHub without code changes
✅ Deploys automatically to Vercel
✅ Smooth, performant animations
✅ Mobile-friendly responsive design
✅ Easy to customize colors, content, and structure
Future Enhancements (Post-MVP)

CMS integration (Contentful, Sanity)
Search functionality
Dark/light mode toggle
Analytics integration
Blog section with RSS
Social media integration