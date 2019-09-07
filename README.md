# HTML PDF Press: Comprehensive HTML => PDF

<img align="right" alt="Typesmith logo" width="160" src="./docs/logo/html-pdf-press-logo-512.png" />

## ✨ Features

- [ ] Generates PDFs and screenshots
- [ ] Docker ready
- [ ] Secure
  - [ ] JWT authentication enabled by default
  - [ ] Cookies are automatically reset
- [ ] Headers / Footers
  - [x] Dynamic placeholders for page number and total pages
  - [x] Extract elements from HTML into header/footer
  - [x] Applies CSS from HTML in header/footer
  - [ ] Supports images in header/footer
  - [ ] Automatically determines size of header/footer
  - [ ] Automatically applies margin to header/footer
  - [ ] Different header for first page
- [ ] Configurable
  - [ ] By environment variables
  - [ ] By json files
  - [ ] By HTTP query string or json body
  - [ ] Page size and margin presets
  - [x] Load a url or supply HTML directly
  - [x] Use Chrome or Chromium

## 💿 Quick Start Guide

### Global Installation (Optional)

```bash
npm install -g @html-pdf-press/server
htmlpdfpress
# Goto http://localhost:7355?url=https://google.com
```

### Setup Dev Environment

```bash
git clone https://github.com/sparebytes/html-pdf-press.git
cd html-pdf-press
yarn install
yarn run dev
# Goto http://localhost:7355?url=https://google.com
```
