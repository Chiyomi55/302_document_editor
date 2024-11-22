import { InputRule } from "@tiptap/core";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import TiptapImage from "@tiptap/extension-image";
import TiptapLink from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
import TextStyle from "@tiptap/extension-text-style";
import TiptapUnderline from "@tiptap/extension-underline";
import StarterKit from "@tiptap/starter-kit";

import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'

import { Markdown } from "tiptap-markdown";
import CustomKeymap from "./custom-keymap";
import { ImageResizer } from "./image-resizer";
import { Twitter } from "./twitter";
import { Mathematics } from "./mathematics";
import UpdatedImage from "./updated-image";

import CharacterCount from "@tiptap/extension-character-count";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Youtube from "@tiptap/extension-youtube";
import GlobalDragHandle from "tiptap-extension-global-drag-handle";

const PlaceholderExtension = Placeholder.configure({
  placeholder: ({ node }) => {
    if (node.type.name === "heading") {
      return `Heading ${node.attrs.level}`;
    }
    return "Press '/' for commands";
  },
  includeChildren: true,
});

const HighlightExtension = Highlight.configure({
  multicolor: true,
});

const MarkdownExtension = Markdown.configure({
  html: false,
  transformCopiedText: true,
});

const Horizontal = HorizontalRule.extend({
  addInputRules() {
    return [
      new InputRule({
        find: /^(?:---|—-|___\s|\*\*\*\s)$/u,
        handler: ({ state, range }) => {
          const attributes = {};

          const { tr } = state;
          const start = range.from;
          const end = range.to;

          tr.insert(start - 1, this.type.create(attributes)).delete(tr.mapping.map(start), tr.mapping.map(end));
        },
      }),
    ];
  },
});

Table.configure({
  HTMLAttributes: {
    class: "table-fixed m-0 overflow-hidden w-[98%] mx-auto my-3 border-collapse",
  },
  allowTableNodeSelection: true,
});
TableRow.configure({
  HTMLAttributes: {
    class: "border box-border min-w-[1em] py-2 px-1 relative align-top text-start !py-1",
  },
});
TableCell.configure({
  HTMLAttributes: {
    class: "border box-border min-w-[1em] py-2 px-1 relative align-top text-start !py-1",
  },
});
TableHeader.configure({
  HTMLAttributes: {
    class: "bg-stone-100 border box-border min-w-[1em] py-2 px-1 relative align-top text-start !py-1",
  },
});

export * from "./ai-highlight";
export * from "./slash-command";
export {
  CodeBlockLowlight,
  Horizontal as HorizontalRule,
  ImageResizer,
  InputRule,
  PlaceholderExtension as Placeholder,
  StarterKit,
  TaskItem,
  TaskList,
  TiptapImage,
  TiptapUnderline,
  MarkdownExtension,
  TextStyle,
  Color,
  HighlightExtension,
  CustomKeymap,
  TiptapLink,
  UpdatedImage,
  Youtube,
  Twitter,
  Mathematics,
  CharacterCount,
  GlobalDragHandle,
  Table,
  TableCell,
  TableHeader,
  TableRow,
};
