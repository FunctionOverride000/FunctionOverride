'use client';

import { useEditor, EditorContent, Node, mergeAttributes } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
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
import { useCallback, useRef, useState } from 'react';
import {
  Bold, Italic, UnderlineIcon, Strikethrough, Code, Code2,
  Heading1, Heading2, Heading3, List, ListOrdered, Quote,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Image as ImageIcon, Link as LinkIcon, Minus, Undo, Redo,
  Highlighter, FileCode, Loader2,
  MoveLeft, MoveRight, AlignHorizontalDistributeCenter,
  Maximize2, Trash2
} from 'lucide-react';

const CLOUDINARY_CLOUD_NAME    = 'dnenghh9o';
const CLOUDINARY_UPLOAD_PRESET = 'fosht_blog';

const lowlight = createLowlight();
lowlight.register('javascript', js);
lowlight.register('css', css);
lowlight.register('html', xml);
lowlight.register('bash', bash);

// ─────────────────────────────────────────────────────────────
// CUSTOM IFRAME NODE — agar iframe tidak di-strip TipTap
// ─────────────────────────────────────────────────────────────
const IframeNode = Node.create({
  name: 'iframe',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src:             { default: null },
      width:           { default: '100%' },
      height:          { default: '450' },
      frameborder:     { default: '0' },
      allowtransparency: { default: 'true' },
      scrolling:       { default: 'no' },
      allow:           { default: null },
      style:           { default: null },
      'data-wrap-style': { default: null },
    };
  },

  parseHTML() {
    return [
      // Parse <iframe> langsung
      { tag: 'iframe' },
      // Parse <div> wrapper yang mengandung <iframe>
      {
        tag: 'div',
        getAttrs: (node) => {
          const iframe = node.querySelector('iframe');
          if (!iframe) return false;
          return {
            src: iframe.getAttribute('src'),
            width: iframe.getAttribute('width') || '100%',
            height: iframe.getAttribute('height') || '450',
            frameborder: iframe.getAttribute('frameborder') || '0',
            allowtransparency: iframe.getAttribute('allowtransparency') || 'true',
            scrolling: iframe.getAttribute('scrolling') || 'no',
            allow: iframe.getAttribute('allow'),
            'data-wrap-style': node.getAttribute('style'),
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const {
      'data-wrap-style': wrapStyle,
      src, width, height, frameborder,
      allowtransparency, scrolling, allow
    } = HTMLAttributes;

    const wrapAttrs = {
      style: wrapStyle || `margin:2em 0;border-radius:8px;overflow:hidden;border:1px solid rgba(0,243,255,0.15);height:${height}px;width:100%;background:#0d0d0d;`,
    };

    const iframeAttrs = mergeAttributes({
      src, width: '100%', height: '100%',
      frameborder, allowtransparency, scrolling,
      ...(allow ? { allow } : {}),
    });

    return ['div', wrapAttrs, ['iframe', iframeAttrs]];
  },
});

// ─────────────────────────────────────────────────────────────
// CUSTOM IMAGE EXTENSION — tambah width & align attrs
// ─────────────────────────────────────────────────────────────
const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: '100%',
        renderHTML: (attrs) => ({ style: `width:${attrs.width};max-width:100%;display:block` }),
      },
      align: {
        default: 'none',
        renderHTML: (attrs) => ({
          style: attrs.align === 'left'   ? 'float:left;margin:0.5em 1.5em 0.5em 0'
               : attrs.align === 'right'  ? 'float:right;margin:0.5em 0 0.5em 1.5em'
               : attrs.align === 'center' ? 'margin-left:auto;margin-right:auto'
               :                            'margin:1em 0',
        }),
      },
    };
  },
});

// ─────────────────────────────────────────────────────────────
// TOOLBAR COMPONENTS
// ─────────────────────────────────────────────────────────────
const ToolBtn = ({ onClick, active, disabled, title, children }) => (
  <button type="button" onClick={onClick} disabled={disabled} title={title}
    className={`p-1.5 rounded transition-all ${
      active ? 'bg-cyan-500 text-black' : 'text-gray-400 hover:text-white hover:bg-gray-800'
    } disabled:opacity-30 disabled:cursor-not-allowed`}>
    {children}
  </button>
);

const Divider = () => <div className="w-px h-5 bg-gray-700 mx-0.5" />;

const ImgBtn = ({ onClick, active, danger, title, children }) => (
  <button type="button" onMouseDown={(e) => { e.preventDefault(); onClick(); }} title={title}
    style={{
      padding: '3px 7px', borderRadius: 3, border: 'none', cursor: 'pointer',
      background: active ? '#00f3ff' : 'transparent',
      color: active ? '#000' : danger ? '#ff6b6b' : '#aaa',
      display: 'flex', alignItems: 'center', lineHeight: 1, fontSize: 12,
    }}>
    {children}
  </button>
);

const ImgSep = () => (
  <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.1)', margin: '0 3px' }} />
);

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export default function RichEditor({ content, onChange }) {
  const fileRef       = useRef();
  const editorWrapRef = useRef();
  const [mode, setMode]             = useState('visual');
  const [codeValue, setCodeValue]   = useState(content || '');
  const [uploading, setUploading]   = useState(false);
  const [uploadPct, setUploadPct]   = useState(0);
  const [imgToolbar, setImgToolbar] = useState({
    visible: false, top: 0, left: 0, align: 'none', width: '100%',
  });

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Underline,
      Highlight.configure({ multicolor: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      ResizableImage.configure({ inline: false }),
      IframeNode, // ← custom node untuk iframe
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'rich-link' } }),
      Placeholder.configure({ placeholder: 'Mulai menulis...' }),
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      queueMicrotask(() => {
        const html = editor.getHTML();
        setCodeValue(html);
        onChange(html);
      });
    },
    editorProps: {
      attributes: { class: 'rich-editor-body focus:outline-none' },
      handleClickOn(view, pos, node) {
        if (node.type.name === 'image') {
          const dom = view.nodeDOM(pos);
          if (dom && editorWrapRef.current) {
            const wrapRect = editorWrapRef.current.getBoundingClientRect();
            const imgRect  = dom.getBoundingClientRect();
            setImgToolbar({
              visible: true,
              top:  imgRect.top  - wrapRect.top  - 46,
              left: imgRect.left - wrapRect.left + imgRect.width / 2,
              align: node.attrs.align || 'none',
              width: node.attrs.width || '100%',
            });
          }
          return false;
        }
        setImgToolbar(p => ({ ...p, visible: false }));
        return false;
      },
    },
  });

  const setImgAttr = (attr, val) => {
    if (!editor) return;
    editor.chain().focus().updateAttributes('image', { [attr]: val }).run();
    setImgToolbar(p => ({ ...p, [attr === 'align' ? 'align' : 'width']: val }));
    queueMicrotask(() => { const h = editor.getHTML(); onChange(h); setCodeValue(h); });
  };

  const deleteImg = () => {
    editor?.chain().focus().deleteSelection().run();
    setImgToolbar(p => ({ ...p, visible: false }));
  };

  const switchToVisual = () => {
    editor?.commands.setContent(codeValue, false);
    setMode('visual');
    setImgToolbar(p => ({ ...p, visible: false }));
  };
  const switchToCode = () => { setCodeValue(editor?.getHTML() || ''); setMode('code'); };
  const handleCodeChange = (val) => { setCodeValue(val); onChange(val); };

  const insertImage = useCallback((src) => {
    editor?.chain().focus().setImage({ src, width: '100%', align: 'none' }).run();
    queueMicrotask(() => { const h = editor?.getHTML()||''; setCodeValue(h); onChange(h); });
  }, [editor, onChange]);

  const addImageUrl = useCallback(() => {
    const url = window.prompt('Image URL (https://...):');
    if (url) insertImage(url);
  }, [insertImage]);

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
      if (xhr.status === 200) insertImage(JSON.parse(xhr.responseText).secure_url);
      else alert('Gagal upload. Cek Cloud Name dan Upload Preset.');
      setUploading(false); setUploadPct(0);
    };
    xhr.onerror = () => { alert('Gagal upload. Cek koneksi.'); setUploading(false); };
    xhr.send(fd);
  }, [insertImage]);

  const setLink = useCallback(() => {
    const prev = editor?.getAttributes('link').href;
    const url  = window.prompt('URL:', prev || 'https://');
    if (url === null) return;
    if (!url) { editor?.chain().focus().extendMarkRange('link').unsetLink().run(); return; }
    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="border border-gray-800 rounded-sm overflow-hidden">

      {/* TOOLBAR */}
      <div className="bg-[#0a0f1e] border-b border-gray-800 p-2 flex flex-wrap items-center gap-0.5">
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
              : <span className="text-[10px] font-bold">IMG↑</span>}
          </ToolBtn>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={addImageFile}/>
          <Divider/>
          <ToolBtn onClick={()=>editor.chain().focus().setHorizontalRule().run()} title="Garis"><Minus className="w-4 h-4"/></ToolBtn>
        </>)}
        {mode === 'code' && <span className="text-xs text-gray-600 ml-1">Edit HTML langsung · iframe & chart otomatis tersimpan</span>}
      </div>

      {/* VISUAL EDITOR */}
      {mode === 'visual' && (
        <div ref={editorWrapRef} className="bg-[#050a15] min-h-[400px] p-6 relative"
          onClick={(e) => { if (e.target.tagName !== 'IMG') setImgToolbar(p=>({...p,visible:false})); }}>

          {/* Image floating toolbar */}
          {imgToolbar.visible && (
            <div onMouseDown={e => e.preventDefault()}
              style={{
                position: 'absolute',
                top: Math.max(4, imgToolbar.top),
                left: imgToolbar.left,
                transform: 'translateX(-50%)',
                background: '#0a0f1e',
                border: '1px solid rgba(0,243,255,0.35)',
                borderRadius: 5,
                display: 'flex', alignItems: 'center', gap: 1,
                padding: '4px 6px', zIndex: 50,
                boxShadow: '0 6px 24px rgba(0,0,0,0.8)',
                whiteSpace: 'nowrap',
              }}>
              <ImgBtn onClick={()=>setImgAttr('align','left')}   active={imgToolbar.align==='left'}   title="Float Kiri"><MoveLeft className="w-3.5 h-3.5"/></ImgBtn>
              <ImgBtn onClick={()=>setImgAttr('align','center')} active={imgToolbar.align==='center'} title="Tengah"><AlignHorizontalDistributeCenter className="w-3.5 h-3.5"/></ImgBtn>
              <ImgBtn onClick={()=>setImgAttr('align','right')}  active={imgToolbar.align==='right'}  title="Float Kanan"><MoveRight className="w-3.5 h-3.5"/></ImgBtn>
              <ImgBtn onClick={()=>setImgAttr('align','none')}   active={imgToolbar.align==='none'}   title="Full Block"><Maximize2 className="w-3.5 h-3.5"/></ImgBtn>
              <ImgSep/>
              {[['25%','XS'],['50%','S'],['75%','M'],['100%','L']].map(([w,l])=>(
                <ImgBtn key={w} onClick={()=>setImgAttr('width',w)} active={imgToolbar.width===w} title={`Lebar ${w}`}>
                  <span style={{fontSize:9,fontWeight:900}}>{l}</span>
                </ImgBtn>
              ))}
              <ImgSep/>
              <ImgBtn onClick={deleteImg} danger title="Hapus"><Trash2 className="w-3.5 h-3.5"/></ImgBtn>
            </div>
          )}

          <EditorContent editor={editor}/>
          <p className="text-[10px] text-gray-700 mt-4 border-t border-gray-900 pt-3">
            💡 <strong className="text-gray-600">Klik gambar</strong> untuk toolbar posisi & ukuran · chart/iframe tampil di visual mode
          </p>
        </div>
      )}

      {/* HTML EDITOR */}
      {mode === 'code' && (
        <div className="relative">
          <textarea value={codeValue} onChange={e=>handleCodeChange(e.target.value)}
            className="w-full bg-[#020810] text-green-400 font-mono text-[13px] leading-relaxed p-6 focus:outline-none resize-none border-none"
            style={{minHeight:'400px'}} spellCheck={false}
            onKeyDown={(e)=>{
              if(e.key==='Tab'){
                e.preventDefault();
                const s=e.target.selectionStart, v=e.target.value;
                handleCodeChange(v.substring(0,s)+'  '+v.substring(e.target.selectionEnd));
                setTimeout(()=>{e.target.selectionStart=e.target.selectionEnd=s+2;},0);
              }
            }}/>
          <div className="absolute top-2 right-4 text-[10px] text-gray-700 tracking-widest">HTML MODE</div>
        </div>
      )}

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
        .rich-editor-body a.rich-link{color:#00f3ff;text-decoration:underline;}
        .rich-editor-body code{background:#0d1117;border:1px solid #ffffff15;color:#00f3ff;padding:2px 6px;border-radius:3px;font-size:13px;}
        .rich-editor-body pre{background:#0a0f1e;border:1px solid #ffffff10;border-left:3px solid #00f3ff;padding:18px;border-radius:4px;overflow-x:auto;margin:1.2em 0;}
        .rich-editor-body pre code{background:none;border:none;padding:0;color:#e6e6e6;font-size:13px;}
        .rich-editor-body blockquote{border-left:3px solid #00f3ff44;padding-left:1em;color:#888;margin:1.2em 0;font-style:italic;}
        .rich-editor-body ul{list-style:disc;padding-left:1.5em;margin:0 0 1em;}
        .rich-editor-body ol{list-style:decimal;padding-left:1.5em;margin:0 0 1em;}
        .rich-editor-body li{margin-bottom:0.3em;}
        .rich-editor-body ul li::marker{color:#00f3ff;}
        .rich-editor-body hr{border:none;border-top:1px solid #1a1a2e;margin:1.5em 0;}
        .rich-editor-body img{max-width:100%;border-radius:4px;border:1px solid rgba(255,255,255,0.08);cursor:pointer;display:block;}
        .rich-editor-body img.ProseMirror-selectednode{outline:2px solid #00f3ff;outline-offset:2px;}
        .rich-editor-body iframe{width:100%;border-radius:6px;border:none;display:block;}
        .rich-editor-body div[data-type="iframe"]{margin:1.5em 0;}
      `}}/>
    </div>
  );
}