import { unzipSync, strFromU8 } from "fflate";

// Converts a .docx file into HTML that NewTextEditor can hold without losing
// the look of the document: every paragraph, run and table cell carries its
// resolved Word formatting as inline CSS (tagged data-docx so the editor keeps
// it). Lists are emitted as paragraphs with their Word marker in front, since
// the editor's own lists can't carry Word's marker glyph, colour and indent.

const HIGHLIGHT = {
  yellow: "#ffff00",
  green: "#00ff00",
  cyan: "#00ffff",
  magenta: "#ff00ff",
  blue: "#0000ff",
  red: "#ff0000",
  darkBlue: "#000080",
  darkCyan: "#008080",
  darkGreen: "#008000",
  darkMagenta: "#800080",
  darkRed: "#800000",
  darkYellow: "#808000",
  darkGray: "#808080",
  lightGray: "#c0c0c0",
  black: "#000000",
  white: "#ffffff",
};

const BORDER_STYLE = {
  single: "solid",
  thick: "solid",
  double: "double",
  dotted: "dotted",
  dashed: "dashed",
  dashSmallGap: "dashed",
  dotDash: "dashed",
  dotDotDash: "dotted",
  triple: "double",
  wave: "solid",
  inset: "inset",
  outset: "outset",
};

// Symbol / Wingdings bullets live in the private-use area.
const SYMBOL_BULLETS = {
  "": "•",
  "": "▪",
  "": "➢",
  "": "✓",
  "": "❖",
  "": "□",
  "": "■",
  "": "➔",
};

const IMAGE_MIME = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  bmp: "image/bmp",
  webp: "image/webp",
  svg: "image/svg+xml",
};

const twipToPt = (v) => `${+(Number(v) / 20).toFixed(2)}pt`;
const twipToPx = (v) => Math.round(Number(v) / 15);

const escapeHtml = (text) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const kids = (el, name) =>
  el ? Array.from(el.children).filter((c) => !name || c.localName === name) : [];
const kid = (el, name) => kids(el, name)[0] || null;
const attr = (el, name) => (el ? el.getAttribute(`w:${name}`) : null);

// <w:b/>, <w:b w:val="1"/> are on; <w:b w:val="0|false|off"/> is off.
const toggle = (el) => {
  const v = attr(el, "val");
  return !(v === "0" || v === "false" || v === "off");
};

const color = (v) => (!v || v === "auto" ? null : `#${v}`);

const border = (el) => {
  if (!el) return undefined;
  const val = attr(el, "val");
  if (!val || val === "none" || val === "nil") return "none";
  const width = Math.max(Number(attr(el, "sz") || 4) / 8, 0.5);
  return `${width}pt ${BORDER_STYLE[val] || "solid"} ${color(attr(el, "color")) || "#000000"}`;
};

const readBorders = (el, sides) => {
  const out = {};
  sides.forEach((side) => {
    const b = kid(el, side) || (side === "left" ? kid(el, "start") : side === "right" ? kid(el, "end") : null);
    if (b) out[side] = { css: border(b), space: Number(attr(b, "space") || 0) };
  });
  return out;
};

const readMargins = (el) => {
  const out = {};
  ["top", "left", "bottom", "right", "start", "end"].forEach((side) => {
    const m = kid(el, side);
    if (!m) return;
    const key = side === "start" ? "left" : side === "end" ? "right" : side;
    out[key] = Number(attr(m, "w") || 0);
  });
  return out;
};

// ---------------------------------------------------------------- properties

const mergeRPr = (target, rPr) => {
  if (!rPr) return target;
  kids(rPr).forEach((el) => {
    switch (el.localName) {
      case "b":
        target.b = toggle(el);
        break;
      case "i":
        target.i = toggle(el);
        break;
      case "strike":
      case "dstrike":
        target.strike = toggle(el);
        break;
      case "caps":
        target.caps = toggle(el);
        break;
      case "smallCaps":
        target.smallCaps = toggle(el);
        break;
      case "vanish":
        target.vanish = toggle(el);
        break;
      case "u":
        target.u = attr(el, "val") !== "none";
        break;
      case "color":
        target.color = color(attr(el, "val"));
        break;
      case "sz":
        target.sz = Number(attr(el, "val")) / 2;
        break;
      case "highlight":
        target.highlight = HIGHLIGHT[attr(el, "val")] || null;
        break;
      case "shd": {
        const fill = attr(el, "fill");
        target.shd = fill && fill !== "auto" ? `#${fill}` : null;
        break;
      }
      case "vertAlign":
        target.vertAlign = attr(el, "val");
        break;
      case "spacing":
        target.letterSpacing = Number(attr(el, "val") || 0);
        break;
      case "rFonts":
        target.fontEl = el;
        break;
      default:
    }
  });
  return target;
};

const mergePPr = (target, pPr) => {
  if (!pPr) return target;
  kids(pPr).forEach((el) => {
    switch (el.localName) {
      case "jc":
        target.jc = attr(el, "val");
        break;
      case "spacing":
        if (attr(el, "before") != null) target.before = Number(attr(el, "before"));
        if (attr(el, "after") != null) target.after = Number(attr(el, "after"));
        if (attr(el, "line") != null) {
          target.line = Number(attr(el, "line"));
          target.lineRule = attr(el, "lineRule") || "auto";
        }
        break;
      case "ind": {
        const left = attr(el, "left") ?? attr(el, "start");
        const right = attr(el, "right") ?? attr(el, "end");
        if (left != null) target.left = Number(left);
        if (right != null) target.right = Number(right);
        if (attr(el, "hanging") != null) {
          target.hanging = Number(attr(el, "hanging"));
          target.firstLine = 0;
        }
        if (attr(el, "firstLine") != null) {
          target.firstLine = Number(attr(el, "firstLine"));
          target.hanging = 0;
        }
        break;
      }
      case "pBdr":
        target.borders = { ...target.borders, ...readBorders(el, ["top", "left", "bottom", "right"]) };
        break;
      case "shd": {
        const fill = attr(el, "fill");
        target.shd = fill && fill !== "auto" ? `#${fill}` : null;
        break;
      }
      case "numPr": {
        const numId = attr(kid(el, "numId"), "val");
        const ilvl = attr(kid(el, "ilvl"), "val");
        if (numId != null) target.numId = numId;
        if (ilvl != null) target.ilvl = Number(ilvl);
        break;
      }
      case "contextualSpacing":
        target.contextual = toggle(el);
        break;
      default:
    }
  });
  return target;
};

// ---------------------------------------------------------------- converter

class DocxConverter {
  constructor(files) {
    this.files = files;
    this.xml = (path) =>
      files[path]
        ? new DOMParser().parseFromString(strFromU8(files[path]), "application/xml")
        : null;

    this.rels = this.readRels("word/_rels/document.xml.rels");
    this.readTheme();
    this.readStyles();
    this.readNumbering();
    this.counters = {};
  }

  readRels(path) {
    const map = {};
    const doc = this.xml(path);
    if (!doc) return map;
    Array.from(doc.getElementsByTagName("Relationship")).forEach((r) => {
      map[r.getAttribute("Id")] = {
        target: r.getAttribute("Target"),
        external: r.getAttribute("TargetMode") === "External",
      };
    });
    return map;
  }

  readTheme() {
    this.themeFonts = {};
    const doc = this.xml("word/theme/theme1.xml");
    if (!doc) return;
    ["majorFont", "minorFont"].forEach((name) => {
      const font = doc.getElementsByTagName(`a:${name}`)[0];
      const latin = font?.getElementsByTagName("a:latin")[0];
      if (latin) this.themeFonts[name.replace("Font", "")] = latin.getAttribute("typeface");
    });
  }

  readStyles() {
    this.styles = {};
    this.defaultParaStyle = null;
    this.defaultTableStyle = null;
    this.defaults = { p: {}, r: {} };

    const doc = this.xml("word/styles.xml");
    if (!doc) return;
    const root = doc.documentElement;

    const docDefaults = kid(root, "docDefaults");
    mergeRPr(this.defaults.r, kid(kid(docDefaults, "rPrDefault"), "rPr"));
    mergePPr(this.defaults.p, kid(kid(docDefaults, "pPrDefault"), "pPr"));

    kids(root, "style").forEach((s) => {
      const id = attr(s, "styleId");
      const type = attr(s, "type");
      this.styles[id] = {
        type,
        basedOn: attr(kid(s, "basedOn"), "val"),
        pPr: kid(s, "pPr"),
        rPr: kid(s, "rPr"),
        tblPr: kid(s, "tblPr"),
        tcPr: kid(s, "tcPr"),
      };
      if (attr(s, "default") === "1") {
        if (type === "paragraph") this.defaultParaStyle = id;
        if (type === "table") this.defaultTableStyle = id;
      }
    });
  }

  // Walks basedOn from the root style down so nearer styles win.
  styleChain(id) {
    const chain = [];
    const seen = new Set();
    while (id && this.styles[id] && !seen.has(id)) {
      seen.add(id);
      chain.unshift(this.styles[id]);
      id = this.styles[id].basedOn;
    }
    return chain;
  }

  readNumbering() {
    this.abstractNums = {};
    this.nums = {};
    const doc = this.xml("word/numbering.xml");
    if (!doc) return;
    const root = doc.documentElement;

    kids(root, "abstractNum").forEach((a) => {
      const levels = {};
      kids(a, "lvl").forEach((lvl) => {
        levels[attr(lvl, "ilvl")] = {
          start: Number(attr(kid(lvl, "start"), "val") || 1),
          fmt: attr(kid(lvl, "numFmt"), "val") || "decimal",
          text: attr(kid(lvl, "lvlText"), "val") ?? "",
          pPr: kid(lvl, "pPr"),
          rPr: kid(lvl, "rPr"),
        };
      });
      this.abstractNums[attr(a, "abstractNumId")] = levels;
    });

    kids(root, "num").forEach((n) => {
      const overrides = {};
      kids(n, "lvlOverride").forEach((o) => {
        const start = kid(o, "startOverride");
        if (start) overrides[attr(o, "ilvl")] = Number(attr(start, "val"));
      });
      this.nums[attr(n, "numId")] = {
        abstractId: attr(kid(n, "abstractNumId"), "val"),
        overrides,
      };
    });
  }

  level(numId, ilvl) {
    const num = this.nums[numId];
    if (!num) return null;
    const lvl = this.abstractNums[num.abstractId]?.[String(ilvl)];
    if (!lvl) return null;
    const start = num.overrides[String(ilvl)];
    return start != null ? { ...lvl, start } : lvl;
  }

  // ------------------------------------------------------------ fonts/runs

  fontFamily(fontEl) {
    if (!fontEl) return null;
    let name = fontEl.getAttribute("w:ascii") || fontEl.getAttribute("w:hAnsi");
    const theme = fontEl.getAttribute("w:asciiTheme") || fontEl.getAttribute("w:hAnsiTheme");
    if (!name && theme) {
      name = this.themeFonts[/major/i.test(theme) ? "major" : "minor"];
    }
    return name || null;
  }

  runCss(r) {
    const css = [];
    const font = this.fontFamily(r.fontEl);
    if (font) css.push(`font-family: '${font}', Calibri, Arial, sans-serif`);
    css.push(`font-size: ${r.sz || 11}pt`);
    css.push(`color: ${r.color || "#000000"}`);
    if (r.letterSpacing) css.push(`letter-spacing: ${twipToPt(r.letterSpacing)}`);
    if (r.caps) css.push("text-transform: uppercase");
    if (r.smallCaps) css.push("font-variant: small-caps");
    if (r.vertAlign === "superscript") css.push("vertical-align: super");
    if (r.vertAlign === "subscript") css.push("vertical-align: sub");
    return css;
  }

  wrapRun(inner, r, extraCss = []) {
    if (!inner) return "";
    const css = [...this.runCss(r), ...extraCss];
    let html = `<span data-docx="" style="${css.join("; ")}">${inner}</span>`;
    if (r.u) html = `<u>${html}</u>`;
    if (r.strike) html = `<s>${html}</s>`;
    if (r.i) html = `<em>${html}</em>`;
    if (r.b) html = `<strong>${html}</strong>`;
    const bg = r.highlight || r.shd;
    if (bg) html = `<mark data-color="${bg}" style="background-color: ${bg}">${html}</mark>`;
    return html;
  }

  image(drawing) {
    const blip = drawing.getElementsByTagName("a:blip")[0];
    const relId = blip?.getAttribute("r:embed");
    const rel = relId && this.rels[relId];
    if (!rel) return "";

    const path = `word/${rel.target.replace(/^\.?\//, "")}`.replace(/word\/\.\.\//, "");
    const bytes = this.files[path];
    const ext = path.split(".").pop().toLowerCase();
    if (!bytes || !IMAGE_MIME[ext]) return "";

    let binary = "";
    for (let i = 0; i < bytes.length; i += 0x8000) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    }
    const src = `data:${IMAGE_MIME[ext]};base64,${btoa(binary)}`;

    const extent = drawing.getElementsByTagName("wp:extent")[0];
    const width = extent ? `${Math.round(Number(extent.getAttribute("cx")) / 9525)}px` : "auto";
    return `<img src="${src}" width="${width}" data-docx-image="">`;
  }

  // Renders runs (and hyperlinks / fields / insertions) inside a paragraph.
  inline(el, baseR, state) {
    let html = "";

    kids(el).forEach((child) => {
      switch (child.localName) {
        case "r":
          html += this.run(child, baseR, state);
          break;
        case "hyperlink": {
          const rel = this.rels[child.getAttribute("r:id")];
          const anchor = attr(child, "anchor");
          const href = rel?.target || (anchor ? `#${anchor}` : null);
          const inner = this.inline(child, baseR, state);
          html += href ? `<a href="${escapeHtml(href)}">${inner}</a>` : inner;
          break;
        }
        case "ins":
        case "smartTag":
        case "customXml":
        case "fldSimple":
          html += this.inline(child, baseR, state);
          break;
        case "sdt":
          html += this.inline(kid(child, "sdtContent"), baseR, state);
          break;
        default:
      }
    });

    return html;
  }

  run(rEl, baseR, state) {
    const r = { ...baseR };
    const rPr = kid(rEl, "rPr");
    const rStyle = attr(kid(rPr, "rStyle"), "val");
    this.styleChain(rStyle).forEach((s) => mergeRPr(r, s.rPr));
    mergeRPr(r, rPr);
    if (r.vanish) return "";

    let text = "";
    let html = "";
    const flush = () => {
      html += this.wrapRun(text, r);
      text = "";
    };

    kids(rEl).forEach((c) => {
      switch (c.localName) {
        case "fldChar": {
          const type = attr(c, "fldCharType");
          if (type === "begin") state.fields.push("code");
          else if (type === "separate" && state.fields.length) state.fields[state.fields.length - 1] = "result";
          else if (type === "end") state.fields.pop();
          break;
        }
        case "t":
          if (state.fields.at(-1) !== "code") text += escapeHtml(c.textContent);
          break;
        case "tab":
          if (state.fields.at(-1) !== "code") text += "    ";
          break;
        case "noBreakHyphen":
          text += "-";
          break;
        case "sym": {
          const code = parseInt(attr(c, "char") || "", 16);
          if (code) {
            const ch = String.fromCharCode(code);
            text += SYMBOL_BULLETS[ch] || ch;
          }
          break;
        }
        case "br":
        case "cr":
          if (attr(c, "type") === "page") break;
          flush();
          html += "<br>";
          break;
        case "drawing":
          flush();
          html += this.image(c);
          break;
        default:
      }
    });
    flush();
    return html;
  }

  // ------------------------------------------------------------ paragraphs

  resolveParagraph(pEl) {
    const pPrEl = kid(pEl, "pPr");
    const styleId = attr(kid(pPrEl, "pStyle"), "val") || this.defaultParaStyle;
    const p = { ...this.defaults.p, styleId };
    const r = { ...this.defaults.r };

    this.styleChain(styleId).forEach((s) => {
      mergePPr(p, s.pPr);
      mergeRPr(r, s.rPr);
    });
    // Numbering indents sit under the paragraph's own direct formatting.
    const directNum = mergePPr({}, pPrEl);
    const numId = directNum.numId ?? p.numId;
    const ilvl = directNum.ilvl ?? p.ilvl ?? 0;
    const lvl = numId && numId !== "0" ? this.level(numId, ilvl) : null;
    if (lvl) mergePPr(p, lvl.pPr);
    mergePPr(p, pPrEl);
    p.numId = numId;
    p.ilvl = ilvl;
    p.lvl = lvl;

    // Paragraph-mark formatting: what an empty paragraph and its marker use.
    const markR = mergeRPr({ ...r }, kid(pPrEl, "rPr"));
    return { p, r, markR };
  }

  marker(p, markR) {
    const { lvl, numId, ilvl } = p;
    if (!lvl || lvl.fmt === "none") return "";

    const counters = (this.counters[numId] ||= {});
    counters[ilvl] = counters[ilvl] == null ? lvl.start : counters[ilvl] + 1;
    Object.keys(counters).forEach((k) => {
      if (Number(k) > ilvl) delete counters[k];
    });

    let text;
    if (lvl.fmt === "bullet") {
      text = Array.from(lvl.text || "•")
        .map((ch) => SYMBOL_BULLETS[ch] || ch)
        .join("");
    } else {
      text = lvl.text.replace(/%(\d)/g, (_, n) => {
        const lv = Number(n) - 1;
        const level = this.level(numId, lv);
        const value = counters[lv] ?? level?.start ?? 1;
        return formatNumber(value, level?.fmt || "decimal");
      });
    }
    if (!text) return "";

    const r = mergeRPr({ ...markR, u: false, highlight: null, shd: null }, lvl.rPr);
    const hanging = p.hanging || 0;
    const extra = ["text-indent: 0"];
    if (hanging) extra.push("display: inline-block", `min-width: ${twipToPt(hanging)}`);
    return this.wrapRun(escapeHtml(text) + (hanging ? "" : " "), r, extra);
  }

  paragraphCss(p, markR) {
    const css = [];
    // Word adds before + after; CSS margins would collapse to the larger one,
    // so "before" goes in as padding and "after" as margin.
    css.push(`margin-top: 0`);
    css.push(`margin-bottom: ${twipToPt(p.after || 0)}`);
    css.push(`padding-top: ${twipToPt(p.before || 0)}`);
    if (p.right) css.push(`margin-right: ${twipToPt(p.right)}`);

    const left = p.left || 0;
    if (left) css.push(`padding-left: ${twipToPt(left)}`);
    if (p.hanging) css.push(`text-indent: -${twipToPt(p.hanging)}`);
    else if (p.firstLine) css.push(`text-indent: ${twipToPt(p.firstLine)}`);

    if (p.line && p.lineRule === "auto") {
      css.push(`line-height: ${+((p.line / 240) * 1.15).toFixed(3)}`);
    } else if (p.line) {
      css.push(`line-height: ${twipToPt(p.line)}`);
    } else {
      css.push("line-height: 1.15");
    }

    const b = p.borders || {};
    ["top", "right", "bottom", "left"].forEach((side) => {
      const def = b[side];
      if (!def || def.css === "none") return;
      css.push(`border-${side}: ${def.css}`);
      css.push(`padding-${side}: ${def.space}pt`);
    });
    if (p.shd) css.push(`background-color: ${p.shd}`);

    // Lets an empty paragraph keep the height it has in Word.
    css.push(`font-size: ${markR.sz || 11}pt`);
    return css;
  }

  paragraph(pEl, resolved) {
    const { p, r, markR } = resolved;
    const state = { fields: [] };

    const align = { both: "justify", distribute: "justify", center: "center", right: "right", end: "right" }[p.jc];
    const css = this.paragraphCss(p, markR);
    if (align) css.push(`text-align: ${align}`);

    let body = this.inline(pEl, r, state);
    const hasText = body.replace(/<[^>]+>/g, "").length > 0 || /<img/.test(body);
    if (hasText) body = this.marker(p, markR) + body;

    // Images are blocks in the editor; give them the paragraph's alignment.
    body = body.replace(
      /<img ([^>]*)data-docx-image="">/g,
      (_, rest) => `<img ${rest}align="${align === "right" ? "right" : align === "center" ? "center" : "left"}">`,
    );

    return `<p data-docx="" style="${css.join("; ")}">${body}</p>`;
  }

  // ------------------------------------------------------------ tables

  table(tblEl) {
    const tblPrEl = kid(tblEl, "tblPr");
    const styleId = attr(kid(tblPrEl, "tblStyle"), "val") || this.defaultTableStyle;

    let borders = {};
    let cellMar = {};
    this.styleChain(styleId).forEach((s) => {
      borders = { ...borders, ...readBorders(kid(s.tblPr, "tblBorders"), ["top", "left", "bottom", "right", "insideH", "insideV"]) };
      cellMar = { ...cellMar, ...readMargins(kid(s.tblPr, "tblCellMar")) };
    });
    borders = { ...borders, ...readBorders(kid(tblPrEl, "tblBorders"), ["top", "left", "bottom", "right", "insideH", "insideV"]) };
    cellMar = { ...cellMar, ...readMargins(kid(tblPrEl, "tblCellMar")) };

    const grid = kids(kid(tblEl, "tblGrid"), "gridCol").map((g) => Number(attr(g, "w") || 0));

    // Lay the cells out on the grid first so merges and edges are known.
    const rows = kids(tblEl, "tr").map((tr) => {
      let col = Number(attr(kid(kid(tr, "trPr"), "gridBefore"), "val") || 0);
      return kids(tr, "tc").map((tc) => {
        const tcPr = kid(tc, "tcPr");
        const span = Number(attr(kid(tcPr, "gridSpan"), "val") || 1);
        const vMergeEl = kid(tcPr, "vMerge");
        const vMerge = vMergeEl ? attr(vMergeEl, "val") || "continue" : null;
        const cell = { tc, tcPr, col, span, vMerge, rowspan: 1 };
        col += span;
        return cell;
      });
    });

    rows.forEach((row, ri) => {
      row.forEach((cell) => {
        if (cell.vMerge !== "continue") return;
        for (let up = ri - 1; up >= 0; up--) {
          const origin = rows[up].find((c) => c.col === cell.col && c.vMerge !== "continue");
          if (origin) {
            origin.rowspan += 1;
            break;
          }
        }
      });
    });

    const totalCols = Math.max(grid.length, ...rows.map((r) => r.reduce((n, c) => n + c.span, 0)));
    const lastRow = rows.length - 1;

    const rowsHtml = rows
      .map((row, ri) => {
        const cells = row
          .filter((cell) => cell.vMerge !== "continue")
          .map((cell) => this.tableCell(cell, ri, lastRow, totalCols, grid, borders, cellMar))
          .join("");
        return `<tr>${cells}</tr>`;
      })
      .join("");

    return `<table><tbody>${rowsHtml}</tbody></table>`;
  }

  tableCell(cell, ri, lastRow, totalCols, grid, tblBorders, tblMar) {
    const { tc, tcPr, col, span, rowspan } = cell;
    const own = readBorders(kid(tcPr, "tcBorders"), ["top", "left", "bottom", "right"]);
    const edge = {
      top: ri === 0 ? "top" : "insideH",
      bottom: ri + rowspan - 1 >= lastRow ? "bottom" : "insideH",
      left: col === 0 ? "left" : "insideV",
      right: col + span >= totalCols ? "right" : "insideV",
    };

    const css = [];
    ["top", "right", "bottom", "left"].forEach((side) => {
      const b = own[side] || tblBorders[edge[side]];
      css.push(`border-${side}: ${b?.css || "none"}`);
    });

    const mar = { top: 0, bottom: 0, left: 108, right: 108, ...tblMar, ...readMargins(kid(tcPr, "tcMar")) };
    css.push(`padding: ${twipToPt(mar.top)} ${twipToPt(mar.right)} ${twipToPt(mar.bottom)} ${twipToPt(mar.left)}`);

    const vAlign = attr(kid(tcPr, "vAlign"), "val");
    css.push(`vertical-align: ${vAlign === "center" ? "middle" : vAlign === "bottom" ? "bottom" : "top"}`);

    const fill = attr(kid(tcPr, "shd"), "fill");
    css.push(`background-color: ${fill && fill !== "auto" ? `#${fill}` : "transparent"}`);

    const widths = grid.slice(col, col + span).map(twipToPx);
    const colwidth = widths.length === span && widths.every((w) => w > 0) ? ` colwidth="${widths.join(",")}"` : "";
    const spans = `${span > 1 ? ` colspan="${span}"` : ""}${rowspan > 1 ? ` rowspan="${rowspan}"` : ""}`;

    const content = this.blocks(tc) || `<p data-docx="" style="margin: 0"></p>`;
    return `<td data-docx=""${spans}${colwidth} style="${css.join("; ")}">${content}</td>`;
  }

  // ------------------------------------------------------------ body

  blocks(container, { dropSignature = false } = {}) {
    const items = [];
    const collect = (el) => {
      kids(el).forEach((child) => {
        if (child.localName === "p") items.push({ el: child, resolved: this.resolveParagraph(child) });
        else if (child.localName === "tbl") items.push({ el: child });
        else if (child.localName === "sdt") collect(kid(child, "sdtContent"));
        else if (child.localName === "customXml") collect(child);
      });
    };
    collect(container);
    if (dropSignature) removeSignature(items);

    // Contextual spacing: drop the gap between paragraphs of the same style.
    items.forEach((item, i) => {
      const prev = items[i - 1];
      if (!item.resolved || !prev?.resolved) return;
      const a = prev.resolved.p;
      const b = item.resolved.p;
      if (a.styleId !== b.styleId) return;
      if (a.contextual) a.after = 0;
      if (b.contextual) b.before = 0;
    });

    return items
      .map((item) => (item.resolved ? this.paragraph(item.el, item.resolved) : this.table(item.el)))
      .join("");
  }

  convert() {
    const doc = this.xml("word/document.xml");
    if (!doc) throw new Error("This file is not a valid Word (.docx) document.");
    const body = doc.getElementsByTagName("w:body")[0];
    return this.blocks(body, { dropSignature: true });
  }
}

// ---------------------------------------------------------------- signature

// The sender's signature is added by the backend from the user's profile when
// the mail goes out, so a sign-off typed into the Word template ("Warm regards,"
// + name / designation / phone / email / address lines) is left out of the import.
const SIGN_OFF =
  /^(?:(?:warm|kind|best|with)(?:est)?\s+regards|regards|thanks\s*(?:&|and)\s*regards|thank\s+you|thanks|best\s+wishes|sincerely|yours\s+(?:sincerely|faithfully|truly))[,.!]?$/i;

const SIGNATURE_LINE =
  /\[[^\]]{1,40}\]|@|www\.|https?:|\+?\d[\d\s-]{7,}|\b(?:corpseed|pvt|private limited|ltd|floor|tower|sector|block|road|noida|delhi|india|mobile|phone|email|designation|manager|executive|director|officer)\b/i;

const paragraphText = (pEl) =>
  Array.from(pEl.getElementsByTagName("w:t"))
    .map((t) => t.textContent)
    .join("")
    .replace(/\s+/g, " ")
    .trim();

function removeSignature(items) {
  let start = -1;
  for (let i = items.length - 1; i >= 0; i--) {
    if (items[i].resolved && SIGN_OFF.test(paragraphText(items[i].el))) {
      start = i;
      break;
    }
  }
  if (start < 0) return;

  let end = start + 1;
  while (end < items.length && items[end].resolved) {
    const text = paragraphText(items[end].el);
    const isSignatureLine = !text || (text.length <= 160 && SIGNATURE_LINE.test(text));
    if (!isSignatureLine) break;
    end += 1;
  }
  items.splice(start, end - start);
}

const ROMAN = [
  [1000, "m"], [900, "cm"], [500, "d"], [400, "cd"], [100, "c"], [90, "xc"],
  [50, "l"], [40, "xl"], [10, "x"], [9, "ix"], [5, "v"], [4, "iv"], [1, "i"],
];

const toRoman = (n) =>
  ROMAN.reduce((out, [value, letters]) => {
    while (n >= value) {
      out += letters;
      n -= value;
    }
    return out;
  }, "");

const toLetters = (n) => {
  let out = "";
  while (n > 0) {
    n -= 1;
    out = String.fromCharCode(97 + (n % 26)) + out;
    n = Math.floor(n / 26);
  }
  return out;
};

function formatNumber(n, fmt) {
  switch (fmt) {
    case "lowerLetter":
      return toLetters(n);
    case "upperLetter":
      return toLetters(n).toUpperCase();
    case "lowerRoman":
      return toRoman(n);
    case "upperRoman":
      return toRoman(n).toUpperCase();
    case "decimalZero":
      return String(n).padStart(2, "0");
    default:
      return String(n);
  }
}

export default async function docxToHtml(file) {
  const buffer = new Uint8Array(await file.arrayBuffer());
  let files;
  try {
    files = unzipSync(buffer);
  } catch {
    throw new Error("This file is not a valid Word (.docx) document.");
  }
  return new DocxConverter(files).convert();
}
