"use client";

import type { ReactNode } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

function ToolbarButton({
  onClick,
  active,
  children,
  label,
}: {
  onClick: () => void;
  active?: boolean;
  children: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`rounded-md px-2.5 py-1.5 text-xs transition-colors ${
        active
          ? "bg-gold/20 text-gold"
          : "text-cream-dim/70 hover:bg-cream/10 hover:text-cream"
      }`}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-cream/15 bg-navy-900/60 px-2 py-1.5">
      <ToolbarButton
        label="Negrita"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <strong>N</strong>
      </ToolbarButton>
      <ToolbarButton
        label="Cursiva"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <em>C</em>
      </ToolbarButton>
      <span className="mx-1 h-4 w-px bg-cream/15" />
      <ToolbarButton
        label="Título grande"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        Título
      </ToolbarButton>
      <ToolbarButton
        label="Subtítulo"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        Subtítulo
      </ToolbarButton>
      <ToolbarButton
        label="Párrafo normal"
        active={editor.isActive("paragraph")}
        onClick={() => editor.chain().focus().setParagraph().run()}
      >
        Párrafo
      </ToolbarButton>
      <span className="mx-1 h-4 w-px bg-cream/15" />
      <ToolbarButton
        label="Lista con viñetas"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        Lista
      </ToolbarButton>
    </div>
  );
}

export function RichTextEditor({
  initialContent,
  onChangeHtml,
}: {
  initialContent: string;
  onChangeHtml: (html: string) => void;
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose-content min-h-[260px] px-4 py-3 text-cream focus:outline-none [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:text-cream [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:font-serif [&_h3]:text-xl [&_h3]:text-cream [&_h3]:mt-3 [&_h3]:mb-1.5 [&_p]:my-3 [&_p]:leading-relaxed [&_strong]:text-cream [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:my-1",
      },
    },
    onUpdate: ({ editor }) => {
      onChangeHtml(editor.getHTML());
    },
  });

  return (
    <div className="overflow-hidden rounded-lg border border-cream/15 bg-navy-950">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
