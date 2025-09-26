import Quill, { QuillOptions } from 'quill';
import { Delta, Op } from 'quill/core';
import 'quill/dist/quill.snow.css';
import {
  MutableRefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { Button } from './ui/button';

import { ImageIcon, Smile, XIcon } from 'lucide-react';
import { MdSend } from 'react-icons/md';
import { PiTextAa } from 'react-icons/pi';

import Hint from './hint';
import { cn } from '@/lib/utils';
import { EmojiPopover } from './emoji-popover';
import Image from 'next/image';
import { findMentionAtCursor } from '@/lib/mentions';
import { MentionAutocomplete } from '@/features/mentions/components/mention-autocomplete';
import { Id } from '../../convex/_generated/dataModel';
import { useWorkspaceId } from '@/hooks/use-workspace-id';

type EditorValue = {
  image: File | null;
  body: string;
};

interface EditorProps {
  onSubmit: ({ image, body }: EditorValue) => void;
  onCancel?: () => void;
  placeholder?: string;
  defaultValue?: Delta | Op[];
  disabled?: boolean;
  innerRef?: MutableRefObject<Quill | null>;
  variant?: 'create' | 'update';
  workspaceId?: Id<'workspaces'>;
}

const Editor = ({
  onSubmit,
  onCancel,
  placeholder = 'Write something...',
  defaultValue = [],
  disabled = false,
  innerRef,
  variant = 'create',
  workspaceId,
}: EditorProps) => {
  const [text, setText] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [isToolbarVisible, setIsToolbarVisible] = useState(true);

  // Mention autocomplete state
  const [mentionState, setMentionState] = useState<{
    isVisible: boolean;
    searchTerm: string;
    position: { x: number; y: number };
    mentionStart: number;
  } | null>(null);

  const currentWorkspaceId = useWorkspaceId();
  const effectiveWorkspaceId = workspaceId || currentWorkspaceId;

  const submitRef = useRef(onSubmit);
  const placeholderRef = useRef(placeholder);
  const disabledRef = useRef(disabled);
  const quillRef = useRef<Quill | null>(null);
  const defaultValueRef = useRef(defaultValue);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageElementRef = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => {
    submitRef.current = onSubmit;
    placeholderRef.current = placeholder;
    defaultValueRef.current = defaultValue;
    disabledRef.current = disabled;
  });

  // Handle mention selection
  const handleMentionSelect = useCallback((user: { username: string; displayName: string }) => {
    const quill = quillRef.current;
    if (!quill || !mentionState) return;

    const currentPosition = quill.getSelection()?.index || 0;
    const beforeMention = quill.getText(0, mentionState.mentionStart);
    const afterMention = quill.getText(currentPosition);

    // Replace the partial mention with the full username
    const newContent = `${beforeMention}@${user.username} ${afterMention}`;
    quill.setText(newContent);

    // Position cursor after the mention
    const newCursorPosition = mentionState.mentionStart + user.username.length + 2; // @ + username + space
    quill.setSelection(newCursorPosition);

    setMentionState(null);
    quill.focus();
  }, [mentionState]);

  // Handle closing autocomplete
  const handleMentionClose = useCallback(() => {
    setMentionState(null);
    quillRef.current?.focus();
  }, []);

  // Check for mention trigger and update autocomplete state
  const checkForMention = useCallback((quill: Quill) => {
    const selection = quill.getSelection();
    if (!selection) return;

    const currentText = quill.getText();
    const cursorPosition = selection.index;

    const mention = findMentionAtCursor(currentText, cursorPosition);

    if (mention && effectiveWorkspaceId) {
      // Get cursor position relative to editor container for autocomplete positioning
      const bounds = quill.getBounds(selection.index);
      const editorRect = containerRef.current?.getBoundingClientRect();

      if (editorRect) {
        setMentionState({
          isVisible: true,
          searchTerm: mention.username,
          position: {
            x: bounds.left,
            y: bounds.bottom + 5,
          },
          mentionStart: mention.start,
        });
      }
    } else {
      setMentionState(null);
    }
  }, [effectiveWorkspaceId]);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const editorContainer = container.appendChild(
      container.ownerDocument.createElement('div'),
    );

    const options: QuillOptions = {
      theme: 'snow',
      placeholder: placeholderRef.current,
      modules: {
        toolbar: [
          ['bold', 'italic', 'strike'],
          ['link'],
          [
            {
              list: 'ordered',
            },
            {
              list: 'bullet',
            },
          ],
        ],
        keyboard: {
          bindings: {
            enter: {
              key: 'Enter',
              handler: () => {
                const text = quill.getText();
                const addedImage = imageElementRef.current?.files?.[0] || null;

                const isEmpty =
                  !addedImage &&
                  text.replace(/<(.\|\n)*?>/g, '').trim().length === 0;

                if (isEmpty) {
                  return;
                }

                const body = JSON.stringify(quill.getContents());

                submitRef.current?.({ body, image: addedImage });

                return;
              },
            },
            shift_enter: {
              key: 'Enter',
              shiftKey: true,
              handler: () => {
                quill.insertText(quill.getSelection()?.index || 0, '\n');
              },
            },
          },
        },
      },
    };

    const quill = new Quill(editorContainer, options);
    quillRef.current = quill;
    quillRef.current.focus();

    if (innerRef) {
      innerRef.current = quill;
    }

    quill.setContents(defaultValueRef.current);
    setText(quill.getText());

    quill.on(Quill.events.TEXT_CHANGE, () => {
      setText(quill.getText());
    });

    quill.on(Quill.events.SELECTION_CHANGE, () => {
      checkForMention(quill);
    });

    return () => {
      quill.off(Quill.events.TEXT_CHANGE);
      quill.off(Quill.events.SELECTION_CHANGE);

      if (container) {
        container.innerHTML = '';
      }

      if (quillRef.current) {
        quillRef.current = null;
      }

      if (innerRef) {
        innerRef.current = null;
      }
    };
  }, [innerRef, checkForMention]);

  const toggleToolbar = () => {
    setIsToolbarVisible((prev) => !prev);
    const toolbarElement = containerRef?.current?.querySelector('.ql-toolbar');

    if (toolbarElement) {
      toolbarElement.classList.toggle('hidden');
    }
  };

  const onEmojiSelect = (emojiValue: any) => {
    const quill = quillRef.current;
    quill?.insertText(quill.getSelection()?.index || 0, emojiValue);
  };

  const isEmpty =
    !image && text.replace(/<(.\|\n)*?>/g, '').trim().length === 0;

  return (
    <div className="flex flex-col relative">
      <input
        type={'file'}
        ref={imageElementRef}
        accept={'image/*'}
        onChange={(e) => setImage(e.target.files![0])}
        className={'hidden'}
      />
      <div
        className={cn(
          'flex flex-col border border-slate-200 rounded-md overflow-hidden focus-within:border-slate-300 focus-within:shadow-sm transition bg-white',
          disabled && 'opacity-50',
        )}
      >
        <div ref={containerRef} className="h-full ql-custom" />
        {!!image && (
          <div className={'p-2'}>
            <div
              className={
                'relative size-[62px] flex items-center justify-center group/image'
              }
            >
              <Hint label={'Remove image'}>
                <button
                  onClick={() => {
                    setImage(null);
                    imageElementRef.current!.value = '';
                  }}
                  className={
                    'hidden group-hover/image:flex rounded-full bg-black/70 hover:bg-black absolute -top-2.5 -right-2.5 text-white size-6 z-[4] border-2 border-white items-center justify-center'
                  }
                >
                  <XIcon className={'size-3.5'} />
                </button>
              </Hint>
              <Image
                src={URL.createObjectURL(image)}
                alt={'Uploaded'}
                fill
                className={'rounded-xl overflow-hidden border object-cover'}
              />
            </div>
          </div>
        )}
        <div className="flex px-2 pb-2 z-[5]">
          <Hint
            label={isToolbarVisible ? 'Hide formatiing' : 'Show formatting'}
          >
            <Button
              disabled={disabled}
              size={'iconSm'}
              variant={'ghost'}
              onClick={toggleToolbar}
            >
              <PiTextAa className="size-4" />
            </Button>
          </Hint>
          <EmojiPopover onEmojiSelect={onEmojiSelect}>
            <Button disabled={disabled} size={'iconSm'} variant={'ghost'}>
              <Smile className="size-4" />
            </Button>
          </EmojiPopover>

          {variant === 'create' && (
            <Hint label="Image">
              <Button
                disabled={disabled}
                size={'iconSm'}
                variant={'ghost'}
                onClick={() => imageElementRef.current?.click()}
              >
                <ImageIcon className="size-4" />
              </Button>
            </Hint>
          )}
          {variant === 'update' && (
            <div className="ml-auto flex items-center gap-x-2">
              <Button
                variant={'outline'}
                size={'sm'}
                onClick={onCancel}
                disabled={disabled}
              >
                Cancel
              </Button>
              <Button
                variant={'outline'}
                size={'sm'}
                onClick={() => {
                  onSubmit({
                    body: JSON.stringify(quillRef.current?.getContents()),
                    image,
                  });
                }}
                disabled={disabled}
                className=" bg-[#007a5a] hover:bg-[#007a5a]/80 text-white"
              >
                Save
              </Button>
            </div>
          )}
          {variant === 'create' && (
            <Button
              disabled={disabled || isEmpty}
              onClick={() => {
                onSubmit({
                  body: JSON.stringify(quillRef.current?.getContents()),
                  image,
                });
              }}
              className={cn(
                'ml-auto',
                isEmpty
                  ? 'bg-white hover:bg-white text-muted-foreground'
                  : 'bg-[#007a5a] hover:bg-[#007a5a]/80 text-white',
              )}
              size={'iconSm'}
            >
              <MdSend className="size-4" />
            </Button>
          )}
        </div>
      </div>
      {variant === 'create' && (
        <div
          className={cn(
            'p-2 text-[10px] text-muted-foreground flex justify-end opacity-0 transition',
            !isEmpty && 'opacity-100',
          )}
        >
          <p>
            <strong>Shift + Return</strong> to add a new line
          </p>
        </div>
      )}

      {/* Mention Autocomplete */}
      {mentionState?.isVisible && effectiveWorkspaceId && (
        <MentionAutocomplete
          workspaceId={effectiveWorkspaceId}
          searchTerm={mentionState.searchTerm}
          position={mentionState.position}
          onSelect={handleMentionSelect}
          onClose={handleMentionClose}
        />
      )}
    </div>
  );
};

export default Editor;
