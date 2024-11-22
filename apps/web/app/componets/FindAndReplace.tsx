import { useEditor } from "novel";
import { IoClose } from "react-icons/io5";
import { useEffect, useState } from "react";
import { MdOutlineCheckBox } from "react-icons/md";
import { Input } from "@/components/tailwind/ui/input";
import { Button } from "@/components/tailwind/ui/button";
import { MdOutlineCheckBoxOutlineBlank } from "react-icons/md";
import { useTranslations } from "next-intl";

interface IProps {
  language: 'chinese' | 'english' | 'japanese',
  onclose: () => void,
}

export default function FindAndReplace(props: IProps) {
  const t = useTranslations();
  const { editor } = useEditor();
  const { language, onclose } = props;
  const [load, setLoad] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceTetx, setReplaceText] = useState('');
  const [findLocation, setFindLocation] = useState([]);
  const [findLocationIndex, setFindLocationIndex] = useState(0);
  const [checkBox, setCheckBox] = useState({ replace: false, caseSensitivity: false, regularExpression: false })

  const onCheckbox = [
    { name: t('replace'), key: 'replace' },
    { name: t('Case_sensitive'), key: 'caseSensitivity' },
    { name: t('regular_expression'), key: 'regularExpression' },
  ]

  useEffect(() => {
    if (load && !findLocation.length && findText && editor) {
      findLocationRule(findText);
    }
  }, [load])

  useEffect(() => {
    return () => {
      findLocation.forEach(({ from, to }) => {
        editor.chain().setTextSelection({ from, to }).unsetHighlight().run();
      });
    }
  }, [findLocation])

  useEffect(() => {
    if (findText && editor) {
      onMatchCharacters(findText);
    }
  }, [checkBox.caseSensitivity, checkBox.regularExpression])


  // Replace all matching content
  const onReplaceAll = () => {
    if (editor && findLocation.length && replaceTetx) {
      findLocation.forEach((item) => {
        const { from, to } = item;
        editor.chain().focus().setTextSelection({ from, to })  // Select the specified area
          .deleteSelection()  // Delete selected content
          .insertContent(replaceTetx)  // Insert new content
          .run();
      })
    }
  }

  // Replace the content of a single match
  const onReplaceOne = () => {
    if (editor && findLocation.length && replaceTetx) {
      if (findLocationIndex - 1 >= 0) {
        const { from, to } = findLocation[findLocationIndex - 1];
        editor.chain().focus().setTextSelection({ from, to })  // Select the specified area
          .deleteSelection()  // Delete selected content
          .insertContent(replaceTetx)  // Insert new content
          .run();
      }
    }
  }

  // Match the search location
  const onFindLocation = () => {
    if (findLocation.length && editor) {
      let fromTemp = 0;
      if (findLocationIndex === findLocation.length) {
        const { from, to } = findLocation[0];
        fromTemp = from;
        // Restore the previous highlight
        editor.chain().setTextSelection(findLocation[findLocation.length - 1]).toggleHighlight({ color: '#adf4ff' }).run();
        editor.chain().setTextSelection({ from, to }).toggleHighlight({ color: '#ffeaad' }).run()
        setFindLocationIndex(1)
      } else {
        if (findLocationIndex !== 0) {
          // Restore the previous highlight
          editor.chain().setTextSelection(findLocation[findLocationIndex - 1]).toggleHighlight({ color: '#adf4ff' }).run();
        }
        const { from, to } = findLocation[findLocationIndex];
        fromTemp = from;
        editor.chain().setTextSelection({ from, to }).toggleHighlight({ color: '#ffeaad' }).run();
        setFindLocationIndex((v) => v + 1)
      }

      const { node } = editor.view.domAtPos(fromTemp);
      if (node.nodeType === Node.TEXT_NODE) {
        // Get the parent element of the text node
        const parentElement = node.parentElement;
        if (parentElement) {
          const { top, left } = parentElement.getBoundingClientRect();
          window.scrollTo({
            top: top + window.scrollY - (window.innerHeight / 2),
            left: 0,
            behavior: 'smooth'
          });
        } else {
          console.warn('Parent element not found for the text node.');
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        //@ts-ignore
        const { top, left } = node.getBoundingClientRect();
        window.scrollTo({
          top: top + window.scrollY - (window.innerHeight / 2),
          left: 0,
          behavior: 'smooth'
        });
      }
    }
  }

  // Query rules
  const findLocationRule = (value: string) => {
    const matches = [];
    if (checkBox.caseSensitivity) {
      editor.state.doc.descendants((node, pos) => {
        if (node.isText) {
          const text = node.text;
          let startIndex = 0;
          let matchIndex;
          while ((matchIndex = text.indexOf(value, startIndex)) !== -1) {
            // Calculate the position in the entire document
            const from = pos + matchIndex;
            const to = from + value.length;
            matches.push({ from, to });
            // Update the starting position to continue searching for subsequent matches
            startIndex = matchIndex + value.length;
          }
        }
      });
    } else if (checkBox.regularExpression) {
      const regex = new RegExp(value, "igm");
      editor.state.doc.descendants((node, pos) => {
        if (node.isText) {
          const text = node.text;
          let match;
          // Reset the lastIndex of the regular expression to match from scratch
          regex.lastIndex = 0;
          // Use exec to match one by one
          while ((match = regex.exec(text)) !== null) {
            const from = pos + match.index;
            const to = from + match[0].length;
            matches.push({ from, to });
            // Note: regex.exe will automatically update lastIndex, so there is no need to manually update it
          }
        }
      });
    } else {
      editor.state.doc.descendants((node, pos) => {
        if (node.isText) {
          const text = node.text?.toLowerCase();
          const findTextTemp = value.toLowerCase();
          let startIndex = 0;
          let matchIndex;
          while ((matchIndex = text.indexOf(findTextTemp, startIndex)) !== -1) {
            // Calculate the position in the entire document
            const from = pos + matchIndex;
            const to = from + value.length;
            matches.push({ from, to });
            // Update the starting position to continue searching for subsequent matches
            startIndex = matchIndex + value.length;
          }
        }
      });
    }
    setFindLocation(matches);
    if (matches.length) {
      setFindLocationIndex(0)
      // Highlight all matching items
      matches.forEach(({ from, to }) => {
        editor.chain().setTextSelection({ from, to }).toggleHighlight({ color: '#adf4ff' }).run()
      });
    }
    setLoad(false)
  }

  // Search for matching content
  const onMatchCharacters = (value: string) => {
    if (editor) {
      if (findLocation.length) {
        findLocation.forEach(({ from, to }) => {
          editor.chain().setTextSelection({ from, to: to + replaceTetx.length }).unsetHighlight().run();
        });
        setFindLocation([]);
        setLoad(true)
      } else {
        findLocationRule(value)
      }
    }
  }

  return (
    <div className={`fixed top-[60px] border p-3 right-5 w-80 bg-background z-[99999] rounded-sm transition-all `}>
      <IoClose className="absolute right-2 top-2 text-[18] cursor-pointer" onClick={() => onclose()} />
      <div className="mb-3">
        <div className="text-[14px] mb-1">{t('find')}</div>
        <Input
          className="h-7"
          id="findText"
          autoFocus={true}
          placeholder={t('Please_enter_the_search_content')}
          value={findText}
          onChange={(e) => {
            setFindText(e.target.value)
            onMatchCharacters(e.target.value)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const dom = window.document.getElementById('lookup');
              if (dom) {
                dom.click();
              }
            }
          }}
        />
      </div>
      <div className={`${checkBox.replace ? 'block' : 'hidden'} mb-3`}>
        <div className="text-[14px] mb-1">{t('replace')}</div>
        <Input value={replaceTetx} className="h-7" placeholder={t('Please_enter_replacement_content')} onChange={(e) => { setReplaceText(e.target.value) }} />
      </div>
      <div className="flex justify-between">
        {
          onCheckbox.map((item => (
            <div
              key={item.key}
              className="flex items-center cursor-pointer"
              onClick={() => {
                setCheckBox(v => {
                  if (item.key === 'caseSensitivity') {
                    return { ...v, [item.key]: !v[item.key], ['regularExpression']: false };
                  } else if (item.key === 'regularExpression') {
                    return { ...v, [item.key]: !v[item.key], ['caseSensitivity']: false };
                  }
                  return { ...v, [item.key]: !v[item.key] };
                })
              }}
            >
              {!checkBox[item.key] ? <MdOutlineCheckBoxOutlineBlank className="text-[25px]" /> : <MdOutlineCheckBox className="text-[25px]" />}
              <span className="text-sm ml-1">{item.name}</span>
            </div>
          )))
        }
      </div>
      <div className={`${checkBox.replace ? 'block' : 'hidden'} mt-3 flex justify-between`}>
        <Button onClick={onFindLocation} id="lookup" className="w-full mx-1 h-8" size="sm">{t('find')}</Button>
        <Button className="w-full mx-1 h-8" size="sm" onClick={onReplaceOne}>{t('replace')}</Button>
        <Button className="w-full mx-1 h-8" size="sm" onClick={onReplaceAll}>{t('replace_all')}</Button>
      </div>
    </div>
  )
}