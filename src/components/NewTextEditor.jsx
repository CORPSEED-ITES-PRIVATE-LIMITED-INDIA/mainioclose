import React, { useEffect, useState } from "react";
import { useEditor, EditorContent, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TextAlign } from "@tiptap/extension-text-align";
import { Highlight } from "@tiptap/extension-highlight";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { Image } from "@tiptap/extension-image";
import { Underline } from "@tiptap/extension-underline";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import { Extension } from "@tiptap/core";
import { Link } from "@tiptap/extension-link";

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Table as TableIcon,
  Image as ImageIcon,
  Trash2,
  Plus,
  Minus,
  ListChecks,
  Link as LinkIcon,
  Unlink,
  Expand,
  Minimize2,
} from "lucide-react";

const FontSize = Extension.create({
  name: "fontSize",

  addGlobalAttributes() {
    return [
      {
        types: ["textStyle"],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) {
                return {};
              }

              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize) =>
        ({ chain }) => {
          return chain().setMark("textStyle", { fontSize }).run();
        },

      unsetFontSize:
        () =>
        ({ chain }) => {
          return chain()
            .setMark("textStyle", { fontSize: null })
            .removeEmptyTextStyle()
            .run();
        },
    };
  },
});

const Indentation = Extension.create({
  name: "indentation",

  addGlobalAttributes() {
    return [
      {
        types: ["paragraph", "heading"],
        attributes: {
          indent: {
            default: 0,
            renderHTML: (attrs) => {
              if (!attrs.indent) return {};
              return {
                style: `margin-left: ${attrs.indent * 2}em`,
              };
            },
            parseHTML: (el) => {
              const margin = el.style.marginLeft;
              return margin ? parseInt(margin, 10) / 2 : 0;
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      indent:
        () =>
        ({ editor, state }) => {
          const { $from } = state.selection;
          const node = $from.parent;
          const currentIndent = node.attrs.indent || 0;

          return editor
            .chain()
            .focus()
            .updateAttributes(node.type.name, { indent: currentIndent + 1 })
            .run();
        },

      outdent:
        () =>
        ({ editor, state }) => {
          const { $from } = state.selection;
          const node = $from.parent;
          const currentIndent = node.attrs.indent || 0;

          return editor
            .chain()
            .focus()
            .updateAttributes(node.type.name, {
              indent: Math.max(currentIndent - 1, 0),
            })
            .run();
        },
    };
  },
});

const WordImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: "center",
      },
      width: {
        default: "auto",
      },
    };
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      const container = document.createElement("div");
      container.className = "image-node";
      container.setAttribute("draggable", "false");
      container.setAttribute("contenteditable", "false");

      const img = document.createElement("img");
      img.src = node.attrs.src;
      img.alt = node.attrs.alt || "Inserted image";
      img.draggable = false;

      const applyAttrs = (attrs) => {
        img.style.width =
          attrs.width && attrs.width !== "auto" ? attrs.width : "auto";
        img.style.maxWidth = "100%";
        img.style.height = "auto";

        container.classList.remove("align-left", "align-center", "align-right");
        container.classList.add(`align-${attrs.align || "center"}`);
      };

      const setAttrsAtPos = (attrs) => {
        const pos = getPos?.();
        if (typeof pos !== "number") return;

        editor
          .chain()
          .focus()
          .command(({ tr }) => {
            const currentNode = editor.state.doc.nodeAt(pos);
            if (!currentNode) return false;

            tr.setNodeMarkup(pos, undefined, {
              ...currentNode.attrs,
              ...attrs,
            });
            return true;
          })
          .run();
      };

      applyAttrs(node.attrs);
      container.appendChild(img);

      const dragBadge = document.createElement("div");
      dragBadge.className = "img-drag-badge";
      dragBadge.innerText = "⋮⋮";
      container.appendChild(dragBadge);

      const deleteBtn = document.createElement("button");
      deleteBtn.innerText = "×";
      deleteBtn.className = "img-delete";
      deleteBtn.type = "button";

      deleteBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const pos = getPos?.();
        if (typeof pos === "number") {
          editor
            .chain()
            .focus()
            .deleteRange({ from: pos, to: pos + 1 })
            .run();
        }
      };

      container.appendChild(deleteBtn);

      const handle = document.createElement("div");
      handle.className = "resize-handle";
      container.appendChild(handle);

      let startX = 0;
      let startWidth = 0;
      let frame = null;

      handle.onpointerdown = (e) => {
        e.preventDefault();
        e.stopPropagation();

        startX = e.clientX;
        startWidth = img.offsetWidth;

        const onMove = (moveEvent) => {
          if (frame) cancelAnimationFrame(frame);

          frame = requestAnimationFrame(() => {
            const newWidth = Math.max(
              80,
              startWidth + (moveEvent.clientX - startX),
            );

            setAttrsAtPos({ width: `${newWidth}px` });
          });
        };

        const onUp = () => {
          if (frame) cancelAnimationFrame(frame);
          window.removeEventListener("pointermove", onMove);
          window.removeEventListener("pointerup", onUp);
        };

        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
      };

      container.onclick = (e) => {
        e.stopPropagation();
        const pos = getPos?.();
        if (typeof pos === "number") {
          editor.chain().focus().setNodeSelection(pos).run();
        }
      };

      dragBadge.onpointerdown = (e) => {
        e.preventDefault();
        e.stopPropagation();

        container.classList.add("dragging-image");

        const editorRect =
          editor.view.dom
            .closest(".editor-container")
            ?.getBoundingClientRect() ||
          editor.view.dom.getBoundingClientRect();

        const onMove = (moveEvent) => {
          const relativeX = moveEvent.clientX - editorRect.left;
          const zone = editorRect.width / 3;

          if (relativeX < zone) {
            applyAttrs({ ...node.attrs, align: "left" });
          } else if (relativeX < zone * 2) {
            applyAttrs({ ...node.attrs, align: "center" });
          } else {
            applyAttrs({ ...node.attrs, align: "right" });
          }
        };

        const onUp = (upEvent) => {
          const relativeX = upEvent.clientX - editorRect.left;
          const zone = editorRect.width / 3;

          let align = "center";
          if (relativeX < zone) align = "left";
          else if (relativeX >= zone * 2) align = "right";

          setAttrsAtPos({ align });

          container.classList.remove("dragging-image");
          window.removeEventListener("pointermove", onMove);
          window.removeEventListener("pointerup", onUp);
        };

        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
      };

      return {
        dom: container,
        update: (updatedNode) => {
          if (updatedNode.type.name !== node.type.name) return false;
          img.src = updatedNode.attrs.src;
          img.alt = updatedNode.attrs.alt || "Inserted image";
          applyAttrs(updatedNode.attrs);
          return true;
        },
        ignoreMutation: () => true,
        stopEvent: (event) => {
          const target = event.target;
          return (
            target === handle ||
            target === dragBadge ||
            target === deleteBtn ||
            handle.contains(target) ||
            dragBadge.contains(target) ||
            deleteBtn.contains(target)
          );
        },
      };
    };
  },
});

const NewTextEditor = ({ data = "<p></p>", onChange = () => {} }) => {
  const [menu, setMenu] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        protocols: ["http", "https", "mailto", "tel"],
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
          class: "editor-link",
        },
      }),
      Underline,
      Indentation,
      TextStyle,
      FontSize,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({ nested: true }),
      WordImage.configure({ inline: false, allowBase64: true }),
    ],
    content: data || "<p></p>",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {},
  });

  const editorState = useEditorState({
    editor,
    selector: ({ editor }) => ({
      isBold: editor.isActive("bold"),
      isItalic: editor.isActive("italic"),
      isUnderline: editor.isActive("underline"),
      isBulletList: editor.isActive("bulletList"),
      isOrderedList: editor.isActive("orderedList"),
      isTaskList: editor.isActive("taskList"),
      isAlignLeft: editor.isActive({ textAlign: "left" }),
      isAlignCenter: editor.isActive({ textAlign: "center" }),
      isAlignRight: editor.isActive({ textAlign: "right" }),
      isAlignJustify: editor.isActive({ textAlign: "justify" }),
      isLink: editor.isActive("link"),
      headingLevel: editor.isActive("heading", { level: 1 })
        ? 1
        : editor.isActive("heading", { level: 2 })
          ? 2
          : editor.isActive("heading", { level: 3 })
            ? 3
            : editor.isActive("heading", { level: 4 })
              ? 4
              : editor.isActive("heading", { level: 5 })
                ? 5
                : editor.isActive("heading", { level: 6 })
                  ? 6
                  : 0,
    }),
  });

  useEffect(() => {
    if (!editor) return;
    if (data != null && data !== editor.getHTML()) {
      editor.commands.setContent(data || "<p></p>", false);
    }
  }, [data, editor]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setIsExpanded(false);
        setMenu(null);
      }
    };

    if (isExpanded) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isExpanded]);

  useEffect(() => {
    if (!editor) return;

    const el = editor.view.dom;

    const onContextMenu = (e) => {
      const img = e.target.closest("img");
      if (!img) return;

      e.preventDefault();
      e.stopPropagation();

      const pos = editor.view.posAtDOM(img, 0);
      editor.chain().focus().setNodeSelection(pos).run();

      setMenu({
        x: e.clientX,
        y: e.clientY,
        pos,
      });
    };

    const closeMenu = () => setMenu(null);

    el.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("click", closeMenu);
    window.addEventListener("resize", closeMenu);
    document.addEventListener("scroll", closeMenu, true);

    return () => {
      el.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("click", closeMenu);
      window.removeEventListener("resize", closeMenu);
      document.removeEventListener("scroll", closeMenu, true);
    };
  }, [editor]);

  if (!editor) return null;

  const normalizeUrl = (rawUrl) => {
    const trimmed = rawUrl.trim();
    if (!trimmed) return "";

    if (/^(https?:\/\/|mailto:|tel:)/i.test(trimmed)) {
      return trimmed;
    }

    return `https://${trimmed}`;
  };

  const addLocalImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        editor
          .chain()
          .focus()
          .setImage({ src: reader.result, align: "center", width: "auto" })
          .run();
      };
      reader.readAsDataURL(file);
    };

    input.click();
  };

  const updateImageByPos = (attrs) => {
    if (!menu?.pos && menu?.pos !== 0) return;

    const currentNode = editor.state.doc.nodeAt(menu.pos);
    if (!currentNode || currentNode.type.name !== "image") return;

    editor
      .chain()
      .focus()
      .command(({ tr }) => {
        tr.setNodeMarkup(menu.pos, undefined, {
          ...currentNode.attrs,
          ...attrs,
        });
        return true;
      })
      .run();

    setMenu(null);
  };

  const deleteImageByPos = () => {
    if (!menu?.pos && menu?.pos !== 0) return;

    editor
      .chain()
      .focus()
      .deleteRange({ from: menu.pos, to: menu.pos + 1 })
      .run();

    setMenu(null);
  };

  const insertTablePrompt = () => {
    const rows = parseInt(prompt("Enter number of rows", "3"), 10);
    const cols = parseInt(prompt("Enter number of columns", "3"), 10);

    if (
      Number.isInteger(rows) &&
      Number.isInteger(cols) &&
      rows > 0 &&
      cols > 0
    ) {
      editor
        .chain()
        .focus()
        .insertTable({
          rows,
          cols,
          withHeaderRow: true,
        })
        .run();
    }
  };

  const addOrEditLink = () => {
    if (!editor) return;

    const { from, to, empty } = editor.state.selection;
    const previousUrl = editor.getAttributes("link")?.href || "";
    const url = window.prompt("Enter URL", previousUrl);

    if (url === null) return;

    editor.chain().focus().setTextSelection({ from, to }).run();

    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    const normalizedUrl = normalizeUrl(url);

    if (empty && !editor.isActive("link")) {
      const linkText = normalizedUrl;
      editor
        .chain()
        .focus()
        .insertContent(`<a href="${normalizedUrl}">${linkText}</a>`)
        .run();
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: normalizedUrl })
      .run();
  };

  const removeLink = () => {
    if (!editor) return;

    const attrs = editor.getAttributes("link");
    const currentHref = attrs?.href;

    if (!currentHref && !editor.isActive("link")) return;

    editor.chain().focus().extendMarkRange("link").unsetLink().run();
  };

  return (
    <div className={`editor-container ${isExpanded ? "expanded" : ""}`}>
      <div className="toolbar">
        <div className="toolbar-group">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleBold().run();
            }}
            className={editorState.isBold ? "is-active" : ""}
            title="Bold"
          >
            <Bold size={16} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleItalic().run();
            }}
            className={editorState.isItalic ? "is-active" : ""}
            title="Italic"
          >
            <Italic size={16} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleUnderline().run();
            }}
            className={editorState.isUnderline ? "is-active" : ""}
            title="Underline"
          >
            <UnderlineIcon size={16} />
          </button>
        </div>

        <div className="toolbar-group">
          <select
            value={editorState.headingLevel}
            onChange={(e) => {
              const level = Number(e.target.value);

              if (level === 0) {
                editor.chain().focus().setParagraph().run();
              } else {
                editor.chain().focus().setHeading({ level }).run();
              }
            }}
          >
            <option value="0">Text</option>
            <option value="1">Heading 1</option>
            <option value="2">Heading 2</option>
            <option value="3">Heading 3</option>
            <option value="4">Heading 4</option>
            <option value="5">Heading 5</option>
            <option value="6">Heading 6</option>
          </select>

          <select
            defaultValue="16px"
            onChange={(e) => {
              editor.chain().focus().setFontSize(e.target.value).run();
            }}
          >
            {[...Array(13)].map((_, i) => {
              const size = 8 + i * 2;
              return (
                <option key={size} value={`${size}px`}>
                  {size}px
                </option>
              );
            })}
          </select>
        </div>

        <div className="toolbar-group">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().setTextAlign("left").run();
            }}
            className={editorState.isAlignLeft ? "is-active" : ""}
            title="Align Left"
          >
            <AlignLeft size={16} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().setTextAlign("center").run();
            }}
            className={editorState.isAlignCenter ? "is-active" : ""}
            title="Align Center"
          >
            <AlignCenter size={16} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().setTextAlign("right").run();
            }}
            className={editorState.isAlignRight ? "is-active" : ""}
            title="Align Right"
          >
            <AlignRight size={16} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().setTextAlign("justify").run();
            }}
            className={editorState.isAlignJustify ? "is-active" : ""}
            title="Justify"
          >
            <AlignJustify size={16} />
          </button>
        </div>

        <div className="toolbar-group">
          <input
            type="color"
            title="Text Color"
            onInput={(e) =>
              editor.chain().focus().setColor(e.target.value).run()
            }
          />

          <input
            type="color"
            title="Highlight Color"
            defaultValue="#ffff00"
            onInput={(e) =>
              editor
                .chain()
                .focus()
                .setHighlight({ color: e.target.value })
                .run()
            }
          />
        </div>

        <div className="toolbar-group">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleBulletList().run();
            }}
            className={editorState.isBulletList ? "is-active" : ""}
            title="Bullet List"
          >
            <List size={16} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleOrderedList().run();
            }}
            className={editorState.isOrderedList ? "is-active" : ""}
            title="Ordered List"
          >
            <ListOrdered size={16} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleTaskList().run();
            }}
            className={editorState.isTaskList ? "is-active" : ""}
            title="Task List"
          >
            <ListChecks size={16} />
          </button>
        </div>

        <div className="toolbar-group">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              insertTablePrompt();
            }}
            title="Insert Table"
          >
            <TableIcon size={16} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().addColumnAfter().run();
            }}
            title="Add Column"
          >
            <Plus size={16} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().deleteColumn().run();
            }}
            title="Delete Column"
          >
            <Minus size={16} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().addRowAfter().run();
            }}
            title="Add Row"
          >
            <Plus size={16} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().deleteRow().run();
            }}
            title="Delete Row"
          >
            <Minus size={16} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().deleteTable().run();
            }}
            title="Delete Table"
          >
            <Trash2 size={16} />
          </button>
        </div>

        <div className="toolbar-group">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              addLocalImage();
            }}
            title="Insert Image"
          >
            <ImageIcon size={16} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().indent().run();
            }}
            title="Indent"
          >
            ➡️
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().outdent().run();
            }}
            title="Outdent"
          >
            ⬅️
          </button>
        </div>

        <div className="toolbar-group">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              addOrEditLink();
            }}
            className={editorState.isLink ? "is-active" : ""}
            title="Add Link"
          >
            <LinkIcon size={16} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              removeLink();
            }}
            title="Remove Link"
          >
            <Unlink size={16} />
          </button>
        </div>

        <div className="toolbar-group">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setIsExpanded((prev) => !prev);
            }}
            title={isExpanded ? "Exit Full Screen" : "Expand Editor"}
          >
            {isExpanded ? <Minimize2 size={16} /> : <Expand size={16} />}
          </button>
        </div>
      </div>

      <div
        className="editor-workspace"
        onClick={() => {
          if (!editor) return;

          if (editor.isEmpty) {
            editor.chain().focus().setTextSelection(1).run();
          } else {
            editor.commands.focus();
          }
        }}
      >
        <EditorContent editor={editor} className="tiptap-render" />
      </div>

      {menu && (
        <div className="context-menu" style={{ top: menu.y, left: menu.x }}>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              updateImageByPos({ align: "left" });
            }}
          >
            Align Left
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              updateImageByPos({ align: "center" });
            }}
          >
            Align Center
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              updateImageByPos({ align: "right" });
            }}
          >
            Align Right
          </button>

          <hr />

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              updateImageByPos({ width: "200px" });
            }}
          >
            Small
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              updateImageByPos({ width: "400px" });
            }}
          >
            Medium
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              updateImageByPos({ width: "600px" });
            }}
          >
            Large
          </button>

          <hr />

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              deleteImageByPos();
            }}
          >
            Delete
          </button>
        </div>
      )}

      {/* <style>{`
        :root {
          --bg: #ffffff;
          --ink: #111111;
          --muted: #e5e7eb;
          --accent: #111111;
        }

        .editor-container {
          border: 1px solid #d1d5db;
          background: #fff;
          font-family: "Inter", "Helvetica Neue", sans-serif;
          box-sizing: border-box;
          width: 100%;
          max-width: 100%;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06);
        }

        .editor-container.expanded {
          position: fixed;
          inset: 0;
          z-index: 99999;
          width: 100vw;
          height: 100vh;
          margin: 0;
          border: none;
          border-radius: 0;
          background: #fff;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-sizing: border-box;
        }

        .toolbar {
          position: sticky;
          top: 0;
          z-index: 10;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding: 10px;
          border-bottom: 1px solid #e5e7eb;
          background: #f8fafc;
          box-sizing: border-box;
          backdrop-filter: blur(6px);
        }

        .editor-container.expanded .toolbar {
          flex-shrink: 0;
          overflow-y: auto;
        }

        .toolbar-group {
          display: flex;
          gap: 4px;
          padding: 4px;
          border: 1px solid #d1d5db;
          background: #fff;
          border-radius: 10px;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
        }

        .toolbar button,
        .toolbar select,
        .toolbar input[type="color"] {
          border: 1px solid #d1d5db;
          background: white;
          padding: 7px 9px;
          cursor: pointer;
          transition: all 0.18s ease;
          border-radius: 8px;
        }

        .toolbar button:hover,
        .toolbar select:hover {
          background: black;
          color: white;
          border-color: black;
          transform: translateY(-1px);
        }

        .toolbar button:active {
          transform: translateY(0);
        }

        .toolbar button.is-active {
          background: black;
          color: white;
          border-color: black;
        }

        .toolbar select {
          font-weight: 600;
        }

        .editor-workspace {
          height: 400px;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 16px;
          background: #fff;
          box-sizing: border-box;
          width: 100%;
          max-width: 100%;
          scroll-behavior: smooth;
        }

        .editor-container.expanded .editor-workspace {
          flex: 1;
          min-height: 90%;
          overflow-y: auto;
          overflow-x: hidden;
          box-sizing: border-box;
          width: 100%;
          max-width: 100%;
        }

        .tiptap-render {
          min-height: 100%;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }

        .ProseMirror {
          min-height: 100%;
          width: 100%;
          max-width: 100%;
          outline: none;
          font-size: 15px;
          line-height: 1.45;
          box-sizing: border-box;
          white-space: pre-wrap;
          word-break: break-word;
          overflow-wrap: anywhere;
        }

        .ProseMirror p {
          margin: 8px 0;
          line-height: 1.45;
        }

        .ProseMirror h1 span {
          font-size: 25px !important;
          font-weight: 600;
          padding-bottom: 4px;
        }

        .ProseMirror h2 {
          font-size: 1.8rem;
          font-weight: 400;
        }

        .ProseMirror h3 {
          font-size: 1.5rem;
          font-weight: 400;
        }

        .ProseMirror ul {
          list-style: square;
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }

        .ProseMirror ol {
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }

        .ProseMirror ul[data-type="taskList"] {
          padding-left: 1.5rem;
        }

        .ProseMirror ul[data-type="taskList"] li {
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }

        .ProseMirror ul[data-type="taskList"] li::before {
          content: "■";
          font-weight: bold;
        }

        .ProseMirror ul[data-type="taskList"] input[type="checkbox"] {
          display: none;
        }

        .ProseMirror table {
          width: 100%;
          max-width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
          margin: 12px 0;
          overflow: hidden;
          border-radius: 8px;
        }

        .ProseMirror td,
        .ProseMirror th {
          border: 1px solid #cbd5e1;
          padding: 8px;
        }

        .ProseMirror th {
          background: #e5e7eb;
          color: #111827;
          font-weight: 700;
        }

        .ProseMirror tbody tr:nth-child(odd) td {
          background: #ffffff;
        }

        .ProseMirror tbody tr:nth-child(even) td {
          background: #f3f4f6;
        }

        .editor-link,
        .ProseMirror a {
          color: #2563eb;
          text-decoration: underline;
          cursor: pointer;
        }

        .image-node {
          position: relative;
          display: inline-block;
          margin: 12px 0;
          max-width: 100%;
          border-radius: 12px;
          transition: all 0.18s ease;
        }

        .image-node.align-left {
          float: left;
          margin: 0 16px 16px 0;
        }

        .image-node.align-right {
          float: right;
          margin: 0 0 16px 16px;
        }

        .image-node.align-center {
          display: block;
          width: fit-content;
          margin: 16px auto;
        }

        .image-node img {
          max-width: 100%;
          width: auto;
          height: auto;
          display: block;
          transition: width 0.12s ease, box-shadow 0.18s ease, transform 0.18s ease;
          border-radius: 12px;
          border: 1px solid #d1d5db;
          background: white;
          box-shadow: 0 2px 10px rgba(15, 23, 42, 0.06);
        }

        .image-node:hover img {
          box-shadow: 0 6px 20px rgba(15, 23, 42, 0.1);
        }

        .ProseMirror-selectednode img {
          box-shadow: 0 0 0 2px #2563eb, 0 8px 24px rgba(37, 99, 235, 0.14);
        }

        .dragging-image {
          opacity: 0.78;
          transform: scale(1.01);
        }

        .img-drag-badge {
          position: absolute;
          top: 8px;
          left: 8px;
          min-width: 26px;
          height: 26px;
          padding: 0 7px;
          border-radius: 999px;
          background: rgba(17, 24, 39, 0.82);
          color: white;
          font-size: 12px;
          line-height: 26px;
          text-align: center;
          cursor: grab;
          user-select: none;
          z-index: 2;
          transition: all 0.15s ease;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.18);
        }

        .img-drag-badge:hover {
          transform: translateY(-1px);
          background: rgba(17, 24, 39, 0.92);
        }

        .img-drag-badge:active {
          cursor: grabbing;
        }

        .img-delete {
          position: absolute;
          top: -10px;
          right: -10px;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          border: 1px solid #111827;
          background: #fff;
          color: #111827;
          font-weight: bold;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.14);
          transition: all 0.15s ease;
        }

        .img-delete:hover {
          background: #111827;
          color: #fff;
          transform: scale(1.05);
        }

        .resize-handle {
          position: absolute;
          right: -8px;
          bottom: -8px;
          width: 18px;
          height: 18px;
          background: white;
          border: 1px solid #111827;
          border-radius: 6px;
          cursor: nwse-resize;
          z-index: 3;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.14);
        }

        .resize-handle::after {
          content: "";
          width: 10px;
          height: 10px;
          background: #111827;
          clip-path: polygon(100% 0, 0 100%, 100% 100%);
        }

        .resize-handle:hover {
          background: #111827;
          transform: scale(1.05);
        }

        .resize-handle:hover::after {
          background: white;
        }

        .context-menu {
          position: fixed;
          background: white;
          border: 1px solid #d1d5db;
          z-index: 9999;
          min-width: 180px;
          box-sizing: border-box;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(15, 23, 42, 0.16);
          animation: fadeInMenu 0.14s ease;
        }

        .context-menu button {
          width: 100%;
          padding: 10px 12px;
          text-align: left;
          border: none;
          background: white;
          cursor: pointer;
          border-bottom: 1px solid #eef2f7;
          transition: all 0.15s ease;
        }

        .context-menu button:hover {
          background: #111827;
          color: white;
        }

        .context-menu hr {
          border: none;
          border-top: 1px solid #e5e7eb;
          margin: 0;
        }

        .editor-workspace::-webkit-scrollbar {
          width: 10px;
        }

        .editor-workspace::-webkit-scrollbar-thumb {
          background: #9ca3af;
          border-radius: 999px;
        }

        .editor-workspace::-webkit-scrollbar-track {
          background: #f3f4f6;
        }

        @keyframes fadeInMenu {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style> */}
    </div>
  );
};

export default NewTextEditor;
