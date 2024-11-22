import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { }

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, value, ...props }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

    // Merge ref
    React.useImperativeHandle(ref, () => textareaRef.current!);

    const adjustHeight = () => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = "35px"; // Reset height to obtain scrollHeight
        textarea.style.height = `${Math.min(textarea.scrollHeight, 210) || 35}px`; // Set the height to a maximum of 600px
        textarea.style.overflowY = textarea.scrollHeight > 210 ? "auto" : "hidden"; // Set overflow based on height
      }
    };

    // Use useEffect to adjust the initial height during component mounting
    React.useEffect(() => {
      adjustHeight(); // Initial adjustment height
    }, [value, className]);

    return (
      <textarea
        ref={textareaRef}
        className={cn(
          "flex h-auto max-h-[600px] w-full resize-none rounded-md border outline-none border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground  disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        onInput={adjustHeight}
        value={value} // Adjust the height when the input content changes
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
