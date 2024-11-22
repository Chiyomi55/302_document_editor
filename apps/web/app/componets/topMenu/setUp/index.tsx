import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { useRouter } from 'next/navigation'
import { CgScreenWide } from "react-icons/cg"
import { MdOutlineDarkMode } from "react-icons/md"
import { Label } from "@/components/tailwind/ui/label"
import { Button } from "@/components/tailwind/ui/button"
import { getLocalStorage, setLocalStorage } from "@/lib/utils"
import { useAppDispatch, useAppSelector } from "@/app/store/hooks"
import { selectGlobal, setGlobalState } from "@/app/store/globalSlice"
import { Tabs, TabsList, TabsTrigger } from "@/components/tailwind/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/tailwind/ui/radio-group"
import { useTranslations } from "next-intl"
import { Switch } from "@/components/tailwind/ui/switch"

export const SetUpTab = () => {
  const t = useTranslations();
  const router = useRouter();
  const dispatch = useAppDispatch()
  const global = useAppSelector(selectGlobal);

  const appearances = [
    { label: t('Bright'), theme: 'light' },
    { label: t('System'), theme: 'system' },
    { label: t('Dark'), theme: 'dark' },
  ];

  const [wideLayout, setWideLayout] = useState(0);
  const { theme: currentTheme, setTheme } = useTheme();

  useEffect(() => {
    const wideLayoutTemp = getLocalStorage('wideLayout');
    setWideLayout(wideLayoutTemp ? Number(wideLayoutTemp) : 0)
    setLocalStorage('wideLayout', `${Number(wideLayoutTemp ? Number(wideLayoutTemp) : 0)}`)
  }, [])

  return (
    <div className="h-full text-sm w-full">
      <Button variant="ghost" size="sm" className="flex items-center justify-between hover:text-[#8e47f0] w-full" >
        <div className='flex items-center'>
          <CgScreenWide className="mr-2" />
          {t('WideLayout')}
        </div>
        <Switch
          checked={Boolean(wideLayout)}
          onCheckedChange={(v) => {
            setWideLayout(Number(v))
            dispatch(setGlobalState({ wideLayout: Number(v) }))
            setLocalStorage('wideLayout', `${Number(v)}`)
          }}
        />
      </Button>
      <Button variant="ghost" className="flex items-center justify-between hover:text-[#8e47f0] w-full h-12 px-3" >
        <div className="flex items-center">
          <MdOutlineDarkMode className="mr-2" />
          {t('ThemeStyle')}
        </div>
        <Tabs value={currentTheme} onValueChange={(value) => { setTheme(value) }}>
          <TabsList className="grid w-full grid-cols-3 bg-[#e6aeff2e]">
            {
              appearances.map(item => (
                <TabsTrigger key={item.theme} value={item.theme}>
                  {item.label}
                </TabsTrigger>
              ))
            }
          </TabsList>
        </Tabs>
      </Button>
      <div className='mt-3 border-t'>
        <RadioGroup
          className='gap-0'
          defaultValue={global.language}
          value={global.language}
          onValueChange={(value) => {
            localStorage.setItem('lang', value)
            dispatch(setGlobalState({ language: value, renew: !global.renew }))
            document.title = t('title')
            const url = window.location.pathname;
            const locale = { "english": 'en', "chinese": 'zh', "japanese": 'ja' };
            const supportedLocales = Object.values(locale);
            const newLocale = locale[value];
            const hasLocale = supportedLocales.some(loc => url.startsWith(`/${loc}`));
            let updatedUrl;
            if (hasLocale) {
              // Dynamically replace existing language code with regular expressions, only replacing the first matching item
              updatedUrl = url.replace(/^\/(en|zh|ja)(\/|$)/, `/${newLocale}$2`);
            } else {
              // If the URL does not have a language code, add a new language code at the beginning
              updatedUrl = `/${newLocale}${url}`;
            }
            router.replace(updatedUrl)
          }}>
          <Button size='sm' variant="ghost" className="flex justify-start hover:text-[#8e47f0] w-full" >
            <RadioGroupItem value="chinese" id="r1" />
            <Label className='leading-[2.7] text-left cursor-pointer ml-2 w-full h-full' htmlFor="r1">中文</Label>
          </Button>
          <Button size='sm' variant="ghost" className="flex justify-start hover:text-[#8e47f0] w-full" >
            <RadioGroupItem value="english" id="r2" />
            <Label className='leading-[2.7] text-left cursor-pointer ml-2 w-full h-full' htmlFor="r2">English</Label>
          </Button>
          <Button size='sm' variant="ghost" className="flex justify-start hover:text-[#8e47f0] w-full" >
            <RadioGroupItem value="japanese" id="r3" />
            <Label className='leading-[2.7] text-left cursor-pointer ml-2 w-full h-full' htmlFor="r3">日本語</Label>
          </Button>
        </RadioGroup>
      </div>
    </div>
  )
}