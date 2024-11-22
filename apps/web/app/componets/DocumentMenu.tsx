import React from 'react';
import { useState } from "react";
import { AiTab } from './topMenu/ai';
import { EditTab } from './topMenu/edit';
import { SetUpTab } from './topMenu/setUp';
import { DocumentTab } from './topMenu/doc';
import type { EditorInstance } from "novel";
import { Button } from "@/components/tailwind/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/tailwind/ui/popover";
import { useTranslations } from 'next-intl';
import { FiEdit3, FiFileText } from 'react-icons/fi';
import { PiMagicWandFill } from 'react-icons/pi';
import { AiOutlineSetting } from 'react-icons/ai';

interface IProps {
  type: string;
  editorInstance: EditorInstance | null
  onOpenAudioPlayer: () => void;
}

export function DocumentMenu(props: IProps) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const { type, editorInstance, onOpenAudioPlayer } = props;

  const documentMenuList = {
    'File': { name: t('file'), icon: (<FiFileText />) },
    'Edit': { name: t('edit'), icon: (<FiEdit3 />) },
    'AI': { name: t('AI'), icon: (<PiMagicWandFill />) },
    'Preference': { name: t('Preference_settings'), icon: (<AiOutlineSetting />) },
  }

  const onRenderingMenu = () => {
    switch (type) {
      case 'File':
        return (<DocumentTab editorInstance={editorInstance} />)
      case 'Edit':
        return (
          <EditTab editorInstance={editorInstance} />
        )
      case 'AI':
        return (<AiTab
          editorInstance={editorInstance}
          onOpenAudioPlayer={onOpenAudioPlayer}
        />)
      case 'Preference':
        return (<SetUpTab />)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className={`hover:text-[#8e47f0] md:mx-2 py-1 px-2 ${type === 'AI' && 'text-[#8e47f0]'}`} size="sm">
          {documentMenuList[type].icon}
          <span className="ml-1 text-sm">{documentMenuList[type].name}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-1 z-[9999]">
        {onRenderingMenu()}
      </PopoverContent>
    </Popover>
  )
}
