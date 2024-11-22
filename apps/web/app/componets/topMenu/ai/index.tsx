import { selectGlobal, setGlobalState } from "@/app/store/globalSlice";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { Button } from "@/components/tailwind/ui/button";
import { Input } from "@/components/tailwind/ui/input";
import { Loader2 } from "lucide-react";
import type { EditorInstance } from "novel";
import { MdFiberNew, MdSend } from "react-icons/md";
import { FullTextTranslationMenu } from "../../FullTextTranslationMenu";
import { getLocalStorage } from "@/lib/utils";
import { toast } from "@/components/tailwind/ui/use-toast";
import { ToastAction } from "@/components/tailwind/ui/toast";
import { useTranslations } from "next-intl";
import { RiCameraLensLine, RiRobot2Line, RiSpeakLine } from "react-icons/ri";
import { BsTranslate } from "react-icons/bs";
import { FiRefreshCw } from "react-icons/fi";
import { FaFeather } from "react-icons/fa";
import { TbChartAreaLine } from "react-icons/tb";
export const AiTab = (props: {
  editorInstance: EditorInstance | null,
  onOpenAudioPlayer: () => void;
}) => {
  const { editorInstance, onOpenAudioPlayer } = props;
  const t = useTranslations();
  const dispatch = useAppDispatch()
  const global = useAppSelector(selectGlobal);

  const actinAIMenu: Array<{ value: string, label: string, icon: any }> = [
    { label: t('FullTextSummary'), value: 'Full text summary', icon: (<RiCameraLensLine />) },
    { label: t('FullTextTranslation'), value: 'Full text translation', icon: (<BsTranslate />) },
    { label: t('FullTextRewriting'), value: 'Full text rewriting', icon: (<FiRefreshCw />) },
    { label: t('FullTextReading'), value: 'Full text reading', icon: (<RiSpeakLine />) },
    { label: t('AIChat'), value: 'AI chat', icon: (<RiRobot2Line />) },
    { label: t('GenerateIllustrations'), value: 'Generate illustrations', icon: (<TbChartAreaLine />) },
    { label: t('OneClickGenerationOfLongArticles'), value: 'One click generation of long articles', icon: (<FaFeather className="text-[#8e47f0]" />) },
  ]

  const GenerateLongContent = () => {
    const title = global.novelTitle;
    const text = editorInstance.getText();
    const onRequest = async () => {
      toast({
        duration: Infinity,
        description: <div className='flex items-center'>
          <span>{t('AI_is_thinking')}</span>
          <Loader2 className="animate-spin ml-3 text-[#8e47f0]" style={{ width: 20, height: 20 }} />
        </div>,
        action: (<ToastAction altText="Goto schedule to undo" className="hidden" ></ToastAction>),
      })
      dispatch(setGlobalState({ longArticleGenerationStatus: true }))
    }

    if (title.trim().length < 1) {
      toast({
        duration: 2000,
        description: t('Please_enter_the_title_first')
      })
      return;
    }
    if (text.trim().length > 0) {
      toast({
        title: "",
        description: <div className='text-red-600'>{t('do_you_want_to_continue')}</div>,
        action: (
          <ToastAction altText="Goto schedule to undo" onClick={() => { onRequest() }}>{t('Confirm')}</ToastAction>
        ),
      })
      return;
    }
    dispatch(setGlobalState({ longArticleGenerationStatus: true }))
  }

  return (
    <div className="h-full text-sm">
      {
        actinAIMenu.map((item, index) => {
          if (item.value === 'Full text translation') {
            return (<FullTextTranslationMenu key={item.value} />)
          }
          return (
            <Button
              key={item.value}
              variant="ghost"
              className="hover:text-[#8e47f0] w-full flex justify-between"
              size="sm"
              onClick={() => {
                if (item.value === 'Full text summary') {
                  dispatch(setGlobalState({
                    selectRightMenu: global.selectRightMenu === 'FullTextSummary' ? '' : 'FullTextSummary',
                  }))
                }
                if (item.value === 'Full text rewriting') {
                  const content = getLocalStorage('markdown')
                  if (!content) {
                    toast({
                      duration: 2000,
                      description: (t('No_content_rewrite'))
                    })
                    return;
                  }
                  dispatch(setGlobalState({ rewriteDualScreen: true, freeRewritingStatus: true }))
                }
                if (item.value === 'Full text reading') {
                  onOpenAudioPlayer()
                }
                if (item.value === 'AI chat') {
                  dispatch(setGlobalState({
                    selectRightMenu: global.selectRightMenu === 'AiChat' ? '' : 'AiChat',
                  }))
                }
                if (item.value === 'Generate illustrations') {
                  dispatch(setGlobalState({
                    selectRightMenu: global.selectRightMenu === 'IntelligentMapping' ? '' : 'IntelligentMapping',
                  }))
                }
                if (item.value === 'One click generation of long articles') {
                  GenerateLongContent()
                }
              }}
            >
              <div className="flex items-center ">
                {item?.icon}
                <span className={`ml-2 ${index === 6 && 'text-[#8e47f0]'}`}>{item.label}</span>
              </div>
              {index === 6 && <MdFiberNew className='text-lg text-[#8e47f0]' />}
            </Button>)
        })
      }
      <div className="border-t flex justify-between items-center text-sm">
        <Input
          className="border-0 h-8 text-sm "
          placeholder={t('Please_enter_the_requirements')}
          value={global.freeRewritingText}
          onChange={(e) => {
            dispatch(setGlobalState({ freeRewritingText: e.target.value }))
          }}
          onKeyDown={(e) => {
            setTimeout(() => {
              const dom = window.document.getElementById("freeRewritingBut")
              if (e?.key === "Enter" && dom) dom.click()
            }, 10)
          }}
        />
        <div id="freeRewritingBut" onClick={() => {
          if (!global.freeRewritingText) {
            toast({
              duration: 2000,
              description: (t('Please_enter_the_requirements'))
            })
          } else {
            const { freeRewritingStatus } = global
            dispatch(setGlobalState({ rewriteDualScreen: true, freeRewritingStatus: true }))
          }
        }}>
          <MdSend className="text-[20px] cursor-pointer" />
        </div>
      </div>
    </div>
  )
}