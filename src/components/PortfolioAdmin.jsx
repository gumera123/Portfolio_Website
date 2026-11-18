import { createContext, useContext, useEffect, useId, useMemo, useRef, useState } from 'react';
import { CloudUpload, FileText, MoreHorizontal, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { validatePortfolioContent } from '../data/portfolioContent';
import { supabase } from '../lib/supabase';

const PortfolioAdminContext = createContext(null);
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const FILE_TYPES = [...IMAGE_TYPES, 'application/pdf'];
const ASSET_FIELDS = {
  logo: { label: 'Logo', kind: 'image' },
  profileImage: { label: 'Profile picture', kind: 'image' },
  resume: { label: 'Resume', kind: 'pdf' },
  cover: { label: 'Cover image', kind: 'image' },
  file: { label: 'Certificate file', kind: 'file' }
};
const ARRAY_TEMPLATES = {
  aboutCards: { icon: 'graduation', paragraphs: [''] },
  skills: { title: 'New skill group', icon: 'wrench', skills: [''] },
  projects: {
    title: 'New project',
    tag: 'Project type',
    description: '',
    tech: [''],
    accent: 'aqua',
    cover: '/project-covers/new-project.png',
    coverClass: '',
    repo: '',
    demo: ''
  },
  certificates: { title: 'New certificate', file: '/certificates/new-certificate.png' },
  experience: { icon: 'briefcase', title: 'New experience', items: [''] },
  goals: 'New goal',
  contact: { icon: 'external', label: 'New link', href: 'https://example.com' }
};

function cloneValue(value) {
  return JSON.parse(JSON.stringify(value));
}

function updatePath(value, path, nextValue) {
  if (!path) return nextValue;
  const result = cloneValue(value);
  const parts = path.split('.');
  let parent = result;
  for (const part of parts.slice(0, -1)) parent = parent[part];
  parent[parts[parts.length - 1]] = nextValue;
  return result;
}

function formatLabel(value) {
  return value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, (character) => character.toUpperCase());
}

async function uploadPortfolioAsset(assetFile) {
  const safeName = assetFile.name.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase();
  const storagePath = `assets/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
  const { error } = await supabase.storage
    .from('portfolio-assets')
    .upload(storagePath, assetFile, { upsert: false, contentType: assetFile.type });
  if (error) return { error };

  const { data } = supabase.storage.from('portfolio-assets').getPublicUrl(storagePath);
  return { url: `${data.publicUrl}?v=${Date.now()}` };
}

function getAssetTargets(value, path = '') {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => getAssetTargets(item, path ? `${path}.${index}` : String(index)));
  }
  if (!value || typeof value !== 'object') return [];

  return Object.entries(value).flatMap(([key, child]) => {
    const childPath = path ? `${path}.${key}` : key;
    const asset = ASSET_FIELDS[key];
    const owner = value.title || value.name || (path ? formatLabel(path.split('.').pop()) : '');
    const target = asset && typeof child === 'string'
      ? [{ path: childPath, label: `${owner ? `${owner} - ` : ''}${asset.label}`, kind: asset.kind }]
      : [];
    return [...target, ...getAssetTargets(child, childPath)];
  });
}

export function PortfolioAdminProvider({ children, isAdmin, content, onContentSaved }) {
  const [editor, setEditor] = useState(null);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const openEditor = (config) => {
    setError('');
    setNotice('');
    setDraft(cloneValue(config.value));
    setEditor(config);
  };

  const closeEditor = () => {
    if (saving) return;
    setEditor(null);
    setDraft(null);
    setError('');
  };

  const saveEditor = async (event, uploadedAssetUrl) => {
    event.preventDefault();
    const editedDraft = editor.mode === 'certificate-add' || (editor.mode === 'certificate-edit' && uploadedAssetUrl)
      ? { ...draft, file: uploadedAssetUrl }
      : (editor.mode === 'project-add' || editor.mode === 'project-edit') && uploadedAssetUrl
        ? { ...draft, cover: uploadedAssetUrl }
        : draft;
    const nextContent = editor.commit(editedDraft, content);
    const validationError = validatePortfolioContent(nextContent);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!supabase) {
      setError('Supabase is not configured. Changes cannot be saved.');
      return;
    }

    setSaving(true);
    setError('');
    const { error: saveError } = await supabase
      .from('portfolio_content')
      .upsert({ id: 1, content: nextContent, updated_at: new Date().toISOString() });
    setSaving(false);

    if (saveError) {
      setError(`Could not save changes: ${saveError.message}`);
      return;
    }

    onContentSaved(nextContent);
    setEditor(null);
    setDraft(null);
    setNotice('Portfolio changes saved.');
  };

  const contextValue = useMemo(() => ({
    isAdmin,
    openEditor
  }), [isAdmin]);

  return (
    <PortfolioAdminContext.Provider value={contextValue}>
      {children}
      {isAdmin && notice && <div className="admin-toast" role="status">{notice}</div>}
      {isAdmin && editor && (
        <AdminEditModal
          title={editor.title}
          mode={editor.mode}
          confirmationText={editor.confirmationText}
          draft={draft}
          setDraft={setDraft}
          saving={saving}
          error={error}
          onClose={closeEditor}
          onSave={saveEditor}
        />
      )}
    </PortfolioAdminContext.Provider>
  );
}

export function AdminEditButton({ editor, children = 'Edit section', showOnHome = false, icon: Icon = Pencil }) {
  const admin = useContext(PortfolioAdminContext);
  const { pathname } = useLocation();
  if (!admin?.isAdmin || !editor || (pathname === '/' && !showOnHome)) return null;

  return (
    <button className="admin-inline-button" type="button" onClick={() => admin.openEditor(editor)}>
      <Icon size={15} /> {children}
    </button>
  );
}

export function AdminCardMenu({ actions, label, showOnHome = false }) {
  const admin = useContext(PortfolioAdminContext);
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const menuRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const closeOnOutsideClick = (event) => {
      if (!menuRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  if (!admin?.isAdmin || (pathname === '/' && !showOnHome)) return null;
  return (
    <div className="admin-card-menu" ref={menuRef}>
      <button
        ref={triggerRef}
        className="admin-card-menu-trigger"
        type="button"
        aria-label={`${label} actions`}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        <MoreHorizontal size={20} aria-hidden="true" />
      </button>
      {open && (
        <div className="admin-card-menu-popover" id={menuId}>
          {actions.map(({ label: actionLabel, editor, icon: Icon, danger }) => (
            <button
              className={danger ? 'danger' : ''}
              type="button"
              key={actionLabel}
              onClick={() => {
                setOpen(false);
                admin.openEditor(editor);
              }}
            >
              <Icon size={16} aria-hidden="true" />
              {actionLabel}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminEditModal({ title, mode, confirmationText, draft, setDraft, saving, error, onClose, onSave }) {
  const [assetPath, setAssetPath] = useState('');
  const [assetFile, setAssetFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadNotice, setUploadNotice] = useState('');
  const [localPreviewUrl, setLocalPreviewUrl] = useState('');
  const fileInput = useRef(null);
  const assetTargets = useMemo(() => getAssetTargets(draft), [draft]);
  const isProfilePhotoEditor = mode === 'profile-photo';
  const isResumeEditor = mode === 'resume';
  const isDeleteConfirmation = mode === 'delete';
  const isAboutCardEditor = mode === 'about-card';
  const isCertificateAddEditor = mode === 'certificate-add';
  const isCertificateEditEditor = mode === 'certificate-edit';
  const isCertificateEditor = isCertificateAddEditor || isCertificateEditEditor;
  const isProjectAddEditor = mode === 'project-add';
  const isProjectEditEditor = mode === 'project-edit';
  const isProjectEditor = isProjectAddEditor || isProjectEditEditor;
  const selectedAssetPath = isProfilePhotoEditor
    ? 'profileImage'
    : isResumeEditor
      ? 'resume'
      : assetPath;

  useEffect(() => {
    if (!assetFile || !isProfilePhotoEditor) {
      setLocalPreviewUrl('');
      return undefined;
    }

    const previewUrl = URL.createObjectURL(assetFile);
    setLocalPreviewUrl(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [assetFile, isProfilePhotoEditor]);

  const handleUpload = async () => {
    const target = assetTargets.find((item) => item.path === selectedAssetPath);
    if (!target || !assetFile) {
      setUploadError('Choose an asset field and a file to upload.');
      return;
    }
    if (assetFile.size > MAX_FILE_SIZE) {
      setUploadError('Files must be 10 MB or smaller.');
      return;
    }
    const permittedTypes = target.kind === 'image'
      ? IMAGE_TYPES
      : target.kind === 'pdf'
        ? ['application/pdf']
        : FILE_TYPES;
    if (!permittedTypes.includes(assetFile.type)) {
      setUploadError(target.kind === 'image'
        ? 'This asset needs a JPG, PNG, or WebP image.'
        : target.kind === 'pdf'
          ? 'The resume needs to be a PDF file.'
          : 'Use a JPG, PNG, WebP image, or PDF file.');
      return;
    }
    if (!supabase) {
      setUploadError('Supabase is not configured. Files cannot be uploaded.');
      return;
    }

    setUploadError('');
    setUploadNotice('');
    setUploading(true);
    const uploadResult = await uploadPortfolioAsset(assetFile);
    setUploading(false);

    if (uploadResult.error) {
      setUploadError(`Upload failed: ${uploadResult.error.message}`);
      return;
    }

    setDraft((current) => updatePath(current, selectedAssetPath, uploadResult.url));
    setAssetFile(null);
    setUploadNotice(isProfilePhotoEditor
      ? 'Photo uploaded. Save changes to publish it.'
      : isResumeEditor
        ? 'Resume uploaded. Save changes to publish it.'
        : '');
    if (fileInput.current) fileInput.current.value = '';
  };

  const handleFileChange = (event) => {
    setAssetFile(event.target.files[0] || null);
    event.target.value = '';
    setUploadError('');
    setUploadNotice('');
  };

  const handleCertificateSave = async (event) => {
    event.preventDefault();
    if (!draft.title.trim()) {
      setUploadError('Enter a certificate title.');
      return;
    }
    if (!assetFile && isCertificateAddEditor) {
      setUploadError('Choose a certificate file.');
      return;
    }
    if (!assetFile) {
      await onSave(event);
      return;
    }
    if (assetFile.size > MAX_FILE_SIZE) {
      setUploadError('Files must be 10 MB or smaller.');
      return;
    }
    if (!FILE_TYPES.includes(assetFile.type)) {
      setUploadError('Use a JPG, PNG, WebP image, or PDF file.');
      return;
    }
    if (!supabase) {
      setUploadError('Supabase is not configured. Files cannot be uploaded.');
      return;
    }

    setUploadError('');
    setUploading(true);
    const uploadResult = await uploadPortfolioAsset(assetFile);
    setUploading(false);

    if (uploadResult.error) {
      setUploadError(`Upload failed: ${uploadResult.error.message}`);
      return;
    }

    await onSave(event, uploadResult.url);
  };

  const handleProjectSave = async (event) => {
    event.preventDefault();
    const techItems = draft.tech.split(',').map((item) => item.trim()).filter(Boolean);
    if (!draft.title.trim()) {
      setUploadError('Enter a project title.');
      return;
    }
    if (!draft.description.trim()) {
      setUploadError('Enter a project description.');
      return;
    }
    if (techItems.length === 0) {
      setUploadError('Enter at least one technology or tool.');
      return;
    }
    if (!/^https?:\/\/\S+$/i.test(draft.repo.trim())) {
      setUploadError('Enter a valid repository URL starting with http:// or https://.');
      return;
    }
    if (draft.demo.trim() && !/^https?:\/\/\S+$/i.test(draft.demo.trim())) {
      setUploadError('Enter a valid demo URL or leave it blank.');
      return;
    }
    if (!assetFile && isProjectAddEditor) {
      setUploadError('Choose a project cover image.');
      return;
    }
    if (!assetFile) {
      await onSave(event);
      return;
    }
    if (assetFile.size > MAX_FILE_SIZE) {
      setUploadError('Files must be 10 MB or smaller.');
      return;
    }
    if (!IMAGE_TYPES.includes(assetFile.type)) {
      setUploadError('Use a JPG, PNG, or WebP project image.');
      return;
    }
    if (!supabase) {
      setUploadError('Supabase is not configured. Files cannot be uploaded.');
      return;
    }

    setUploadError('');
    setUploading(true);
    const uploadResult = await uploadPortfolioAsset(assetFile);
    setUploading(false);

    if (uploadResult.error) {
      setUploadError(`Upload failed: ${uploadResult.error.message}`);
      return;
    }

    await onSave(event, uploadResult.url);
  };

  return (
    <div className="admin-modal-backdrop">
      <section className="admin-edit-modal" role="dialog" aria-modal="true" aria-labelledby="admin-edit-title">
        <header className="admin-edit-header">
          <div>
            <p className="admin-kicker">ADMIN EDITOR</p>
            <h2 id="admin-edit-title">{title}</h2>
          </div>
          <button className="admin-modal-close" type="button" aria-label="Close editor" disabled={saving || uploading} onClick={onClose}>
            <X size={21} />
          </button>
        </header>

        <div className="admin-edit-body">
          {isDeleteConfirmation ? (
            <p className="admin-delete-confirmation">
              {confirmationText || 'This will permanently delete this skill card and all of its skills.'}
            </p>
          ) : isCertificateEditor ? (
            <section className="certificate-editor">
              <label className="admin-field">
                Certificate title
                <input
                  autoFocus
                  required
                  value={draft.title}
                  onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                />
              </label>
              <label className="profile-photo-picker">
                <CloudUpload size={19} />
                <span>{assetFile
                  ? 'Choose a different file'
                  : isCertificateEditEditor
                    ? 'Change certificate file'
                    : 'Choose certificate file'}</span>
                <input
                  ref={fileInput}
                  className="profile-photo-file-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={handleFileChange}
                />
              </label>
              {assetFile && (
                <p className="profile-photo-filename" title={assetFile.name}>
                  Selected: <strong>{assetFile.name}</strong>
                </p>
              )}
              {uploadError && <p className="admin-alert" role="alert">{uploadError}</p>}
            </section>
          ) : isProjectEditor ? (
            <section className="project-editor">
              <label className="admin-field">
                Project title
                <input
                  autoFocus
                  required
                  value={draft.title}
                  onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                />
              </label>
              <label className="admin-field">
                Description
                <textarea
                  required
                  rows={4}
                  value={draft.description}
                  onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
                />
              </label>
              <label className="admin-field">
                Technologies / Tools (comma-separated)
                <input
                  required
                  placeholder="Expo, React Native, Firebase"
                  value={draft.tech}
                  onChange={(event) => setDraft((current) => ({ ...current, tech: event.target.value }))}
                />
              </label>
              <label className="profile-photo-picker">
                <CloudUpload size={19} />
                <span>{assetFile
                  ? 'Choose a different image'
                  : isProjectEditEditor
                    ? 'Change project image'
                    : 'Choose project image'}</span>
                <input
                  ref={fileInput}
                  className="profile-photo-file-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                />
              </label>
              {assetFile && (
                <p className="profile-photo-filename" title={assetFile.name}>
                  Selected: <strong>{assetFile.name}</strong>
                </p>
              )}
              <label className="admin-field">
                Repository URL
                <input
                  required
                  type="url"
                  placeholder="https://github.com/..."
                  value={draft.repo}
                  onChange={(event) => setDraft((current) => ({ ...current, repo: event.target.value }))}
                />
              </label>
              <label className="admin-field">
                Demo URL (optional)
                <input
                  type="url"
                  placeholder="https://..."
                  value={draft.demo}
                  onChange={(event) => setDraft((current) => ({ ...current, demo: event.target.value }))}
                />
              </label>
              {uploadError && <p className="admin-alert" role="alert">{uploadError}</p>}
            </section>
          ) : isAboutCardEditor ? (
            <AboutCardEditor draft={draft} setDraft={setDraft} />
          ) : isProfilePhotoEditor ? (
            <section className="profile-photo-editor">
              <div className="profile-photo-preview">
                {localPreviewUrl || draft.profileImage ? (
                  <img
                    src={localPreviewUrl || draft.profileImage}
                    alt={assetFile ? 'Preview of selected profile photo' : 'Current profile photo'}
                  />
                ) : (
                  <div className="profile-photo-empty">No photo selected</div>
                )}
                <span>{assetFile ? 'New photo preview' : 'Current photo'}</span>
              </div>
              <div className="profile-photo-settings">
                <div>
                  <h3>Choose a new profile photo</h3>
                  <p>Select a clear image to use in the portfolio hero. Your current photo stays in place until you save.</p>
                </div>
                <label className="profile-photo-picker">
                  <CloudUpload size={19} />
                  <span>{assetFile ? 'Choose a different photo' : 'Choose photo from device'}</span>
                  <input
                    ref={fileInput}
                    className="profile-photo-file-input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                  />
                </label>
                {assetFile && (
                  <p className="profile-photo-filename" title={assetFile.name}>
                    Selected: <strong>{assetFile.name}</strong>
                  </p>
                )}
                <p className="profile-photo-hint">JPG, PNG, or WebP · 10 MB maximum</p>
                {assetFile && (
                  <button className="admin-small-button" type="button" disabled={uploading} onClick={handleUpload}>
                    <CloudUpload size={15} /> {uploading ? 'Uploading photo…' : 'Upload photo'}
                  </button>
                )}
                {uploadError && <p className="admin-alert" role="alert">{uploadError}</p>}
                {uploadNotice && <p className="profile-photo-notice" role="status">{uploadNotice}</p>}
              </div>
            </section>
          ) : isResumeEditor ? (
            <section className="profile-photo-editor resume-editor">
              <div className="resume-current-file">
                <FileText size={34} aria-hidden="true" />
                <h3>Current resume</h3>
                <a href={draft.resume} target="_blank" rel="noreferrer">Open current resume</a>
              </div>
              <div className="profile-photo-settings">
                <div>
                  <h3>Upload an updated resume</h3>
                  <p>Choose your new PDF. It replaces the public resume link after you save.</p>
                </div>
                <label className="profile-photo-picker">
                  <CloudUpload size={19} />
                  <span>{assetFile ? 'Choose a different PDF' : 'Choose PDF from device'}</span>
                  <input
                    ref={fileInput}
                    className="profile-photo-file-input"
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                  />
                </label>
                {assetFile && (
                  <p className="profile-photo-filename" title={assetFile.name}>
                    Selected: <strong>{assetFile.name}</strong>
                  </p>
                )}
                <p className="profile-photo-hint">PDF only · 10 MB maximum</p>
                {assetFile && (
                  <button className="admin-small-button" type="button" disabled={uploading} onClick={handleUpload}>
                    <CloudUpload size={15} /> {uploading ? 'Uploading resume…' : 'Upload resume'}
                  </button>
                )}
                {uploadError && <p className="admin-alert" role="alert">{uploadError}</p>}
                {uploadNotice && <p className="profile-photo-notice" role="status">{uploadNotice}</p>}
              </div>
            </section>
          ) : (
            <>
              <PortfolioEditor value={draft} rootValue={draft} path="" onChange={setDraft} />
              {assetTargets.length > 0 && (
                <section className="admin-upload-panel">
                  <h3>Replace an image or file</h3>
                  <p>Upload changes the selected field; Save publishes the new content.</p>
                  <label>
                    Portfolio asset
                    <select value={assetPath} onChange={(event) => setAssetPath(event.target.value)}>
                      <option value="">Choose an image or file</option>
                      {assetTargets.map((target) => (
                        <option value={target.path} key={target.path}>{target.label}</option>
                      ))}
                    </select>
                  </label>
                  <input
                    ref={fileInput}
                    type="file"
                    accept={assetTargets.find((target) => target.path === selectedAssetPath)?.kind === 'pdf'
                      ? 'application/pdf'
                      : assetTargets.find((target) => target.path === selectedAssetPath)?.kind === 'image'
                        ? 'image/jpeg,image/png,image/webp'
                        : 'image/jpeg,image/png,image/webp,application/pdf'}
                    onChange={handleFileChange}
                  />
                  <button className="admin-small-button" type="button" disabled={uploading} onClick={handleUpload}>
                    <CloudUpload size={15} /> {uploading ? 'Uploading…' : 'Upload file'}
                  </button>
                  {uploadError && <p className="admin-alert" role="alert">{uploadError}</p>}
                </section>
              )}
            </>
          )}
        </div>

        <footer className="admin-edit-footer">
          {error && <p className="admin-alert" role="alert">{error}</p>}
          <button className="admin-button" type="button" disabled={saving || uploading} onClick={onClose}>Cancel</button>
          <button
            className={`admin-button ${isDeleteConfirmation ? 'danger' : 'primary'}`}
            type="button"
            disabled={saving || uploading || ((isProfilePhotoEditor || isResumeEditor) && !uploadNotice)}
            onClick={isCertificateEditor
              ? handleCertificateSave
              : isProjectEditor
                ? handleProjectSave
                : onSave}
          >
            {isDeleteConfirmation
              ? <Trash2 size={16} />
              : isCertificateAddEditor || isProjectAddEditor
                ? <Plus size={16} />
                : <Save size={16} />}
            {uploading
              ? 'Uploading…'
              : saving
                ? 'Saving…'
                : isDeleteConfirmation
                  ? 'Delete card'
                  : isCertificateAddEditor
                    ? 'Add Certificate'
                    : isProjectAddEditor
                      ? 'Add Project'
                      : 'Save changes'}
          </button>
        </footer>
      </section>
    </div>
  );
}

function AboutCardEditor({ draft, setDraft }) {
  const updateParagraph = (index, text) => {
    setDraft((current) => ({
      ...current,
      paragraphs: current.paragraphs.map((paragraph, paragraphIndex) => (
        paragraphIndex === index ? text : paragraph
      ))
    }));
  };

  const removeParagraph = (index) => {
    setDraft((current) => ({
      ...current,
      paragraphs: current.paragraphs.filter((_paragraph, paragraphIndex) => paragraphIndex !== index)
    }));
  };

  return (
    <section className="admin-about-card-editor">
      <h3>Card content</h3>
      {draft.paragraphs.map((paragraph, index) => (
        <div className="admin-about-paragraph" key={index}>
          <label className="admin-field">
            Paragraph {index + 1}
            <textarea
              rows={Math.min(8, Math.max(4, Math.ceil(paragraph.length / 90)))}
              value={paragraph}
              onChange={(event) => updateParagraph(index, event.target.value)}
            />
          </label>
          {draft.paragraphs.length > 1 && (
            <button
              className="admin-small-button danger"
              type="button"
              onClick={() => removeParagraph(index)}
            >
              Remove paragraph
            </button>
          )}
        </div>
      ))}
      <button
        className="admin-small-button"
        type="button"
        onClick={() => setDraft((current) => ({
          ...current,
          paragraphs: [...current.paragraphs, '']
        }))}
      >
        + Add paragraph
      </button>
    </section>
  );
}

function PortfolioEditor({ value, rootValue, path, onChange }) {
  if (typeof value === 'string') {
    const label = formatLabel(path.split('.').pop());
    const longText = value.length > 100 || /summary|description|copy|paragraph/i.test(label);
    return (
      <label className="admin-field">
        {label}
        {longText ? (
          <textarea
            rows={Math.min(8, Math.max(3, Math.ceil(value.length / 90)))}
            value={value}
            onChange={(event) => onChange(updatePath(rootValue, path, event.target.value))}
          />
        ) : (
          <input
            value={value}
            onChange={(event) => onChange(updatePath(rootValue, path, event.target.value))}
          />
        )}
      </label>
    );
  }

  if (Array.isArray(value)) {
    const isSkillGroupList = path === 'skills' && Boolean(rootValue.section);
    const isSkillEntriesList = path === 'skills' && !rootValue.section;
    const label = isSkillGroupList
      ? 'Skill groups'
      : isSkillEntriesList
        ? 'Skills'
        : formatLabel(path.split('.').pop());
    const template = path.includes('.') || isSkillEntriesList ? undefined : ARRAY_TEMPLATES[path];
    return (
      <section className="admin-array">
        <div className="admin-array-heading">
          <h3>{label}</h3>
          <button
            className="admin-small-button"
            type="button"
            onClick={() => onChange(updatePath(rootValue, path, [...value, template ? cloneValue(template) : '']))}
          >
            + Add {isSkillGroupList ? 'skill card' : isSkillEntriesList ? 'skill' : label.replace(/s$/, '')}
          </button>
        </div>
        {value.map((item, index) => {
          const itemPath = `${path}.${index}`;
          const itemTitle = item && typeof item === 'object'
            ? item.title || item.label || `Item ${index + 1}`
            : `${label.replace(/s$/, '')} ${index + 1}`;
          return (
            <details className="admin-array-item" key={itemPath}>
              <summary>{itemTitle}</summary>
              <div className="admin-array-item-fields">
                <PortfolioEditor value={item} rootValue={rootValue} path={itemPath} onChange={onChange} />
                <button
                  className="admin-small-button danger"
                  type="button"
                  onClick={() => onChange(updatePath(rootValue, path, value.filter((_entry, entryIndex) => entryIndex !== index)))}
                >
                  Remove item
                </button>
              </div>
            </details>
          );
        })}
      </section>
    );
  }

  if (value && typeof value === 'object') {
    const open = !path || !path.includes('.');
    return (
      <details className="admin-object" open={open}>
        <summary>{path ? formatLabel(path.split('.').pop()) : 'Section fields'}</summary>
        <div className="admin-object-fields">
          {Object.entries(value).map(([key, child]) => {
            const childPath = path ? `${path}.${key}` : key;
            return (
              <PortfolioEditor
                key={childPath}
                value={child}
                rootValue={rootValue}
                path={childPath}
                onChange={onChange}
              />
            );
          })}
        </div>
      </details>
    );
  }

  return null;
}
