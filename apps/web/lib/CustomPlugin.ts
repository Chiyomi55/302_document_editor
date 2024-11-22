import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
const TrailingParagraph = Extension.create({
  name: 'trailingParagraph',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        appendTransaction: (transactions, oldState, newState) => {
          const { doc, tr } = newState;
          const { lastChild } = doc;

          if (lastChild && lastChild.type.name !== 'paragraph' || lastChild.content.size > 0) {
            const newNode = newState.schema.nodes.paragraph.create();
            tr.insert(doc.content.size, newNode);
            return tr;
          }
        },
      }),
    ];
  },
});

export default [TrailingParagraph]