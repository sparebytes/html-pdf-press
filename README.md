# HTML PDF Press: Comprehensive HTML => PDF

<img align="right" alt="Typesmith logo" width="160" src="./docs/logo/html-pdf-press-logo-512.png" />

## ✨ Features

- [ ] Generates PDFs and screenshots
- [ ] Docker ready
- [ ] Secure
  - [ ] JWT authentication enabled by default
  - [ ] Cookies are automatically reset
- [ ] Headers / Footers
  - [ ] Dynamic placeholders for page number and total pages
  - [ ] Extract elements from HTML into header/footer
  - [ ] Applies CSS from HTML in header/footer
  - [ ] Supports images in header/footer
  - [ ] Automatically determines size of header/footer
  - [ ] Automatically applies margin to header/footer
  - [ ] Different header for first page
- [ ] Configurable
  - [ ] Page size and margin presets
  - [ ] Load a url or supply HTML directly
  - [ ] Use Chrome or Chromium

## 💿 Quick Start Guide

```bash
git clone https://github.com/sparebytes/html-pdf-press.git
cd html-pdf-press
yarn install
yarn run dev
# Goto http://localhost:7355?url=https://google.com
```
