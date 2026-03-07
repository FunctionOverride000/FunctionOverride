'use client';

import { useEditor, EditorContent, ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { Node, mergeAttributes } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight } from 'lowlight';
import js from 'highlight.js/lib/languages/javascript';
import css from 'highlight.js/lib/languages/css';
import xml from 'highlight.js/lib/languages/xml';
import bash from 'highlight.js/lib/languages/bash';
import { useCallback, useRef, useState, useEffect } from 'react';
import {
  Bold, Italic, UnderlineIcon, Strikethrough, Code, Code2,
  Heading1, Heading2, Heading3, List, ListOrdered, Quote,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Image as ImageIcon, Link as LinkIcon, Minus, Undo, Redo,
  Highlighter, FileCode, Loader2, MoveLeft, MoveRight,
  AlignHorizontalDistributeCenter, Maximize2, Trash2
} from 'lucide-react';

const CLOUDINARY_CLOUD_NAME    = 'dnenghh9o';
const CLOUDINARY_UPLOAD_PRESET = 'fosht_blog';

const lowlight = createLowlight();
lowlight.register('javascript', js);
lowlight.register('css', css);
lowlight.register('html', xml);
lowlight.register('bash', bash);

// ─────────────────────────────────────────────
// IMAGE NODE VIEW — klik untuk tampilkan kontrol
// ─────────────────────────────────────────────
function ImageNodeView({ node, updateAttributes, deleteNode, selected }) {
  const { src, alt, width, align } = node.attrs;
  const imgRef  = useRef();
  const startX  = useRef(0);
  const startW  = useRef(0);
  const [show, setShow] = useState(false);

  useEffect(() => { setShow(selected); }, [selected]);

  // Drag resize handle kanan bawah
  const onResizeStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    startX.current = e.clientX;
    startW.current = imgRef.current?.offsetWidth || 400;
    const onMove = (ev) => {
      const newW = Math.max(60, Math.min(900, startW.current + ev.clientX - startX.current));
      updateAttributes({ width: `${Math.round(newW)}px` });
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const wrapStyle = {
    position: 'relative',
    display: align === 'center' ? 'flex' : 'inline-block',
    justifyContent: align === 'center' ? 'center' : undefined,
    float: align === 'left' ? 'left' : align === 'right' ? 'right' : 'none',
    margin: align === 'left'   ? '0.5em 1.5em 0.5em 0'
           : align === 'right' ? '0.5em 0 0.5em 1.5em'
           : '1em 0',
    maxWidth: '100%',
    lineHeight: 0,
  };

  return (
    <NodeViewWrapper style={{ display: align === 'left' || align === 'right' ? 'inline' : 'block' }} contentEditable={false}>
      <div style={wrapStyle} onClick={() => setShow(true)}>

        {/* Gambar */}
        <img
          ref={imgRef}
          src={src}
          alt={alt || ''}
          style={{
            width: width || '100%',
            maxWidth: '100%',
            display: 'block',
            borderRadius: 4,
            border: show ? '2px solid #00f3ff' : '1px solid rgba(255,255,255,0.08)',
            userSelect: 'none',
          }}
          draggable={false}
        />

        {/* Resize handle */}
        {show && (
          <div
            onMouseDown={onResizeStart}
            style={{
              position: 'absolute', bottom: 4, right: 4,
              width: 12, height: 12,
              background: '#00f3ff', borderRadius: 2,
              cursor: 'se-resize', zIndex: 10,
            }}
          />
        )}

        {/* Floating control panel */}
        {show && (
          <div
            onMouseDown={e => e.preventDefault()}
            style={{
              position: 'absolute',
              top: -46,
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#0a0f1e',
              border: '1px solid rgba(0,243,255,0.3)',
              borderRadius: 5,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              padding: '4px 6px',
              zIndex: 50,
              boxShadow: '0 6px 24px rgba(0,0,0,0.7)',
              whiteSpace: 'nowrap',
            }}
          >
            {/* Posisi */}
            <IBtn onClick={() => updateAttributes({ align: 'left' })}   active={align==='left'}   title="Float Kiri"><MoveLeft className="w-3.5 h-3.5"/></IBtn>
            <IBtn onClick={() => updateAttributes({ align: 'center' })} active={align==='center'} title="Tengah"><AlignHorizontalDistributeCenter className="w-3.5 h-3.5"/></IBtn>
            <IBtn onClick={() => updateAttributes({ align: 'right' })}  active={align==='right'}  title="Float Kanan"><MoveRight className="w-3.5 h-3.5"/></IBtn>
            <IBtn onClick={() => updateAttributes({ align: 'none' })}   active={align==='none'}   title="Full Block"><Maximize2 className="w-3.5 h-3.5"/></IBtn>

            <Sep />

            {/* Ukuran preset */}
            {[['25%','XS'],['50%','S'],['75%','M'],['100%','L']].map(([w,l]) => (
              <IBtn key={w} onClick={() => updateAttributes({ width: w })} active={width===w} title={`Lebar ${w}`}>
                <span style={{ fontSize: 9, fontWeight: 900 }}>{l}</span>
              </IBtn>
            ))}

            <Sep />

            {/* Hapus */}
            <IBtn onClick={deleteNode} danger title="Hapus Gambar"><Trash2 className="w-3.5 h-3.5"/></IBtn>
          </div>
        )}
      </div>

      {(align === 'left' || align === 'right') && (
        <div style={{ clear: 'both', display: 'table' }} />
      )}
    </NodeViewWrapper>
  );
}

const IBtn = ({ onClick, active, danger, title, children }) => (
  <button type="button" onClick={onClick} title={title}
    style={{
      padding: '3px 6px', borderRadius: 3, border: 'none', cursor: 'pointer',
      background: active ? '#00f3ff' : 'transparent',
      color: active ? '#000' : danger ? '#ff6b6b' : '#999',
      display: 'flex', alignItems: 'center', lineHeight: 1,
    }}>
    {children}
  </button>
);

const Sep = () => <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.1)', margin: '0 3px' }} />;

// ─────────────────────────────────────────────
// CUSTOM IMAGE TIPTAP EXTENSION
// ─────────────────────────────────────────────
const ResizableImage = Node.create({
  name: 'resizableImage',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src:   { default: null },
      alt:   { default: '' },
      width: { default: '100%' },
      align: { default: 'none' },
    };
  },

  parseHTML() {
    return [{ tag: 'img[src]' }];
  },

  renderHTML({ HTMLAttributes: { src, alt, width, align } }) {
    const style =
      align === 'left'   ? `float:left;margin:0.5em 1.5em 0.5em 0;width:${width};max-width:100%;border-radius:4px;border:1px solid rgba(255,255,255,0.08)` :
      align === 'right'  ? `float:right;margin:0.5em 0 0.5em 1.5em;width:${width};max-width:100%;border-radius:4px;border:1px solid rgba(255,255,255,0.08)` :
      align === 'center' ? `display:block;margin:1em auto;width:${width};max-width:100%;border-radius:4px;border:1px solid rgba(255,255,255,0.08)` :
                           `display:block;width:${width};max-width:100%;border-radius:4px;margin:1em 0;border:1px solid rgba(255,255,255,0.08)`;
    return ['img', mergeAttributes({ src, alt, style })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView);
  },
});

// ─────────────────────────────────────────────
// TOOLBAR HELPERS
// ─────────────────────────────────────────────
const ToolBtn = ({ onClick, active, disabled, title, children }) => (
  <button type="button" onClick={onClick} disabled={disabled} title={title}
    className={`p-1.5 rounded transition-all ${active ? 'bg-cyan-500 text-black' : 'text-gray-400 hover:text-white hover:bg-gray-800'} disabled:opacity-30 disabled:cursor-not-allowed`}>
    {children}
  </button>
);
const Divider = () => <div className="w-px h-5 bg-gray-700 mx-0.5" />;

// ─────────────────────────────────────────────
// MAIN EDITOR COMPONENT
// ─────────────────────────────────────────────
export default function RichEditor({ content, onChange }) {
  const fileRef = useRef();
  const [mode, setMode]             = useState('visual');
  const [codeValue, setCodeValue]   = useState(content || '');
  const [uploading, setUploading]   = useState(false);
  const [uploadPct, setUploadPct]   = useState(0);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Underline,
      Highlight.configure({ multicolor: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      ResizableImage,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'rich-link' } }),
      Placeholder.configure({ placeholder: 'Mulai menulis...' }),
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setCodeValue(html);
      onChange(html);
    },
    editorProps: { attributes: { class: 'rich-editor-body focus:outline-none' } },
  });

  const switchToVisual = () => { editor?.commands.setContent(codeValue, false); setMode('visual'); };
  const switchToCode   = () => { setCodeValue(editor?.getHTML() || ''); setMode('code'); };
  const handleCodeChange = (val) => { setCodeValue(val); onChange(val); };

  const insertImage = (src) => {
    editor?.chain().focus().insertContent({
      type: 'resizableImage',
      attrs: { src, align: 'none', width: '100%' },
    }).run();
    setTimeout(() => {
      const html = editor?.getHTML() || '';
      setCodeValue(html);
      onChange(html);
    }, 50);
  };

  const addImageUrl = useCallback(() => {
    const url = window.prompt('Image URL (https://...):');
    if (url) insertImage(url);
  }, [editor]);

  const addImageFile = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    if (!file.type.startsWith('image/')) { alert('File harus berupa gambar.'); return; }
    if (file.size > 10 * 1024 * 1024) { alert('Maksimal 10MB.'); return; }

    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    fd.append('folder', 'fosht-blog');

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`);
    setUploading(true); setUploadPct(0);
    xhr.upload.onprogress = (ev) => { if (ev.lengthComputable) setUploadPct(Math.round(ev.loaded/ev.total*100)); };
    xhr.onload = () => {
      if (xhr.status === 200) {
        insertImage(JSON.parse(xhr.responseText).secure_url);
      } else {
        alert('Gagal upload. Cek Cloud Name dan Upload Preset.');
      }
      setUploading(false); setUploadPct(0);
    };
    xhr.onerror = () => { alert('Gagal upload. Cek koneksi.'); setUploading(false); };
    xhr.send(fd);
  }, [editor]);

  const setLink = useCallback(() => {
    const prev = editor?.getAttributes('link').href;
    const url = window.prompt('URL:', prev || 'https://');
    if (url === null) return;
    if (!url) { editor?.chain().focus().extendMarkRange('link').unsetLink().run(); return; }
    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="border border-gray-800 rounded-sm overflow-hidden">

      {/* TOOLBAR */}
      <div className="bg-[#0a0f1e] border-b border-gray-800 p-2 flex flex-wrap items-center gap-0.5">
        {/* Mode toggle */}
        <div className="flex items-center gap-0.5 bg-black/40 border border-gray-700 rounded-sm p-0.5 mr-2">
          <button type="button" onClick={switchToVisual}
            className={`text-[10px] px-2.5 py-1 rounded-sm font-bold tracking-widest transition-all ${mode==='visual'?'bg-cyan-500 text-black':'text-gray-500 hover:text-white'}`}>
            VISUAL
          </button>
          <button type="button" onClick={switchToCode}
            className={`text-[10px] px-2.5 py-1 rounded-sm font-bold tracking-widest transition-all flex items-center gap-1 ${mode==='code'?'bg-cyan-500 text-black':'text-gray-500 hover:text-white'}`}>
            <FileCode className="w-3 h-3" /> HTML
          </button>
        </div>

        {mode === 'visual' && (<>
          <ToolBtn onClick={()=>editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo"><Undo className="w-4 h-4"/></ToolBtn>
          <ToolBtn onClick={()=>editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo"><Redo className="w-4 h-4"/></ToolBtn>
          <Divider/>
          <ToolBtn onClick={()=>editor.chain().focus().toggleHeading({level:1}).run()} active={editor.isActive('heading',{level:1})} title="H1"><Heading1 className="w-4 h-4"/></ToolBtn>
          <ToolBtn onClick={()=>editor.chain().focus().toggleHeading({level:2}).run()} active={editor.isActive('heading',{level:2})} title="H2"><Heading2 className="w-4 h-4"/></ToolBtn>
          <ToolBtn onClick={()=>editor.chain().focus().toggleHeading({level:3}).run()} active={editor.isActive('heading',{level:3})} title="H3"><Heading3 className="w-4 h-4"/></ToolBtn>
          <Divider/>
          <ToolBtn onClick={()=>editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold"><Bold className="w-4 h-4"/></ToolBtn>
          <ToolBtn onClick={()=>editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic"><Italic className="w-4 h-4"/></ToolBtn>
          <ToolBtn onClick={()=>editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline"><UnderlineIcon className="w-4 h-4"/></ToolBtn>
          <ToolBtn onClick={()=>editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough"><Strikethrough className="w-4 h-4"/></ToolBtn>
          <ToolBtn onClick={()=>editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')} title="Highlight"><Highlighter className="w-4 h-4"/></ToolBtn>
          <Divider/>
          <ToolBtn onClick={()=>editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({textAlign:'left'})} title="Kiri"><AlignLeft className="w-4 h-4"/></ToolBtn>
          <ToolBtn onClick={()=>editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({textAlign:'center'})} title="Tengah"><AlignCenter className="w-4 h-4"/></ToolBtn>
          <ToolBtn onClick={()=>editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({textAlign:'right'})} title="Kanan"><AlignRight className="w-4 h-4"/></ToolBtn>
          <ToolBtn onClick={()=>editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({textAlign:'justify'})} title="Justify"><AlignJustify className="w-4 h-4"/></ToolBtn>
          <Divider/>
          <ToolBtn onClick={()=>editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet"><List className="w-4 h-4"/></ToolBtn>
          <ToolBtn onClick={()=>editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered"><ListOrdered className="w-4 h-4"/></ToolBtn>
          <ToolBtn onClick={()=>editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Quote"><Quote className="w-4 h-4"/></ToolBtn>
          <Divider/>
          <ToolBtn onClick={()=>editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline Code"><Code className="w-4 h-4"/></ToolBtn>
          <ToolBtn onClick={()=>editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code Block"><Code2 className="w-4 h-4"/></ToolBtn>
          <Divider/>
          <ToolBtn onClick={setLink} active={editor.isActive('link')} title="Link"><LinkIcon className="w-4 h-4"/></ToolBtn>
          <ToolBtn onClick={addImageUrl} title="Insert Image URL"><ImageIcon className="w-4 h-4"/></ToolBtn>
          <ToolBtn onClick={()=>fileRef.current?.click()} disabled={uploading} title="Upload Gambar">
            {uploading
              ? <span className="text-[10px] font-bold text-cyan-400 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin"/>{uploadPct}%</span>
              : <span className="text-[10px] font-bold">IMG↑</span>
            }
          </ToolBtn>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={addImageFile}/>
          <Divider/>
          <ToolBtn onClick={()=>editor.chain().focus().setHorizontalRule().run()} title="Garis"><Minus className="w-4 h-4"/></ToolBtn>
        </>)}

        {mode === 'code' && (
          <span className="text-xs text-gray-600 ml-1">Edit HTML langsung — switch ke VISUAL untuk kontrol gambar visual</span>
        )}
      </div>

      {/* VISUAL */}
      {mode === 'visual' && (
        <div className="bg-[#050a15] min-h-[400px] p-6">
          <EditorContent editor={editor}/>
          <p className="text-[10px] text-gray-700 mt-4 border-t border-gray-900 pt-3">
            💡 <strong className="text-gray-600">Klik gambar</strong> untuk muncul toolbar — atur posisi (kiri · tengah · kanan · full), ukuran preset (XS · S · M · L), atau <strong className="text-gray-600">drag sudut kanan bawah</strong> untuk resize bebas
          </p>
        </div>
      )}

      {/* HTML */}
      {mode === 'code' && (
        <div className="relative">
          <textarea value={codeValue} onChange={e=>handleCodeChange(e.target.value)}
            className="w-full bg-[#020810] text-green-400 font-mono text-[13px] leading-relaxed p-6 focus:outline-none resize-none border-none"
            style={{minHeight:'400px'}} spellCheck={false}
            onKeyDown={(e)=>{
              if(e.key==='Tab'){
                e.preventDefault();
                const s=e.target.selectionStart;
                const v=e.target.value;
                handleCodeChange(v.substring(0,s)+'  '+v.substring(e.target.selectionEnd));
                setTimeout(()=>{e.target.selectionStart=e.target.selectionEnd=s+2;},0);
              }
            }}
          />
          <div className="absolute top-2 right-4 text-[10px] text-gray-700 tracking-widest">HTML MODE</div>
        </div>
      )}

      {/* STYLES */}
      <style dangerouslySetInnerHTML={{__html:`
        .rich-editor-body{color:#ccc;font-family:'Courier New',monospace;font-size:15px;line-height:1.9;min-height:380px;}
        .rich-editor-body p.is-editor-empty:first-child::before{content:attr(data-placeholder);float:left;color:#333;pointer-events:none;height:0;}
        .rich-editor-body h1{color:#fff;font-size:2em;font-weight:900;margin:1.2em 0 0.5em;}
        .rich-editor-body h2{color:#fff;font-size:1.5em;font-weight:800;margin:1.2em 0 0.5em;border-bottom:1px solid #1a1a2e;padding-bottom:0.4em;}
        .rich-editor-body h3{color:#00f3ff;font-size:1.2em;font-weight:700;margin:1em 0 0.4em;}
        .rich-editor-body p{margin:0 0 1em;}
        .rich-editor-body strong{color:#fff;}
        .rich-editor-body em{color:#ddd;font-style:italic;}
        .rich-editor-body u{text-decoration:underline;text-underline-offset:3px;}
        .rich-editor-body mark{background:#00f3ff33;color:#00f3ff;padding:1px 4px;border-radius:2px;}
        .rich-editor-body a.rich-link{color:#00f3ff;text-decoration:underline;text-underline-offset:3px;}
        .rich-editor-body code{background:#0d1117;border:1px solid #ffffff15;color:#00f3ff;padding:2px 6px;border-radius:3px;font-size:13px;}
        .rich-editor-body pre{background:#0a0f1e;border:1px solid #ffffff10;border-left:3px solid #00f3ff;padding:18px;border-radius:4px;overflow-x:auto;margin:1.2em 0;}
        .rich-editor-body pre code{background:none;border:none;padding:0;color:#e6e6e6;font-size:13px;}
        .rich-editor-body blockquote{border-left:3px solid #00f3ff44;padding-left:1em;color:#888;margin:1.2em 0;font-style:italic;}
        .rich-editor-body ul{list-style:disc;padding-left:1.5em;margin:0 0 1em;}
        .rich-editor-body ol{list-style:decimal;padding-left:1.5em;margin:0 0 1em;}
        .rich-editor-body li{margin-bottom:0.3em;}
        .rich-editor-body ul li::marker{color:#00f3ff;}
        .rich-editor-body hr{border:none;border-top:1px solid #1a1a2e;margin:1.5em 0;}
      `}}/>
    </div>
  );
}