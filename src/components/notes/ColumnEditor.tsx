import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from "react";

interface ColumnEditorProps {
  content: string;
  onContentChange: (html: string) => void;
  onFocus?: () => void;
  placeholder?: string;
}

export interface ColumnEditorHandle {
  getEditor: () => Editor | null;
}

export const ColumnEditor = forwardRef<ColumnEditorHandle, ColumnEditorProps>(
  ({ content, onContentChange, onFocus, placeholder = "Start writing..." }, ref) => {
    const initialContent = useRef(content);

    const editor = useEditor({
      extensions: [
        StarterKit.configure({ codeBlock: false }),
        Placeholder.configure({ placeholder }),
        TaskList,
        TaskItem.configure({ nested: true }),
        Highlight.configure({ multicolor: true }),
        TextAlign.configure({ types: ["heading", "paragraph"] }),
        Underline,
      ],
      content: initialContent.current,
      editorProps: {
        attributes: {
          class: "prose prose-sm sm:prose dark:prose-invert max-w-none focus:outline-none min-h-[200px] px-1",
        },
      },
      onUpdate: ({ editor }) => {
        onContentChange(editor.getHTML());
      },
      onFocus: () => {
        onFocus?.();
      },
    });

    useImperativeHandle(ref, () => ({
      getEditor: () => editor,
    }), [editor]);

    // Sync content from outside only when it truly changes (e.g. note switch)
    // Skip if editor is focused — the change came from user typing
    const lastExternalContent = useRef(content);
    useEffect(() => {
      if (content !== lastExternalContent.current) {
        lastExternalContent.current = content;
        if (!editor?.isFocused) {
          editor?.commands.setContent(content || "");
        }
      }
    }, [content, editor]);

    return <EditorContent editor={editor} />;
  }
);

ColumnEditor.displayName = "ColumnEditor";
