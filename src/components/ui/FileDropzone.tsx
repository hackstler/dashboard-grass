import { useState, useRef, useCallback } from "react";
import type { DragEvent } from "react";
import { useTranslation } from "react-i18next";
import { UploadIcon } from "./Icons";

interface FileDropzoneProps {
  onFiles: (files: File[]) => void;
  accept?: string;
  maxSizeMB?: number;
  multiple?: boolean;
}

export function FileDropzone({
  onFiles,
  accept,
  maxSizeMB = 10,
  multiple = true,
}: FileDropzoneProps) {
  const { t } = useTranslation();
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndEmit = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      setError(null);
      const maxBytes = maxSizeMB * 1024 * 1024;
      const valid: File[] = [];

      for (const file of Array.from(files)) {
        if (file.size > maxBytes) {
          setError(t('knowledgeUpload.exceedsLimit', { filename: file.name, size: maxSizeMB }));
          return;
        }
        valid.push(file);
      }
      onFiles(valid);
    },
    [onFiles, maxSizeMB]
  );

  const handleDrag = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  }, []);

  const handleDragOut = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragging(false);
      validateAndEmit(e.dataTransfer.files);
    },
    [validateAndEmit]
  );

  return (
    <div>
      <div
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-[var(--radius-lg)] p-8 flex flex-col items-center gap-3 cursor-pointer transition-all duration-300 ${
          dragging
            ? "border-accent bg-accent-dim scale-[1.01] shadow-[var(--shadow-glow-accent)]"
            : "border-border hover:border-border-hi hover:bg-surface-hover"
        }`}
      >
        <div className={`transition-transform duration-300 ${dragging ? "scale-110 -translate-y-1" : ""}`}>
          <UploadIcon size={32} className={`transition-colors duration-300 ${dragging ? "text-accent" : "text-text-dim"}`} />
        </div>
        <div className="text-center">
          <p className="text-sm text-text-muted">
            <span className="text-accent font-medium">{t('knowledgeUpload.clickToUpload')}</span>{" "}
            {t('knowledgeUpload.dragAndDrop')}
          </p>
          <p className="text-xs text-text-dim mt-1">
            {t('knowledgeUpload.maxSize', { size: maxSizeMB })}
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => validateAndEmit(e.target.files)}
          className="hidden"
        />
      </div>
      {error && <p className="text-xs text-red mt-2">{error}</p>}
    </div>
  );
}
