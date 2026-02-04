# Years Are Short

> "The days are long, but the years are short." — Gretchen Rubin

A Chrome extension that replaces your new tab with a life calendar and daily intention-setting. Make every day count.

![Years Are Short Screenshot](screenshot.png)

## Features

### Life Calendar (Memento Mori Grid)
Visualize your life in weeks. Each cell represents one week of your life — filled cells show weeks you've lived, empty cells show weeks remaining. A gentle reminder to live intentionally.

### Daily Highlight
Set one meaningful goal each day. Focus on what matters most and celebrate small wins with satisfying confetti animations when you complete your highlight.

### Non-Negotiables
Track the daily habits that build your ideal life. Create a list of up to 10 habits you commit to doing every day, no matter what. Consistency compounds.

### Additional Features
- **Dark & Light themes** — Toggle between themes to match your preference
- **Date navigation** — Review past days (up to 30 days) or plan ahead (up to 7 days)
- **Birthday celebration** — Special animation on your birthday
- **Data export/import** — Export your data as JSON or CSV, import from backups
- **Keyboard navigation** — Use arrow keys to navigate between days
- **Week tooltips** — Hover over any week in the life grid to see completion stats

## Installation

### From Chrome Web Store
1. Visit the [Chrome Web Store listing](YOUR_CHROME_STORE_URL)
2. Click "Add to Chrome"
3. Open a new tab to start using Years Are Short

### From Source (Developer Mode)
1. Clone this repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/yearsareshort.git
   ```
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right corner)
4. Click "Load unpacked"
5. Select the cloned `yearsareshort` folder
6. Open a new tab to see the extension

## Privacy

**Your data stays on your device.** Years Are Short stores all data locally using Chrome's storage API. We do not collect, transmit, or have access to any of your personal information.

The extension only requests the `storage` permission — no access to browsing history, tabs, or other sensitive data.

See the full [Privacy Policy](https://YOUR_USERNAME.github.io/yearsareshort/privacy.html) for details.

## Development

### Project Structure
```
yearsareshort/
├── manifest.json      # Chrome extension manifest (v3)
├── newtab.html        # Main new tab page
├── app.js             # Application logic
├── utils.js           # Utility functions
├── config.js          # Centralized configuration (URLs)
├── styles.css         # Styles
├── index.html         # Landing page (GitHub Pages)
├── privacy.html       # Privacy policy page
├── icons/             # Extension icons and assets
├── lib/               # Third-party libraries
└── tests/             # Jest unit tests
```

### Running Tests
```bash
npm install
npm test
```

## Configuration

External URLs are centralized in `config.js` for easy maintenance:

```javascript
const CONFIG = {
  urls: {
    feedback: 'https://...',
    tipJar: 'https://...',
    github: 'https://...'
  }
};
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Feedback & Support

- **Bug reports & feature requests:** [Open an issue](https://github.com/YOUR_USERNAME/yearsareshort/issues)
- **General feedback:** [Feedback form](https://docs.google.com/forms/d/e/1FAIpQLSfGwXCznFXqizLPSFGLpM4fqXTZ-FzXNK80gpXoJYXDZwrArg/viewform)
- **Support the project:** [Buy me a coffee](https://tiptopjar.com/yearsareshort)

## License

MIT License — see [LICENSE](LICENSE) for details.

## Acknowledgments

- Quote by [Gretchen Rubin](https://gretchenrubin.com/)
- Confetti animation by [canvas-confetti](https://github.com/catdad/canvas-confetti)
- Icons from [Feather Icons](https://feathericons.com/)

---

Made with care. Live intentionally.
