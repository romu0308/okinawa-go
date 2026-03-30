import { useState, useEffect, useRef, useCallback } from 'react';

interface MediaFile {
  name: string;
  path: string;
  url: string;
}

export default function MediaManager() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/media-list');
      if (res.ok) {
        const data = await res.json();
        setFiles(Array.isArray(data) ? data : []);
      } else {
        setFiles([]);
      }
    } catch {
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const handleUpload = useCallback(async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);

    const newFiles: MediaFile[] = [];
    for (const file of Array.from(fileList)) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.success) {
          newFiles.push({ name: data.fileName, path: data.path, url: data.path });
        }
      } catch {
        console.error('Upload failed for:', file.name);
      }
    }

    setFiles((prev) => [...newFiles, ...prev]);
    setUploading(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    handleUpload(e.dataTransfer.files);
  }, [handleUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  }, []);

  const copyPath = (filePath: string) => {
    navigator.clipboard.writeText(filePath).then(() => {
      setCopiedPath(filePath);
      setTimeout(() => setCopiedPath(null), 2000);
    });
  };

  const handleDelete = async (filePath: string) => {
    try {
      const res = await fetch('/api/admin/media-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: filePath }),
      });
      if (res.ok) {
        setFiles((prev) => prev.filter((f) => f.path !== filePath));
      }
    } catch {
      alert('削除に失敗しました');
    }
    setDeleteConfirm(null);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-lg font-bold text-gray-900">メディア管理</h1>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {uploading ? 'アップロード中...' : '+ アップロード'}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={(e) => handleUpload(e.target.files)} className="hidden" />
      </div>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={'border-2 border-dashed rounded-xl p-8 mb-6 text-center transition-colors ' + (dragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-white hover:border-gray-400')}
      >
        <div className="text-gray-400">
          <p className="text-sm mb-1">画像をドラッグ&ドロップ</p>
          <p className="text-xs">または上のボタンからファイルを選択</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><p className="text-gray-500">読み込み中...</p></div>
      ) : files.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-sm">メディアファイルがありません</p>
          <p className="text-gray-400 text-xs mt-1">画像をアップロードしてください</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {files.map((file) => (
            <div key={file.path} className="bg-white rounded-lg border border-gray-200 overflow-hidden group">
              <div className="aspect-square bg-gray-100 relative">
                <img src={file.url} alt={file.name} className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    <button onClick={() => copyPath(file.path)} className="px-2 py-1 text-xs bg-white rounded shadow hover:bg-gray-100">
                      {copiedPath === file.path ? 'Copied!' : 'URL'}
                    </button>
                    {deleteConfirm === file.path ? (
                      <button onClick={() => handleDelete(file.path)} className="px-2 py-1 text-xs bg-red-600 text-white rounded shadow hover:bg-red-700">確定</button>
                    ) : (
                      <button onClick={() => setDeleteConfirm(file.path)} className="px-2 py-1 text-xs bg-red-500 text-white rounded shadow hover:bg-red-600">削除</button>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-2">
                <p className="text-xs text-gray-600 truncate" title={file.name}>{file.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
