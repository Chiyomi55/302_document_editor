import type { EditorInstance } from "novel";
import { Button } from "@/components/tailwind/ui/button";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { selectGlobal, setGlobalState } from "@/app/store/globalSlice";
import { useTranslations } from "next-intl";
import { TfiBackLeft, TfiBackRight } from "react-icons/tfi";
import { RiFindReplaceLine } from "react-icons/ri";

export const EditTab = (props: { editorInstance: EditorInstance | null }) => {
  const t = useTranslations();
  const { editorInstance } = props;
  const dispatch = useAppDispatch()
  const global = useAppSelector(selectGlobal);

  const actinEditMenu: { [key: string]: Array<{ value: string, label: string, ShortcutKeys: string, icon: any }> } = {
    'history': [
      { label: t('Undo'), value: 'Undo', ShortcutKeys: 'Ctrl + Z', icon: (<TfiBackLeft />) },
      { label: t('Restore'), value: 'Restore', ShortcutKeys: 'Ctrl + Y', icon: (<TfiBackRight />) },
    ],
    'find': [
      { label: t('FindAndReplace'), value: 'Find and Replace', ShortcutKeys: 'Ctrl + F', icon: (<RiFindReplaceLine />) },
    ]
  }

  return (
    <div className="h-full text-sm">
      {
        Object.keys(actinEditMenu).map(key => (
          <div className={`${key === 'find' ? 'border-b-0' : 'border-b'}`} key={key}>
            {actinEditMenu[key].map((item) => (
              <Button
                size="sm"
                variant="ghost"
                key={item.value}
                className="hover:text-[#8e47f0] w-full flex justify-between"
                onClick={() => {
                  if (editorInstance) {
                    if (key === 'find') {
                      dispatch(setGlobalState({ findAndReplaceVisible: true }))
                    }
                    if (item.value === 'Undo') {
                      editorInstance.chain().undo().run()
                      const { titleRecord } = global
                      if (titleRecord.status) {
                        localStorage.setItem('novel-title', titleRecord.oldTitle)
                        dispatch(setGlobalState({ novelTitle: titleRecord.oldTitle, titleRecord: { oldTitle: '', status: false } }))
                      }
                      return;
                    }
                    if (item.value === 'Restore') {
                      editorInstance.chain().redo().run();
                      return;
                    }
                    editorInstance.state.doc.descendants((node, pos) => {
                      if (node.isText) {
                        const from = pos;
                        const to = pos + node.text.length;
                        editorInstance.chain().setTextSelection({ from, to }).unsetHighlight().run();
                        editorInstance.chain().unsetTextAlign();
                      }
                    });
                  }
                }}
              >
                <div className="flex items-center">
                  {item?.icon}
                  <span className="ml-2">{item[global.language]}</span>
                </div>
                {item?.ShortcutKeys && (<span className="text-xs">{item?.ShortcutKeys}</span>)}
              </Button>
            )
            )}
          </div>
        ))
      }
    </div>
  )
}