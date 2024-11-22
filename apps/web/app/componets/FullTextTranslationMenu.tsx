import { BsTranslate } from "react-icons/bs";
import { languageMenuList } from "@/lib/language";
import { IoIosArrowForward } from "react-icons/io";
import { Button } from "@/components/tailwind/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/tailwind/ui/popover";
import { useAppDispatch } from "../store/hooks";
import { setGlobalState } from "../store/globalSlice";
import { getLocalStorage } from "@/lib/utils";
import { toast } from "@/components/tailwind/ui/use-toast";
import { useState } from "react";
import { useTranslations } from "next-intl";

export function FullTextTranslationMenu() {
  const t = useTranslations();
  const dispatch = useAppDispatch()
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild >
        <Button variant="ghost" className="hover:text-[#8e47f0] w-full justify-between flex" size="sm">
          <div className="flex items-center">
            <BsTranslate className="mr-2" />
            {t('FullTextTranslation')}
          </div>
          <IoIosArrowForward />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-1 z-[9999]" align='start' side='right'>
        <div>
          {
            languageMenuList.map((item) => (
              <Button
                variant="ghost"
                key={item.value}
                className="hover:text-[#8e47f0] w-full flex justify-between"
                size="sm"
                onClick={() => {
                  const content = getLocalStorage('markdown')
                  if (!content) {
                    toast({
                      duration: 2000,
                      description: (t('no_content_translate'))
                    })
                    return;
                  }
                  setOpen(false);
                  dispatch(setGlobalState({ translateDualScreen: true, translateDualLanguage: item.value }))
                }}
              >
                <span>{item.label}</span>
              </Button>
            ))
          }
        </div>
      </PopoverContent>
    </Popover>
  )
}
