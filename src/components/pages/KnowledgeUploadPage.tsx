import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "../../context/AppContext";
import { useDocuments } from "../../hooks/useDocuments";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Tabs } from "../ui/Tabs";
import { FileDropzone } from "../ui/FileDropzone";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import {
  UploadIcon,
  LinkIcon,
  TypeIcon,
  FileTextIcon,
  XIcon,
} from "../ui/Icons";
import { formatBytes } from "../../utils/format";
import type { ToastType } from "../../types";

export function KnowledgeUploadPage() {
  const { t } = useTranslation();
  const { addToast, setActiveView } = useApp();
  const { uploadFile, uploadUrl, uploadText } = useDocuments();
  const [activeTab, setActiveTab] = useState("file");

  const tabs = [
    { id: "file", label: t('knowledgeUpload.fileUpload') },
    { id: "url", label: t('knowledgeUpload.url') },
    { id: "text", label: t('knowledgeUpload.text') },
  ];

  return (
    <div>
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-2xl sm:text-3xl font-bold gradient-text tracking-tight">
          {t('knowledgeUpload.title')}
        </h1>
        <p className="text-sm text-text-muted mt-2">
          {t('knowledgeUpload.subtitle')}
        </p>
      </div>

      <Card className="max-w-2xl gradient-border animate-fade-in-up stagger-1">
        <CardHeader>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-[var(--radius-md)] bg-accent-dim flex items-center justify-center">
              <UploadIcon size={14} className="text-accent" />
            </div>
            <CardTitle>{t('knowledgeUpload.newSource')}</CardTitle>
          </div>
          <Tabs tabs={tabs} activeId={activeTab} onChange={setActiveTab} />
        </CardHeader>
        <CardContent>
          {activeTab === "file" && (
            <FileUploadTab
              uploadFile={uploadFile}
              addToast={addToast}
              setActiveView={setActiveView}
            />
          )}
          {activeTab === "url" && (
            <UrlUploadTab
              uploadUrl={uploadUrl}
              addToast={addToast}
              setActiveView={setActiveView}
            />
          )}
          {activeTab === "text" && (
            <TextUploadTab
              uploadText={uploadText}
              addToast={addToast}
              setActiveView={setActiveView}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function FileUploadTab({
  uploadFile,
  addToast,
  setActiveView,
}: {
  uploadFile: (file: File) => Promise<{ status: string; error?: string }>;
  addToast: (msg: string, type: ToastType) => void;
  setActiveView: (view: "knowledge-list") => void;
}) {
  const { t } = useTranslation();
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFiles = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (files.length === 0) return;
    setUploading(true);
    let successCount = 0;
    try {
      for (const file of files) {
        const result = await uploadFile(file);
        if (result.status === "indexed") {
          successCount++;
        } else {
          addToast(
            t('knowledgeUpload.fileProcessFailed', { filename: file.name, error: result.error ?? "unknown error" }),
            "error"
          );
        }
      }
      if (successCount > 0) {
        addToast(
          t('knowledgeUpload.filesUploaded', { count: successCount }),
          "success"
        );
      }
      setFiles([]);
      setActiveView("knowledge-list");
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : t('knowledgeUpload.uploadFailed'),
        "error"
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <FileDropzone
        onFiles={handleFiles}
        accept=".pdf,.md,.mdx,.html,.htm,.txt"
        maxSizeMB={50}
      />
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, i) => (
            <div
              key={`${file.name}-${i}`}
              className="flex items-center gap-3 px-3 py-2 bg-surface-hi rounded-[var(--radius-md)] animate-fade-in"
            >
              <FileTextIcon size={16} className="text-text-muted shrink-0" />
              <span className="text-sm text-text truncate flex-1">
                {file.name}
              </span>
              <span className="text-xs text-text-dim shrink-0">
                {formatBytes(file.size)}
              </span>
              <button
                onClick={() => removeFile(i)}
                className="text-text-dim hover:text-text-muted transition-colors cursor-pointer shrink-0"
              >
                <XIcon size={14} />
              </button>
            </div>
          ))}
          <div className="flex items-center justify-between pt-2">
            <Badge>{t('knowledgeUpload.filesSelected', { count: files.length })}</Badge>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              loading={uploading}
            >
              {t('knowledgeUpload.uploadAll')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function UrlUploadTab({
  uploadUrl,
  addToast,
  setActiveView,
}: {
  uploadUrl: (url: string, title?: string) => Promise<{ status: string; error?: string }>;
  addToast: (msg: string, type: ToastType) => void;
  setActiveView: (view: "knowledge-list") => void;
}) {
  const { t } = useTranslation();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setUploading(true);
    try {
      const result = await uploadUrl(url, title || undefined);
      if (result.status === "indexed") {
        addToast(t('knowledgeUpload.urlIngested'), "success");
      } else {
        addToast(t('knowledgeUpload.ingestionFailed', { error: result.error ?? "unknown error" }), "error");
      }
      setUrl("");
      setTitle("");
      setActiveView("knowledge-list");
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : t('knowledgeUpload.urlIngestFailed'),
        "error"
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label={t('knowledgeUpload.urlLabel')}
        type="url"
        placeholder={t('knowledgeUpload.urlPlaceholder')}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        icon={<LinkIcon size={16} />}
      />
      <Input
        label={t('knowledgeUpload.titleOptional')}
        type="text"
        placeholder={t('knowledgeUpload.titlePlaceholder')}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          variant="primary"
          size="sm"
          loading={uploading}
          disabled={!url}
        >
          {t('knowledgeUpload.ingestUrl')}
        </Button>
      </div>
    </form>
  );
}

function TextUploadTab({
  uploadText,
  addToast,
  setActiveView,
}: {
  uploadText: (content: string, name: string) => Promise<{ status: string; error?: string }>;
  addToast: (msg: string, type: ToastType) => void;
  setActiveView: (view: "knowledge-list") => void;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !content) return;
    setUploading(true);
    try {
      const result = await uploadText(content, name);
      if (result.status === "indexed") {
        addToast(t('knowledgeUpload.textUploaded'), "success");
      } else {
        addToast(t('knowledgeUpload.ingestionFailed', { error: result.error ?? "unknown error" }), "error");
      }
      setName("");
      setContent("");
      setActiveView("knowledge-list");
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : t('knowledgeUpload.textUploadFailed'),
        "error"
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label={t('knowledgeUpload.nameLabel')}
        type="text"
        placeholder={t('knowledgeUpload.namePlaceholder')}
        value={name}
        onChange={(e) => setName(e.target.value)}
        icon={<TypeIcon size={16} />}
      />
      <Textarea
        label={t('knowledgeUpload.contentLabel')}
        placeholder={t('knowledgeUpload.contentPlaceholder')}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        charCount
      />
      <p className="text-xs text-text-dim">
        {t('knowledgeUpload.textNote')}
      </p>
      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          variant="primary"
          size="sm"
          loading={uploading}
          disabled={!name || !content}
        >
          {t('knowledgeUpload.uploadText')}
        </Button>
      </div>
    </form>
  );
}
