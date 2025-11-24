import { useState, useEffect, useRef, useCallback } from 'react';
import type { NotesNode as NotesNodeType } from '@/types/flow';
import { cn } from '@/lib/utils';
import { StickyNote } from 'lucide-react';

interface NotesNodeProps {
  data: NotesNodeType | Record<string, unknown>;
  selected?: boolean;
}

interface NotesNodeData extends NotesNodeType {
  onNodeUpdate?: (node: NotesNodeType) => void;
  onNodeSelect?: (nodeId: string | null) => void;
}

const PLACEHOLDER_TEXT = 'Click to edit...';
const MIN_TEXTAREA_ROWS = 1;
const DEBOUNCE_DELAY = 300; // ms

export function NotesNode({ data, selected }: NotesNodeProps) {
  const nodeData = data as NotesNodeData;
  const [isEditing, setIsEditing] = useState(false);
  const [localContent, setLocalContent] = useState(nodeData.content || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onNodeUpdateRef = useRef(nodeData.onNodeUpdate);
  const onNodeSelectRef = useRef(nodeData.onNodeSelect);
  const nodeDataRef = useRef(nodeData);

  // Keep refs in sync with latest values
  useEffect(() => {
    onNodeUpdateRef.current = nodeData.onNodeUpdate;
    onNodeSelectRef.current = nodeData.onNodeSelect;
    nodeDataRef.current = nodeData;
  }, [nodeData]);

  // Sync content from props only when not editing to prevent losing focus
  useEffect(() => {
    if (!isEditing) {
      setLocalContent(nodeData.content || '');
    }
  }, [nodeData.content, isEditing]);

  // Focus textarea when entering edit mode
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          const length = textareaRef.current.value.length;
          textareaRef.current.setSelectionRange(length, length);
        }
      });
    }
  }, [isEditing]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  const updateNodeContent = useCallback((content: string, immediate = false) => {
    setLocalContent(content);

    // Clear existing timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    const performUpdate = () => {
      onNodeUpdateRef.current?.({
        ...nodeDataRef.current,
        content
      });
    };

    if (immediate) {
      performUpdate();
    } else {
      // Debounce the update to prevent re-renders on every keystroke
      updateTimeoutRef.current = setTimeout(performUpdate, DEBOUNCE_DELAY);
    }
  }, []);

  const handleContentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      updateNodeContent(e.target.value);
    },
    [updateNodeContent]
  );

  const handleBlur = useCallback(() => {
    // Save immediately on blur to ensure final state is persisted
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    onNodeUpdateRef.current?.({
      ...nodeDataRef.current,
      content: localContent
    });

    // Delay blur check to allow focus to move within the node
    setTimeout(() => {
      if (document.activeElement !== textareaRef.current) {
        setIsEditing(false);
      }
    }, 0);
  }, [localContent]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
      e.stopPropagation();
      return;
    }

    // Stop propagation for all keys except Enter to prevent node dragging
    if (e.key !== 'Enter') {
      e.stopPropagation();
    }
  }, []);

  const handleStartEditing = useCallback(() => {
    if (!isEditing) {
      setIsEditing(true);
      // Select the node when clicking to edit
      onNodeSelectRef.current?.(nodeData.id);
    }
  }, [isEditing, nodeData.id]);

  // Prevent dragging when interacting with textarea or display div
  const handleTextareaMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent node dragging
      // Select the node when clicking on textarea
      onNodeSelectRef.current?.(nodeData.id);
    },
    [nodeData.id]
  );

  const handleDisplayDivMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent node dragging
  }, []);

  const textareaRows = Math.max(MIN_TEXTAREA_ROWS, localContent.split('\n').length);
  const hasContent = Boolean(localContent);

  return (
    <div
      className={cn(
        'min-w-[200px] rounded-lg bg-yellow-50 p-3 dark:bg-yellow-950/20',
        selected && 'ring'
      )}
    >
      <div className="flex items-start gap-2">
        <StickyNote className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-600 dark:text-yellow-500" />
        <div className="min-w-0 flex-1">
          <div className="mb-1 text-xs font-semibold text-yellow-900 dark:text-yellow-100">
            {nodeData.label}
          </div>
          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={localContent}
              onChange={handleContentChange}
              onBlur={handleBlur}
              onMouseDown={handleTextareaMouseDown}
              onClick={() => {
                // Ensure node is selected when clicking textarea
                onNodeSelectRef.current?.(nodeData.id);
              }}
              onKeyDown={handleKeyDown}
              className="m-0 w-full resize-none bg-yellow-50 p-0 text-xs text-yellow-900 focus:border-yellow-400 focus:outline-none dark:border-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-100"
              rows={textareaRows}
              autoFocus
            />
          ) : (
            <div
              className={cn(
                'cursor-text whitespace-pre-wrap break-words text-xs text-yellow-800 dark:text-yellow-200',
                !hasContent && 'italic text-yellow-600/50 dark:text-yellow-400/50'
              )}
              onClick={handleStartEditing}
              onMouseDown={handleDisplayDivMouseDown}
            >
              {localContent || PLACEHOLDER_TEXT}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
