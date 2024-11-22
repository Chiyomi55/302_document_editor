import { Button } from "@/components/tailwind/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/tailwind/ui/popover"
import { useAppSelector } from "../store/hooks";
import { selectGlobal } from "../store/globalSlice";
import { useEffect, useState } from "react";
import { analyzeMarkdown } from "@/lib/utils";
import { useTranslations } from "next-intl";

export const WordCount = () => {
  const t = useTranslations()
  const global = useAppSelector(selectGlobal);
  const [wordCount, seWordCount] = useState({
    characters: 0, // Total word count
    chineseChars: 0, // Number of characters
    words: 0, // Number of words
    sentences: 0, // Number of sentences
    paragraphs: 0, // paragraphs 
  });

  useEffect(() => {
    let markdown = global.markdown;
    if (!global.markdown) {
      markdown = localStorage.getItem("markdown")
    }
    if (markdown?.length > 0) {
      const data = analyzeMarkdown(markdown)
      seWordCount(data)
    } else {
      seWordCount({
        characters: 0,
        chineseChars: 0,
        words: 0,
        sentences: 0,
        paragraphs: 0,
      })
    }
  }, [global.markdown])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="flex justify-between items-center">
          {t('Word_count')}： <span>{wordCount.characters}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-3 z-[9999] flex flex-col gap-1">
        <div className="flex justify-between gap-4">{t('Word_count')}： <span>{wordCount.characters}</span></div>
        <div className="flex justify-between gap-4">{t('Number_characters')}： <span>{wordCount.chineseChars}</span></div>
        <div className="flex justify-between gap-4">{t('Number_words')}： <span>{wordCount.words}</span></div>
        <div className="flex justify-between gap-4">{t('Number_sentences')}： <span>{wordCount.sentences}</span></div>
        <div className="flex justify-between gap-4">{t('Number_paragraphs')}： <span>{wordCount.paragraphs}</span></div>
      </PopoverContent>
    </Popover>
  )
}