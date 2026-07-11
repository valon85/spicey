var ch = Object.defineProperty;
var dh = (r, a, o) => a in r ? ch(r, a, { enumerable: !0, configurable: !0, writable: !0, value: o }) : r[a] = o;
var te = (r, a, o) => (dh(r, typeof a != "symbol" ? a + "" : a, o), o);
let hh = 0;
const vs = () => hh++, ws = "KGZ1bmN0aW9uKCl7InVzZSBzdHJpY3QiO2FkZEV2ZW50TGlzdGVuZXIoIm1lc3NhZ2UiLCh7ZGF0YTp0fSk9Pntjb25zdCBzPXtpZDp0LmlkfTtzZXRUaW1lb3V0KHBvc3RNZXNzYWdlLHQudGltZW91dCxzKX0pfSkoKTsK", wo = typeof window < "u" && window.Blob && new Blob([atob(ws)], { type: "text/javascript;charset=utf-8" });
function ph() {
  let r;
  try {
    if (r = wo && (window.URL || window.webkitURL).createObjectURL(wo), !r)
      throw "";
    return new Worker(r);
  } catch {
    return new Worker("data:application/javascript;base64," + ws);
  } finally {
    r && (window.URL || window.webkitURL).revokeObjectURL(r);
  }
}
let Fn;
const Ai = /* @__PURE__ */ new Map(), Es = (r, a) => {
  const o = vs(), l = { id: o, timeout: a };
  return Ai.set(l.id, r), Fn || (Fn = new ph(), Fn.onmessage = ({ data: m }) => {
    const w = Ai.get(m.id);
    Ai.delete(m.id), w();
  }), Fn.postMessage(l), o;
}, _h = 60, Eo = 1e3 / _h, Rn = [];
let xo = 0;
const xs = (r) => {
  const a = vs();
  if (Rn.length === 0) {
    const o = performance.now(), l = Eo - (o - xo) % Eo;
    Es(() => {
      const m = xo = performance.now(), w = [...Rn];
      Rn.length = 0, w.forEach((v) => v(m));
    }, l);
  }
  return Rn.push(r), a;
}, bh = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  requestAnimationFrame: xs,
  setTimeout: Es
}, Symbol.toStringTag, { value: "Module" })), mh = (...r) => window.setTimeout(...r), Mn = /* @__PURE__ */ new Map(), gh = (r) => {
  const a = window.requestAnimationFrame((...o) => {
    Mn.delete(a), r(...o);
  });
  return Mn.set(a, r), a;
};
typeof document < "u" && document.addEventListener("visibilitychange", () => {
  document.visibilityState !== "visible" && Mn.forEach((r, a) => {
    Mn.delete(a), cancelAnimationFrame(a), xs(r);
  });
});
const yh = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  requestAnimationFrame: gh,
  setTimeout: mh
}, Symbol.toStringTag, { value: "Module" })), vh = typeof document < "u" ? document : { visibilityState: "hidden" }, Ss = () => vh.visibilityState === "visible" ? yh : bh, Qr = (r) => Ss().requestAnimationFrame(r), Ts = (r, a) => Ss().setTimeout(r, a), Cs = (r) => Promise.resolve().then(r), _a = {
  requestAnimationFrame: Qr,
  setTimeout: Ts
}, _m = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  nextTick: Cs,
  requestAnimationFrame: Qr,
  setTimeout: Ts,
  timers: _a
}, Symbol.toStringTag, { value: "Module" })), wh = () => new Promise((r) => Qr(r)), ba = (r = -1) => function(a, o, l) {
  const m = l, w = m.value;
  return { ...m, value: async function* (...P) {
    const L = w.apply(this, P);
    let N = 0, H = 0;
    for (; ; ) {
      const re = 1e3 / r, z = 0.1 * re;
      for (; (H = performance.now()) - N < re - z; )
        await wh();
      N = H;
      const { done: G, value: ve } = await L.next();
      if (G)
        return ve;
      const ce = yield ve;
      typeof ce < "u" && (r = ce);
    }
  } };
}, $n = async (r, a = {}) => new Promise((o) => {
  const l = document.createElement("video");
  if (l.muted = !0, l.controls = !1, l.playsInline = !0, Object.assign(l, a), r instanceof globalThis.MediaStream)
    l.srcObject = r, l.addEventListener("ended", () => l.srcObject = null, { once: !0 }), r.addEventListener("inactive", () => l.dispatchEvent(new CustomEvent("ended")), {
      once: !0
    });
  else {
    if (typeof r != "string") {
      const w = r = URL.createObjectURL(r);
      l.addEventListener("emptied", () => URL.revokeObjectURL(w), { once: !0 });
    }
    l.crossOrigin = "anonymous", l.src = r, l.addEventListener("ended", () => l.src = "", { once: !0 });
  }
  l.style.position = "fixed", l.style.zIndex = "-9999999", l.style.opacity = "0.0000000001", document.body.appendChild(l), l.addEventListener("emptied", () => l.remove(), { once: !0 });
  const m = setInterval(() => l.readyState, 300);
  l.addEventListener("play", () => clearInterval(m), { once: !0 }), l.addEventListener("play", () => o(l), { once: !0 }), l.addEventListener("loadedmetadata", () => l.play(), { once: !0 });
}), Eh = (r) => new Promise((a, o) => {
  const l = document.createElement("img");
  l.onload = () => a(l), l.onerror = o, l.crossOrigin = "anonymous", l.src = typeof r == "string" ? r : URL.createObjectURL(r);
}), So = /* @__PURE__ */ new Map(), xh = (r, a, o) => r * (1 - o) + a * o, Ji = (r) => `webar::${r}:start`, Ii = (r) => `webar::${r}:end`, ma = (r) => {
  let a = { internalName: r + ":" + Math.random() };
  return performance.mark(Ji(a.internalName)), a;
}, ga = (r) => {
  const a = r.internalName;
  performance.mark(Ii(a));
  let o = performance.measure(a, Ji(a), Ii(a));
  o || (o = performance.getEntriesByName(a)[0]), performance.clearMarks(Ji(a)), performance.clearMarks(Ii(a)), performance.clearMeasures(a);
  const { duration: l } = o, m = a.split(":")[0];
  let { averagedDuration: w = 0 } = So.get(m) || {};
  return w = xh(w, l, 0.05), So.set(m, { averagedDuration: w }), { instantDuration: l, averagedDuration: w };
}, Fs = (r, a = (o) => console.warn(o)) => function(o, l, m) {
  const w = m.value;
  if (typeof w != "function")
    throw new TypeError("Only functions can be marked as deprecated");
  return { ...m, value: function(...P) {
    return a.call(
      this,
      `DEPRECATION: ${o.constructor.name}.${l}() is deprecated. ${r}`
    ), w.call(this, ...P);
  } };
};
let en = class {
  constructor() {
    te(this, "_emitter", new EventTarget());
  }
  addEventListener(a, o, l) {
    this._emitter.addEventListener(a, o, l);
  }
  removeEventListener(a, o, l) {
    this._emitter.removeEventListener(a, o, l);
  }
  dispatchEvent(a) {
    return this._emitter.dispatchEvent(a);
  }
  removeAllEventListeners() {
    this._emitter = new EventTarget();
  }
};
const Sh = (r, a, o) => fetch(r, a).then((l) => {
  if (!l.body)
    return l;
  let m = 0;
  const w = Number(l.headers.get("content-length") || 0), v = l.body.getReader();
  return new Response(
    new ReadableStream({
      async start(b) {
        for (; ; ) {
          const { done: P, value: L } = await v.read();
          if (P ? m = w : m += L.byteLength, o?.onProgress?.({ total: w, transferred: m }), P)
            break;
          b.enqueue(L);
        }
        b.close();
      }
    }),
    l
  );
}), Th = () => (
  // The meta.env.SUPPORTED_BROWSERS will be replaced during build with RegExp, see vite.config.js
  /Edge?\/(79|[89]\d|\d{3,})(\.\d+|)(\.\d+|)|Firefox\/(6[5-9]|[7-9]\d|\d{3,})\.\d+(\.\d+|)|Chrom(ium|e)\/(5[7-9]|[6-9]\d|\d{3,})\.\d+(\.\d+|)([\d.]+$|.*Safari\/(?![\d.]+ Edge\/[\d.]+$))|Maci.* Version\/(1[5-9]|[2-9]\d|\d{3,})\.\d+([,.]\d+|)( Mobile\/\w+|) Safari\/|Chrome.+OPR\/(4[4-9]|[5-9]\d|\d{3,})\.\d+\.\d+|(CPU[ +]OS|iPhone[ +]OS|CPU[ +]iPhone|CPU IPhone OS|CPU iPad OS)[ +]+(1[5-9]|[2-9]\d|\d{3,})[._]\d+([._]\d+|)|Mobile Safari.+OPR\/(7[2-9]|[89]\d|\d{3,})\.\d+\.\d+|Android.+Chrom(ium|e)\/(10[7-9]|1[1-9]\d|[2-9]\d{2}|\d{4,})\.\d+(\.\d+|)|Android.+(UC? ?Browser|UCWEB|U3)[ /]?(1[3-9]|[2-9]\d|\d{3,})\.\d+\.\d+|SamsungBrowser\/([7-9]|\d{2,})\.\d+|Android.+MQ{2}Browser\/(1[3-9]|[2-9]\d|\d{3,})(\.\d+|)(\.\d+|)|baidubrowser[\s/](1[3-9]|[2-9]\d|\d{3,})(\.\d+|)(\.\d+|)/.test(navigator.userAgent)
), Ch = typeof window < "u" && /^((?!chrome|android).)*safari/i.test(window.navigator?.userAgent), Rs = typeof OffscreenCanvas < "u" && !Ch, As = {
  // https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices#avoid_alphafalse_which_can_be_expensive
  alpha: !0,
  antialias: !1,
  depth: !1,
  // since this context is designed to process video, it's better to be synchronized with the browser renderer
  desynchronized: !1,
  // avoid setting `powerPreference` to `"high-performance"` - it highly increases GPU usage
  // powerPreference: "high-performance",
  premultipliedAlpha: !1,
  preserveDrawingBuffer: !1,
  stencil: !1
};
let ie;
const Fh = (() => {
  if (typeof window > "u" || !Th() || (ie ?? (ie = ya().getContext("webgl2", As)), ie === null))
    return !1;
  const r = ie.createTexture();
  ie.bindTexture(ie.TEXTURE_2D, r), ie.texImage2D(ie.TEXTURE_2D, 0, ie.RGB, 1, 1, 0, ie.RGB, ie.UNSIGNED_BYTE, null);
  const a = ie.createFramebuffer();
  ie.bindFramebuffer(ie.FRAMEBUFFER, a), ie.framebufferTexture2D(ie.FRAMEBUFFER, ie.COLOR_ATTACHMENT0, ie.TEXTURE_2D, r, 0);
  const o = ie.getParameter(ie.IMPLEMENTATION_COLOR_READ_FORMAT);
  return ie.bindFramebuffer(ie.FRAMEBUFFER, null), ie.bindTexture(ie.TEXTURE_2D, null), ie.deleteFramebuffer(a), ie.deleteTexture(r), o === ie.RGB;
})(), Rh = async (r, a, o, l = "RGBA") => {
  ie ?? (ie = ya().getContext("webgl2", As)), ie.canvas.width = r.width, ie.canvas.height = r.height, l === "RGB" && ie.pixelStorei(ie.PACK_ALIGNMENT, 1);
  const m = ie.createTexture();
  ie.bindTexture(ie.TEXTURE_2D, m), ie.texParameteri(ie.TEXTURE_2D, ie.TEXTURE_MIN_FILTER, ie.NEAREST), ie.texParameteri(ie.TEXTURE_2D, ie.TEXTURE_MAG_FILTER, ie.LINEAR), ie.texImage2D(ie.TEXTURE_2D, 0, ie[l], ie[l], ie.UNSIGNED_BYTE, r);
  const w = ie.createFramebuffer();
  ie.bindFramebuffer(ie.FRAMEBUFFER, w), ie.framebufferTexture2D(ie.FRAMEBUFFER, ie.COLOR_ATTACHMENT0, ie.TEXTURE_2D, m, 0);
  const v = ie.createBuffer();
  ie.bindBuffer(ie.PIXEL_PACK_BUFFER, v), ie.bufferData(ie.PIXEL_PACK_BUFFER, a.byteLength, ie.STREAM_READ), ie.readPixels(
    o.x,
    o.y,
    o.width,
    o.height,
    ie[l],
    ie.UNSIGNED_BYTE,
    0
  ), ie.bindBuffer(ie.PIXEL_PACK_BUFFER, null), ie.bindFramebuffer(ie.FRAMEBUFFER, null), ie.deleteFramebuffer(w), ie.bindTexture(ie.TEXTURE_2D, null), ie.deleteTexture(m);
  const b = ie.fenceSync(ie.SYNC_GPU_COMMANDS_COMPLETE, 0);
  ie.flush(), await Ah(ie, b).finally(() => ie.deleteSync(b)), ie.bindBuffer(ie.PIXEL_PACK_BUFFER, v), ie.getBufferSubData(
    ie.PIXEL_PACK_BUFFER,
    0,
    new DataView(a.buffer()),
    a.byteOffset,
    a.byteLength
  ), ie.bindBuffer(ie.PIXEL_PACK_BUFFER, null), ie.deleteBuffer(v);
}, Ah = (r, a) => new Promise(
  (o, l) => function m() {
    const w = r.clientWaitSync(a, 0, 0);
    if (w === r.WAIT_FAILED)
      return l(new Error("GPU operations complete wait failed"));
    if (w === r.CONDITION_SATISFIED || w === r.ALREADY_SIGNALED)
      return o();
    _a.setTimeout(m, 2);
  }()
);
function Ih(r = 256, a = 128) {
  const o = document.createElement("canvas");
  return o.width = r, o.height = a, o;
}
function kh(r = 256, a = 128) {
  return new OffscreenCanvas(r, a);
}
function ya(r = 256, a = 128) {
  return Rs ? kh(r, a) : Ih(r, a);
}
const Wn = (r = {}) => {
  const a = ({ displayWidth: l, displayHeight: m, visibleRect: w = null }) => {
    let v = w?.x ?? 0, b = w?.y ?? 0, P = w?.width ?? l, L = w?.height ?? m;
    if (r.crop) {
      const N = r?.orientation ?? 0;
      let [H, re, z, G] = [0, 0, 0, 0];
      N == 90 || N == 270 ? [re, H, G, z] = r.crop(L, P) : [H, re, z, G] = r.crop(P, L), [v, b, P, L] = [v + H, b + re, z, G];
    }
    return [l, m] = [P, L], {
      visibleRect: { x: v, y: b, width: P, height: L },
      displayWidth: l,
      displayHeight: m,
      horizontalFlip: r.horizontalFlip,
      orientation: r.orientation,
      textureOrientation: r.textureOrientation
    };
  };
  return { getSourceOptions: (l) => {
    let m = l instanceof HTMLVideoElement ? l.videoWidth : l.width, w = l instanceof HTMLVideoElement ? l.videoHeight : l.height;
    return a({ displayWidth: m, displayHeight: w });
  }, getFrameOptions: a };
};
class Jr {
  constructor(a, o = {}, l = null) {
    te(this, "_source", null);
    te(this, "_visibleRect", { x: 0, y: 0, width: 0, height: 0 });
    te(this, "_deleter");
    te(this, "horizontalFlip", !1);
    te(this, "orientation", 0);
    te(this, "textureOrientation", this.orientation);
    te(this, "frameTimestamp", performance.now());
    const m = a instanceof HTMLVideoElement ? a.videoWidth : a.width, w = a instanceof HTMLVideoElement ? a.videoHeight : a.height;
    this._visibleRect.x = o.visibleRect?.x ?? 0, this._visibleRect.y = o.visibleRect?.y ?? 0, this._visibleRect.width = o.visibleRect?.width ?? m, this._visibleRect.height = o.visibleRect?.height ?? w, this.horizontalFlip = o.horizontalFlip ?? this.horizontalFlip, this.orientation = o.orientation ?? this.orientation, this.textureOrientation = o.textureOrientation ?? this.textureOrientation, a.width = m, a.height = w, this._source = a, this._deleter = l;
  }
  /** @internal */
  get texture() {
    return this._source?.width == this.displayWidth && this._source?.height == this.displayHeight ? this._source : null;
  }
  get displayWidth() {
    return this._visibleRect.width;
  }
  get displayHeight() {
    return this._visibleRect.height;
  }
  /** Pixel format of the Frame */
  get format() {
    return this._source ? Fh ? "RGB" : "RGBA" : null;
  }
  /** @returns The number of bytes required to hold the Frame pixels */
  allocationSize() {
    if (!this.format)
      throw new Error("Failed to execute 'allocationSize' on 'Frame': Frame is closed.");
    const { width: a, height: o } = { width: this._visibleRect.width, height: this._visibleRect.height };
    return a * o * this.format.length;
  }
  /** Copies the Frame pixels to the destination */
  async copyTo(a) {
    if (!this._source)
      throw new Error("Failed to execute 'copyTo' on 'Frame': Frame is closed.");
    return await Rh(this._source, a, this._visibleRect, this.format), [];
  }
  /** Releases GPU resources held by the Frame */
  close() {
    this._deleter && this._deleter(), this._source = null;
  }
}
var Ph = Object.defineProperty, Dh = Object.getOwnPropertyDescriptor, Lh = (r, a, o, l) => {
  for (var m = l > 1 ? void 0 : l ? Dh(a, o) : a, w = r.length - 1, v; w >= 0; w--)
    (v = r[w]) && (m = (l ? v(a, o, m) : v(m)) || m);
  return l && m && Ph(a, o, m), m;
}, Is;
let Bh = class {
  constructor(a) {
    te(this, "_src");
    /** @internal */
    te(this, "kind", "image");
    this._src = a;
  }
  async *[Is = Symbol.asyncIterator](a) {
    const o = await Eh(this._src), l = Wn(a);
    yield new Jr(o, l.getSourceOptions(o), () => {
      URL.revokeObjectURL(o.src), o.src = "";
    });
  }
};
Lh([
  ba(30)
], Bh.prototype, Is, 1);
var Mh = Object.defineProperty, Oh = Object.getOwnPropertyDescriptor, Nh = (r, a, o, l) => {
  for (var m = l > 1 ? void 0 : l ? Oh(a, o) : a, w = r.length - 1, v; w >= 0; w--)
    (v = r[w]) && (m = (l ? v(a, o, m) : v(m)) || m);
  return l && m && Mh(a, o, m), m;
}, ks, zt;
const Ps = (zt = class {
  /**
   * Creates MediaStream input from {@link https://developer.mozilla.org/en-US/docs/Web/API/MediaStream/MediaStream | MediaStream}
   * @example
   * ```ts
   * const stream = new MediaStream(
   *  await navigator.mediaDevices.getUserMedia({ video: true })
   * )
   * ```
   */
  constructor(a) {
    // @ts-expect-error: Property '_stream' has no initializer and is not definitely assigned in the constructor.
    te(this, "_stream");
    /** @internal */
    te(this, "kind", "stream");
    if (!zt.cache.has(a))
      zt.cache.set(a, this);
    else
      return zt.cache.get(a);
    this._stream = a;
  }
  async *[ks = Symbol.asyncIterator](a) {
    const o = Wn(a);
    if (typeof MediaStreamTrackProcessor < "u") {
      const l = this._stream.getVideoTracks()[0];
      if (l.readyState === "ended")
        return;
      const w = new MediaStreamTrackProcessor({ track: l }).readable.getReader();
      try {
        for (; ; ) {
          const { done: v, value: b } = await w.read();
          if (v)
            return;
          const P = new VideoFrame(b, o.getFrameOptions(b));
          P.horizontalFlip = a?.horizontalFlip ?? !0, P.orientation = a?.orientation ?? 0, P.textureOrientation = a?.textureOrientation ?? P.orientation, P.frameTimestamp = b.timestamp, b.close(), yield P;
        }
      } finally {
        w.releaseLock();
      }
    } else {
      const l = await $n(this._stream), m = "requestVideoFrameCallback" in l ? l.requestVideoFrameCallback.bind(l) : requestAnimationFrame;
      for (; !l.paused; )
        await new Promise(m), yield new Jr(l, o.getSourceOptions(l));
      URL.revokeObjectURL(l.src), l.src = "", l.srcObject = null;
    }
  }
  /** Stops underlying media stream */
  stop() {
    for (const a of this._stream.getVideoTracks())
      a.stop();
    this._stream && zt.cache.delete(this._stream);
  }
}, te(zt, "cache", /* @__PURE__ */ new WeakMap()), zt);
Nh([
  ba(30)
], Ps.prototype, ks, 1);
let ki = Ps, gm = class {
  /**
   * Creates ReadableStream input from {@link https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream | ReadableStream}
   */
  constructor(a) {
    te(this, "_readable");
    /** @internal */
    te(this, "kind", "stream");
    this._readable = a;
  }
  /**
   * Yields a sequence of {@link Frame | frames}
   * @internal
   */
  async *[Symbol.asyncIterator](a) {
    const o = Wn(a), l = this._readable.getReader();
    try {
      for (; ; ) {
        const { done: m, value: w } = await l.read();
        if (m)
          return;
        const v = new VideoFrame(w, o.getFrameOptions(w));
        v.horizontalFlip = a?.horizontalFlip ?? !0, v.orientation = a?.orientation ?? 0, v.textureOrientation = a?.textureOrientation ?? v.orientation, v.frameTimestamp = w.timestamp, w.close(), yield v;
      }
    } finally {
      l.releaseLock();
    }
  }
  /** Stops underlying readable stream */
  stop() {
    this._readable.cancel();
  }
};
var Uh = Object.defineProperty, $h = Object.getOwnPropertyDescriptor, Wh = (r, a, o, l) => {
  for (var m = l > 1 ? void 0 : l ? $h(a, o) : a, w = r.length - 1, v; w >= 0; w--)
    (v = r[w]) && (m = (l ? v(a, o, m) : v(m)) || m);
  return l && m && Uh(a, o, m), m;
}, Ds;
const jh = {
  loop: !1
};
class Gh {
  /** @param options - options to be merged with {@link defaultVideoOptions} */
  constructor(a, o) {
    te(this, "_src");
    te(this, "_options");
    te(this, "_video", null);
    /** @internal */
    te(this, "kind", "video");
    this._src = a, this._options = {
      ...jh,
      ...o
    };
  }
  async *[Ds = Symbol.asyncIterator](a) {
    const o = await (this._video ?? (this._video = $n(this._src, this._options))), l = Wn(a), m = "requestVideoFrameCallback" in o ? o.requestVideoFrameCallback.bind(o) : requestAnimationFrame;
    for (; !o.paused; )
      await new Promise(m), yield new Jr(o, l.getSourceOptions(o));
  }
  /** Stops underlying video */
  stop() {
    this._video && this._video.then(
      (a) => (URL.revokeObjectURL(a.src), a.src = "", a.srcObject = null)
    ), this._video = null;
  }
}
Wh([
  ba(30)
], Gh.prototype, Ds, 1);
const Vh = `#define GLSLIFY 1
attribute vec2 a_position;
varying vec2 v_tex_uv;

void main() {
  v_tex_uv.x = (a_position.x + 1.) * .5;
  v_tex_uv.y = 1. - (a_position.y + 1.) * .5;
  gl_Position = vec4(a_position, 0., 1.);
}
`, zh = `precision highp float;
#define GLSLIFY 1

varying vec2 v_tex_uv;

uniform sampler2D u_texture;
uniform vec2 u_viewsize;

/**
 * u_filters.x - denoising algorithm to use
 *   1 - FSR
 *   2 - Bilateral
 *   any other value - none
 * u_filters.y - light correction coefficient in [0, 2]
 *   1 - no light correction
 */
uniform vec2 u_filters;

// https://github.com/glslify/glslify#importing-a-glsl-module
// https://github.com/glslify/glslify#passing-references-between-modules
// Copyright (c) 2021 Advanced Micro Devices, Inc. All rights reserved.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//
// FidelityFX FSR v1.0.2 by AMD
// ported to mpv by agyild - https://gist.github.com/agyild/82219c545228d70c5604f865ce0b0ce5
// ported to WebGL by goingdigital - https://www.shadertoy.com/view/stXSWB
// using colorspace functions from tobspr - https://github.com/tobspr/GLSL-Color-Spaces/blob/master/ColorSpaces.inc.glsl

#define SHARPENING 2.0 // Sharpening intensity: Adjusts sharpening intensity by averaging the original pixels to the sharpened result. 1.0 is the unmodified default. 0.0 to 1.0.
#define CONTRAST 2.0 // Adjusts the range the shader adapts to high contrast (0 is not all the way off). Higher values = more high contrast sharpening. 0.0 to 1.0.
#define PERFORMANCE 1 // Whether to use optimizations for performance with loss of quality

// Used to convert from linear RGB to XYZ space
const mat3 RGB_2_XYZ_2717090884 = (mat3(
  0.4124564, 0.2126729, 0.0193339,
  0.3575761, 0.7151522, 0.1191920,
  0.1804375, 0.0721750, 0.9503041
));

// Used to convert from XYZ to linear RGB space
const mat3 XYZ_2_RGB_2717090884 = (mat3(
   3.2404542,-0.9692660, 0.0556434,
  -1.5371385, 1.8760108,-0.2040259,
  -0.4985314, 0.0415560, 1.0572252
));
// Converts a color from linear RGB to XYZ space
vec3 rgb_to_xyz_2717090884(vec3 rgb) {
  return RGB_2_XYZ_2717090884 * rgb;
}

// Converts a color from XYZ to linear RGB space
vec3 xyz_to_rgb_2717090884(vec3 xyz) {
  return XYZ_2_RGB_2717090884 * xyz;
}

/* EASU stage
*
* This takes a reduced resolution source, and scales it up while preserving detail.
*
* Updates:
*   stretch definition fixed. Thanks nehon for the bug report!
*/

vec3 FsrEasuCF(vec2 p) {
  vec2 uv = (p + .5) / u_viewsize;
  vec4 color = texture2D(u_texture, uv);
    return rgb_to_xyz_2717090884(color.rgb);
}

/**** EASU ****/
void FsrEasuCon(
  out vec4 con0,
  out vec4 con1,
  out vec4 con2,
  out vec4 con3,
  // This the rendered image resolution being upscaled
  vec2 inputViewportInPixels,
  // This is the resolution of the resource containing the input image (useful for dynamic resolution)
  vec2 inputSizeInPixels,
  // This is the display resolution which the input image gets upscaled to
  vec2 outputSizeInPixels
)
{
  // Output integer position to a pixel position in viewport.
  con0 = vec4(
    inputViewportInPixels.x/outputSizeInPixels.x,
    inputViewportInPixels.y/outputSizeInPixels.y,
    .5*inputViewportInPixels.x/outputSizeInPixels.x-.5,
    .5*inputViewportInPixels.y/outputSizeInPixels.y-.5
  );
  // Viewport pixel position to normalized image space.
  // This is used to get upper-left of 'F' tap.
  con1 = vec4(1.,1.,1.,-1.)/inputSizeInPixels.xyxy;
  // Centers of gather4, first offset from upper-left of 'F'.
  //      +---+---+
  //      |   |   |
  //      +--(0)--+
  //      | b | c |
  //  +---F---+---+---+
  //  | e | f | g | h |
  //  +--(1)--+--(2)--+
  //  | i | j | k | l |
  //  +---+---+---+---+
  //      | n | o |
  //      +--(3)--+
  //      |   |   |
  //      +---+---+
  // These are from (0) instead of 'F'.
  con2 = vec4(-1.,2.,1.,2.)/inputSizeInPixels.xyxy;
  con3 = vec4(0.,4.,0.,0.)/inputSizeInPixels.xyxy;
}

// Filtering for a given tap for the scalar.
void FsrEasuTapF(
  inout vec3 aC, // Accumulated color, with negative lobe.
  inout float aW, // Accumulated weight.
  vec2 off_0, // Pixel offset from resolve position to tap.
  vec2 dir_0, // Gradient direction.
  vec2 len_0, // Length.
  float lob_0, // Negative lobe strength.
  float clp_0, // Clipping point.
  vec3 c_0
)
{
  // Tap color.
  // Rotate offset by direction.
  vec2 v = vec2(dot(off_0, dir_0), dot(off_0,vec2(-dir_0.y,dir_0.x)));
  // Anisotropy.
  v *= len_0;
  // Compute distance^2.
  float d2 = min(dot(v,v),clp_0);
  // Limit to the window as at corner, 2 taps can easily be outside.
  // Approximation of lancos2 without sin() or rcp(), or sqrt() to get x.
  //  (25/16 * (2/5 * x^2 - 1)^2 - (25/16 - 1)) * (1/4 * x^2 - 1)^2
  //  |_______________________________________|   |_______________|
  //                   base                             window
  // The general form of the 'base' is,
  //  (a*(b*x^2-1)^2-(a-1))
  // Where 'a=1/(2*b-b^2)' and 'b' moves around the negative lobe.
  float wB = .4 * d2 - 1.;
  float wA = lob_0 * d2 -1.;
  wB *= wB;
  wA *= wA;
  wB = 1.5625*wB-.5625;
  float w=  wB * wA;
  // Do weighted average.
  aC += c_0*w;
  aW += w;
}

//------------------------------------------------------------------------------------------------------------------------------
// Accumulate direction and length.
void FsrEasuSetF(
    inout vec2 dir,
    inout float len,
    float w,
    float lA,float lB,float lC,float lD,float lE
)
{
  // Direction is the '+' diff.
  //    a
  //  b c d
  //    e
  // Then takes magnitude from abs average of both sides of 'c'.
  // Length converts gradient reversal to 0, smoothly to non-reversal at 1, shaped, then adding horz and vert terms.
  float lenX = max(abs(lD - lC), abs(lC - lB));
  float dirX = lD - lB;
  dir.x += dirX * w;
  lenX = clamp(abs(dirX)/lenX,0.,1.);
  lenX *= lenX;
  len += lenX * w;
  // Repeat for the y axis.
  float lenY = max(abs(lE - lC), abs(lC - lA));
  float dirY = lE - lA;
  dir.y += dirY * w;
  lenY = clamp(abs(dirY) / lenY,0.,1.);
  lenY *= lenY;
  len += lenY * w;
}

//------------------------------------------------------------------------------------------------------------------------------
void FsrEasuF(
  out vec3 pix,
  vec2 ip, // Integer pixel position in output.
  // Constants generated by FsrEasuCon().
  vec4 con0, // xy = output to input scale, zw = first pixel offset correction
  vec4 con1_0,
  vec4 con2_0,
  vec4 con3_0
)
{
  //------------------------------------------------------------------------------------------------------------------------------
  // Get position of 'f'.
  vec2 pp = ip * con0.xy + con0.zw; // Corresponding input pixel/subpixel
  vec2 fp = floor(pp);// fp = source nearest pixel
  pp -= fp; // pp = source subpixel

  //------------------------------------------------------------------------------------------------------------------------------
  // 12-tap kernel.
  //    b c
  //  e f g h
  //  i j k l
  //    n o
  // Gather 4 ordering.
  //  a b
  //  r g
  vec2 p0 = fp * con1_0.xy + con1_0.zw;
  
  // These are from p0 to avoid pulling two constants on pre-Navi hardware.
  vec2 p1 = p0 + con2_0.xy;
  vec2 p2 = p0 + con2_0.zw;
  vec2 p3 = p0 + con3_0.xy;

  // TextureGather is not available on WebGL2
  vec4 off = vec4(-.5,.5,-.5,.5)*con1_0.xxyy;
  // textureGather to texture offsets
  // x=west y=east z=north w=south
  vec3 bC = FsrEasuCF(p0 + off.xw); float bL = bC.g + 0.5 *(bC.r + bC.b);
  vec3 cC = FsrEasuCF(p0 + off.yw); float cL = cC.g + 0.5 *(cC.r + cC.b);
  vec3 iC = FsrEasuCF(p1 + off.xw); float iL = iC.g + 0.5 *(iC.r + iC.b);
  vec3 jC = FsrEasuCF(p1 + off.yw); float jL = jC.g + 0.5 *(jC.r + jC.b);
  vec3 fC = FsrEasuCF(p1 + off.yz); float fL = fC.g + 0.5 *(fC.r + fC.b);
  vec3 eC = FsrEasuCF(p1 + off.xz); float eL = eC.g + 0.5 *(eC.r + eC.b);
  vec3 kC = FsrEasuCF(p2 + off.xw); float kL = kC.g + 0.5 *(kC.r + kC.b);
  vec3 lC = FsrEasuCF(p2 + off.yw); float lL = lC.g + 0.5 *(lC.r + lC.b);
  vec3 hC = FsrEasuCF(p2 + off.yz); float hL = hC.g + 0.5 *(hC.r + hC.b);
  vec3 gC = FsrEasuCF(p2 + off.xz); float gL = gC.g + 0.5 *(gC.r + gC.b);
  vec3 oC = FsrEasuCF(p3 + off.yz); float oL = oC.g + 0.5 *(oC.r + oC.b);
  vec3 nC = FsrEasuCF(p3 + off.xz); float nL = nC.g + 0.5 *(nC.r + nC.b);
 
  //------------------------------------------------------------------------------------------------------------------------------
  // Simplest multi-channel approximate luma possible (luma times 2, in 2 FMA/MAD).
  // Accumulate for bilinear interpolation.
  vec2 dir = vec2(0.);
  float len = 0.;

  FsrEasuSetF(dir, len, (1.-pp.x)*(1.-pp.y), bL, eL, fL, gL, jL);
  FsrEasuSetF(dir, len,    pp.x  *(1.-pp.y), cL, fL, gL, hL, kL);
  FsrEasuSetF(dir, len, (1.-pp.x)*  pp.y  , fL, iL, jL, kL, nL);
  FsrEasuSetF(dir, len,    pp.x  *  pp.y  , gL, jL, kL, lL, oL);

  //------------------------------------------------------------------------------------------------------------------------------
  // Normalize with approximation, and cleanup close to zero.
  vec2 dir2 = dir * dir;
  float dirR = dir2.x + dir2.y;
  bool zro = dirR < (1.0/32768.0);
  dirR = inversesqrt(dirR);
#if (PERFORMANCE == 1)
  if (zro) {
    vec4 w = vec4(0.0);
    w.x = (1.0 - pp.x) * (1.0 - pp.y);
    w.y =        pp.x  * (1.0 - pp.y);
    w.z = (1.0 - pp.x) *        pp.y;
    w.w =        pp.x  *        pp.y;
    pix.r = clamp(dot(w, vec4(fL, gL, jL, kL)), 0.0, 1.0);
    return;
  }
#elif (PERFORMANCE == 0)
  dirR = zro ? 1.0 : dirR;
  dir.x = zro ? 1.0 : dir.x;
#endif
  dir *= vec2(dirR);
  // Transform from {0 to 2} to {0 to 1} range, and shape with square.
  len = len * 0.5;
  len *= len;
  // Stretch kernel {1.0 vert|horz, to sqrt(2.0) on diagonal}.
  float stretch = dot(dir,dir) / (max(abs(dir.x), abs(dir.y)));
  // Anisotropic length after rotation,
  //  x := 1.0 lerp to 'stretch' on edges
  //  y := 1.0 lerp to 2x on edges
  vec2 len2 = vec2(1. +(stretch-1.0)*len, 1. -.5 * len);
  // Based on the amount of 'edge',
  // the window shifts from +/-{sqrt(2.0) to slightly beyond 2.0}.
  float lob = .5 - .29 * len;
  // Set distance^2 clipping point to the end of the adjustable window.
  float clp = 1./lob;

  //------------------------------------------------------------------------------------------------------------------------------
  // Accumulation mixed with min/max of 4 nearest.
  //    b c
  //  e f g h
  //  i j k l
  //    n o
  // Accumulation.
  vec3 aC = vec3(0);
  float aW = 0.;
  FsrEasuTapF(aC, aW, vec2( 0.,-1.)-pp, dir, len2, lob, clp, bC);
  FsrEasuTapF(aC, aW, vec2( 1.,-1.)-pp, dir, len2, lob, clp, cC);
  FsrEasuTapF(aC, aW, vec2(-1., 1.)-pp, dir, len2, lob, clp, iC);
  FsrEasuTapF(aC, aW, vec2( 0., 1.)-pp, dir, len2, lob, clp, jC);
  FsrEasuTapF(aC, aW, vec2( 0., 0.)-pp, dir, len2, lob, clp, fC);
  FsrEasuTapF(aC, aW, vec2(-1., 0.)-pp, dir, len2, lob, clp, eC);
  FsrEasuTapF(aC, aW, vec2( 1., 1.)-pp, dir, len2, lob, clp, kC);
  FsrEasuTapF(aC, aW, vec2( 2., 1.)-pp, dir, len2, lob, clp, lC);
  FsrEasuTapF(aC, aW, vec2( 2., 0.)-pp, dir, len2, lob, clp, hC);
  FsrEasuTapF(aC, aW, vec2( 1., 0.)-pp, dir, len2, lob, clp, gC);
  FsrEasuTapF(aC, aW, vec2( 1., 2.)-pp, dir, len2, lob, clp, oC);
  FsrEasuTapF(aC, aW, vec2( 0., 2.)-pp, dir, len2, lob, clp, nC);
  //------------------------------------------------------------------------------------------------------------------------------
  // Normalize and dering.
#if (PERFORMANCE == 1)
pix = aC/aW;
#elif (PERFORMANCE == 0)
  vec3 min4 = min(min(fC,gC),min(jC,kC));
  vec3 max4 = max(max(fC,gC),max(jC,kC));
  pix=min(max4,max(min4,aC/aW));
#endif
}

void EASU( out vec4 fragColor, in vec2 fragCoord )
{
  vec3 c;
  vec4 con0,con1,con2,con3;
  
  // "rendersize" refers to size of source image before upscaling.
  vec2 rendersize = u_viewsize;
  FsrEasuCon(
    con0, con1, con2, con3, rendersize, rendersize, rendersize
  );
  FsrEasuF(c, fragCoord, con0, con1, con2, con3);
  
  fragColor = vec4(xyz_to_rgb_2717090884(c.xyz), 1);
}

vec4 getPixel(vec2 pos) {
  vec2 coord = (pos + .5) / u_viewsize;
  coord.y = 1.0 - coord.y;
  return texture2D(u_texture, coord);
}

vec4 fsr_easu_2717090884(vec2 uv) {
  vec4 e = getPixel(gl_FragCoord.xy);

    
  vec4 e_xyz = vec4(rgb_to_xyz_2717090884(e.rgb), 1);
  EASU(e_xyz, (gl_FragCoord.xy + 0.5) / u_viewsize);  
  
  // fetch a 3x3 neighborhood around the pixel 'e',
  //  a b c
  //  d(e)f
  //  g h i 
  vec3 a = getPixel(gl_FragCoord.xy + vec2(-1.0,-1.0)).rgb;
  vec3 b = getPixel(gl_FragCoord.xy + vec2( 0.0,-1.0)).rgb;
  vec3 c = getPixel(gl_FragCoord.xy + vec2( 1.0,-1.0)).rgb;
  vec3 f = getPixel(gl_FragCoord.xy + vec2( 1.0, 0.0)).rgb;
  vec3 g = getPixel(gl_FragCoord.xy + vec2(-1.0, 1.0)).rgb;
  vec3 h = getPixel(gl_FragCoord.xy + vec2( 0.0, 1.0)).rgb;
  vec3 d = getPixel(gl_FragCoord.xy + vec2(-1.0, 0.0)).rgb;
  vec3 i = getPixel(gl_FragCoord.xy + vec2( 1.0, 1.0)).rgb;;
  // Soft min and max.
  //  a b c     b
  //  d e f * 0.5 + d e f * 0.5
  //  g h i     h
  // These are 2.0x bigger (factored out the extra multiply).

  vec3 mnRGB = min(min(min(d, e.rgb), min(f, b)), h);
  vec3 mnRGB2 = min(mnRGB, min(min(a, c), min(g, i)));
  mnRGB += mnRGB2;

  vec3 mxRGB = max(max(max(d, e.rgb), max(f, b)), h);
  vec3 mxRGB2 = max(mxRGB, max(max(a, c), max(g, i)));
  mxRGB += mxRGB2;

  // Smooth minimum distance to signal limit divided by smooth max.
  vec3 rcpMRGB = 1.0 / mxRGB;
  vec3 ampRGB = clamp(min(mnRGB, 2.0 - mxRGB) * rcpMRGB, 0.0, 1.0);

  // Shaping amount of sharpening.
  ampRGB = inversesqrt(ampRGB);

  float peak = -3.0 * clamp(CONTRAST, 0.0, 1.0) + 8.0;
  vec3 wRGB = -(1.0 / (ampRGB * peak));

  vec3 rcpWeightRGB = 1.0 / (4.0 * wRGB + 1.0);

  //          0 w 0
  //  Filter shape: w 1 w
  //          0 w 0
  vec3 window = (b + d) + (f + h);
  vec3 outColor = clamp((window * wRGB + e.rgb) * rcpWeightRGB, 0.0, 1.0);

  return vec4(mix(e.rgb, outColor, SHARPENING), e.a);
}

// https://github.com/glslify/glslify#exporting-a-glsl-module

#define DIFF 1.0
#define RADIUS 4.0

void bilateral_iter_3977570374(vec2 random_dir, vec2 radius, float diff, vec4 pixel, vec2 uv, inout vec3 result, inout float totalWeight)
{
  vec2 dir = random_dir * radius;
  vec3 randomPixel = texture2D(u_texture, uv + dir).xyz;
  vec3 delta = randomPixel - pixel.rgb;
  float weight = exp(-dot(delta, delta) / diff);
  result += randomPixel * weight;
  totalWeight += weight;
}

vec4 bilateral(vec2 uv)
{
  vec2 radius = (RADIUS / u_viewsize);
  float diff = DIFF / 255.0;
  vec4 pixel = texture2D(u_texture, uv);
  vec3 result = vec3(0.0, 0.0, 0.0);
  float totalWeight = 0.0;

  // uroll loop and substitute precalculated random vectors for GLSL 1.0 ES:

  bilateral_iter_3977570374(vec2(-0.886051297,0.447155535), radius, diff, pixel, uv, result, totalWeight);
  bilateral_iter_3977570374(vec2(0.270759493,0.537728608), radius, diff, pixel, uv, result, totalWeight);
  bilateral_iter_3977570374(vec2(-0.896959424,0.440607518), radius, diff, pixel, uv, result, totalWeight);
  bilateral_iter_3977570374(vec2(-0.804274619,0.125076547), radius, diff, pixel, uv, result, totalWeight);
  bilateral_iter_3977570374(vec2(0.373693645,0.240383312), radius, diff, pixel, uv, result, totalWeight);
  bilateral_iter_3977570374(vec2(-0.850325704,-0.192106694), radius, diff, pixel, uv, result, totalWeight);
  bilateral_iter_3977570374(vec2(-0.453608066,0.889671504), radius, diff, pixel, uv, result, totalWeight);
  bilateral_iter_3977570374(vec2(-0.280496657,0.206442386), radius, diff, pixel, uv, result, totalWeight);
  bilateral_iter_3977570374(vec2(0.840040743,-0.36367026), radius, diff, pixel, uv, result, totalWeight);
  bilateral_iter_3977570374(vec2(-0.151598319,-0.884027064), radius, diff, pixel, uv, result, totalWeight);
  bilateral_iter_3977570374(vec2(-0.221440807,0.593896627), radius, diff, pixel, uv, result, totalWeight);
  bilateral_iter_3977570374(vec2(-0.797481239,-0.243254974), radius, diff, pixel, uv, result, totalWeight);
  bilateral_iter_3977570374(vec2(0.48824361,0.225083455), radius, diff, pixel, uv, result, totalWeight);
  bilateral_iter_3977570374(vec2(-0.0387817062,0.838459492), radius, diff, pixel, uv, result, totalWeight);
  bilateral_iter_3977570374(vec2(0.92897892,-0.133588716), radius, diff, pixel, uv, result, totalWeight);
  bilateral_iter_3977570374(vec2(-0.693672359,-0.706737161), radius, diff, pixel, uv, result, totalWeight);
  
  result = result / totalWeight;    
  return vec4(result, pixel.a);
}

// https://github.com/glslify/glslify#exporting-a-glsl-module

vec3 rgb2hsv(vec3 c)
{
  vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
  vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
  vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
  float d = q.x - min(q.w, q.y);
  float e = 1.0e-10;
  return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c)
{
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec4 light_correction_1117569599(vec4 c, float s)
{
  vec3 hsv = rgb2hsv(c.rgb);
  hsv.y = pow(hsv.y, pow(s, -0.5));
  hsv.z = pow(hsv.z, s);
  vec3 rgb = hsv2rgb(hsv);
  return vec4(rgb, c.a);
}

// https://github.com/glslify/glslify#exporting-a-glsl-module

void main() {
  vec4 c;

  if (u_filters.x == 1.)
    c = fsr_easu_2717090884(v_tex_uv);
  else if (u_filters.x == 2.)
    c = bilateral(v_tex_uv);
  else
    c = texture2D(u_texture, v_tex_uv);

  if (u_filters.y != 1.)
    c = light_correction_1117569599(c, u_filters.y);

  gl_FragColor = c;
}`, Hh = (r, a, o) => {
  const l = r.createProgram();
  return r.attachShader(l, a), r.attachShader(l, o), r.linkProgram(l), r.useProgram(l), l;
}, To = (r, a, o) => {
  const l = r.createShader(a);
  return r.shaderSource(l, o), r.compileShader(l), l;
}, Kh = (r) => {
  const a = r.createTexture();
  return r.bindTexture(r.TEXTURE_2D, a), r.texImage2D(r.TEXTURE_2D, 0, r.RGB, 1, 1, 0, r.RGB, r.UNSIGNED_BYTE, null), r.texParameteri(r.TEXTURE_2D, r.TEXTURE_WRAP_S, r.CLAMP_TO_EDGE), r.texParameteri(r.TEXTURE_2D, r.TEXTURE_WRAP_T, r.CLAMP_TO_EDGE), r.texParameteri(r.TEXTURE_2D, r.TEXTURE_MIN_FILTER, r.NEAREST), r.texParameteri(r.TEXTURE_2D, r.TEXTURE_MAG_FILTER, r.LINEAR), r.bindTexture(r.TEXTURE_2D, null), a;
}, Co = (r, a) => {
  let o = 0, l = 1;
  const m = document.createElement("canvas"), w = m.captureStream(30), v = m.getContext("webgl"), b = To(v, v.VERTEX_SHADER, Vh), P = To(v, v.FRAGMENT_SHADER, zh), L = Hh(v, b, P), N = Kh(v);
  v.bindTexture(v.TEXTURE_2D, N);
  const H = v.getAttribLocation(L, "a_position"), re = v.createBuffer();
  v.bindBuffer(v.ARRAY_BUFFER, re), v.bufferData(
    v.ARRAY_BUFFER,
    // prettier-ignore
    new Float32Array([
      -1,
      -1,
      1,
      -1,
      -1,
      1,
      -1,
      1,
      1,
      -1,
      1,
      1
    ]),
    v.STATIC_DRAW
  ), v.enableVertexAttribArray(H), v.vertexAttribPointer(H, 2, v.FLOAT, !1, 0, 0);
  const z = v.getUniformLocation(L, "u_viewsize"), G = v.getUniformLocation(L, "u_filters");
  v.uniform2fv(G, new Float32Array([o, l])), $n(r).then((ce) => {
    const ue = ce.requestVideoFrameCallback?.bind(ce) || _a.requestAnimationFrame;
    (function Q() {
      ce.ended || !w.active || (ue(Q), v.texImage2D(v.TEXTURE_2D, 0, v.RGBA, v.RGBA, v.UNSIGNED_BYTE, ce), (m.width !== ce.videoWidth || m.height !== ce.videoHeight) && (v.viewport(0, 0, m.width = ce.videoWidth, m.height = ce.videoHeight), v.uniform2fv(z, new Float32Array([m.width, m.height]))), v.drawArrays(v.TRIANGLES, 0, 6));
    })();
  }), v.deleteProgram(L), v.deleteShader(P), v.deleteShader(b);
  const ve = {
    /** Enhanced stream */
    stream: w,
    /**
     * @param {number} value - denoise algorithm to use
     *  - Pass 1 to use FSR algorithm
     *  - Pass 2 to use Bilateral algorithm
     *  - Pass any other number to disabled denoising
     */
    denoise(ce) {
      v.uniform2fv(G, new Float32Array([o = ce, l]));
    },
    /**
     * @param {number} value - exposure compensation coefficient in [0, 2] range
     *  - Pass value less than to 1 increase exposure
     *  - Pass value greater than 1 to reduce exposure
     * See the {@link https://fujifilm-dsc.com/en/manual/x-pro2/images/exp_exposure_480.gif | image} for visual example
     * Inspired by MediaTrackConstraints {@link https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints#exposurecompensation | Exposure compensation} parameter.
     */
    exposureCompensation(ce) {
      v.uniform2fv(G, new Float32Array([o, l = ce]));
    }
  };
  if (a)
    for (const [ce, ue] of Object.entries(a))
      ve[ce](ue);
  return ve;
}, Xh = typeof screen < "u" && screen.height > screen.width, ea = {
  facingMode: "user",
  width: { min: 640, ideal: 1280, max: 1920 },
  height: { min: 480, ideal: 720, max: 1080 },
  resizeMode: { ideal: "crop-and-scale" }
};
Xh && (delete ea.width, delete ea.height);
class vm {
  /**
   * @param videoConstraints - constraints to be merged with {@link defaultVideoConstraints}
   * and to be passed to {@link https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia | navigator.mediaDevices.getUserMedia()}
   */
  constructor(a) {
    te(this, "_stream", null);
    te(this, "_constraints");
    te(this, "_preferences", {});
    te(this, "_enhancer", null);
    /** @internal */
    te(this, "kind", "stream");
    this._constraints = {
      ...ea,
      ...a
    };
  }
  /**
   * Specifies if the webcam is currently active.
   *
   * The webcam is considered active if it has been started and has not been stopped afterwards
   */
  get active() {
    return !!this._stream;
  }
  /**
   * @param {number} algorithm - denoise algorithm to use
   *  - Pass false or 0 to disabled denoising
   *  - Pass true or 1 to use FSR algorithm
   *  - Pass 2 to use Bilateral algorithm
   * @internal
   */
  denoise(a) {
    this._preferences.denoise = Number(a), this._enhancer?.denoise(this._preferences.denoise);
  }
  /**
   * @param {number} coefficient - exposure compensation coefficient in [0, 2] range
   *  - Pass value less than 1 to increase exposure
   *  - Pass value greater than 1 to reduce exposure
   * See the {@link https://fujifilm-dsc.com/en/manual/x-pro2/images/exp_exposure_480.gif | image} for visual example
   * @internal
   */
  setExposureCompensation(a) {
    this._preferences.exposureCompensation = a, this._enhancer?.exposureCompensation(this._preferences.exposureCompensation);
  }
  /**
   * Manually starts webcam
   *
   * > Ordinary webcam is lazily started during async iteration over it.
   * >
   * > But sometimes you may want to manually pre-start webcam e.g during parallel creation of a {@link Player} instance:
   * > ```ts
   * > const [webcam, player] = await Promise.all([
   * >  new Webcam().start(),
   * >  Player.create({ clientToken: "xxx-xxx-xxx" }),
   * > ])
   * >
   * > player.use(webcam)
   * > ```
   */
  async start() {
    return await (this._stream ?? (this._stream = Fo(this._constraints))), this;
  }
  /**
   * Yields a sequence of {@link Frame | frames}
   * @internal
   */
  async *[Symbol.asyncIterator](a) {
    const o = await (this._stream ?? (this._stream = Fo(this._constraints))), l = this._enhancer = Pi(this._preferences) ? Co(o, this._preferences) : null;
    let w = new ki(l ? l.stream : o)[Symbol.asyncIterator]({ horizontalFlip: !0, ...a }), v;
    for (; ; ) {
      if (!this._enhancer && Pi(this._preferences)) {
        const L = this._enhancer = Co(o, this._preferences);
        w = new ki(L.stream)[Symbol.asyncIterator]({ horizontalFlip: !0, ...a });
      }
      this._enhancer && !Pi(this._preferences) && (this._enhancer.stream.getTracks().forEach((N) => N.stop()), this._enhancer = null, w = new ki(o)[Symbol.asyncIterator]({ horizontalFlip: !0, ...a }));
      const { done: b, value: P } = await w.next(v);
      if (b)
        break;
      v = yield P;
    }
    this.stop();
  }
  /** Turns off webcam */
  stop() {
    this._stream && this._stream.then((a) => a.getTracks().forEach((o) => o.stop())), this._enhancer && this._enhancer.stream.getTracks().forEach((a) => a.stop()), this._stream = null, this._enhancer = null;
  }
}
const Fo = async (r) => {
  if (typeof navigator.mediaDevices > "u")
    throw new Error(
      `SecureContext is required to access webcam
It‘s likely you need to set up HTTPS/TLS for your website
See https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia#Encryption_based_security for details `
    );
  return await navigator.mediaDevices.getUserMedia({ video: r });
}, Pi = (r) => typeof r.exposureCompensation == "number" && r.exposureCompensation !== 1 || r.denoise === 1 || r.denoise === 2, wm = { createVideoElement: $n, createCanvas: ya };
let Yh = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict", Ls = (r = 21) => {
  let a = "", o = r;
  for (; o--; )
    a += Yh[Math.random() * 64 | 0];
  return a;
};
const Bs = "KGZ1bmN0aW9uKCl7InVzZSBzdHJpY3QiO3ZhciBzPVVpbnQ4QXJyYXkseD1VaW50MTZBcnJheSxPPVVpbnQzMkFycmF5LEg9bmV3IHMoWzAsMCwwLDAsMCwwLDAsMCwxLDEsMSwxLDIsMiwyLDIsMywzLDMsMyw0LDQsNCw0LDUsNSw1LDUsMCwwLDAsMF0pLEk9bmV3IHMoWzAsMCwwLDAsMSwxLDIsMiwzLDMsNCw0LDUsNSw2LDYsNyw3LDgsOCw5LDksMTAsMTAsMTEsMTEsMTIsMTIsMTMsMTMsMCwwXSksbDE9bmV3IHMoWzE2LDE3LDE4LDAsOCw3LDksNiwxMCw1LDExLDQsMTIsMywxMywyLDE0LDEsMTVdKSxKPWZ1bmN0aW9uKHIsdCl7Zm9yKHZhciBhPW5ldyB4KDMxKSxuPTA7bjwzMTsrK24pYVtuXT10Kz0xPDxyW24tMV07Zm9yKHZhciB2PW5ldyBPKGFbMzBdKSxuPTE7bjwzMDsrK24pZm9yKHZhciBpPWFbbl07aTxhW24rMV07KytpKXZbaV09aS1hW25dPDw1fG47cmV0dXJuW2Esdl19LEs9SihILDIpLFE9S1swXSxjMT1LWzFdO1FbMjhdPTI1OCxjMVsyNThdPTI4O2Zvcih2YXIgczE9SihJLDApLGQxPXMxWzBdLFU9bmV3IHgoMzI3NjgpLHU9MDt1PDMyNzY4OysrdSl7dmFyIEM9KHUmNDM2OTApPj4+MXwodSYyMTg0NSk8PDE7Qz0oQyY1MjQyOCk+Pj4yfChDJjEzMTA3KTw8MixDPShDJjYxNjgwKT4+PjR8KEMmMzg1NSk8PDQsVVt1XT0oKEMmNjUyODApPj4+OHwoQyYyNTUpPDw4KT4+PjF9Zm9yKHZhciB6PWZ1bmN0aW9uKHQsYSxuKXtmb3IodmFyIHY9dC5sZW5ndGgsaT0wLGM9bmV3IHgoYSk7aTx2OysraSl0W2ldJiYrK2NbdFtpXS0xXTt2YXIgZj1uZXcgeChhKTtmb3IoaT0wO2k8YTsrK2kpZltpXT1mW2ktMV0rY1tpLTFdPDwxO3ZhciBvO2lmKG4pe289bmV3IHgoMTw8YSk7dmFyIGU9MTUtYTtmb3IoaT0wO2k8djsrK2kpaWYodFtpXSlmb3IodmFyIGw9aTw8NHx0W2ldLGI9YS10W2ldLGQ9Zlt0W2ldLTFdKys8PGIseT1kfCgxPDxiKS0xO2Q8PXk7KytkKW9bVVtkXT4+PmVdPWx9ZWxzZSBmb3Iobz1uZXcgeCh2KSxpPTA7aTx2OysraSl0W2ldJiYob1tpXT1VW2ZbdFtpXS0xXSsrXT4+PjE1LXRbaV0pO3JldHVybiBvfSxCPW5ldyBzKDI4OCksdT0wO3U8MTQ0OysrdSlCW3VdPTg7Zm9yKHZhciB1PTE0NDt1PDI1NjsrK3UpQlt1XT05O2Zvcih2YXIgdT0yNTY7dTwyODA7Kyt1KUJbdV09Nztmb3IodmFyIHU9MjgwO3U8Mjg4OysrdSlCW3VdPTg7Zm9yKHZhciBWPW5ldyBzKDMyKSx1PTA7dTwzMjsrK3UpVlt1XT01O3ZhciBnMT16KEIsOSwxKSx3MT16KFYsNSwxKSxXPWZ1bmN0aW9uKHIpe2Zvcih2YXIgdD1yWzBdLGE9MTthPHIubGVuZ3RoOysrYSlyW2FdPnQmJih0PXJbYV0pO3JldHVybiB0fSxoPWZ1bmN0aW9uKHIsdCxhKXt2YXIgbj10Lzh8MDtyZXR1cm4ocltuXXxyW24rMV08PDgpPj4odCY3KSZhfSxYPWZ1bmN0aW9uKHIsdCl7dmFyIGE9dC84fDA7cmV0dXJuKHJbYV18clthKzFdPDw4fHJbYSsyXTw8MTYpPj4odCY3KX0saDE9ZnVuY3Rpb24ocil7cmV0dXJuKHIrNykvOHwwfSxqPWZ1bmN0aW9uKHIsdCxhKXsodD09bnVsbHx8dDwwKSYmKHQ9MCksKGE9PW51bGx8fGE+ci5sZW5ndGgpJiYoYT1yLmxlbmd0aCk7dmFyIG49bmV3KHIuQllURVNfUEVSX0VMRU1FTlQ9PTI/eDpyLkJZVEVTX1BFUl9FTEVNRU5UPT00P086cykoYS10KTtyZXR1cm4gbi5zZXQoci5zdWJhcnJheSh0LGEpKSxufSxtMT1bInVuZXhwZWN0ZWQgRU9GIiwiaW52YWxpZCBibG9jayB0eXBlIiwiaW52YWxpZCBsZW5ndGgvbGl0ZXJhbCIsImludmFsaWQgZGlzdGFuY2UiLCJzdHJlYW0gZmluaXNoZWQiLCJubyBzdHJlYW0gaGFuZGxlciIsLCJubyBjYWxsYmFjayIsImludmFsaWQgVVRGLTggZGF0YSIsImV4dHJhIGZpZWxkIHRvbyBsb25nIiwiZGF0ZSBub3QgaW4gcmFuZ2UgMTk4MC0yMDk5IiwiZmlsZW5hbWUgdG9vIGxvbmciLCJzdHJlYW0gZmluaXNoaW5nIiwiaW52YWxpZCB6aXAgZGF0YSJdLGc9ZnVuY3Rpb24ocix0LGEpe3ZhciBuPW5ldyBFcnJvcih0fHxtMVtyXSk7aWYobi5jb2RlPXIsRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UmJkVycm9yLmNhcHR1cmVTdGFja1RyYWNlKG4sZyksIWEpdGhyb3cgbjtyZXR1cm4gbn0sYjE9ZnVuY3Rpb24ocix0LGEpe3ZhciBuPXIubGVuZ3RoO2lmKCFufHxhJiZhLmYmJiFhLmwpcmV0dXJuIHR8fG5ldyBzKDApO3ZhciB2PSF0fHxhLGk9IWF8fGEuaTthfHwoYT17fSksdHx8KHQ9bmV3IHMobiozKSk7dmFyIGM9ZnVuY3Rpb24odTEpe3ZhciB2MT10Lmxlbmd0aDtpZih1MT52MSl7dmFyIGYxPW5ldyBzKE1hdGgubWF4KHYxKjIsdTEpKTtmMS5zZXQodCksdD1mMX19LGY9YS5mfHwwLG89YS5wfHwwLGU9YS5ifHwwLGw9YS5sLGI9YS5kLGQ9YS5tLHk9YS5uLFI9bio4O2Rve2lmKCFsKXtmPWgocixvLDEpO3ZhciBZPWgocixvKzEsMyk7aWYobys9MyxZKWlmKFk9PTEpbD1nMSxiPXcxLGQ9OSx5PTU7ZWxzZSBpZihZPT0yKXt2YXIgUz1oKHIsbywzMSkrMjU3LHIxPWgocixvKzEwLDE1KSs0LHQxPVMraChyLG8rNSwzMSkrMTtvKz0xNDtmb3IodmFyIEY9bmV3IHModDEpLEc9bmV3IHMoMTkpLHc9MDt3PHIxOysrdylHW2wxW3ddXT1oKHIsbyt3KjMsNyk7bys9cjEqMztmb3IodmFyIGExPVcoRyksQjE9KDE8PGExKS0xLFIxPXooRyxhMSwxKSx3PTA7dzx0MTspe3ZhciBuMT1SMVtoKHIsbyxCMSldO28rPW4xJjE1O3ZhciBwPW4xPj4+NDtpZihwPDE2KUZbdysrXT1wO2Vsc2V7dmFyIFQ9MCxOPTA7Zm9yKHA9PTE2PyhOPTMraChyLG8sMyksbys9MixUPUZbdy0xXSk6cD09MTc/KE49MytoKHIsbyw3KSxvKz0zKTpwPT0xOCYmKE49MTEraChyLG8sMTI3KSxvKz03KTtOLS07KUZbdysrXT1UfX12YXIgaTE9Ri5zdWJhcnJheSgwLFMpLF89Ri5zdWJhcnJheShTKTtkPVcoaTEpLHk9VyhfKSxsPXooaTEsZCwxKSxiPXooXyx5LDEpfWVsc2UgZygxKTtlbHNle3ZhciBwPWgxKG8pKzQsTD1yW3AtNF18cltwLTNdPDw4LFo9cCtMO2lmKFo+bil7aSYmZygwKTticmVha312JiZjKGUrTCksdC5zZXQoci5zdWJhcnJheShwLFopLGUpLGEuYj1lKz1MLGEucD1vPVoqOCxhLmY9Zjtjb250aW51ZX1pZihvPlIpe2kmJmcoMCk7YnJlYWt9fXYmJmMoZSsxMzEwNzIpO2Zvcih2YXIgWTE9KDE8PGQpLTEsRjE9KDE8PHkpLTEsJD1vOzskPW8pe3ZhciBUPWxbWChyLG8pJlkxXSxrPVQ+Pj40O2lmKG8rPVQmMTUsbz5SKXtpJiZnKDApO2JyZWFrfWlmKFR8fGcoMiksazwyNTYpdFtlKytdPWs7ZWxzZSBpZihrPT0yNTYpeyQ9byxsPW51bGw7YnJlYWt9ZWxzZXt2YXIgbzE9ay0yNTQ7aWYoaz4yNjQpe3ZhciB3PWstMjU3LE09SFt3XTtvMT1oKHIsbywoMTw8TSktMSkrUVt3XSxvKz1NfXZhciBQPWJbWChyLG8pJkYxXSxEPVA+Pj40O1B8fGcoMyksbys9UCYxNTt2YXIgXz1kMVtEXTtpZihEPjMpe3ZhciBNPUlbRF07Xys9WChyLG8pJigxPDxNKS0xLG8rPU19aWYobz5SKXtpJiZnKDApO2JyZWFrfXYmJmMoZSsxMzEwNzIpO2Zvcih2YXIgZTE9ZStvMTtlPGUxO2UrPTQpdFtlXT10W2UtX10sdFtlKzFdPXRbZSsxLV9dLHRbZSsyXT10W2UrMi1fXSx0W2UrM109dFtlKzMtX107ZT1lMX19YS5sPWwsYS5wPSQsYS5iPWUsYS5mPWYsbCYmKGY9MSxhLm09ZCxhLmQ9YixhLm49eSl9d2hpbGUoIWYpO3JldHVybiBlPT10Lmxlbmd0aD90OmoodCwwLGUpfSx5MT1uZXcgcygwKSxFPWZ1bmN0aW9uKHIsdCl7cmV0dXJuIHJbdF18clt0KzFdPDw4fSxtPWZ1bmN0aW9uKHIsdCl7cmV0dXJuKHJbdF18clt0KzFdPDw4fHJbdCsyXTw8MTZ8clt0KzNdPDwyNCk+Pj4wfSxxPWZ1bmN0aW9uKHIsdCl7cmV0dXJuIG0ocix0KSttKHIsdCs0KSo0Mjk0OTY3Mjk2fTtmdW5jdGlvbiBFMShyLHQpe3JldHVybiBiMShyLHQpfXZhciBBPXR5cGVvZiBUZXh0RGVjb2RlcjwidSImJm5ldyBUZXh0RGVjb2RlcixwMT0wO3RyeXtBLmRlY29kZSh5MSx7c3RyZWFtOiEwfSkscDE9MX1jYXRjaHt9dmFyIEMxPWZ1bmN0aW9uKHIpe2Zvcih2YXIgdD0iIixhPTA7Oyl7dmFyIG49clthKytdLHY9KG4+MTI3KSsobj4yMjMpKyhuPjIzOSk7aWYoYSt2PnIubGVuZ3RoKXJldHVyblt0LGoocixhLTEpXTt2P3Y9PTM/KG49KChuJjE1KTw8MTh8KHJbYSsrXSY2Myk8PDEyfChyW2ErK10mNjMpPDw2fHJbYSsrXSY2MyktNjU1MzYsdCs9U3RyaW5nLmZyb21DaGFyQ29kZSg1NTI5NnxuPj4xMCw1NjMyMHxuJjEwMjMpKTp2JjE/dCs9U3RyaW5nLmZyb21DaGFyQ29kZSgobiYzMSk8PDZ8clthKytdJjYzKTp0Kz1TdHJpbmcuZnJvbUNoYXJDb2RlKChuJjE1KTw8MTJ8KHJbYSsrXSY2Myk8PDZ8clthKytdJjYzKTp0Kz1TdHJpbmcuZnJvbUNoYXJDb2RlKG4pfX07ZnVuY3Rpb24gUzEocix0KXtpZih0KXtmb3IodmFyIGE9IiIsbj0wO248ci5sZW5ndGg7bis9MTYzODQpYSs9U3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShudWxsLHIuc3ViYXJyYXkobixuKzE2Mzg0KSk7cmV0dXJuIGF9ZWxzZXtpZihBKXJldHVybiBBLmRlY29kZShyKTt2YXIgdj1DMShyKSxpPXZbMF0sYz12WzFdO3JldHVybiBjLmxlbmd0aCYmZyg4KSxpfX12YXIgXzE9ZnVuY3Rpb24ocix0KXtyZXR1cm4gdCszMCtFKHIsdCsyNikrRShyLHQrMjgpfSx4MT1mdW5jdGlvbihyLHQsYSl7dmFyIG49RShyLHQrMjgpLHY9UzEoci5zdWJhcnJheSh0KzQ2LHQrNDYrbiksIShFKHIsdCs4KSYyMDQ4KSksaT10KzQ2K24sYz1tKHIsdCsyMCksZj1hJiZjPT00Mjk0OTY3Mjk1P1QxKHIsaSk6W2MsbShyLHQrMjQpLG0ocix0KzQyKV0sbz1mWzBdLGU9ZlsxXSxsPWZbMl07cmV0dXJuW0Uocix0KzEwKSxvLGUsdixpK0Uocix0KzMwKStFKHIsdCszMiksbF19LFQxPWZ1bmN0aW9uKHIsdCl7Zm9yKDtFKHIsdCkhPTE7dCs9NCtFKHIsdCsyKSk7cmV0dXJuW3Eocix0KzEyKSxxKHIsdCs0KSxxKHIsdCsyMCldfTtmdW5jdGlvbiBrMShyLHQpe2Zvcih2YXIgYT17fSxuPXIubGVuZ3RoLTIyO20ocixuKSE9MTAxMDEwMjU2Oy0tbikoIW58fHIubGVuZ3RoLW4+NjU1NTgpJiZnKDEzKTt2YXIgdj1FKHIsbis4KTtpZighdilyZXR1cm57fTt2YXIgaT1tKHIsbisxNiksYz1pPT00Mjk0OTY3Mjk1O2MmJihuPW0ocixuLTEyKSxtKHIsbikhPTEwMTA3NTc5MiYmZygxMyksdj1tKHIsbiszMiksaT1tKHIsbis0OCkpO2Zvcih2YXIgZj10JiZ0LmZpbHRlcixvPTA7bzx2Oysrbyl7dmFyIGU9eDEocixpLGMpLGw9ZVswXSxiPWVbMV0sZD1lWzJdLHk9ZVszXSxSPWVbNF0sWT1lWzVdLFM9XzEocixZKTtpPVIsKCFmfHxmKHtuYW1lOnksc2l6ZTpiLG9yaWdpbmFsU2l6ZTpkLGNvbXByZXNzaW9uOmx9KSkmJihsP2w9PTg/YVt5XT1FMShyLnN1YmFycmF5KFMsUytiKSxuZXcgcyhkKSk6ZygxNCwidW5rbm93biBjb21wcmVzc2lvbiB0eXBlICIrbCk6YVt5XT1qKHIsUyxTK2IpKX1yZXR1cm4gYX1jb25zdCB6MT1yPT5rMShyLHtmaWx0ZXI6KHtuYW1lOnR9KT0+ISh0LnN0YXJ0c1dpdGgoIl9fTUFDT1NYLyIpfHx0LmluY2x1ZGVzKCIuRFNfU3RvcmUiKSl9KTthZGRFdmVudExpc3RlbmVyKCJtZXNzYWdlIiwoe2RhdGE6cn0pPT57bGV0IHQ7dHJ5e3Q9e2lkOnIuaWQsZGF0YTp6MShyLmRhdGEpfX1jYXRjaChhKXt0PXtpZDpyLmlkLGVycm9yOmEubWVzc2FnZX19cG9zdE1lc3NhZ2UodCl9KX0pKCk7Cg==", Ro = typeof window < "u" && window.Blob && new Blob([atob(Bs)], { type: "text/javascript;charset=utf-8" });
function Zh() {
  let r;
  try {
    if (r = Ro && (window.URL || window.webkitURL).createObjectURL(Ro), !r)
      throw "";
    return new Worker(r);
  } catch {
    return new Worker("data:application/javascript;base64," + Bs);
  } finally {
    r && (window.URL || window.webkitURL).revokeObjectURL(r);
  }
}
let Gr;
const qh = async (r) => new Promise((a, o) => {
  const l = Ls(), m = new Uint8Array(r), w = { id: l, data: m };
  Gr || (Gr = new Zh());
  const v = ({ data: b }) => {
    b.id === w.id && (Gr.removeEventListener("message", v), "error" in b && o(new Error(b.error)), "data" in b && a(b.data));
  };
  Gr.addEventListener("message", v), Gr.postMessage(w, [r]);
}), Di = "/";
class Ms {
  constructor(a) {
    te(this, "_source", null);
    te(this, "_fs", null);
    te(this, "_mountpoint", Di);
    te(this, "_data", {});
    this._source = a;
  }
  static async preload(a, o) {
    if (Array.isArray(a)) {
      const m = o?.onProgress;
      return await Promise.all(
        a.map((w, v) => {
          const b = m ? { onProgress: (...P) => m(v, ...P) } : {};
          return this.preload(w, b);
        })
      );
    }
    const l = new this(a);
    return await l.load(o), l;
  }
  /** Template method for data fetching */
  async _fetch(a, o) {
    return await Sh(a, {}, o).then((l) => {
      if (l.ok)
        return l.blob();
      throw new Error(
        `Failed to fetch ${a.url} ${l.status} (${l.statusText})`
      );
    }).then((l) => {
      if (l.size > 0)
        return l;
      throw new Error(`The source must not be empty. Received ${l.size} bytes size source.`);
    });
  }
  /** Template method for data decompression */
  async _unzip(a) {
    if (!a.type.includes("zip"))
      throw new TypeError(
        `The source type must be "application/zip"-like. Received: "${a.type}".`
      );
    return await a.arrayBuffer().then(qh).then((o) => Object.entries(o)).then((o) => Object.fromEntries(o));
  }
  /** Loads the resource data */
  async load(a) {
    let o = this._source;
    return typeof o == "string" && (o = new Request(o)), o instanceof Request && (o = await this._fetch(o, a)), o instanceof Blob && (o = await this._unzip(o)), o instanceof Object && o.constructor === Object && await Promise.all(
      Object.entries(o).map(([l, m]) => this.writeFile(l, m))
    ), this._source = null, this._data;
  }
  _fsWriteFile(a, o) {
    this._fs && (a = `${this._mountpoint}${a.startsWith("/") ? a.substring(1) : a}`, this._fs.writeFile(a, o));
  }
  async writeFile(a, o) {
    const l = new Uint8Array(o instanceof Blob ? await o.arrayBuffer() : o);
    this._data[a] = l, this._fsWriteFile(a, this._data[a]);
  }
  /** Mounts the resource to the supplied file system */
  mount(a, o = Di) {
    this._fs = a, this._mountpoint = o.endsWith("/") ? o : `${o}/`, Object.entries(this._data).forEach(([l, m]) => this._fsWriteFile(l, m));
  }
  /** Unmounts the resource from the previously supplied file system */
  unmount() {
    this._fs = null, this._mountpoint = Di;
  }
}
var Qh = Object.defineProperty, Jh = Object.getOwnPropertyDescriptor, ep = (r, a, o, l) => {
  for (var m = l > 1 ? void 0 : l ? Jh(a, o) : a, w = r.length - 1, v; w >= 0; w--)
    (v = r[w]) && (m = (l ? v(a, o, m) : v(m)) || m);
  return l && m && Qh(a, o, m), m;
};
class tp {
  constructor(a) {
    /** @internal */
    te(this, "name", `effects/${Ls()}`);
    te(this, "_player", null);
    te(this, "_resource");
    this._resource = new rp(a);
  }
  static async preload(a, o) {
    if (Array.isArray(a)) {
      const m = o?.onProgress;
      return await Promise.all(
        a.map((w, v) => {
          const b = m ? { onProgress: (...P) => m(v, ...P) } : {};
          return this.preload(w, b);
        })
      );
    }
    const l = new this(a);
    return await l._load(o), l;
  }
  /** Loads the effect data */
  async _load(a) {
    await this._resource.load(a);
  }
  /** Loads the effect data, mounts it to the player‘s file system */
  async _bind(a) {
    await this._resource.load(), this._player = a, this._resource.mount(this._player.FS, this.name);
  }
  /** Unmounts the effect data from the previously specified player‘s file system */
  _unbind() {
    this._resource.unmount(), this._player = null;
  }
  async writeFile(a, o) {
    return this._resource.writeFile(a, o);
  }
  callJsMethod(a, o = "") {
    if (!this._player) {
      console.warn("The method won't evaluate: the effect is not applied to a player.");
      return;
    }
    return this._player.callJsMethod(a, o);
  }
  /**
   * Evaluates JavaScript in context of the effect.
   *
   * The script won't evaluate if the effect is not applied to a player
   * @example
   * ```ts
   * const makeup = new Effect("/path/to/Makeup.zip")
   *
   * await player.applyEffect(makeup)
   *
   * // ...
   *
   * const electricBlueColor = "0.09 0.25 0.38"
   *
   * await makeup.evalJs(`Eyes.color("${electricBlueColor}")`)
   * ```
   */
  async evalJs(a) {
    if (!this._player) {
      console.warn("The script won't evaluate: the effect is not applied to a player.");
      return;
    }
    return await this._player.evalJs(a);
  }
}
ep([
  Fs("Please, use Effect.evalJs() instead.")
], tp.prototype, "callJsMethod", 1);
class rp extends Ms {
  async _unzip(a) {
    let o = await super._unzip(a);
    const m = Object.keys(o).map((b) => b.split("/").find(Boolean)), w = m[0];
    return m.every((b) => b === w) && (o = Object.fromEntries(
      Object.entries(o).map(([b, P]) => [
        b.replace(`${w}/`, ""),
        P
      ])
    )), o;
  }
}
let Em = class {
  constructor(a) {
    te(this, "_resource");
    this._resource = new Ms(a);
  }
  static async preload(a, o) {
    if (Array.isArray(a)) {
      const m = o?.onProgress;
      return await Promise.all(
        a.map((w, v) => {
          const b = m ? { onProgress: (...P) => m(v, ...P) } : {};
          return this.preload(w, b);
        })
      );
    }
    const l = new this(a);
    return await l._load(o), l;
  }
  /** Loads the module data */
  async _load(a) {
    await this._resource.load(a);
  }
  /** Loads the module data, mounts it to the player's file system */
  async _bind(a) {
    await this._resource.load(), this._resource.mount(a.FS);
  }
};
var np = (() => {
  var r = typeof document < "u" ? document.currentScript?.src : void 0;
  return async function(a = {}) {
    var o, l = a, m, w, v = new Promise((e, t) => {
      m = e, w = t;
    }), b = !1;
    l.expectedDataFileDownloads ?? (l.expectedDataFileDownloads = 0), l.expectedDataFileDownloads++, (() => {
      var e = typeof ENVIRONMENT_IS_PTHREAD < "u" && ENVIRONMENT_IS_PTHREAD, t = typeof ENVIRONMENT_IS_WASM_WORKER < "u" && ENVIRONMENT_IS_WASM_WORKER;
      if (e || t)
        return;
      function n(i) {
        typeof window == "object" ? window.encodeURIComponent(window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/")) + "/") : typeof process > "u" && typeof location < "u" && encodeURIComponent(location.pathname.substring(0, location.pathname.lastIndexOf("/")) + "/");
        var s = "BanubaSDK.data", f = "BanubaSDK.data", h = l.locateFile ? l.locateFile(f, "") : f, p = i.remote_package_size;
        function E(B, j, ee, se) {
          l.dataFileDownloads ?? (l.dataFileDownloads = {}), fetch(B).catch((fe) => Promise.reject(new Error(`Network Error: ${B}`, { cause: fe }))).then((fe) => {
            if (!fe.ok)
              return Promise.reject(new Error(`${fe.status}: ${fe.url}`));
            if (!fe.body && fe.arrayBuffer)
              return fe.arrayBuffer().then(ee);
            const pe = fe.body.getReader(), be = () => pe.read().then(ke).catch((Qe) => Promise.reject(new Error(`Unexpected error while handling : ${fe.url} ${Qe}`, { cause: Qe }))), de = [], Ee = fe.headers, xe = Number(Ee.get("Content-Length") ?? j);
            let oe = 0;
            const ke = ({ done: Qe, value: st }) => {
              if (Qe) {
                const je = new Uint8Array(de.map((ze) => ze.length).reduce((ze, Pe) => ze + Pe, 0));
                let lt = 0;
                for (const ze of de)
                  je.set(ze, lt), lt += ze.length;
                ee(je.buffer);
              } else {
                de.push(st), oe += st.length, l.dataFileDownloads[B] = { loaded: oe, total: xe };
                let je = 0, lt = 0;
                for (const ze of Object.values(l.dataFileDownloads))
                  je += ze.loaded, lt += ze.total;
                return l.setStatus?.(`Downloading data... (${je}/${lt})`), be();
              }
            };
            return l.setStatus?.("Downloading data..."), be();
          });
        }
        var A = null, I = l.getPreloadedPackage ? l.getPreloadedPackage(h, p) : null;
        I || E(h, p, (B) => {
          A ? (A(B), A = null) : I = B;
        });
        function $(B) {
          function j(be, de) {
            if (!be)
              throw de + new Error().stack;
          }
          B.FS_createPath("/", "bnb_js", !0, !0), B.FS_createPath("/", "bnb_prefabs", !0, !0), B.FS_createPath("/bnb_prefabs", "audio", !0, !0), B.FS_createPath("/bnb_prefabs", "base", !0, !0), B.FS_createPath("/bnb_prefabs", "bokeh", !0, !0), B.FS_createPath("/bnb_prefabs/bokeh", "shaders", !0, !0), B.FS_createPath("/bnb_prefabs", "camera", !0, !0), B.FS_createPath("/bnb_prefabs/camera", "images", !0, !0), B.FS_createPath("/bnb_prefabs", "earrings", !0, !0), B.FS_createPath("/bnb_prefabs/earrings", "script", !0, !0), B.FS_createPath("/bnb_prefabs/earrings", "shaders", !0, !0), B.FS_createPath("/bnb_prefabs", "foreground", !0, !0), B.FS_createPath("/bnb_prefabs", "gltf", !0, !0), B.FS_createPath("/bnb_prefabs", "gltf_base", !0, !0), B.FS_createPath("/bnb_prefabs/gltf_base", "meshes", !0, !0), B.FS_createPath("/bnb_prefabs/gltf_base", "shaders", !0, !0), B.FS_createPath("/bnb_prefabs", "hint", !0, !0), B.FS_createPath("/bnb_prefabs/hint", "font", !0, !0), B.FS_createPath("/bnb_prefabs/hint", "meshes", !0, !0), B.FS_createPath("/bnb_prefabs/hint", "scripts", !0, !0), B.FS_createPath("/bnb_prefabs/hint", "shaders", !0, !0), B.FS_createPath("/bnb_prefabs", "lights", !0, !0), B.FS_createPath("/bnb_prefabs", "lut", !0, !0), B.FS_createPath("/bnb_prefabs/lut", "scripts", !0, !0), B.FS_createPath("/bnb_prefabs/lut", "shaders", !0, !0), B.FS_createPath("/bnb_prefabs/lut/shaders", "lut-filter", !0, !0), B.FS_createPath("/bnb_prefabs/lut", "textures", !0, !0), B.FS_createPath("/bnb_prefabs", "msaa", !0, !0), B.FS_createPath("/bnb_prefabs", "video_texture", !0, !0), B.FS_createPath("/bnb_prefabs/video_texture", "meshes", !0, !0), B.FS_createPath("/bnb_prefabs/video_texture", "shaders", !0, !0), B.FS_createPath("/", "bnb_shaders", !0, !0), B.FS_createPath("/bnb_shaders", "bnb", !0, !0), B.FS_createPath("/bnb_shaders/bnb", "guided_filter", !0, !0), B.FS_createPath("/bnb_shaders/bnb/guided_filter", "ab", !0, !0), B.FS_createPath("/bnb_shaders/bnb/guided_filter", "mean", !0, !0), B.FS_createPath("/bnb_shaders/bnb", "lib", !0, !0), B.FS_createPath("/", "frx", !0, !0);
          function ee(be, de, Ee) {
            this.start = be, this.end = de, this.audio = Ee;
          }
          ee.prototype = { requests: {}, open: function(be, de) {
            this.name = de, this.requests[de] = this, B.addRunDependency(`fp ${this.name}`);
          }, send: function() {
          }, onload: function() {
            var be = this.byteArray.subarray(this.start, this.end);
            this.finish(be);
          }, finish: function(be) {
            var de = this;
            B.FS_createDataFile(this.name, null, be, !0, !0, !0), B.removeRunDependency(`fp ${de.name}`), this.requests[this.name] = null;
          } };
          for (var se = i.files, fe = 0; fe < se.length; ++fe)
            new ee(se[fe].start, se[fe].end, se[fe].audio || 0).open("GET", se[fe].filename);
          function pe(be) {
            j(be, "Loading data file failed."), j(be.constructor.name === ArrayBuffer.name, "bad input to processPackageData");
            var de = new Uint8Array(be);
            ee.prototype.byteArray = de;
            for (var Ee = i.files, xe = 0; xe < Ee.length; ++xe)
              ee.prototype.requests[Ee[xe].filename].onload();
            B.removeRunDependency("datafile_BanubaSDK.data");
          }
          B.addRunDependency("datafile_BanubaSDK.data"), B.preloadResults ?? (B.preloadResults = {}), B.preloadResults[s] = { fromCache: !1 }, I ? (pe(I), I = null) : A = pe;
        }
        l.calledRun ? $(l) : (l.preRun ?? (l.preRun = [])).push($);
      }
      n({ files: [{ filename: "/bnb_js/.empty", start: 0, end: 20 }, { filename: "/bnb_js/background.js", start: 20, end: 5109 }, { filename: "/bnb_js/console.js", start: 5109, end: 5669 }, { filename: "/bnb_js/global.js", start: 5669, end: 6050 }, { filename: "/bnb_js/legacy.js", start: 6050, end: 10374 }, { filename: "/bnb_js/light_streaks.js", start: 10374, end: 20081 }, { filename: "/bnb_js/prefabs.js", start: 20081, end: 22480 }, { filename: "/bnb_js/timers.js", start: 22480, end: 25799 }, { filename: "/bnb_prefabs/audio/config.js", start: 25799, end: 27211 }, { filename: "/bnb_prefabs/audio/config.json", start: 27211, end: 27281 }, { filename: "/bnb_prefabs/audio/schema.json", start: 27281, end: 27837 }, { filename: "/bnb_prefabs/base/config.json", start: 27837, end: 28505 }, { filename: "/bnb_prefabs/bokeh/config.json", start: 28505, end: 33353 }, { filename: "/bnb_prefabs/bokeh/index.js", start: 33353, end: 33984 }, { filename: "/bnb_prefabs/bokeh/schema.json", start: 33984, end: 34305 }, { filename: "/bnb_prefabs/bokeh/shaders/bg_mask.frag", start: 34305, end: 34642 }, { filename: "/bnb_prefabs/bokeh/shaders/bg_mask.vert", start: 34642, end: 35033 }, { filename: "/bnb_prefabs/bokeh/shaders/bokeh_v.frag", start: 35033, end: 36112 }, { filename: "/bnb_prefabs/bokeh/shaders/bokeh_v.vert", start: 36112, end: 36471 }, { filename: "/bnb_prefabs/bokeh/shaders/combine.frag", start: 36471, end: 36642 }, { filename: "/bnb_prefabs/bokeh/shaders/combine.vert", start: 36642, end: 36907 }, { filename: "/bnb_prefabs/camera/config.json", start: 36907, end: 38577 }, { filename: "/bnb_prefabs/camera/images/ibl_diff.ktx", start: 38577, end: 63221 }, { filename: "/bnb_prefabs/camera/images/ibl_spec.ktx", start: 63221, end: 358205 }, { filename: "/bnb_prefabs/camera/schema.json", start: 358205, end: 358285 }, { filename: "/bnb_prefabs/earrings/config.json", start: 358285, end: 363875 }, { filename: "/bnb_prefabs/earrings/schema.json", start: 363875, end: 370927 }, { filename: "/bnb_prefabs/earrings/script/config.js", start: 370927, end: 378294 }, { filename: "/bnb_prefabs/earrings/shaders/mat_cut.frag", start: 378294, end: 378381 }, { filename: "/bnb_prefabs/earrings/shaders/mat_cut.vert", start: 378381, end: 378968 }, { filename: "/bnb_prefabs/foreground/config.js", start: 378968, end: 381986 }, { filename: "/bnb_prefabs/foreground/config.json", start: 381986, end: 383622 }, { filename: "/bnb_prefabs/foreground/foreground.frag", start: 383622, end: 384141 }, { filename: "/bnb_prefabs/foreground/foreground.vert", start: 384141, end: 385193 }, { filename: "/bnb_prefabs/foreground/null_image.png", start: 385193, end: 385261 }, { filename: "/bnb_prefabs/foreground/schema.json", start: 385261, end: 386800 }, { filename: "/bnb_prefabs/gltf/config.js", start: 386800, end: 390664 }, { filename: "/bnb_prefabs/gltf/config.json", start: 390664, end: 391822 }, { filename: "/bnb_prefabs/gltf/schema.json", start: 391822, end: 396596 }, { filename: "/bnb_prefabs/gltf_base/config.js", start: 396596, end: 396777 }, { filename: "/bnb_prefabs/gltf_base/config.json", start: 396777, end: 400835 }, { filename: "/bnb_prefabs/gltf_base/meshes/cut.bsm2", start: 400835, end: 457112 }, { filename: "/bnb_prefabs/gltf_base/meshes/cut_ears.bsm2", start: 457112, end: 533273 }, { filename: "/bnb_prefabs/gltf_base/shaders/mat_cut.frag", start: 533273, end: 533359 }, { filename: "/bnb_prefabs/gltf_base/shaders/mat_cut.vert", start: 533359, end: 535067 }, { filename: "/bnb_prefabs/hint/config.json", start: 535067, end: 536751 }, { filename: "/bnb_prefabs/hint/font/NotoSans-Regular.ttf", start: 536751, end: 935719 }, { filename: "/bnb_prefabs/hint/meshes/quad.bsm2", start: 935719, end: 935997 }, { filename: "/bnb_prefabs/hint/schema.json", start: 935997, end: 937216 }, { filename: "/bnb_prefabs/hint/scripts/index.js", start: 937216, end: 940339 }, { filename: "/bnb_prefabs/hint/shaders/text.frag", start: 940339, end: 940584 }, { filename: "/bnb_prefabs/hint/shaders/text.vert", start: 940584, end: 940828 }, { filename: "/bnb_prefabs/lights/config.js", start: 940828, end: 942161 }, { filename: "/bnb_prefabs/lights/config.json", start: 942161, end: 942472 }, { filename: "/bnb_prefabs/lights/schema.json", start: 942472, end: 943278 }, { filename: "/bnb_prefabs/lut/config.json", start: 943278, end: 944761 }, { filename: "/bnb_prefabs/lut/schema.json", start: 944761, end: 945206 }, { filename: "/bnb_prefabs/lut/scripts/index.js", start: 945206, end: 946517 }, { filename: "/bnb_prefabs/lut/shaders/lut-filter/lut_filter.frag", start: 946517, end: 946968 }, { filename: "/bnb_prefabs/lut/shaders/lut-filter/lut_filter.vert", start: 946968, end: 947218 }, { filename: "/bnb_prefabs/lut/textures/_null_lut_.png", start: 947218, end: 952176 }, { filename: "/bnb_prefabs/msaa/config.js", start: 952176, end: 952397 }, { filename: "/bnb_prefabs/msaa/config.json", start: 952397, end: 952492 }, { filename: "/bnb_prefabs/msaa/schema.json", start: 952492, end: 953022 }, { filename: "/bnb_prefabs/video_texture/config.js", start: 953022, end: 957792 }, { filename: "/bnb_prefabs/video_texture/config.json", start: 957792, end: 960886 }, { filename: "/bnb_prefabs/video_texture/meshes/quads.glb", start: 960886, end: 962274 }, { filename: "/bnb_prefabs/video_texture/schema.json", start: 962274, end: 964351 }, { filename: "/bnb_prefabs/video_texture/shaders/mat_video_texture.frag", start: 964351, end: 964850 }, { filename: "/bnb_prefabs/video_texture/shaders/mat_video_texture.vert", start: 964850, end: 965658 }, { filename: "/bnb_shaders/.empty", start: 965658, end: 965677 }, { filename: "/bnb_shaders/bnb/anim_transform.glsl", start: 965677, end: 965840 }, { filename: "/bnb_shaders/bnb/color_spaces.glsl", start: 965840, end: 972692 }, { filename: "/bnb_shaders/bnb/decode_int1010102.glsl", start: 972692, end: 973381 }, { filename: "/bnb_shaders/bnb/get_bone.glsl", start: 973381, end: 973803 }, { filename: "/bnb_shaders/bnb/get_transform.glsl", start: 973803, end: 974442 }, { filename: "/bnb_shaders/bnb/glsl.frag", start: 974442, end: 975004 }, { filename: "/bnb_shaders/bnb/glsl.vert", start: 975004, end: 975785 }, { filename: "/bnb_shaders/bnb/guided_filter/ab/guided_ab_h.frag", start: 975785, end: 977610 }, { filename: "/bnb_shaders/bnb/guided_filter/ab/guided_ab_v.frag", start: 977610, end: 980428 }, { filename: "/bnb_shaders/bnb/guided_filter/common.glsl", start: 980428, end: 981241 }, { filename: "/bnb_shaders/bnb/guided_filter/guided_filter.vert", start: 981241, end: 981501 }, { filename: "/bnb_shaders/bnb/guided_filter/mean/guided_mean_ab_h.frag", start: 981501, end: 982249 }, { filename: "/bnb_shaders/bnb/guided_filter/mean/guided_mean_ab_v.frag", start: 982249, end: 983308 }, { filename: "/bnb_shaders/bnb/lib/apply_light_streaks.frag", start: 983308, end: 983648 }, { filename: "/bnb_shaders/bnb/lib/apply_light_streaks.vert", start: 983648, end: 983897 }, { filename: "/bnb_shaders/bnb/lib/auto_morph.frag", start: 983897, end: 984038 }, { filename: "/bnb_shaders/bnb/lib/auto_morph.vert", start: 984038, end: 984650 }, { filename: "/bnb_shaders/bnb/lib/auto_morph_fisheye.frag", start: 984650, end: 984791 }, { filename: "/bnb_shaders/bnb/lib/auto_morph_fisheye.vert", start: 984791, end: 985298 }, { filename: "/bnb_shaders/bnb/lib/beauty_morph.frag", start: 985298, end: 985440 }, { filename: "/bnb_shaders/bnb/lib/beauty_morph.vert", start: 985440, end: 986622 }, { filename: "/bnb_shaders/bnb/lib/bg_blur_downscale.frag", start: 986622, end: 987524 }, { filename: "/bnb_shaders/bnb/lib/bg_blur_downscale.vert", start: 987524, end: 987723 }, { filename: "/bnb_shaders/bnb/lib/bg_blur_upscale.frag", start: 987723, end: 988746 }, { filename: "/bnb_shaders/bnb/lib/bg_blur_upscale.vert", start: 988746, end: 989081 }, { filename: "/bnb_shaders/bnb/lib/bg_blur_upscale_apply.frag", start: 989081, end: 990314 }, { filename: "/bnb_shaders/bnb/lib/camera.frag", start: 990314, end: 990928 }, { filename: "/bnb_shaders/bnb/lib/camera.vert", start: 990928, end: 991212 }, { filename: "/bnb_shaders/bnb/lib/camera_bgmask.frag", start: 991212, end: 992381 }, { filename: "/bnb_shaders/bnb/lib/camera_bgmask.vert", start: 992381, end: 992897 }, { filename: "/bnb_shaders/bnb/lib/copy_pixels.frag", start: 992897, end: 993099 }, { filename: "/bnb_shaders/bnb/lib/copy_pixels.vert", start: 993099, end: 993348 }, { filename: "/bnb_shaders/bnb/lib/filter_light_streaks_0.frag", start: 993348, end: 994362 }, { filename: "/bnb_shaders/bnb/lib/filter_light_streaks_0.vert", start: 994362, end: 994947 }, { filename: "/bnb_shaders/bnb/lib/filter_light_streaks_1.frag", start: 994947, end: 995961 }, { filename: "/bnb_shaders/bnb/lib/filter_light_streaks_1.vert", start: 995961, end: 996546 }, { filename: "/bnb_shaders/bnb/lib/filter_light_streaks_2.frag", start: 996546, end: 997560 }, { filename: "/bnb_shaders/bnb/lib/filter_light_streaks_2.vert", start: 997560, end: 998145 }, { filename: "/bnb_shaders/bnb/lib/filter_light_streaks_3.frag", start: 998145, end: 999159 }, { filename: "/bnb_shaders/bnb/lib/filter_light_streaks_3.vert", start: 999159, end: 999744 }, { filename: "/bnb_shaders/bnb/lib/gltf.frag", start: 999744, end: 1002410 }, { filename: "/bnb_shaders/bnb/lib/gltf.vert", start: 1002410, end: 1004124 }, { filename: "/bnb_shaders/bnb/lib/gltf_physics.vert", start: 1004124, end: 1005726 }, { filename: "/bnb_shaders/bnb/lib/gltf_spec_gloss.frag", start: 1005726, end: 1007472 }, { filename: "/bnb_shaders/bnb/lib/gltf_spec_gloss.vert", start: 1007472, end: 1009186 }, { filename: "/bnb_shaders/bnb/lib/gltf_spec_gloss_physics.vert", start: 1009186, end: 1010788 }, { filename: "/bnb_shaders/bnb/lib/gltf_transmissive.frag", start: 1010788, end: 1012999 }, { filename: "/bnb_shaders/bnb/lib/gltf_transmissive.vert", start: 1012999, end: 1014840 }, { filename: "/bnb_shaders/bnb/lib/gltf_transmissive_physics.vert", start: 1014840, end: 1016569 }, { filename: "/bnb_shaders/bnb/lib/init_light_streaks.frag", start: 1016569, end: 1016927 }, { filename: "/bnb_shaders/bnb/lib/init_light_streaks.vert", start: 1016927, end: 1017176 }, { filename: "/bnb_shaders/bnb/lib/mesh_morph.frag", start: 1017176, end: 1017318 }, { filename: "/bnb_shaders/bnb/lib/mesh_morph.vert", start: 1017318, end: 1019233 }, { filename: "/bnb_shaders/bnb/lib/morph_apply.frag", start: 1019233, end: 1019604 }, { filename: "/bnb_shaders/bnb/lib/morph_apply.vert", start: 1019604, end: 1021786 }, { filename: "/bnb_shaders/bnb/lib/morph_blur.frag", start: 1021786, end: 1023137 }, { filename: "/bnb_shaders/bnb/lib/morph_blur.vert", start: 1023137, end: 1023463 }, { filename: "/bnb_shaders/bnb/lib/pbr_ibl.frag", start: 1023463, end: 1035358 }, { filename: "/bnb_shaders/bnb/lib/pbr_ibl.vert", start: 1035358, end: 1044721 }, { filename: "/bnb_shaders/bnb/lib/pbr_ibl_automorph.frag", start: 1044721, end: 1056616 }, { filename: "/bnb_shaders/bnb/lib/pbr_ibl_automorph.vert", start: 1056616, end: 1067237 }, { filename: "/bnb_shaders/bnb/lib/pbr_ibl_physics.frag", start: 1067237, end: 1079132 }, { filename: "/bnb_shaders/bnb/lib/pbr_ibl_physics.vert", start: 1079132, end: 1088384 }, { filename: "/bnb_shaders/bnb/lib/retouch.frag", start: 1088384, end: 1092104 }, { filename: "/bnb_shaders/bnb/lib/retouch.vert", start: 1092104, end: 1092662 }, { filename: "/bnb_shaders/bnb/lib/static_pos.frag", start: 1092662, end: 1092801 }, { filename: "/bnb_shaders/bnb/lib/static_pos.vert", start: 1092801, end: 1093067 }, { filename: "/bnb_shaders/bnb/lib/uv_morph.frag", start: 1093067, end: 1093208 }, { filename: "/bnb_shaders/bnb/lib/uv_morph.vert", start: 1093208, end: 1093715 }, { filename: "/bnb_shaders/bnb/lib/vbg.frag", start: 1093715, end: 1097052 }, { filename: "/bnb_shaders/bnb/lib/vbg.vert", start: 1097052, end: 1098067 }, { filename: "/bnb_shaders/bnb/lut.glsl", start: 1098067, end: 1102596 }, { filename: "/bnb_shaders/bnb/math.glsl", start: 1102596, end: 1102596 }, { filename: "/bnb_shaders/bnb/matrix_operations.glsl", start: 1102596, end: 1103080 }, { filename: "/bnb_shaders/bnb/mediump.glsl", start: 1103080, end: 1103250 }, { filename: "/bnb_shaders/bnb/morph_transform.glsl", start: 1103250, end: 1104308 }, { filename: "/bnb_shaders/bnb/pbr.glsl", start: 1104308, end: 1108141 }, { filename: "/bnb_shaders/bnb/quat_rotation.glsl", start: 1108141, end: 1109535 }, { filename: "/bnb_shaders/bnb/sample_camera.glsl", start: 1109535, end: 1112944 }, { filename: "/bnb_shaders/bnb/samplers_declaration.glsl", start: 1112944, end: 1115688 }, { filename: "/bnb_shaders/bnb/texture_bicubic.glsl", start: 1115688, end: 1118020 }, { filename: "/bnb_shaders/bnb/textures_lookup.glsl", start: 1118020, end: 1119220 }, { filename: "/bnb_shaders/bnb/transform_camera_uv.glsl", start: 1119220, end: 1120003 }, { filename: "/bnb_shaders/bnb/transform_uv.glsl", start: 1120003, end: 1122591 }, { filename: "/bnb_shaders/bnb/version.glsl", start: 1122591, end: 1122813 }, { filename: "/frx/frx.js", start: 1122813, end: 1125730 }, { filename: "/modules.json", start: 1125730, end: 1140930 }, { filename: "/resources-versions.txt", start: 1140930, end: 1143613 }, { filename: "/watermark.png", start: 1143613, end: 1146099 }, { filename: "/watermark_blurred.png", start: 1146099, end: 1168532 }], remote_package_size: 1168532 });
    })();
    var P = Object.assign({}, l), L = "./this.program", N = (e, t) => {
      throw t;
    }, H = "";
    function re(e) {
      return l.locateFile ? l.locateFile(e, H) : H + e;
    }
    var z, G;
    typeof document < "u" && document.currentScript && (H = document.currentScript.src), r && (H = r), H.startsWith("blob:") ? H = "" : H = H.slice(0, H.replace(/[?#].*/, "").lastIndexOf("/") + 1), z = async (e) => {
      var t = await fetch(e, { credentials: "same-origin" });
      if (t.ok)
        return t.arrayBuffer();
      throw new Error(t.status + " : " + t.url);
    };
    var ve = l.print || console.log.bind(console), ce = l.printErr || console.error.bind(console);
    Object.assign(l, P), P = null, l.thisProgram && (L = l.thisProgram);
    var ue = l.wasmBinary, Q, Ce = !1, Ge;
    function ge(e, t) {
      e || M(t);
    }
    var Fe, he, _e, Me, k, Y, We, Te, De, ye, Ke = !1, et = "data:application/octet-stream;base64,", Oe = (e) => e.startsWith(et);
    function ht() {
      var e = Q.buffer;
      l.HEAP8 = Fe = new Int8Array(e), l.HEAP16 = _e = new Int16Array(e), l.HEAPU8 = he = new Uint8Array(e), l.HEAPU16 = Me = new Uint16Array(e), l.HEAP32 = k = new Int32Array(e), l.HEAPU32 = Y = new Uint32Array(e), l.HEAPF32 = We = new Float32Array(e), l.HEAPF64 = ye = new Float64Array(e), l.HEAP64 = Te = new BigInt64Array(e), l.HEAPU64 = De = new BigUint64Array(e);
    }
    var ne = [], me = [], Ie = [];
    function xt() {
      if (l.preRun)
        for (typeof l.preRun == "function" && (l.preRun = [l.preRun]); l.preRun.length; )
          Dt(l.preRun.shift());
      ri(ne);
    }
    function St() {
      Ke = !0, !l.noFSInit && !y.initialized && y.init(), y.ignorePermissions = !1, ri(me);
    }
    function bt() {
      if (l.postRun)
        for (typeof l.postRun == "function" && (l.postRun = [l.postRun]); l.postRun.length; )
          ft(l.postRun.shift());
      ri(Ie);
    }
    function Dt(e) {
      ne.unshift(e);
    }
    function Tt(e) {
      me.unshift(e);
    }
    function ft(e) {
      Ie.unshift(e);
    }
    var rt = 0, vt = null;
    function mt(e) {
      rt++, l.monitorRunDependencies?.(rt);
    }
    function it(e) {
      if (rt--, l.monitorRunDependencies?.(rt), rt == 0 && vt) {
        var t = vt;
        vt = null, t();
      }
    }
    function M(e) {
      l.onAbort?.(e), e = "Aborted(" + e + ")", ce(e), Ce = !0, e += ". Build with -sASSERTIONS for more info.", Ke && fh();
      var t = new WebAssembly.RuntimeError(e);
      throw w(t), t;
    }
    var U;
    function J() {
      var e = "BanubaSDK.wasm";
      return Oe(e) ? e : re(e);
    }
    function x(e) {
      if (e == U && ue)
        return new Uint8Array(ue);
      throw "both async and sync fetching of the wasm failed";
    }
    async function d(e) {
      if (!ue)
        try {
          var t = await z(e);
          return new Uint8Array(t);
        } catch {
        }
      return x(e);
    }
    async function _(e, t) {
      try {
        var n = await d(e), i = await WebAssembly.instantiate(n, t);
        return i;
      } catch (s) {
        ce(`failed to asynchronously prepare wasm: ${s}`), M(s);
      }
    }
    async function C(e, t, n) {
      if (!e && typeof WebAssembly.instantiateStreaming == "function" && !Oe(t))
        try {
          var i = fetch(t, { credentials: "same-origin" }), s = await WebAssembly.instantiateStreaming(i, n);
          return s;
        } catch (f) {
          ce(`wasm streaming compile failed: ${f}`), ce("falling back to ArrayBuffer instantiation");
        }
      return _(t, n);
    }
    function O() {
      return { env: _o, wasi_snapshot_preview1: _o };
    }
    async function X() {
      function e(f, h) {
        return Ft = f.exports, Q = Ft.memory, ht(), Qa = Ft.__indirect_function_table, Tt(Ft.__wasm_call_ctors), it(), Ft;
      }
      mt();
      function t(f) {
        return e(f.instance);
      }
      var n = O();
      if (l.instantiateWasm)
        try {
          return l.instantiateWasm(n, e);
        } catch (f) {
          ce(`Module.instantiateWasm callback failed with error: ${f}`), w(f);
        }
      U ?? (U = J());
      try {
        var i = await C(ue, U, n), s = t(i);
        return s;
      } catch (f) {
        return w(f), Promise.reject(f);
      }
    }
    function q() {
      return /electron/i.test(navigator.userAgent);
    }
    function we() {
      function e() {
        var s = self.top, f = self.parent, h = [];
        do {
          try {
            h.push(f.location.href);
          } catch {
          }
          f && (f = f.parent);
        } while (f && f !== s);
        return h;
      }
      var t = [self.location.href].concat(Array.from("ancestorOrigins" in self.location ? self.location.ancestorOrigins : e())).map(function(s) {
        return new URL(s.replace(/^blob:/, "")).hostname;
      }).find(function(s) {
        return !!s;
      }), n = xr(t) + 1, i = jt(n);
      return ot(t, i, n), i;
    }
    function Ne(e, t, n) {
      const i = at(e);
      if (!y.analyzePath(i).exists)
        return qe.toHandle(void 0);
      const f = y.readFile(i), h = l.ctx, p = Z.textures[t];
      var E = qe.toValue(n);
      try {
        const A = new Ci(f, (I) => {
          try {
            h.bindTexture(h.TEXTURE_2D, p), h.texImage2D(h.TEXTURE_2D, 0, h.RGBA, h.RGBA, h.UNSIGNED_BYTE, I);
          } catch ($) {
            console.error($);
          } finally {
            h.bindTexture(h.TEXTURE_2D, null), I.close();
          }
        }, E);
        return qe.toHandle(A);
      } catch (A) {
        return console.error(A), qe.toHandle(void 0);
      }
    }
    function S(e, t) {
      if (!self.document)
        return qe.toHandle(void 0);
      const n = at(e), i = y.readFile(n), s = document.createElement("video"), f = URL.createObjectURL(new Blob([i], { type: "video/mp4" })), h = l.proxyVideoRequestsTo;
      s.muted = !0, s.autoplay = !1, s.controls = !1, s.playsInline = !0, s.preload = "auto", s.crossOrigin = "anonymous", s.src = h ? h + encodeURIComponent(f) : f;
      var p = qe.toValue(t);
      return s.onloadeddata = (E) => {
        p(E);
      }, s.load(), qe.toHandle(s);
    }
    function F() {
      return typeof self < "u" && typeof self.document < "u";
    }
    function g(e) {
      if (!self.document) {
        qe.toValue(e).close();
        return;
      }
      const t = qe.toValue(e);
      URL.revokeObjectURL(t.src), t.src = "";
    }
    function u() {
      function e(i) {
        return i.toString(16).padStart(2, "0");
      }
      let t = localStorage.getItem("billing_id");
      if (!t) {
        var n = new Uint8Array(8);
        window.crypto.getRandomValues(n), t = Array.from(n, e).join(""), localStorage.setItem("billing_id", t);
      }
      return vn(t);
    }
    function c() {
      var e = 1;
      try {
        e = self.navigator.hardwareConcurrency;
      } catch {
      }
      return e;
    }
    function T() {
      return l.getRandomValue();
    }
    function D() {
      if (l.getRandomValue === void 0)
        try {
          var e = typeof window == "object" ? window : self, t = typeof e.crypto < "u" ? e.crypto : e.msCrypto, n = function() {
            var f = new Uint32Array(1);
            return t.getRandomValues(f), f[0] >>> 0;
          };
          n(), l.getRandomValue = n;
        } catch {
          try {
            var i = require("crypto"), s = function() {
              var h = i.randomBytes(4);
              return (h[0] << 24 | h[1] << 16 | h[2] << 8 | h[3]) >>> 0;
            };
            s(), l.getRandomValue = s;
          } catch {
            throw "No secure random number generator found";
          }
        }
    }
    var W = (e) => {
      if (e instanceof V || e == "unwind")
        return Ge;
      N(1, e);
    };
    class V {
      constructor(t) {
        te(this, "name", "ExitStatus");
        this.message = `Program terminated with exit(${t})`, this.status = t;
      }
    }
    var Ae = 0, Xe = () => Xl || Ae > 0, Ve = (e) => {
      Ge = e, Xe() || (l.onExit?.(e), Ce = !0), N(e, new V(e));
    }, Ye = (e, t) => {
      Ge = e, Ve(e);
    }, Ue = Ye, vr = () => {
      if (!Xe())
        try {
          Ue(Ge);
        } catch (e) {
          W(e);
        }
    }, nr = (e) => {
      if (!Ce)
        try {
          e(), vr();
        } catch (t) {
          W(t);
        }
    }, qt = (e, t) => setTimeout(() => {
      nr(e);
    }, t), kt = l.preloadPlugins || [], ae = { useWebGL: !1, isFullscreen: !1, pointerLock: !1, moduleContextCreatedCallbacks: [], workers: [], preloadedImages: {}, preloadedAudios: {}, init() {
      if (ae.initted)
        return;
      ae.initted = !0;
      var e = {};
      e.canHandle = function(f) {
        return !l.noImageDecoding && /\.(jpg|jpeg|png|bmp|webp)$/i.test(f);
      }, e.handle = function(f, h, p, E) {
        var A = new Blob([f], { type: ae.getMimetype(h) });
        A.size !== f.length && (A = new Blob([new Uint8Array(f).buffer], { type: ae.getMimetype(h) }));
        var I = URL.createObjectURL(A), $ = new Image();
        $.onload = () => {
          var B = document.createElement("canvas");
          B.width = $.width, B.height = $.height;
          var j = B.getContext("2d");
          j.drawImage($, 0, 0), ae.preloadedImages[h] = B, URL.revokeObjectURL(I), p?.(f);
        }, $.onerror = (B) => {
          ce(`Image ${I} could not be decoded`), E?.();
        }, $.src = I;
      }, kt.push(e);
      var t = {};
      t.canHandle = function(f) {
        return !l.noAudioDecoding && f.slice(-4) in { ".ogg": 1, ".wav": 1, ".mp3": 1 };
      }, t.handle = function(f, h, p, E) {
        var A = !1;
        function I(ee) {
          A || (A = !0, ae.preloadedAudios[h] = ee, p?.(f));
        }
        var $ = new Blob([f], { type: ae.getMimetype(h) }), B = URL.createObjectURL($), j = new Audio();
        j.addEventListener("canplaythrough", () => I(j), !1), j.onerror = function(se) {
          if (A)
            return;
          ce(`warning: browser could not fully decode audio ${h}, trying slower base64 approach`);
          function fe(pe) {
            for (var be = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", de = "=", Ee = "", xe = 0, oe = 0, ke = 0; ke < pe.length; ke++)
              for (xe = xe << 8 | pe[ke], oe += 8; oe >= 6; ) {
                var Qe = xe >> oe - 6 & 63;
                oe -= 6, Ee += be[Qe];
              }
            return oe == 2 ? (Ee += be[(xe & 3) << 4], Ee += de + de) : oe == 4 && (Ee += be[(xe & 15) << 2], Ee += de), Ee;
          }
          j.src = "data:audio/x-" + h.slice(-3) + ";base64," + fe(f), I(j);
        }, j.src = B, qt(() => {
          I(j);
        }, 1e4);
      }, kt.push(t);
      function n() {
        ae.pointerLock = document.pointerLockElement === l.canvas || document.mozPointerLockElement === l.canvas || document.webkitPointerLockElement === l.canvas || document.msPointerLockElement === l.canvas;
      }
      var i = l.canvas;
      i && (i.requestPointerLock = i.requestPointerLock || i.mozRequestPointerLock || i.webkitRequestPointerLock || i.msRequestPointerLock || (() => {
      }), i.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock || document.msExitPointerLock || (() => {
      }), i.exitPointerLock = i.exitPointerLock.bind(document), document.addEventListener("pointerlockchange", n, !1), document.addEventListener("mozpointerlockchange", n, !1), document.addEventListener("webkitpointerlockchange", n, !1), document.addEventListener("mspointerlockchange", n, !1), l.elementPointerLock && i.addEventListener("click", (s) => {
        !ae.pointerLock && l.canvas.requestPointerLock && (l.canvas.requestPointerLock(), s.preventDefault());
      }, !1));
    }, createContext(e, t, n, i) {
      if (t && l.ctx && e == l.canvas)
        return l.ctx;
      var s, f;
      if (t) {
        var h = { antialias: !1, alpha: !1, majorVersion: typeof WebGL2RenderingContext < "u" ? 2 : 1 };
        if (i)
          for (var p in i)
            h[p] = i[p];
        typeof Z < "u" && (f = Z.createContext(e, h), f && (s = Z.getContext(f).GLctx));
      } else
        s = e.getContext("2d");
      return s ? (n && (l.ctx = s, t && Z.makeContextCurrent(f), ae.useWebGL = t, ae.moduleContextCreatedCallbacks.forEach((E) => E()), ae.init()), s) : null;
    }, fullscreenHandlersInstalled: !1, lockPointer: void 0, resizeCanvas: void 0, requestFullscreen(e, t) {
      ae.lockPointer = e, ae.resizeCanvas = t, typeof ae.lockPointer > "u" && (ae.lockPointer = !0), typeof ae.resizeCanvas > "u" && (ae.resizeCanvas = !1);
      var n = l.canvas;
      function i() {
        ae.isFullscreen = !1;
        var f = n.parentNode;
        (document.fullscreenElement || document.mozFullScreenElement || document.msFullscreenElement || document.webkitFullscreenElement || document.webkitCurrentFullScreenElement) === f ? (n.exitFullscreen = ae.exitFullscreen, ae.lockPointer && n.requestPointerLock(), ae.isFullscreen = !0, ae.resizeCanvas ? ae.setFullscreenCanvasSize() : ae.updateCanvasDimensions(n)) : (f.parentNode.insertBefore(n, f), f.parentNode.removeChild(f), ae.resizeCanvas ? ae.setWindowedCanvasSize() : ae.updateCanvasDimensions(n)), l.onFullScreen?.(ae.isFullscreen), l.onFullscreen?.(ae.isFullscreen);
      }
      ae.fullscreenHandlersInstalled || (ae.fullscreenHandlersInstalled = !0, document.addEventListener("fullscreenchange", i, !1), document.addEventListener("mozfullscreenchange", i, !1), document.addEventListener("webkitfullscreenchange", i, !1), document.addEventListener("MSFullscreenChange", i, !1));
      var s = document.createElement("div");
      n.parentNode.insertBefore(s, n), s.appendChild(n), s.requestFullscreen = s.requestFullscreen || s.mozRequestFullScreen || s.msRequestFullscreen || (s.webkitRequestFullscreen ? () => s.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT) : null) || (s.webkitRequestFullScreen ? () => s.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT) : null), s.requestFullscreen();
    }, exitFullscreen() {
      if (!ae.isFullscreen)
        return !1;
      var e = document.exitFullscreen || document.cancelFullScreen || document.mozCancelFullScreen || document.msExitFullscreen || document.webkitCancelFullScreen || (() => {
      });
      return e.apply(document, []), !0;
    }, safeSetTimeout(e, t) {
      return qt(e, t);
    }, getMimetype(e) {
      return { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", bmp: "image/bmp", ogg: "audio/ogg", wav: "audio/wav", mp3: "audio/mpeg" }[e.slice(e.lastIndexOf(".") + 1)];
    }, getUserMedia(e) {
      window.getUserMedia || (window.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia), window.getUserMedia(e);
    }, getMovementX(e) {
      return e.movementX || e.mozMovementX || e.webkitMovementX || 0;
    }, getMovementY(e) {
      return e.movementY || e.mozMovementY || e.webkitMovementY || 0;
    }, getMouseWheelDelta(e) {
      var t = 0;
      switch (e.type) {
        case "DOMMouseScroll":
          t = e.detail / 3;
          break;
        case "mousewheel":
          t = e.wheelDelta / 120;
          break;
        case "wheel":
          switch (t = e.deltaY, e.deltaMode) {
            case 0:
              t /= 100;
              break;
            case 1:
              t /= 3;
              break;
            case 2:
              t *= 80;
              break;
            default:
              throw "unrecognized mouse wheel delta mode: " + e.deltaMode;
          }
          break;
        default:
          throw "unrecognized mouse wheel event: " + e.type;
      }
      return t;
    }, mouseX: 0, mouseY: 0, mouseMovementX: 0, mouseMovementY: 0, touches: {}, lastTouches: {}, calculateMouseCoords(e, t) {
      var n = l.canvas.getBoundingClientRect(), i = l.canvas.width, s = l.canvas.height, f = typeof window.scrollX < "u" ? window.scrollX : window.pageXOffset, h = typeof window.scrollY < "u" ? window.scrollY : window.pageYOffset, p = e - (f + n.left), E = t - (h + n.top);
      return p = p * (i / n.width), E = E * (s / n.height), { x: p, y: E };
    }, setMouseCoords(e, t) {
      const { x: n, y: i } = ae.calculateMouseCoords(e, t);
      ae.mouseMovementX = n - ae.mouseX, ae.mouseMovementY = i - ae.mouseY, ae.mouseX = n, ae.mouseY = i;
    }, calculateMouseEvent(e) {
      if (ae.pointerLock)
        e.type != "mousemove" && "mozMovementX" in e ? ae.mouseMovementX = ae.mouseMovementY = 0 : (ae.mouseMovementX = ae.getMovementX(e), ae.mouseMovementY = ae.getMovementY(e)), ae.mouseX += ae.mouseMovementX, ae.mouseY += ae.mouseMovementY;
      else {
        if (e.type === "touchstart" || e.type === "touchend" || e.type === "touchmove") {
          var t = e.touch;
          if (t === void 0)
            return;
          var n = ae.calculateMouseCoords(t.pageX, t.pageY);
          if (e.type === "touchstart")
            ae.lastTouches[t.identifier] = n, ae.touches[t.identifier] = n;
          else if (e.type === "touchend" || e.type === "touchmove") {
            var i = ae.touches[t.identifier];
            i || (i = n), ae.lastTouches[t.identifier] = i, ae.touches[t.identifier] = n;
          }
          return;
        }
        ae.setMouseCoords(e.pageX, e.pageY);
      }
    }, resizeListeners: [], updateResizeListeners() {
      var e = l.canvas;
      ae.resizeListeners.forEach((t) => t(e.width, e.height));
    }, setCanvasSize(e, t, n) {
      var i = l.canvas;
      ae.updateCanvasDimensions(i, e, t), n || ae.updateResizeListeners();
    }, windowedWidth: 0, windowedHeight: 0, setFullscreenCanvasSize() {
      if (typeof SDL < "u") {
        var e = Y[SDL.screen >> 2];
        e = e | 8388608, k[SDL.screen >> 2] = e;
      }
      ae.updateCanvasDimensions(l.canvas), ae.updateResizeListeners();
    }, setWindowedCanvasSize() {
      if (typeof SDL < "u") {
        var e = Y[SDL.screen >> 2];
        e = e & -8388609, k[SDL.screen >> 2] = e;
      }
      ae.updateCanvasDimensions(l.canvas), ae.updateResizeListeners();
    }, updateCanvasDimensions(e, t, n) {
      t && n ? (e.widthNative = t, e.heightNative = n) : (t = e.widthNative, n = e.heightNative);
      var i = t, s = n;
      if (l.forcedAspectRatio > 0 && (i / s < l.forcedAspectRatio ? i = Math.round(s * l.forcedAspectRatio) : s = Math.round(i / l.forcedAspectRatio)), (document.fullscreenElement || document.mozFullScreenElement || document.msFullscreenElement || document.webkitFullscreenElement || document.webkitCurrentFullScreenElement) === e.parentNode && typeof screen < "u") {
        var f = Math.min(screen.width / i, screen.height / s);
        i = Math.round(i * f), s = Math.round(s * f);
      }
      ae.resizeCanvas ? (e.width != i && (e.width = i), e.height != s && (e.height = s), typeof e.style < "u" && (e.style.removeProperty("width"), e.style.removeProperty("height"))) : (e.width != t && (e.width = t), e.height != n && (e.height = n), typeof e.style < "u" && (i != t || s != n ? (e.style.setProperty("width", i + "px", "important"), e.style.setProperty("height", s + "px", "important")) : (e.style.removeProperty("width"), e.style.removeProperty("height"))));
    } }, ri = (e) => {
      for (; e.length > 0; )
        e.shift()(l);
    }, Xl = l.noExitRuntime || !0, Ze = { isAbs: (e) => e.charAt(0) === "/", splitPath: (e) => {
      var t = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
      return t.exec(e).slice(1);
    }, normalizeArray: (e, t) => {
      for (var n = 0, i = e.length - 1; i >= 0; i--) {
        var s = e[i];
        s === "." ? e.splice(i, 1) : s === ".." ? (e.splice(i, 1), n++) : n && (e.splice(i, 1), n--);
      }
      if (t)
        for (; n; n--)
          e.unshift("..");
      return e;
    }, normalize: (e) => {
      var t = Ze.isAbs(e), n = e.slice(-1) === "/";
      return e = Ze.normalizeArray(e.split("/").filter((i) => !!i), !t).join("/"), !e && !t && (e = "."), e && n && (e += "/"), (t ? "/" : "") + e;
    }, dirname: (e) => {
      var t = Ze.splitPath(e), n = t[0], i = t[1];
      return !n && !i ? "." : (i && (i = i.slice(0, -1)), n + i);
    }, basename: (e) => e && e.match(/([^\/]+|\/)\/*$/)[1], join: (...e) => Ze.normalize(e.join("/")), join2: (e, t) => Ze.normalize(e + "/" + t) }, Yl = () => (e) => crypto.getRandomValues(e), ni = (e) => {
      (ni = Yl())(e);
    }, wr = { resolve: (...e) => {
      for (var t = "", n = !1, i = e.length - 1; i >= -1 && !n; i--) {
        var s = i >= 0 ? e[i] : y.cwd();
        if (typeof s != "string")
          throw new TypeError("Arguments to path.resolve must be strings");
        if (!s)
          return "";
        t = s + "/" + t, n = Ze.isAbs(s);
      }
      return t = Ze.normalizeArray(t.split("/").filter((f) => !!f), !n).join("/"), (n ? "/" : "") + t || ".";
    }, relative: (e, t) => {
      e = wr.resolve(e).slice(1), t = wr.resolve(t).slice(1);
      function n(A) {
        for (var I = 0; I < A.length && A[I] === ""; I++)
          ;
        for (var $ = A.length - 1; $ >= 0 && A[$] === ""; $--)
          ;
        return I > $ ? [] : A.slice(I, $ - I + 1);
      }
      for (var i = n(e.split("/")), s = n(t.split("/")), f = Math.min(i.length, s.length), h = f, p = 0; p < f; p++)
        if (i[p] !== s[p]) {
          h = p;
          break;
        }
      for (var E = [], p = h; p < i.length; p++)
        E.push("..");
      return E = E.concat(s.slice(h)), E.join("/");
    } }, Oa = typeof TextDecoder < "u" ? new TextDecoder() : void 0, Er = (e, t = 0, n = NaN) => {
      for (var i = t + n, s = t; e[s] && !(s >= i); )
        ++s;
      if (s - t > 16 && e.buffer && Oa)
        return Oa.decode(e.subarray(t, s));
      for (var f = ""; t < s; ) {
        var h = e[t++];
        if (!(h & 128)) {
          f += String.fromCharCode(h);
          continue;
        }
        var p = e[t++] & 63;
        if ((h & 224) == 192) {
          f += String.fromCharCode((h & 31) << 6 | p);
          continue;
        }
        var E = e[t++] & 63;
        if ((h & 240) == 224 ? h = (h & 15) << 12 | p << 6 | E : h = (h & 7) << 18 | p << 12 | E << 6 | e[t++] & 63, h < 65536)
          f += String.fromCharCode(h);
        else {
          var A = h - 65536;
          f += String.fromCharCode(55296 | A >> 10, 56320 | A & 1023);
        }
      }
      return f;
    }, ii = [], xr = (e) => {
      for (var t = 0, n = 0; n < e.length; ++n) {
        var i = e.charCodeAt(n);
        i <= 127 ? t++ : i <= 2047 ? t += 2 : i >= 55296 && i <= 57343 ? (t += 4, ++n) : t += 3;
      }
      return t;
    }, ai = (e, t, n, i) => {
      if (!(i > 0))
        return 0;
      for (var s = n, f = n + i - 1, h = 0; h < e.length; ++h) {
        var p = e.charCodeAt(h);
        if (p >= 55296 && p <= 57343) {
          var E = e.charCodeAt(++h);
          p = 65536 + ((p & 1023) << 10) | E & 1023;
        }
        if (p <= 127) {
          if (n >= f)
            break;
          t[n++] = p;
        } else if (p <= 2047) {
          if (n + 1 >= f)
            break;
          t[n++] = 192 | p >> 6, t[n++] = 128 | p & 63;
        } else if (p <= 65535) {
          if (n + 2 >= f)
            break;
          t[n++] = 224 | p >> 12, t[n++] = 128 | p >> 6 & 63, t[n++] = 128 | p & 63;
        } else {
          if (n + 3 >= f)
            break;
          t[n++] = 240 | p >> 18, t[n++] = 128 | p >> 12 & 63, t[n++] = 128 | p >> 6 & 63, t[n++] = 128 | p & 63;
        }
      }
      return t[n] = 0, n - s;
    }, Na = (e, t, n) => {
      var i = n > 0 ? n : xr(e) + 1, s = new Array(i), f = ai(e, s, 0, s.length);
      return t && (s.length = f), s;
    }, Zl = () => {
      if (!ii.length) {
        var e = null;
        if (typeof window < "u" && typeof window.prompt == "function" && (e = window.prompt("Input: "), e !== null && (e += `
`)), !e)
          return null;
        ii = Na(e, !0);
      }
      return ii.shift();
    }, ir = { ttys: [], init() {
    }, shutdown() {
    }, register(e, t) {
      ir.ttys[e] = { input: [], output: [], ops: t }, y.registerDevice(e, ir.stream_ops);
    }, stream_ops: { open(e) {
      var t = ir.ttys[e.node.rdev];
      if (!t)
        throw new y.ErrnoError(43);
      e.tty = t, e.seekable = !1;
    }, close(e) {
      e.tty.ops.fsync(e.tty);
    }, fsync(e) {
      e.tty.ops.fsync(e.tty);
    }, read(e, t, n, i, s) {
      if (!e.tty || !e.tty.ops.get_char)
        throw new y.ErrnoError(60);
      for (var f = 0, h = 0; h < i; h++) {
        var p;
        try {
          p = e.tty.ops.get_char(e.tty);
        } catch {
          throw new y.ErrnoError(29);
        }
        if (p === void 0 && f === 0)
          throw new y.ErrnoError(6);
        if (p == null)
          break;
        f++, t[n + h] = p;
      }
      return f && (e.node.atime = Date.now()), f;
    }, write(e, t, n, i, s) {
      if (!e.tty || !e.tty.ops.put_char)
        throw new y.ErrnoError(60);
      try {
        for (var f = 0; f < i; f++)
          e.tty.ops.put_char(e.tty, t[n + f]);
      } catch {
        throw new y.ErrnoError(29);
      }
      return i && (e.node.mtime = e.node.ctime = Date.now()), f;
    } }, default_tty_ops: { get_char(e) {
      return Zl();
    }, put_char(e, t) {
      t === null || t === 10 ? (ve(Er(e.output)), e.output = []) : t != 0 && e.output.push(t);
    }, fsync(e) {
      e.output?.length > 0 && (ve(Er(e.output)), e.output = []);
    }, ioctl_tcgets(e) {
      return { c_iflag: 25856, c_oflag: 5, c_cflag: 191, c_lflag: 35387, c_cc: [3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] };
    }, ioctl_tcsets(e, t, n) {
      return 0;
    }, ioctl_tiocgwinsz(e) {
      return [24, 80];
    } }, default_tty1_ops: { put_char(e, t) {
      t === null || t === 10 ? (ce(Er(e.output)), e.output = []) : t != 0 && e.output.push(t);
    }, fsync(e) {
      e.output?.length > 0 && (ce(Er(e.output)), e.output = []);
    } } }, oi = (e, t) => {
      he.fill(0, e, e + t);
    }, Ua = (e, t) => Math.ceil(e / t) * t, $a = (e) => {
      e = Ua(e, 65536);
      var t = lh(65536, e);
      return t && oi(t, e), t;
    }, Se = { ops_table: null, mount(e) {
      return Se.createNode(null, "/", 16895, 0);
    }, createNode(e, t, n, i) {
      if (y.isBlkdev(n) || y.isFIFO(n))
        throw new y.ErrnoError(63);
      Se.ops_table || (Se.ops_table = { dir: { node: { getattr: Se.node_ops.getattr, setattr: Se.node_ops.setattr, lookup: Se.node_ops.lookup, mknod: Se.node_ops.mknod, rename: Se.node_ops.rename, unlink: Se.node_ops.unlink, rmdir: Se.node_ops.rmdir, readdir: Se.node_ops.readdir, symlink: Se.node_ops.symlink }, stream: { llseek: Se.stream_ops.llseek } }, file: { node: { getattr: Se.node_ops.getattr, setattr: Se.node_ops.setattr }, stream: { llseek: Se.stream_ops.llseek, read: Se.stream_ops.read, write: Se.stream_ops.write, allocate: Se.stream_ops.allocate, mmap: Se.stream_ops.mmap, msync: Se.stream_ops.msync } }, link: { node: { getattr: Se.node_ops.getattr, setattr: Se.node_ops.setattr, readlink: Se.node_ops.readlink }, stream: {} }, chrdev: { node: { getattr: Se.node_ops.getattr, setattr: Se.node_ops.setattr }, stream: y.chrdev_stream_ops } });
      var s = y.createNode(e, t, n, i);
      return y.isDir(s.mode) ? (s.node_ops = Se.ops_table.dir.node, s.stream_ops = Se.ops_table.dir.stream, s.contents = {}) : y.isFile(s.mode) ? (s.node_ops = Se.ops_table.file.node, s.stream_ops = Se.ops_table.file.stream, s.usedBytes = 0, s.contents = null) : y.isLink(s.mode) ? (s.node_ops = Se.ops_table.link.node, s.stream_ops = Se.ops_table.link.stream) : y.isChrdev(s.mode) && (s.node_ops = Se.ops_table.chrdev.node, s.stream_ops = Se.ops_table.chrdev.stream), s.atime = s.mtime = s.ctime = Date.now(), e && (e.contents[t] = s, e.atime = e.mtime = e.ctime = s.atime), s;
    }, getFileDataAsTypedArray(e) {
      return e.contents ? e.contents.subarray ? e.contents.subarray(0, e.usedBytes) : new Uint8Array(e.contents) : new Uint8Array(0);
    }, expandFileStorage(e, t) {
      var n = e.contents ? e.contents.length : 0;
      if (!(n >= t)) {
        var i = 1024 * 1024;
        t = Math.max(t, n * (n < i ? 2 : 1.125) >>> 0), n != 0 && (t = Math.max(t, 256));
        var s = e.contents;
        e.contents = new Uint8Array(t), e.usedBytes > 0 && e.contents.set(s.subarray(0, e.usedBytes), 0);
      }
    }, resizeFileStorage(e, t) {
      if (e.usedBytes != t)
        if (t == 0)
          e.contents = null, e.usedBytes = 0;
        else {
          var n = e.contents;
          e.contents = new Uint8Array(t), n && e.contents.set(n.subarray(0, Math.min(t, e.usedBytes))), e.usedBytes = t;
        }
    }, node_ops: { getattr(e) {
      var t = {};
      return t.dev = y.isChrdev(e.mode) ? e.id : 1, t.ino = e.id, t.mode = e.mode, t.nlink = 1, t.uid = 0, t.gid = 0, t.rdev = e.rdev, y.isDir(e.mode) ? t.size = 4096 : y.isFile(e.mode) ? t.size = e.usedBytes : y.isLink(e.mode) ? t.size = e.link.length : t.size = 0, t.atime = new Date(e.atime), t.mtime = new Date(e.mtime), t.ctime = new Date(e.ctime), t.blksize = 4096, t.blocks = Math.ceil(t.size / t.blksize), t;
    }, setattr(e, t) {
      for (const n of ["mode", "atime", "mtime", "ctime"])
        t[n] != null && (e[n] = t[n]);
      t.size !== void 0 && Se.resizeFileStorage(e, t.size);
    }, lookup(e, t) {
      throw Se.doesNotExistError;
    }, mknod(e, t, n, i) {
      return Se.createNode(e, t, n, i);
    }, rename(e, t, n) {
      var i;
      try {
        i = y.lookupNode(t, n);
      } catch {
      }
      if (i) {
        if (y.isDir(e.mode))
          for (var s in i.contents)
            throw new y.ErrnoError(55);
        y.hashRemoveNode(i);
      }
      delete e.parent.contents[e.name], t.contents[n] = e, e.name = n, t.ctime = t.mtime = e.parent.ctime = e.parent.mtime = Date.now();
    }, unlink(e, t) {
      delete e.contents[t], e.ctime = e.mtime = Date.now();
    }, rmdir(e, t) {
      var n = y.lookupNode(e, t);
      for (var i in n.contents)
        throw new y.ErrnoError(55);
      delete e.contents[t], e.ctime = e.mtime = Date.now();
    }, readdir(e) {
      return [".", "..", ...Object.keys(e.contents)];
    }, symlink(e, t, n) {
      var i = Se.createNode(e, t, 41471, 0);
      return i.link = n, i;
    }, readlink(e) {
      if (!y.isLink(e.mode))
        throw new y.ErrnoError(28);
      return e.link;
    } }, stream_ops: { read(e, t, n, i, s) {
      var f = e.node.contents;
      if (s >= e.node.usedBytes)
        return 0;
      var h = Math.min(e.node.usedBytes - s, i);
      if (h > 8 && f.subarray)
        t.set(f.subarray(s, s + h), n);
      else
        for (var p = 0; p < h; p++)
          t[n + p] = f[s + p];
      return h;
    }, write(e, t, n, i, s, f) {
      if (t.buffer === Fe.buffer && (f = !1), !i)
        return 0;
      var h = e.node;
      if (h.mtime = h.ctime = Date.now(), t.subarray && (!h.contents || h.contents.subarray)) {
        if (f)
          return h.contents = t.subarray(n, n + i), h.usedBytes = i, i;
        if (h.usedBytes === 0 && s === 0)
          return h.contents = t.slice(n, n + i), h.usedBytes = i, i;
        if (s + i <= h.usedBytes)
          return h.contents.set(t.subarray(n, n + i), s), i;
      }
      if (Se.expandFileStorage(h, s + i), h.contents.subarray && t.subarray)
        h.contents.set(t.subarray(n, n + i), s);
      else
        for (var p = 0; p < i; p++)
          h.contents[s + p] = t[n + p];
      return h.usedBytes = Math.max(h.usedBytes, s + i), i;
    }, llseek(e, t, n) {
      var i = t;
      if (n === 1 ? i += e.position : n === 2 && y.isFile(e.node.mode) && (i += e.node.usedBytes), i < 0)
        throw new y.ErrnoError(28);
      return i;
    }, allocate(e, t, n) {
      Se.expandFileStorage(e.node, t + n), e.node.usedBytes = Math.max(e.node.usedBytes, t + n);
    }, mmap(e, t, n, i, s) {
      if (!y.isFile(e.node.mode))
        throw new y.ErrnoError(43);
      var f, h, p = e.node.contents;
      if (!(s & 2) && p && p.buffer === Fe.buffer)
        h = !1, f = p.byteOffset;
      else {
        if (h = !0, f = $a(t), !f)
          throw new y.ErrnoError(48);
        p && ((n > 0 || n + t < p.length) && (p.subarray ? p = p.subarray(n, n + t) : p = Array.prototype.slice.call(p, n, n + t)), Fe.set(p, f));
      }
      return { ptr: f, allocated: h };
    }, msync(e, t, n, i, s) {
      return Se.stream_ops.write(e, t, 0, i, n, !1), 0;
    } } }, ql = async (e) => {
      var t = await z(e);
      return new Uint8Array(t);
    }, Wa = (e, t, n, i, s, f) => {
      y.createDataFile(e, t, n, i, s, f);
    }, Ql = (e, t, n, i) => {
      typeof ae < "u" && ae.init();
      var s = !1;
      return kt.forEach((f) => {
        s || f.canHandle(t) && (f.handle(e, t, n, i), s = !0);
      }), s;
    }, ja = (e, t, n, i, s, f, h, p, E, A) => {
      var I = t ? wr.resolve(Ze.join2(e, t)) : e;
      function $(B) {
        function j(ee) {
          A?.(), p || Wa(e, t, ee, i, s, E), f?.(), it();
        }
        Ql(B, I, j, () => {
          h?.(), it();
        }) || j(B);
      }
      mt(), typeof n == "string" ? ql(n).then($, h) : $(n);
    }, Jl = (e) => {
      var t = { r: 0, "r+": 2, w: 577, "w+": 578, a: 1089, "a+": 1090 }, n = t[e];
      if (typeof n > "u")
        throw new Error(`Unknown file open mode: ${e}`);
      return n;
    }, si = (e, t) => {
      var n = 0;
      return e && (n |= 365), t && (n |= 146), n;
    }, y = { root: null, mounts: [], devices: {}, streams: [], nextInode: 1, nameTable: null, currentPath: "/", initialized: !1, ignorePermissions: !0, ErrnoError: class {
      constructor(e) {
        te(this, "name", "ErrnoError");
        this.errno = e;
      }
    }, filesystems: null, syncFSRequests: 0, readFiles: {}, FSStream: class {
      constructor() {
        te(this, "shared", {});
      }
      get object() {
        return this.node;
      }
      set object(e) {
        this.node = e;
      }
      get isRead() {
        return (this.flags & 2097155) !== 1;
      }
      get isWrite() {
        return (this.flags & 2097155) !== 0;
      }
      get isAppend() {
        return this.flags & 1024;
      }
      get flags() {
        return this.shared.flags;
      }
      set flags(e) {
        this.shared.flags = e;
      }
      get position() {
        return this.shared.position;
      }
      set position(e) {
        this.shared.position = e;
      }
    }, FSNode: class {
      constructor(e, t, n, i) {
        te(this, "node_ops", {});
        te(this, "stream_ops", {});
        te(this, "readMode", 365);
        te(this, "writeMode", 146);
        te(this, "mounted", null);
        e || (e = this), this.parent = e, this.mount = e.mount, this.id = y.nextInode++, this.name = t, this.mode = n, this.rdev = i, this.atime = this.mtime = this.ctime = Date.now();
      }
      get read() {
        return (this.mode & this.readMode) === this.readMode;
      }
      set read(e) {
        e ? this.mode |= this.readMode : this.mode &= ~this.readMode;
      }
      get write() {
        return (this.mode & this.writeMode) === this.writeMode;
      }
      set write(e) {
        e ? this.mode |= this.writeMode : this.mode &= ~this.writeMode;
      }
      get isFolder() {
        return y.isDir(this.mode);
      }
      get isDevice() {
        return y.isChrdev(this.mode);
      }
    }, lookupPath(e, t = {}) {
      if (!e)
        throw new y.ErrnoError(44);
      t.follow_mount ?? (t.follow_mount = !0), Ze.isAbs(e) || (e = y.cwd() + "/" + e);
      e:
        for (var n = 0; n < 40; n++) {
          for (var i = e.split("/").filter((A) => !!A), s = y.root, f = "/", h = 0; h < i.length; h++) {
            var p = h === i.length - 1;
            if (p && t.parent)
              break;
            if (i[h] !== ".") {
              if (i[h] === "..") {
                f = Ze.dirname(f), s = s.parent;
                continue;
              }
              f = Ze.join2(f, i[h]);
              try {
                s = y.lookupNode(s, i[h]);
              } catch (A) {
                if (A?.errno === 44 && p && t.noent_okay)
                  return { path: f };
                throw A;
              }
              if (y.isMountpoint(s) && (!p || t.follow_mount) && (s = s.mounted.root), y.isLink(s.mode) && (!p || t.follow)) {
                if (!s.node_ops.readlink)
                  throw new y.ErrnoError(52);
                var E = s.node_ops.readlink(s);
                Ze.isAbs(E) || (E = Ze.dirname(f) + "/" + E), e = E + "/" + i.slice(h + 1).join("/");
                continue e;
              }
            }
          }
          return { path: f, node: s };
        }
      throw new y.ErrnoError(32);
    }, getPath(e) {
      for (var t; ; ) {
        if (y.isRoot(e)) {
          var n = e.mount.mountpoint;
          return t ? n[n.length - 1] !== "/" ? `${n}/${t}` : n + t : n;
        }
        t = t ? `${e.name}/${t}` : e.name, e = e.parent;
      }
    }, hashName(e, t) {
      for (var n = 0, i = 0; i < t.length; i++)
        n = (n << 5) - n + t.charCodeAt(i) | 0;
      return (e + n >>> 0) % y.nameTable.length;
    }, hashAddNode(e) {
      var t = y.hashName(e.parent.id, e.name);
      e.name_next = y.nameTable[t], y.nameTable[t] = e;
    }, hashRemoveNode(e) {
      var t = y.hashName(e.parent.id, e.name);
      if (y.nameTable[t] === e)
        y.nameTable[t] = e.name_next;
      else
        for (var n = y.nameTable[t]; n; ) {
          if (n.name_next === e) {
            n.name_next = e.name_next;
            break;
          }
          n = n.name_next;
        }
    }, lookupNode(e, t) {
      var n = y.mayLookup(e);
      if (n)
        throw new y.ErrnoError(n);
      for (var i = y.hashName(e.id, t), s = y.nameTable[i]; s; s = s.name_next) {
        var f = s.name;
        if (s.parent.id === e.id && f === t)
          return s;
      }
      return y.lookup(e, t);
    }, createNode(e, t, n, i) {
      var s = new y.FSNode(e, t, n, i);
      return y.hashAddNode(s), s;
    }, destroyNode(e) {
      y.hashRemoveNode(e);
    }, isRoot(e) {
      return e === e.parent;
    }, isMountpoint(e) {
      return !!e.mounted;
    }, isFile(e) {
      return (e & 61440) === 32768;
    }, isDir(e) {
      return (e & 61440) === 16384;
    }, isLink(e) {
      return (e & 61440) === 40960;
    }, isChrdev(e) {
      return (e & 61440) === 8192;
    }, isBlkdev(e) {
      return (e & 61440) === 24576;
    }, isFIFO(e) {
      return (e & 61440) === 4096;
    }, isSocket(e) {
      return (e & 49152) === 49152;
    }, flagsToPermissionString(e) {
      var t = ["r", "w", "rw"][e & 3];
      return e & 512 && (t += "w"), t;
    }, nodePermissions(e, t) {
      return y.ignorePermissions ? 0 : t.includes("r") && !(e.mode & 292) || t.includes("w") && !(e.mode & 146) || t.includes("x") && !(e.mode & 73) ? 2 : 0;
    }, mayLookup(e) {
      if (!y.isDir(e.mode))
        return 54;
      var t = y.nodePermissions(e, "x");
      return t || (e.node_ops.lookup ? 0 : 2);
    }, mayCreate(e, t) {
      if (!y.isDir(e.mode))
        return 54;
      try {
        return y.lookupNode(e, t), 20;
      } catch {
      }
      return y.nodePermissions(e, "wx");
    }, mayDelete(e, t, n) {
      var i;
      try {
        i = y.lookupNode(e, t);
      } catch (f) {
        return f.errno;
      }
      var s = y.nodePermissions(e, "wx");
      if (s)
        return s;
      if (n) {
        if (!y.isDir(i.mode))
          return 54;
        if (y.isRoot(i) || y.getPath(i) === y.cwd())
          return 10;
      } else if (y.isDir(i.mode))
        return 31;
      return 0;
    }, mayOpen(e, t) {
      return e ? y.isLink(e.mode) ? 32 : y.isDir(e.mode) && (y.flagsToPermissionString(t) !== "r" || t & 576) ? 31 : y.nodePermissions(e, y.flagsToPermissionString(t)) : 44;
    }, checkOpExists(e, t) {
      if (!e)
        throw new y.ErrnoError(t);
      return e;
    }, MAX_OPEN_FDS: 4096, nextfd() {
      for (var e = 0; e <= y.MAX_OPEN_FDS; e++)
        if (!y.streams[e])
          return e;
      throw new y.ErrnoError(33);
    }, getStreamChecked(e) {
      var t = y.getStream(e);
      if (!t)
        throw new y.ErrnoError(8);
      return t;
    }, getStream: (e) => y.streams[e], createStream(e, t = -1) {
      return e = Object.assign(new y.FSStream(), e), t == -1 && (t = y.nextfd()), e.fd = t, y.streams[t] = e, e;
    }, closeStream(e) {
      y.streams[e] = null;
    }, dupStream(e, t = -1) {
      var n = y.createStream(e, t);
      return n.stream_ops?.dup?.(n), n;
    }, doSetAttr(e, t, n) {
      var i = e?.stream_ops.setattr, s = i ? e : t;
      i ?? (i = t.node_ops.setattr), y.checkOpExists(i, 63), i(s, n);
    }, chrdev_stream_ops: { open(e) {
      var t = y.getDevice(e.node.rdev);
      e.stream_ops = t.stream_ops, e.stream_ops.open?.(e);
    }, llseek() {
      throw new y.ErrnoError(70);
    } }, major: (e) => e >> 8, minor: (e) => e & 255, makedev: (e, t) => e << 8 | t, registerDevice(e, t) {
      y.devices[e] = { stream_ops: t };
    }, getDevice: (e) => y.devices[e], getMounts(e) {
      for (var t = [], n = [e]; n.length; ) {
        var i = n.pop();
        t.push(i), n.push(...i.mounts);
      }
      return t;
    }, syncfs(e, t) {
      typeof e == "function" && (t = e, e = !1), y.syncFSRequests++, y.syncFSRequests > 1 && ce(`warning: ${y.syncFSRequests} FS.syncfs operations in flight at once, probably just doing extra work`);
      var n = y.getMounts(y.root.mount), i = 0;
      function s(h) {
        return y.syncFSRequests--, t(h);
      }
      function f(h) {
        if (h)
          return f.errored ? void 0 : (f.errored = !0, s(h));
        ++i >= n.length && s(null);
      }
      n.forEach((h) => {
        if (!h.type.syncfs)
          return f(null);
        h.type.syncfs(h, e, f);
      });
    }, mount(e, t, n) {
      var i = n === "/", s = !n, f;
      if (i && y.root)
        throw new y.ErrnoError(10);
      if (!i && !s) {
        var h = y.lookupPath(n, { follow_mount: !1 });
        if (n = h.path, f = h.node, y.isMountpoint(f))
          throw new y.ErrnoError(10);
        if (!y.isDir(f.mode))
          throw new y.ErrnoError(54);
      }
      var p = { type: e, opts: t, mountpoint: n, mounts: [] }, E = e.mount(p);
      return E.mount = p, p.root = E, i ? y.root = E : f && (f.mounted = p, f.mount && f.mount.mounts.push(p)), E;
    }, unmount(e) {
      var t = y.lookupPath(e, { follow_mount: !1 });
      if (!y.isMountpoint(t.node))
        throw new y.ErrnoError(28);
      var n = t.node, i = n.mounted, s = y.getMounts(i);
      Object.keys(y.nameTable).forEach((h) => {
        for (var p = y.nameTable[h]; p; ) {
          var E = p.name_next;
          s.includes(p.mount) && y.destroyNode(p), p = E;
        }
      }), n.mounted = null;
      var f = n.mount.mounts.indexOf(i);
      n.mount.mounts.splice(f, 1);
    }, lookup(e, t) {
      return e.node_ops.lookup(e, t);
    }, mknod(e, t, n) {
      var i = y.lookupPath(e, { parent: !0 }), s = i.node, f = Ze.basename(e);
      if (!f)
        throw new y.ErrnoError(28);
      if (f === "." || f === "..")
        throw new y.ErrnoError(20);
      var h = y.mayCreate(s, f);
      if (h)
        throw new y.ErrnoError(h);
      if (!s.node_ops.mknod)
        throw new y.ErrnoError(63);
      return s.node_ops.mknod(s, f, t, n);
    }, statfs(e) {
      return y.statfsNode(y.lookupPath(e, { follow: !0 }).node);
    }, statfsStream(e) {
      return y.statfsNode(e.node);
    }, statfsNode(e) {
      var t = { bsize: 4096, frsize: 4096, blocks: 1e6, bfree: 5e5, bavail: 5e5, files: y.nextInode, ffree: y.nextInode - 1, fsid: 42, flags: 2, namelen: 255 };
      return e.node_ops.statfs && Object.assign(t, e.node_ops.statfs(e.mount.opts.root)), t;
    }, create(e, t = 438) {
      return t &= 4095, t |= 32768, y.mknod(e, t, 0);
    }, mkdir(e, t = 511) {
      return t &= 1023, t |= 16384, y.mknod(e, t, 0);
    }, mkdirTree(e, t) {
      for (var n = e.split("/"), i = "", s = 0; s < n.length; ++s)
        if (n[s]) {
          i += "/" + n[s];
          try {
            y.mkdir(i, t);
          } catch (f) {
            if (f.errno != 20)
              throw f;
          }
        }
    }, mkdev(e, t, n) {
      return typeof n > "u" && (n = t, t = 438), t |= 8192, y.mknod(e, t, n);
    }, symlink(e, t) {
      if (!wr.resolve(e))
        throw new y.ErrnoError(44);
      var n = y.lookupPath(t, { parent: !0 }), i = n.node;
      if (!i)
        throw new y.ErrnoError(44);
      var s = Ze.basename(t), f = y.mayCreate(i, s);
      if (f)
        throw new y.ErrnoError(f);
      if (!i.node_ops.symlink)
        throw new y.ErrnoError(63);
      return i.node_ops.symlink(i, s, e);
    }, rename(e, t) {
      var n = Ze.dirname(e), i = Ze.dirname(t), s = Ze.basename(e), f = Ze.basename(t), h, p, E;
      if (h = y.lookupPath(e, { parent: !0 }), p = h.node, h = y.lookupPath(t, { parent: !0 }), E = h.node, !p || !E)
        throw new y.ErrnoError(44);
      if (p.mount !== E.mount)
        throw new y.ErrnoError(75);
      var A = y.lookupNode(p, s), I = wr.relative(e, i);
      if (I.charAt(0) !== ".")
        throw new y.ErrnoError(28);
      if (I = wr.relative(t, n), I.charAt(0) !== ".")
        throw new y.ErrnoError(55);
      var $;
      try {
        $ = y.lookupNode(E, f);
      } catch {
      }
      if (A !== $) {
        var B = y.isDir(A.mode), j = y.mayDelete(p, s, B);
        if (j)
          throw new y.ErrnoError(j);
        if (j = $ ? y.mayDelete(E, f, B) : y.mayCreate(E, f), j)
          throw new y.ErrnoError(j);
        if (!p.node_ops.rename)
          throw new y.ErrnoError(63);
        if (y.isMountpoint(A) || $ && y.isMountpoint($))
          throw new y.ErrnoError(10);
        if (E !== p && (j = y.nodePermissions(p, "w"), j))
          throw new y.ErrnoError(j);
        y.hashRemoveNode(A);
        try {
          p.node_ops.rename(A, E, f), A.parent = E;
        } catch (ee) {
          throw ee;
        } finally {
          y.hashAddNode(A);
        }
      }
    }, rmdir(e) {
      var t = y.lookupPath(e, { parent: !0 }), n = t.node, i = Ze.basename(e), s = y.lookupNode(n, i), f = y.mayDelete(n, i, !0);
      if (f)
        throw new y.ErrnoError(f);
      if (!n.node_ops.rmdir)
        throw new y.ErrnoError(63);
      if (y.isMountpoint(s))
        throw new y.ErrnoError(10);
      n.node_ops.rmdir(n, i), y.destroyNode(s);
    }, readdir(e) {
      var t = y.lookupPath(e, { follow: !0 }), n = t.node, i = y.checkOpExists(n.node_ops.readdir, 54);
      return i(n);
    }, unlink(e) {
      var t = y.lookupPath(e, { parent: !0 }), n = t.node;
      if (!n)
        throw new y.ErrnoError(44);
      var i = Ze.basename(e), s = y.lookupNode(n, i), f = y.mayDelete(n, i, !1);
      if (f)
        throw new y.ErrnoError(f);
      if (!n.node_ops.unlink)
        throw new y.ErrnoError(63);
      if (y.isMountpoint(s))
        throw new y.ErrnoError(10);
      n.node_ops.unlink(n, i), y.destroyNode(s);
    }, readlink(e) {
      var t = y.lookupPath(e), n = t.node;
      if (!n)
        throw new y.ErrnoError(44);
      if (!n.node_ops.readlink)
        throw new y.ErrnoError(28);
      return n.node_ops.readlink(n);
    }, stat(e, t) {
      var n = y.lookupPath(e, { follow: !t }), i = n.node, s = y.checkOpExists(i.node_ops.getattr, 63);
      return s(i);
    }, fstat(e) {
      var t = y.getStreamChecked(e), n = t.node, i = t.stream_ops.getattr, s = i ? t : n;
      return i ?? (i = n.node_ops.getattr), y.checkOpExists(i, 63), i(s);
    }, lstat(e) {
      return y.stat(e, !0);
    }, doChmod(e, t, n, i) {
      y.doSetAttr(e, t, { mode: n & 4095 | t.mode & -4096, ctime: Date.now(), dontFollow: i });
    }, chmod(e, t, n) {
      var i;
      if (typeof e == "string") {
        var s = y.lookupPath(e, { follow: !n });
        i = s.node;
      } else
        i = e;
      y.doChmod(null, i, t, n);
    }, lchmod(e, t) {
      y.chmod(e, t, !0);
    }, fchmod(e, t) {
      var n = y.getStreamChecked(e);
      y.doChmod(n, n.node, t, !1);
    }, doChown(e, t, n) {
      y.doSetAttr(e, t, { timestamp: Date.now(), dontFollow: n });
    }, chown(e, t, n, i) {
      var s;
      if (typeof e == "string") {
        var f = y.lookupPath(e, { follow: !i });
        s = f.node;
      } else
        s = e;
      y.doChown(null, s, i);
    }, lchown(e, t, n) {
      y.chown(e, t, n, !0);
    }, fchown(e, t, n) {
      var i = y.getStreamChecked(e);
      y.doChown(i, i.node, !1);
    }, doTruncate(e, t, n) {
      if (y.isDir(t.mode))
        throw new y.ErrnoError(31);
      if (!y.isFile(t.mode))
        throw new y.ErrnoError(28);
      var i = y.nodePermissions(t, "w");
      if (i)
        throw new y.ErrnoError(i);
      y.doSetAttr(e, t, { size: n, timestamp: Date.now() });
    }, truncate(e, t) {
      if (t < 0)
        throw new y.ErrnoError(28);
      var n;
      if (typeof e == "string") {
        var i = y.lookupPath(e, { follow: !0 });
        n = i.node;
      } else
        n = e;
      y.doTruncate(null, n, t);
    }, ftruncate(e, t) {
      var n = y.getStreamChecked(e);
      if (t < 0 || !(n.flags & 2097155))
        throw new y.ErrnoError(28);
      y.doTruncate(n, n.node, t);
    }, utime(e, t, n) {
      var i = y.lookupPath(e, { follow: !0 }), s = i.node, f = y.checkOpExists(s.node_ops.setattr, 63);
      f(s, { atime: t, mtime: n });
    }, open(e, t, n = 438) {
      if (e === "")
        throw new y.ErrnoError(44);
      t = typeof t == "string" ? Jl(t) : t, t & 64 ? n = n & 4095 | 32768 : n = 0;
      var i, s;
      if (typeof e == "object")
        i = e;
      else {
        s = e.endsWith("/");
        var f = y.lookupPath(e, { follow: !(t & 131072), noent_okay: !0 });
        i = f.node, e = f.path;
      }
      var h = !1;
      if (t & 64)
        if (i) {
          if (t & 128)
            throw new y.ErrnoError(20);
        } else {
          if (s)
            throw new y.ErrnoError(31);
          i = y.mknod(e, n | 511, 0), h = !0;
        }
      if (!i)
        throw new y.ErrnoError(44);
      if (y.isChrdev(i.mode) && (t &= -513), t & 65536 && !y.isDir(i.mode))
        throw new y.ErrnoError(54);
      if (!h) {
        var p = y.mayOpen(i, t);
        if (p)
          throw new y.ErrnoError(p);
      }
      t & 512 && !h && y.truncate(i, 0), t &= -131713;
      var E = y.createStream({ node: i, path: y.getPath(i), flags: t, seekable: !0, position: 0, stream_ops: i.stream_ops, ungotten: [], error: !1 });
      return E.stream_ops.open && E.stream_ops.open(E), h && y.chmod(i, n & 511), l.logReadFiles && !(t & 1) && (e in y.readFiles || (y.readFiles[e] = 1)), E;
    }, close(e) {
      if (y.isClosed(e))
        throw new y.ErrnoError(8);
      e.getdents && (e.getdents = null);
      try {
        e.stream_ops.close && e.stream_ops.close(e);
      } catch (t) {
        throw t;
      } finally {
        y.closeStream(e.fd);
      }
      e.fd = null;
    }, isClosed(e) {
      return e.fd === null;
    }, llseek(e, t, n) {
      if (y.isClosed(e))
        throw new y.ErrnoError(8);
      if (!e.seekable || !e.stream_ops.llseek)
        throw new y.ErrnoError(70);
      if (n != 0 && n != 1 && n != 2)
        throw new y.ErrnoError(28);
      return e.position = e.stream_ops.llseek(e, t, n), e.ungotten = [], e.position;
    }, read(e, t, n, i, s) {
      if (i < 0 || s < 0)
        throw new y.ErrnoError(28);
      if (y.isClosed(e))
        throw new y.ErrnoError(8);
      if ((e.flags & 2097155) === 1)
        throw new y.ErrnoError(8);
      if (y.isDir(e.node.mode))
        throw new y.ErrnoError(31);
      if (!e.stream_ops.read)
        throw new y.ErrnoError(28);
      var f = typeof s < "u";
      if (!f)
        s = e.position;
      else if (!e.seekable)
        throw new y.ErrnoError(70);
      var h = e.stream_ops.read(e, t, n, i, s);
      return f || (e.position += h), h;
    }, write(e, t, n, i, s, f) {
      if (i < 0 || s < 0)
        throw new y.ErrnoError(28);
      if (y.isClosed(e))
        throw new y.ErrnoError(8);
      if (!(e.flags & 2097155))
        throw new y.ErrnoError(8);
      if (y.isDir(e.node.mode))
        throw new y.ErrnoError(31);
      if (!e.stream_ops.write)
        throw new y.ErrnoError(28);
      e.seekable && e.flags & 1024 && y.llseek(e, 0, 2);
      var h = typeof s < "u";
      if (!h)
        s = e.position;
      else if (!e.seekable)
        throw new y.ErrnoError(70);
      var p = e.stream_ops.write(e, t, n, i, s, f);
      return h || (e.position += p), p;
    }, allocate(e, t, n) {
      if (y.isClosed(e))
        throw new y.ErrnoError(8);
      if (t < 0 || n <= 0)
        throw new y.ErrnoError(28);
      if (!(e.flags & 2097155))
        throw new y.ErrnoError(8);
      if (!y.isFile(e.node.mode) && !y.isDir(e.node.mode))
        throw new y.ErrnoError(43);
      if (!e.stream_ops.allocate)
        throw new y.ErrnoError(138);
      e.stream_ops.allocate(e, t, n);
    }, mmap(e, t, n, i, s) {
      if (i & 2 && !(s & 2) && (e.flags & 2097155) !== 2)
        throw new y.ErrnoError(2);
      if ((e.flags & 2097155) === 1)
        throw new y.ErrnoError(2);
      if (!e.stream_ops.mmap)
        throw new y.ErrnoError(43);
      if (!t)
        throw new y.ErrnoError(28);
      return e.stream_ops.mmap(e, t, n, i, s);
    }, msync(e, t, n, i, s) {
      return e.stream_ops.msync ? e.stream_ops.msync(e, t, n, i, s) : 0;
    }, ioctl(e, t, n) {
      if (!e.stream_ops.ioctl)
        throw new y.ErrnoError(59);
      return e.stream_ops.ioctl(e, t, n);
    }, readFile(e, t = {}) {
      if (t.flags = t.flags || 0, t.encoding = t.encoding || "binary", t.encoding !== "utf8" && t.encoding !== "binary")
        throw new Error(`Invalid encoding type "${t.encoding}"`);
      var n, i = y.open(e, t.flags), s = y.stat(e), f = s.size, h = new Uint8Array(f);
      return y.read(i, h, 0, f, 0), t.encoding === "utf8" ? n = Er(h) : t.encoding === "binary" && (n = h), y.close(i), n;
    }, writeFile(e, t, n = {}) {
      n.flags = n.flags || 577;
      var i = y.open(e, n.flags, n.mode);
      if (typeof t == "string") {
        var s = new Uint8Array(xr(t) + 1), f = ai(t, s, 0, s.length);
        y.write(i, s, 0, f, void 0, n.canOwn);
      } else if (ArrayBuffer.isView(t))
        y.write(i, t, 0, t.byteLength, void 0, n.canOwn);
      else
        throw new Error("Unsupported data type");
      y.close(i);
    }, cwd: () => y.currentPath, chdir(e) {
      var t = y.lookupPath(e, { follow: !0 });
      if (t.node === null)
        throw new y.ErrnoError(44);
      if (!y.isDir(t.node.mode))
        throw new y.ErrnoError(54);
      var n = y.nodePermissions(t.node, "x");
      if (n)
        throw new y.ErrnoError(n);
      y.currentPath = t.path;
    }, createDefaultDirectories() {
      y.mkdir("/tmp"), y.mkdir("/home"), y.mkdir("/home/web_user");
    }, createDefaultDevices() {
      y.mkdir("/dev"), y.registerDevice(y.makedev(1, 3), { read: () => 0, write: (i, s, f, h, p) => h, llseek: () => 0 }), y.mkdev("/dev/null", y.makedev(1, 3)), ir.register(y.makedev(5, 0), ir.default_tty_ops), ir.register(y.makedev(6, 0), ir.default_tty1_ops), y.mkdev("/dev/tty", y.makedev(5, 0)), y.mkdev("/dev/tty1", y.makedev(6, 0));
      var e = new Uint8Array(1024), t = 0, n = () => (t === 0 && (ni(e), t = e.byteLength), e[--t]);
      y.createDevice("/dev", "random", n), y.createDevice("/dev", "urandom", n), y.mkdir("/dev/shm"), y.mkdir("/dev/shm/tmp");
    }, createSpecialDirectories() {
      y.mkdir("/proc");
      var e = y.mkdir("/proc/self");
      y.mkdir("/proc/self/fd"), y.mount({ mount() {
        var t = y.createNode(e, "fd", 16895, 73);
        return t.stream_ops = { llseek: Se.stream_ops.llseek }, t.node_ops = { lookup(n, i) {
          var s = +i, f = y.getStreamChecked(s), h = { parent: null, mount: { mountpoint: "fake" }, node_ops: { readlink: () => f.path }, id: s + 1 };
          return h.parent = h, h;
        }, readdir() {
          return Array.from(y.streams.entries()).filter(([n, i]) => i).map(([n, i]) => n.toString());
        } }, t;
      } }, {}, "/proc/self/fd");
    }, createStandardStreams(e, t, n) {
      e ? y.createDevice("/dev", "stdin", e) : y.symlink("/dev/tty", "/dev/stdin"), t ? y.createDevice("/dev", "stdout", null, t) : y.symlink("/dev/tty", "/dev/stdout"), n ? y.createDevice("/dev", "stderr", null, n) : y.symlink("/dev/tty1", "/dev/stderr"), y.open("/dev/stdin", 0), y.open("/dev/stdout", 1), y.open("/dev/stderr", 1);
    }, staticInit() {
      y.nameTable = new Array(4096), y.mount(Se, {}, "/"), y.createDefaultDirectories(), y.createDefaultDevices(), y.createSpecialDirectories(), y.filesystems = { MEMFS: Se };
    }, init(e, t, n) {
      y.initialized = !0, e ?? (e = l.stdin), t ?? (t = l.stdout), n ?? (n = l.stderr), y.createStandardStreams(e, t, n);
    }, quit() {
      y.initialized = !1;
      for (var e = 0; e < y.streams.length; e++) {
        var t = y.streams[e];
        t && y.close(t);
      }
    }, findObject(e, t) {
      var n = y.analyzePath(e, t);
      return n.exists ? n.object : null;
    }, analyzePath(e, t) {
      try {
        var n = y.lookupPath(e, { follow: !t });
        e = n.path;
      } catch {
      }
      var i = { isRoot: !1, exists: !1, error: 0, name: null, path: null, object: null, parentExists: !1, parentPath: null, parentObject: null };
      try {
        var n = y.lookupPath(e, { parent: !0 });
        i.parentExists = !0, i.parentPath = n.path, i.parentObject = n.node, i.name = Ze.basename(e), n = y.lookupPath(e, { follow: !t }), i.exists = !0, i.path = n.path, i.object = n.node, i.name = n.node.name, i.isRoot = n.path === "/";
      } catch (s) {
        i.error = s.errno;
      }
      return i;
    }, createPath(e, t, n, i) {
      e = typeof e == "string" ? e : y.getPath(e);
      for (var s = t.split("/").reverse(); s.length; ) {
        var f = s.pop();
        if (f) {
          var h = Ze.join2(e, f);
          try {
            y.mkdir(h);
          } catch {
          }
          e = h;
        }
      }
      return h;
    }, createFile(e, t, n, i, s) {
      var f = Ze.join2(typeof e == "string" ? e : y.getPath(e), t), h = si(i, s);
      return y.create(f, h);
    }, createDataFile(e, t, n, i, s, f) {
      var h = t;
      e && (e = typeof e == "string" ? e : y.getPath(e), h = t ? Ze.join2(e, t) : e);
      var p = si(i, s), E = y.create(h, p);
      if (n) {
        if (typeof n == "string") {
          for (var A = new Array(n.length), I = 0, $ = n.length; I < $; ++I)
            A[I] = n.charCodeAt(I);
          n = A;
        }
        y.chmod(E, p | 146);
        var B = y.open(E, 577);
        y.write(B, n, 0, n.length, 0, f), y.close(B), y.chmod(E, p);
      }
    }, createDevice(e, t, n, i) {
      var p;
      var s = Ze.join2(typeof e == "string" ? e : y.getPath(e), t), f = si(!!n, !!i);
      (p = y.createDevice).major ?? (p.major = 64);
      var h = y.makedev(y.createDevice.major++, 0);
      return y.registerDevice(h, { open(E) {
        E.seekable = !1;
      }, close(E) {
        i?.buffer?.length && i(10);
      }, read(E, A, I, $, B) {
        for (var j = 0, ee = 0; ee < $; ee++) {
          var se;
          try {
            se = n();
          } catch {
            throw new y.ErrnoError(29);
          }
          if (se === void 0 && j === 0)
            throw new y.ErrnoError(6);
          if (se == null)
            break;
          j++, A[I + ee] = se;
        }
        return j && (E.node.atime = Date.now()), j;
      }, write(E, A, I, $, B) {
        for (var j = 0; j < $; j++)
          try {
            i(A[I + j]);
          } catch {
            throw new y.ErrnoError(29);
          }
        return $ && (E.node.mtime = E.node.ctime = Date.now()), j;
      } }), y.mkdev(s, f, h);
    }, forceLoadFile(e) {
      if (e.isDevice || e.isFolder || e.link || e.contents)
        return !0;
      if (typeof XMLHttpRequest < "u")
        throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
      try {
        e.contents = G(e.url), e.usedBytes = e.contents.length;
      } catch {
        throw new y.ErrnoError(29);
      }
    }, createLazyFile(e, t, n, i, s) {
      class f {
        constructor() {
          te(this, "lengthKnown", !1);
          te(this, "chunks", []);
        }
        get(j) {
          if (!(j > this.length - 1 || j < 0)) {
            var ee = j % this.chunkSize, se = j / this.chunkSize | 0;
            return this.getter(se)[ee];
          }
        }
        setDataGetter(j) {
          this.getter = j;
        }
        cacheLength() {
          var j = new XMLHttpRequest();
          if (j.open("HEAD", n, !1), j.send(null), !(j.status >= 200 && j.status < 300 || j.status === 304))
            throw new Error("Couldn't load " + n + ". Status: " + j.status);
          var ee = Number(j.getResponseHeader("Content-length")), se, fe = (se = j.getResponseHeader("Accept-Ranges")) && se === "bytes", pe = (se = j.getResponseHeader("Content-Encoding")) && se === "gzip", be = 1024 * 1024;
          fe || (be = ee);
          var de = (xe, oe) => {
            if (xe > oe)
              throw new Error("invalid range (" + xe + ", " + oe + ") or no bytes requested!");
            if (oe > ee - 1)
              throw new Error("only " + ee + " bytes available! programmer error!");
            var ke = new XMLHttpRequest();
            if (ke.open("GET", n, !1), ee !== be && ke.setRequestHeader("Range", "bytes=" + xe + "-" + oe), ke.responseType = "arraybuffer", ke.overrideMimeType && ke.overrideMimeType("text/plain; charset=x-user-defined"), ke.send(null), !(ke.status >= 200 && ke.status < 300 || ke.status === 304))
              throw new Error("Couldn't load " + n + ". Status: " + ke.status);
            return ke.response !== void 0 ? new Uint8Array(ke.response || []) : Na(ke.responseText || "", !0);
          }, Ee = this;
          Ee.setDataGetter((xe) => {
            var oe = xe * be, ke = (xe + 1) * be - 1;
            if (ke = Math.min(ke, ee - 1), typeof Ee.chunks[xe] > "u" && (Ee.chunks[xe] = de(oe, ke)), typeof Ee.chunks[xe] > "u")
              throw new Error("doXHR failed!");
            return Ee.chunks[xe];
          }), (pe || !ee) && (be = ee = 1, ee = this.getter(0).length, be = ee, ve("LazyFiles on gzip forces download of the whole file when length is accessed")), this._length = ee, this._chunkSize = be, this.lengthKnown = !0;
        }
        get length() {
          return this.lengthKnown || this.cacheLength(), this._length;
        }
        get chunkSize() {
          return this.lengthKnown || this.cacheLength(), this._chunkSize;
        }
      }
      if (typeof XMLHttpRequest < "u") {
        throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
        var h, p;
      } else
        var p = { isDevice: !1, url: n };
      var E = y.createFile(e, t, p, i, s);
      p.contents ? E.contents = p.contents : p.url && (E.contents = null, E.url = p.url), Object.defineProperties(E, { usedBytes: { get: function() {
        return this.contents.length;
      } } });
      var A = {}, I = Object.keys(E.stream_ops);
      I.forEach((B) => {
        var j = E.stream_ops[B];
        A[B] = (...ee) => (y.forceLoadFile(E), j(...ee));
      });
      function $(B, j, ee, se, fe) {
        var pe = B.node.contents;
        if (fe >= pe.length)
          return 0;
        var be = Math.min(pe.length - fe, se);
        if (pe.slice)
          for (var de = 0; de < be; de++)
            j[ee + de] = pe[fe + de];
        else
          for (var de = 0; de < be; de++)
            j[ee + de] = pe.get(fe + de);
        return be;
      }
      return A.read = (B, j, ee, se, fe) => (y.forceLoadFile(E), $(B, j, ee, se, fe)), A.mmap = (B, j, ee, se, fe) => {
        y.forceLoadFile(E);
        var pe = $a(j);
        if (!pe)
          throw new y.ErrnoError(48);
        return $(B, Fe, pe, j, ee), { ptr: pe, allocated: !0 };
      }, E.stream_ops = A, E;
    } }, at = (e, t) => e ? Er(he, e, t) : "", Le = { DEFAULT_POLLMASK: 5, calculateAt(e, t, n) {
      if (Ze.isAbs(t))
        return t;
      var i;
      if (e === -100)
        i = y.cwd();
      else {
        var s = Le.getStreamFromFD(e);
        i = s.path;
      }
      if (t.length == 0) {
        if (!n)
          throw new y.ErrnoError(44);
        return i;
      }
      return i + "/" + t;
    }, writeStat(e, t) {
      k[e >> 2] = t.dev, k[e + 4 >> 2] = t.mode, Y[e + 8 >> 2] = t.nlink, k[e + 12 >> 2] = t.uid, k[e + 16 >> 2] = t.gid, k[e + 20 >> 2] = t.rdev, Te[e + 24 >> 3] = BigInt(t.size), k[e + 32 >> 2] = 4096, k[e + 36 >> 2] = t.blocks;
      var n = t.atime.getTime(), i = t.mtime.getTime(), s = t.ctime.getTime();
      return Te[e + 40 >> 3] = BigInt(Math.floor(n / 1e3)), Y[e + 48 >> 2] = n % 1e3 * 1e3 * 1e3, Te[e + 56 >> 3] = BigInt(Math.floor(i / 1e3)), Y[e + 64 >> 2] = i % 1e3 * 1e3 * 1e3, Te[e + 72 >> 3] = BigInt(Math.floor(s / 1e3)), Y[e + 80 >> 2] = s % 1e3 * 1e3 * 1e3, Te[e + 88 >> 3] = BigInt(t.ino), 0;
    }, writeStatFs(e, t) {
      k[e + 4 >> 2] = t.bsize, k[e + 40 >> 2] = t.bsize, k[e + 8 >> 2] = t.blocks, k[e + 12 >> 2] = t.bfree, k[e + 16 >> 2] = t.bavail, k[e + 20 >> 2] = t.files, k[e + 24 >> 2] = t.ffree, k[e + 28 >> 2] = t.fsid, k[e + 44 >> 2] = t.flags, k[e + 36 >> 2] = t.namelen;
    }, doMsync(e, t, n, i, s) {
      if (!y.isFile(t.node.mode))
        throw new y.ErrnoError(43);
      if (i & 2)
        return 0;
      var f = he.slice(e, e + n);
      y.msync(t, f, s, n, i);
    }, getStreamFromFD(e) {
      var t = y.getStreamChecked(e);
      return t;
    }, varargs: void 0, getStr(e) {
      var t = at(e);
      return t;
    } };
    function eu(e) {
      try {
        var t = Le.getStreamFromFD(e);
        return y.dupStream(t).fd;
      } catch (n) {
        if (typeof y > "u" || n.name !== "ErrnoError")
          throw n;
        return -n.errno;
      }
    }
    function tu(e, t, n, i) {
      try {
        if (t = Le.getStr(t), t = Le.calculateAt(e, t), n & -8)
          return -28;
        var s = y.lookupPath(t, { follow: !0 }), f = s.node;
        if (!f)
          return -44;
        var h = "";
        return n & 4 && (h += "r"), n & 2 && (h += "w"), n & 1 && (h += "x"), h && y.nodePermissions(f, h) ? -2 : 0;
      } catch (p) {
        if (typeof y > "u" || p.name !== "ErrnoError")
          throw p;
        return -p.errno;
      }
    }
    var an = () => {
      var e = k[+Le.varargs >> 2];
      return Le.varargs += 4, e;
    }, Sr = an;
    function ru(e, t, n) {
      Le.varargs = n;
      try {
        var i = Le.getStreamFromFD(e);
        switch (t) {
          case 0: {
            var s = an();
            if (s < 0)
              return -28;
            for (; y.streams[s]; )
              s++;
            var f;
            return f = y.dupStream(i, s), f.fd;
          }
          case 1:
          case 2:
            return 0;
          case 3:
            return i.flags;
          case 4: {
            var s = an();
            return i.flags |= s, 0;
          }
          case 12: {
            var s = Sr(), h = 0;
            return _e[s + h >> 1] = 2, 0;
          }
          case 13:
          case 14:
            return 0;
        }
        return -28;
      } catch (p) {
        if (typeof y > "u" || p.name !== "ErrnoError")
          throw p;
        return -p.errno;
      }
    }
    function nu(e, t) {
      try {
        return Le.writeStat(t, y.fstat(e));
      } catch (n) {
        if (typeof y > "u" || n.name !== "ErrnoError")
          throw n;
        return -n.errno;
      }
    }
    var iu = 9007199254740992, au = -9007199254740992, Tr = (e) => e < au || e > iu ? NaN : Number(e);
    function ou(e, t) {
      t = Tr(t);
      try {
        return isNaN(t) ? 61 : (y.ftruncate(e, t), 0);
      } catch (n) {
        if (typeof y > "u" || n.name !== "ErrnoError")
          throw n;
        return -n.errno;
      }
    }
    var ot = (e, t, n) => ai(e, he, t, n);
    function su(e, t, n) {
      try {
        var i = Le.getStreamFromFD(e);
        i.getdents || (i.getdents = y.readdir(i.path));
        for (var s = 280, f = 0, h = y.llseek(i, 0, 1), p = Math.floor(h / s), E = Math.min(i.getdents.length, p + Math.floor(n / s)), A = p; A < E; A++) {
          var I, $, B = i.getdents[A];
          if (B === ".")
            I = i.node.id, $ = 4;
          else if (B === "..") {
            var j = y.lookupPath(i.path, { parent: !0 });
            I = j.node.id, $ = 4;
          } else {
            var ee;
            try {
              ee = y.lookupNode(i.node, B);
            } catch (se) {
              if (se?.errno === 28)
                continue;
              throw se;
            }
            I = ee.id, $ = y.isChrdev(ee.mode) ? 2 : y.isDir(ee.mode) ? 4 : y.isLink(ee.mode) ? 10 : 8;
          }
          Te[t + f >> 3] = BigInt(I), Te[t + f + 8 >> 3] = BigInt((A + 1) * s), _e[t + f + 16 >> 1] = 280, Fe[t + f + 18] = $, ot(B, t + f + 19, 256), f += s;
        }
        return y.llseek(i, A * s, 0), f;
      } catch (se) {
        if (typeof y > "u" || se.name !== "ErrnoError")
          throw se;
        return -se.errno;
      }
    }
    function lu(e, t, n) {
      Le.varargs = n;
      try {
        var i = Le.getStreamFromFD(e);
        switch (t) {
          case 21509:
            return i.tty ? 0 : -59;
          case 21505: {
            if (!i.tty)
              return -59;
            if (i.tty.ops.ioctl_tcgets) {
              var s = i.tty.ops.ioctl_tcgets(i), f = Sr();
              k[f >> 2] = s.c_iflag || 0, k[f + 4 >> 2] = s.c_oflag || 0, k[f + 8 >> 2] = s.c_cflag || 0, k[f + 12 >> 2] = s.c_lflag || 0;
              for (var h = 0; h < 32; h++)
                Fe[f + h + 17] = s.c_cc[h] || 0;
              return 0;
            }
            return 0;
          }
          case 21510:
          case 21511:
          case 21512:
            return i.tty ? 0 : -59;
          case 21506:
          case 21507:
          case 21508: {
            if (!i.tty)
              return -59;
            if (i.tty.ops.ioctl_tcsets) {
              for (var f = Sr(), p = k[f >> 2], E = k[f + 4 >> 2], A = k[f + 8 >> 2], I = k[f + 12 >> 2], $ = [], h = 0; h < 32; h++)
                $.push(Fe[f + h + 17]);
              return i.tty.ops.ioctl_tcsets(i.tty, t, { c_iflag: p, c_oflag: E, c_cflag: A, c_lflag: I, c_cc: $ });
            }
            return 0;
          }
          case 21519: {
            if (!i.tty)
              return -59;
            var f = Sr();
            return k[f >> 2] = 0, 0;
          }
          case 21520:
            return i.tty ? -28 : -59;
          case 21531: {
            var f = Sr();
            return y.ioctl(i, t, f);
          }
          case 21523: {
            if (!i.tty)
              return -59;
            if (i.tty.ops.ioctl_tiocgwinsz) {
              var B = i.tty.ops.ioctl_tiocgwinsz(i.tty), f = Sr();
              _e[f >> 1] = B[0], _e[f + 2 >> 1] = B[1];
            }
            return 0;
          }
          case 21524:
            return i.tty ? 0 : -59;
          case 21515:
            return i.tty ? 0 : -59;
          default:
            return -28;
        }
      } catch (j) {
        if (typeof y > "u" || j.name !== "ErrnoError")
          throw j;
        return -j.errno;
      }
    }
    function uu(e, t) {
      try {
        return e = Le.getStr(e), Le.writeStat(t, y.lstat(e));
      } catch (n) {
        if (typeof y > "u" || n.name !== "ErrnoError")
          throw n;
        return -n.errno;
      }
    }
    function fu(e, t, n, i) {
      try {
        t = Le.getStr(t);
        var s = i & 256, f = i & 4096;
        return i = i & -6401, t = Le.calculateAt(e, t, f), Le.writeStat(n, s ? y.lstat(t) : y.stat(t));
      } catch (h) {
        if (typeof y > "u" || h.name !== "ErrnoError")
          throw h;
        return -h.errno;
      }
    }
    function cu(e, t, n, i) {
      Le.varargs = i;
      try {
        t = Le.getStr(t), t = Le.calculateAt(e, t);
        var s = i ? an() : 0;
        return y.open(t, n, s).fd;
      } catch (f) {
        if (typeof y > "u" || f.name !== "ErrnoError")
          throw f;
        return -f.errno;
      }
    }
    function du(e, t, n, i) {
      try {
        if (t = Le.getStr(t), t = Le.calculateAt(e, t), i <= 0)
          return -28;
        var s = y.readlink(t), f = Math.min(i, xr(s)), h = Fe[n + f];
        return ot(s, n, i + 1), Fe[n + f] = h, f;
      } catch (p) {
        if (typeof y > "u" || p.name !== "ErrnoError")
          throw p;
        return -p.errno;
      }
    }
    function hu(e, t, n, i) {
      try {
        return t = Le.getStr(t), i = Le.getStr(i), t = Le.calculateAt(e, t), i = Le.calculateAt(n, i), y.rename(t, i), 0;
      } catch (s) {
        if (typeof y > "u" || s.name !== "ErrnoError")
          throw s;
        return -s.errno;
      }
    }
    function pu(e, t) {
      try {
        return e = Le.getStr(e), Le.writeStat(t, y.stat(e));
      } catch (n) {
        if (typeof y > "u" || n.name !== "ErrnoError")
          throw n;
        return -n.errno;
      }
    }
    function _u(e, t, n) {
      try {
        return t = Le.getStr(t), t = Le.calculateAt(e, t), n === 0 ? y.unlink(t) : n === 512 ? y.rmdir(t) : M("Invalid flags passed to unlinkat"), 0;
      } catch (i) {
        if (typeof y > "u" || i.name !== "ErrnoError")
          throw i;
        return -i.errno;
      }
    }
    var bu = () => M(""), on = (e) => {
      if (e === null)
        return "null";
      var t = typeof e;
      return t === "object" || t === "array" || t === "function" ? e.toString() : "" + e;
    }, mu = () => {
      for (var e = new Array(256), t = 0; t < 256; ++t)
        e[t] = String.fromCharCode(t);
      Ga = e;
    }, Ga, ct = (e) => {
      for (var t = "", n = e; he[n]; )
        t += Ga[he[n++]];
      return t;
    }, Cr = {}, ar = {}, sn = {}, Fr, Be = (e) => {
      throw new Fr(e);
    }, Va, ln = (e) => {
      throw new Va(e);
    }, Pt = (e, t, n) => {
      e.forEach((p) => sn[p] = t);
      function i(p) {
        var E = n(p);
        E.length !== e.length && ln("Mismatched type converter count");
        for (var A = 0; A < e.length; ++A)
          Rt(e[A], E[A]);
      }
      var s = new Array(t.length), f = [], h = 0;
      t.forEach((p, E) => {
        ar.hasOwnProperty(p) ? s[E] = ar[p] : (f.push(p), Cr.hasOwnProperty(p) || (Cr[p] = []), Cr[p].push(() => {
          s[E] = ar[p], ++h, h === f.length && i(s);
        }));
      }), f.length === 0 && i(s);
    };
    function gu(e, t, n = {}) {
      var i = t.name;
      if (e || Be(`type "${i}" must have a positive integer typeid pointer`), ar.hasOwnProperty(e)) {
        if (n.ignoreDuplicateRegistrations)
          return;
        Be(`Cannot register type '${i}' twice`);
      }
      if (ar[e] = t, delete sn[e], Cr.hasOwnProperty(e)) {
        var s = Cr[e];
        delete Cr[e], s.forEach((f) => f());
      }
    }
    function Rt(e, t, n = {}) {
      return gu(e, t, n);
    }
    var za = (e, t, n) => {
      switch (t) {
        case 1:
          return n ? (i) => Fe[i] : (i) => he[i];
        case 2:
          return n ? (i) => _e[i >> 1] : (i) => Me[i >> 1];
        case 4:
          return n ? (i) => k[i >> 2] : (i) => Y[i >> 2];
        case 8:
          return n ? (i) => Te[i >> 3] : (i) => De[i >> 3];
        default:
          throw new TypeError(`invalid integer width (${t}): ${e}`);
      }
    }, yu = (e, t, n, i, s) => {
      t = ct(t);
      var f = t.indexOf("u") != -1;
      Rt(e, { name: t, fromWireType: (h) => h, toWireType: function(h, p) {
        if (typeof p != "bigint" && typeof p != "number")
          throw new TypeError(`Cannot convert "${on(p)}" to ${this.name}`);
        return typeof p == "number" && (p = BigInt(p)), p;
      }, argPackAdvance: Lt, readValueFromPointer: za(t, n, !f), destructorFunction: null });
    }, Lt = 8, vu = (e, t, n, i) => {
      t = ct(t), Rt(e, { name: t, fromWireType: function(s) {
        return !!s;
      }, toWireType: function(s, f) {
        return f ? n : i;
      }, argPackAdvance: Lt, readValueFromPointer: function(s) {
        return this.fromWireType(he[s]);
      }, destructorFunction: null });
    }, wu = (e) => ({ count: e.count, deleteScheduled: e.deleteScheduled, preservePointerOnDelete: e.preservePointerOnDelete, ptr: e.ptr, ptrType: e.ptrType, smartPtr: e.smartPtr, smartPtrType: e.smartPtrType }), li = (e) => {
      function t(n) {
        return n.$$.ptrType.registeredClass.name;
      }
      Be(t(e) + " instance already deleted");
    }, ui = !1, Ha = (e) => {
    }, Eu = (e) => {
      e.smartPtr ? e.smartPtrType.rawDestructor(e.smartPtr) : e.ptrType.registeredClass.rawDestructor(e.ptr);
    }, Ka = (e) => {
      e.count.value -= 1;
      var t = e.count.value === 0;
      t && Eu(e);
    }, Xa = (e, t, n) => {
      if (t === n)
        return e;
      if (n.baseClass === void 0)
        return null;
      var i = Xa(e, t, n.baseClass);
      return i === null ? null : n.downcast(i);
    }, Ya = {}, xu = {}, Su = (e, t) => {
      for (t === void 0 && Be("ptr should not be undefined"); e.baseClass; )
        t = e.upcast(t), e = e.baseClass;
      return t;
    }, Tu = (e, t) => (t = Su(e, t), xu[t]), un = (e, t) => {
      (!t.ptrType || !t.ptr) && ln("makeClassHandle requires ptr and ptrType");
      var n = !!t.smartPtrType, i = !!t.smartPtr;
      return n !== i && ln("Both smartPtrType and smartPtr must be specified"), t.count = { value: 1 }, Nr(Object.create(e, { $$: { value: t, writable: !0 } }));
    };
    function Cu(e) {
      var t = this.getPointee(e);
      if (!t)
        return this.destructor(e), null;
      var n = Tu(this.registeredClass, t);
      if (n !== void 0) {
        if (n.$$.count.value === 0)
          return n.$$.ptr = t, n.$$.smartPtr = e, n.clone();
        var i = n.clone();
        return this.destructor(e), i;
      }
      function s() {
        return this.isSmartPointer ? un(this.registeredClass.instancePrototype, { ptrType: this.pointeeType, ptr: t, smartPtrType: this, smartPtr: e }) : un(this.registeredClass.instancePrototype, { ptrType: this, ptr: e });
      }
      var f = this.registeredClass.getActualType(t), h = Ya[f];
      if (!h)
        return s.call(this);
      var p;
      this.isConst ? p = h.constPointerType : p = h.pointerType;
      var E = Xa(t, this.registeredClass, p.registeredClass);
      return E === null ? s.call(this) : this.isSmartPointer ? un(p.registeredClass.instancePrototype, { ptrType: p, ptr: E, smartPtrType: this, smartPtr: e }) : un(p.registeredClass.instancePrototype, { ptrType: p, ptr: E });
    }
    var Nr = (e) => typeof FinalizationRegistry > "u" ? (Nr = (t) => t, e) : (ui = new FinalizationRegistry((t) => {
      Ka(t.$$);
    }), Nr = (t) => {
      var n = t.$$, i = !!n.smartPtr;
      if (i) {
        var s = { $$: n };
        ui.register(t, s, t);
      }
      return t;
    }, Ha = (t) => ui.unregister(t), Nr(e)), fn = [], Fu = () => {
      for (; fn.length; ) {
        var e = fn.pop();
        e.$$.deleteScheduled = !1, e.delete();
      }
    }, Za, Ru = () => {
      Object.assign(cn.prototype, { isAliasOf(e) {
        if (!(this instanceof cn) || !(e instanceof cn))
          return !1;
        var t = this.$$.ptrType.registeredClass, n = this.$$.ptr;
        e.$$ = e.$$;
        for (var i = e.$$.ptrType.registeredClass, s = e.$$.ptr; t.baseClass; )
          n = t.upcast(n), t = t.baseClass;
        for (; i.baseClass; )
          s = i.upcast(s), i = i.baseClass;
        return t === i && n === s;
      }, clone() {
        if (this.$$.ptr || li(this), this.$$.preservePointerOnDelete)
          return this.$$.count.value += 1, this;
        var e = Nr(Object.create(Object.getPrototypeOf(this), { $$: { value: wu(this.$$) } }));
        return e.$$.count.value += 1, e.$$.deleteScheduled = !1, e;
      }, delete() {
        this.$$.ptr || li(this), this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && Be("Object already scheduled for deletion"), Ha(this), Ka(this.$$), this.$$.preservePointerOnDelete || (this.$$.smartPtr = void 0, this.$$.ptr = void 0);
      }, isDeleted() {
        return !this.$$.ptr;
      }, deleteLater() {
        return this.$$.ptr || li(this), this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && Be("Object already scheduled for deletion"), fn.push(this), fn.length === 1 && Za && Za(Fu), this.$$.deleteScheduled = !0, this;
      } });
    };
    function cn() {
    }
    var Ur = (e, t) => Object.defineProperty(t, "name", { value: e }), fi = (e, t, n) => {
      if (e[t].overloadTable === void 0) {
        var i = e[t];
        e[t] = function(...s) {
          return e[t].overloadTable.hasOwnProperty(s.length) || Be(`Function '${n}' called with an invalid number of arguments (${s.length}) - expects one of (${e[t].overloadTable})!`), e[t].overloadTable[s.length].apply(this, s);
        }, e[t].overloadTable = [], e[t].overloadTable[i.argCount] = i;
      }
    }, ci = (e, t, n) => {
      l.hasOwnProperty(e) ? ((n === void 0 || l[e].overloadTable !== void 0 && l[e].overloadTable[n] !== void 0) && Be(`Cannot register public name '${e}' twice`), fi(l, e, e), l[e].overloadTable.hasOwnProperty(n) && Be(`Cannot register multiple overloads of a function with the same number of arguments (${n})!`), l[e].overloadTable[n] = t) : (l[e] = t, l[e].argCount = n);
    }, Au = 48, Iu = 57, ku = (e) => {
      e = e.replace(/[^a-zA-Z0-9_]/g, "$");
      var t = e.charCodeAt(0);
      return t >= Au && t <= Iu ? `_${e}` : e;
    };
    function Pu(e, t, n, i, s, f, h, p) {
      this.name = e, this.constructor = t, this.instancePrototype = n, this.rawDestructor = i, this.baseClass = s, this.getActualType = f, this.upcast = h, this.downcast = p, this.pureVirtualFunctions = [];
    }
    var dn = (e, t, n) => {
      for (; t !== n; )
        t.upcast || Be(`Expected null or instance of ${n.name}, got an instance of ${t.name}`), e = t.upcast(e), t = t.baseClass;
      return e;
    };
    function Du(e, t) {
      if (t === null)
        return this.isReference && Be(`null is not a valid ${this.name}`), 0;
      t.$$ || Be(`Cannot pass "${on(t)}" as a ${this.name}`), t.$$.ptr || Be(`Cannot pass deleted object as a pointer of type ${this.name}`);
      var n = t.$$.ptrType.registeredClass, i = dn(t.$$.ptr, n, this.registeredClass);
      return i;
    }
    function Lu(e, t) {
      var n;
      if (t === null)
        return this.isReference && Be(`null is not a valid ${this.name}`), this.isSmartPointer ? (n = this.rawConstructor(), e !== null && e.push(this.rawDestructor, n), n) : 0;
      (!t || !t.$$) && Be(`Cannot pass "${on(t)}" as a ${this.name}`), t.$$.ptr || Be(`Cannot pass deleted object as a pointer of type ${this.name}`), !this.isConst && t.$$.ptrType.isConst && Be(`Cannot convert argument of type ${t.$$.smartPtrType ? t.$$.smartPtrType.name : t.$$.ptrType.name} to parameter type ${this.name}`);
      var i = t.$$.ptrType.registeredClass;
      if (n = dn(t.$$.ptr, i, this.registeredClass), this.isSmartPointer)
        switch (t.$$.smartPtr === void 0 && Be("Passing raw pointer to smart pointer is illegal"), this.sharingPolicy) {
          case 0:
            t.$$.smartPtrType === this ? n = t.$$.smartPtr : Be(`Cannot convert argument of type ${t.$$.smartPtrType ? t.$$.smartPtrType.name : t.$$.ptrType.name} to parameter type ${this.name}`);
            break;
          case 1:
            n = t.$$.smartPtr;
            break;
          case 2:
            if (t.$$.smartPtrType === this)
              n = t.$$.smartPtr;
            else {
              var s = t.clone();
              n = this.rawShare(n, qe.toHandle(() => s.delete())), e !== null && e.push(this.rawDestructor, n);
            }
            break;
          default:
            Be("Unsupporting sharing policy");
        }
      return n;
    }
    function Bu(e, t) {
      if (t === null)
        return this.isReference && Be(`null is not a valid ${this.name}`), 0;
      t.$$ || Be(`Cannot pass "${on(t)}" as a ${this.name}`), t.$$.ptr || Be(`Cannot pass deleted object as a pointer of type ${this.name}`), t.$$.ptrType.isConst && Be(`Cannot convert argument of type ${t.$$.ptrType.name} to parameter type ${this.name}`);
      var n = t.$$.ptrType.registeredClass, i = dn(t.$$.ptr, n, this.registeredClass);
      return i;
    }
    function hn(e) {
      return this.fromWireType(Y[e >> 2]);
    }
    var Mu = () => {
      Object.assign($r.prototype, { getPointee(e) {
        return this.rawGetPointee && (e = this.rawGetPointee(e)), e;
      }, destructor(e) {
        this.rawDestructor?.(e);
      }, argPackAdvance: Lt, readValueFromPointer: hn, fromWireType: Cu });
    };
    function $r(e, t, n, i, s, f, h, p, E, A, I) {
      this.name = e, this.registeredClass = t, this.isReference = n, this.isConst = i, this.isSmartPointer = s, this.pointeeType = f, this.sharingPolicy = h, this.rawGetPointee = p, this.rawConstructor = E, this.rawShare = A, this.rawDestructor = I, !s && t.baseClass === void 0 ? i ? (this.toWireType = Du, this.destructorFunction = null) : (this.toWireType = Bu, this.destructorFunction = null) : this.toWireType = Lu;
    }
    var qa = (e, t, n) => {
      l.hasOwnProperty(e) || ln("Replacing nonexistent public symbol"), l[e].overloadTable !== void 0 && n !== void 0 ? l[e].overloadTable[n] = t : (l[e] = t, l[e].argCount = n);
    }, pn = [], Qa, or = (e) => {
      var t = pn[e];
      return t || (e >= pn.length && (pn.length = e + 1), pn[e] = t = Qa.get(e)), t;
    }, wt = (e, t) => {
      e = ct(e);
      function n() {
        return or(t);
      }
      var i = n();
      return typeof i != "function" && Be(`unknown function pointer with signature ${e}: ${t}`), i;
    }, Ou = (e, t) => {
      var n = Ur(t, function(i) {
        this.name = t, this.message = i;
        var s = new Error(i).stack;
        s !== void 0 && (this.stack = this.toString() + `
` + s.replace(/^Error(:[^\n]*)?\n/, ""));
      });
      return n.prototype = Object.create(e.prototype), n.prototype.constructor = n, n.prototype.toString = function() {
        return this.message === void 0 ? this.name : `${this.name}: ${this.message}`;
      }, n;
    }, Ja, eo = (e) => {
      var t = sh(e), n = ct(t);
      return Gt(t), n;
    }, sr = (e, t) => {
      var n = [], i = {};
      function s(f) {
        if (!i[f] && !ar[f]) {
          if (sn[f]) {
            sn[f].forEach(s);
            return;
          }
          n.push(f), i[f] = !0;
        }
      }
      throw t.forEach(s), new Ja(`${e}: ` + n.map(eo).join([", "]));
    }, Nu = (e, t, n, i, s, f, h, p, E, A, I, $, B) => {
      I = ct(I), f = wt(s, f), p && (p = wt(h, p)), A && (A = wt(E, A)), B = wt($, B);
      var j = ku(I);
      ci(j, function() {
        sr(`Cannot construct ${I} due to unbound types`, [i]);
      }), Pt([e, t, n], i ? [i] : [], (ee) => {
        var ke;
        ee = ee[0];
        var se, fe;
        i ? (se = ee.registeredClass, fe = se.instancePrototype) : fe = cn.prototype;
        var pe = Ur(I, function(...Qe) {
          if (Object.getPrototypeOf(this) !== be)
            throw new Fr("Use 'new' to construct " + I);
          if (de.constructor_body === void 0)
            throw new Fr(I + " has no accessible constructor");
          var st = de.constructor_body[Qe.length];
          if (st === void 0)
            throw new Fr(`Tried to invoke ctor of ${I} with invalid number of parameters (${Qe.length}) - expected (${Object.keys(de.constructor_body).toString()}) parameters instead!`);
          return st.apply(this, Qe);
        }), be = Object.create(fe, { constructor: { value: pe } });
        pe.prototype = be;
        var de = new Pu(I, pe, be, B, se, f, p, A);
        de.baseClass && ((ke = de.baseClass).__derivedClasses ?? (ke.__derivedClasses = []), de.baseClass.__derivedClasses.push(de));
        var Ee = new $r(I, de, !0, !1, !1), xe = new $r(I + "*", de, !1, !1, !1), oe = new $r(I + " const*", de, !1, !0, !1);
        return Ya[e] = { pointerType: xe, constPointerType: oe }, qa(j, pe), [Ee, xe, oe];
      });
    }, di = (e) => {
      for (; e.length; ) {
        var t = e.pop(), n = e.pop();
        n(t);
      }
    };
    function Uu(e) {
      for (var t = 1; t < e.length; ++t)
        if (e[t] !== null && e[t].destructorFunction === void 0)
          return !0;
      return !1;
    }
    function _n(e, t, n, i, s, f) {
      var h = t.length;
      h < 2 && Be("argTypes array size mismatch! Must at least get return value and 'this' types!");
      var p = t[1] !== null && n !== null, E = Uu(t), A = t[0].name !== "void", I = h - 2, $ = new Array(I), B = [], j = [], ee = function(...se) {
        j.length = 0;
        var fe;
        B.length = p ? 2 : 1, B[0] = s, p && (fe = t[1].toWireType(j, this), B[1] = fe);
        for (var pe = 0; pe < I; ++pe)
          $[pe] = t[pe + 2].toWireType(j, se[pe]), B.push($[pe]);
        var be = i(...B);
        function de(Ee) {
          if (E)
            di(j);
          else
            for (var xe = p ? 1 : 2; xe < t.length; xe++) {
              var oe = xe === 1 ? fe : $[xe - 2];
              t[xe].destructorFunction !== null && t[xe].destructorFunction(oe);
            }
          if (A)
            return t[0].fromWireType(Ee);
        }
        return de(be);
      };
      return Ur(e, ee);
    }
    var bn = (e, t) => {
      for (var n = [], i = 0; i < e; i++)
        n.push(Y[t + i * 4 >> 2]);
      return n;
    }, hi = (e) => {
      e = e.trim();
      const t = e.indexOf("(");
      return t === -1 ? e : e.slice(0, t);
    }, $u = (e, t, n, i, s, f, h, p, E) => {
      var A = bn(n, i);
      t = ct(t), t = hi(t), f = wt(s, f), Pt([], [e], (I) => {
        I = I[0];
        var $ = `${I.name}.${t}`;
        function B() {
          sr(`Cannot call ${$} due to unbound types`, A);
        }
        t.startsWith("@@") && (t = Symbol[t.substring(2)]);
        var j = I.registeredClass.constructor;
        return j[t] === void 0 ? (B.argCount = n - 1, j[t] = B) : (fi(j, t, $), j[t].overloadTable[n - 1] = B), Pt([], A, (ee) => {
          var se = [ee[0], null].concat(ee.slice(1)), fe = _n($, se, null, f, h);
          if (j[t].overloadTable === void 0 ? (fe.argCount = n - 1, j[t] = fe) : j[t].overloadTable[n - 1] = fe, I.registeredClass.__derivedClasses)
            for (const pe of I.registeredClass.__derivedClasses)
              pe.constructor.hasOwnProperty(t) || (pe.constructor[t] = fe);
          return [];
        }), [];
      });
    }, Wu = (e, t, n, i, s, f) => {
      var h = bn(t, n);
      s = wt(i, s), Pt([], [e], (p) => {
        p = p[0];
        var E = `constructor ${p.name}`;
        if (p.registeredClass.constructor_body === void 0 && (p.registeredClass.constructor_body = []), p.registeredClass.constructor_body[t - 1] !== void 0)
          throw new Fr(`Cannot register multiple constructors with identical number of parameters (${t - 1}) for class '${p.name}'! Overload resolution is currently only performed using the parameter count, not actual type info!`);
        return p.registeredClass.constructor_body[t - 1] = () => {
          sr(`Cannot construct ${p.name} due to unbound types`, h);
        }, Pt([], h, (A) => (A.splice(1, 0, null), p.registeredClass.constructor_body[t - 1] = _n(E, A, null, s, f), [])), [];
      });
    }, ju = (e, t, n, i, s, f, h, p, E, A) => {
      var I = bn(n, i);
      t = ct(t), t = hi(t), f = wt(s, f), Pt([], [e], ($) => {
        $ = $[0];
        var B = `${$.name}.${t}`;
        t.startsWith("@@") && (t = Symbol[t.substring(2)]), p && $.registeredClass.pureVirtualFunctions.push(t);
        function j() {
          sr(`Cannot call ${B} due to unbound types`, I);
        }
        var ee = $.registeredClass.instancePrototype, se = ee[t];
        return se === void 0 || se.overloadTable === void 0 && se.className !== $.name && se.argCount === n - 2 ? (j.argCount = n - 2, j.className = $.name, ee[t] = j) : (fi(ee, t, B), ee[t].overloadTable[n - 2] = j), Pt([], I, (fe) => {
          var pe = _n(B, fe, $, f, h);
          return ee[t].overloadTable === void 0 ? (pe.argCount = n - 2, ee[t] = pe) : ee[t].overloadTable[n - 2] = pe, [];
        }), [];
      });
    }, to = (e, t, n) => (e instanceof Object || Be(`${n} with invalid "this": ${e}`), e instanceof t.registeredClass.constructor || Be(`${n} incompatible with "this" of type ${e.constructor.name}`), e.$$.ptr || Be(`cannot call emscripten binding method ${n} on deleted object`), dn(e.$$.ptr, e.$$.ptrType.registeredClass, t.registeredClass)), Gu = (e, t, n, i, s, f, h, p, E, A) => {
      t = ct(t), s = wt(i, s), Pt([], [e], (I) => {
        I = I[0];
        var $ = `${I.name}.${t}`, B = { get() {
          sr(`Cannot access ${$} due to unbound types`, [n, h]);
        }, enumerable: !0, configurable: !0 };
        return E ? B.set = () => sr(`Cannot access ${$} due to unbound types`, [n, h]) : B.set = (j) => Be($ + " is a read-only property"), Object.defineProperty(I.registeredClass.instancePrototype, t, B), Pt([], E ? [n, h] : [n], (j) => {
          var ee = j[0], se = { get() {
            var pe = to(this, I, $ + " getter");
            return ee.fromWireType(s(f, pe));
          }, enumerable: !0 };
          if (E) {
            E = wt(p, E);
            var fe = j[1];
            se.set = function(pe) {
              var be = to(this, I, $ + " setter"), de = [];
              E(A, be, fe.toWireType(de, pe)), di(de);
            };
          }
          return Object.defineProperty(I.registeredClass.instancePrototype, t, se), [];
        }), [];
      });
    }, pi = [], Wt = [], _i = (e) => {
      e > 9 && --Wt[e + 1] === 0 && (Wt[e] = void 0, pi.push(e));
    }, Vu = () => Wt.length / 2 - 5 - pi.length, zu = () => {
      Wt.push(0, 1, void 0, 1, null, 1, !0, 1, !1, 1), l.count_emval_handles = Vu;
    }, qe = { toValue: (e) => (e || Be("Cannot use deleted val. handle = " + e), Wt[e]), toHandle: (e) => {
      switch (e) {
        case void 0:
          return 2;
        case null:
          return 4;
        case !0:
          return 6;
        case !1:
          return 8;
        default: {
          const t = pi.pop() || Wt.length;
          return Wt[t] = e, Wt[t + 1] = 1, t;
        }
      }
    } }, ro = { name: "emscripten::val", fromWireType: (e) => {
      var t = qe.toValue(e);
      return _i(e), t;
    }, toWireType: (e, t) => qe.toHandle(t), argPackAdvance: Lt, readValueFromPointer: hn, destructorFunction: null }, Hu = (e) => Rt(e, ro), Ku = (e, t, n) => {
      switch (t) {
        case 1:
          return n ? function(i) {
            return this.fromWireType(Fe[i]);
          } : function(i) {
            return this.fromWireType(he[i]);
          };
        case 2:
          return n ? function(i) {
            return this.fromWireType(_e[i >> 1]);
          } : function(i) {
            return this.fromWireType(Me[i >> 1]);
          };
        case 4:
          return n ? function(i) {
            return this.fromWireType(k[i >> 2]);
          } : function(i) {
            return this.fromWireType(Y[i >> 2]);
          };
        default:
          throw new TypeError(`invalid integer width (${t}): ${e}`);
      }
    }, Xu = (e, t, n, i) => {
      t = ct(t);
      function s() {
      }
      s.values = {}, Rt(e, { name: t, constructor: s, fromWireType: function(f) {
        return this.constructor.values[f];
      }, toWireType: (f, h) => h.value, argPackAdvance: Lt, readValueFromPointer: Ku(t, n, i), destructorFunction: null }), ci(t, s);
    }, mn = (e, t) => {
      var n = ar[e];
      return n === void 0 && Be(`${t} has unknown type ${eo(e)}`), n;
    }, Yu = (e, t, n) => {
      var i = mn(e, "enum");
      t = ct(t);
      var s = i.constructor, f = Object.create(i.constructor.prototype, { value: { value: n }, constructor: { value: Ur(`${i.name}_${t}`, function() {
      }) } });
      s.values[n] = f, s[t] = f;
    }, Zu = (e, t) => {
      switch (t) {
        case 4:
          return function(n) {
            return this.fromWireType(We[n >> 2]);
          };
        case 8:
          return function(n) {
            return this.fromWireType(ye[n >> 3]);
          };
        default:
          throw new TypeError(`invalid float width (${t}): ${e}`);
      }
    }, qu = (e, t, n) => {
      t = ct(t), Rt(e, { name: t, fromWireType: (i) => i, toWireType: (i, s) => s, argPackAdvance: Lt, readValueFromPointer: Zu(t, n), destructorFunction: null });
    }, Qu = (e, t, n, i, s, f, h, p) => {
      var E = bn(t, n);
      e = ct(e), e = hi(e), s = wt(i, s), ci(e, function() {
        sr(`Cannot call ${e} due to unbound types`, E);
      }, t - 1), Pt([], E, (A) => {
        var I = [A[0], null].concat(A.slice(1));
        return qa(e, _n(e, I, null, s, f), t - 1), [];
      });
    }, Ju = (e, t, n, i, s) => {
      t = ct(t);
      var f = (A) => A;
      if (i === 0) {
        var h = 32 - 8 * n;
        f = (A) => A << h >>> h;
      }
      var p = t.includes("unsigned"), E;
      p ? E = function(A, I) {
        return I >>> 0;
      } : E = function(A, I) {
        return I;
      }, Rt(e, { name: t, fromWireType: f, toWireType: E, argPackAdvance: Lt, readValueFromPointer: za(t, n, i !== 0), destructorFunction: null });
    }, ef = (e, t, n) => {
      var i = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array, BigInt64Array, BigUint64Array], s = i[t];
      function f(h) {
        var p = Y[h >> 2], E = Y[h + 4 >> 2];
        return new s(Fe.buffer, E, p);
      }
      n = ct(n), Rt(e, { name: n, fromWireType: f, argPackAdvance: Lt, readValueFromPointer: f }, { ignoreDuplicateRegistrations: !0 });
    }, tf = Object.assign({ optional: !0 }, ro), rf = (e, t) => {
      Rt(e, tf);
    }, nf = (e, t, n, i, s, f, h, p, E, A, I, $) => {
      n = ct(n), f = wt(s, f), p = wt(h, p), A = wt(E, A), $ = wt(I, $), Pt([e], [t], (B) => {
        B = B[0];
        var j = new $r(n, B.registeredClass, !1, !1, !0, B, i, f, p, A, $);
        return [j];
      });
    }, af = (e, t) => {
      t = ct(t), Rt(e, { name: t, fromWireType(n) {
        for (var i = Y[n >> 2], s = n + 4, f, h, p = s, h = 0; h <= i; ++h) {
          var E = s + h;
          if (h == i || he[E] == 0) {
            var A = E - p, I = at(p, A);
            f === void 0 ? f = I : (f += String.fromCharCode(0), f += I), p = E + 1;
          }
        }
        return Gt(n), f;
      }, toWireType(n, i) {
        i instanceof ArrayBuffer && (i = new Uint8Array(i));
        var s, f = typeof i == "string";
        f || i instanceof Uint8Array || i instanceof Uint8ClampedArray || i instanceof Int8Array || Be("Cannot pass non-string to std::string"), f ? s = xr(i) : s = i.length;
        var h = jt(4 + s + 1), p = h + 4;
        if (Y[h >> 2] = s, f)
          ot(i, p, s + 1);
        else if (f)
          for (var E = 0; E < s; ++E) {
            var A = i.charCodeAt(E);
            A > 255 && (Gt(h), Be("String has UTF-16 code units that do not fit in 8 bits")), he[p + E] = A;
          }
        else
          for (var E = 0; E < s; ++E)
            he[p + E] = i[E];
        return n !== null && n.push(Gt, h), h;
      }, argPackAdvance: Lt, readValueFromPointer: hn, destructorFunction(n) {
        Gt(n);
      } });
    }, no = typeof TextDecoder < "u" ? new TextDecoder("utf-16le") : void 0, of = (e, t) => {
      for (var n = e, i = n >> 1, s = i + t / 2; !(i >= s) && Me[i]; )
        ++i;
      if (n = i << 1, n - e > 32 && no)
        return no.decode(he.subarray(e, n));
      for (var f = "", h = 0; !(h >= t / 2); ++h) {
        var p = _e[e + h * 2 >> 1];
        if (p == 0)
          break;
        f += String.fromCharCode(p);
      }
      return f;
    }, sf = (e, t, n) => {
      if (n ?? (n = 2147483647), n < 2)
        return 0;
      n -= 2;
      for (var i = t, s = n < e.length * 2 ? n / 2 : e.length, f = 0; f < s; ++f) {
        var h = e.charCodeAt(f);
        _e[t >> 1] = h, t += 2;
      }
      return _e[t >> 1] = 0, t - i;
    }, lf = (e) => e.length * 2, uf = (e, t) => {
      for (var n = 0, i = ""; !(n >= t / 4); ) {
        var s = k[e + n * 4 >> 2];
        if (s == 0)
          break;
        if (++n, s >= 65536) {
          var f = s - 65536;
          i += String.fromCharCode(55296 | f >> 10, 56320 | f & 1023);
        } else
          i += String.fromCharCode(s);
      }
      return i;
    }, ff = (e, t, n) => {
      if (n ?? (n = 2147483647), n < 4)
        return 0;
      for (var i = t, s = i + n - 4, f = 0; f < e.length; ++f) {
        var h = e.charCodeAt(f);
        if (h >= 55296 && h <= 57343) {
          var p = e.charCodeAt(++f);
          h = 65536 + ((h & 1023) << 10) | p & 1023;
        }
        if (k[t >> 2] = h, t += 4, t + 4 > s)
          break;
      }
      return k[t >> 2] = 0, t - i;
    }, cf = (e) => {
      for (var t = 0, n = 0; n < e.length; ++n) {
        var i = e.charCodeAt(n);
        i >= 55296 && i <= 57343 && ++n, t += 4;
      }
      return t;
    }, df = (e, t, n) => {
      n = ct(n);
      var i, s, f, h;
      t === 2 ? (i = of, s = sf, h = lf, f = (p) => Me[p >> 1]) : t === 4 && (i = uf, s = ff, h = cf, f = (p) => Y[p >> 2]), Rt(e, { name: n, fromWireType: (p) => {
        for (var E = Y[p >> 2], A, I = p + 4, $ = 0; $ <= E; ++$) {
          var B = p + 4 + $ * t;
          if ($ == E || f(B) == 0) {
            var j = B - I, ee = i(I, j);
            A === void 0 ? A = ee : (A += String.fromCharCode(0), A += ee), I = B + t;
          }
        }
        return Gt(p), A;
      }, toWireType: (p, E) => {
        typeof E != "string" && Be(`Cannot pass non-string to C++ string type ${n}`);
        var A = h(E), I = jt(4 + A + t);
        return Y[I >> 2] = A / t, s(E, I + 4, A + t), p !== null && p.push(Gt, I), I;
      }, argPackAdvance: Lt, readValueFromPointer: hn, destructorFunction(p) {
        Gt(p);
      } });
    }, hf = (e, t) => {
      t = ct(t), Rt(e, { isVoid: !0, name: t, argPackAdvance: 0, fromWireType: () => {
      }, toWireType: (n, i) => {
      } });
    }, io = (e, t, n) => {
      var i = [], s = e.toWireType(i, n);
      return i.length && (Y[t >> 2] = qe.toHandle(i)), s;
    }, pf = (e, t, n) => (e = qe.toValue(e), t = mn(t, "emval::as"), io(t, n, e)), gn = [], _f = (e, t, n, i) => (e = gn[e], t = qe.toValue(t), e(null, t, n, i)), bf = {}, bi = (e) => {
      var t = bf[e];
      return t === void 0 ? ct(e) : t;
    }, mf = (e, t, n, i, s) => (e = gn[e], t = qe.toValue(t), n = bi(n), e(t, t[n], i, s)), gf = (e) => {
      var t = gn.length;
      return gn.push(e), t;
    }, yf = (e, t) => {
      for (var n = new Array(e), i = 0; i < e; ++i)
        n[i] = mn(Y[t + i * 4 >> 2], "parameter " + i);
      return n;
    }, vf = Reflect.construct, wf = (e, t, n) => {
      var i = yf(e, t), s = i.shift();
      e--;
      var f = new Array(e), h = (E, A, I, $) => {
        for (var B = 0, j = 0; j < e; ++j)
          f[j] = i[j].readValueFromPointer($ + B), B += i[j].argPackAdvance;
        var ee = n === 1 ? vf(A, f) : A.apply(E, f);
        return io(s, I, ee);
      }, p = `methodCaller<(${i.map((E) => E.name).join(", ")}) => ${s.name}>`;
      return gf(Ur(p, h));
    }, Ef = (e) => (e = bi(e), qe.toHandle(l[e])), xf = (e, t) => (e = qe.toValue(e), t = qe.toValue(t), qe.toHandle(e[t])), Sf = (e) => {
      e > 9 && (Wt[e + 1] += 1);
    }, Tf = (e) => (e = qe.toValue(e), typeof e == "number"), Cf = (e) => qe.toHandle(bi(e)), Ff = (e) => {
      var t = qe.toValue(e);
      di(t), _i(e);
    }, Rf = (e, t, n) => {
      e = qe.toValue(e), t = qe.toValue(t), n = qe.toValue(n), e[t] = n;
    }, Af = (e, t) => {
      e = mn(e, "_emval_take_value");
      var n = e.readValueFromPointer(t);
      return qe.toHandle(n);
    };
    function If(e, t) {
      e = Tr(e);
      var n = new Date(e * 1e3);
      k[t >> 2] = n.getUTCSeconds(), k[t + 4 >> 2] = n.getUTCMinutes(), k[t + 8 >> 2] = n.getUTCHours(), k[t + 12 >> 2] = n.getUTCDate(), k[t + 16 >> 2] = n.getUTCMonth(), k[t + 20 >> 2] = n.getUTCFullYear() - 1900, k[t + 24 >> 2] = n.getUTCDay();
      var i = Date.UTC(n.getUTCFullYear(), 0, 1, 0, 0, 0, 0), s = (n.getTime() - i) / (1e3 * 60 * 60 * 24) | 0;
      k[t + 28 >> 2] = s;
    }
    var kf = (e) => e % 4 === 0 && (e % 100 !== 0 || e % 400 === 0), Pf = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], Df = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334], ao = (e) => {
      var t = kf(e.getFullYear()), n = t ? Pf : Df, i = n[e.getMonth()] + e.getDate() - 1;
      return i;
    };
    function Lf(e, t) {
      e = Tr(e);
      var n = new Date(e * 1e3);
      k[t >> 2] = n.getSeconds(), k[t + 4 >> 2] = n.getMinutes(), k[t + 8 >> 2] = n.getHours(), k[t + 12 >> 2] = n.getDate(), k[t + 16 >> 2] = n.getMonth(), k[t + 20 >> 2] = n.getFullYear() - 1900, k[t + 24 >> 2] = n.getDay();
      var i = ao(n) | 0;
      k[t + 28 >> 2] = i, k[t + 36 >> 2] = -(n.getTimezoneOffset() * 60);
      var s = new Date(n.getFullYear(), 0, 1), f = new Date(n.getFullYear(), 6, 1).getTimezoneOffset(), h = s.getTimezoneOffset(), p = (f != h && n.getTimezoneOffset() == Math.min(h, f)) | 0;
      k[t + 32 >> 2] = p;
    }
    var Bf = function(e) {
      var t = (() => {
        var n = new Date(k[e + 20 >> 2] + 1900, k[e + 16 >> 2], k[e + 12 >> 2], k[e + 8 >> 2], k[e + 4 >> 2], k[e >> 2], 0), i = k[e + 32 >> 2], s = n.getTimezoneOffset(), f = new Date(n.getFullYear(), 0, 1), h = new Date(n.getFullYear(), 6, 1).getTimezoneOffset(), p = f.getTimezoneOffset(), E = Math.min(p, h);
        if (i < 0)
          k[e + 32 >> 2] = +(h != p && E == s);
        else if (i > 0 != (E == s)) {
          var A = Math.max(p, h), I = i > 0 ? E : A;
          n.setTime(n.getTime() + (I - s) * 6e4);
        }
        k[e + 24 >> 2] = n.getDay();
        var $ = ao(n) | 0;
        k[e + 28 >> 2] = $, k[e >> 2] = n.getSeconds(), k[e + 4 >> 2] = n.getMinutes(), k[e + 8 >> 2] = n.getHours(), k[e + 12 >> 2] = n.getDate(), k[e + 16 >> 2] = n.getMonth(), k[e + 20 >> 2] = n.getYear();
        var B = n.getTime();
        return isNaN(B) ? -1 : B / 1e3;
      })();
      return BigInt(t);
    };
    function Mf(e, t, n, i, s, f, h) {
      s = Tr(s);
      try {
        if (isNaN(s))
          return 61;
        var p = Le.getStreamFromFD(i), E = y.mmap(p, e, s, t, n), A = E.ptr;
        return k[f >> 2] = E.allocated, Y[h >> 2] = A, 0;
      } catch (I) {
        if (typeof y > "u" || I.name !== "ErrnoError")
          throw I;
        return -I.errno;
      }
    }
    function Of(e, t, n, i, s, f) {
      f = Tr(f);
      try {
        var h = Le.getStreamFromFD(s);
        n & 2 && Le.doMsync(e, h, t, i, f);
      } catch (p) {
        if (typeof y > "u" || p.name !== "ErrnoError")
          throw p;
        return -p.errno;
      }
    }
    var Nf = (e, t, n, i) => {
      var s = (/* @__PURE__ */ new Date()).getFullYear(), f = new Date(s, 0, 1), h = new Date(s, 6, 1), p = f.getTimezoneOffset(), E = h.getTimezoneOffset(), A = Math.max(p, E);
      Y[e >> 2] = A * 60, k[t >> 2] = +(p != E);
      var I = (j) => {
        var ee = j >= 0 ? "-" : "+", se = Math.abs(j), fe = String(Math.floor(se / 60)).padStart(2, "0"), pe = String(se % 60).padStart(2, "0");
        return `UTC${ee}${fe}${pe}`;
      }, $ = I(p), B = I(E);
      E < p ? (ot($, n, 17), ot(B, i, 17)) : (ot($, i, 17), ot(B, n, 17));
    }, mi = (e, t) => {
      if (le.timingMode = e, le.timingValue = t, !le.func)
        return 1;
      if (le.running || (le.running = !0), e == 0)
        le.scheduler = function() {
          var h = Math.max(0, le.tickStartTime + t - yn()) | 0;
          setTimeout(le.runner, h);
        }, le.method = "timeout";
      else if (e == 1)
        le.scheduler = function() {
          le.requestAnimationFrame(le.runner);
        }, le.method = "rAF";
      else if (e == 2) {
        if (typeof le.setImmediate > "u")
          if (typeof setImmediate > "u") {
            var n = [], i = "setimmediate", s = (f) => {
              (f.data === i || f.data.target === i) && (f.stopPropagation(), n.shift()());
            };
            addEventListener("message", s, !0), le.setImmediate = (f) => {
              n.push(f), postMessage(i, "*");
            };
          } else
            le.setImmediate = setImmediate;
        le.scheduler = function() {
          le.setImmediate(le.runner);
        }, le.method = "immediate";
      }
      return 0;
    }, yn = () => performance.now(), Uf = (e, t, n, i, s) => {
      le.func = e, le.arg = i;
      var f = le.currentlyRunningMainloop;
      function h() {
        return f < le.currentlyRunningMainloop ? (vr(), !1) : !0;
      }
      if (le.running = !1, le.runner = function() {
        if (!Ce) {
          if (le.queue.length > 0) {
            var E = le.queue.shift();
            if (E.func(E.arg), le.remainingBlockers) {
              var A = le.remainingBlockers, I = A % 1 == 0 ? A - 1 : Math.floor(A);
              E.counted ? le.remainingBlockers = I : (I = I + 0.5, le.remainingBlockers = (8 * A + I) / 9);
            }
            if (le.updateStatus(), !h())
              return;
            setTimeout(le.runner, 0);
            return;
          }
          if (h()) {
            if (le.currentFrameNumber = le.currentFrameNumber + 1 | 0, le.timingMode == 1 && le.timingValue > 1 && le.currentFrameNumber % le.timingValue != 0) {
              le.scheduler();
              return;
            } else
              le.timingMode == 0 && (le.tickStartTime = yn());
            le.runIter(e), h() && le.scheduler();
          }
        }
      }, s || (t > 0 ? mi(0, 1e3 / t) : mi(1, 1), le.scheduler()), n)
        throw "unwind";
    }, le = { running: !1, scheduler: null, method: "", currentlyRunningMainloop: 0, func: null, arg: 0, timingMode: 0, timingValue: 0, currentFrameNumber: 0, queue: [], preMainLoop: [], postMainLoop: [], pause() {
      le.scheduler = null, le.currentlyRunningMainloop++;
    }, resume() {
      le.currentlyRunningMainloop++;
      var e = le.timingMode, t = le.timingValue, n = le.func;
      le.func = null, Uf(n, 0, !1, le.arg, !0), mi(e, t), le.scheduler();
    }, updateStatus() {
      if (l.setStatus) {
        var e = l.statusMessage || "Please wait...", t = le.remainingBlockers ?? 0, n = le.expectedBlockers ?? 0;
        t ? t < n ? l.setStatus("{message} ({expected - remaining}/{expected})") : l.setStatus(e) : l.setStatus("");
      }
    }, init() {
      l.preMainLoop && le.preMainLoop.push(l.preMainLoop), l.postMainLoop && le.postMainLoop.push(l.postMainLoop);
    }, runIter(e) {
      if (!Ce) {
        for (var t of le.preMainLoop)
          if (t() === !1)
            return;
        nr(e);
        for (var n of le.postMainLoop)
          n();
      }
    }, nextRAF: 0, fakeRequestAnimationFrame(e) {
      var t = Date.now();
      if (le.nextRAF === 0)
        le.nextRAF = t + 1e3 / 60;
      else
        for (; t + 2 >= le.nextRAF; )
          le.nextRAF += 1e3 / 60;
      var n = Math.max(le.nextRAF - t, 0);
      setTimeout(e, n);
    }, requestAnimationFrame(e) {
      if (typeof requestAnimationFrame == "function") {
        requestAnimationFrame(e);
        return;
      }
      var t = le.fakeRequestAnimationFrame;
      t(e);
    } }, R = { QUEUE_INTERVAL: 25, QUEUE_LOOKAHEAD: 0.1, DEVICE_NAME: "Emscripten OpenAL", CAPTURE_DEVICE_NAME: "Emscripten OpenAL capture", ALC_EXTENSIONS: { ALC_SOFT_pause_device: !0, ALC_SOFT_HRTF: !0 }, AL_EXTENSIONS: { AL_EXT_float32: !0, AL_SOFT_loop_points: !0, AL_SOFT_source_length: !0, AL_EXT_source_distance_model: !0, AL_SOFT_source_spatialize: !0 }, _alcErr: 0, alcErr: 0, deviceRefCounts: {}, alcStringCache: {}, paused: !1, stringCache: {}, contexts: {}, currentCtx: null, buffers: { 0: { id: 0, refCount: 0, audioBuf: null, frequency: 0, bytesPerSample: 2, channels: 1, length: 0 } }, paramArray: [], _nextId: 1, newId: () => R.freeIds.length > 0 ? R.freeIds.pop() : R._nextId++, freeIds: [], scheduleContextAudio: (e) => {
      if (!(le.timingMode === 1 && document.visibilityState != "visible"))
        for (var t in e.sources)
          R.scheduleSourceAudio(e.sources[t]);
    }, scheduleSourceAudio: (e, t) => {
      if (!(le.timingMode === 1 && document.visibilityState != "visible") && e.state === 4114) {
        for (var n = R.updateSourceTime(e), i = e.bufStartTime, s = e.bufOffset, f = e.bufsProcessed, h = 0; h < e.audioQueue.length; h++) {
          var p = e.audioQueue[h];
          i = p._startTime + p._duration, s = 0, f += p._skipCount + 1;
        }
        t || (t = R.QUEUE_LOOKAHEAD);
        for (var E = n + t, A = 0; i < E; ) {
          if (f >= e.bufQueue.length)
            if (e.looping)
              f %= e.bufQueue.length;
            else
              break;
          var I = e.bufQueue[f % e.bufQueue.length];
          if (I.length === 0) {
            if (A++, A === e.bufQueue.length)
              break;
          } else {
            var p = e.context.audioCtx.createBufferSource();
            p.buffer = I.audioBuf, p.playbackRate.value = e.playbackRate, (I.audioBuf._loopStart || I.audioBuf._loopEnd) && (p.loopStart = I.audioBuf._loopStart, p.loopEnd = I.audioBuf._loopEnd);
            var $ = 0;
            e.type === 4136 && e.looping ? ($ = Number.POSITIVE_INFINITY, p.loop = !0, I.audioBuf._loopStart && (p.loopStart = I.audioBuf._loopStart), I.audioBuf._loopEnd && (p.loopEnd = I.audioBuf._loopEnd)) : $ = (I.audioBuf.duration - s) / e.playbackRate, p._startOffset = s, p._duration = $, p._skipCount = A, A = 0, p.connect(e.gain), typeof p.start < "u" ? (i = Math.max(i, e.context.audioCtx.currentTime), p.start(i, s)) : typeof p.noteOn < "u" && (i = Math.max(i, e.context.audioCtx.currentTime), p.noteOn(i)), p._startTime = i, e.audioQueue.push(p), i += $;
          }
          s = 0, f++;
        }
      }
    }, updateSourceTime: (e) => {
      var t = e.context.audioCtx.currentTime;
      if (e.state !== 4114)
        return t;
      isFinite(e.bufStartTime) || (e.bufStartTime = t - e.bufOffset / e.playbackRate, e.bufOffset = 0);
      for (var n = 0; e.audioQueue.length; ) {
        var i = e.audioQueue[0];
        if (e.bufsProcessed += i._skipCount, n = i._startTime + i._duration, t < n)
          break;
        e.audioQueue.shift(), e.bufStartTime = n, e.bufOffset = 0, e.bufsProcessed++;
      }
      if (e.bufsProcessed >= e.bufQueue.length && !e.looping)
        R.setSourceState(e, 4116);
      else if (e.type === 4136 && e.looping) {
        var s = e.bufQueue[0];
        if (s.length === 0)
          e.bufOffset = 0;
        else {
          var f = (t - e.bufStartTime) * e.playbackRate, h = s.audioBuf._loopStart || 0, p = s.audioBuf._loopEnd || s.audioBuf.duration;
          p <= h && (p = s.audioBuf.duration), f < p ? e.bufOffset = f : e.bufOffset = h + (f - h) % (p - h);
        }
      } else if (e.audioQueue[0])
        e.bufOffset = (t - e.audioQueue[0]._startTime) * e.playbackRate;
      else {
        if (e.type !== 4136 && e.looping) {
          var E = R.sourceDuration(e) / e.playbackRate;
          E > 0 && (e.bufStartTime += Math.floor((t - e.bufStartTime) / E) * E);
        }
        for (var A = 0; A < e.bufQueue.length; A++) {
          if (e.bufsProcessed >= e.bufQueue.length)
            if (e.looping)
              e.bufsProcessed %= e.bufQueue.length;
            else {
              R.setSourceState(e, 4116);
              break;
            }
          var s = e.bufQueue[e.bufsProcessed];
          if (s.length > 0) {
            if (n = e.bufStartTime + s.audioBuf.duration / e.playbackRate, t < n) {
              e.bufOffset = (t - e.bufStartTime) * e.playbackRate;
              break;
            }
            e.bufStartTime = n;
          }
          e.bufOffset = 0, e.bufsProcessed++;
        }
      }
      return t;
    }, cancelPendingSourceAudio: (e) => {
      R.updateSourceTime(e);
      for (var t = 1; t < e.audioQueue.length; t++) {
        var n = e.audioQueue[t];
        n.stop();
      }
      e.audioQueue.length > 1 && (e.audioQueue.length = 1);
    }, stopSourceAudio: (e) => {
      for (var t = 0; t < e.audioQueue.length; t++)
        e.audioQueue[t].stop();
      e.audioQueue.length = 0;
    }, setSourceState: (e, t) => {
      t === 4114 ? ((e.state === 4114 || e.state == 4116) && (e.bufsProcessed = 0, e.bufOffset = 0), R.stopSourceAudio(e), e.state = 4114, e.bufStartTime = Number.NEGATIVE_INFINITY, R.scheduleSourceAudio(e)) : t === 4115 ? e.state === 4114 && (R.updateSourceTime(e), R.stopSourceAudio(e), e.state = 4115) : t === 4116 ? e.state !== 4113 && (e.state = 4116, e.bufsProcessed = e.bufQueue.length, e.bufStartTime = Number.NEGATIVE_INFINITY, e.bufOffset = 0, R.stopSourceAudio(e)) : t === 4113 && e.state !== 4113 && (e.state = 4113, e.bufsProcessed = 0, e.bufStartTime = Number.NEGATIVE_INFINITY, e.bufOffset = 0, R.stopSourceAudio(e));
    }, initSourcePanner: (e) => {
      if (e.type !== 4144) {
        for (var t = R.buffers[0], n = 0; n < e.bufQueue.length; n++)
          if (e.bufQueue[n].id !== 0) {
            t = e.bufQueue[n];
            break;
          }
        if (e.spatialize === 1 || e.spatialize === 2 && t.channels === 1) {
          if (e.panner)
            return;
          e.panner = e.context.audioCtx.createPanner(), R.updateSourceGlobal(e), R.updateSourceSpace(e), e.panner.connect(e.context.gain), e.gain.disconnect(), e.gain.connect(e.panner);
        } else {
          if (!e.panner)
            return;
          e.panner.disconnect(), e.gain.disconnect(), e.gain.connect(e.context.gain), e.panner = null;
        }
      }
    }, updateContextGlobal: (e) => {
      for (var t in e.sources)
        R.updateSourceGlobal(e.sources[t]);
    }, updateSourceGlobal: (e) => {
      var t = e.panner;
      if (t) {
        t.refDistance = e.refDistance, t.maxDistance = e.maxDistance, t.rolloffFactor = e.rolloffFactor, t.panningModel = e.context.hrtf ? "HRTF" : "equalpower";
        var n = e.context.sourceDistanceModel ? e.distanceModel : e.context.distanceModel;
        switch (n) {
          case 0:
            t.distanceModel = "inverse", t.refDistance = 340282e33;
            break;
          case 53249:
          case 53250:
            t.distanceModel = "inverse";
            break;
          case 53251:
          case 53252:
            t.distanceModel = "linear";
            break;
          case 53253:
          case 53254:
            t.distanceModel = "exponential";
            break;
        }
      }
    }, updateListenerSpace: (e) => {
      var t = e.audioCtx.listener;
      t.positionX ? (t.positionX.value = e.listener.position[0], t.positionY.value = e.listener.position[1], t.positionZ.value = e.listener.position[2]) : t.setPosition(e.listener.position[0], e.listener.position[1], e.listener.position[2]), t.forwardX ? (t.forwardX.value = e.listener.direction[0], t.forwardY.value = e.listener.direction[1], t.forwardZ.value = e.listener.direction[2], t.upX.value = e.listener.up[0], t.upY.value = e.listener.up[1], t.upZ.value = e.listener.up[2]) : t.setOrientation(e.listener.direction[0], e.listener.direction[1], e.listener.direction[2], e.listener.up[0], e.listener.up[1], e.listener.up[2]);
      for (var n in e.sources)
        R.updateSourceSpace(e.sources[n]);
    }, updateSourceSpace: (e) => {
      if (e.panner) {
        var t = e.panner, n = e.position[0], i = e.position[1], s = e.position[2], f = e.direction[0], h = e.direction[1], p = e.direction[2], E = e.context.listener, A = E.position[0], I = E.position[1], $ = E.position[2];
        if (e.relative) {
          var B = -E.direction[0], j = -E.direction[1], ee = -E.direction[2], se = E.up[0], fe = E.up[1], pe = E.up[2], be = (mo, go, yo) => {
            var vo = Math.sqrt(mo * mo + go * go + yo * yo);
            return vo < Number.EPSILON ? 0 : 1 / vo;
          }, de = be(B, j, ee);
          B *= de, j *= de, ee *= de, de = be(se, fe, pe), se *= de, fe *= de, pe *= de;
          var Ee = fe * ee - pe * j, xe = pe * B - se * ee, oe = se * j - fe * B;
          de = be(Ee, xe, oe), Ee *= de, xe *= de, oe *= de, se = j * oe - ee * xe, fe = ee * Ee - B * oe, pe = B * xe - j * Ee;
          var ke = f, Qe = h, st = p;
          f = ke * Ee + Qe * se + st * B, h = ke * xe + Qe * fe + st * j, p = ke * oe + Qe * pe + st * ee, ke = n, Qe = i, st = s, n = ke * Ee + Qe * se + st * B, i = ke * xe + Qe * fe + st * j, s = ke * oe + Qe * pe + st * ee, n += A, i += I, s += $;
        }
        t.positionX ? (n != t.positionX.value && (t.positionX.value = n), i != t.positionY.value && (t.positionY.value = i), s != t.positionZ.value && (t.positionZ.value = s)) : t.setPosition(n, i, s), t.orientationX ? (f != t.orientationX.value && (t.orientationX.value = f), h != t.orientationY.value && (t.orientationY.value = h), p != t.orientationZ.value && (t.orientationZ.value = p)) : t.setOrientation(f, h, p);
        var je = e.dopplerShift, lt = e.velocity[0], ze = e.velocity[1], Pe = e.velocity[2], $e = E.velocity[0], Re = E.velocity[1], Je = E.velocity[2];
        if (n === A && i === I && s === $ || lt === $e && ze === Re && Pe === Je)
          e.dopplerShift = 1;
        else {
          var tt = e.context.speedOfSound, ur = e.context.dopplerFactor, Sn = A - n, Tn = I - i, Cn = $ - s, bo = Math.sqrt(Sn * Sn + Tn * Tn + Cn * Cn), Fi = (Sn * $e + Tn * Re + Cn * Je) / bo, Ri = (Sn * lt + Tn * ze + Cn * Pe) / bo;
          Fi = Math.min(Fi, tt / ur), Ri = Math.min(Ri, tt / ur), e.dopplerShift = (tt - ur * Fi) / (tt - ur * Ri);
        }
        e.dopplerShift !== je && R.updateSourceRate(e);
      }
    }, updateSourceRate: (e) => {
      if (e.state === 4114) {
        R.cancelPendingSourceAudio(e);
        var t = e.audioQueue[0];
        if (!t)
          return;
        var n;
        e.type === 4136 && e.looping ? n = Number.POSITIVE_INFINITY : n = (t.buffer.duration - t._startOffset) / e.playbackRate, t._duration = n, t.playbackRate.value = e.playbackRate, R.scheduleSourceAudio(e);
      }
    }, sourceDuration: (e) => {
      for (var t = 0, n = 0; n < e.bufQueue.length; n++) {
        var i = e.bufQueue[n].audioBuf;
        t += i ? i.duration : 0;
      }
      return t;
    }, sourceTell: (e) => {
      R.updateSourceTime(e);
      for (var t = 0, n = 0; n < e.bufsProcessed; n++)
        e.bufQueue[n].audioBuf && (t += e.bufQueue[n].audioBuf.duration);
      return t += e.bufOffset, t;
    }, sourceSeek: (e, t) => {
      var n = e.state == 4114;
      if (n && R.setSourceState(e, 4113), e.bufQueue[e.bufsProcessed].audioBuf !== null) {
        for (e.bufsProcessed = 0; t > e.bufQueue[e.bufsProcessed].audioBuf.duration; )
          t -= e.bufQueue[e.bufsProcessed].audioBuf.duration, e.bufsProcessed++;
        e.bufOffset = t;
      }
      n && R.setSourceState(e, 4114);
    }, getGlobalParam: (e, t) => {
      if (!R.currentCtx)
        return null;
      switch (t) {
        case 49152:
          return R.currentCtx.dopplerFactor;
        case 49155:
          return R.currentCtx.speedOfSound;
        case 53248:
          return R.currentCtx.distanceModel;
        default:
          return R.currentCtx.err = 40962, null;
      }
    }, setGlobalParam: (e, t, n) => {
      if (R.currentCtx)
        switch (t) {
          case 49152:
            if (!Number.isFinite(n) || n < 0) {
              R.currentCtx.err = 40963;
              return;
            }
            R.currentCtx.dopplerFactor = n, R.updateListenerSpace(R.currentCtx);
            break;
          case 49155:
            if (!Number.isFinite(n) || n <= 0) {
              R.currentCtx.err = 40963;
              return;
            }
            R.currentCtx.speedOfSound = n, R.updateListenerSpace(R.currentCtx);
            break;
          case 53248:
            switch (n) {
              case 0:
              case 53249:
              case 53250:
              case 53251:
              case 53252:
              case 53253:
              case 53254:
                R.currentCtx.distanceModel = n, R.updateContextGlobal(R.currentCtx);
                break;
              default:
                R.currentCtx.err = 40963;
                return;
            }
            break;
          default:
            R.currentCtx.err = 40962;
            return;
        }
    }, getListenerParam: (e, t) => {
      if (!R.currentCtx)
        return null;
      switch (t) {
        case 4100:
          return R.currentCtx.listener.position;
        case 4102:
          return R.currentCtx.listener.velocity;
        case 4111:
          return R.currentCtx.listener.direction.concat(R.currentCtx.listener.up);
        case 4106:
          return R.currentCtx.gain.gain.value;
        default:
          return R.currentCtx.err = 40962, null;
      }
    }, setListenerParam: (e, t, n) => {
      if (R.currentCtx) {
        if (n === null) {
          R.currentCtx.err = 40962;
          return;
        }
        var i = R.currentCtx.listener;
        switch (t) {
          case 4100:
            if (!Number.isFinite(n[0]) || !Number.isFinite(n[1]) || !Number.isFinite(n[2])) {
              R.currentCtx.err = 40963;
              return;
            }
            i.position[0] = n[0], i.position[1] = n[1], i.position[2] = n[2], R.updateListenerSpace(R.currentCtx);
            break;
          case 4102:
            if (!Number.isFinite(n[0]) || !Number.isFinite(n[1]) || !Number.isFinite(n[2])) {
              R.currentCtx.err = 40963;
              return;
            }
            i.velocity[0] = n[0], i.velocity[1] = n[1], i.velocity[2] = n[2], R.updateListenerSpace(R.currentCtx);
            break;
          case 4106:
            if (!Number.isFinite(n) || n < 0) {
              R.currentCtx.err = 40963;
              return;
            }
            R.currentCtx.gain.gain.value = n;
            break;
          case 4111:
            if (!Number.isFinite(n[0]) || !Number.isFinite(n[1]) || !Number.isFinite(n[2]) || !Number.isFinite(n[3]) || !Number.isFinite(n[4]) || !Number.isFinite(n[5])) {
              R.currentCtx.err = 40963;
              return;
            }
            i.direction[0] = n[0], i.direction[1] = n[1], i.direction[2] = n[2], i.up[0] = n[3], i.up[1] = n[4], i.up[2] = n[5], R.updateListenerSpace(R.currentCtx);
            break;
          default:
            R.currentCtx.err = 40962;
            return;
        }
      }
    }, getBufferParam: (e, t, n) => {
      if (R.currentCtx) {
        var i = R.buffers[t];
        if (!i || t === 0) {
          R.currentCtx.err = 40961;
          return;
        }
        switch (n) {
          case 8193:
            return i.frequency;
          case 8194:
            return i.bytesPerSample * 8;
          case 8195:
            return i.channels;
          case 8196:
            return i.length * i.bytesPerSample * i.channels;
          case 8213:
            return i.length === 0 ? [0, 0] : [(i.audioBuf._loopStart || 0) * i.frequency, (i.audioBuf._loopEnd || i.length) * i.frequency];
          default:
            return R.currentCtx.err = 40962, null;
        }
      }
    }, setBufferParam: (e, t, n, i) => {
      if (R.currentCtx) {
        var s = R.buffers[t];
        if (!s || t === 0) {
          R.currentCtx.err = 40961;
          return;
        }
        if (i === null) {
          R.currentCtx.err = 40962;
          return;
        }
        switch (n) {
          case 8196:
            if (i !== 0) {
              R.currentCtx.err = 40963;
              return;
            }
            break;
          case 8213:
            if (i[0] < 0 || i[0] > s.length || i[1] < 0 || i[1] > s.Length || i[0] >= i[1]) {
              R.currentCtx.err = 40963;
              return;
            }
            if (s.refCount > 0) {
              R.currentCtx.err = 40964;
              return;
            }
            s.audioBuf && (s.audioBuf._loopStart = i[0] / s.frequency, s.audioBuf._loopEnd = i[1] / s.frequency);
            break;
          default:
            R.currentCtx.err = 40962;
            return;
        }
      }
    }, getSourceParam: (e, t, n) => {
      if (!R.currentCtx)
        return null;
      var i = R.currentCtx.sources[t];
      if (!i)
        return R.currentCtx.err = 40961, null;
      switch (n) {
        case 514:
          return i.relative;
        case 4097:
          return i.coneInnerAngle;
        case 4098:
          return i.coneOuterAngle;
        case 4099:
          return i.pitch;
        case 4100:
          return i.position;
        case 4101:
          return i.direction;
        case 4102:
          return i.velocity;
        case 4103:
          return i.looping;
        case 4105:
          return i.type === 4136 ? i.bufQueue[0].id : 0;
        case 4106:
          return i.gain.gain.value;
        case 4109:
          return i.minGain;
        case 4110:
          return i.maxGain;
        case 4112:
          return i.state;
        case 4117:
          return i.bufQueue.length === 1 && i.bufQueue[0].id === 0 ? 0 : i.bufQueue.length;
        case 4118:
          return i.bufQueue.length === 1 && i.bufQueue[0].id === 0 || i.looping ? 0 : i.bufsProcessed;
        case 4128:
          return i.refDistance;
        case 4129:
          return i.rolloffFactor;
        case 4130:
          return i.coneOuterGain;
        case 4131:
          return i.maxDistance;
        case 4132:
          return R.sourceTell(i);
        case 4133:
          var s = R.sourceTell(i);
          return s > 0 && (s *= i.bufQueue[0].frequency), s;
        case 4134:
          var s = R.sourceTell(i);
          return s > 0 && (s *= i.bufQueue[0].frequency * i.bufQueue[0].bytesPerSample), s;
        case 4135:
          return i.type;
        case 4628:
          return i.spatialize;
        case 8201:
          for (var p = 0, f = 0, h = 0; h < i.bufQueue.length; h++)
            p += i.bufQueue[h].length, i.bufQueue[h].id !== 0 && (f = i.bufQueue[h].bytesPerSample * i.bufQueue[h].channels);
          return p * f;
        case 8202:
          for (var p = 0, h = 0; h < i.bufQueue.length; h++)
            p += i.bufQueue[h].length;
          return p;
        case 8203:
          return R.sourceDuration(i);
        case 53248:
          return i.distanceModel;
        default:
          return R.currentCtx.err = 40962, null;
      }
    }, setSourceParam: (e, t, n, i) => {
      if (R.currentCtx) {
        var s = R.currentCtx.sources[t];
        if (!s) {
          R.currentCtx.err = 40961;
          return;
        }
        if (i === null) {
          R.currentCtx.err = 40962;
          return;
        }
        switch (n) {
          case 514:
            if (i === 1)
              s.relative = !0, R.updateSourceSpace(s);
            else if (i === 0)
              s.relative = !1, R.updateSourceSpace(s);
            else {
              R.currentCtx.err = 40963;
              return;
            }
            break;
          case 4097:
            if (!Number.isFinite(i)) {
              R.currentCtx.err = 40963;
              return;
            }
            s.coneInnerAngle = i, s.panner && (s.panner.coneInnerAngle = i % 360);
            break;
          case 4098:
            if (!Number.isFinite(i)) {
              R.currentCtx.err = 40963;
              return;
            }
            s.coneOuterAngle = i, s.panner && (s.panner.coneOuterAngle = i % 360);
            break;
          case 4099:
            if (!Number.isFinite(i) || i <= 0) {
              R.currentCtx.err = 40963;
              return;
            }
            if (s.pitch === i)
              break;
            s.pitch = i, R.updateSourceRate(s);
            break;
          case 4100:
            if (!Number.isFinite(i[0]) || !Number.isFinite(i[1]) || !Number.isFinite(i[2])) {
              R.currentCtx.err = 40963;
              return;
            }
            s.position[0] = i[0], s.position[1] = i[1], s.position[2] = i[2], R.updateSourceSpace(s);
            break;
          case 4101:
            if (!Number.isFinite(i[0]) || !Number.isFinite(i[1]) || !Number.isFinite(i[2])) {
              R.currentCtx.err = 40963;
              return;
            }
            s.direction[0] = i[0], s.direction[1] = i[1], s.direction[2] = i[2], R.updateSourceSpace(s);
            break;
          case 4102:
            if (!Number.isFinite(i[0]) || !Number.isFinite(i[1]) || !Number.isFinite(i[2])) {
              R.currentCtx.err = 40963;
              return;
            }
            s.velocity[0] = i[0], s.velocity[1] = i[1], s.velocity[2] = i[2], R.updateSourceSpace(s);
            break;
          case 4103:
            if (i === 1) {
              if (s.looping = !0, R.updateSourceTime(s), s.type === 4136 && s.audioQueue.length > 0) {
                var f = s.audioQueue[0];
                f.loop = !0, f._duration = Number.POSITIVE_INFINITY;
              }
            } else if (i === 0) {
              s.looping = !1;
              var h = R.updateSourceTime(s);
              if (s.type === 4136 && s.audioQueue.length > 0) {
                var f = s.audioQueue[0];
                f.loop = !1, f._duration = s.bufQueue[0].audioBuf.duration / s.playbackRate, f._startTime = h - s.bufOffset / s.playbackRate;
              }
            } else {
              R.currentCtx.err = 40963;
              return;
            }
            break;
          case 4105:
            if (s.state === 4114 || s.state === 4115) {
              R.currentCtx.err = 40964;
              return;
            }
            if (i === 0) {
              for (var p in s.bufQueue)
                s.bufQueue[p].refCount--;
              s.bufQueue.length = 1, s.bufQueue[0] = R.buffers[0], s.bufsProcessed = 0, s.type = 4144;
            } else {
              var E = R.buffers[i];
              if (!E) {
                R.currentCtx.err = 40963;
                return;
              }
              for (var p in s.bufQueue)
                s.bufQueue[p].refCount--;
              s.bufQueue.length = 0, E.refCount++, s.bufQueue = [E], s.bufsProcessed = 0, s.type = 4136;
            }
            R.initSourcePanner(s), R.scheduleSourceAudio(s);
            break;
          case 4106:
            if (!Number.isFinite(i) || i < 0) {
              R.currentCtx.err = 40963;
              return;
            }
            s.gain.gain.value = i;
            break;
          case 4109:
            if (!Number.isFinite(i) || i < 0 || i > Math.min(s.maxGain, 1)) {
              R.currentCtx.err = 40963;
              return;
            }
            s.minGain = i;
            break;
          case 4110:
            if (!Number.isFinite(i) || i < Math.max(0, s.minGain) || i > 1) {
              R.currentCtx.err = 40963;
              return;
            }
            s.maxGain = i;
            break;
          case 4128:
            if (!Number.isFinite(i) || i < 0) {
              R.currentCtx.err = 40963;
              return;
            }
            s.refDistance = i, s.panner && (s.panner.refDistance = i);
            break;
          case 4129:
            if (!Number.isFinite(i) || i < 0) {
              R.currentCtx.err = 40963;
              return;
            }
            s.rolloffFactor = i, s.panner && (s.panner.rolloffFactor = i);
            break;
          case 4130:
            if (!Number.isFinite(i) || i < 0 || i > 1) {
              R.currentCtx.err = 40963;
              return;
            }
            s.coneOuterGain = i, s.panner && (s.panner.coneOuterGain = i);
            break;
          case 4131:
            if (!Number.isFinite(i) || i < 0) {
              R.currentCtx.err = 40963;
              return;
            }
            s.maxDistance = i, s.panner && (s.panner.maxDistance = i);
            break;
          case 4132:
            if (i < 0 || i > R.sourceDuration(s)) {
              R.currentCtx.err = 40963;
              return;
            }
            R.sourceSeek(s, i);
            break;
          case 4133:
            var $ = R.sourceDuration(s);
            if ($ > 0) {
              var A;
              for (var I in s.bufQueue)
                if (I) {
                  A = s.bufQueue[I].frequency;
                  break;
                }
              i /= A;
            }
            if (i < 0 || i > $) {
              R.currentCtx.err = 40963;
              return;
            }
            R.sourceSeek(s, i);
            break;
          case 4134:
            var $ = R.sourceDuration(s);
            if ($ > 0) {
              var B;
              for (var I in s.bufQueue)
                if (I) {
                  var E = s.bufQueue[I];
                  B = E.frequency * E.bytesPerSample * E.channels;
                  break;
                }
              i /= B;
            }
            if (i < 0 || i > $) {
              R.currentCtx.err = 40963;
              return;
            }
            R.sourceSeek(s, i);
            break;
          case 4628:
            if (i !== 0 && i !== 1 && i !== 2) {
              R.currentCtx.err = 40963;
              return;
            }
            s.spatialize = i, R.initSourcePanner(s);
            break;
          case 8201:
          case 8202:
          case 8203:
            R.currentCtx.err = 40964;
            break;
          case 53248:
            switch (i) {
              case 0:
              case 53249:
              case 53250:
              case 53251:
              case 53252:
              case 53253:
              case 53254:
                s.distanceModel = i, R.currentCtx.sourceDistanceModel && R.updateContextGlobal(R.currentCtx);
                break;
              default:
                R.currentCtx.err = 40963;
                return;
            }
            break;
          default:
            R.currentCtx.err = 40962;
            return;
        }
      }
    }, captures: {}, sharedCaptureAudioCtx: null, requireValidCaptureDevice: (e, t) => {
      if (e === 0)
        return R.alcErr = 40961, null;
      var n = R.captures[e];
      if (!n)
        return R.alcErr = 40961, null;
      var i = n.mediaStreamError;
      return i ? (R.alcErr = 40961, null) : n;
    } }, $f = (e, t, n, i, s) => {
      if (R.currentCtx) {
        var f = R.buffers[e];
        if (!f) {
          R.currentCtx.err = 40963;
          return;
        }
        if (s <= 0) {
          R.currentCtx.err = 40963;
          return;
        }
        var h = null;
        try {
          switch (t) {
            case 4352:
              if (i > 0) {
                h = R.currentCtx.audioCtx.createBuffer(1, i, s);
                for (var p = h.getChannelData(0), E = 0; E < i; ++E)
                  p[E] = he[n++] * 78125e-7 - 1;
              }
              f.bytesPerSample = 1, f.channels = 1, f.length = i;
              break;
            case 4353:
              if (i > 0) {
                h = R.currentCtx.audioCtx.createBuffer(1, i >> 1, s);
                var p = h.getChannelData(0);
                n >>= 1;
                for (var E = 0; E < i >> 1; ++E)
                  p[E] = _e[n++] * 30517578125e-15;
              }
              f.bytesPerSample = 2, f.channels = 1, f.length = i >> 1;
              break;
            case 4354:
              if (i > 0) {
                h = R.currentCtx.audioCtx.createBuffer(2, i >> 1, s);
                for (var p = h.getChannelData(0), A = h.getChannelData(1), E = 0; E < i >> 1; ++E)
                  p[E] = he[n++] * 78125e-7 - 1, A[E] = he[n++] * 78125e-7 - 1;
              }
              f.bytesPerSample = 1, f.channels = 2, f.length = i >> 1;
              break;
            case 4355:
              if (i > 0) {
                h = R.currentCtx.audioCtx.createBuffer(2, i >> 2, s);
                var p = h.getChannelData(0), A = h.getChannelData(1);
                n >>= 1;
                for (var E = 0; E < i >> 2; ++E)
                  p[E] = _e[n++] * 30517578125e-15, A[E] = _e[n++] * 30517578125e-15;
              }
              f.bytesPerSample = 2, f.channels = 2, f.length = i >> 2;
              break;
            case 65552:
              if (i > 0) {
                h = R.currentCtx.audioCtx.createBuffer(1, i >> 2, s);
                var p = h.getChannelData(0);
                n >>= 2;
                for (var E = 0; E < i >> 2; ++E)
                  p[E] = We[n++];
              }
              f.bytesPerSample = 4, f.channels = 1, f.length = i >> 2;
              break;
            case 65553:
              if (i > 0) {
                h = R.currentCtx.audioCtx.createBuffer(2, i >> 3, s);
                var p = h.getChannelData(0), A = h.getChannelData(1);
                n >>= 2;
                for (var E = 0; E < i >> 3; ++E)
                  p[E] = We[n++], A[E] = We[n++];
              }
              f.bytesPerSample = 4, f.channels = 2, f.length = i >> 3;
              break;
            default:
              R.currentCtx.err = 40963;
              return;
          }
          f.frequency = s, f.audioBuf = h;
        } catch {
          R.currentCtx.err = 40963;
          return;
        }
      }
    }, Wf = (e, t) => {
      if (R.currentCtx) {
        for (var n = 0; n < e; ++n) {
          var i = k[t + n * 4 >> 2];
          if (i !== 0) {
            if (!R.buffers[i]) {
              R.currentCtx.err = 40961;
              return;
            }
            if (R.buffers[i].refCount) {
              R.currentCtx.err = 40964;
              return;
            }
          }
        }
        for (var n = 0; n < e; ++n) {
          var i = k[t + n * 4 >> 2];
          i !== 0 && (R.deviceRefCounts[R.buffers[i].deviceId]--, delete R.buffers[i], R.freeIds.push(i));
        }
      }
    }, oo = (e, t, n) => {
      switch (t) {
        case 514:
        case 4097:
        case 4098:
        case 4103:
        case 4105:
        case 4128:
        case 4129:
        case 4131:
        case 4132:
        case 4133:
        case 4134:
        case 4628:
        case 8201:
        case 8202:
        case 53248:
          R.setSourceParam("alSourcei", e, t, n);
          break;
        default:
          R.setSourceParam("alSourcei", e, t, null);
          break;
      }
    }, jf = (e, t) => {
      if (R.currentCtx) {
        for (var n = 0; n < e; ++n) {
          var i = k[t + n * 4 >> 2];
          if (!R.currentCtx.sources[i]) {
            R.currentCtx.err = 40961;
            return;
          }
        }
        for (var n = 0; n < e; ++n) {
          var i = k[t + n * 4 >> 2];
          R.setSourceState(R.currentCtx.sources[i], 4116), oo(i, 4105, 0), delete R.currentCtx.sources[i], R.freeIds.push(i);
        }
      }
    }, Gf = (e, t) => {
      if (R.currentCtx)
        for (var n = 0; n < e; ++n) {
          var i = { deviceId: R.currentCtx.deviceId, id: R.newId(), refCount: 0, audioBuf: null, frequency: 0, bytesPerSample: 2, channels: 1, length: 0 };
          R.deviceRefCounts[i.deviceId]++, R.buffers[i.id] = i, k[t + n * 4 >> 2] = i.id;
        }
    }, Vf = (e, t) => {
      if (R.currentCtx)
        for (var n = 0; n < e; ++n) {
          var i = R.currentCtx.audioCtx.createGain();
          i.connect(R.currentCtx.gain);
          var s = { context: R.currentCtx, id: R.newId(), type: 4144, state: 4113, bufQueue: [R.buffers[0]], audioQueue: [], looping: !1, pitch: 1, dopplerShift: 1, gain: i, minGain: 0, maxGain: 1, panner: null, bufsProcessed: 0, bufStartTime: Number.NEGATIVE_INFINITY, bufOffset: 0, relative: !1, refDistance: 1, maxDistance: 340282e33, rolloffFactor: 1, position: [0, 0, 0], velocity: [0, 0, 0], direction: [0, 0, 0], coneOuterGain: 0, coneInnerAngle: 360, coneOuterAngle: 360, distanceModel: 53250, spatialize: 2, get playbackRate() {
            return this.pitch * this.dopplerShift;
          } };
          R.currentCtx.sources[s.id] = s, k[t + n * 4 >> 2] = s.id;
        }
    }, zf = () => {
      if (!R.currentCtx)
        return 40964;
      var e = R.currentCtx.err;
      return R.currentCtx.err = 0, e;
    }, Hf = (e, t, n) => {
      var i = R.getSourceParam("alGetSourcei", e, t);
      if (i !== null) {
        if (!n) {
          R.currentCtx.err = 40963;
          return;
        }
        switch (t) {
          case 514:
          case 4097:
          case 4098:
          case 4103:
          case 4105:
          case 4112:
          case 4117:
          case 4118:
          case 4128:
          case 4129:
          case 4131:
          case 4132:
          case 4133:
          case 4134:
          case 4135:
          case 4628:
          case 8201:
          case 8202:
          case 53248:
            k[n >> 2] = i;
            break;
          default:
            R.currentCtx.err = 40962;
            return;
        }
      }
    }, vn = (e) => {
      var t = xr(e) + 1, n = jt(t);
      return n && ot(e, n, t), n;
    }, Kf = (e) => {
      if (R.stringCache[e])
        return R.stringCache[e];
      var t;
      switch (e) {
        case 0:
          t = "No Error";
          break;
        case 40961:
          t = "Invalid Name";
          break;
        case 40962:
          t = "Invalid Enum";
          break;
        case 40963:
          t = "Invalid Value";
          break;
        case 40964:
          t = "Invalid Operation";
          break;
        case 40965:
          t = "Out of Memory";
          break;
        case 45057:
          t = "Emscripten";
          break;
        case 45058:
          t = "1.1";
          break;
        case 45059:
          t = "WebAudio";
          break;
        case 45060:
          t = Object.keys(R.AL_EXTENSIONS).join(" ");
          break;
        default:
          return R.currentCtx && (R.currentCtx.err = 40962), 0;
      }
      return t = vn(t), R.stringCache[e] = t, t;
    }, Xf = (e) => {
      if (R.currentCtx) {
        var t = R.currentCtx.sources[e];
        if (!t) {
          R.currentCtx.err = 40961;
          return;
        }
        R.setSourceState(t, 4115);
      }
    }, Yf = (e) => {
      if (R.currentCtx) {
        var t = R.currentCtx.sources[e];
        if (!t) {
          R.currentCtx.err = 40961;
          return;
        }
        R.setSourceState(t, 4114);
      }
    }, Zf = (e) => {
      if (R.currentCtx) {
        var t = R.currentCtx.sources[e];
        if (!t) {
          R.currentCtx.err = 40961;
          return;
        }
        R.setSourceState(t, 4116);
      }
    }, qf = (e, t, n) => {
      switch (t) {
        case 4097:
        case 4098:
        case 4099:
        case 4106:
        case 4109:
        case 4110:
        case 4128:
        case 4129:
        case 4130:
        case 4131:
        case 4132:
        case 4133:
        case 4134:
        case 8203:
          R.setSourceParam("alSourcef", e, t, n);
          break;
        default:
          R.setSourceParam("alSourcef", e, t, null);
          break;
      }
    }, Qf = (e) => !(e in R.deviceRefCounts) || R.deviceRefCounts[e] > 0 ? 0 : (delete R.deviceRefCounts[e], R.freeIds.push(e), 1), Jf = (e, t, n) => e.addEventListener(t, n, { once: !0 }), so = (e, t) => {
      t || (t = [document, document.getElementById("canvas")]), ["keydown", "mousedown", "touchstart"].forEach((n) => {
        t.forEach((i) => {
          i && Jf(i, n, () => {
            e.state === "suspended" && e.resume();
          });
        });
      });
    }, ec = (e, t) => {
      if (!(e in R.deviceRefCounts))
        return R.alcErr = 40961, 0;
      var n = null, i = [], s = null;
      if (t >>= 2, t)
        for (var f = 0, h = 0; f = k[t++], i.push(f), f !== 0; )
          switch (h = k[t++], i.push(h), f) {
            case 4103:
              n || (n = {}), n.sampleRate = h;
              break;
            case 4112:
            case 4113:
              break;
            case 6546:
              switch (h) {
                case 0:
                  s = !1;
                  break;
                case 1:
                  s = !0;
                  break;
                case 2:
                  break;
                default:
                  return R.alcErr = 40964, 0;
              }
              break;
            case 6550:
              if (h !== 0)
                return R.alcErr = 40964, 0;
              break;
            default:
              return R.alcErr = 40964, 0;
          }
      var p = window.AudioContext || window.webkitAudioContext, E = null;
      try {
        n ? E = new p(n) : E = new p();
      } catch (j) {
        return j.name === "NotSupportedError" ? R.alcErr = 40964 : R.alcErr = 40961, 0;
      }
      so(E), typeof E.createGain > "u" && (E.createGain = E.createGainNode);
      var A = E.createGain();
      A.connect(E.destination);
      var I = { deviceId: e, id: R.newId(), attrs: i, audioCtx: E, listener: { position: [0, 0, 0], velocity: [0, 0, 0], direction: [0, 0, 0], up: [0, 0, 0] }, sources: [], interval: setInterval(() => R.scheduleContextAudio(I), R.QUEUE_INTERVAL), gain: A, distanceModel: 53250, speedOfSound: 343.3, dopplerFactor: 1, sourceDistanceModel: !1, hrtf: s || !1, _err: 0, get err() {
        return this._err;
      }, set err(j) {
        (this._err === 0 || j === 0) && (this._err = j);
      } };
      if (R.deviceRefCounts[e]++, R.contexts[I.id] = I, s !== null)
        for (var $ in R.contexts) {
          var B = R.contexts[$];
          B.deviceId === e && (B.hrtf = s, R.updateContextGlobal(B));
        }
      return I.id;
    }, tc = (e) => {
      var t = R.contexts[e];
      if (R.currentCtx === t) {
        R.alcErr = 40962;
        return;
      }
      R.contexts[e].interval && clearInterval(R.contexts[e].interval), R.deviceRefCounts[t.deviceId]--, delete R.contexts[e], R.freeIds.push(e);
    }, rc = (e) => {
      var t = R.alcErr;
      return R.alcErr = 0, t;
    }, nc = (e, t) => {
      if (R.alcStringCache[t])
        return R.alcStringCache[t];
      var n;
      switch (t) {
        case 0:
          n = "No Error";
          break;
        case 40961:
          n = "Invalid Device";
          break;
        case 40962:
          n = "Invalid Context";
          break;
        case 40963:
          n = "Invalid Enum";
          break;
        case 40964:
          n = "Invalid Value";
          break;
        case 40965:
          n = "Out of Memory";
          break;
        case 4100:
          if (typeof AudioContext < "u" || typeof webkitAudioContext < "u")
            n = R.DEVICE_NAME;
          else
            return 0;
          break;
        case 4101:
          typeof AudioContext < "u" || typeof webkitAudioContext < "u" ? n = R.DEVICE_NAME + "\0" : n = "\0";
          break;
        case 785:
          n = R.CAPTURE_DEVICE_NAME;
          break;
        case 784:
          if (e === 0)
            n = R.CAPTURE_DEVICE_NAME + "\0";
          else {
            var i = R.requireValidCaptureDevice(e, "alcGetString");
            if (!i)
              return 0;
            n = i.deviceName;
          }
          break;
        case 4102:
          if (!e)
            return R.alcErr = 40961, 0;
          n = Object.keys(R.ALC_EXTENSIONS).join(" ");
          break;
        default:
          return R.alcErr = 40963, 0;
      }
      return n = vn(n), R.alcStringCache[t] = n, n;
    }, ic = (e) => (e === 0 ? R.currentCtx = null : R.currentCtx = R.contexts[e], 1), ac = (e) => {
      if (e) {
        var t = at(e);
        if (t !== R.DEVICE_NAME)
          return 0;
      }
      if (typeof AudioContext < "u" || typeof webkitAudioContext < "u") {
        var n = R.newId();
        return R.deviceRefCounts[n] = 0, n;
      }
      return 0;
    }, lo = () => Date.now(), oc = (e) => e >= 0 && e <= 3;
    function sc(e, t, n) {
      if (!oc(e))
        return 28;
      var i;
      e === 0 ? i = lo() : i = yn();
      var s = Math.round(i * 1e3 * 1e3);
      return Te[n >> 3] = BigInt(s), 0;
    }
    function lc(e) {
      if (pt.xhrs.has(e)) {
        var t = pt.xhrs.get(e);
        pt.xhrs.free(e), t.readyState > 0 && t.readyState < 4 && t.abort();
      }
    }
    var uo = () => 2147483648, uc = () => uo(), fc = () => !b, cc = (e) => {
      var t = Q.buffer, n = (e - t.byteLength + 65535) / 65536 | 0;
      try {
        return Q.grow(n), ht(), 1;
      } catch {
      }
    }, dc = (e) => {
      var t = he.length;
      e >>>= 0;
      var n = uo();
      if (e > n)
        return !1;
      for (var i = 1; i <= 4; i *= 2) {
        var s = t * (1 + 0.2 / i);
        s = Math.min(s, e + 100663296);
        var f = Math.min(n, Ua(Math.max(e, s), 65536)), h = cc(f);
        if (h)
          return !0;
      }
      return !1;
    };
    class hc {
      constructor() {
        te(this, "allocated", [void 0]);
        te(this, "freelist", []);
      }
      get(t) {
        return this.allocated[t];
      }
      has(t) {
        return this.allocated[t] !== void 0;
      }
      allocate(t) {
        var n = this.freelist.pop() || this.allocated.length;
        return this.allocated[n] = t, n;
      }
      free(t) {
        this.allocated[t] = void 0, this.freelist.push(t);
      }
    }
    var pt = { openDatabase(e, t, n, i) {
      try {
        var s = indexedDB.open(e, t);
      } catch (f) {
        return i(f);
      }
      s.onupgradeneeded = (f) => {
        var h = f.target.result;
        h.objectStoreNames.contains("FILES") && h.deleteObjectStore("FILES"), h.createObjectStore("FILES");
      }, s.onsuccess = (f) => n(f.target.result), s.onerror = i;
    }, init() {
      pt.xhrs = new hc();
      var e = (n) => {
        pt.dbInstance = n, it();
      }, t = () => {
        pt.dbInstance = !1, it();
      };
      mt(), pt.openDatabase("emscripten_filesystem", 1, e, t);
    } };
    function gi(e, t, n, i, s) {
      var f = Y[e + 8 >> 2];
      if (!f) {
        n(e, 0, "no url specified!");
        return;
      }
      var h = at(f), p = e + 108, E = at(p + 0);
      E || (E = "GET");
      var A = Y[p + 56 >> 2], I = Y[p + 68 >> 2], $ = Y[p + 72 >> 2], B = Y[p + 76 >> 2], j = Y[p + 80 >> 2], ee = Y[p + 84 >> 2], se = Y[p + 88 >> 2], fe = Y[p + 52 >> 2], pe = !!(fe & 1), be = !!(fe & 2), de = !!(fe & 64), Ee = I ? at(I) : void 0, xe = $ ? at($) : void 0, oe = new XMLHttpRequest();
      if (oe.withCredentials = !!he[p + 60], oe.open(E, h, !de, Ee, xe), de || (oe.timeout = A), oe.url_ = h, oe.responseType = "arraybuffer", j) {
        var ke = at(j);
        oe.overrideMimeType(ke);
      }
      if (B)
        for (; ; ) {
          var Qe = Y[B >> 2];
          if (!Qe)
            break;
          var st = Y[B + 4 >> 2];
          if (!st)
            break;
          B += 8;
          var je = at(Qe), lt = at(st);
          oe.setRequestHeader(je, lt);
        }
      var ze = pt.xhrs.allocate(oe);
      Y[e >> 2] = ze;
      var Pe = ee && se ? he.slice(ee, ee + se) : null;
      function $e() {
        var Re = 0, Je = 0;
        oe.response && pe && Y[e + 12 >> 2] === 0 && (Je = oe.response.byteLength), Je > 0 && (Re = jt(Je), he.set(new Uint8Array(oe.response), Re)), Y[e + 12 >> 2] = Re, Ct(e + 16, Je), Ct(e + 24, 0);
        var tt = oe.response ? oe.response.byteLength : 0;
        tt && Ct(e + 32, tt), _e[e + 40 >> 1] = oe.readyState, _e[e + 42 >> 1] = oe.status, oe.statusText && ot(oe.statusText, e + 44, 64);
      }
      oe.onload = (Re) => {
        pt.xhrs.has(ze) && ($e(), oe.status >= 200 && oe.status < 300 ? t?.(e, oe, Re) : n?.(e, oe, Re));
      }, oe.onerror = (Re) => {
        pt.xhrs.has(ze) && ($e(), n?.(e, oe, Re));
      }, oe.ontimeout = (Re) => {
        pt.xhrs.has(ze) && n?.(e, oe, Re);
      }, oe.onprogress = (Re) => {
        if (pt.xhrs.has(ze)) {
          var Je = pe && be && oe.response ? oe.response.byteLength : 0, tt = 0;
          Je > 0 && pe && be && (tt = jt(Je), he.set(new Uint8Array(oe.response), tt)), Y[e + 12 >> 2] = tt, Ct(e + 16, Je), Ct(e + 24, Re.loaded - Je), Ct(e + 32, Re.total), _e[e + 40 >> 1] = oe.readyState, oe.readyState >= 3 && oe.status === 0 && Re.loaded > 0 && (oe.status = 200), _e[e + 42 >> 1] = oe.status, oe.statusText && ot(oe.statusText, e + 44, 64), i?.(e, oe, Re), tt && Gt(tt);
        }
      }, oe.onreadystatechange = (Re) => {
        pt.xhrs.has(ze) && (_e[e + 40 >> 1] = oe.readyState, oe.readyState >= 2 && (_e[e + 42 >> 1] = oe.status), s?.(e, oe, Re));
      };
      try {
        oe.send(Pe);
      } catch (Re) {
        n?.(e, oe, Re);
      }
    }
    var Ct = (e, t) => {
      Y[e >> 2] = t;
      var n = Y[e >> 2];
      Y[e + 4 >> 2] = (t - n) / 4294967296;
    };
    function fo(e, t, n, i, s) {
      if (!e) {
        s(t, 0, "IndexedDB not available!");
        return;
      }
      var f = t + 108, h = Y[f + 64 >> 2];
      h || (h = Y[t + 8 >> 2]);
      var p = at(h);
      try {
        var E = e.transaction(["FILES"], "readwrite"), A = E.objectStore("FILES"), I = A.put(n, p);
        I.onsuccess = ($) => {
          _e[t + 40 >> 1] = 4, _e[t + 42 >> 1] = 200, ot("OK", t + 44, 64), i(t, 0, p);
        }, I.onerror = ($) => {
          _e[t + 40 >> 1] = 4, _e[t + 42 >> 1] = 413, ot("Payload Too Large", t + 44, 64), s(t, 0, $);
        };
      } catch ($) {
        s(t, 0, $);
      }
    }
    function pc(e, t, n, i) {
      if (!e) {
        i(t, 0, "IndexedDB not available!");
        return;
      }
      var s = t + 108, f = Y[s + 64 >> 2];
      f || (f = Y[t + 8 >> 2]);
      var h = at(f);
      try {
        var p = e.transaction(["FILES"], "readonly"), E = p.objectStore("FILES"), A = E.get(h);
        A.onsuccess = (I) => {
          if (I.target.result) {
            var $ = I.target.result, B = $.byteLength || $.length, j = jt(B);
            he.set(new Uint8Array($), j), Y[t + 12 >> 2] = j, Ct(t + 16, B), Ct(t + 24, 0), Ct(t + 32, B), _e[t + 40 >> 1] = 4, _e[t + 42 >> 1] = 200, ot("OK", t + 44, 64), n(t, 0, $);
          } else
            _e[t + 40 >> 1] = 4, _e[t + 42 >> 1] = 404, ot("Not Found", t + 44, 64), i(t, 0, "no data");
        }, A.onerror = (I) => {
          _e[t + 40 >> 1] = 4, _e[t + 42 >> 1] = 404, ot("Not Found", t + 44, 64), i(t, 0, I);
        };
      } catch (I) {
        i(t, 0, I);
      }
    }
    function _c(e, t, n, i) {
      if (!e) {
        i(t, 0, "IndexedDB not available!");
        return;
      }
      var s = t + 108, f = Y[s + 64 >> 2];
      f || (f = Y[t + 8 >> 2]);
      var h = at(f);
      try {
        var p = e.transaction(["FILES"], "readwrite"), E = p.objectStore("FILES"), A = E.delete(h);
        A.onsuccess = (I) => {
          var $ = I.target.result;
          Y[t + 12 >> 2] = 0, Ct(t + 16, 0), Ct(t + 24, 0), Ct(t + 32, 0), _e[t + 40 >> 1] = 4, _e[t + 42 >> 1] = 200, ot("OK", t + 44, 64), n(t, 0, $);
        }, A.onerror = (I) => {
          _e[t + 40 >> 1] = 4, _e[t + 42 >> 1] = 404, ot("Not Found", t + 44, 64), i(t, 0, I);
        };
      } catch (I) {
        i(t, 0, I);
      }
    }
    function bc(e, t, n, i, s) {
      var f = e + 108, h = Y[f + 36 >> 2], p = Y[f + 40 >> 2], E = Y[f + 44 >> 2], A = Y[f + 48 >> 2], I = Y[f + 52 >> 2], $ = !!(I & 64);
      function B(je) {
        $ ? je() : nr(je);
      }
      var j = (je, lt, ze) => {
        B(() => {
          h ? or(h)(je) : t?.(je);
        });
      }, ee = (je, lt, ze) => {
        B(() => {
          E ? or(E)(je) : i?.(je);
        });
      }, se = (je, lt, ze) => {
        B(() => {
          p ? or(p)(je) : n?.(je);
        });
      }, fe = (je, lt, ze) => {
        B(() => {
          A ? or(A)(je) : s?.(je);
        });
      }, pe = (je, lt, ze) => {
        gi(je, j, se, ee, fe);
      }, be = (je, lt, ze) => {
        var Pe = (Re, Je, tt) => {
          B(() => {
            h ? or(h)(Re) : t?.(Re);
          });
        }, $e = (Re, Je, tt) => {
          B(() => {
            h ? or(h)(Re) : t?.(Re);
          });
        };
        fo(pt.dbInstance, je, lt.response, Pe, $e);
      }, de = (je, lt, ze) => {
        gi(je, be, se, ee, fe);
      }, Ee = at(f + 0), xe = !!(I & 16), oe = !!(I & 4), ke = !!(I & 32);
      if (Ee === "EM_IDB_STORE") {
        var Qe = Y[f + 84 >> 2], st = Y[f + 88 >> 2];
        fo(pt.dbInstance, e, he.slice(Qe, Qe + st), j, se);
      } else if (Ee === "EM_IDB_DELETE")
        _c(pt.dbInstance, e, j, se);
      else if (!xe)
        pc(pt.dbInstance, e, j, ke ? se : oe ? de : pe);
      else if (!ke)
        gi(e, oe ? be : j, se, ee, fe);
      else
        return 0;
      return e;
    }
    var yi = {}, mc = () => L || "./this.program", Wr = () => {
      if (!Wr.strings) {
        var e = (typeof navigator == "object" && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", t = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: e, _: mc() };
        for (var n in yi)
          yi[n] === void 0 ? delete t[n] : t[n] = yi[n];
        var i = [];
        for (var n in t)
          i.push(`${n}=${t[n]}`);
        Wr.strings = i;
      }
      return Wr.strings;
    }, gc = (e, t) => {
      for (var n = 0; n < e.length; ++n)
        Fe[t++] = e.charCodeAt(n);
      Fe[t] = 0;
    }, yc = (e, t) => {
      var n = 0;
      return Wr().forEach((i, s) => {
        var f = t + n;
        Y[e + s * 4 >> 2] = f, gc(i, f), n += i.length + 1;
      }), 0;
    }, vc = (e, t) => {
      var n = Wr();
      Y[e >> 2] = n.length;
      var i = 0;
      return n.forEach((s) => i += s.length + 1), Y[t >> 2] = i, 0;
    };
    function wc(e) {
      try {
        var t = Le.getStreamFromFD(e);
        return y.close(t), 0;
      } catch (n) {
        if (typeof y > "u" || n.name !== "ErrnoError")
          throw n;
        return n.errno;
      }
    }
    var Ec = (e, t, n, i) => {
      for (var s = 0, f = 0; f < n; f++) {
        var h = Y[t >> 2], p = Y[t + 4 >> 2];
        t += 8;
        var E = y.read(e, Fe, h, p, i);
        if (E < 0)
          return -1;
        if (s += E, E < p)
          break;
        typeof i < "u" && (i += E);
      }
      return s;
    };
    function xc(e, t, n, i) {
      try {
        var s = Le.getStreamFromFD(e), f = Ec(s, t, n);
        return Y[i >> 2] = f, 0;
      } catch (h) {
        if (typeof y > "u" || h.name !== "ErrnoError")
          throw h;
        return h.errno;
      }
    }
    function Sc(e, t, n, i) {
      t = Tr(t);
      try {
        if (isNaN(t))
          return 61;
        var s = Le.getStreamFromFD(e);
        return y.llseek(s, t, n), Te[i >> 3] = BigInt(s.position), s.getdents && t === 0 && n === 0 && (s.getdents = null), 0;
      } catch (f) {
        if (typeof y > "u" || f.name !== "ErrnoError")
          throw f;
        return f.errno;
      }
    }
    function Tc(e) {
      try {
        var t = Le.getStreamFromFD(e);
        return t.stream_ops?.fsync ? t.stream_ops.fsync(t) : 0;
      } catch (n) {
        if (typeof y > "u" || n.name !== "ErrnoError")
          throw n;
        return n.errno;
      }
    }
    var Cc = (e, t, n, i) => {
      for (var s = 0, f = 0; f < n; f++) {
        var h = Y[t >> 2], p = Y[t + 4 >> 2];
        t += 8;
        var E = y.write(e, Fe, h, p, i);
        if (E < 0)
          return -1;
        if (s += E, E < p)
          break;
        typeof i < "u" && (i += E);
      }
      return s;
    };
    function Fc(e, t, n, i) {
      try {
        var s = Le.getStreamFromFD(e), f = Cc(s, t, n);
        return Y[i >> 2] = f, 0;
      } catch (h) {
        if (typeof y > "u" || h.name !== "ErrnoError")
          throw h;
        return h.errno;
      }
    }
    var wn = (e) => {
      for (var t = e.split("."), n = 0; n < 4; n++) {
        var i = Number(t[n]);
        if (isNaN(i))
          return null;
        t[n] = i;
      }
      return (t[0] | t[1] << 8 | t[2] << 16 | t[3] << 24) >>> 0;
    }, jr = (e) => parseInt(e), vi = (e) => {
      var t, n, i, s, f = /^((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\3)::|:\b|$))|(?!\2\3)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4})$/i, h = [];
      if (!f.test(e))
        return null;
      if (e === "::")
        return [0, 0, 0, 0, 0, 0, 0, 0];
      for (e.startsWith("::") ? e = e.replace("::", "Z:") : e = e.replace("::", ":Z:"), e.indexOf(".") > 0 ? (e = e.replace(new RegExp("[.]", "g"), ":"), t = e.split(":"), t[t.length - 4] = jr(t[t.length - 4]) + jr(t[t.length - 3]) * 256, t[t.length - 3] = jr(t[t.length - 2]) + jr(t[t.length - 1]) * 256, t = t.slice(0, t.length - 2)) : t = e.split(":"), i = 0, s = 0, n = 0; n < t.length; n++)
        if (typeof t[n] == "string")
          if (t[n] === "Z") {
            for (s = 0; s < 8 - t.length + 1; s++)
              h[n + s] = 0;
            i = s - 1;
          } else
            h[n + i] = Si(parseInt(t[n], 16));
        else
          h[n + i] = t[n];
      return [h[1] << 16 | h[0], h[3] << 16 | h[2], h[5] << 16 | h[4], h[7] << 16 | h[6]];
    }, Qt = { address_map: { id: 1, addrs: {}, names: {} }, lookup_name(e) {
      var t = wn(e);
      if (t !== null || (t = vi(e), t !== null))
        return e;
      var n;
      if (Qt.address_map.addrs[e])
        n = Qt.address_map.addrs[e];
      else {
        var i = Qt.address_map.id++;
        ge(i < 65535, "exceeded max address mappings of 65535"), n = "172.29." + (i & 255) + "." + (i & 65280), Qt.address_map.names[n] = e, Qt.address_map.addrs[e] = n;
      }
      return n;
    }, lookup_addr(e) {
      return Qt.address_map.names[e] ? Qt.address_map.names[e] : null;
    } }, co = (e) => (e & 255) + "." + (e >> 8 & 255) + "." + (e >> 16 & 255) + "." + (e >> 24 & 255), Rc = (e) => {
      var t = "", n = 0, i = 0, s = 0, f = 0, h = 0, p = 0, E = [e[0] & 65535, e[0] >> 16, e[1] & 65535, e[1] >> 16, e[2] & 65535, e[2] >> 16, e[3] & 65535, e[3] >> 16], A = !0, I = "";
      for (p = 0; p < 5; p++)
        if (E[p] !== 0) {
          A = !1;
          break;
        }
      if (A) {
        if (I = co(E[6] | E[7] << 16), E[5] === -1)
          return t = "::ffff:", t += I, t;
        if (E[5] === 0)
          return t = "::", I === "0.0.0.0" && (I = ""), I === "0.0.0.1" && (I = "1"), t += I, t;
      }
      for (n = 0; n < 8; n++)
        E[n] === 0 && (n - s > 1 && (h = 0), s = n, h++), h > i && (i = h, f = n - i + 1);
      for (n = 0; n < 8; n++) {
        if (i > 1 && E[n] === 0 && n >= f && n < f + i) {
          n === f && (t += ":", f === 0 && (t += ":"));
          continue;
        }
        t += Number(uh(E[n] & 65535)).toString(16), t += n < 7 ? ":" : "";
      }
      return t;
    }, Ac = (e, t, n, i, s) => {
      switch (t) {
        case 2:
          n = wn(n), oi(e, 16), s && (k[s >> 2] = 16), _e[e >> 1] = t, k[e + 4 >> 2] = n, _e[e + 2 >> 1] = Si(i);
          break;
        case 10:
          n = vi(n), oi(e, 28), s && (k[s >> 2] = 28), k[e >> 2] = t, k[e + 8 >> 2] = n[0], k[e + 12 >> 2] = n[1], k[e + 16 >> 2] = n[2], k[e + 20 >> 2] = n[3], _e[e + 2 >> 1] = Si(i);
          break;
        default:
          return 5;
      }
      return 0;
    }, Ic = (e, t, n, i) => {
      var s = 0, f = 0, h = 0, p = 0, E = 0, A = 0, I;
      function $(B, j, ee, se, fe, pe) {
        var be, de, Ee, xe;
        return de = B === 10 ? 28 : 16, fe = B === 10 ? Rc(fe) : co(fe), be = jt(de), xe = Ac(be, B, fe, pe), ge(!xe), Ee = jt(32), k[Ee + 4 >> 2] = B, k[Ee + 8 >> 2] = j, k[Ee + 12 >> 2] = ee, Y[Ee + 24 >> 2] = se, Y[Ee + 20 >> 2] = be, B === 10 ? k[Ee + 16 >> 2] = 28 : k[Ee + 16 >> 2] = 16, k[Ee + 28 >> 2] = 0, Ee;
      }
      if (n && (h = k[n >> 2], p = k[n + 4 >> 2], E = k[n + 8 >> 2], A = k[n + 12 >> 2]), E && !A && (A = E === 2 ? 17 : 6), !E && A && (E = A === 17 ? 2 : 1), A === 0 && (A = 6), E === 0 && (E = 1), !e && !t)
        return -2;
      if (h & -1088 || n !== 0 && k[n >> 2] & 2 && !e)
        return -1;
      if (h & 32)
        return -2;
      if (E !== 0 && E !== 1 && E !== 2)
        return -7;
      if (p !== 0 && p !== 2 && p !== 10)
        return -6;
      if (t && (t = at(t), f = parseInt(t, 10), isNaN(f)))
        return h & 1024 ? -2 : -8;
      if (!e)
        return p === 0 && (p = 2), h & 1 || (p === 2 ? s = En(2130706433) : s = [0, 0, 0, En(1)]), I = $(p, E, A, null, s, f), Y[i >> 2] = I, 0;
      if (e = at(e), s = wn(e), s !== null)
        if (p === 0 || p === 2)
          p = 2;
        else if (p === 10 && h & 8)
          s = [0, 0, En(65535), s], p = 10;
        else
          return -2;
      else if (s = vi(e), s !== null)
        if (p === 0 || p === 10)
          p = 10;
        else
          return -2;
      return s != null ? (I = $(p, E, A, e, s, f), Y[i >> 2] = I, 0) : h & 4 ? -2 : (e = Qt.lookup_name(e), s = wn(e), p === 0 ? p = 2 : p === 10 && (s = [0, 0, En(65535), s]), I = $(p, E, A, null, s, f), Y[i >> 2] = I, 0);
    }, K, Z = { counter: 1, buffers: [], programs: [], framebuffers: [], renderbuffers: [], textures: [], shaders: [], vaos: [], contexts: [], offscreenCanvases: {}, queries: [], samplers: [], transformFeedbacks: [], syncs: [], stringCache: {}, stringiCache: {}, unpackAlignment: 4, unpackRowLength: 0, recordError: (e) => {
      Z.lastError || (Z.lastError = e);
    }, getNewId: (e) => {
      for (var t = Z.counter++, n = e.length; n < t; n++)
        e[n] = null;
      return t;
    }, genObject: (e, t, n, i) => {
      for (var s = 0; s < e; s++) {
        var f = K[n](), h = f && Z.getNewId(i);
        f ? (f.name = h, i[h] = f) : Z.recordError(1282), k[t + s * 4 >> 2] = h;
      }
    }, getSource: (e, t, n, i) => {
      for (var s = "", f = 0; f < t; ++f) {
        var h = i ? Y[i + f * 4 >> 2] : void 0;
        s += at(Y[n + f * 4 >> 2], h);
      }
      return s;
    }, createContext: (e, t) => {
      if (!e.getContextSafariWebGL2Fixed) {
        let s = function(f, h) {
          var p = e.getContextSafariWebGL2Fixed(f, h);
          return f == "webgl" == p instanceof WebGLRenderingContext ? p : null;
        };
        e.getContextSafariWebGL2Fixed = e.getContext, e.getContext = s;
      }
      var n = t.majorVersion > 1 ? e.getContext("webgl2", t) : e.getContext("webgl", t);
      if (!n)
        return 0;
      var i = Z.registerContext(n, t);
      return i;
    }, registerContext: (e, t) => {
      var n = Z.getNewId(Z.contexts), i = { handle: n, attributes: t, version: t.majorVersion, GLctx: e };
      return e.canvas && (e.canvas.GLctxObject = i), Z.contexts[n] = i, n;
    }, makeContextCurrent: (e) => (Z.currentContext = Z.contexts[e], l.ctx = K = Z.currentContext?.GLctx, !(e && !K)), getContext: (e) => Z.contexts[e], deleteContext: (e) => {
      Z.currentContext === Z.contexts[e] && (Z.currentContext = null), typeof JSEvents == "object" && JSEvents.removeAllHandlersOnTarget(Z.contexts[e].GLctx.canvas), Z.contexts[e]?.GLctx?.canvas && (Z.contexts[e].GLctx.canvas.GLctxObject = void 0), Z.contexts[e] = null;
    } }, kc = (e) => K.activeTexture(e), Pc = (e, t) => {
      K.attachShader(Z.programs[e], Z.shaders[t]);
    }, Dc = (e, t) => {
      e == 35051 ? K.currentPixelPackBufferBinding = t : e == 35052 && (K.currentPixelUnpackBufferBinding = t), K.bindBuffer(e, Z.buffers[t]);
    }, Lc = (e, t, n, i, s) => {
      K.bindBufferRange(e, t, Z.buffers[n], i, s);
    }, Bc = (e, t) => {
      K.bindFramebuffer(e, Z.framebuffers[t]);
    }, Mc = (e, t) => {
      K.bindRenderbuffer(e, Z.renderbuffers[t]);
    }, Oc = (e, t) => {
      K.bindTexture(e, Z.textures[t]);
    }, Nc = (e) => {
      K.bindVertexArray(Z.vaos[e]);
    }, Uc = (e) => K.blendEquation(e), $c = (e, t) => K.blendFunc(e, t), Wc = (e, t, n, i) => K.blendFuncSeparate(e, t, n, i), jc = (e, t, n, i, s, f, h, p, E, A) => K.blitFramebuffer(e, t, n, i, s, f, h, p, E, A), Gc = (e, t, n, i) => {
      if (Z.currentContext.version >= 2) {
        n && t ? K.bufferData(e, he, i, n, t) : K.bufferData(e, t, i);
        return;
      }
      K.bufferData(e, n ? he.subarray(n, n + t) : t, i);
    }, Vc = (e, t, n, i) => {
      if (Z.currentContext.version >= 2) {
        n && K.bufferSubData(e, t, he, i, n);
        return;
      }
      K.bufferSubData(e, t, he.subarray(i, i + n));
    }, zc = (e, t, n) => {
      K.clearBufferfv(e, t, We, n >> 2);
    }, Hc = (e, t, n, i) => {
      K.colorMask(!!e, !!t, !!n, !!i);
    }, Kc = (e) => {
      K.compileShader(Z.shaders[e]);
    }, Xc = (e, t, n, i, s, f, h, p) => {
      if (Z.currentContext.version >= 2) {
        if (K.currentPixelUnpackBufferBinding || !h) {
          K.compressedTexImage2D(e, t, n, i, s, f, h, p);
          return;
        }
        K.compressedTexImage2D(e, t, n, i, s, f, he, p, h);
        return;
      }
      K.compressedTexImage2D(e, t, n, i, s, f, he.subarray(p, p + h));
    }, Yc = (e, t, n, i, s, f, h, p, E) => {
      K.currentPixelUnpackBufferBinding ? K.compressedTexImage3D(e, t, n, i, s, f, h, p, E) : K.compressedTexImage3D(e, t, n, i, s, f, h, he, E, p);
    }, Zc = () => {
      var e = Z.getNewId(Z.programs), t = K.createProgram();
      return t.name = e, t.maxUniformLength = t.maxAttributeLength = t.maxUniformBlockNameLength = 0, t.uniformIdCounter = 1, Z.programs[e] = t, e;
    }, qc = (e) => {
      var t = Z.getNewId(Z.shaders);
      return Z.shaders[t] = K.createShader(e), t;
    }, Qc = (e, t) => {
      for (var n = 0; n < e; n++) {
        var i = k[t + n * 4 >> 2], s = Z.buffers[i];
        s && (K.deleteBuffer(s), s.name = 0, Z.buffers[i] = null, i == K.currentPixelPackBufferBinding && (K.currentPixelPackBufferBinding = 0), i == K.currentPixelUnpackBufferBinding && (K.currentPixelUnpackBufferBinding = 0));
      }
    }, Jc = (e, t) => {
      for (var n = 0; n < e; ++n) {
        var i = k[t + n * 4 >> 2], s = Z.framebuffers[i];
        s && (K.deleteFramebuffer(s), s.name = 0, Z.framebuffers[i] = null);
      }
    }, ed = (e) => {
      if (e) {
        var t = Z.programs[e];
        if (!t) {
          Z.recordError(1281);
          return;
        }
        K.deleteProgram(t), t.name = 0, Z.programs[e] = null;
      }
    }, td = (e, t) => {
      for (var n = 0; n < e; n++) {
        var i = k[t + n * 4 >> 2], s = Z.renderbuffers[i];
        s && (K.deleteRenderbuffer(s), s.name = 0, Z.renderbuffers[i] = null);
      }
    }, rd = (e) => {
      if (e) {
        var t = Z.shaders[e];
        if (!t) {
          Z.recordError(1281);
          return;
        }
        K.deleteShader(t), Z.shaders[e] = null;
      }
    }, nd = (e, t) => {
      for (var n = 0; n < e; n++) {
        var i = k[t + n * 4 >> 2], s = Z.textures[i];
        s && (K.deleteTexture(s), s.name = 0, Z.textures[i] = null);
      }
    }, id = (e, t) => {
      for (var n = 0; n < e; n++) {
        var i = k[t + n * 4 >> 2];
        K.deleteVertexArray(Z.vaos[i]), Z.vaos[i] = null;
      }
    }, ad = (e) => K.depthFunc(e), od = (e) => {
      K.depthMask(!!e);
    }, sd = (e) => K.disable(e), ld = (e, t, n) => {
      K.drawArrays(e, t, n);
    }, ud = (e, t, n, i) => {
      K.drawArraysInstanced(e, t, n, i);
    }, wi = [], fd = (e, t) => {
      for (var n = wi[e], i = 0; i < e; i++)
        n[i] = k[t + i * 4 >> 2];
      K.drawBuffers(n);
    }, cd = (e, t, n, i) => {
      K.drawElements(e, t, n, i);
    }, dd = (e, t, n, i, s) => {
      K.drawElementsInstanced(e, t, n, i, s);
    }, hd = (e) => K.enable(e), pd = (e) => {
      K.enableVertexAttribArray(e);
    }, _d = () => K.finish(), bd = (e, t, n, i) => {
      K.framebufferRenderbuffer(e, t, n, Z.renderbuffers[i]);
    }, md = (e, t, n, i, s) => {
      K.framebufferTexture2D(e, t, n, Z.textures[i], s);
    }, gd = (e, t) => {
      Z.genObject(e, t, "createBuffer", Z.buffers);
    }, yd = (e, t) => {
      Z.genObject(e, t, "createFramebuffer", Z.framebuffers);
    }, vd = (e, t) => {
      Z.genObject(e, t, "createRenderbuffer", Z.renderbuffers);
    }, wd = (e, t) => {
      Z.genObject(e, t, "createTexture", Z.textures);
    }, Ed = (e, t) => {
      Z.genObject(e, t, "createVertexArray", Z.vaos);
    }, xd = (e) => K.generateMipmap(e), Sd = () => {
      var e = K.getError() || Z.lastError;
      return Z.lastError = 0, e;
    }, Td = (e) => {
      var t = ["ANGLE_instanced_arrays", "EXT_blend_minmax", "EXT_disjoint_timer_query", "EXT_frag_depth", "EXT_shader_texture_lod", "EXT_sRGB", "OES_element_index_uint", "OES_fbo_render_mipmap", "OES_standard_derivatives", "OES_texture_float", "OES_texture_half_float", "OES_texture_half_float_linear", "OES_vertex_array_object", "WEBGL_color_buffer_float", "WEBGL_depth_texture", "WEBGL_draw_buffers", "EXT_color_buffer_float", "EXT_conservative_depth", "EXT_disjoint_timer_query_webgl2", "EXT_texture_norm16", "NV_shader_noperspective_interpolation", "WEBGL_clip_cull_distance", "EXT_clip_control", "EXT_color_buffer_half_float", "EXT_depth_clamp", "EXT_float_blend", "EXT_polygon_offset_clamp", "EXT_texture_compression_bptc", "EXT_texture_compression_rgtc", "EXT_texture_filter_anisotropic", "KHR_parallel_shader_compile", "OES_texture_float_linear", "WEBGL_blend_func_extended", "WEBGL_compressed_texture_astc", "WEBGL_compressed_texture_etc", "WEBGL_compressed_texture_etc1", "WEBGL_compressed_texture_s3tc", "WEBGL_compressed_texture_s3tc_srgb", "WEBGL_debug_renderer_info", "WEBGL_debug_shaders", "WEBGL_lose_context", "WEBGL_multi_draw", "WEBGL_polygon_mode"];
      return (e.getSupportedExtensions() || []).filter((n) => t.includes(n));
    }, Cd = () => {
      var e = Td(K);
      return e = e.concat(e.map((t) => "GL_" + t)), e;
    }, Fd = (e, t, n) => {
      if (!t) {
        Z.recordError(1281);
        return;
      }
      var i = void 0;
      switch (e) {
        case 36346:
          i = 1;
          break;
        case 36344:
          n != 0 && n != 1 && Z.recordError(1280);
          return;
        case 34814:
        case 36345:
          i = 0;
          break;
        case 34466:
          var s = K.getParameter(34467);
          i = s ? s.length : 0;
          break;
        case 33309:
          if (Z.currentContext.version < 2) {
            Z.recordError(1282);
            return;
          }
          i = Cd().length;
          break;
        case 33307:
        case 33308:
          if (Z.currentContext.version < 2) {
            Z.recordError(1280);
            return;
          }
          i = e == 33307 ? 3 : 0;
          break;
      }
      if (i === void 0) {
        var f = K.getParameter(e);
        switch (typeof f) {
          case "number":
            i = f;
            break;
          case "boolean":
            i = f ? 1 : 0;
            break;
          case "string":
            Z.recordError(1280);
            return;
          case "object":
            if (f === null)
              switch (e) {
                case 34964:
                case 35725:
                case 34965:
                case 36006:
                case 36007:
                case 32873:
                case 34229:
                case 36662:
                case 36663:
                case 35053:
                case 35055:
                case 36010:
                case 35097:
                case 35869:
                case 32874:
                case 36389:
                case 35983:
                case 35368:
                case 34068: {
                  i = 0;
                  break;
                }
                default: {
                  Z.recordError(1280);
                  return;
                }
              }
            else if (f instanceof Float32Array || f instanceof Uint32Array || f instanceof Int32Array || f instanceof Array) {
              for (var h = 0; h < f.length; ++h)
                switch (n) {
                  case 0:
                    k[t + h * 4 >> 2] = f[h];
                    break;
                  case 2:
                    We[t + h * 4 >> 2] = f[h];
                    break;
                  case 4:
                    Fe[t + h] = f[h] ? 1 : 0;
                    break;
                }
              return;
            } else
              try {
                i = f.name | 0;
              } catch (p) {
                Z.recordError(1280), ce(`GL_INVALID_ENUM in glGet${n}v: Unknown object returned from WebGL getParameter(${e})! (error: ${p})`);
                return;
              }
            break;
          default:
            Z.recordError(1280), ce(`GL_INVALID_ENUM in glGet${n}v: Native code calling glGet${n}v(${e}) and it returns ${f} of type ${typeof f}!`);
            return;
        }
      }
      switch (n) {
        case 1:
          Ct(t, i);
          break;
        case 0:
          k[t >> 2] = i;
          break;
        case 2:
          We[t >> 2] = i;
          break;
        case 4:
          Fe[t] = i ? 1 : 0;
          break;
      }
    }, Rd = (e, t) => Fd(e, t, 0), Ad = (e, t, n, i) => {
      var s = K.getProgramInfoLog(Z.programs[e]);
      s === null && (s = "(unknown error)");
      var f = t > 0 && i ? ot(s, i, t) : 0;
      n && (k[n >> 2] = f);
    }, Id = (e, t, n) => {
      if (!n) {
        Z.recordError(1281);
        return;
      }
      if (e >= Z.counter) {
        Z.recordError(1281);
        return;
      }
      if (e = Z.programs[e], t == 35716) {
        var i = K.getProgramInfoLog(e);
        i === null && (i = "(unknown error)"), k[n >> 2] = i.length + 1;
      } else if (t == 35719) {
        if (!e.maxUniformLength)
          for (var s = K.getProgramParameter(e, 35718), f = 0; f < s; ++f)
            e.maxUniformLength = Math.max(e.maxUniformLength, K.getActiveUniform(e, f).name.length + 1);
        k[n >> 2] = e.maxUniformLength;
      } else if (t == 35722) {
        if (!e.maxAttributeLength)
          for (var h = K.getProgramParameter(e, 35721), f = 0; f < h; ++f)
            e.maxAttributeLength = Math.max(e.maxAttributeLength, K.getActiveAttrib(e, f).name.length + 1);
        k[n >> 2] = e.maxAttributeLength;
      } else if (t == 35381) {
        if (!e.maxUniformBlockNameLength)
          for (var p = K.getProgramParameter(e, 35382), f = 0; f < p; ++f)
            e.maxUniformBlockNameLength = Math.max(e.maxUniformBlockNameLength, K.getActiveUniformBlockName(e, f).length + 1);
        k[n >> 2] = e.maxUniformBlockNameLength;
      } else
        k[n >> 2] = K.getProgramParameter(e, t);
    }, kd = (e, t, n, i) => {
      var s = K.getShaderInfoLog(Z.shaders[e]);
      s === null && (s = "(unknown error)");
      var f = t > 0 && i ? ot(s, i, t) : 0;
      n && (k[n >> 2] = f);
    }, Pd = (e, t, n) => {
      if (!n) {
        Z.recordError(1281);
        return;
      }
      if (t == 35716) {
        var i = K.getShaderInfoLog(Z.shaders[e]);
        i === null && (i = "(unknown error)");
        var s = i ? i.length + 1 : 0;
        k[n >> 2] = s;
      } else if (t == 35720) {
        var f = K.getShaderSource(Z.shaders[e]), h = f ? f.length + 1 : 0;
        k[n >> 2] = h;
      } else
        k[n >> 2] = K.getShaderParameter(Z.shaders[e], t);
    }, ho = (e) => e.slice(-1) == "]" && e.lastIndexOf("["), Dd = (e) => {
      var t = e.uniformLocsById, n = e.uniformSizeAndIdsByName, i, s;
      if (!t) {
        e.uniformLocsById = t = {}, e.uniformArrayNamesById = {};
        var f = K.getProgramParameter(e, 35718);
        for (i = 0; i < f; ++i) {
          var h = K.getActiveUniform(e, i), p = h.name, E = h.size, A = ho(p), I = A > 0 ? p.slice(0, A) : p, $ = e.uniformIdCounter;
          for (e.uniformIdCounter += E, n[I] = [E, $], s = 0; s < E; ++s)
            t[$] = s, e.uniformArrayNamesById[$++] = I;
        }
      }
    }, Ld = (e, t) => {
      if (t = at(t), e = Z.programs[e]) {
        Dd(e);
        var n = e.uniformLocsById, i = 0, s = t, f = ho(t);
        f > 0 && (i = jr(t.slice(f + 1)) >>> 0, s = t.slice(0, f));
        var h = e.uniformSizeAndIdsByName[s];
        if (h && i < h[0] && (i += h[1], n[i] = n[i] || K.getUniformLocation(e, t)))
          return i;
      } else
        Z.recordError(1281);
      return -1;
    }, Bd = (e, t, n) => {
      for (var i = wi[t], s = 0; s < t; s++)
        i[s] = k[n + s * 4 >> 2];
      K.invalidateFramebuffer(e, i);
    }, Md = (e) => {
      e = Z.programs[e], K.linkProgram(e), e.uniformLocsById = 0, e.uniformSizeAndIdsByName = {};
    }, Od = (e, t) => {
      e == 3317 ? Z.unpackAlignment = t : e == 3314 && (Z.unpackRowLength = t), K.pixelStorei(e, t);
    }, Nd = (e, t, n) => {
      function i(h, p) {
        return h + p - 1 & -p;
      }
      var s = (Z.unpackRowLength || e) * n, f = i(s, Z.unpackAlignment);
      return t * f;
    }, Ud = (e) => {
      var t = { 5: 3, 6: 4, 8: 2, 29502: 3, 29504: 4, 26917: 2, 26918: 2, 29846: 3, 29847: 4 };
      return t[e - 6402] || 1;
    }, Rr = (e) => (e -= 5120, e == 0 ? Fe : e == 1 ? he : e == 2 ? _e : e == 4 ? k : e == 6 ? We : e == 5 || e == 28922 || e == 28520 || e == 30779 || e == 30782 ? Y : Me), lr = (e, t) => e >>> 31 - Math.clz32(t.BYTES_PER_ELEMENT), Ei = (e, t, n, i, s, f) => {
      var h = Rr(e), p = Ud(t) * h.BYTES_PER_ELEMENT, E = Nd(n, i, p);
      return h.subarray(lr(s, h), lr(s + E, h));
    }, $d = (e, t, n, i, s, f, h) => {
      if (Z.currentContext.version >= 2) {
        if (K.currentPixelPackBufferBinding) {
          K.readPixels(e, t, n, i, s, f, h);
          return;
        }
        var p = Rr(f), E = lr(h, p);
        K.readPixels(e, t, n, i, s, f, p, E);
        return;
      }
      var A = Ei(f, s, n, i, h);
      if (!A) {
        Z.recordError(1280);
        return;
      }
      K.readPixels(e, t, n, i, s, f, A);
    }, Wd = (e, t, n, i) => K.renderbufferStorage(e, t, n, i), jd = (e, t, n, i, s) => K.renderbufferStorageMultisample(e, t, n, i, s), Gd = (e, t, n, i) => {
      var s = Z.getSource(e, t, n, i);
      K.shaderSource(Z.shaders[e], s);
    }, Vd = (e, t, n, i, s, f, h, p, E) => {
      if (Z.currentContext.version >= 2) {
        if (K.currentPixelUnpackBufferBinding) {
          K.texImage2D(e, t, n, i, s, f, h, p, E);
          return;
        }
        if (E) {
          var A = Rr(p), I = lr(E, A);
          K.texImage2D(e, t, n, i, s, f, h, p, A, I);
          return;
        }
      }
      var $ = E ? Ei(p, h, i, s, E) : null;
      K.texImage2D(e, t, n, i, s, f, h, p, $);
    }, zd = (e, t, n, i, s, f, h, p, E, A) => {
      if (K.currentPixelUnpackBufferBinding)
        K.texImage3D(e, t, n, i, s, f, h, p, E, A);
      else if (A) {
        var I = Rr(E);
        K.texImage3D(e, t, n, i, s, f, h, p, E, I, lr(A, I));
      } else
        K.texImage3D(e, t, n, i, s, f, h, p, E, null);
    }, Hd = (e, t, n) => K.texParameteri(e, t, n), Kd = (e, t, n, i, s) => K.texStorage2D(e, t, n, i, s), Xd = (e, t, n, i, s, f, h, p, E) => {
      if (Z.currentContext.version >= 2) {
        if (K.currentPixelUnpackBufferBinding) {
          K.texSubImage2D(e, t, n, i, s, f, h, p, E);
          return;
        }
        if (E) {
          var A = Rr(p);
          K.texSubImage2D(e, t, n, i, s, f, h, p, A, lr(E, A));
          return;
        }
      }
      var I = E ? Ei(p, h, s, f, E) : null;
      K.texSubImage2D(e, t, n, i, s, f, h, p, I);
    }, Yd = (e, t, n, i, s, f, h, p, E, A, I) => {
      if (K.currentPixelUnpackBufferBinding)
        K.texSubImage3D(e, t, n, i, s, f, h, p, E, A, I);
      else if (I) {
        var $ = Rr(A);
        K.texSubImage3D(e, t, n, i, s, f, h, p, E, A, $, lr(I, $));
      } else
        K.texSubImage3D(e, t, n, i, s, f, h, p, E, A, null);
    }, po = (e) => {
      var t = K.currentProgram;
      if (t) {
        var n = t.uniformLocsById[e];
        return typeof n == "number" && (t.uniformLocsById[e] = n = K.getUniformLocation(t, t.uniformArrayNamesById[e] + (n > 0 ? `[${n}]` : ""))), n;
      } else
        Z.recordError(1282);
    }, Zd = (e, t) => {
      K.uniform1i(po(e), t);
    }, qd = (e, t) => {
      K.uniform1ui(po(e), t);
    }, Qd = (e) => {
      e = Z.programs[e], K.useProgram(e), K.currentProgram = e;
    }, Jd = (e, t, n, i, s) => {
      K.vertexAttribIPointer(e, t, n, i, s);
    }, eh = (e, t, n, i, s, f) => {
      K.vertexAttribPointer(e, t, n, !!i, s, f);
    }, th = (e, t, n, i) => K.viewport(e, t, n, i);
    function rh(e, t) {
      try {
        return ni(he.subarray(e, e + t)), 0;
      } catch (n) {
        if (typeof y > "u" || n.name !== "ErrnoError")
          throw n;
        return n.errno;
      }
    }
    var nh = y.createPath, ih = (e) => y.unlink(e), ah = y.createLazyFile, oh = y.createDevice;
    l.requestFullscreen = ae.requestFullscreen, l.setCanvasSize = ae.setCanvasSize, l.getUserMedia = ae.getUserMedia, l.createContext = ae.createContext, y.createPreloadedFile = ja, y.staticInit(), l.FS_createPath = y.createPath, l.FS_createDataFile = y.createDataFile, l.FS_createPreloadedFile = y.createPreloadedFile, l.FS_unlink = y.unlink, l.FS_createLazyFile = y.createLazyFile, l.FS_createDevice = y.createDevice, Se.doesNotExistError = new y.ErrnoError(44), Se.doesNotExistError.stack = "<generic error, no stack>", mu(), Fr = l.BindingError = class extends Error {
      constructor(t) {
        super(t), this.name = "BindingError";
      }
    }, Va = l.InternalError = class extends Error {
      constructor(t) {
        super(t), this.name = "InternalError";
      }
    }, Ru(), Mu(), Ja = l.UnboundTypeError = Ou(Error, "UnboundTypeError"), zu(), l.requestAnimationFrame = le.requestAnimationFrame, l.pauseMainLoop = le.pause, l.resumeMainLoop = le.resume, le.init(), pt.init();
    for (var xi = 0; xi < 32; ++xi)
      wi.push(new Array(xi));
    var _o = { __syscall_dup: eu, __syscall_faccessat: tu, __syscall_fcntl64: ru, __syscall_fstat64: nu, __syscall_ftruncate64: ou, __syscall_getdents64: su, __syscall_ioctl: lu, __syscall_lstat64: uu, __syscall_newfstatat: fu, __syscall_openat: cu, __syscall_readlinkat: du, __syscall_renameat: hu, __syscall_stat64: pu, __syscall_unlinkat: _u, _abort_js: bu, _embind_register_bigint: yu, _embind_register_bool: vu, _embind_register_class: Nu, _embind_register_class_class_function: $u, _embind_register_class_constructor: Wu, _embind_register_class_function: ju, _embind_register_class_property: Gu, _embind_register_emval: Hu, _embind_register_enum: Xu, _embind_register_enum_value: Yu, _embind_register_float: qu, _embind_register_function: Qu, _embind_register_integer: Ju, _embind_register_memory_view: ef, _embind_register_optional: rf, _embind_register_smart_ptr: nf, _embind_register_std_string: af, _embind_register_std_wstring: df, _embind_register_void: hf, _emval_as: pf, _emval_call: _f, _emval_call_method: mf, _emval_decref: _i, _emval_get_method_caller: wf, _emval_get_module_property: Ef, _emval_get_property: xf, _emval_incref: Sf, _emval_is_number: Tf, _emval_new_cstring: Cf, _emval_run_destructors: Ff, _emval_set_property: Rf, _emval_take_value: Af, _gmtime_js: If, _localtime_js: Lf, _mktime_js: Bf, _mmap_js: Mf, _munmap_js: Of, _tzset_js: Nf, alBufferData: $f, alDeleteBuffers: Wf, alDeleteSources: jf, alGenBuffers: Gf, alGenSources: Vf, alGetError: zf, alGetSourcei: Hf, alGetString: Kf, alSourcePause: Xf, alSourcePlay: Yf, alSourceStop: Zf, alSourcef: qf, alSourcei: oo, alcCloseDevice: Qf, alcCreateContext: ec, alcDestroyContext: tc, alcGetError: rc, alcGetString: nc, alcMakeContextCurrent: ic, alcOpenDevice: ac, bnb_get_random_value: T, bnb_randombytes_init_if_needed: D, clock_time_get: sc, create_video: S, create_video_worker: Ne, delete_video: g, emscripten_date_now: lo, emscripten_fetch_free: lc, emscripten_get_heap_max: uc, emscripten_get_now: yn, emscripten_is_main_browser_thread: fc, emscripten_resize_heap: dc, emscripten_start_fetch: bc, environ_get: yc, environ_sizes_get: vc, exit: Ue, fd_close: wc, fd_read: xc, fd_seek: Sc, fd_sync: Tc, fd_write: Fc, get_current_hostname: we, get_user_id_web: u, getaddrinfo: Ic, glActiveTexture: kc, glAttachShader: Pc, glBindBuffer: Dc, glBindBufferRange: Lc, glBindFramebuffer: Bc, glBindRenderbuffer: Mc, glBindTexture: Oc, glBindVertexArray: Nc, glBlendEquation: Uc, glBlendFunc: $c, glBlendFuncSeparate: Wc, glBlitFramebuffer: jc, glBufferData: Gc, glBufferSubData: Vc, glClearBufferfv: zc, glColorMask: Hc, glCompileShader: Kc, glCompressedTexImage2D: Xc, glCompressedTexImage3D: Yc, glCreateProgram: Zc, glCreateShader: qc, glDeleteBuffers: Qc, glDeleteFramebuffers: Jc, glDeleteProgram: ed, glDeleteRenderbuffers: td, glDeleteShader: rd, glDeleteTextures: nd, glDeleteVertexArrays: id, glDepthFunc: ad, glDepthMask: od, glDisable: sd, glDrawArrays: ld, glDrawArraysInstanced: ud, glDrawBuffers: fd, glDrawElements: cd, glDrawElementsInstanced: dd, glEnable: hd, glEnableVertexAttribArray: pd, glFinish: _d, glFramebufferRenderbuffer: bd, glFramebufferTexture2D: md, glGenBuffers: gd, glGenFramebuffers: yd, glGenRenderbuffers: vd, glGenTextures: wd, glGenVertexArrays: Ed, glGenerateMipmap: xd, glGetError: Sd, glGetIntegerv: Rd, glGetProgramInfoLog: Ad, glGetProgramiv: Id, glGetShaderInfoLog: kd, glGetShaderiv: Pd, glGetUniformLocation: Ld, glInvalidateFramebuffer: Bd, glLinkProgram: Md, glPixelStorei: Od, glReadPixels: $d, glRenderbufferStorage: Wd, glRenderbufferStorageMultisample: jd, glShaderSource: Gd, glTexImage2D: Vd, glTexImage3D: zd, glTexParameteri: Hd, glTexStorage2D: Kd, glTexSubImage2D: Xd, glTexSubImage3D: Yd, glUniform1i: Zd, glUniform1ui: qd, glUseProgram: Qd, glVertexAttribIPointer: Jd, glVertexAttribPointer: eh, glViewport: th, hardware_concurrency: c, has_document: F, is_electron: q, random_get: rh }, Ft = await X(), sh = Ft.__getTypeName, jt = l._malloc = Ft.malloc, Gt = l._free = Ft.free, En = Ft.htonl, Si = Ft.htons, lh = Ft.emscripten_builtin_memalign, uh = Ft.ntohs, fh = Ft.__trap;
    l.addRunDependency = mt, l.removeRunDependency = it, l.stringToNewUTF8 = vn, l.FS_createPreloadedFile = ja, l.FS_unlink = ih, l.FS_createPath = nh, l.FS_createDevice = oh, l.FS = y, l.FS_createDataFile = Wa, l.FS_createLazyFile = ah, l.GL = Z;
    function Ti() {
      if (rt > 0) {
        vt = Ti;
        return;
      }
      if (xt(), rt > 0) {
        vt = Ti;
        return;
      }
      function e() {
        l.calledRun = !0, !Ce && (St(), m(l), l.onRuntimeInitialized?.(), bt());
      }
      l.setStatus ? (l.setStatus("Running..."), setTimeout(() => {
        setTimeout(() => l.setStatus(""), 1), e();
      }, 1)) : e();
    }
    if (l.preInit)
      for (typeof l.preInit == "function" && (l.preInit = [l.preInit]); l.preInit.length > 0; )
        l.preInit.pop()();
    Ti(), so = function() {
    };
    const xn = class xn {
      constructor(t, n, i, s = !1) {
        te(this, "FramesQueue", class {
          constructor(t, n = (i, s) => i.index - s.index) {
            this._items = { current: [], next: [] }, this._compare = n, this._endIndex = t, this._pushToNext = !1;
          }
          [Symbol.iterator]() {
            let t = 0, n = this._items;
            return { next() {
              return t < n.current.length ? { value: n.current[t++], done: !1 } : t < n.current.length + n.next.length ? { value: n.next[t++], done: !1 } : { done: !0 };
            } };
          }
          hasLastFrame() {
            return this._pushToNext;
          }
          push(t) {
            this._endIndex === t.realIndex && (this._pushToNext = !0);
            let n = this._pushToNext ? this._items.next : this._items.current, i = 0, s = n.length;
            for (; i < s; ) {
              const f = Math.floor((i + s) / 2);
              this._compare(n[f], t) < 0 ? i = f + 1 : s = f;
            }
            n.splice(i, 0, t);
          }
          shift() {
            const t = this._items.current.shift();
            return !this._items.current.length && this._items.next.length && ([this._items.current, this._items.next] = [this._items.next, this._items.current], this._pushToNext = !1), t;
          }
          peek() {
            return this._items.current[0];
          }
          get length() {
            return this._items.current.length + this._items.next.length;
          }
          empty() {
            return !this._items.current.length && !this._items.next.length;
          }
        });
        if (this._buffer = t, this._onFrame = n, this._decodedFrames = null, this._currentFrame = 0, this._queueSize = xn._minQueueSize, this._error = null, this._logger = { enabled: s, log(...Pe) {
          this.enabled && console.log(...Pe);
        }, warn(...Pe) {
          this.enabled && console.warn(...Pe);
        }, error(...Pe) {
          console.error(...Pe);
        } }, this._useReorderingCache = !0, this._flushing = !1, this._maxOffset = 0, this._sendLoadedOnce = this._once(() => {
          this._logger.warn("call framesLoaded"), i();
        }), this.requestNextFrame = this._requestNextFrame, this.loop = !1, this.paused = !1, !this._findBox(t, ["moov"]))
          throw "moov box not found";
        const h = this._findBox(t, ["moov", "trak", "mdia", "minf", "stbl", "stsd"]);
        if (!h)
          throw "stsd box not found";
        const p = this._findAvcCInStsd(t, h);
        if (!p)
          throw "avcC box not found";
        this._avcCData = t.subarray(p.offset + 8, p.offset + p.size);
        const E = this._findBox(t, ["moov", "trak", "mdia", "minf", "stbl", "stsz"]), A = this._findBox(t, ["moov", "trak", "mdia", "minf", "stbl", "stsc"]), I = this._findBox(t, ["moov", "trak", "mdia", "minf", "stbl", "stco"]), $ = this._findBox(t, ["moov", "trak", "mdia", "minf", "stbl", "stts"]), B = this._findBox(t, ["moov", "trak", "mdia", "minf", "stbl", "stss"]), j = this._findBox(t, ["moov", "trak", "mdia", "minf", "stbl", "ctts"]), ee = this._findBox(t, ["moov", "trak", "mdia", "mdhd"]), se = this._findBox(t, ["moov", "trak"], 0, t.length, !0);
        if (!se || se.length === 0) {
          this._logger.warn("No trak boxes found — is this a valid MP4 file?");
          return;
        }
        for (const Pe of se) {
          const $e = Pe[0];
          if (this._isVideoTrack(t, $e)) {
            const Re = this._findBox(t, ["tkhd"], $e.offset + 8, $e.end);
            if (Re) {
              const { width: Je, height: tt } = this._parseTkhd(t, Re.offset + 8, Re.end);
              this._width = Je, this._height = tt;
            } else
              throw "tkhdBox box not found";
          }
        }
        if (!(E && A && I && $))
          throw "One or more required boxes missing";
        const { sampleCount: fe, sizes: pe } = this._parseStsz(t, E), be = this._parseStsc(t, A);
        this._chunkOffsets = this._parseStco(t, I);
        const de = this._parseStts(t, $), Ee = this._parseCtts(t, j);
        this._stss = this._parseStss(t, B), this._sttsInfo = { stts: de, stsc: be }, this._useReorderingCache = Ee !== null;
        function xe(Pe) {
          const $e = [];
          for (const Re of Pe)
            for (let Je = 0; Je < Re.sampleCount; Je++)
              $e.push(Re.sampleOffset);
          return $e;
        }
        function oe(Pe) {
          const $e = [];
          let Re = 0;
          for (const Je of Pe)
            for (let tt = 0; tt < Je.sampleCount; tt++)
              $e.push(Re), Re += Je.sampleDelta;
          return $e;
        }
        if (this._dtsOffsets = oe(de), this._useReorderingCache) {
          let Pe = function($e, Re) {
            let Je = 0;
            for (const tt of $e) {
              const ur = Math.abs((tt.pts - $e[tt.index].pts) / Re);
              ur > Je && (Je = ur);
            }
            return Je;
          };
          this._ptsOffsets = xe(Ee), this._ptsList = [];
          for (let $e = 0; $e < this._dtsOffsets.length; $e++) {
            const Re = this._dtsOffsets[$e] + this._ptsOffsets[$e];
            this._ptsList.push({ index: $e, dts: this._dtsOffsets[$e], pts: Re });
          }
          this._displayOrder = this._ptsList.slice().sort(($e, Re) => $e.pts - Re.pts), this._logger.log("PTS:", this._ptsOffsets), this._logger.log("DTS:", this._dtsOffsets), this._logger.log("this._displayOrder:", this._displayOrder), this._maxOffset = Pe(this._displayOrder, this._sttsInfo.stts[0].sampleDelta), this._queueSize = this._queueSize + this._maxOffset, this._logger.log("this._maxOffset:", this._maxOffset);
        }
        if (this._logger.log("this._ctts: ", this._ctts), this._logger.log("sttsEntries: ", this._sttsEntries), this._logger.log("stss: ", this._stss), ee) {
          const { timescale: Pe, duration: $e } = this._parseMdhd(t, ee);
          this._logger.log(`Timescale: ${Pe}, Duration: ${$e}`), this._logger.log(`Duration (seconds): ${$e / Pe}`), this._timescale = Pe, this._duration = $e;
        }
        this._sizes = pe, this._sampleOffsets = this._computeSampleOffsets(be, this._chunkOffsets, this._sizes);
        const { sps: ke, pps: Qe } = this._extractSpsPpsFromAvcC(this._avcCData);
        this._sps = ke, this._pps = Qe;
        for (let Pe = 0; Pe < this._sampleOffsets.length; Pe++)
          if (this._sampleOffsets[Pe] + this._sizes[Pe] > t.length)
            throw `Sample #${Pe} is out of bounds! Offset: ${sampleOffsets[Pe]}, Size: ${samples[Pe]}`;
        const st = this._avcCData[1], je = this._avcCData[2], lt = this._avcCData[3], ze = `avc1.${st.toString(16).padStart(2, "0")}${je.toString(16).padStart(2, "0")}${lt.toString(16).padStart(2, "0")}`;
        this._logger.log("Codec string:", ze), this._config = { codec: ze, hardwareAcceleration: "prefer-hardware" }, VideoDecoder.isConfigSupported(this._config).then((Pe) => {
          this._logger.warn(`Decoder ${Pe}:`, JSON.stringify(this._config));
        }), this._checkDecoderState();
        for (let Pe = 0; Pe < this._queueSize; Pe++)
          this._decodeNext();
      }
      play() {
        this.requestNextFrame = this._requestNextFrame;
      }
      close() {
        const t = () => {
          for (const n of this._decodedFrames)
            n.frame.close();
          this._decodedFrames = null;
        };
        if (!this._decoderStateOk) {
          t();
          return;
        }
        this._decoder.flush().then(() => {
          t(), this._decoder.close();
        });
      }
      avcCData() {
        return this._avcCData;
      }
      videoWidth() {
        return this._width;
      }
      videoHeight() {
        return this._height;
      }
      duration() {
        return this._duration;
      }
      timescale() {
        return this._timescale;
      }
      get error() {
      }
      get _decoderStateOk() {
        return this._decoder && this._decoder.state === "configured";
      }
      _checkDecoderState() {
        if (!this._decoderStateOk) {
          if (this._decodedFrames)
            for (const t of this._decodedFrames)
              t.frame.close();
          this._decodedFrames = this._useReorderingCache ? new this.FramesQueue(this._dtsOffsets.length - 1) : [], this._currentFrame = 0, this._decoder = new VideoDecoder({ output: (t) => {
            if (this._useReorderingCache) {
              const n = this._displayOrder.findIndex((s) => s.dts === t.timestamp), i = this._displayOrder[n];
              this._decodedFrames.push({ realIndex: i.index, index: n, pts: i.pts, frame: t });
            } else
              this._decodedFrames.push({ pts: t.timestamp, frame: t });
            this._decodedFrames.length === this._queueSize - this._maxOffset && this._sendLoadedOnce();
          }, error: (t) => {
            this._logger.error("Decoder error:", t);
          } }), this._decoder.configure(this._config);
        }
      }
      _requestNextFrameEOS() {
        return this.loop && (this.requestNextFrame = this._requestNextFrame), -1;
      }
      _requestNextFrame() {
        const t = this._decodedFrames.shift();
        if (!t)
          return -1;
        if (t.index === this._sizes.length - 1 && (this.requestNextFrame = this._requestNextFrameEOS), this._onFrame(t.frame), !this._flushing)
          for (let n = this._decodedFrames.length; n < this._queueSize; n++)
            this._decodeNext();
        return t.pts;
      }
      _decodeNext() {
        this._checkDecoderState();
        let t = 0, n = 0;
        for (; t < this._sttsInfo.stts.length; t++) {
          const E = this._sttsInfo.stts[t];
          if (this._currentFrame < n + E.sampleCount)
            break;
          n += E.sampleCount;
        }
        const i = this._sampleOffsets[this._currentFrame], s = this._sizes[this._currentFrame], f = this._buffer.subarray(i, i + s);
        let h = this._convertLengthPrefixedNALsToAnnexB(f);
        this._isKeyFrame(this._currentFrame) && (h = this._prependSpsPpsToSample(this._sps, this._pps, h));
        const p = this._dtsOffsets[this._currentFrame];
        return this._decoder.decode(new EncodedVideoChunk({ type: this._isKeyFrame(this._currentFrame) ? "key" : "delta", timestamp: p, duration: this._sttsInfo.stts[t].sampleDelta, data: h })), this._currentFrame === this._sizes.length - 1 ? (this._flushing = !0, this._decoder.flush().then(() => {
          this._flushing = !1, this._currentFrame = 0;
        })) : this._currentFrame++, p;
      }
      _prependSpsPpsToSample(t, n, i) {
        const s = [];
        for (const E of t)
          s.push(new Uint8Array([0, 0, 0, 1])), s.push(E);
        for (const E of n)
          s.push(new Uint8Array([0, 0, 0, 1])), s.push(E);
        s.push(i);
        const f = s.reduce((E, A) => E + A.length, 0), h = new Uint8Array(f);
        let p = 0;
        for (const E of s)
          h.set(E, p), p += E.length;
        return h;
      }
      _convertLengthPrefixedNALsToAnnexB(t, n = 4) {
        let i = 0;
        const s = [];
        for (; i < t.length; ) {
          let p = 0;
          for (let E = 0; E < n; E++)
            p = p << 8 | t[i + E];
          i += n, s.push(new Uint8Array([0, 0, 0, 1])), s.push(t.subarray(i, i + p)), i += p;
        }
        const f = new Uint8Array(s.reduce((p, E) => p + E.length, 0));
        let h = 0;
        for (const p of s)
          f.set(p, h), h += p.length;
        return f;
      }
      _extractSpsPpsFromAvcC(t) {
        const n = [], i = [];
        let s = 5;
        const f = t[s] & 31;
        s++;
        for (let p = 0; p < f; p++) {
          const E = t[s] << 8 | t[s + 1];
          s += 2, n.push(t.subarray(s, s + E)), s += E;
        }
        const h = t[s];
        s++;
        for (let p = 0; p < h; p++) {
          const E = t[s] << 8 | t[s + 1];
          s += 2, i.push(t.subarray(s, s + E)), s += E;
        }
        return { sps: n, pps: i };
      }
      _toHex(t) {
        return Array.from(t).map((n) => n.toString(16).padStart(2, "0")).join(" ");
      }
      _dumpBoxes(t, n, i) {
        let s = n;
        for (; s < i; ) {
          const f = t[s] << 24 | t[s + 1] << 16 | t[s + 2] << 8 | t[s + 3], h = String.fromCharCode(t[s + 4], t[s + 5], t[s + 6], t[s + 7]);
          this._logger.log(`Box type: ${h} @ ${s} (size ${f})`), s += f;
        }
      }
      _once(t) {
        let n = !1, i;
        return function(...s) {
          return n || (n = !0, i = t.apply(this, s)), i;
        };
      }
      _readUint32(t, n) {
        return (t[n] << 24 | t[n + 1] << 16 | t[n + 2] << 8 | t[n + 3]) >>> 0;
      }
      _readInt32(t, n) {
        const i = readUint32(t, n);
        return i & 2147483648 ? i - 4294967296 : i;
      }
      _findBox(t, n, i = 0, s = t.length, f = !1) {
        const h = [], p = new DataView(t.buffer, t.byteOffset, t.byteLength);
        let E = i;
        for (; E < s && !(E + 8 > s); ) {
          const A = p.getUint32(E), I = String.fromCharCode(p.getUint8(E + 4), p.getUint8(E + 5), p.getUint8(E + 6), p.getUint8(E + 7));
          if (A === 0)
            break;
          if (I === n[0]) {
            const $ = { size: A, type: I, offset: E, end: E + A };
            if (n.length === 1)
              if (f)
                h.push($);
              else
                return $;
            else {
              const B = this._findBox(t, n.slice(1), E + 8, E + A, f);
              if (B)
                if (f)
                  h.push(B);
                else
                  return B;
            }
          }
          E += A;
        }
        return f ? h : null;
      }
      _isVideoTrack(t, n) {
        const i = this._findBox(t, ["mdia"], n.offset + 8, n.end);
        if (!i) {
          this._logger.warn("No mdia box found in trak");
          return;
        }
        const s = this._findBox(t, ["hdlr"], i.offset + 8, i.end);
        if (!s) {
          this._logger.warn("No hdlr box inside mdia");
          return;
        }
        const f = s.offset + 8, h = String.fromCharCode(t[f + 8], t[f + 9], t[f + 10], t[f + 11]);
        return this._logger.log(`hdlr handler_type: ${h}`), h === "vide";
      }
      _findAvcCInStsd(t, n) {
        const i = new DataView(t.buffer, t.byteOffset, t.byteLength);
        let s = n.offset + 8;
        const f = i.getUint8(s), h = i.getUint8(s + 1) << 16 | i.getUint8(s + 2) << 8 | i.getUint8(s + 3);
        s += 4;
        const p = i.getUint32(s);
        s += 4, this._logger.log("STSD version:", f, "flags:", h.toString(16), "entryCount:", p);
        for (let E = 0; E < p; E++) {
          if (s + 8 > n.offset + n.size) {
            this._logger.warn("Not enough data for sample entry header");
            break;
          }
          const A = i.getUint32(s), I = String.fromCharCode(i.getUint8(s + 4), i.getUint8(s + 5), i.getUint8(s + 6), i.getUint8(s + 7));
          if (this._logger.log(`Sample entry #${E}: type=${I} size=${A}`), I === "avc1" || I === "avc3") {
            let $ = s + 8 + 78;
            const B = s + A;
            for (; $ + 8 <= B; ) {
              const j = i.getUint32($), ee = String.fromCharCode(i.getUint8($ + 4), i.getUint8($ + 5), i.getUint8($ + 6), i.getUint8($ + 7));
              if (this._logger.log(`	Contained box type: ${ee} size: ${j}`), ee === "avcC")
                return { offset: $, size: j, type: ee };
              if (j === 0)
                break;
              $ += j;
            }
          }
          s += A;
        }
        return null;
      }
      _parseStsz(t, n) {
        const i = n.offset + 8, s = t[i], f = t[i + 1] << 16 | t[i + 2] << 8 | t[i + 3], h = this._readUint32(t, i + 4), p = this._readUint32(t, i + 8);
        this._logger.log("STSZ version:", s, "flags:", f, "sampleSize:", h, "sampleCount:", p);
        let E = [];
        if (h === 0) {
          let A = i + 12;
          for (let I = 0; I < p; I++)
            E.push(this._readUint32(t, A)), A += 4;
        } else
          E = new Array(p).fill(h);
        return { sampleCount: p, sizes: E };
      }
      _parseStsc(t, n) {
        const i = n.offset + 8, s = t[i], f = t[i + 1] << 16 | t[i + 2] << 8 | t[i + 3], h = this._readUint32(t, i + 4);
        this._logger.log("STSC version:", s, "flags:", f, "entryCount:", h);
        const p = [];
        let E = i + 8;
        for (let A = 0; A < h; A++) {
          const I = this._readUint32(t, E), $ = this._readUint32(t, E + 4), B = this._readUint32(t, E + 8);
          p.push({ firstChunk: I, samplesPerChunk: $, sampleDescIndex: B }), E += 12;
        }
        return this._logger.log("STSC entries:", p), p;
      }
      _parseStco(t, n) {
        const i = n.offset + 8, s = t[i], f = t[i + 1] << 16 | t[i + 2] << 8 | t[i + 3], h = this._readUint32(t, i + 4);
        this._logger.log("STCO version:", s, "flags:", f, "entryCount:", h);
        const p = [];
        let E = i + 8;
        for (let A = 0; A < h; A++)
          p.push(this._readUint32(t, E)), E += 4;
        return this._logger.log("Chunk offsets:", p), p;
      }
      _parseStts(t, n) {
        const i = n.offset + 8, s = t[i], f = t[i + 1] << 16 | t[i + 2] << 8 | t[i + 3], h = this._readUint32(t, i + 4);
        this._logger.log("STTS version:", s, "flags:", f, "entryCount:", h);
        const p = [];
        let E = i + 8;
        for (let A = 0; A < h; A++) {
          const I = this._readUint32(t, E), $ = this._readUint32(t, E + 4);
          p.push({ sampleCount: I, sampleDelta: $ }), E += 8;
        }
        return this._logger.log("STTS entries:", p), p;
      }
      _computeSampleOffsets(t, n, i) {
        const s = [];
        let f = 0;
        for (let h = 0; h < t.length; h++) {
          const p = t[h], E = t[h + 1], A = E ? E.firstChunk - 1 : n.length;
          for (let I = p.firstChunk; I <= A; I++) {
            let $ = n[I - 1];
            for (let B = 0; B < p.samplesPerChunk && !(f >= i.length); B++)
              s.push($), $ += i[f], f++;
          }
        }
        return s;
      }
      _parseMdhd(t, n) {
        const i = new DataView(t.buffer, t.byteOffset, t.byteLength);
        let s = n.offset + 8;
        const f = i.getUint8(s);
        if (s += 4, f === 1) {
          s += 8 + 8;
          const h = i.getUint32(s), p = i.getBigUint64(s + 4);
          return { timescale: h, duration: p };
        } else {
          s += 4 + 4;
          const h = i.getUint32(s), p = i.getUint32(s + 4);
          return { timescale: h, duration: p };
        }
      }
      _parseTkhd(t, n, i) {
        if (i - n < 84)
          return this._logger.warn("tkhd box too small"), { width: 0, height: 0 };
        const s = t[n + 76] << 24 | t[n + 77] << 16 | t[n + 78] << 8 | t[n + 79], f = t[n + 80] << 24 | t[n + 81] << 16 | t[n + 82] << 8 | t[n + 83], h = s / 65536, p = f / 65536;
        return { width: h, height: p };
      }
      _parseStss(t, n) {
        const i = n.offset + 8, s = t[i], f = t[i + 1] << 16 | t[i + 2] << 8 | t[i + 3], h = this._readUint32(t, i + 4);
        this._logger.log("STSS version:", s, "flags:", f, "entryCount:", h);
        const p = [];
        let E = i + 8;
        for (let A = 0; A < h; A++) {
          const I = this._readUint32(t, E);
          p.push(I), E += 4;
        }
        return this._logger.log("Keyframe sample numbers:", p), p;
      }
      _parseCtts(t, n) {
        if (!n)
          return null;
        const i = n.offset + 8, s = t[i], f = t[i + 1] << 16 | t[i + 2] << 8 | t[i + 3], h = this._readUint32(t, i + 4);
        this._logger.log("CTTS version:", s, "flags:", f, "entryCount:", h);
        const p = [];
        let E = i + 8;
        for (let A = 0; A < h; A++) {
          const I = this._readUint32(t, E), $ = s === 0 ? this._readUint32(t, E + 4) : this._readInt32(t, E + 4);
          p.push({ sampleCount: I, sampleOffset: $ }), E += 8;
        }
        return p;
      }
      _isKeyFrame(t) {
        return this._stss ? this._stss.includes(t + 1) : !0;
      }
    };
    te(xn, "_minQueueSize", 3);
    let Ci = xn;
    return o = v, o;
  };
})();
const ip = np, ap = () => {
  const r = document.createElement("canvas");
  return r.style.maxWidth = "100%", r.style.objectFit = "cover", r;
}, op = async () => WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11])), sp = op, lp = (r) => (r !== "" && !r.endsWith("/") && (r += "/"), (a) => r + a), up = (r) => (a) => r[a], fp = async (r, a = {}) => {
  if (await sp())
    a.info?.('The platform supports SIMD. Going to use "BanubaSDK.simd.wasm"');
  else
    return a.info?.('The platform does not support SIMD. Using "BanubaSDK.wasm"'), r;
  const l = r("BanubaSDK.simd.wasm");
  return l ? await fetch(l, { method: "HEAD" }).then((w) => w.ok) ? (w) => {
    const [v, b] = w.split(".");
    if (b !== "wasm")
      return r(w);
    const P = [v, "simd", b].join(".");
    return r(P);
  } : (a.warn?.(
    `Unable to fetch "BanubaSDK.simd.wasm" from the "${l}". Using "BanubaSDK.wasm" as a fallback`
  ), r) : (a.warn?.(
    '"BanubaSDK.simd.wasm" is missing in the "locateFile" option. Using "BanubaSDK.wasm" as a fallback'
  ), r);
}, cp = (() => {
  try {
    return new URL(".", self.location).toString();
  } catch {
    return "";
  }
})(), dp = async (r, a) => (typeof r > "u" && (r = cp), typeof r == "string" && (r = lp(r)), typeof r == "object" && (r = up(r)), r = await fp(r, a), r);
var zr = /* @__PURE__ */ ((r) => (r.ERROR = "error", r.WARNING = "warn", r.INFO = "info", r.DEBUG = "debug", r))(zr || {});
function hp(r) {
  const a = Object.keys(zr).reverse().find((l) => typeof r[zr[l]] == "function") ?? "ERROR", o = (l) => {
    for (const w in zr)
      if (l.includes(w)) {
        const v = r[zr[w]];
        if (typeof v == "function") {
          v.call(r, l);
          return;
        }
      }
    const m = r.debug;
    typeof m == "function" && m.call(r, l);
  };
  return {
    logLevel: a,
    print: o,
    printErr: o
  };
}
const pp = ["isAliasOf", "clone", "delete", "isDeleted", "deleteLater"], _p = ["size", "get", "set", "push_back"], Os = (r) => {
  if (r == null || typeof r != "function")
    return !1;
  const { prototype: a } = r;
  return a ? pp.every((o) => o in a) : !1;
}, Ns = (r) => r == null || typeof r != "object" ? !1 : Os(r.constructor), Ao = (r) => Ns(r) && _p.every((a) => a in r), bp = (r, a) => new Proxy(r, {
  // instance methods
  get(l, m) {
    const w = l[m];
    return typeof w == "function" ? Us(w, a) : w;
  }
}), Us = (r, a) => new Proxy(r, {
  apply(l, m, w) {
    try {
      const v = l.apply(m, w);
      return Ns(v) ? bp(v, a) : v;
    } catch (v) {
      throw typeof v == "number" && (v = new Error(a(v))), v;
    }
  }
}), mp = (r, a) => new Proxy(r, {
  construct(l, m) {
    try {
      return new l(...m);
    } catch (w) {
      throw typeof w == "number" && (w = new Error(a(w))), w;
    }
  },
  // static methods
  get(l, m) {
    const w = l[m];
    return typeof w == "function" ? Us(w, a) : w;
  }
}), gp = (r, a) => {
  for (const [o, l] of Object.entries(r))
    Os(l) && Object.defineProperty(r, o, { value: mp(l, a) });
}, yp = "recognizer_features_update";
async function vp({
  clientToken: r,
  locateFile: a,
  canvas: o = ap(),
  logger: l = { warn: console.warn, error: console.error },
  ...m
}) {
  const w = await dp(a, l), { logLevel: v, print: b, printErr: P } = hp(l), L = await new Promise(
    (N, H) => ip({
      locateFile: w,
      /**
       * Do *not* pass `canvas` here, it *must* be set later to workaround Emscripten memory leaks
       */
      // canvas,
      print: b,
      printErr: P,
      onAbort: (re) => {
        re instanceof WebAssembly.CompileError && H(
          new Error(
            `Failed to compile "BanubaSDK.wasm": the file "${w(
              "BanubaSDK.wasm"
            )}" is invalid. This error is usually caused by misconfigured "locateFile" option, see https://docs.banuba.com/far-sdk/generated/typedoc/types/SDKOptions.html Original Error: ` + re
          )
        );
      },
      ...m
    }).then(N, H)
  );
  return gp(L, (N) => L.getExceptionMessage(N)), L.UtilityManager.initialize(new L.VectorString(), r), L.UtilityManager.setLogLevel(L.SeverityLevel[v]), L.setCanvasSize = (N, H) => {
    Object.assign(o, { width: N, height: H });
  }, L.createContext(o, !0, !0, {
    alpha: !0,
    antialias: !1,
    depth: !1,
    // desynchronized: true,
    // powerPreference: "high-performance",
    premultipliedAlpha: !1,
    preserveDrawingBuffer: !0,
    stencil: !1
  }), L.canvas = o, $s(L.ctx), L;
}
function $s(r) {
  const a = ["EXT_color_buffer_half_float", "EXT_color_buffer_float"];
  for (const o of a)
    r.getExtension(o);
}
var gt = /* @__PURE__ */ ((r) => (r[r.Running = 0] = "Running", r[r.Idle = 1] = "Idle", r[r.Paused = 2] = "Paused", r))(gt || {}), Ws = { exports: {} }, Li = { exports: {} }, tr = {}, tn = {};
tn.byteLength = xp;
tn.toByteArray = Tp;
tn.fromByteArray = Rp;
var Ot = [], At = [], wp = typeof Uint8Array < "u" ? Uint8Array : Array, Bi = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
for (var Ar = 0, Ep = Bi.length; Ar < Ep; ++Ar)
  Ot[Ar] = Bi[Ar], At[Bi.charCodeAt(Ar)] = Ar;
At["-".charCodeAt(0)] = 62;
At["_".charCodeAt(0)] = 63;
function js(r) {
  var a = r.length;
  if (a % 4 > 0)
    throw new Error("Invalid string. Length must be a multiple of 4");
  var o = r.indexOf("=");
  o === -1 && (o = a);
  var l = o === a ? 0 : 4 - o % 4;
  return [o, l];
}
function xp(r) {
  var a = js(r), o = a[0], l = a[1];
  return (o + l) * 3 / 4 - l;
}
function Sp(r, a, o) {
  return (a + o) * 3 / 4 - o;
}
function Tp(r) {
  var a, o = js(r), l = o[0], m = o[1], w = new wp(Sp(r, l, m)), v = 0, b = m > 0 ? l - 4 : l, P;
  for (P = 0; P < b; P += 4)
    a = At[r.charCodeAt(P)] << 18 | At[r.charCodeAt(P + 1)] << 12 | At[r.charCodeAt(P + 2)] << 6 | At[r.charCodeAt(P + 3)], w[v++] = a >> 16 & 255, w[v++] = a >> 8 & 255, w[v++] = a & 255;
  return m === 2 && (a = At[r.charCodeAt(P)] << 2 | At[r.charCodeAt(P + 1)] >> 4, w[v++] = a & 255), m === 1 && (a = At[r.charCodeAt(P)] << 10 | At[r.charCodeAt(P + 1)] << 4 | At[r.charCodeAt(P + 2)] >> 2, w[v++] = a >> 8 & 255, w[v++] = a & 255), w;
}
function Cp(r) {
  return Ot[r >> 18 & 63] + Ot[r >> 12 & 63] + Ot[r >> 6 & 63] + Ot[r & 63];
}
function Fp(r, a, o) {
  for (var l, m = [], w = a; w < o; w += 3)
    l = (r[w] << 16 & 16711680) + (r[w + 1] << 8 & 65280) + (r[w + 2] & 255), m.push(Cp(l));
  return m.join("");
}
function Rp(r) {
  for (var a, o = r.length, l = o % 3, m = [], w = 16383, v = 0, b = o - l; v < b; v += w)
    m.push(Fp(r, v, v + w > b ? b : v + w));
  return l === 1 ? (a = r[o - 1], m.push(
    Ot[a >> 2] + Ot[a << 4 & 63] + "=="
  )) : l === 2 && (a = (r[o - 2] << 8) + r[o - 1], m.push(
    Ot[a >> 10] + Ot[a >> 4 & 63] + Ot[a << 2 & 63] + "="
  )), m.join("");
}
var jn = {};
/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
jn.read = function(r, a, o, l, m) {
  var w, v, b = m * 8 - l - 1, P = (1 << b) - 1, L = P >> 1, N = -7, H = o ? m - 1 : 0, re = o ? -1 : 1, z = r[a + H];
  for (H += re, w = z & (1 << -N) - 1, z >>= -N, N += b; N > 0; w = w * 256 + r[a + H], H += re, N -= 8)
    ;
  for (v = w & (1 << -N) - 1, w >>= -N, N += l; N > 0; v = v * 256 + r[a + H], H += re, N -= 8)
    ;
  if (w === 0)
    w = 1 - L;
  else {
    if (w === P)
      return v ? NaN : (z ? -1 : 1) * (1 / 0);
    v = v + Math.pow(2, l), w = w - L;
  }
  return (z ? -1 : 1) * v * Math.pow(2, w - l);
};
jn.write = function(r, a, o, l, m, w) {
  var v, b, P, L = w * 8 - m - 1, N = (1 << L) - 1, H = N >> 1, re = m === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0, z = l ? 0 : w - 1, G = l ? 1 : -1, ve = a < 0 || a === 0 && 1 / a < 0 ? 1 : 0;
  for (a = Math.abs(a), isNaN(a) || a === 1 / 0 ? (b = isNaN(a) ? 1 : 0, v = N) : (v = Math.floor(Math.log(a) / Math.LN2), a * (P = Math.pow(2, -v)) < 1 && (v--, P *= 2), v + H >= 1 ? a += re / P : a += re * Math.pow(2, 1 - H), a * P >= 2 && (v++, P /= 2), v + H >= N ? (b = 0, v = N) : v + H >= 1 ? (b = (a * P - 1) * Math.pow(2, m), v = v + H) : (b = a * Math.pow(2, H - 1) * Math.pow(2, m), v = 0)); m >= 8; r[o + z] = b & 255, z += G, b /= 256, m -= 8)
    ;
  for (v = v << m | b, L += m; L > 0; r[o + z] = v & 255, z += G, v /= 256, L -= 8)
    ;
  r[o + z - G] |= ve * 128;
};
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
(function(r) {
  const a = tn, o = jn, l = typeof Symbol == "function" && typeof Symbol.for == "function" ? Symbol.for("nodejs.util.inspect.custom") : null;
  r.Buffer = b, r.SlowBuffer = Q, r.INSPECT_MAX_BYTES = 50;
  const m = 2147483647;
  r.kMaxLength = m, b.TYPED_ARRAY_SUPPORT = w(), !b.TYPED_ARRAY_SUPPORT && typeof console < "u" && typeof console.error == "function" && console.error(
    "This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support."
  );
  function w() {
    try {
      const g = new Uint8Array(1), u = { foo: function() {
        return 42;
      } };
      return Object.setPrototypeOf(u, Uint8Array.prototype), Object.setPrototypeOf(g, u), g.foo() === 42;
    } catch {
      return !1;
    }
  }
  Object.defineProperty(b.prototype, "parent", {
    enumerable: !0,
    get: function() {
      if (b.isBuffer(this))
        return this.buffer;
    }
  }), Object.defineProperty(b.prototype, "offset", {
    enumerable: !0,
    get: function() {
      if (b.isBuffer(this))
        return this.byteOffset;
    }
  });
  function v(g) {
    if (g > m)
      throw new RangeError('The value "' + g + '" is invalid for option "size"');
    const u = new Uint8Array(g);
    return Object.setPrototypeOf(u, b.prototype), u;
  }
  function b(g, u, c) {
    if (typeof g == "number") {
      if (typeof u == "string")
        throw new TypeError(
          'The "string" argument must be of type string. Received type number'
        );
      return H(g);
    }
    return P(g, u, c);
  }
  b.poolSize = 8192;
  function P(g, u, c) {
    if (typeof g == "string")
      return re(g, u);
    if (ArrayBuffer.isView(g))
      return G(g);
    if (g == null)
      throw new TypeError(
        "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof g
      );
    if (q(g, ArrayBuffer) || g && q(g.buffer, ArrayBuffer) || typeof SharedArrayBuffer < "u" && (q(g, SharedArrayBuffer) || g && q(g.buffer, SharedArrayBuffer)))
      return ve(g, u, c);
    if (typeof g == "number")
      throw new TypeError(
        'The "value" argument must not be of type number. Received type number'
      );
    const T = g.valueOf && g.valueOf();
    if (T != null && T !== g)
      return b.from(T, u, c);
    const D = ce(g);
    if (D)
      return D;
    if (typeof Symbol < "u" && Symbol.toPrimitive != null && typeof g[Symbol.toPrimitive] == "function")
      return b.from(g[Symbol.toPrimitive]("string"), u, c);
    throw new TypeError(
      "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof g
    );
  }
  b.from = function(g, u, c) {
    return P(g, u, c);
  }, Object.setPrototypeOf(b.prototype, Uint8Array.prototype), Object.setPrototypeOf(b, Uint8Array);
  function L(g) {
    if (typeof g != "number")
      throw new TypeError('"size" argument must be of type number');
    if (g < 0)
      throw new RangeError('The value "' + g + '" is invalid for option "size"');
  }
  function N(g, u, c) {
    return L(g), g <= 0 ? v(g) : u !== void 0 ? typeof c == "string" ? v(g).fill(u, c) : v(g).fill(u) : v(g);
  }
  b.alloc = function(g, u, c) {
    return N(g, u, c);
  };
  function H(g) {
    return L(g), v(g < 0 ? 0 : ue(g) | 0);
  }
  b.allocUnsafe = function(g) {
    return H(g);
  }, b.allocUnsafeSlow = function(g) {
    return H(g);
  };
  function re(g, u) {
    if ((typeof u != "string" || u === "") && (u = "utf8"), !b.isEncoding(u))
      throw new TypeError("Unknown encoding: " + u);
    const c = Ce(g, u) | 0;
    let T = v(c);
    const D = T.write(g, u);
    return D !== c && (T = T.slice(0, D)), T;
  }
  function z(g) {
    const u = g.length < 0 ? 0 : ue(g.length) | 0, c = v(u);
    for (let T = 0; T < u; T += 1)
      c[T] = g[T] & 255;
    return c;
  }
  function G(g) {
    if (q(g, Uint8Array)) {
      const u = new Uint8Array(g);
      return ve(u.buffer, u.byteOffset, u.byteLength);
    }
    return z(g);
  }
  function ve(g, u, c) {
    if (u < 0 || g.byteLength < u)
      throw new RangeError('"offset" is outside of buffer bounds');
    if (g.byteLength < u + (c || 0))
      throw new RangeError('"length" is outside of buffer bounds');
    let T;
    return u === void 0 && c === void 0 ? T = new Uint8Array(g) : c === void 0 ? T = new Uint8Array(g, u) : T = new Uint8Array(g, u, c), Object.setPrototypeOf(T, b.prototype), T;
  }
  function ce(g) {
    if (b.isBuffer(g)) {
      const u = ue(g.length) | 0, c = v(u);
      return c.length === 0 || g.copy(c, 0, 0, u), c;
    }
    if (g.length !== void 0)
      return typeof g.length != "number" || we(g.length) ? v(0) : z(g);
    if (g.type === "Buffer" && Array.isArray(g.data))
      return z(g.data);
  }
  function ue(g) {
    if (g >= m)
      throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + m.toString(16) + " bytes");
    return g | 0;
  }
  function Q(g) {
    return +g != g && (g = 0), b.alloc(+g);
  }
  b.isBuffer = function(u) {
    return u != null && u._isBuffer === !0 && u !== b.prototype;
  }, b.compare = function(u, c) {
    if (q(u, Uint8Array) && (u = b.from(u, u.offset, u.byteLength)), q(c, Uint8Array) && (c = b.from(c, c.offset, c.byteLength)), !b.isBuffer(u) || !b.isBuffer(c))
      throw new TypeError(
        'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
      );
    if (u === c)
      return 0;
    let T = u.length, D = c.length;
    for (let W = 0, V = Math.min(T, D); W < V; ++W)
      if (u[W] !== c[W]) {
        T = u[W], D = c[W];
        break;
      }
    return T < D ? -1 : D < T ? 1 : 0;
  }, b.isEncoding = function(u) {
    switch (String(u).toLowerCase()) {
      case "hex":
      case "utf8":
      case "utf-8":
      case "ascii":
      case "latin1":
      case "binary":
      case "base64":
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return !0;
      default:
        return !1;
    }
  }, b.concat = function(u, c) {
    if (!Array.isArray(u))
      throw new TypeError('"list" argument must be an Array of Buffers');
    if (u.length === 0)
      return b.alloc(0);
    let T;
    if (c === void 0)
      for (c = 0, T = 0; T < u.length; ++T)
        c += u[T].length;
    const D = b.allocUnsafe(c);
    let W = 0;
    for (T = 0; T < u.length; ++T) {
      let V = u[T];
      if (q(V, Uint8Array))
        W + V.length > D.length ? (b.isBuffer(V) || (V = b.from(V)), V.copy(D, W)) : Uint8Array.prototype.set.call(
          D,
          V,
          W
        );
      else if (b.isBuffer(V))
        V.copy(D, W);
      else
        throw new TypeError('"list" argument must be an Array of Buffers');
      W += V.length;
    }
    return D;
  };
  function Ce(g, u) {
    if (b.isBuffer(g))
      return g.length;
    if (ArrayBuffer.isView(g) || q(g, ArrayBuffer))
      return g.byteLength;
    if (typeof g != "string")
      throw new TypeError(
        'The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof g
      );
    const c = g.length, T = arguments.length > 2 && arguments[2] === !0;
    if (!T && c === 0)
      return 0;
    let D = !1;
    for (; ; )
      switch (u) {
        case "ascii":
        case "latin1":
        case "binary":
          return c;
        case "utf8":
        case "utf-8":
          return d(g).length;
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return c * 2;
        case "hex":
          return c >>> 1;
        case "base64":
          return O(g).length;
        default:
          if (D)
            return T ? -1 : d(g).length;
          u = ("" + u).toLowerCase(), D = !0;
      }
  }
  b.byteLength = Ce;
  function Ge(g, u, c) {
    let T = !1;
    if ((u === void 0 || u < 0) && (u = 0), u > this.length || ((c === void 0 || c > this.length) && (c = this.length), c <= 0) || (c >>>= 0, u >>>= 0, c <= u))
      return "";
    for (g || (g = "utf8"); ; )
      switch (g) {
        case "hex":
          return ht(this, u, c);
        case "utf8":
        case "utf-8":
          return De(this, u, c);
        case "ascii":
          return et(this, u, c);
        case "latin1":
        case "binary":
          return Oe(this, u, c);
        case "base64":
          return Te(this, u, c);
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return ne(this, u, c);
        default:
          if (T)
            throw new TypeError("Unknown encoding: " + g);
          g = (g + "").toLowerCase(), T = !0;
      }
  }
  b.prototype._isBuffer = !0;
  function ge(g, u, c) {
    const T = g[u];
    g[u] = g[c], g[c] = T;
  }
  b.prototype.swap16 = function() {
    const u = this.length;
    if (u % 2 !== 0)
      throw new RangeError("Buffer size must be a multiple of 16-bits");
    for (let c = 0; c < u; c += 2)
      ge(this, c, c + 1);
    return this;
  }, b.prototype.swap32 = function() {
    const u = this.length;
    if (u % 4 !== 0)
      throw new RangeError("Buffer size must be a multiple of 32-bits");
    for (let c = 0; c < u; c += 4)
      ge(this, c, c + 3), ge(this, c + 1, c + 2);
    return this;
  }, b.prototype.swap64 = function() {
    const u = this.length;
    if (u % 8 !== 0)
      throw new RangeError("Buffer size must be a multiple of 64-bits");
    for (let c = 0; c < u; c += 8)
      ge(this, c, c + 7), ge(this, c + 1, c + 6), ge(this, c + 2, c + 5), ge(this, c + 3, c + 4);
    return this;
  }, b.prototype.toString = function() {
    const u = this.length;
    return u === 0 ? "" : arguments.length === 0 ? De(this, 0, u) : Ge.apply(this, arguments);
  }, b.prototype.toLocaleString = b.prototype.toString, b.prototype.equals = function(u) {
    if (!b.isBuffer(u))
      throw new TypeError("Argument must be a Buffer");
    return this === u ? !0 : b.compare(this, u) === 0;
  }, b.prototype.inspect = function() {
    let u = "";
    const c = r.INSPECT_MAX_BYTES;
    return u = this.toString("hex", 0, c).replace(/(.{2})/g, "$1 ").trim(), this.length > c && (u += " ... "), "<Buffer " + u + ">";
  }, l && (b.prototype[l] = b.prototype.inspect), b.prototype.compare = function(u, c, T, D, W) {
    if (q(u, Uint8Array) && (u = b.from(u, u.offset, u.byteLength)), !b.isBuffer(u))
      throw new TypeError(
        'The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof u
      );
    if (c === void 0 && (c = 0), T === void 0 && (T = u ? u.length : 0), D === void 0 && (D = 0), W === void 0 && (W = this.length), c < 0 || T > u.length || D < 0 || W > this.length)
      throw new RangeError("out of range index");
    if (D >= W && c >= T)
      return 0;
    if (D >= W)
      return -1;
    if (c >= T)
      return 1;
    if (c >>>= 0, T >>>= 0, D >>>= 0, W >>>= 0, this === u)
      return 0;
    let V = W - D, Ae = T - c;
    const Xe = Math.min(V, Ae), Ve = this.slice(D, W), Ye = u.slice(c, T);
    for (let Ue = 0; Ue < Xe; ++Ue)
      if (Ve[Ue] !== Ye[Ue]) {
        V = Ve[Ue], Ae = Ye[Ue];
        break;
      }
    return V < Ae ? -1 : Ae < V ? 1 : 0;
  };
  function Fe(g, u, c, T, D) {
    if (g.length === 0)
      return -1;
    if (typeof c == "string" ? (T = c, c = 0) : c > 2147483647 ? c = 2147483647 : c < -2147483648 && (c = -2147483648), c = +c, we(c) && (c = D ? 0 : g.length - 1), c < 0 && (c = g.length + c), c >= g.length) {
      if (D)
        return -1;
      c = g.length - 1;
    } else if (c < 0)
      if (D)
        c = 0;
      else
        return -1;
    if (typeof u == "string" && (u = b.from(u, T)), b.isBuffer(u))
      return u.length === 0 ? -1 : he(g, u, c, T, D);
    if (typeof u == "number")
      return u = u & 255, typeof Uint8Array.prototype.indexOf == "function" ? D ? Uint8Array.prototype.indexOf.call(g, u, c) : Uint8Array.prototype.lastIndexOf.call(g, u, c) : he(g, [u], c, T, D);
    throw new TypeError("val must be string, number or Buffer");
  }
  function he(g, u, c, T, D) {
    let W = 1, V = g.length, Ae = u.length;
    if (T !== void 0 && (T = String(T).toLowerCase(), T === "ucs2" || T === "ucs-2" || T === "utf16le" || T === "utf-16le")) {
      if (g.length < 2 || u.length < 2)
        return -1;
      W = 2, V /= 2, Ae /= 2, c /= 2;
    }
    function Xe(Ye, Ue) {
      return W === 1 ? Ye[Ue] : Ye.readUInt16BE(Ue * W);
    }
    let Ve;
    if (D) {
      let Ye = -1;
      for (Ve = c; Ve < V; Ve++)
        if (Xe(g, Ve) === Xe(u, Ye === -1 ? 0 : Ve - Ye)) {
          if (Ye === -1 && (Ye = Ve), Ve - Ye + 1 === Ae)
            return Ye * W;
        } else
          Ye !== -1 && (Ve -= Ve - Ye), Ye = -1;
    } else
      for (c + Ae > V && (c = V - Ae), Ve = c; Ve >= 0; Ve--) {
        let Ye = !0;
        for (let Ue = 0; Ue < Ae; Ue++)
          if (Xe(g, Ve + Ue) !== Xe(u, Ue)) {
            Ye = !1;
            break;
          }
        if (Ye)
          return Ve;
      }
    return -1;
  }
  b.prototype.includes = function(u, c, T) {
    return this.indexOf(u, c, T) !== -1;
  }, b.prototype.indexOf = function(u, c, T) {
    return Fe(this, u, c, T, !0);
  }, b.prototype.lastIndexOf = function(u, c, T) {
    return Fe(this, u, c, T, !1);
  };
  function _e(g, u, c, T) {
    c = Number(c) || 0;
    const D = g.length - c;
    T ? (T = Number(T), T > D && (T = D)) : T = D;
    const W = u.length;
    T > W / 2 && (T = W / 2);
    let V;
    for (V = 0; V < T; ++V) {
      const Ae = parseInt(u.substr(V * 2, 2), 16);
      if (we(Ae))
        return V;
      g[c + V] = Ae;
    }
    return V;
  }
  function Me(g, u, c, T) {
    return X(d(u, g.length - c), g, c, T);
  }
  function k(g, u, c, T) {
    return X(_(u), g, c, T);
  }
  function Y(g, u, c, T) {
    return X(O(u), g, c, T);
  }
  function We(g, u, c, T) {
    return X(C(u, g.length - c), g, c, T);
  }
  b.prototype.write = function(u, c, T, D) {
    if (c === void 0)
      D = "utf8", T = this.length, c = 0;
    else if (T === void 0 && typeof c == "string")
      D = c, T = this.length, c = 0;
    else if (isFinite(c))
      c = c >>> 0, isFinite(T) ? (T = T >>> 0, D === void 0 && (D = "utf8")) : (D = T, T = void 0);
    else
      throw new Error(
        "Buffer.write(string, encoding, offset[, length]) is no longer supported"
      );
    const W = this.length - c;
    if ((T === void 0 || T > W) && (T = W), u.length > 0 && (T < 0 || c < 0) || c > this.length)
      throw new RangeError("Attempt to write outside buffer bounds");
    D || (D = "utf8");
    let V = !1;
    for (; ; )
      switch (D) {
        case "hex":
          return _e(this, u, c, T);
        case "utf8":
        case "utf-8":
          return Me(this, u, c, T);
        case "ascii":
        case "latin1":
        case "binary":
          return k(this, u, c, T);
        case "base64":
          return Y(this, u, c, T);
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return We(this, u, c, T);
        default:
          if (V)
            throw new TypeError("Unknown encoding: " + D);
          D = ("" + D).toLowerCase(), V = !0;
      }
  }, b.prototype.toJSON = function() {
    return {
      type: "Buffer",
      data: Array.prototype.slice.call(this._arr || this, 0)
    };
  };
  function Te(g, u, c) {
    return u === 0 && c === g.length ? a.fromByteArray(g) : a.fromByteArray(g.slice(u, c));
  }
  function De(g, u, c) {
    c = Math.min(g.length, c);
    const T = [];
    let D = u;
    for (; D < c; ) {
      const W = g[D];
      let V = null, Ae = W > 239 ? 4 : W > 223 ? 3 : W > 191 ? 2 : 1;
      if (D + Ae <= c) {
        let Xe, Ve, Ye, Ue;
        switch (Ae) {
          case 1:
            W < 128 && (V = W);
            break;
          case 2:
            Xe = g[D + 1], (Xe & 192) === 128 && (Ue = (W & 31) << 6 | Xe & 63, Ue > 127 && (V = Ue));
            break;
          case 3:
            Xe = g[D + 1], Ve = g[D + 2], (Xe & 192) === 128 && (Ve & 192) === 128 && (Ue = (W & 15) << 12 | (Xe & 63) << 6 | Ve & 63, Ue > 2047 && (Ue < 55296 || Ue > 57343) && (V = Ue));
            break;
          case 4:
            Xe = g[D + 1], Ve = g[D + 2], Ye = g[D + 3], (Xe & 192) === 128 && (Ve & 192) === 128 && (Ye & 192) === 128 && (Ue = (W & 15) << 18 | (Xe & 63) << 12 | (Ve & 63) << 6 | Ye & 63, Ue > 65535 && Ue < 1114112 && (V = Ue));
        }
      }
      V === null ? (V = 65533, Ae = 1) : V > 65535 && (V -= 65536, T.push(V >>> 10 & 1023 | 55296), V = 56320 | V & 1023), T.push(V), D += Ae;
    }
    return Ke(T);
  }
  const ye = 4096;
  function Ke(g) {
    const u = g.length;
    if (u <= ye)
      return String.fromCharCode.apply(String, g);
    let c = "", T = 0;
    for (; T < u; )
      c += String.fromCharCode.apply(
        String,
        g.slice(T, T += ye)
      );
    return c;
  }
  function et(g, u, c) {
    let T = "";
    c = Math.min(g.length, c);
    for (let D = u; D < c; ++D)
      T += String.fromCharCode(g[D] & 127);
    return T;
  }
  function Oe(g, u, c) {
    let T = "";
    c = Math.min(g.length, c);
    for (let D = u; D < c; ++D)
      T += String.fromCharCode(g[D]);
    return T;
  }
  function ht(g, u, c) {
    const T = g.length;
    (!u || u < 0) && (u = 0), (!c || c < 0 || c > T) && (c = T);
    let D = "";
    for (let W = u; W < c; ++W)
      D += Ne[g[W]];
    return D;
  }
  function ne(g, u, c) {
    const T = g.slice(u, c);
    let D = "";
    for (let W = 0; W < T.length - 1; W += 2)
      D += String.fromCharCode(T[W] + T[W + 1] * 256);
    return D;
  }
  b.prototype.slice = function(u, c) {
    const T = this.length;
    u = ~~u, c = c === void 0 ? T : ~~c, u < 0 ? (u += T, u < 0 && (u = 0)) : u > T && (u = T), c < 0 ? (c += T, c < 0 && (c = 0)) : c > T && (c = T), c < u && (c = u);
    const D = this.subarray(u, c);
    return Object.setPrototypeOf(D, b.prototype), D;
  };
  function me(g, u, c) {
    if (g % 1 !== 0 || g < 0)
      throw new RangeError("offset is not uint");
    if (g + u > c)
      throw new RangeError("Trying to access beyond buffer length");
  }
  b.prototype.readUintLE = b.prototype.readUIntLE = function(u, c, T) {
    u = u >>> 0, c = c >>> 0, T || me(u, c, this.length);
    let D = this[u], W = 1, V = 0;
    for (; ++V < c && (W *= 256); )
      D += this[u + V] * W;
    return D;
  }, b.prototype.readUintBE = b.prototype.readUIntBE = function(u, c, T) {
    u = u >>> 0, c = c >>> 0, T || me(u, c, this.length);
    let D = this[u + --c], W = 1;
    for (; c > 0 && (W *= 256); )
      D += this[u + --c] * W;
    return D;
  }, b.prototype.readUint8 = b.prototype.readUInt8 = function(u, c) {
    return u = u >>> 0, c || me(u, 1, this.length), this[u];
  }, b.prototype.readUint16LE = b.prototype.readUInt16LE = function(u, c) {
    return u = u >>> 0, c || me(u, 2, this.length), this[u] | this[u + 1] << 8;
  }, b.prototype.readUint16BE = b.prototype.readUInt16BE = function(u, c) {
    return u = u >>> 0, c || me(u, 2, this.length), this[u] << 8 | this[u + 1];
  }, b.prototype.readUint32LE = b.prototype.readUInt32LE = function(u, c) {
    return u = u >>> 0, c || me(u, 4, this.length), (this[u] | this[u + 1] << 8 | this[u + 2] << 16) + this[u + 3] * 16777216;
  }, b.prototype.readUint32BE = b.prototype.readUInt32BE = function(u, c) {
    return u = u >>> 0, c || me(u, 4, this.length), this[u] * 16777216 + (this[u + 1] << 16 | this[u + 2] << 8 | this[u + 3]);
  }, b.prototype.readBigUInt64LE = S(function(u) {
    u = u >>> 0, M(u, "offset");
    const c = this[u], T = this[u + 7];
    (c === void 0 || T === void 0) && U(u, this.length - 8);
    const D = c + this[++u] * 2 ** 8 + this[++u] * 2 ** 16 + this[++u] * 2 ** 24, W = this[++u] + this[++u] * 2 ** 8 + this[++u] * 2 ** 16 + T * 2 ** 24;
    return BigInt(D) + (BigInt(W) << BigInt(32));
  }), b.prototype.readBigUInt64BE = S(function(u) {
    u = u >>> 0, M(u, "offset");
    const c = this[u], T = this[u + 7];
    (c === void 0 || T === void 0) && U(u, this.length - 8);
    const D = c * 2 ** 24 + this[++u] * 2 ** 16 + this[++u] * 2 ** 8 + this[++u], W = this[++u] * 2 ** 24 + this[++u] * 2 ** 16 + this[++u] * 2 ** 8 + T;
    return (BigInt(D) << BigInt(32)) + BigInt(W);
  }), b.prototype.readIntLE = function(u, c, T) {
    u = u >>> 0, c = c >>> 0, T || me(u, c, this.length);
    let D = this[u], W = 1, V = 0;
    for (; ++V < c && (W *= 256); )
      D += this[u + V] * W;
    return W *= 128, D >= W && (D -= Math.pow(2, 8 * c)), D;
  }, b.prototype.readIntBE = function(u, c, T) {
    u = u >>> 0, c = c >>> 0, T || me(u, c, this.length);
    let D = c, W = 1, V = this[u + --D];
    for (; D > 0 && (W *= 256); )
      V += this[u + --D] * W;
    return W *= 128, V >= W && (V -= Math.pow(2, 8 * c)), V;
  }, b.prototype.readInt8 = function(u, c) {
    return u = u >>> 0, c || me(u, 1, this.length), this[u] & 128 ? (255 - this[u] + 1) * -1 : this[u];
  }, b.prototype.readInt16LE = function(u, c) {
    u = u >>> 0, c || me(u, 2, this.length);
    const T = this[u] | this[u + 1] << 8;
    return T & 32768 ? T | 4294901760 : T;
  }, b.prototype.readInt16BE = function(u, c) {
    u = u >>> 0, c || me(u, 2, this.length);
    const T = this[u + 1] | this[u] << 8;
    return T & 32768 ? T | 4294901760 : T;
  }, b.prototype.readInt32LE = function(u, c) {
    return u = u >>> 0, c || me(u, 4, this.length), this[u] | this[u + 1] << 8 | this[u + 2] << 16 | this[u + 3] << 24;
  }, b.prototype.readInt32BE = function(u, c) {
    return u = u >>> 0, c || me(u, 4, this.length), this[u] << 24 | this[u + 1] << 16 | this[u + 2] << 8 | this[u + 3];
  }, b.prototype.readBigInt64LE = S(function(u) {
    u = u >>> 0, M(u, "offset");
    const c = this[u], T = this[u + 7];
    (c === void 0 || T === void 0) && U(u, this.length - 8);
    const D = this[u + 4] + this[u + 5] * 2 ** 8 + this[u + 6] * 2 ** 16 + (T << 24);
    return (BigInt(D) << BigInt(32)) + BigInt(c + this[++u] * 2 ** 8 + this[++u] * 2 ** 16 + this[++u] * 2 ** 24);
  }), b.prototype.readBigInt64BE = S(function(u) {
    u = u >>> 0, M(u, "offset");
    const c = this[u], T = this[u + 7];
    (c === void 0 || T === void 0) && U(u, this.length - 8);
    const D = (c << 24) + // Overflow
    this[++u] * 2 ** 16 + this[++u] * 2 ** 8 + this[++u];
    return (BigInt(D) << BigInt(32)) + BigInt(this[++u] * 2 ** 24 + this[++u] * 2 ** 16 + this[++u] * 2 ** 8 + T);
  }), b.prototype.readFloatLE = function(u, c) {
    return u = u >>> 0, c || me(u, 4, this.length), o.read(this, u, !0, 23, 4);
  }, b.prototype.readFloatBE = function(u, c) {
    return u = u >>> 0, c || me(u, 4, this.length), o.read(this, u, !1, 23, 4);
  }, b.prototype.readDoubleLE = function(u, c) {
    return u = u >>> 0, c || me(u, 8, this.length), o.read(this, u, !0, 52, 8);
  }, b.prototype.readDoubleBE = function(u, c) {
    return u = u >>> 0, c || me(u, 8, this.length), o.read(this, u, !1, 52, 8);
  };
  function Ie(g, u, c, T, D, W) {
    if (!b.isBuffer(g))
      throw new TypeError('"buffer" argument must be a Buffer instance');
    if (u > D || u < W)
      throw new RangeError('"value" argument is out of bounds');
    if (c + T > g.length)
      throw new RangeError("Index out of range");
  }
  b.prototype.writeUintLE = b.prototype.writeUIntLE = function(u, c, T, D) {
    if (u = +u, c = c >>> 0, T = T >>> 0, !D) {
      const Ae = Math.pow(2, 8 * T) - 1;
      Ie(this, u, c, T, Ae, 0);
    }
    let W = 1, V = 0;
    for (this[c] = u & 255; ++V < T && (W *= 256); )
      this[c + V] = u / W & 255;
    return c + T;
  }, b.prototype.writeUintBE = b.prototype.writeUIntBE = function(u, c, T, D) {
    if (u = +u, c = c >>> 0, T = T >>> 0, !D) {
      const Ae = Math.pow(2, 8 * T) - 1;
      Ie(this, u, c, T, Ae, 0);
    }
    let W = T - 1, V = 1;
    for (this[c + W] = u & 255; --W >= 0 && (V *= 256); )
      this[c + W] = u / V & 255;
    return c + T;
  }, b.prototype.writeUint8 = b.prototype.writeUInt8 = function(u, c, T) {
    return u = +u, c = c >>> 0, T || Ie(this, u, c, 1, 255, 0), this[c] = u & 255, c + 1;
  }, b.prototype.writeUint16LE = b.prototype.writeUInt16LE = function(u, c, T) {
    return u = +u, c = c >>> 0, T || Ie(this, u, c, 2, 65535, 0), this[c] = u & 255, this[c + 1] = u >>> 8, c + 2;
  }, b.prototype.writeUint16BE = b.prototype.writeUInt16BE = function(u, c, T) {
    return u = +u, c = c >>> 0, T || Ie(this, u, c, 2, 65535, 0), this[c] = u >>> 8, this[c + 1] = u & 255, c + 2;
  }, b.prototype.writeUint32LE = b.prototype.writeUInt32LE = function(u, c, T) {
    return u = +u, c = c >>> 0, T || Ie(this, u, c, 4, 4294967295, 0), this[c + 3] = u >>> 24, this[c + 2] = u >>> 16, this[c + 1] = u >>> 8, this[c] = u & 255, c + 4;
  }, b.prototype.writeUint32BE = b.prototype.writeUInt32BE = function(u, c, T) {
    return u = +u, c = c >>> 0, T || Ie(this, u, c, 4, 4294967295, 0), this[c] = u >>> 24, this[c + 1] = u >>> 16, this[c + 2] = u >>> 8, this[c + 3] = u & 255, c + 4;
  };
  function xt(g, u, c, T, D) {
    it(u, T, D, g, c, 7);
    let W = Number(u & BigInt(4294967295));
    g[c++] = W, W = W >> 8, g[c++] = W, W = W >> 8, g[c++] = W, W = W >> 8, g[c++] = W;
    let V = Number(u >> BigInt(32) & BigInt(4294967295));
    return g[c++] = V, V = V >> 8, g[c++] = V, V = V >> 8, g[c++] = V, V = V >> 8, g[c++] = V, c;
  }
  function St(g, u, c, T, D) {
    it(u, T, D, g, c, 7);
    let W = Number(u & BigInt(4294967295));
    g[c + 7] = W, W = W >> 8, g[c + 6] = W, W = W >> 8, g[c + 5] = W, W = W >> 8, g[c + 4] = W;
    let V = Number(u >> BigInt(32) & BigInt(4294967295));
    return g[c + 3] = V, V = V >> 8, g[c + 2] = V, V = V >> 8, g[c + 1] = V, V = V >> 8, g[c] = V, c + 8;
  }
  b.prototype.writeBigUInt64LE = S(function(u, c = 0) {
    return xt(this, u, c, BigInt(0), BigInt("0xffffffffffffffff"));
  }), b.prototype.writeBigUInt64BE = S(function(u, c = 0) {
    return St(this, u, c, BigInt(0), BigInt("0xffffffffffffffff"));
  }), b.prototype.writeIntLE = function(u, c, T, D) {
    if (u = +u, c = c >>> 0, !D) {
      const Xe = Math.pow(2, 8 * T - 1);
      Ie(this, u, c, T, Xe - 1, -Xe);
    }
    let W = 0, V = 1, Ae = 0;
    for (this[c] = u & 255; ++W < T && (V *= 256); )
      u < 0 && Ae === 0 && this[c + W - 1] !== 0 && (Ae = 1), this[c + W] = (u / V >> 0) - Ae & 255;
    return c + T;
  }, b.prototype.writeIntBE = function(u, c, T, D) {
    if (u = +u, c = c >>> 0, !D) {
      const Xe = Math.pow(2, 8 * T - 1);
      Ie(this, u, c, T, Xe - 1, -Xe);
    }
    let W = T - 1, V = 1, Ae = 0;
    for (this[c + W] = u & 255; --W >= 0 && (V *= 256); )
      u < 0 && Ae === 0 && this[c + W + 1] !== 0 && (Ae = 1), this[c + W] = (u / V >> 0) - Ae & 255;
    return c + T;
  }, b.prototype.writeInt8 = function(u, c, T) {
    return u = +u, c = c >>> 0, T || Ie(this, u, c, 1, 127, -128), u < 0 && (u = 255 + u + 1), this[c] = u & 255, c + 1;
  }, b.prototype.writeInt16LE = function(u, c, T) {
    return u = +u, c = c >>> 0, T || Ie(this, u, c, 2, 32767, -32768), this[c] = u & 255, this[c + 1] = u >>> 8, c + 2;
  }, b.prototype.writeInt16BE = function(u, c, T) {
    return u = +u, c = c >>> 0, T || Ie(this, u, c, 2, 32767, -32768), this[c] = u >>> 8, this[c + 1] = u & 255, c + 2;
  }, b.prototype.writeInt32LE = function(u, c, T) {
    return u = +u, c = c >>> 0, T || Ie(this, u, c, 4, 2147483647, -2147483648), this[c] = u & 255, this[c + 1] = u >>> 8, this[c + 2] = u >>> 16, this[c + 3] = u >>> 24, c + 4;
  }, b.prototype.writeInt32BE = function(u, c, T) {
    return u = +u, c = c >>> 0, T || Ie(this, u, c, 4, 2147483647, -2147483648), u < 0 && (u = 4294967295 + u + 1), this[c] = u >>> 24, this[c + 1] = u >>> 16, this[c + 2] = u >>> 8, this[c + 3] = u & 255, c + 4;
  }, b.prototype.writeBigInt64LE = S(function(u, c = 0) {
    return xt(this, u, c, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
  }), b.prototype.writeBigInt64BE = S(function(u, c = 0) {
    return St(this, u, c, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
  });
  function bt(g, u, c, T, D, W) {
    if (c + T > g.length)
      throw new RangeError("Index out of range");
    if (c < 0)
      throw new RangeError("Index out of range");
  }
  function Dt(g, u, c, T, D) {
    return u = +u, c = c >>> 0, D || bt(g, u, c, 4), o.write(g, u, c, T, 23, 4), c + 4;
  }
  b.prototype.writeFloatLE = function(u, c, T) {
    return Dt(this, u, c, !0, T);
  }, b.prototype.writeFloatBE = function(u, c, T) {
    return Dt(this, u, c, !1, T);
  };
  function Tt(g, u, c, T, D) {
    return u = +u, c = c >>> 0, D || bt(g, u, c, 8), o.write(g, u, c, T, 52, 8), c + 8;
  }
  b.prototype.writeDoubleLE = function(u, c, T) {
    return Tt(this, u, c, !0, T);
  }, b.prototype.writeDoubleBE = function(u, c, T) {
    return Tt(this, u, c, !1, T);
  }, b.prototype.copy = function(u, c, T, D) {
    if (!b.isBuffer(u))
      throw new TypeError("argument should be a Buffer");
    if (T || (T = 0), !D && D !== 0 && (D = this.length), c >= u.length && (c = u.length), c || (c = 0), D > 0 && D < T && (D = T), D === T || u.length === 0 || this.length === 0)
      return 0;
    if (c < 0)
      throw new RangeError("targetStart out of bounds");
    if (T < 0 || T >= this.length)
      throw new RangeError("Index out of range");
    if (D < 0)
      throw new RangeError("sourceEnd out of bounds");
    D > this.length && (D = this.length), u.length - c < D - T && (D = u.length - c + T);
    const W = D - T;
    return this === u && typeof Uint8Array.prototype.copyWithin == "function" ? this.copyWithin(c, T, D) : Uint8Array.prototype.set.call(
      u,
      this.subarray(T, D),
      c
    ), W;
  }, b.prototype.fill = function(u, c, T, D) {
    if (typeof u == "string") {
      if (typeof c == "string" ? (D = c, c = 0, T = this.length) : typeof T == "string" && (D = T, T = this.length), D !== void 0 && typeof D != "string")
        throw new TypeError("encoding must be a string");
      if (typeof D == "string" && !b.isEncoding(D))
        throw new TypeError("Unknown encoding: " + D);
      if (u.length === 1) {
        const V = u.charCodeAt(0);
        (D === "utf8" && V < 128 || D === "latin1") && (u = V);
      }
    } else
      typeof u == "number" ? u = u & 255 : typeof u == "boolean" && (u = Number(u));
    if (c < 0 || this.length < c || this.length < T)
      throw new RangeError("Out of range index");
    if (T <= c)
      return this;
    c = c >>> 0, T = T === void 0 ? this.length : T >>> 0, u || (u = 0);
    let W;
    if (typeof u == "number")
      for (W = c; W < T; ++W)
        this[W] = u;
    else {
      const V = b.isBuffer(u) ? u : b.from(u, D), Ae = V.length;
      if (Ae === 0)
        throw new TypeError('The value "' + u + '" is invalid for argument "value"');
      for (W = 0; W < T - c; ++W)
        this[W + c] = V[W % Ae];
    }
    return this;
  };
  const ft = {};
  function rt(g, u, c) {
    ft[g] = class extends c {
      constructor() {
        super(), Object.defineProperty(this, "message", {
          value: u.apply(this, arguments),
          writable: !0,
          configurable: !0
        }), this.name = `${this.name} [${g}]`, delete this.name;
      }
      get code() {
        return g;
      }
      set code(D) {
        Object.defineProperty(this, "code", {
          configurable: !0,
          enumerable: !0,
          value: D,
          writable: !0
        });
      }
      toString() {
        return `${this.name} [${g}]: ${this.message}`;
      }
    };
  }
  rt(
    "ERR_BUFFER_OUT_OF_BOUNDS",
    function(g) {
      return g ? `${g} is outside of buffer bounds` : "Attempt to access memory outside buffer bounds";
    },
    RangeError
  ), rt(
    "ERR_INVALID_ARG_TYPE",
    function(g, u) {
      return `The "${g}" argument must be of type number. Received type ${typeof u}`;
    },
    TypeError
  ), rt(
    "ERR_OUT_OF_RANGE",
    function(g, u, c) {
      let T = `The value of "${g}" is out of range.`, D = c;
      return Number.isInteger(c) && Math.abs(c) > 2 ** 32 ? D = vt(String(c)) : typeof c == "bigint" && (D = String(c), (c > BigInt(2) ** BigInt(32) || c < -(BigInt(2) ** BigInt(32))) && (D = vt(D)), D += "n"), T += ` It must be ${u}. Received ${D}`, T;
    },
    RangeError
  );
  function vt(g) {
    let u = "", c = g.length;
    const T = g[0] === "-" ? 1 : 0;
    for (; c >= T + 4; c -= 3)
      u = `_${g.slice(c - 3, c)}${u}`;
    return `${g.slice(0, c)}${u}`;
  }
  function mt(g, u, c) {
    M(u, "offset"), (g[u] === void 0 || g[u + c] === void 0) && U(u, g.length - (c + 1));
  }
  function it(g, u, c, T, D, W) {
    if (g > c || g < u) {
      const V = typeof u == "bigint" ? "n" : "";
      let Ae;
      throw W > 3 ? u === 0 || u === BigInt(0) ? Ae = `>= 0${V} and < 2${V} ** ${(W + 1) * 8}${V}` : Ae = `>= -(2${V} ** ${(W + 1) * 8 - 1}${V}) and < 2 ** ${(W + 1) * 8 - 1}${V}` : Ae = `>= ${u}${V} and <= ${c}${V}`, new ft.ERR_OUT_OF_RANGE("value", Ae, g);
    }
    mt(T, D, W);
  }
  function M(g, u) {
    if (typeof g != "number")
      throw new ft.ERR_INVALID_ARG_TYPE(u, "number", g);
  }
  function U(g, u, c) {
    throw Math.floor(g) !== g ? (M(g, c), new ft.ERR_OUT_OF_RANGE(c || "offset", "an integer", g)) : u < 0 ? new ft.ERR_BUFFER_OUT_OF_BOUNDS() : new ft.ERR_OUT_OF_RANGE(
      c || "offset",
      `>= ${c ? 1 : 0} and <= ${u}`,
      g
    );
  }
  const J = /[^+/0-9A-Za-z-_]/g;
  function x(g) {
    if (g = g.split("=")[0], g = g.trim().replace(J, ""), g.length < 2)
      return "";
    for (; g.length % 4 !== 0; )
      g = g + "=";
    return g;
  }
  function d(g, u) {
    u = u || 1 / 0;
    let c;
    const T = g.length;
    let D = null;
    const W = [];
    for (let V = 0; V < T; ++V) {
      if (c = g.charCodeAt(V), c > 55295 && c < 57344) {
        if (!D) {
          if (c > 56319) {
            (u -= 3) > -1 && W.push(239, 191, 189);
            continue;
          } else if (V + 1 === T) {
            (u -= 3) > -1 && W.push(239, 191, 189);
            continue;
          }
          D = c;
          continue;
        }
        if (c < 56320) {
          (u -= 3) > -1 && W.push(239, 191, 189), D = c;
          continue;
        }
        c = (D - 55296 << 10 | c - 56320) + 65536;
      } else
        D && (u -= 3) > -1 && W.push(239, 191, 189);
      if (D = null, c < 128) {
        if ((u -= 1) < 0)
          break;
        W.push(c);
      } else if (c < 2048) {
        if ((u -= 2) < 0)
          break;
        W.push(
          c >> 6 | 192,
          c & 63 | 128
        );
      } else if (c < 65536) {
        if ((u -= 3) < 0)
          break;
        W.push(
          c >> 12 | 224,
          c >> 6 & 63 | 128,
          c & 63 | 128
        );
      } else if (c < 1114112) {
        if ((u -= 4) < 0)
          break;
        W.push(
          c >> 18 | 240,
          c >> 12 & 63 | 128,
          c >> 6 & 63 | 128,
          c & 63 | 128
        );
      } else
        throw new Error("Invalid code point");
    }
    return W;
  }
  function _(g) {
    const u = [];
    for (let c = 0; c < g.length; ++c)
      u.push(g.charCodeAt(c) & 255);
    return u;
  }
  function C(g, u) {
    let c, T, D;
    const W = [];
    for (let V = 0; V < g.length && !((u -= 2) < 0); ++V)
      c = g.charCodeAt(V), T = c >> 8, D = c % 256, W.push(D), W.push(T);
    return W;
  }
  function O(g) {
    return a.toByteArray(x(g));
  }
  function X(g, u, c, T) {
    let D;
    for (D = 0; D < T && !(D + c >= u.length || D >= g.length); ++D)
      u[D + c] = g[D];
    return D;
  }
  function q(g, u) {
    return g instanceof u || g != null && g.constructor != null && g.constructor.name != null && g.constructor.name === u.name;
  }
  function we(g) {
    return g !== g;
  }
  const Ne = function() {
    const g = "0123456789abcdef", u = new Array(256);
    for (let c = 0; c < 16; ++c) {
      const T = c * 16;
      for (let D = 0; D < 16; ++D)
        u[T + D] = g[c] + g[D];
    }
    return u;
  }();
  function S(g) {
    return typeof BigInt > "u" ? F : g;
  }
  function F() {
    throw new Error("BigInt not supported");
  }
})(tr);
var dt = {
  ArrayIsArray(r) {
    return Array.isArray(r);
  },
  ArrayPrototypeIncludes(r, a) {
    return r.includes(a);
  },
  ArrayPrototypeIndexOf(r, a) {
    return r.indexOf(a);
  },
  ArrayPrototypeJoin(r, a) {
    return r.join(a);
  },
  ArrayPrototypeMap(r, a) {
    return r.map(a);
  },
  ArrayPrototypePop(r, a) {
    return r.pop(a);
  },
  ArrayPrototypePush(r, a) {
    return r.push(a);
  },
  ArrayPrototypeSlice(r, a, o) {
    return r.slice(a, o);
  },
  Error,
  FunctionPrototypeCall(r, a, ...o) {
    return r.call(a, ...o);
  },
  FunctionPrototypeSymbolHasInstance(r, a) {
    return Function.prototype[Symbol.hasInstance].call(r, a);
  },
  MathFloor: Math.floor,
  Number,
  NumberIsInteger: Number.isInteger,
  NumberIsNaN: Number.isNaN,
  NumberMAX_SAFE_INTEGER: Number.MAX_SAFE_INTEGER,
  NumberMIN_SAFE_INTEGER: Number.MIN_SAFE_INTEGER,
  NumberParseInt: Number.parseInt,
  ObjectDefineProperties(r, a) {
    return Object.defineProperties(r, a);
  },
  ObjectDefineProperty(r, a, o) {
    return Object.defineProperty(r, a, o);
  },
  ObjectGetOwnPropertyDescriptor(r, a) {
    return Object.getOwnPropertyDescriptor(r, a);
  },
  ObjectKeys(r) {
    return Object.keys(r);
  },
  ObjectSetPrototypeOf(r, a) {
    return Object.setPrototypeOf(r, a);
  },
  Promise,
  PromisePrototypeCatch(r, a) {
    return r.catch(a);
  },
  PromisePrototypeThen(r, a, o) {
    return r.then(a, o);
  },
  PromiseReject(r) {
    return Promise.reject(r);
  },
  ReflectApply: Reflect.apply,
  RegExpPrototypeTest(r, a) {
    return r.test(a);
  },
  SafeSet: Set,
  String,
  StringPrototypeSlice(r, a, o) {
    return r.slice(a, o);
  },
  StringPrototypeToLowerCase(r) {
    return r.toLowerCase();
  },
  StringPrototypeToUpperCase(r) {
    return r.toUpperCase();
  },
  StringPrototypeTrim(r) {
    return r.trim();
  },
  Symbol,
  SymbolFor: Symbol.for,
  SymbolAsyncIterator: Symbol.asyncIterator,
  SymbolHasInstance: Symbol.hasInstance,
  SymbolIterator: Symbol.iterator,
  TypedArrayPrototypeSet(r, a, o) {
    return r.set(a, o);
  },
  Uint8Array
}, Gs = { exports: {} };
(function(r) {
  const a = tr, o = Object.getPrototypeOf(async function() {
  }).constructor, l = globalThis.Blob || a.Blob, m = typeof l < "u" ? function(b) {
    return b instanceof l;
  } : function(b) {
    return !1;
  };
  class w extends Error {
    constructor(b) {
      if (!Array.isArray(b))
        throw new TypeError(`Expected input to be an Array, got ${typeof b}`);
      let P = "";
      for (let L = 0; L < b.length; L++)
        P += `    ${b[L].stack}
`;
      super(P), this.name = "AggregateError", this.errors = b;
    }
  }
  r.exports = {
    AggregateError: w,
    kEmptyObject: Object.freeze({}),
    once(v) {
      let b = !1;
      return function(...P) {
        b || (b = !0, v.apply(this, P));
      };
    },
    createDeferredPromise: function() {
      let v, b;
      return {
        promise: new Promise((L, N) => {
          v = L, b = N;
        }),
        resolve: v,
        reject: b
      };
    },
    promisify(v) {
      return new Promise((b, P) => {
        v((L, ...N) => L ? P(L) : b(...N));
      });
    },
    debuglog() {
      return function() {
      };
    },
    format(v, ...b) {
      return v.replace(/%([sdifj])/g, function(...[P, L]) {
        const N = b.shift();
        return L === "f" ? N.toFixed(6) : L === "j" ? JSON.stringify(N) : L === "s" && typeof N == "object" ? `${N.constructor !== Object ? N.constructor.name : ""} {}`.trim() : N.toString();
      });
    },
    inspect(v) {
      switch (typeof v) {
        case "string":
          if (v.includes("'"))
            if (v.includes('"')) {
              if (!v.includes("`") && !v.includes("${"))
                return `\`${v}\``;
            } else
              return `"${v}"`;
          return `'${v}'`;
        case "number":
          return isNaN(v) ? "NaN" : Object.is(v, -0) ? String(v) : v;
        case "bigint":
          return `${String(v)}n`;
        case "boolean":
        case "undefined":
          return String(v);
        case "object":
          return "{}";
      }
    },
    types: {
      isAsyncFunction(v) {
        return v instanceof o;
      },
      isArrayBufferView(v) {
        return ArrayBuffer.isView(v);
      }
    },
    isBlob: m
  }, r.exports.promisify.custom = Symbol.for("nodejs.util.promisify.custom");
})(Gs);
var Xt = Gs.exports, va = {}, Vr = { exports: {} }, Io;
function wa() {
  if (Io)
    return Vr.exports;
  Io = 1;
  const { AbortController: r, AbortSignal: a } = typeof self < "u" ? self : typeof window < "u" ? window : (
    /* otherwise */
    void 0
  );
  return Vr.exports = r, Vr.exports.AbortSignal = a, Vr.exports.default = r, Vr.exports;
}
const { format: Ap, inspect: On, AggregateError: Ip } = Xt, kp = globalThis.AggregateError || Ip, Pp = Symbol("kIsNodeError"), Dp = [
  "string",
  "function",
  "number",
  "object",
  // Accept 'Function' and 'Object' as alternative to the lower cased version.
  "Function",
  "Object",
  "boolean",
  "bigint",
  "symbol"
], Lp = /^([A-Z][a-z0-9]*)+$/, Bp = "__node_internal_", Gn = {};
function _r(r, a) {
  if (!r)
    throw new Gn.ERR_INTERNAL_ASSERTION(a);
}
function ko(r) {
  let a = "", o = r.length;
  const l = r[0] === "-" ? 1 : 0;
  for (; o >= l + 4; o -= 3)
    a = `_${r.slice(o - 3, o)}${a}`;
  return `${r.slice(0, o)}${a}`;
}
function Mp(r, a, o) {
  if (typeof a == "function")
    return _r(
      a.length <= o.length,
      // Default options do not count.
      `Code: ${r}; The provided arguments length (${o.length}) does not match the required ones (${a.length}).`
    ), a(...o);
  const l = (a.match(/%[dfijoOs]/g) || []).length;
  return _r(
    l === o.length,
    `Code: ${r}; The provided arguments length (${o.length}) does not match the required ones (${l}).`
  ), o.length === 0 ? a : Ap(a, ...o);
}
function _t(r, a, o) {
  o || (o = Error);
  class l extends o {
    constructor(...w) {
      super(Mp(r, a, w));
    }
    toString() {
      return `${this.name} [${r}]: ${this.message}`;
    }
  }
  Object.defineProperties(l.prototype, {
    name: {
      value: o.name,
      writable: !0,
      enumerable: !1,
      configurable: !0
    },
    toString: {
      value() {
        return `${this.name} [${r}]: ${this.message}`;
      },
      writable: !0,
      enumerable: !1,
      configurable: !0
    }
  }), l.prototype.code = r, l.prototype[Pp] = !0, Gn[r] = l;
}
function Po(r) {
  const a = Bp + r.name;
  return Object.defineProperty(r, "name", {
    value: a
  }), r;
}
function Op(r, a) {
  if (r && a && r !== a) {
    if (Array.isArray(a.errors))
      return a.errors.push(r), a;
    const o = new kp([a, r], a.message);
    return o.code = a.code, o;
  }
  return r || a;
}
let Np = class extends Error {
  constructor(a = "The operation was aborted", o = void 0) {
    if (o !== void 0 && typeof o != "object")
      throw new Gn.ERR_INVALID_ARG_TYPE("options", "Object", o);
    super(a, o), this.code = "ABORT_ERR", this.name = "AbortError";
  }
};
_t("ERR_ASSERTION", "%s", Error);
_t(
  "ERR_INVALID_ARG_TYPE",
  (r, a, o) => {
    _r(typeof r == "string", "'name' must be a string"), Array.isArray(a) || (a = [a]);
    let l = "The ";
    r.endsWith(" argument") ? l += `${r} ` : l += `"${r}" ${r.includes(".") ? "property" : "argument"} `, l += "must be ";
    const m = [], w = [], v = [];
    for (const P of a)
      _r(typeof P == "string", "All expected entries have to be of type string"), Dp.includes(P) ? m.push(P.toLowerCase()) : Lp.test(P) ? w.push(P) : (_r(P !== "object", 'The value "object" should be written as "Object"'), v.push(P));
    if (w.length > 0) {
      const P = m.indexOf("object");
      P !== -1 && (m.splice(m, P, 1), w.push("Object"));
    }
    if (m.length > 0) {
      switch (m.length) {
        case 1:
          l += `of type ${m[0]}`;
          break;
        case 2:
          l += `one of type ${m[0]} or ${m[1]}`;
          break;
        default: {
          const P = m.pop();
          l += `one of type ${m.join(", ")}, or ${P}`;
        }
      }
      (w.length > 0 || v.length > 0) && (l += " or ");
    }
    if (w.length > 0) {
      switch (w.length) {
        case 1:
          l += `an instance of ${w[0]}`;
          break;
        case 2:
          l += `an instance of ${w[0]} or ${w[1]}`;
          break;
        default: {
          const P = w.pop();
          l += `an instance of ${w.join(", ")}, or ${P}`;
        }
      }
      v.length > 0 && (l += " or ");
    }
    switch (v.length) {
      case 0:
        break;
      case 1:
        v[0].toLowerCase() !== v[0] && (l += "an "), l += `${v[0]}`;
        break;
      case 2:
        l += `one of ${v[0]} or ${v[1]}`;
        break;
      default: {
        const P = v.pop();
        l += `one of ${v.join(", ")}, or ${P}`;
      }
    }
    if (o == null)
      l += `. Received ${o}`;
    else if (typeof o == "function" && o.name)
      l += `. Received function ${o.name}`;
    else if (typeof o == "object") {
      var b;
      if ((b = o.constructor) !== null && b !== void 0 && b.name)
        l += `. Received an instance of ${o.constructor.name}`;
      else {
        const P = On(o, {
          depth: -1
        });
        l += `. Received ${P}`;
      }
    } else {
      let P = On(o, {
        colors: !1
      });
      P.length > 25 && (P = `${P.slice(0, 25)}...`), l += `. Received type ${typeof o} (${P})`;
    }
    return l;
  },
  TypeError
);
_t(
  "ERR_INVALID_ARG_VALUE",
  (r, a, o = "is invalid") => {
    let l = On(a);
    return l.length > 128 && (l = l.slice(0, 128) + "..."), `The ${r.includes(".") ? "property" : "argument"} '${r}' ${o}. Received ${l}`;
  },
  TypeError
);
_t(
  "ERR_INVALID_RETURN_VALUE",
  (r, a, o) => {
    var l;
    const m = o != null && (l = o.constructor) !== null && l !== void 0 && l.name ? `instance of ${o.constructor.name}` : `type ${typeof o}`;
    return `Expected ${r} to be returned from the "${a}" function but got ${m}.`;
  },
  TypeError
);
_t(
  "ERR_MISSING_ARGS",
  (...r) => {
    _r(r.length > 0, "At least one arg needs to be specified");
    let a;
    const o = r.length;
    switch (r = (Array.isArray(r) ? r : [r]).map((l) => `"${l}"`).join(" or "), o) {
      case 1:
        a += `The ${r[0]} argument`;
        break;
      case 2:
        a += `The ${r[0]} and ${r[1]} arguments`;
        break;
      default:
        {
          const l = r.pop();
          a += `The ${r.join(", ")}, and ${l} arguments`;
        }
        break;
    }
    return `${a} must be specified`;
  },
  TypeError
);
_t(
  "ERR_OUT_OF_RANGE",
  (r, a, o) => {
    _r(a, 'Missing "range" argument');
    let l;
    return Number.isInteger(o) && Math.abs(o) > 2 ** 32 ? l = ko(String(o)) : typeof o == "bigint" ? (l = String(o), (o > 2n ** 32n || o < -(2n ** 32n)) && (l = ko(l)), l += "n") : l = On(o), `The value of "${r}" is out of range. It must be ${a}. Received ${l}`;
  },
  RangeError
);
_t("ERR_MULTIPLE_CALLBACK", "Callback called multiple times", Error);
_t("ERR_METHOD_NOT_IMPLEMENTED", "The %s method is not implemented", Error);
_t("ERR_STREAM_ALREADY_FINISHED", "Cannot call %s after a stream was finished", Error);
_t("ERR_STREAM_CANNOT_PIPE", "Cannot pipe, not readable", Error);
_t("ERR_STREAM_DESTROYED", "Cannot call %s after a stream was destroyed", Error);
_t("ERR_STREAM_NULL_VALUES", "May not write null values to stream", TypeError);
_t("ERR_STREAM_PREMATURE_CLOSE", "Premature close", Error);
_t("ERR_STREAM_PUSH_AFTER_EOF", "stream.push() after EOF", Error);
_t("ERR_STREAM_UNSHIFT_AFTER_END_EVENT", "stream.unshift() after end event", Error);
_t("ERR_STREAM_WRITE_AFTER_END", "write after end", Error);
_t("ERR_UNKNOWN_ENCODING", "Unknown encoding: %s", TypeError);
var Et = {
  AbortError: Np,
  aggregateTwoErrors: Po(Op),
  hideStackFrames: Po,
  codes: Gn
};
const {
  ArrayIsArray: Ea,
  ArrayPrototypeIncludes: Vs,
  ArrayPrototypeJoin: zs,
  ArrayPrototypeMap: Up,
  NumberIsInteger: xa,
  NumberIsNaN: $p,
  NumberMAX_SAFE_INTEGER: Wp,
  NumberMIN_SAFE_INTEGER: jp,
  NumberParseInt: Gp,
  ObjectPrototypeHasOwnProperty: Vp,
  RegExpPrototypeExec: Hs,
  String: zp,
  StringPrototypeToUpperCase: Hp,
  StringPrototypeTrim: Kp
} = dt, {
  hideStackFrames: It,
  codes: { ERR_SOCKET_BAD_PORT: Xp, ERR_INVALID_ARG_TYPE: yt, ERR_INVALID_ARG_VALUE: Mr, ERR_OUT_OF_RANGE: br, ERR_UNKNOWN_SIGNAL: Do }
} = Et, { normalizeEncoding: Yp } = Xt, { isAsyncFunction: Zp, isArrayBufferView: qp } = Xt.types, Lo = {};
function Qp(r) {
  return r === (r | 0);
}
function Jp(r) {
  return r === r >>> 0;
}
const e0 = /^[0-7]+$/, t0 = "must be a 32-bit unsigned integer or an octal string";
function r0(r, a, o) {
  if (typeof r > "u" && (r = o), typeof r == "string") {
    if (Hs(e0, r) === null)
      throw new Mr(a, r, t0);
    r = Gp(r, 8);
  }
  return Ks(r, a), r;
}
const n0 = It((r, a, o = jp, l = Wp) => {
  if (typeof r != "number")
    throw new yt(a, "number", r);
  if (!xa(r))
    throw new br(a, "an integer", r);
  if (r < o || r > l)
    throw new br(a, `>= ${o} && <= ${l}`, r);
}), i0 = It((r, a, o = -2147483648, l = 2147483647) => {
  if (typeof r != "number")
    throw new yt(a, "number", r);
  if (!xa(r))
    throw new br(a, "an integer", r);
  if (r < o || r > l)
    throw new br(a, `>= ${o} && <= ${l}`, r);
}), Ks = It((r, a, o = !1) => {
  if (typeof r != "number")
    throw new yt(a, "number", r);
  if (!xa(r))
    throw new br(a, "an integer", r);
  const l = o ? 1 : 0, m = 4294967295;
  if (r < l || r > m)
    throw new br(a, `>= ${l} && <= ${m}`, r);
});
function Sa(r, a) {
  if (typeof r != "string")
    throw new yt(a, "string", r);
}
function a0(r, a, o = void 0, l) {
  if (typeof r != "number")
    throw new yt(a, "number", r);
  if (o != null && r < o || l != null && r > l || (o != null || l != null) && $p(r))
    throw new br(
      a,
      `${o != null ? `>= ${o}` : ""}${o != null && l != null ? " && " : ""}${l != null ? `<= ${l}` : ""}`,
      r
    );
}
const o0 = It((r, a, o) => {
  if (!Vs(o, r)) {
    const m = "must be one of: " + zs(
      Up(o, (w) => typeof w == "string" ? `'${w}'` : zp(w)),
      ", "
    );
    throw new Mr(a, r, m);
  }
});
function Xs(r, a) {
  if (typeof r != "boolean")
    throw new yt(a, "boolean", r);
}
function Mi(r, a, o) {
  return r == null || !Vp(r, a) ? o : r[a];
}
const s0 = It((r, a, o = null) => {
  const l = Mi(o, "allowArray", !1), m = Mi(o, "allowFunction", !1);
  if (!Mi(o, "nullable", !1) && r === null || !l && Ea(r) || typeof r != "object" && (!m || typeof r != "function"))
    throw new yt(a, "Object", r);
}), l0 = It((r, a) => {
  if (r != null && typeof r != "object" && typeof r != "function")
    throw new yt(a, "a dictionary", r);
}), Ta = It((r, a, o = 0) => {
  if (!Ea(r))
    throw new yt(a, "Array", r);
  if (r.length < o) {
    const l = `must be longer than ${o}`;
    throw new Mr(a, r, l);
  }
});
function u0(r, a) {
  Ta(r, a);
  for (let o = 0; o < r.length; o++)
    Sa(r[o], `${a}[${o}]`);
}
function f0(r, a) {
  Ta(r, a);
  for (let o = 0; o < r.length; o++)
    Xs(r[o], `${a}[${o}]`);
}
function c0(r, a = "signal") {
  if (Sa(r, a), Lo[r] === void 0)
    throw Lo[Hp(r)] !== void 0 ? new Do(r + " (signals must use all capital letters)") : new Do(r);
}
const d0 = It((r, a = "buffer") => {
  if (!qp(r))
    throw new yt(a, ["Buffer", "TypedArray", "DataView"], r);
});
function h0(r, a) {
  const o = Yp(a), l = r.length;
  if (o === "hex" && l % 2 !== 0)
    throw new Mr("encoding", a, `is invalid for data of length ${l}`);
}
function p0(r, a = "Port", o = !0) {
  if (typeof r != "number" && typeof r != "string" || typeof r == "string" && Kp(r).length === 0 || +r !== +r >>> 0 || r > 65535 || r === 0 && !o)
    throw new Xp(a, r, o);
  return r | 0;
}
const _0 = It((r, a) => {
  if (r !== void 0 && (r === null || typeof r != "object" || !("aborted" in r)))
    throw new yt(a, "AbortSignal", r);
}), b0 = It((r, a) => {
  if (typeof r != "function")
    throw new yt(a, "Function", r);
}), m0 = It((r, a) => {
  if (typeof r != "function" || Zp(r))
    throw new yt(a, "Function", r);
}), g0 = It((r, a) => {
  if (r !== void 0)
    throw new yt(a, "undefined", r);
});
function y0(r, a, o) {
  if (!Vs(o, r))
    throw new yt(a, `('${zs(o, "|")}')`, r);
}
const v0 = /^(?:<[^>]*>)(?:\s*;\s*[^;"\s]+(?:=(")?[^;"\s]*\1)?)*$/;
function Bo(r, a) {
  if (typeof r > "u" || !Hs(v0, r))
    throw new Mr(
      a,
      r,
      'must be an array or string of format "</styles.css>; rel=preload; as=style"'
    );
}
function w0(r) {
  if (typeof r == "string")
    return Bo(r, "hints"), r;
  if (Ea(r)) {
    const a = r.length;
    let o = "";
    if (a === 0)
      return o;
    for (let l = 0; l < a; l++) {
      const m = r[l];
      Bo(m, "hints"), o += m, l !== a - 1 && (o += ", ");
    }
    return o;
  }
  throw new Mr(
    "hints",
    r,
    'must be an array or string of format "</styles.css>; rel=preload; as=style"'
  );
}
var Vn = {
  isInt32: Qp,
  isUint32: Jp,
  parseFileMode: r0,
  validateArray: Ta,
  validateStringArray: u0,
  validateBooleanArray: f0,
  validateBoolean: Xs,
  validateBuffer: d0,
  validateDictionary: l0,
  validateEncoding: h0,
  validateFunction: b0,
  validateInt32: i0,
  validateInteger: n0,
  validateNumber: a0,
  validateObject: s0,
  validateOneOf: o0,
  validatePlainFunction: m0,
  validatePort: p0,
  validateSignalName: c0,
  validateString: Sa,
  validateUint32: Ks,
  validateUndefined: g0,
  validateUnion: y0,
  validateAbortSignal: _0,
  validateLinkHeaderValue: w0
}, Ca = { exports: {} }, Ys = { exports: {} }, nt = Ys.exports = {}, Bt, Mt;
function ta() {
  throw new Error("setTimeout has not been defined");
}
function ra() {
  throw new Error("clearTimeout has not been defined");
}
(function() {
  try {
    typeof setTimeout == "function" ? Bt = setTimeout : Bt = ta;
  } catch {
    Bt = ta;
  }
  try {
    typeof clearTimeout == "function" ? Mt = clearTimeout : Mt = ra;
  } catch {
    Mt = ra;
  }
})();
function Zs(r) {
  if (Bt === setTimeout)
    return setTimeout(r, 0);
  if ((Bt === ta || !Bt) && setTimeout)
    return Bt = setTimeout, setTimeout(r, 0);
  try {
    return Bt(r, 0);
  } catch {
    try {
      return Bt.call(null, r, 0);
    } catch {
      return Bt.call(this, r, 0);
    }
  }
}
function E0(r) {
  if (Mt === clearTimeout)
    return clearTimeout(r);
  if ((Mt === ra || !Mt) && clearTimeout)
    return Mt = clearTimeout, clearTimeout(r);
  try {
    return Mt(r);
  } catch {
    try {
      return Mt.call(null, r);
    } catch {
      return Mt.call(this, r);
    }
  }
}
var Vt = [], Dr = !1, pr, Dn = -1;
function x0() {
  !Dr || !pr || (Dr = !1, pr.length ? Vt = pr.concat(Vt) : Dn = -1, Vt.length && qs());
}
function qs() {
  if (!Dr) {
    var r = Zs(x0);
    Dr = !0;
    for (var a = Vt.length; a; ) {
      for (pr = Vt, Vt = []; ++Dn < a; )
        pr && pr[Dn].run();
      Dn = -1, a = Vt.length;
    }
    pr = null, Dr = !1, E0(r);
  }
}
nt.nextTick = function(r) {
  var a = new Array(arguments.length - 1);
  if (arguments.length > 1)
    for (var o = 1; o < arguments.length; o++)
      a[o - 1] = arguments[o];
  Vt.push(new Qs(r, a)), Vt.length === 1 && !Dr && Zs(qs);
};
function Qs(r, a) {
  this.fun = r, this.array = a;
}
Qs.prototype.run = function() {
  this.fun.apply(null, this.array);
};
nt.title = "browser";
nt.browser = !0;
nt.env = {};
nt.argv = [];
nt.version = "";
nt.versions = {};
function Yt() {
}
nt.on = Yt;
nt.addListener = Yt;
nt.once = Yt;
nt.off = Yt;
nt.removeListener = Yt;
nt.removeAllListeners = Yt;
nt.emit = Yt;
nt.prependListener = Yt;
nt.prependOnceListener = Yt;
nt.listeners = function(r) {
  return [];
};
nt.binding = function(r) {
  throw new Error("process.binding is not supported");
};
nt.cwd = function() {
  return "/";
};
nt.chdir = function(r) {
  throw new Error("process.chdir is not supported");
};
nt.umask = function() {
  return 0;
};
var mr = Ys.exports;
const { Symbol: zn, SymbolAsyncIterator: Mo, SymbolIterator: Oo, SymbolFor: Js } = dt, el = zn("kDestroyed"), tl = zn("kIsErrored"), na = zn("kIsReadable"), rl = zn("kIsDisturbed"), S0 = Js("nodejs.webstream.isClosedPromise"), T0 = Js("nodejs.webstream.controllerErrorFunction");
function Hn(r, a = !1) {
  var o;
  return !!(r && typeof r.pipe == "function" && typeof r.on == "function" && (!a || typeof r.pause == "function" && typeof r.resume == "function") && (!r._writableState || ((o = r._readableState) === null || o === void 0 ? void 0 : o.readable) !== !1) && // Duplex
  (!r._writableState || r._readableState));
}
function Kn(r) {
  var a;
  return !!(r && typeof r.write == "function" && typeof r.on == "function" && (!r._readableState || ((a = r._writableState) === null || a === void 0 ? void 0 : a.writable) !== !1));
}
function C0(r) {
  return !!(r && typeof r.pipe == "function" && r._readableState && typeof r.on == "function" && typeof r.write == "function");
}
function $t(r) {
  return r && (r._readableState || r._writableState || typeof r.write == "function" && typeof r.on == "function" || typeof r.pipe == "function" && typeof r.on == "function");
}
function nl(r) {
  return !!(r && !$t(r) && typeof r.pipeThrough == "function" && typeof r.getReader == "function" && typeof r.cancel == "function");
}
function il(r) {
  return !!(r && !$t(r) && typeof r.getWriter == "function" && typeof r.abort == "function");
}
function al(r) {
  return !!(r && !$t(r) && typeof r.readable == "object" && typeof r.writable == "object");
}
function F0(r) {
  return nl(r) || il(r) || al(r);
}
function R0(r, a) {
  return r == null ? !1 : a === !0 ? typeof r[Mo] == "function" : a === !1 ? typeof r[Oo] == "function" : typeof r[Mo] == "function" || typeof r[Oo] == "function";
}
function Xn(r) {
  if (!$t(r))
    return null;
  const a = r._writableState, o = r._readableState, l = a || o;
  return !!(r.destroyed || r[el] || l != null && l.destroyed);
}
function ol(r) {
  if (!Kn(r))
    return null;
  if (r.writableEnded === !0)
    return !0;
  const a = r._writableState;
  return a != null && a.errored ? !1 : typeof a?.ended != "boolean" ? null : a.ended;
}
function A0(r, a) {
  if (!Kn(r))
    return null;
  if (r.writableFinished === !0)
    return !0;
  const o = r._writableState;
  return o != null && o.errored ? !1 : typeof o?.finished != "boolean" ? null : !!(o.finished || a === !1 && o.ended === !0 && o.length === 0);
}
function I0(r) {
  if (!Hn(r))
    return null;
  if (r.readableEnded === !0)
    return !0;
  const a = r._readableState;
  return !a || a.errored ? !1 : typeof a?.ended != "boolean" ? null : a.ended;
}
function sl(r, a) {
  if (!Hn(r))
    return null;
  const o = r._readableState;
  return o != null && o.errored ? !1 : typeof o?.endEmitted != "boolean" ? null : !!(o.endEmitted || a === !1 && o.ended === !0 && o.length === 0);
}
function ll(r) {
  return r && r[na] != null ? r[na] : typeof r?.readable != "boolean" ? null : Xn(r) ? !1 : Hn(r) && r.readable && !sl(r);
}
function ul(r) {
  return typeof r?.writable != "boolean" ? null : Xn(r) ? !1 : Kn(r) && r.writable && !ol(r);
}
function k0(r, a) {
  return $t(r) ? Xn(r) ? !0 : !(a?.readable !== !1 && ll(r) || a?.writable !== !1 && ul(r)) : null;
}
function P0(r) {
  var a, o;
  return $t(r) ? r.writableErrored ? r.writableErrored : (a = (o = r._writableState) === null || o === void 0 ? void 0 : o.errored) !== null && a !== void 0 ? a : null : null;
}
function D0(r) {
  var a, o;
  return $t(r) ? r.readableErrored ? r.readableErrored : (a = (o = r._readableState) === null || o === void 0 ? void 0 : o.errored) !== null && a !== void 0 ? a : null : null;
}
function L0(r) {
  if (!$t(r))
    return null;
  if (typeof r.closed == "boolean")
    return r.closed;
  const a = r._writableState, o = r._readableState;
  return typeof a?.closed == "boolean" || typeof o?.closed == "boolean" ? a?.closed || o?.closed : typeof r._closed == "boolean" && fl(r) ? r._closed : null;
}
function fl(r) {
  return typeof r._closed == "boolean" && typeof r._defaultKeepAlive == "boolean" && typeof r._removedConnection == "boolean" && typeof r._removedContLen == "boolean";
}
function cl(r) {
  return typeof r._sent100 == "boolean" && fl(r);
}
function B0(r) {
  var a;
  return typeof r._consuming == "boolean" && typeof r._dumped == "boolean" && ((a = r.req) === null || a === void 0 ? void 0 : a.upgradeOrConnect) === void 0;
}
function M0(r) {
  if (!$t(r))
    return null;
  const a = r._writableState, o = r._readableState, l = a || o;
  return !l && cl(r) || !!(l && l.autoDestroy && l.emitClose && l.closed === !1);
}
function O0(r) {
  var a;
  return !!(r && ((a = r[rl]) !== null && a !== void 0 ? a : r.readableDidRead || r.readableAborted));
}
function N0(r) {
  var a, o, l, m, w, v, b, P, L, N;
  return !!(r && ((a = (o = (l = (m = (w = (v = r[tl]) !== null && v !== void 0 ? v : r.readableErrored) !== null && w !== void 0 ? w : r.writableErrored) !== null && m !== void 0 ? m : (b = r._readableState) === null || b === void 0 ? void 0 : b.errorEmitted) !== null && l !== void 0 ? l : (P = r._writableState) === null || P === void 0 ? void 0 : P.errorEmitted) !== null && o !== void 0 ? o : (L = r._readableState) === null || L === void 0 ? void 0 : L.errored) !== null && a !== void 0 ? a : !((N = r._writableState) === null || N === void 0) && N.errored));
}
var Zt = {
  kDestroyed: el,
  isDisturbed: O0,
  kIsDisturbed: rl,
  isErrored: N0,
  kIsErrored: tl,
  isReadable: ll,
  kIsReadable: na,
  kIsClosedPromise: S0,
  kControllerErrorFunction: T0,
  isClosed: L0,
  isDestroyed: Xn,
  isDuplexNodeStream: C0,
  isFinished: k0,
  isIterable: R0,
  isReadableNodeStream: Hn,
  isReadableStream: nl,
  isReadableEnded: I0,
  isReadableFinished: sl,
  isReadableErrored: D0,
  isNodeStream: $t,
  isWebStream: F0,
  isWritable: ul,
  isWritableNodeStream: Kn,
  isWritableStream: il,
  isWritableEnded: ol,
  isWritableFinished: A0,
  isWritableErrored: P0,
  isServerRequest: B0,
  isServerResponse: cl,
  willEmitClose: M0,
  isTransformStream: al
};
const Jt = mr, { AbortError: dl, codes: U0 } = Et, { ERR_INVALID_ARG_TYPE: $0, ERR_STREAM_PREMATURE_CLOSE: No } = U0, { kEmptyObject: ia, once: aa } = Xt, { validateAbortSignal: W0, validateFunction: j0, validateObject: G0, validateBoolean: V0 } = Vn, { Promise: z0, PromisePrototypeThen: H0 } = dt, {
  isClosed: K0,
  isReadable: Uo,
  isReadableNodeStream: Oi,
  isReadableStream: X0,
  isReadableFinished: $o,
  isReadableErrored: Wo,
  isWritable: jo,
  isWritableNodeStream: Go,
  isWritableStream: Y0,
  isWritableFinished: Vo,
  isWritableErrored: zo,
  isNodeStream: Z0,
  willEmitClose: q0,
  kIsClosedPromise: Q0
} = Zt;
function J0(r) {
  return r.setHeader && typeof r.abort == "function";
}
const oa = () => {
};
function hl(r, a, o) {
  var l, m;
  if (arguments.length === 2 ? (o = a, a = ia) : a == null ? a = ia : G0(a, "options"), j0(o, "callback"), W0(a.signal, "options.signal"), o = aa(o), X0(r) || Y0(r))
    return e_(r, a, o);
  if (!Z0(r))
    throw new $0("stream", ["ReadableStream", "WritableStream", "Stream"], r);
  const w = (l = a.readable) !== null && l !== void 0 ? l : Oi(r), v = (m = a.writable) !== null && m !== void 0 ? m : Go(r), b = r._writableState, P = r._readableState, L = () => {
    r.writable || re();
  };
  let N = q0(r) && Oi(r) === w && Go(r) === v, H = Vo(r, !1);
  const re = () => {
    H = !0, r.destroyed && (N = !1), !(N && (!r.readable || w)) && (!w || z) && o.call(r);
  };
  let z = $o(r, !1);
  const G = () => {
    z = !0, r.destroyed && (N = !1), !(N && (!r.writable || v)) && (!v || H) && o.call(r);
  }, ve = (ge) => {
    o.call(r, ge);
  };
  let ce = K0(r);
  const ue = () => {
    ce = !0;
    const ge = zo(r) || Wo(r);
    if (ge && typeof ge != "boolean")
      return o.call(r, ge);
    if (w && !z && Oi(r, !0) && !$o(r, !1))
      return o.call(r, new No());
    if (v && !H && !Vo(r, !1))
      return o.call(r, new No());
    o.call(r);
  }, Q = () => {
    ce = !0;
    const ge = zo(r) || Wo(r);
    if (ge && typeof ge != "boolean")
      return o.call(r, ge);
    o.call(r);
  }, Ce = () => {
    r.req.on("finish", re);
  };
  J0(r) ? (r.on("complete", re), N || r.on("abort", ue), r.req ? Ce() : r.on("request", Ce)) : v && !b && (r.on("end", L), r.on("close", L)), !N && typeof r.aborted == "boolean" && r.on("aborted", ue), r.on("end", G), r.on("finish", re), a.error !== !1 && r.on("error", ve), r.on("close", ue), ce ? Jt.nextTick(ue) : b != null && b.errorEmitted || P != null && P.errorEmitted ? N || Jt.nextTick(Q) : (!w && (!N || Uo(r)) && (H || jo(r) === !1) || !v && (!N || jo(r)) && (z || Uo(r) === !1) || P && r.req && r.aborted) && Jt.nextTick(Q);
  const Ge = () => {
    o = oa, r.removeListener("aborted", ue), r.removeListener("complete", re), r.removeListener("abort", ue), r.removeListener("request", Ce), r.req && r.req.removeListener("finish", re), r.removeListener("end", L), r.removeListener("close", L), r.removeListener("finish", re), r.removeListener("end", G), r.removeListener("error", ve), r.removeListener("close", ue);
  };
  if (a.signal && !ce) {
    const ge = () => {
      const Fe = o;
      Ge(), Fe.call(
        r,
        new dl(void 0, {
          cause: a.signal.reason
        })
      );
    };
    if (a.signal.aborted)
      Jt.nextTick(ge);
    else {
      const Fe = o;
      o = aa((...he) => {
        a.signal.removeEventListener("abort", ge), Fe.apply(r, he);
      }), a.signal.addEventListener("abort", ge);
    }
  }
  return Ge;
}
function e_(r, a, o) {
  let l = !1, m = oa;
  if (a.signal)
    if (m = () => {
      l = !0, o.call(
        r,
        new dl(void 0, {
          cause: a.signal.reason
        })
      );
    }, a.signal.aborted)
      Jt.nextTick(m);
    else {
      const v = o;
      o = aa((...b) => {
        a.signal.removeEventListener("abort", m), v.apply(r, b);
      }), a.signal.addEventListener("abort", m);
    }
  const w = (...v) => {
    l || Jt.nextTick(() => o.apply(r, v));
  };
  return H0(r[Q0].promise, w, w), oa;
}
function t_(r, a) {
  var o;
  let l = !1;
  return a === null && (a = ia), (o = a) !== null && o !== void 0 && o.cleanup && (V0(a.cleanup, "cleanup"), l = a.cleanup), new z0((m, w) => {
    const v = hl(r, a, (b) => {
      l && v(), b ? w(b) : m();
    });
  });
}
Ca.exports = hl;
Ca.exports.finished = t_;
var rr = Ca.exports;
const Nt = mr, {
  aggregateTwoErrors: r_,
  codes: { ERR_MULTIPLE_CALLBACK: n_ },
  AbortError: i_
} = Et, { Symbol: pl } = dt, { kDestroyed: a_, isDestroyed: o_, isFinished: s_, isServerRequest: l_ } = Zt, _l = pl("kDestroy"), sa = pl("kConstruct");
function bl(r, a, o) {
  r && (a && !a.errored && (a.errored = r), o && !o.errored && (o.errored = r));
}
function u_(r, a) {
  const o = this._readableState, l = this._writableState, m = l || o;
  return l != null && l.destroyed || o != null && o.destroyed ? (typeof a == "function" && a(), this) : (bl(r, l, o), l && (l.destroyed = !0), o && (o.destroyed = !0), m.constructed ? Ho(this, r, a) : this.once(_l, function(w) {
    Ho(this, r_(w, r), a);
  }), this);
}
function Ho(r, a, o) {
  let l = !1;
  function m(w) {
    if (l)
      return;
    l = !0;
    const v = r._readableState, b = r._writableState;
    bl(w, b, v), b && (b.closed = !0), v && (v.closed = !0), typeof o == "function" && o(w), w ? Nt.nextTick(f_, r, w) : Nt.nextTick(ml, r);
  }
  try {
    r._destroy(a || null, m);
  } catch (w) {
    m(w);
  }
}
function f_(r, a) {
  la(r, a), ml(r);
}
function ml(r) {
  const a = r._readableState, o = r._writableState;
  o && (o.closeEmitted = !0), a && (a.closeEmitted = !0), (o != null && o.emitClose || a != null && a.emitClose) && r.emit("close");
}
function la(r, a) {
  const o = r._readableState, l = r._writableState;
  l != null && l.errorEmitted || o != null && o.errorEmitted || (l && (l.errorEmitted = !0), o && (o.errorEmitted = !0), r.emit("error", a));
}
function c_() {
  const r = this._readableState, a = this._writableState;
  r && (r.constructed = !0, r.closed = !1, r.closeEmitted = !1, r.destroyed = !1, r.errored = null, r.errorEmitted = !1, r.reading = !1, r.ended = r.readable === !1, r.endEmitted = r.readable === !1), a && (a.constructed = !0, a.destroyed = !1, a.closed = !1, a.closeEmitted = !1, a.errored = null, a.errorEmitted = !1, a.finalCalled = !1, a.prefinished = !1, a.ended = a.writable === !1, a.ending = a.writable === !1, a.finished = a.writable === !1);
}
function ua(r, a, o) {
  const l = r._readableState, m = r._writableState;
  if (m != null && m.destroyed || l != null && l.destroyed)
    return this;
  l != null && l.autoDestroy || m != null && m.autoDestroy ? r.destroy(a) : a && (m && !m.errored && (m.errored = a), l && !l.errored && (l.errored = a), o ? Nt.nextTick(la, r, a) : la(r, a));
}
function d_(r, a) {
  if (typeof r._construct != "function")
    return;
  const o = r._readableState, l = r._writableState;
  o && (o.constructed = !1), l && (l.constructed = !1), r.once(sa, a), !(r.listenerCount(sa) > 1) && Nt.nextTick(h_, r);
}
function h_(r) {
  let a = !1;
  function o(l) {
    if (a) {
      ua(r, l ?? new n_());
      return;
    }
    a = !0;
    const m = r._readableState, w = r._writableState, v = w || m;
    m && (m.constructed = !0), w && (w.constructed = !0), v.destroyed ? r.emit(_l, l) : l ? ua(r, l, !0) : Nt.nextTick(p_, r);
  }
  try {
    r._construct((l) => {
      Nt.nextTick(o, l);
    });
  } catch (l) {
    Nt.nextTick(o, l);
  }
}
function p_(r) {
  r.emit(sa);
}
function Ko(r) {
  return r?.setHeader && typeof r.abort == "function";
}
function gl(r) {
  r.emit("close");
}
function __(r, a) {
  r.emit("error", a), Nt.nextTick(gl, r);
}
function b_(r, a) {
  !r || o_(r) || (!a && !s_(r) && (a = new i_()), l_(r) ? (r.socket = null, r.destroy(a)) : Ko(r) ? r.abort() : Ko(r.req) ? r.req.abort() : typeof r.destroy == "function" ? r.destroy(a) : typeof r.close == "function" ? r.close() : a ? Nt.nextTick(__, r, a) : Nt.nextTick(gl, r), r.destroyed || (r[a_] = !0));
}
var Or = {
  construct: d_,
  destroyer: b_,
  destroy: u_,
  undestroy: c_,
  errorOrDestroy: ua
}, Fa = { exports: {} }, Lr = typeof Reflect == "object" ? Reflect : null, Xo = Lr && typeof Lr.apply == "function" ? Lr.apply : function(a, o, l) {
  return Function.prototype.apply.call(a, o, l);
}, Ln;
Lr && typeof Lr.ownKeys == "function" ? Ln = Lr.ownKeys : Object.getOwnPropertySymbols ? Ln = function(a) {
  return Object.getOwnPropertyNames(a).concat(Object.getOwnPropertySymbols(a));
} : Ln = function(a) {
  return Object.getOwnPropertyNames(a);
};
function m_(r) {
  console && console.warn && console.warn(r);
}
var yl = Number.isNaN || function(a) {
  return a !== a;
};
function He() {
  He.init.call(this);
}
Fa.exports = He;
Fa.exports.once = w_;
He.EventEmitter = He;
He.prototype._events = void 0;
He.prototype._eventsCount = 0;
He.prototype._maxListeners = void 0;
var Yo = 10;
function Yn(r) {
  if (typeof r != "function")
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof r);
}
Object.defineProperty(He, "defaultMaxListeners", {
  enumerable: !0,
  get: function() {
    return Yo;
  },
  set: function(r) {
    if (typeof r != "number" || r < 0 || yl(r))
      throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + r + ".");
    Yo = r;
  }
});
He.init = function() {
  (this._events === void 0 || this._events === Object.getPrototypeOf(this)._events) && (this._events = /* @__PURE__ */ Object.create(null), this._eventsCount = 0), this._maxListeners = this._maxListeners || void 0;
};
He.prototype.setMaxListeners = function(a) {
  if (typeof a != "number" || a < 0 || yl(a))
    throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + a + ".");
  return this._maxListeners = a, this;
};
function vl(r) {
  return r._maxListeners === void 0 ? He.defaultMaxListeners : r._maxListeners;
}
He.prototype.getMaxListeners = function() {
  return vl(this);
};
He.prototype.emit = function(a) {
  for (var o = [], l = 1; l < arguments.length; l++)
    o.push(arguments[l]);
  var m = a === "error", w = this._events;
  if (w !== void 0)
    m = m && w.error === void 0;
  else if (!m)
    return !1;
  if (m) {
    var v;
    if (o.length > 0 && (v = o[0]), v instanceof Error)
      throw v;
    var b = new Error("Unhandled error." + (v ? " (" + v.message + ")" : ""));
    throw b.context = v, b;
  }
  var P = w[a];
  if (P === void 0)
    return !1;
  if (typeof P == "function")
    Xo(P, this, o);
  else
    for (var L = P.length, N = Tl(P, L), l = 0; l < L; ++l)
      Xo(N[l], this, o);
  return !0;
};
function wl(r, a, o, l) {
  var m, w, v;
  if (Yn(o), w = r._events, w === void 0 ? (w = r._events = /* @__PURE__ */ Object.create(null), r._eventsCount = 0) : (w.newListener !== void 0 && (r.emit(
    "newListener",
    a,
    o.listener ? o.listener : o
  ), w = r._events), v = w[a]), v === void 0)
    v = w[a] = o, ++r._eventsCount;
  else if (typeof v == "function" ? v = w[a] = l ? [o, v] : [v, o] : l ? v.unshift(o) : v.push(o), m = vl(r), m > 0 && v.length > m && !v.warned) {
    v.warned = !0;
    var b = new Error("Possible EventEmitter memory leak detected. " + v.length + " " + String(a) + " listeners added. Use emitter.setMaxListeners() to increase limit");
    b.name = "MaxListenersExceededWarning", b.emitter = r, b.type = a, b.count = v.length, m_(b);
  }
  return r;
}
He.prototype.addListener = function(a, o) {
  return wl(this, a, o, !1);
};
He.prototype.on = He.prototype.addListener;
He.prototype.prependListener = function(a, o) {
  return wl(this, a, o, !0);
};
function g_() {
  if (!this.fired)
    return this.target.removeListener(this.type, this.wrapFn), this.fired = !0, arguments.length === 0 ? this.listener.call(this.target) : this.listener.apply(this.target, arguments);
}
function El(r, a, o) {
  var l = { fired: !1, wrapFn: void 0, target: r, type: a, listener: o }, m = g_.bind(l);
  return m.listener = o, l.wrapFn = m, m;
}
He.prototype.once = function(a, o) {
  return Yn(o), this.on(a, El(this, a, o)), this;
};
He.prototype.prependOnceListener = function(a, o) {
  return Yn(o), this.prependListener(a, El(this, a, o)), this;
};
He.prototype.removeListener = function(a, o) {
  var l, m, w, v, b;
  if (Yn(o), m = this._events, m === void 0)
    return this;
  if (l = m[a], l === void 0)
    return this;
  if (l === o || l.listener === o)
    --this._eventsCount === 0 ? this._events = /* @__PURE__ */ Object.create(null) : (delete m[a], m.removeListener && this.emit("removeListener", a, l.listener || o));
  else if (typeof l != "function") {
    for (w = -1, v = l.length - 1; v >= 0; v--)
      if (l[v] === o || l[v].listener === o) {
        b = l[v].listener, w = v;
        break;
      }
    if (w < 0)
      return this;
    w === 0 ? l.shift() : y_(l, w), l.length === 1 && (m[a] = l[0]), m.removeListener !== void 0 && this.emit("removeListener", a, b || o);
  }
  return this;
};
He.prototype.off = He.prototype.removeListener;
He.prototype.removeAllListeners = function(a) {
  var o, l, m;
  if (l = this._events, l === void 0)
    return this;
  if (l.removeListener === void 0)
    return arguments.length === 0 ? (this._events = /* @__PURE__ */ Object.create(null), this._eventsCount = 0) : l[a] !== void 0 && (--this._eventsCount === 0 ? this._events = /* @__PURE__ */ Object.create(null) : delete l[a]), this;
  if (arguments.length === 0) {
    var w = Object.keys(l), v;
    for (m = 0; m < w.length; ++m)
      v = w[m], v !== "removeListener" && this.removeAllListeners(v);
    return this.removeAllListeners("removeListener"), this._events = /* @__PURE__ */ Object.create(null), this._eventsCount = 0, this;
  }
  if (o = l[a], typeof o == "function")
    this.removeListener(a, o);
  else if (o !== void 0)
    for (m = o.length - 1; m >= 0; m--)
      this.removeListener(a, o[m]);
  return this;
};
function xl(r, a, o) {
  var l = r._events;
  if (l === void 0)
    return [];
  var m = l[a];
  return m === void 0 ? [] : typeof m == "function" ? o ? [m.listener || m] : [m] : o ? v_(m) : Tl(m, m.length);
}
He.prototype.listeners = function(a) {
  return xl(this, a, !0);
};
He.prototype.rawListeners = function(a) {
  return xl(this, a, !1);
};
He.listenerCount = function(r, a) {
  return typeof r.listenerCount == "function" ? r.listenerCount(a) : Sl.call(r, a);
};
He.prototype.listenerCount = Sl;
function Sl(r) {
  var a = this._events;
  if (a !== void 0) {
    var o = a[r];
    if (typeof o == "function")
      return 1;
    if (o !== void 0)
      return o.length;
  }
  return 0;
}
He.prototype.eventNames = function() {
  return this._eventsCount > 0 ? Ln(this._events) : [];
};
function Tl(r, a) {
  for (var o = new Array(a), l = 0; l < a; ++l)
    o[l] = r[l];
  return o;
}
function y_(r, a) {
  for (; a + 1 < r.length; a++)
    r[a] = r[a + 1];
  r.pop();
}
function v_(r) {
  for (var a = new Array(r.length), o = 0; o < a.length; ++o)
    a[o] = r[o].listener || r[o];
  return a;
}
function w_(r, a) {
  return new Promise(function(o, l) {
    function m(v) {
      r.removeListener(a, w), l(v);
    }
    function w() {
      typeof r.removeListener == "function" && r.removeListener("error", m), o([].slice.call(arguments));
    }
    Cl(r, a, w, { once: !0 }), a !== "error" && E_(r, m, { once: !0 });
  });
}
function E_(r, a, o) {
  typeof r.on == "function" && Cl(r, "error", a, o);
}
function Cl(r, a, o, l) {
  if (typeof r.on == "function")
    l.once ? r.once(a, o) : r.on(a, o);
  else if (typeof r.addEventListener == "function")
    r.addEventListener(a, function m(w) {
      l.once && r.removeEventListener(a, m), o(w);
    });
  else
    throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof r);
}
var Ra = Fa.exports;
const { ArrayIsArray: x_, ObjectSetPrototypeOf: Fl } = dt, { EventEmitter: Zn } = Ra;
function qn(r) {
  Zn.call(this, r);
}
Fl(qn.prototype, Zn.prototype);
Fl(qn, Zn);
qn.prototype.pipe = function(r, a) {
  const o = this;
  function l(N) {
    r.writable && r.write(N) === !1 && o.pause && o.pause();
  }
  o.on("data", l);
  function m() {
    o.readable && o.resume && o.resume();
  }
  r.on("drain", m), !r._isStdio && (!a || a.end !== !1) && (o.on("end", v), o.on("close", b));
  let w = !1;
  function v() {
    w || (w = !0, r.end());
  }
  function b() {
    w || (w = !0, typeof r.destroy == "function" && r.destroy());
  }
  function P(N) {
    L(), Zn.listenerCount(this, "error") === 0 && this.emit("error", N);
  }
  fa(o, "error", P), fa(r, "error", P);
  function L() {
    o.removeListener("data", l), r.removeListener("drain", m), o.removeListener("end", v), o.removeListener("close", b), o.removeListener("error", P), r.removeListener("error", P), o.removeListener("end", L), o.removeListener("close", L), r.removeListener("close", L);
  }
  return o.on("end", L), o.on("close", L), r.on("close", L), r.emit("pipe", o), r;
};
function fa(r, a, o) {
  if (typeof r.prependListener == "function")
    return r.prependListener(a, o);
  !r._events || !r._events[a] ? r.on(a, o) : x_(r._events[a]) ? r._events[a].unshift(o) : r._events[a] = [o, r._events[a]];
}
var Aa = {
  Stream: qn,
  prependListener: fa
}, Rl = { exports: {} };
(function(r) {
  const { AbortError: a, codes: o } = Et, { isNodeStream: l, isWebStream: m, kControllerErrorFunction: w } = Zt, v = rr, { ERR_INVALID_ARG_TYPE: b } = o, P = (L, N) => {
    if (typeof L != "object" || !("aborted" in L))
      throw new b(N, "AbortSignal", L);
  };
  r.exports.addAbortSignal = function(N, H) {
    if (P(N, "signal"), !l(H) && !m(H))
      throw new b("stream", ["ReadableStream", "WritableStream", "Stream"], H);
    return r.exports.addAbortSignalNoValidate(N, H);
  }, r.exports.addAbortSignalNoValidate = function(L, N) {
    if (typeof L != "object" || !("aborted" in L))
      return N;
    const H = l(N) ? () => {
      N.destroy(
        new a(void 0, {
          cause: L.reason
        })
      );
    } : () => {
      N[w](
        new a(void 0, {
          cause: L.reason
        })
      );
    };
    return L.aborted ? H() : (L.addEventListener("abort", H), v(N, () => L.removeEventListener("abort", H))), N;
  };
})(Rl);
var Qn = Rl.exports;
const { StringPrototypeSlice: Zo, SymbolIterator: S_, TypedArrayPrototypeSet: An, Uint8Array: T_ } = dt, { Buffer: Ni } = tr, { inspect: C_ } = Xt;
var F_ = class {
  constructor() {
    this.head = null, this.tail = null, this.length = 0;
  }
  push(a) {
    const o = {
      data: a,
      next: null
    };
    this.length > 0 ? this.tail.next = o : this.head = o, this.tail = o, ++this.length;
  }
  unshift(a) {
    const o = {
      data: a,
      next: this.head
    };
    this.length === 0 && (this.tail = o), this.head = o, ++this.length;
  }
  shift() {
    if (this.length === 0)
      return;
    const a = this.head.data;
    return this.length === 1 ? this.head = this.tail = null : this.head = this.head.next, --this.length, a;
  }
  clear() {
    this.head = this.tail = null, this.length = 0;
  }
  join(a) {
    if (this.length === 0)
      return "";
    let o = this.head, l = "" + o.data;
    for (; (o = o.next) !== null; )
      l += a + o.data;
    return l;
  }
  concat(a) {
    if (this.length === 0)
      return Ni.alloc(0);
    const o = Ni.allocUnsafe(a >>> 0);
    let l = this.head, m = 0;
    for (; l; )
      An(o, l.data, m), m += l.data.length, l = l.next;
    return o;
  }
  // Consumes a specified amount of bytes or characters from the buffered data.
  consume(a, o) {
    const l = this.head.data;
    if (a < l.length) {
      const m = l.slice(0, a);
      return this.head.data = l.slice(a), m;
    }
    return a === l.length ? this.shift() : o ? this._getString(a) : this._getBuffer(a);
  }
  first() {
    return this.head.data;
  }
  *[S_]() {
    for (let a = this.head; a; a = a.next)
      yield a.data;
  }
  // Consumes a specified amount of characters from the buffered data.
  _getString(a) {
    let o = "", l = this.head, m = 0;
    do {
      const w = l.data;
      if (a > w.length)
        o += w, a -= w.length;
      else {
        a === w.length ? (o += w, ++m, l.next ? this.head = l.next : this.head = this.tail = null) : (o += Zo(w, 0, a), this.head = l, l.data = Zo(w, a));
        break;
      }
      ++m;
    } while ((l = l.next) !== null);
    return this.length -= m, o;
  }
  // Consumes a specified amount of bytes from the buffered data.
  _getBuffer(a) {
    const o = Ni.allocUnsafe(a), l = a;
    let m = this.head, w = 0;
    do {
      const v = m.data;
      if (a > v.length)
        An(o, v, l - a), a -= v.length;
      else {
        a === v.length ? (An(o, v, l - a), ++w, m.next ? this.head = m.next : this.head = this.tail = null) : (An(o, new T_(v.buffer, v.byteOffset, a), l - a), this.head = m, m.data = v.slice(a));
        break;
      }
      ++w;
    } while ((m = m.next) !== null);
    return this.length -= w, o;
  }
  // Make sure the linked list only shows the minimal necessary information.
  [Symbol.for("nodejs.util.inspect.custom")](a, o) {
    return C_(this, {
      ...o,
      // Only inspect one level.
      depth: 0,
      // It should not recurse.
      customInspect: !1
    });
  }
};
const { MathFloor: R_, NumberIsInteger: A_ } = dt, { ERR_INVALID_ARG_VALUE: I_ } = Et.codes;
function k_(r, a, o) {
  return r.highWaterMark != null ? r.highWaterMark : a ? r[o] : null;
}
function Al(r) {
  return r ? 16 : 16 * 1024;
}
function P_(r, a, o, l) {
  const m = k_(a, l, o);
  if (m != null) {
    if (!A_(m) || m < 0) {
      const w = l ? `options.${o}` : "options.highWaterMark";
      throw new I_(w, m);
    }
    return R_(m);
  }
  return Al(r.objectMode);
}
var Ia = {
  getHighWaterMark: P_,
  getDefaultHighWaterMark: Al
}, Il = {}, ca = { exports: {} }, kl = {};
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
(function(r) {
  var a = tn, o = jn, l = typeof Symbol == "function" && typeof Symbol.for == "function" ? Symbol.for("nodejs.util.inspect.custom") : null;
  r.Buffer = b, r.SlowBuffer = Q, r.INSPECT_MAX_BYTES = 50;
  var m = 2147483647;
  r.kMaxLength = m, b.TYPED_ARRAY_SUPPORT = w(), !b.TYPED_ARRAY_SUPPORT && typeof console < "u" && typeof console.error == "function" && console.error(
    "This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support."
  );
  function w() {
    try {
      var x = new Uint8Array(1), d = { foo: function() {
        return 42;
      } };
      return Object.setPrototypeOf(d, Uint8Array.prototype), Object.setPrototypeOf(x, d), x.foo() === 42;
    } catch {
      return !1;
    }
  }
  Object.defineProperty(b.prototype, "parent", {
    enumerable: !0,
    get: function() {
      if (b.isBuffer(this))
        return this.buffer;
    }
  }), Object.defineProperty(b.prototype, "offset", {
    enumerable: !0,
    get: function() {
      if (b.isBuffer(this))
        return this.byteOffset;
    }
  });
  function v(x) {
    if (x > m)
      throw new RangeError('The value "' + x + '" is invalid for option "size"');
    var d = new Uint8Array(x);
    return Object.setPrototypeOf(d, b.prototype), d;
  }
  function b(x, d, _) {
    if (typeof x == "number") {
      if (typeof d == "string")
        throw new TypeError(
          'The "string" argument must be of type string. Received type number'
        );
      return H(x);
    }
    return P(x, d, _);
  }
  b.poolSize = 8192;
  function P(x, d, _) {
    if (typeof x == "string")
      return re(x, d);
    if (ArrayBuffer.isView(x))
      return G(x);
    if (x == null)
      throw new TypeError(
        "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof x
      );
    if (M(x, ArrayBuffer) || x && M(x.buffer, ArrayBuffer) || typeof SharedArrayBuffer < "u" && (M(x, SharedArrayBuffer) || x && M(x.buffer, SharedArrayBuffer)))
      return ve(x, d, _);
    if (typeof x == "number")
      throw new TypeError(
        'The "value" argument must not be of type number. Received type number'
      );
    var C = x.valueOf && x.valueOf();
    if (C != null && C !== x)
      return b.from(C, d, _);
    var O = ce(x);
    if (O)
      return O;
    if (typeof Symbol < "u" && Symbol.toPrimitive != null && typeof x[Symbol.toPrimitive] == "function")
      return b.from(
        x[Symbol.toPrimitive]("string"),
        d,
        _
      );
    throw new TypeError(
      "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof x
    );
  }
  b.from = function(x, d, _) {
    return P(x, d, _);
  }, Object.setPrototypeOf(b.prototype, Uint8Array.prototype), Object.setPrototypeOf(b, Uint8Array);
  function L(x) {
    if (typeof x != "number")
      throw new TypeError('"size" argument must be of type number');
    if (x < 0)
      throw new RangeError('The value "' + x + '" is invalid for option "size"');
  }
  function N(x, d, _) {
    return L(x), x <= 0 ? v(x) : d !== void 0 ? typeof _ == "string" ? v(x).fill(d, _) : v(x).fill(d) : v(x);
  }
  b.alloc = function(x, d, _) {
    return N(x, d, _);
  };
  function H(x) {
    return L(x), v(x < 0 ? 0 : ue(x) | 0);
  }
  b.allocUnsafe = function(x) {
    return H(x);
  }, b.allocUnsafeSlow = function(x) {
    return H(x);
  };
  function re(x, d) {
    if ((typeof d != "string" || d === "") && (d = "utf8"), !b.isEncoding(d))
      throw new TypeError("Unknown encoding: " + d);
    var _ = Ce(x, d) | 0, C = v(_), O = C.write(x, d);
    return O !== _ && (C = C.slice(0, O)), C;
  }
  function z(x) {
    for (var d = x.length < 0 ? 0 : ue(x.length) | 0, _ = v(d), C = 0; C < d; C += 1)
      _[C] = x[C] & 255;
    return _;
  }
  function G(x) {
    if (M(x, Uint8Array)) {
      var d = new Uint8Array(x);
      return ve(d.buffer, d.byteOffset, d.byteLength);
    }
    return z(x);
  }
  function ve(x, d, _) {
    if (d < 0 || x.byteLength < d)
      throw new RangeError('"offset" is outside of buffer bounds');
    if (x.byteLength < d + (_ || 0))
      throw new RangeError('"length" is outside of buffer bounds');
    var C;
    return d === void 0 && _ === void 0 ? C = new Uint8Array(x) : _ === void 0 ? C = new Uint8Array(x, d) : C = new Uint8Array(x, d, _), Object.setPrototypeOf(C, b.prototype), C;
  }
  function ce(x) {
    if (b.isBuffer(x)) {
      var d = ue(x.length) | 0, _ = v(d);
      return _.length === 0 || x.copy(_, 0, 0, d), _;
    }
    if (x.length !== void 0)
      return typeof x.length != "number" || U(x.length) ? v(0) : z(x);
    if (x.type === "Buffer" && Array.isArray(x.data))
      return z(x.data);
  }
  function ue(x) {
    if (x >= m)
      throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + m.toString(16) + " bytes");
    return x | 0;
  }
  function Q(x) {
    return +x != x && (x = 0), b.alloc(+x);
  }
  b.isBuffer = function(d) {
    return d != null && d._isBuffer === !0 && d !== b.prototype;
  }, b.compare = function(d, _) {
    if (M(d, Uint8Array) && (d = b.from(d, d.offset, d.byteLength)), M(_, Uint8Array) && (_ = b.from(_, _.offset, _.byteLength)), !b.isBuffer(d) || !b.isBuffer(_))
      throw new TypeError(
        'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
      );
    if (d === _)
      return 0;
    for (var C = d.length, O = _.length, X = 0, q = Math.min(C, O); X < q; ++X)
      if (d[X] !== _[X]) {
        C = d[X], O = _[X];
        break;
      }
    return C < O ? -1 : O < C ? 1 : 0;
  }, b.isEncoding = function(d) {
    switch (String(d).toLowerCase()) {
      case "hex":
      case "utf8":
      case "utf-8":
      case "ascii":
      case "latin1":
      case "binary":
      case "base64":
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return !0;
      default:
        return !1;
    }
  }, b.concat = function(d, _) {
    if (!Array.isArray(d))
      throw new TypeError('"list" argument must be an Array of Buffers');
    if (d.length === 0)
      return b.alloc(0);
    var C;
    if (_ === void 0)
      for (_ = 0, C = 0; C < d.length; ++C)
        _ += d[C].length;
    var O = b.allocUnsafe(_), X = 0;
    for (C = 0; C < d.length; ++C) {
      var q = d[C];
      if (M(q, Uint8Array))
        X + q.length > O.length ? b.from(q).copy(O, X) : Uint8Array.prototype.set.call(
          O,
          q,
          X
        );
      else if (b.isBuffer(q))
        q.copy(O, X);
      else
        throw new TypeError('"list" argument must be an Array of Buffers');
      X += q.length;
    }
    return O;
  };
  function Ce(x, d) {
    if (b.isBuffer(x))
      return x.length;
    if (ArrayBuffer.isView(x) || M(x, ArrayBuffer))
      return x.byteLength;
    if (typeof x != "string")
      throw new TypeError(
        'The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof x
      );
    var _ = x.length, C = arguments.length > 2 && arguments[2] === !0;
    if (!C && _ === 0)
      return 0;
    for (var O = !1; ; )
      switch (d) {
        case "ascii":
        case "latin1":
        case "binary":
          return _;
        case "utf8":
        case "utf-8":
          return ft(x).length;
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return _ * 2;
        case "hex":
          return _ >>> 1;
        case "base64":
          return mt(x).length;
        default:
          if (O)
            return C ? -1 : ft(x).length;
          d = ("" + d).toLowerCase(), O = !0;
      }
  }
  b.byteLength = Ce;
  function Ge(x, d, _) {
    var C = !1;
    if ((d === void 0 || d < 0) && (d = 0), d > this.length || ((_ === void 0 || _ > this.length) && (_ = this.length), _ <= 0) || (_ >>>= 0, d >>>= 0, _ <= d))
      return "";
    for (x || (x = "utf8"); ; )
      switch (x) {
        case "hex":
          return ht(this, d, _);
        case "utf8":
        case "utf-8":
          return De(this, d, _);
        case "ascii":
          return et(this, d, _);
        case "latin1":
        case "binary":
          return Oe(this, d, _);
        case "base64":
          return Te(this, d, _);
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return ne(this, d, _);
        default:
          if (C)
            throw new TypeError("Unknown encoding: " + x);
          x = (x + "").toLowerCase(), C = !0;
      }
  }
  b.prototype._isBuffer = !0;
  function ge(x, d, _) {
    var C = x[d];
    x[d] = x[_], x[_] = C;
  }
  b.prototype.swap16 = function() {
    var d = this.length;
    if (d % 2 !== 0)
      throw new RangeError("Buffer size must be a multiple of 16-bits");
    for (var _ = 0; _ < d; _ += 2)
      ge(this, _, _ + 1);
    return this;
  }, b.prototype.swap32 = function() {
    var d = this.length;
    if (d % 4 !== 0)
      throw new RangeError("Buffer size must be a multiple of 32-bits");
    for (var _ = 0; _ < d; _ += 4)
      ge(this, _, _ + 3), ge(this, _ + 1, _ + 2);
    return this;
  }, b.prototype.swap64 = function() {
    var d = this.length;
    if (d % 8 !== 0)
      throw new RangeError("Buffer size must be a multiple of 64-bits");
    for (var _ = 0; _ < d; _ += 8)
      ge(this, _, _ + 7), ge(this, _ + 1, _ + 6), ge(this, _ + 2, _ + 5), ge(this, _ + 3, _ + 4);
    return this;
  }, b.prototype.toString = function() {
    var d = this.length;
    return d === 0 ? "" : arguments.length === 0 ? De(this, 0, d) : Ge.apply(this, arguments);
  }, b.prototype.toLocaleString = b.prototype.toString, b.prototype.equals = function(d) {
    if (!b.isBuffer(d))
      throw new TypeError("Argument must be a Buffer");
    return this === d ? !0 : b.compare(this, d) === 0;
  }, b.prototype.inspect = function() {
    var d = "", _ = r.INSPECT_MAX_BYTES;
    return d = this.toString("hex", 0, _).replace(/(.{2})/g, "$1 ").trim(), this.length > _ && (d += " ... "), "<Buffer " + d + ">";
  }, l && (b.prototype[l] = b.prototype.inspect), b.prototype.compare = function(d, _, C, O, X) {
    if (M(d, Uint8Array) && (d = b.from(d, d.offset, d.byteLength)), !b.isBuffer(d))
      throw new TypeError(
        'The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof d
      );
    if (_ === void 0 && (_ = 0), C === void 0 && (C = d ? d.length : 0), O === void 0 && (O = 0), X === void 0 && (X = this.length), _ < 0 || C > d.length || O < 0 || X > this.length)
      throw new RangeError("out of range index");
    if (O >= X && _ >= C)
      return 0;
    if (O >= X)
      return -1;
    if (_ >= C)
      return 1;
    if (_ >>>= 0, C >>>= 0, O >>>= 0, X >>>= 0, this === d)
      return 0;
    for (var q = X - O, we = C - _, Ne = Math.min(q, we), S = this.slice(O, X), F = d.slice(_, C), g = 0; g < Ne; ++g)
      if (S[g] !== F[g]) {
        q = S[g], we = F[g];
        break;
      }
    return q < we ? -1 : we < q ? 1 : 0;
  };
  function Fe(x, d, _, C, O) {
    if (x.length === 0)
      return -1;
    if (typeof _ == "string" ? (C = _, _ = 0) : _ > 2147483647 ? _ = 2147483647 : _ < -2147483648 && (_ = -2147483648), _ = +_, U(_) && (_ = O ? 0 : x.length - 1), _ < 0 && (_ = x.length + _), _ >= x.length) {
      if (O)
        return -1;
      _ = x.length - 1;
    } else if (_ < 0)
      if (O)
        _ = 0;
      else
        return -1;
    if (typeof d == "string" && (d = b.from(d, C)), b.isBuffer(d))
      return d.length === 0 ? -1 : he(x, d, _, C, O);
    if (typeof d == "number")
      return d = d & 255, typeof Uint8Array.prototype.indexOf == "function" ? O ? Uint8Array.prototype.indexOf.call(x, d, _) : Uint8Array.prototype.lastIndexOf.call(x, d, _) : he(x, [d], _, C, O);
    throw new TypeError("val must be string, number or Buffer");
  }
  function he(x, d, _, C, O) {
    var X = 1, q = x.length, we = d.length;
    if (C !== void 0 && (C = String(C).toLowerCase(), C === "ucs2" || C === "ucs-2" || C === "utf16le" || C === "utf-16le")) {
      if (x.length < 2 || d.length < 2)
        return -1;
      X = 2, q /= 2, we /= 2, _ /= 2;
    }
    function Ne(c, T) {
      return X === 1 ? c[T] : c.readUInt16BE(T * X);
    }
    var S;
    if (O) {
      var F = -1;
      for (S = _; S < q; S++)
        if (Ne(x, S) === Ne(d, F === -1 ? 0 : S - F)) {
          if (F === -1 && (F = S), S - F + 1 === we)
            return F * X;
        } else
          F !== -1 && (S -= S - F), F = -1;
    } else
      for (_ + we > q && (_ = q - we), S = _; S >= 0; S--) {
        for (var g = !0, u = 0; u < we; u++)
          if (Ne(x, S + u) !== Ne(d, u)) {
            g = !1;
            break;
          }
        if (g)
          return S;
      }
    return -1;
  }
  b.prototype.includes = function(d, _, C) {
    return this.indexOf(d, _, C) !== -1;
  }, b.prototype.indexOf = function(d, _, C) {
    return Fe(this, d, _, C, !0);
  }, b.prototype.lastIndexOf = function(d, _, C) {
    return Fe(this, d, _, C, !1);
  };
  function _e(x, d, _, C) {
    _ = Number(_) || 0;
    var O = x.length - _;
    C ? (C = Number(C), C > O && (C = O)) : C = O;
    var X = d.length;
    C > X / 2 && (C = X / 2);
    for (var q = 0; q < C; ++q) {
      var we = parseInt(d.substr(q * 2, 2), 16);
      if (U(we))
        return q;
      x[_ + q] = we;
    }
    return q;
  }
  function Me(x, d, _, C) {
    return it(ft(d, x.length - _), x, _, C);
  }
  function k(x, d, _, C) {
    return it(rt(d), x, _, C);
  }
  function Y(x, d, _, C) {
    return it(mt(d), x, _, C);
  }
  function We(x, d, _, C) {
    return it(vt(d, x.length - _), x, _, C);
  }
  b.prototype.write = function(d, _, C, O) {
    if (_ === void 0)
      O = "utf8", C = this.length, _ = 0;
    else if (C === void 0 && typeof _ == "string")
      O = _, C = this.length, _ = 0;
    else if (isFinite(_))
      _ = _ >>> 0, isFinite(C) ? (C = C >>> 0, O === void 0 && (O = "utf8")) : (O = C, C = void 0);
    else
      throw new Error(
        "Buffer.write(string, encoding, offset[, length]) is no longer supported"
      );
    var X = this.length - _;
    if ((C === void 0 || C > X) && (C = X), d.length > 0 && (C < 0 || _ < 0) || _ > this.length)
      throw new RangeError("Attempt to write outside buffer bounds");
    O || (O = "utf8");
    for (var q = !1; ; )
      switch (O) {
        case "hex":
          return _e(this, d, _, C);
        case "utf8":
        case "utf-8":
          return Me(this, d, _, C);
        case "ascii":
        case "latin1":
        case "binary":
          return k(this, d, _, C);
        case "base64":
          return Y(this, d, _, C);
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return We(this, d, _, C);
        default:
          if (q)
            throw new TypeError("Unknown encoding: " + O);
          O = ("" + O).toLowerCase(), q = !0;
      }
  }, b.prototype.toJSON = function() {
    return {
      type: "Buffer",
      data: Array.prototype.slice.call(this._arr || this, 0)
    };
  };
  function Te(x, d, _) {
    return d === 0 && _ === x.length ? a.fromByteArray(x) : a.fromByteArray(x.slice(d, _));
  }
  function De(x, d, _) {
    _ = Math.min(x.length, _);
    for (var C = [], O = d; O < _; ) {
      var X = x[O], q = null, we = X > 239 ? 4 : X > 223 ? 3 : X > 191 ? 2 : 1;
      if (O + we <= _) {
        var Ne, S, F, g;
        switch (we) {
          case 1:
            X < 128 && (q = X);
            break;
          case 2:
            Ne = x[O + 1], (Ne & 192) === 128 && (g = (X & 31) << 6 | Ne & 63, g > 127 && (q = g));
            break;
          case 3:
            Ne = x[O + 1], S = x[O + 2], (Ne & 192) === 128 && (S & 192) === 128 && (g = (X & 15) << 12 | (Ne & 63) << 6 | S & 63, g > 2047 && (g < 55296 || g > 57343) && (q = g));
            break;
          case 4:
            Ne = x[O + 1], S = x[O + 2], F = x[O + 3], (Ne & 192) === 128 && (S & 192) === 128 && (F & 192) === 128 && (g = (X & 15) << 18 | (Ne & 63) << 12 | (S & 63) << 6 | F & 63, g > 65535 && g < 1114112 && (q = g));
        }
      }
      q === null ? (q = 65533, we = 1) : q > 65535 && (q -= 65536, C.push(q >>> 10 & 1023 | 55296), q = 56320 | q & 1023), C.push(q), O += we;
    }
    return Ke(C);
  }
  var ye = 4096;
  function Ke(x) {
    var d = x.length;
    if (d <= ye)
      return String.fromCharCode.apply(String, x);
    for (var _ = "", C = 0; C < d; )
      _ += String.fromCharCode.apply(
        String,
        x.slice(C, C += ye)
      );
    return _;
  }
  function et(x, d, _) {
    var C = "";
    _ = Math.min(x.length, _);
    for (var O = d; O < _; ++O)
      C += String.fromCharCode(x[O] & 127);
    return C;
  }
  function Oe(x, d, _) {
    var C = "";
    _ = Math.min(x.length, _);
    for (var O = d; O < _; ++O)
      C += String.fromCharCode(x[O]);
    return C;
  }
  function ht(x, d, _) {
    var C = x.length;
    (!d || d < 0) && (d = 0), (!_ || _ < 0 || _ > C) && (_ = C);
    for (var O = "", X = d; X < _; ++X)
      O += J[x[X]];
    return O;
  }
  function ne(x, d, _) {
    for (var C = x.slice(d, _), O = "", X = 0; X < C.length - 1; X += 2)
      O += String.fromCharCode(C[X] + C[X + 1] * 256);
    return O;
  }
  b.prototype.slice = function(d, _) {
    var C = this.length;
    d = ~~d, _ = _ === void 0 ? C : ~~_, d < 0 ? (d += C, d < 0 && (d = 0)) : d > C && (d = C), _ < 0 ? (_ += C, _ < 0 && (_ = 0)) : _ > C && (_ = C), _ < d && (_ = d);
    var O = this.subarray(d, _);
    return Object.setPrototypeOf(O, b.prototype), O;
  };
  function me(x, d, _) {
    if (x % 1 !== 0 || x < 0)
      throw new RangeError("offset is not uint");
    if (x + d > _)
      throw new RangeError("Trying to access beyond buffer length");
  }
  b.prototype.readUintLE = b.prototype.readUIntLE = function(d, _, C) {
    d = d >>> 0, _ = _ >>> 0, C || me(d, _, this.length);
    for (var O = this[d], X = 1, q = 0; ++q < _ && (X *= 256); )
      O += this[d + q] * X;
    return O;
  }, b.prototype.readUintBE = b.prototype.readUIntBE = function(d, _, C) {
    d = d >>> 0, _ = _ >>> 0, C || me(d, _, this.length);
    for (var O = this[d + --_], X = 1; _ > 0 && (X *= 256); )
      O += this[d + --_] * X;
    return O;
  }, b.prototype.readUint8 = b.prototype.readUInt8 = function(d, _) {
    return d = d >>> 0, _ || me(d, 1, this.length), this[d];
  }, b.prototype.readUint16LE = b.prototype.readUInt16LE = function(d, _) {
    return d = d >>> 0, _ || me(d, 2, this.length), this[d] | this[d + 1] << 8;
  }, b.prototype.readUint16BE = b.prototype.readUInt16BE = function(d, _) {
    return d = d >>> 0, _ || me(d, 2, this.length), this[d] << 8 | this[d + 1];
  }, b.prototype.readUint32LE = b.prototype.readUInt32LE = function(d, _) {
    return d = d >>> 0, _ || me(d, 4, this.length), (this[d] | this[d + 1] << 8 | this[d + 2] << 16) + this[d + 3] * 16777216;
  }, b.prototype.readUint32BE = b.prototype.readUInt32BE = function(d, _) {
    return d = d >>> 0, _ || me(d, 4, this.length), this[d] * 16777216 + (this[d + 1] << 16 | this[d + 2] << 8 | this[d + 3]);
  }, b.prototype.readIntLE = function(d, _, C) {
    d = d >>> 0, _ = _ >>> 0, C || me(d, _, this.length);
    for (var O = this[d], X = 1, q = 0; ++q < _ && (X *= 256); )
      O += this[d + q] * X;
    return X *= 128, O >= X && (O -= Math.pow(2, 8 * _)), O;
  }, b.prototype.readIntBE = function(d, _, C) {
    d = d >>> 0, _ = _ >>> 0, C || me(d, _, this.length);
    for (var O = _, X = 1, q = this[d + --O]; O > 0 && (X *= 256); )
      q += this[d + --O] * X;
    return X *= 128, q >= X && (q -= Math.pow(2, 8 * _)), q;
  }, b.prototype.readInt8 = function(d, _) {
    return d = d >>> 0, _ || me(d, 1, this.length), this[d] & 128 ? (255 - this[d] + 1) * -1 : this[d];
  }, b.prototype.readInt16LE = function(d, _) {
    d = d >>> 0, _ || me(d, 2, this.length);
    var C = this[d] | this[d + 1] << 8;
    return C & 32768 ? C | 4294901760 : C;
  }, b.prototype.readInt16BE = function(d, _) {
    d = d >>> 0, _ || me(d, 2, this.length);
    var C = this[d + 1] | this[d] << 8;
    return C & 32768 ? C | 4294901760 : C;
  }, b.prototype.readInt32LE = function(d, _) {
    return d = d >>> 0, _ || me(d, 4, this.length), this[d] | this[d + 1] << 8 | this[d + 2] << 16 | this[d + 3] << 24;
  }, b.prototype.readInt32BE = function(d, _) {
    return d = d >>> 0, _ || me(d, 4, this.length), this[d] << 24 | this[d + 1] << 16 | this[d + 2] << 8 | this[d + 3];
  }, b.prototype.readFloatLE = function(d, _) {
    return d = d >>> 0, _ || me(d, 4, this.length), o.read(this, d, !0, 23, 4);
  }, b.prototype.readFloatBE = function(d, _) {
    return d = d >>> 0, _ || me(d, 4, this.length), o.read(this, d, !1, 23, 4);
  }, b.prototype.readDoubleLE = function(d, _) {
    return d = d >>> 0, _ || me(d, 8, this.length), o.read(this, d, !0, 52, 8);
  }, b.prototype.readDoubleBE = function(d, _) {
    return d = d >>> 0, _ || me(d, 8, this.length), o.read(this, d, !1, 52, 8);
  };
  function Ie(x, d, _, C, O, X) {
    if (!b.isBuffer(x))
      throw new TypeError('"buffer" argument must be a Buffer instance');
    if (d > O || d < X)
      throw new RangeError('"value" argument is out of bounds');
    if (_ + C > x.length)
      throw new RangeError("Index out of range");
  }
  b.prototype.writeUintLE = b.prototype.writeUIntLE = function(d, _, C, O) {
    if (d = +d, _ = _ >>> 0, C = C >>> 0, !O) {
      var X = Math.pow(2, 8 * C) - 1;
      Ie(this, d, _, C, X, 0);
    }
    var q = 1, we = 0;
    for (this[_] = d & 255; ++we < C && (q *= 256); )
      this[_ + we] = d / q & 255;
    return _ + C;
  }, b.prototype.writeUintBE = b.prototype.writeUIntBE = function(d, _, C, O) {
    if (d = +d, _ = _ >>> 0, C = C >>> 0, !O) {
      var X = Math.pow(2, 8 * C) - 1;
      Ie(this, d, _, C, X, 0);
    }
    var q = C - 1, we = 1;
    for (this[_ + q] = d & 255; --q >= 0 && (we *= 256); )
      this[_ + q] = d / we & 255;
    return _ + C;
  }, b.prototype.writeUint8 = b.prototype.writeUInt8 = function(d, _, C) {
    return d = +d, _ = _ >>> 0, C || Ie(this, d, _, 1, 255, 0), this[_] = d & 255, _ + 1;
  }, b.prototype.writeUint16LE = b.prototype.writeUInt16LE = function(d, _, C) {
    return d = +d, _ = _ >>> 0, C || Ie(this, d, _, 2, 65535, 0), this[_] = d & 255, this[_ + 1] = d >>> 8, _ + 2;
  }, b.prototype.writeUint16BE = b.prototype.writeUInt16BE = function(d, _, C) {
    return d = +d, _ = _ >>> 0, C || Ie(this, d, _, 2, 65535, 0), this[_] = d >>> 8, this[_ + 1] = d & 255, _ + 2;
  }, b.prototype.writeUint32LE = b.prototype.writeUInt32LE = function(d, _, C) {
    return d = +d, _ = _ >>> 0, C || Ie(this, d, _, 4, 4294967295, 0), this[_ + 3] = d >>> 24, this[_ + 2] = d >>> 16, this[_ + 1] = d >>> 8, this[_] = d & 255, _ + 4;
  }, b.prototype.writeUint32BE = b.prototype.writeUInt32BE = function(d, _, C) {
    return d = +d, _ = _ >>> 0, C || Ie(this, d, _, 4, 4294967295, 0), this[_] = d >>> 24, this[_ + 1] = d >>> 16, this[_ + 2] = d >>> 8, this[_ + 3] = d & 255, _ + 4;
  }, b.prototype.writeIntLE = function(d, _, C, O) {
    if (d = +d, _ = _ >>> 0, !O) {
      var X = Math.pow(2, 8 * C - 1);
      Ie(this, d, _, C, X - 1, -X);
    }
    var q = 0, we = 1, Ne = 0;
    for (this[_] = d & 255; ++q < C && (we *= 256); )
      d < 0 && Ne === 0 && this[_ + q - 1] !== 0 && (Ne = 1), this[_ + q] = (d / we >> 0) - Ne & 255;
    return _ + C;
  }, b.prototype.writeIntBE = function(d, _, C, O) {
    if (d = +d, _ = _ >>> 0, !O) {
      var X = Math.pow(2, 8 * C - 1);
      Ie(this, d, _, C, X - 1, -X);
    }
    var q = C - 1, we = 1, Ne = 0;
    for (this[_ + q] = d & 255; --q >= 0 && (we *= 256); )
      d < 0 && Ne === 0 && this[_ + q + 1] !== 0 && (Ne = 1), this[_ + q] = (d / we >> 0) - Ne & 255;
    return _ + C;
  }, b.prototype.writeInt8 = function(d, _, C) {
    return d = +d, _ = _ >>> 0, C || Ie(this, d, _, 1, 127, -128), d < 0 && (d = 255 + d + 1), this[_] = d & 255, _ + 1;
  }, b.prototype.writeInt16LE = function(d, _, C) {
    return d = +d, _ = _ >>> 0, C || Ie(this, d, _, 2, 32767, -32768), this[_] = d & 255, this[_ + 1] = d >>> 8, _ + 2;
  }, b.prototype.writeInt16BE = function(d, _, C) {
    return d = +d, _ = _ >>> 0, C || Ie(this, d, _, 2, 32767, -32768), this[_] = d >>> 8, this[_ + 1] = d & 255, _ + 2;
  }, b.prototype.writeInt32LE = function(d, _, C) {
    return d = +d, _ = _ >>> 0, C || Ie(this, d, _, 4, 2147483647, -2147483648), this[_] = d & 255, this[_ + 1] = d >>> 8, this[_ + 2] = d >>> 16, this[_ + 3] = d >>> 24, _ + 4;
  }, b.prototype.writeInt32BE = function(d, _, C) {
    return d = +d, _ = _ >>> 0, C || Ie(this, d, _, 4, 2147483647, -2147483648), d < 0 && (d = 4294967295 + d + 1), this[_] = d >>> 24, this[_ + 1] = d >>> 16, this[_ + 2] = d >>> 8, this[_ + 3] = d & 255, _ + 4;
  };
  function xt(x, d, _, C, O, X) {
    if (_ + C > x.length)
      throw new RangeError("Index out of range");
    if (_ < 0)
      throw new RangeError("Index out of range");
  }
  function St(x, d, _, C, O) {
    return d = +d, _ = _ >>> 0, O || xt(x, d, _, 4), o.write(x, d, _, C, 23, 4), _ + 4;
  }
  b.prototype.writeFloatLE = function(d, _, C) {
    return St(this, d, _, !0, C);
  }, b.prototype.writeFloatBE = function(d, _, C) {
    return St(this, d, _, !1, C);
  };
  function bt(x, d, _, C, O) {
    return d = +d, _ = _ >>> 0, O || xt(x, d, _, 8), o.write(x, d, _, C, 52, 8), _ + 8;
  }
  b.prototype.writeDoubleLE = function(d, _, C) {
    return bt(this, d, _, !0, C);
  }, b.prototype.writeDoubleBE = function(d, _, C) {
    return bt(this, d, _, !1, C);
  }, b.prototype.copy = function(d, _, C, O) {
    if (!b.isBuffer(d))
      throw new TypeError("argument should be a Buffer");
    if (C || (C = 0), !O && O !== 0 && (O = this.length), _ >= d.length && (_ = d.length), _ || (_ = 0), O > 0 && O < C && (O = C), O === C || d.length === 0 || this.length === 0)
      return 0;
    if (_ < 0)
      throw new RangeError("targetStart out of bounds");
    if (C < 0 || C >= this.length)
      throw new RangeError("Index out of range");
    if (O < 0)
      throw new RangeError("sourceEnd out of bounds");
    O > this.length && (O = this.length), d.length - _ < O - C && (O = d.length - _ + C);
    var X = O - C;
    return this === d && typeof Uint8Array.prototype.copyWithin == "function" ? this.copyWithin(_, C, O) : Uint8Array.prototype.set.call(
      d,
      this.subarray(C, O),
      _
    ), X;
  }, b.prototype.fill = function(d, _, C, O) {
    if (typeof d == "string") {
      if (typeof _ == "string" ? (O = _, _ = 0, C = this.length) : typeof C == "string" && (O = C, C = this.length), O !== void 0 && typeof O != "string")
        throw new TypeError("encoding must be a string");
      if (typeof O == "string" && !b.isEncoding(O))
        throw new TypeError("Unknown encoding: " + O);
      if (d.length === 1) {
        var X = d.charCodeAt(0);
        (O === "utf8" && X < 128 || O === "latin1") && (d = X);
      }
    } else
      typeof d == "number" ? d = d & 255 : typeof d == "boolean" && (d = Number(d));
    if (_ < 0 || this.length < _ || this.length < C)
      throw new RangeError("Out of range index");
    if (C <= _)
      return this;
    _ = _ >>> 0, C = C === void 0 ? this.length : C >>> 0, d || (d = 0);
    var q;
    if (typeof d == "number")
      for (q = _; q < C; ++q)
        this[q] = d;
    else {
      var we = b.isBuffer(d) ? d : b.from(d, O), Ne = we.length;
      if (Ne === 0)
        throw new TypeError('The value "' + d + '" is invalid for argument "value"');
      for (q = 0; q < C - _; ++q)
        this[q + _] = we[q % Ne];
    }
    return this;
  };
  var Dt = /[^+/0-9A-Za-z-_]/g;
  function Tt(x) {
    if (x = x.split("=")[0], x = x.trim().replace(Dt, ""), x.length < 2)
      return "";
    for (; x.length % 4 !== 0; )
      x = x + "=";
    return x;
  }
  function ft(x, d) {
    d = d || 1 / 0;
    for (var _, C = x.length, O = null, X = [], q = 0; q < C; ++q) {
      if (_ = x.charCodeAt(q), _ > 55295 && _ < 57344) {
        if (!O) {
          if (_ > 56319) {
            (d -= 3) > -1 && X.push(239, 191, 189);
            continue;
          } else if (q + 1 === C) {
            (d -= 3) > -1 && X.push(239, 191, 189);
            continue;
          }
          O = _;
          continue;
        }
        if (_ < 56320) {
          (d -= 3) > -1 && X.push(239, 191, 189), O = _;
          continue;
        }
        _ = (O - 55296 << 10 | _ - 56320) + 65536;
      } else
        O && (d -= 3) > -1 && X.push(239, 191, 189);
      if (O = null, _ < 128) {
        if ((d -= 1) < 0)
          break;
        X.push(_);
      } else if (_ < 2048) {
        if ((d -= 2) < 0)
          break;
        X.push(
          _ >> 6 | 192,
          _ & 63 | 128
        );
      } else if (_ < 65536) {
        if ((d -= 3) < 0)
          break;
        X.push(
          _ >> 12 | 224,
          _ >> 6 & 63 | 128,
          _ & 63 | 128
        );
      } else if (_ < 1114112) {
        if ((d -= 4) < 0)
          break;
        X.push(
          _ >> 18 | 240,
          _ >> 12 & 63 | 128,
          _ >> 6 & 63 | 128,
          _ & 63 | 128
        );
      } else
        throw new Error("Invalid code point");
    }
    return X;
  }
  function rt(x) {
    for (var d = [], _ = 0; _ < x.length; ++_)
      d.push(x.charCodeAt(_) & 255);
    return d;
  }
  function vt(x, d) {
    for (var _, C, O, X = [], q = 0; q < x.length && !((d -= 2) < 0); ++q)
      _ = x.charCodeAt(q), C = _ >> 8, O = _ % 256, X.push(O), X.push(C);
    return X;
  }
  function mt(x) {
    return a.toByteArray(Tt(x));
  }
  function it(x, d, _, C) {
    for (var O = 0; O < C && !(O + _ >= d.length || O >= x.length); ++O)
      d[O + _] = x[O];
    return O;
  }
  function M(x, d) {
    return x instanceof d || x != null && x.constructor != null && x.constructor.name != null && x.constructor.name === d.name;
  }
  function U(x) {
    return x !== x;
  }
  var J = function() {
    for (var x = "0123456789abcdef", d = new Array(256), _ = 0; _ < 16; ++_)
      for (var C = _ * 16, O = 0; O < 16; ++O)
        d[C + O] = x[_] + x[O];
    return d;
  }();
})(kl);
/*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
(function(r, a) {
  var o = kl, l = o.Buffer;
  function m(v, b) {
    for (var P in v)
      b[P] = v[P];
  }
  l.from && l.alloc && l.allocUnsafe && l.allocUnsafeSlow ? r.exports = o : (m(o, a), a.Buffer = w);
  function w(v, b, P) {
    return l(v, b, P);
  }
  w.prototype = Object.create(l.prototype), m(l, w), w.from = function(v, b, P) {
    if (typeof v == "number")
      throw new TypeError("Argument must not be a number");
    return l(v, b, P);
  }, w.alloc = function(v, b, P) {
    if (typeof v != "number")
      throw new TypeError("Argument must be a number");
    var L = l(v);
    return b !== void 0 ? typeof P == "string" ? L.fill(b, P) : L.fill(b) : L.fill(0), L;
  }, w.allocUnsafe = function(v) {
    if (typeof v != "number")
      throw new TypeError("Argument must be a number");
    return l(v);
  }, w.allocUnsafeSlow = function(v) {
    if (typeof v != "number")
      throw new TypeError("Argument must be a number");
    return o.SlowBuffer(v);
  };
})(ca, ca.exports);
var D_ = ca.exports, ka = D_.Buffer, qo = ka.isEncoding || function(r) {
  switch (r = "" + r, r && r.toLowerCase()) {
    case "hex":
    case "utf8":
    case "utf-8":
    case "ascii":
    case "binary":
    case "base64":
    case "ucs2":
    case "ucs-2":
    case "utf16le":
    case "utf-16le":
    case "raw":
      return !0;
    default:
      return !1;
  }
};
function L_(r) {
  if (!r)
    return "utf8";
  for (var a; ; )
    switch (r) {
      case "utf8":
      case "utf-8":
        return "utf8";
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return "utf16le";
      case "latin1":
      case "binary":
        return "latin1";
      case "base64":
      case "ascii":
      case "hex":
        return r;
      default:
        if (a)
          return;
        r = ("" + r).toLowerCase(), a = !0;
    }
}
function B_(r) {
  var a = L_(r);
  if (typeof a != "string" && (ka.isEncoding === qo || !qo(r)))
    throw new Error("Unknown encoding: " + r);
  return a || r;
}
Il.StringDecoder = rn;
function rn(r) {
  this.encoding = B_(r);
  var a;
  switch (this.encoding) {
    case "utf16le":
      this.text = W_, this.end = j_, a = 4;
      break;
    case "utf8":
      this.fillLast = N_, a = 4;
      break;
    case "base64":
      this.text = G_, this.end = V_, a = 3;
      break;
    default:
      this.write = z_, this.end = H_;
      return;
  }
  this.lastNeed = 0, this.lastTotal = 0, this.lastChar = ka.allocUnsafe(a);
}
rn.prototype.write = function(r) {
  if (r.length === 0)
    return "";
  var a, o;
  if (this.lastNeed) {
    if (a = this.fillLast(r), a === void 0)
      return "";
    o = this.lastNeed, this.lastNeed = 0;
  } else
    o = 0;
  return o < r.length ? a ? a + this.text(r, o) : this.text(r, o) : a || "";
};
rn.prototype.end = $_;
rn.prototype.text = U_;
rn.prototype.fillLast = function(r) {
  if (this.lastNeed <= r.length)
    return r.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed), this.lastChar.toString(this.encoding, 0, this.lastTotal);
  r.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, r.length), this.lastNeed -= r.length;
};
function Ui(r) {
  return r <= 127 ? 0 : r >> 5 === 6 ? 2 : r >> 4 === 14 ? 3 : r >> 3 === 30 ? 4 : r >> 6 === 2 ? -1 : -2;
}
function M_(r, a, o) {
  var l = a.length - 1;
  if (l < o)
    return 0;
  var m = Ui(a[l]);
  return m >= 0 ? (m > 0 && (r.lastNeed = m - 1), m) : --l < o || m === -2 ? 0 : (m = Ui(a[l]), m >= 0 ? (m > 0 && (r.lastNeed = m - 2), m) : --l < o || m === -2 ? 0 : (m = Ui(a[l]), m >= 0 ? (m > 0 && (m === 2 ? m = 0 : r.lastNeed = m - 3), m) : 0));
}
function O_(r, a, o) {
  if ((a[0] & 192) !== 128)
    return r.lastNeed = 0, "�";
  if (r.lastNeed > 1 && a.length > 1) {
    if ((a[1] & 192) !== 128)
      return r.lastNeed = 1, "�";
    if (r.lastNeed > 2 && a.length > 2 && (a[2] & 192) !== 128)
      return r.lastNeed = 2, "�";
  }
}
function N_(r) {
  var a = this.lastTotal - this.lastNeed, o = O_(this, r);
  if (o !== void 0)
    return o;
  if (this.lastNeed <= r.length)
    return r.copy(this.lastChar, a, 0, this.lastNeed), this.lastChar.toString(this.encoding, 0, this.lastTotal);
  r.copy(this.lastChar, a, 0, r.length), this.lastNeed -= r.length;
}
function U_(r, a) {
  var o = M_(this, r, a);
  if (!this.lastNeed)
    return r.toString("utf8", a);
  this.lastTotal = o;
  var l = r.length - (o - this.lastNeed);
  return r.copy(this.lastChar, 0, l), r.toString("utf8", a, l);
}
function $_(r) {
  var a = r && r.length ? this.write(r) : "";
  return this.lastNeed ? a + "�" : a;
}
function W_(r, a) {
  if ((r.length - a) % 2 === 0) {
    var o = r.toString("utf16le", a);
    if (o) {
      var l = o.charCodeAt(o.length - 1);
      if (l >= 55296 && l <= 56319)
        return this.lastNeed = 2, this.lastTotal = 4, this.lastChar[0] = r[r.length - 2], this.lastChar[1] = r[r.length - 1], o.slice(0, -1);
    }
    return o;
  }
  return this.lastNeed = 1, this.lastTotal = 2, this.lastChar[0] = r[r.length - 1], r.toString("utf16le", a, r.length - 1);
}
function j_(r) {
  var a = r && r.length ? this.write(r) : "";
  if (this.lastNeed) {
    var o = this.lastTotal - this.lastNeed;
    return a + this.lastChar.toString("utf16le", 0, o);
  }
  return a;
}
function G_(r, a) {
  var o = (r.length - a) % 3;
  return o === 0 ? r.toString("base64", a) : (this.lastNeed = 3 - o, this.lastTotal = 3, o === 1 ? this.lastChar[0] = r[r.length - 1] : (this.lastChar[0] = r[r.length - 2], this.lastChar[1] = r[r.length - 1]), r.toString("base64", a, r.length - o));
}
function V_(r) {
  var a = r && r.length ? this.write(r) : "";
  return this.lastNeed ? a + this.lastChar.toString("base64", 0, 3 - this.lastNeed) : a;
}
function z_(r) {
  return r.toString(this.encoding);
}
function H_(r) {
  return r && r.length ? this.write(r) : "";
}
const Qo = mr, { PromisePrototypeThen: K_, SymbolAsyncIterator: Jo, SymbolIterator: es } = dt, { Buffer: X_ } = tr, { ERR_INVALID_ARG_TYPE: Y_, ERR_STREAM_NULL_VALUES: Z_ } = Et.codes;
function q_(r, a, o) {
  let l;
  if (typeof a == "string" || a instanceof X_)
    return new r({
      objectMode: !0,
      ...o,
      read() {
        this.push(a), this.push(null);
      }
    });
  let m;
  if (a && a[Jo])
    m = !0, l = a[Jo]();
  else if (a && a[es])
    m = !1, l = a[es]();
  else
    throw new Y_("iterable", ["Iterable"], a);
  const w = new r({
    objectMode: !0,
    highWaterMark: 1,
    // TODO(ronag): What options should be allowed?
    ...o
  });
  let v = !1;
  w._read = function() {
    v || (v = !0, P());
  }, w._destroy = function(L, N) {
    K_(
      b(L),
      () => Qo.nextTick(N, L),
      // nextTick is here in case cb throws
      (H) => Qo.nextTick(N, H || L)
    );
  };
  async function b(L) {
    const N = L != null, H = typeof l.throw == "function";
    if (N && H) {
      const { value: re, done: z } = await l.throw(L);
      if (await re, z)
        return;
    }
    if (typeof l.return == "function") {
      const { value: re } = await l.return();
      await re;
    }
  }
  async function P() {
    for (; ; ) {
      try {
        const { value: L, done: N } = m ? await l.next() : l.next();
        if (N)
          w.push(null);
        else {
          const H = L && typeof L.then == "function" ? await L : L;
          if (H === null)
            throw v = !1, new Z_();
          if (w.push(H))
            continue;
          v = !1;
        }
      } catch (L) {
        w.destroy(L);
      }
      break;
    }
  }
  return w;
}
var Pl = q_, $i, ts;
function Jn() {
  if (ts)
    return $i;
  ts = 1;
  const r = mr, {
    ArrayPrototypeIndexOf: a,
    NumberIsInteger: o,
    NumberIsNaN: l,
    NumberParseInt: m,
    ObjectDefineProperties: w,
    ObjectKeys: v,
    ObjectSetPrototypeOf: b,
    Promise: P,
    SafeSet: L,
    SymbolAsyncIterator: N,
    Symbol: H
  } = dt;
  $i = ne, ne.ReadableState = ht;
  const { EventEmitter: re } = Ra, { Stream: z, prependListener: G } = Aa, { Buffer: ve } = tr, { addAbortSignal: ce } = Qn, ue = rr;
  let Q = Xt.debuglog("stream", (S) => {
    Q = S;
  });
  const Ce = F_, Ge = Or, { getHighWaterMark: ge, getDefaultHighWaterMark: Fe } = Ia, {
    aggregateTwoErrors: he,
    codes: {
      ERR_INVALID_ARG_TYPE: _e,
      ERR_METHOD_NOT_IMPLEMENTED: Me,
      ERR_OUT_OF_RANGE: k,
      ERR_STREAM_PUSH_AFTER_EOF: Y,
      ERR_STREAM_UNSHIFT_AFTER_END_EVENT: We
    }
  } = Et, { validateObject: Te } = Vn, De = H("kPaused"), { StringDecoder: ye } = Il, Ke = Pl;
  b(ne.prototype, z.prototype), b(ne, z);
  const et = () => {
  }, { errorOrDestroy: Oe } = Ge;
  function ht(S, F, g) {
    typeof g != "boolean" && (g = F instanceof Ht()), this.objectMode = !!(S && S.objectMode), g && (this.objectMode = this.objectMode || !!(S && S.readableObjectMode)), this.highWaterMark = S ? ge(this, S, "readableHighWaterMark", g) : Fe(!1), this.buffer = new Ce(), this.length = 0, this.pipes = [], this.flowing = null, this.ended = !1, this.endEmitted = !1, this.reading = !1, this.constructed = !0, this.sync = !0, this.needReadable = !1, this.emittedReadable = !1, this.readableListening = !1, this.resumeScheduled = !1, this[De] = null, this.errorEmitted = !1, this.emitClose = !S || S.emitClose !== !1, this.autoDestroy = !S || S.autoDestroy !== !1, this.destroyed = !1, this.errored = null, this.closed = !1, this.closeEmitted = !1, this.defaultEncoding = S && S.defaultEncoding || "utf8", this.awaitDrainWriters = null, this.multiAwaitDrain = !1, this.readingMore = !1, this.dataEmitted = !1, this.decoder = null, this.encoding = null, S && S.encoding && (this.decoder = new ye(S.encoding), this.encoding = S.encoding);
  }
  function ne(S) {
    if (!(this instanceof ne))
      return new ne(S);
    const F = this instanceof Ht();
    this._readableState = new ht(S, this, F), S && (typeof S.read == "function" && (this._read = S.read), typeof S.destroy == "function" && (this._destroy = S.destroy), typeof S.construct == "function" && (this._construct = S.construct), S.signal && !F && ce(S.signal, this)), z.call(this, S), Ge.construct(this, () => {
      this._readableState.needReadable && rt(this, this._readableState);
    });
  }
  ne.prototype.destroy = Ge.destroy, ne.prototype._undestroy = Ge.undestroy, ne.prototype._destroy = function(S, F) {
    F(S);
  }, ne.prototype[re.captureRejectionSymbol] = function(S) {
    this.destroy(S);
  }, ne.prototype.push = function(S, F) {
    return me(this, S, F, !1);
  }, ne.prototype.unshift = function(S, F) {
    return me(this, S, F, !0);
  };
  function me(S, F, g, u) {
    Q("readableAddChunk", F);
    const c = S._readableState;
    let T;
    if (c.objectMode || (typeof F == "string" ? (g = g || c.defaultEncoding, c.encoding !== g && (u && c.encoding ? F = ve.from(F, g).toString(c.encoding) : (F = ve.from(F, g), g = ""))) : F instanceof ve ? g = "" : z._isUint8Array(F) ? (F = z._uint8ArrayToBuffer(F), g = "") : F != null && (T = new _e("chunk", ["string", "Buffer", "Uint8Array"], F))), T)
      Oe(S, T);
    else if (F === null)
      c.reading = !1, Dt(S, c);
    else if (c.objectMode || F && F.length > 0)
      if (u)
        if (c.endEmitted)
          Oe(S, new We());
        else {
          if (c.destroyed || c.errored)
            return !1;
          Ie(S, c, F, !0);
        }
      else if (c.ended)
        Oe(S, new Y());
      else {
        if (c.destroyed || c.errored)
          return !1;
        c.reading = !1, c.decoder && !g ? (F = c.decoder.write(F), c.objectMode || F.length !== 0 ? Ie(S, c, F, !1) : rt(S, c)) : Ie(S, c, F, !1);
      }
    else
      u || (c.reading = !1, rt(S, c));
    return !c.ended && (c.length < c.highWaterMark || c.length === 0);
  }
  function Ie(S, F, g, u) {
    F.flowing && F.length === 0 && !F.sync && S.listenerCount("data") > 0 ? (F.multiAwaitDrain ? F.awaitDrainWriters.clear() : F.awaitDrainWriters = null, F.dataEmitted = !0, S.emit("data", g)) : (F.length += F.objectMode ? 1 : g.length, u ? F.buffer.unshift(g) : F.buffer.push(g), F.needReadable && Tt(S)), rt(S, F);
  }
  ne.prototype.isPaused = function() {
    const S = this._readableState;
    return S[De] === !0 || S.flowing === !1;
  }, ne.prototype.setEncoding = function(S) {
    const F = new ye(S);
    this._readableState.decoder = F, this._readableState.encoding = this._readableState.decoder.encoding;
    const g = this._readableState.buffer;
    let u = "";
    for (const c of g)
      u += F.write(c);
    return g.clear(), u !== "" && g.push(u), this._readableState.length = u.length, this;
  };
  const xt = 1073741824;
  function St(S) {
    if (S > xt)
      throw new k("size", "<= 1GiB", S);
    return S--, S |= S >>> 1, S |= S >>> 2, S |= S >>> 4, S |= S >>> 8, S |= S >>> 16, S++, S;
  }
  function bt(S, F) {
    return S <= 0 || F.length === 0 && F.ended ? 0 : F.objectMode ? 1 : l(S) ? F.flowing && F.length ? F.buffer.first().length : F.length : S <= F.length ? S : F.ended ? F.length : 0;
  }
  ne.prototype.read = function(S) {
    Q("read", S), S === void 0 ? S = NaN : o(S) || (S = m(S, 10));
    const F = this._readableState, g = S;
    if (S > F.highWaterMark && (F.highWaterMark = St(S)), S !== 0 && (F.emittedReadable = !1), S === 0 && F.needReadable && ((F.highWaterMark !== 0 ? F.length >= F.highWaterMark : F.length > 0) || F.ended))
      return Q("read: emitReadable", F.length, F.ended), F.length === 0 && F.ended ? O(this) : Tt(this), null;
    if (S = bt(S, F), S === 0 && F.ended)
      return F.length === 0 && O(this), null;
    let u = F.needReadable;
    if (Q("need readable", u), (F.length === 0 || F.length - S < F.highWaterMark) && (u = !0, Q("length less than watermark", u)), F.ended || F.reading || F.destroyed || F.errored || !F.constructed)
      u = !1, Q("reading, ended or constructing", u);
    else if (u) {
      Q("do read"), F.reading = !0, F.sync = !0, F.length === 0 && (F.needReadable = !0);
      try {
        this._read(F.highWaterMark);
      } catch (T) {
        Oe(this, T);
      }
      F.sync = !1, F.reading || (S = bt(g, F));
    }
    let c;
    return S > 0 ? c = C(S, F) : c = null, c === null ? (F.needReadable = F.length <= F.highWaterMark, S = 0) : (F.length -= S, F.multiAwaitDrain ? F.awaitDrainWriters.clear() : F.awaitDrainWriters = null), F.length === 0 && (F.ended || (F.needReadable = !0), g !== S && F.ended && O(this)), c !== null && !F.errorEmitted && !F.closeEmitted && (F.dataEmitted = !0, this.emit("data", c)), c;
  };
  function Dt(S, F) {
    if (Q("onEofChunk"), !F.ended) {
      if (F.decoder) {
        const g = F.decoder.end();
        g && g.length && (F.buffer.push(g), F.length += F.objectMode ? 1 : g.length);
      }
      F.ended = !0, F.sync ? Tt(S) : (F.needReadable = !1, F.emittedReadable = !0, ft(S));
    }
  }
  function Tt(S) {
    const F = S._readableState;
    Q("emitReadable", F.needReadable, F.emittedReadable), F.needReadable = !1, F.emittedReadable || (Q("emitReadable", F.flowing), F.emittedReadable = !0, r.nextTick(ft, S));
  }
  function ft(S) {
    const F = S._readableState;
    Q("emitReadable_", F.destroyed, F.length, F.ended), !F.destroyed && !F.errored && (F.length || F.ended) && (S.emit("readable"), F.emittedReadable = !1), F.needReadable = !F.flowing && !F.ended && F.length <= F.highWaterMark, x(S);
  }
  function rt(S, F) {
    !F.readingMore && F.constructed && (F.readingMore = !0, r.nextTick(vt, S, F));
  }
  function vt(S, F) {
    for (; !F.reading && !F.ended && (F.length < F.highWaterMark || F.flowing && F.length === 0); ) {
      const g = F.length;
      if (Q("maybeReadMore read 0"), S.read(0), g === F.length)
        break;
    }
    F.readingMore = !1;
  }
  ne.prototype._read = function(S) {
    throw new Me("_read()");
  }, ne.prototype.pipe = function(S, F) {
    const g = this, u = this._readableState;
    u.pipes.length === 1 && (u.multiAwaitDrain || (u.multiAwaitDrain = !0, u.awaitDrainWriters = new L(u.awaitDrainWriters ? [u.awaitDrainWriters] : []))), u.pipes.push(S), Q("pipe count=%d opts=%j", u.pipes.length, F);
    const T = (!F || F.end !== !1) && S !== r.stdout && S !== r.stderr ? W : qt;
    u.endEmitted ? r.nextTick(T) : g.once("end", T), S.on("unpipe", D);
    function D(kt, ae) {
      Q("onunpipe"), kt === g && ae && ae.hasUnpiped === !1 && (ae.hasUnpiped = !0, Xe());
    }
    function W() {
      Q("onend"), S.end();
    }
    let V, Ae = !1;
    function Xe() {
      Q("cleanup"), S.removeListener("close", vr), S.removeListener("finish", nr), V && S.removeListener("drain", V), S.removeListener("error", Ue), S.removeListener("unpipe", D), g.removeListener("end", W), g.removeListener("end", qt), g.removeListener("data", Ye), Ae = !0, V && u.awaitDrainWriters && (!S._writableState || S._writableState.needDrain) && V();
    }
    function Ve() {
      Ae || (u.pipes.length === 1 && u.pipes[0] === S ? (Q("false write response, pause", 0), u.awaitDrainWriters = S, u.multiAwaitDrain = !1) : u.pipes.length > 1 && u.pipes.includes(S) && (Q("false write response, pause", u.awaitDrainWriters.size), u.awaitDrainWriters.add(S)), g.pause()), V || (V = mt(g, S), S.on("drain", V));
    }
    g.on("data", Ye);
    function Ye(kt) {
      Q("ondata");
      const ae = S.write(kt);
      Q("dest.write", ae), ae === !1 && Ve();
    }
    function Ue(kt) {
      if (Q("onerror", kt), qt(), S.removeListener("error", Ue), S.listenerCount("error") === 0) {
        const ae = S._writableState || S._readableState;
        ae && !ae.errorEmitted ? Oe(S, kt) : S.emit("error", kt);
      }
    }
    G(S, "error", Ue);
    function vr() {
      S.removeListener("finish", nr), qt();
    }
    S.once("close", vr);
    function nr() {
      Q("onfinish"), S.removeListener("close", vr), qt();
    }
    S.once("finish", nr);
    function qt() {
      Q("unpipe"), g.unpipe(S);
    }
    return S.emit("pipe", g), S.writableNeedDrain === !0 ? u.flowing && Ve() : u.flowing || (Q("pipe resume"), g.resume()), S;
  };
  function mt(S, F) {
    return function() {
      const u = S._readableState;
      u.awaitDrainWriters === F ? (Q("pipeOnDrain", 1), u.awaitDrainWriters = null) : u.multiAwaitDrain && (Q("pipeOnDrain", u.awaitDrainWriters.size), u.awaitDrainWriters.delete(F)), (!u.awaitDrainWriters || u.awaitDrainWriters.size === 0) && S.listenerCount("data") && S.resume();
    };
  }
  ne.prototype.unpipe = function(S) {
    const F = this._readableState, g = {
      hasUnpiped: !1
    };
    if (F.pipes.length === 0)
      return this;
    if (!S) {
      const c = F.pipes;
      F.pipes = [], this.pause();
      for (let T = 0; T < c.length; T++)
        c[T].emit("unpipe", this, {
          hasUnpiped: !1
        });
      return this;
    }
    const u = a(F.pipes, S);
    return u === -1 ? this : (F.pipes.splice(u, 1), F.pipes.length === 0 && this.pause(), S.emit("unpipe", this, g), this);
  }, ne.prototype.on = function(S, F) {
    const g = z.prototype.on.call(this, S, F), u = this._readableState;
    return S === "data" ? (u.readableListening = this.listenerCount("readable") > 0, u.flowing !== !1 && this.resume()) : S === "readable" && !u.endEmitted && !u.readableListening && (u.readableListening = u.needReadable = !0, u.flowing = !1, u.emittedReadable = !1, Q("on readable", u.length, u.reading), u.length ? Tt(this) : u.reading || r.nextTick(M, this)), g;
  }, ne.prototype.addListener = ne.prototype.on, ne.prototype.removeListener = function(S, F) {
    const g = z.prototype.removeListener.call(this, S, F);
    return S === "readable" && r.nextTick(it, this), g;
  }, ne.prototype.off = ne.prototype.removeListener, ne.prototype.removeAllListeners = function(S) {
    const F = z.prototype.removeAllListeners.apply(this, arguments);
    return (S === "readable" || S === void 0) && r.nextTick(it, this), F;
  };
  function it(S) {
    const F = S._readableState;
    F.readableListening = S.listenerCount("readable") > 0, F.resumeScheduled && F[De] === !1 ? F.flowing = !0 : S.listenerCount("data") > 0 ? S.resume() : F.readableListening || (F.flowing = null);
  }
  function M(S) {
    Q("readable nexttick read 0"), S.read(0);
  }
  ne.prototype.resume = function() {
    const S = this._readableState;
    return S.flowing || (Q("resume"), S.flowing = !S.readableListening, U(this, S)), S[De] = !1, this;
  };
  function U(S, F) {
    F.resumeScheduled || (F.resumeScheduled = !0, r.nextTick(J, S, F));
  }
  function J(S, F) {
    Q("resume", F.reading), F.reading || S.read(0), F.resumeScheduled = !1, S.emit("resume"), x(S), F.flowing && !F.reading && S.read(0);
  }
  ne.prototype.pause = function() {
    return Q("call pause flowing=%j", this._readableState.flowing), this._readableState.flowing !== !1 && (Q("pause"), this._readableState.flowing = !1, this.emit("pause")), this._readableState[De] = !0, this;
  };
  function x(S) {
    const F = S._readableState;
    for (Q("flow", F.flowing); F.flowing && S.read() !== null; )
      ;
  }
  ne.prototype.wrap = function(S) {
    let F = !1;
    S.on("data", (u) => {
      !this.push(u) && S.pause && (F = !0, S.pause());
    }), S.on("end", () => {
      this.push(null);
    }), S.on("error", (u) => {
      Oe(this, u);
    }), S.on("close", () => {
      this.destroy();
    }), S.on("destroy", () => {
      this.destroy();
    }), this._read = () => {
      F && S.resume && (F = !1, S.resume());
    };
    const g = v(S);
    for (let u = 1; u < g.length; u++) {
      const c = g[u];
      this[c] === void 0 && typeof S[c] == "function" && (this[c] = S[c].bind(S));
    }
    return this;
  }, ne.prototype[N] = function() {
    return d(this);
  }, ne.prototype.iterator = function(S) {
    return S !== void 0 && Te(S, "options"), d(this, S);
  };
  function d(S, F) {
    typeof S.read != "function" && (S = ne.wrap(S, {
      objectMode: !0
    }));
    const g = _(S, F);
    return g.stream = S, g;
  }
  async function* _(S, F) {
    let g = et;
    function u(D) {
      this === S ? (g(), g = et) : g = D;
    }
    S.on("readable", u);
    let c;
    const T = ue(
      S,
      {
        writable: !1
      },
      (D) => {
        c = D ? he(c, D) : null, g(), g = et;
      }
    );
    try {
      for (; ; ) {
        const D = S.destroyed ? null : S.read();
        if (D !== null)
          yield D;
        else {
          if (c)
            throw c;
          if (c === null)
            return;
          await new P(u);
        }
      }
    } catch (D) {
      throw c = he(c, D), c;
    } finally {
      (c || F?.destroyOnReturn !== !1) && (c === void 0 || S._readableState.autoDestroy) ? Ge.destroyer(S, null) : (S.off("readable", u), T());
    }
  }
  w(ne.prototype, {
    readable: {
      __proto__: null,
      get() {
        const S = this._readableState;
        return !!S && S.readable !== !1 && !S.destroyed && !S.errorEmitted && !S.endEmitted;
      },
      set(S) {
        this._readableState && (this._readableState.readable = !!S);
      }
    },
    readableDidRead: {
      __proto__: null,
      enumerable: !1,
      get: function() {
        return this._readableState.dataEmitted;
      }
    },
    readableAborted: {
      __proto__: null,
      enumerable: !1,
      get: function() {
        return !!(this._readableState.readable !== !1 && (this._readableState.destroyed || this._readableState.errored) && !this._readableState.endEmitted);
      }
    },
    readableHighWaterMark: {
      __proto__: null,
      enumerable: !1,
      get: function() {
        return this._readableState.highWaterMark;
      }
    },
    readableBuffer: {
      __proto__: null,
      enumerable: !1,
      get: function() {
        return this._readableState && this._readableState.buffer;
      }
    },
    readableFlowing: {
      __proto__: null,
      enumerable: !1,
      get: function() {
        return this._readableState.flowing;
      },
      set: function(S) {
        this._readableState && (this._readableState.flowing = S);
      }
    },
    readableLength: {
      __proto__: null,
      enumerable: !1,
      get() {
        return this._readableState.length;
      }
    },
    readableObjectMode: {
      __proto__: null,
      enumerable: !1,
      get() {
        return this._readableState ? this._readableState.objectMode : !1;
      }
    },
    readableEncoding: {
      __proto__: null,
      enumerable: !1,
      get() {
        return this._readableState ? this._readableState.encoding : null;
      }
    },
    errored: {
      __proto__: null,
      enumerable: !1,
      get() {
        return this._readableState ? this._readableState.errored : null;
      }
    },
    closed: {
      __proto__: null,
      get() {
        return this._readableState ? this._readableState.closed : !1;
      }
    },
    destroyed: {
      __proto__: null,
      enumerable: !1,
      get() {
        return this._readableState ? this._readableState.destroyed : !1;
      },
      set(S) {
        this._readableState && (this._readableState.destroyed = S);
      }
    },
    readableEnded: {
      __proto__: null,
      enumerable: !1,
      get() {
        return this._readableState ? this._readableState.endEmitted : !1;
      }
    }
  }), w(ht.prototype, {
    // Legacy getter for `pipesCount`.
    pipesCount: {
      __proto__: null,
      get() {
        return this.pipes.length;
      }
    },
    // Legacy property for `paused`.
    paused: {
      __proto__: null,
      get() {
        return this[De] !== !1;
      },
      set(S) {
        this[De] = !!S;
      }
    }
  }), ne._fromList = C;
  function C(S, F) {
    if (F.length === 0)
      return null;
    let g;
    return F.objectMode ? g = F.buffer.shift() : !S || S >= F.length ? (F.decoder ? g = F.buffer.join("") : F.buffer.length === 1 ? g = F.buffer.first() : g = F.buffer.concat(F.length), F.buffer.clear()) : g = F.buffer.consume(S, F.decoder), g;
  }
  function O(S) {
    const F = S._readableState;
    Q("endReadable", F.endEmitted), F.endEmitted || (F.ended = !0, r.nextTick(X, F, S));
  }
  function X(S, F) {
    if (Q("endReadableNT", S.endEmitted, S.length), !S.errored && !S.closeEmitted && !S.endEmitted && S.length === 0) {
      if (S.endEmitted = !0, F.emit("end"), F.writable && F.allowHalfOpen === !1)
        r.nextTick(q, F);
      else if (S.autoDestroy) {
        const g = F._writableState;
        (!g || g.autoDestroy && // We don't expect the writable to ever 'finish'
        // if writable is explicitly set to false.
        (g.finished || g.writable === !1)) && F.destroy();
      }
    }
  }
  function q(S) {
    S.writable && !S.writableEnded && !S.destroyed && S.end();
  }
  ne.from = function(S, F) {
    return Ke(ne, S, F);
  };
  let we;
  function Ne() {
    return we === void 0 && (we = {}), we;
  }
  return ne.fromWeb = function(S, F) {
    return Ne().newStreamReadableFromReadableStream(S, F);
  }, ne.toWeb = function(S, F) {
    return Ne().newReadableStreamFromStreamReadable(S, F);
  }, ne.wrap = function(S, F) {
    var g, u;
    return new ne({
      objectMode: (g = (u = S.readableObjectMode) !== null && u !== void 0 ? u : S.objectMode) !== null && g !== void 0 ? g : !0,
      ...F,
      destroy(c, T) {
        Ge.destroyer(S, c), T(c);
      }
    }).wrap(S);
  }, $i;
}
var Wi, rs;
function Dl() {
  if (rs)
    return Wi;
  rs = 1;
  const r = mr, {
    ArrayPrototypeSlice: a,
    Error: o,
    FunctionPrototypeSymbolHasInstance: l,
    ObjectDefineProperty: m,
    ObjectDefineProperties: w,
    ObjectSetPrototypeOf: v,
    StringPrototypeToLowerCase: b,
    Symbol: P,
    SymbolHasInstance: L
  } = dt;
  Wi = ye, ye.WritableState = Te;
  const { EventEmitter: N } = Ra, H = Aa.Stream, { Buffer: re } = tr, z = Or, { addAbortSignal: G } = Qn, { getHighWaterMark: ve, getDefaultHighWaterMark: ce } = Ia, {
    ERR_INVALID_ARG_TYPE: ue,
    ERR_METHOD_NOT_IMPLEMENTED: Q,
    ERR_MULTIPLE_CALLBACK: Ce,
    ERR_STREAM_CANNOT_PIPE: Ge,
    ERR_STREAM_DESTROYED: ge,
    ERR_STREAM_ALREADY_FINISHED: Fe,
    ERR_STREAM_NULL_VALUES: he,
    ERR_STREAM_WRITE_AFTER_END: _e,
    ERR_UNKNOWN_ENCODING: Me
  } = Et.codes, { errorOrDestroy: k } = z;
  v(ye.prototype, H.prototype), v(ye, H);
  function Y() {
  }
  const We = P("kOnFinished");
  function Te(M, U, J) {
    typeof J != "boolean" && (J = U instanceof Ht()), this.objectMode = !!(M && M.objectMode), J && (this.objectMode = this.objectMode || !!(M && M.writableObjectMode)), this.highWaterMark = M ? ve(this, M, "writableHighWaterMark", J) : ce(!1), this.finalCalled = !1, this.needDrain = !1, this.ending = !1, this.ended = !1, this.finished = !1, this.destroyed = !1;
    const x = !!(M && M.decodeStrings === !1);
    this.decodeStrings = !x, this.defaultEncoding = M && M.defaultEncoding || "utf8", this.length = 0, this.writing = !1, this.corked = 0, this.sync = !0, this.bufferProcessing = !1, this.onwrite = ne.bind(void 0, U), this.writecb = null, this.writelen = 0, this.afterWriteTickInfo = null, De(this), this.pendingcb = 0, this.constructed = !0, this.prefinished = !1, this.errorEmitted = !1, this.emitClose = !M || M.emitClose !== !1, this.autoDestroy = !M || M.autoDestroy !== !1, this.errored = null, this.closed = !1, this.closeEmitted = !1, this[We] = [];
  }
  function De(M) {
    M.buffered = [], M.bufferedIndex = 0, M.allBuffers = !0, M.allNoop = !0;
  }
  Te.prototype.getBuffer = function() {
    return a(this.buffered, this.bufferedIndex);
  }, m(Te.prototype, "bufferedRequestCount", {
    __proto__: null,
    get() {
      return this.buffered.length - this.bufferedIndex;
    }
  });
  function ye(M) {
    const U = this instanceof Ht();
    if (!U && !l(ye, this))
      return new ye(M);
    this._writableState = new Te(M, this, U), M && (typeof M.write == "function" && (this._write = M.write), typeof M.writev == "function" && (this._writev = M.writev), typeof M.destroy == "function" && (this._destroy = M.destroy), typeof M.final == "function" && (this._final = M.final), typeof M.construct == "function" && (this._construct = M.construct), M.signal && G(M.signal, this)), H.call(this, M), z.construct(this, () => {
      const J = this._writableState;
      J.writing || St(this, J), ft(this, J);
    });
  }
  m(ye, L, {
    __proto__: null,
    value: function(M) {
      return l(this, M) ? !0 : this !== ye ? !1 : M && M._writableState instanceof Te;
    }
  }), ye.prototype.pipe = function() {
    k(this, new Ge());
  };
  function Ke(M, U, J, x) {
    const d = M._writableState;
    if (typeof J == "function")
      x = J, J = d.defaultEncoding;
    else {
      if (!J)
        J = d.defaultEncoding;
      else if (J !== "buffer" && !re.isEncoding(J))
        throw new Me(J);
      typeof x != "function" && (x = Y);
    }
    if (U === null)
      throw new he();
    if (!d.objectMode)
      if (typeof U == "string")
        d.decodeStrings !== !1 && (U = re.from(U, J), J = "buffer");
      else if (U instanceof re)
        J = "buffer";
      else if (H._isUint8Array(U))
        U = H._uint8ArrayToBuffer(U), J = "buffer";
      else
        throw new ue("chunk", ["string", "Buffer", "Uint8Array"], U);
    let _;
    return d.ending ? _ = new _e() : d.destroyed && (_ = new ge("write")), _ ? (r.nextTick(x, _), k(M, _, !0), _) : (d.pendingcb++, et(M, d, U, J, x));
  }
  ye.prototype.write = function(M, U, J) {
    return Ke(this, M, U, J) === !0;
  }, ye.prototype.cork = function() {
    this._writableState.corked++;
  }, ye.prototype.uncork = function() {
    const M = this._writableState;
    M.corked && (M.corked--, M.writing || St(this, M));
  }, ye.prototype.setDefaultEncoding = function(U) {
    if (typeof U == "string" && (U = b(U)), !re.isEncoding(U))
      throw new Me(U);
    return this._writableState.defaultEncoding = U, this;
  };
  function et(M, U, J, x, d) {
    const _ = U.objectMode ? 1 : J.length;
    U.length += _;
    const C = U.length < U.highWaterMark;
    return C || (U.needDrain = !0), U.writing || U.corked || U.errored || !U.constructed ? (U.buffered.push({
      chunk: J,
      encoding: x,
      callback: d
    }), U.allBuffers && x !== "buffer" && (U.allBuffers = !1), U.allNoop && d !== Y && (U.allNoop = !1)) : (U.writelen = _, U.writecb = d, U.writing = !0, U.sync = !0, M._write(J, x, U.onwrite), U.sync = !1), C && !U.errored && !U.destroyed;
  }
  function Oe(M, U, J, x, d, _, C) {
    U.writelen = x, U.writecb = C, U.writing = !0, U.sync = !0, U.destroyed ? U.onwrite(new ge("write")) : J ? M._writev(d, U.onwrite) : M._write(d, _, U.onwrite), U.sync = !1;
  }
  function ht(M, U, J, x) {
    --U.pendingcb, x(J), xt(U), k(M, J);
  }
  function ne(M, U) {
    const J = M._writableState, x = J.sync, d = J.writecb;
    if (typeof d != "function") {
      k(M, new Ce());
      return;
    }
    J.writing = !1, J.writecb = null, J.length -= J.writelen, J.writelen = 0, U ? (J.errored || (J.errored = U), M._readableState && !M._readableState.errored && (M._readableState.errored = U), x ? r.nextTick(ht, M, J, U, d) : ht(M, J, U, d)) : (J.buffered.length > J.bufferedIndex && St(M, J), x ? J.afterWriteTickInfo !== null && J.afterWriteTickInfo.cb === d ? J.afterWriteTickInfo.count++ : (J.afterWriteTickInfo = {
      count: 1,
      cb: d,
      stream: M,
      state: J
    }, r.nextTick(me, J.afterWriteTickInfo)) : Ie(M, J, 1, d));
  }
  function me({ stream: M, state: U, count: J, cb: x }) {
    return U.afterWriteTickInfo = null, Ie(M, U, J, x);
  }
  function Ie(M, U, J, x) {
    for (!U.ending && !M.destroyed && U.length === 0 && U.needDrain && (U.needDrain = !1, M.emit("drain")); J-- > 0; )
      U.pendingcb--, x();
    U.destroyed && xt(U), ft(M, U);
  }
  function xt(M) {
    if (M.writing)
      return;
    for (let d = M.bufferedIndex; d < M.buffered.length; ++d) {
      var U;
      const { chunk: _, callback: C } = M.buffered[d], O = M.objectMode ? 1 : _.length;
      M.length -= O, C(
        (U = M.errored) !== null && U !== void 0 ? U : new ge("write")
      );
    }
    const J = M[We].splice(0);
    for (let d = 0; d < J.length; d++) {
      var x;
      J[d](
        (x = M.errored) !== null && x !== void 0 ? x : new ge("end")
      );
    }
    De(M);
  }
  function St(M, U) {
    if (U.corked || U.bufferProcessing || U.destroyed || !U.constructed)
      return;
    const { buffered: J, bufferedIndex: x, objectMode: d } = U, _ = J.length - x;
    if (!_)
      return;
    let C = x;
    if (U.bufferProcessing = !0, _ > 1 && M._writev) {
      U.pendingcb -= _ - 1;
      const O = U.allNoop ? Y : (q) => {
        for (let we = C; we < J.length; ++we)
          J[we].callback(q);
      }, X = U.allNoop && C === 0 ? J : a(J, C);
      X.allBuffers = U.allBuffers, Oe(M, U, !0, U.length, X, "", O), De(U);
    } else {
      do {
        const { chunk: O, encoding: X, callback: q } = J[C];
        J[C++] = null;
        const we = d ? 1 : O.length;
        Oe(M, U, !1, we, O, X, q);
      } while (C < J.length && !U.writing);
      C === J.length ? De(U) : C > 256 ? (J.splice(0, C), U.bufferedIndex = 0) : U.bufferedIndex = C;
    }
    U.bufferProcessing = !1;
  }
  ye.prototype._write = function(M, U, J) {
    if (this._writev)
      this._writev(
        [
          {
            chunk: M,
            encoding: U
          }
        ],
        J
      );
    else
      throw new Q("_write()");
  }, ye.prototype._writev = null, ye.prototype.end = function(M, U, J) {
    const x = this._writableState;
    typeof M == "function" ? (J = M, M = null, U = null) : typeof U == "function" && (J = U, U = null);
    let d;
    if (M != null) {
      const _ = Ke(this, M, U);
      _ instanceof o && (d = _);
    }
    return x.corked && (x.corked = 1, this.uncork()), d || (!x.errored && !x.ending ? (x.ending = !0, ft(this, x, !0), x.ended = !0) : x.finished ? d = new Fe("end") : x.destroyed && (d = new ge("end"))), typeof J == "function" && (d || x.finished ? r.nextTick(J, d) : x[We].push(J)), this;
  };
  function bt(M) {
    return M.ending && !M.destroyed && M.constructed && M.length === 0 && !M.errored && M.buffered.length === 0 && !M.finished && !M.writing && !M.errorEmitted && !M.closeEmitted;
  }
  function Dt(M, U) {
    let J = !1;
    function x(d) {
      if (J) {
        k(M, d ?? Ce());
        return;
      }
      if (J = !0, U.pendingcb--, d) {
        const _ = U[We].splice(0);
        for (let C = 0; C < _.length; C++)
          _[C](d);
        k(M, d, U.sync);
      } else
        bt(U) && (U.prefinished = !0, M.emit("prefinish"), U.pendingcb++, r.nextTick(rt, M, U));
    }
    U.sync = !0, U.pendingcb++;
    try {
      M._final(x);
    } catch (d) {
      x(d);
    }
    U.sync = !1;
  }
  function Tt(M, U) {
    !U.prefinished && !U.finalCalled && (typeof M._final == "function" && !U.destroyed ? (U.finalCalled = !0, Dt(M, U)) : (U.prefinished = !0, M.emit("prefinish")));
  }
  function ft(M, U, J) {
    bt(U) && (Tt(M, U), U.pendingcb === 0 && (J ? (U.pendingcb++, r.nextTick(
      (x, d) => {
        bt(d) ? rt(x, d) : d.pendingcb--;
      },
      M,
      U
    )) : bt(U) && (U.pendingcb++, rt(M, U))));
  }
  function rt(M, U) {
    U.pendingcb--, U.finished = !0;
    const J = U[We].splice(0);
    for (let x = 0; x < J.length; x++)
      J[x]();
    if (M.emit("finish"), U.autoDestroy) {
      const x = M._readableState;
      (!x || x.autoDestroy && // We don't expect the readable to ever 'end'
      // if readable is explicitly set to false.
      (x.endEmitted || x.readable === !1)) && M.destroy();
    }
  }
  w(ye.prototype, {
    closed: {
      __proto__: null,
      get() {
        return this._writableState ? this._writableState.closed : !1;
      }
    },
    destroyed: {
      __proto__: null,
      get() {
        return this._writableState ? this._writableState.destroyed : !1;
      },
      set(M) {
        this._writableState && (this._writableState.destroyed = M);
      }
    },
    writable: {
      __proto__: null,
      get() {
        const M = this._writableState;
        return !!M && M.writable !== !1 && !M.destroyed && !M.errored && !M.ending && !M.ended;
      },
      set(M) {
        this._writableState && (this._writableState.writable = !!M);
      }
    },
    writableFinished: {
      __proto__: null,
      get() {
        return this._writableState ? this._writableState.finished : !1;
      }
    },
    writableObjectMode: {
      __proto__: null,
      get() {
        return this._writableState ? this._writableState.objectMode : !1;
      }
    },
    writableBuffer: {
      __proto__: null,
      get() {
        return this._writableState && this._writableState.getBuffer();
      }
    },
    writableEnded: {
      __proto__: null,
      get() {
        return this._writableState ? this._writableState.ending : !1;
      }
    },
    writableNeedDrain: {
      __proto__: null,
      get() {
        const M = this._writableState;
        return M ? !M.destroyed && !M.ending && M.needDrain : !1;
      }
    },
    writableHighWaterMark: {
      __proto__: null,
      get() {
        return this._writableState && this._writableState.highWaterMark;
      }
    },
    writableCorked: {
      __proto__: null,
      get() {
        return this._writableState ? this._writableState.corked : 0;
      }
    },
    writableLength: {
      __proto__: null,
      get() {
        return this._writableState && this._writableState.length;
      }
    },
    errored: {
      __proto__: null,
      enumerable: !1,
      get() {
        return this._writableState ? this._writableState.errored : null;
      }
    },
    writableAborted: {
      __proto__: null,
      enumerable: !1,
      get: function() {
        return !!(this._writableState.writable !== !1 && (this._writableState.destroyed || this._writableState.errored) && !this._writableState.finished);
      }
    }
  });
  const vt = z.destroy;
  ye.prototype.destroy = function(M, U) {
    const J = this._writableState;
    return !J.destroyed && (J.bufferedIndex < J.buffered.length || J[We].length) && r.nextTick(xt, J), vt.call(this, M, U), this;
  }, ye.prototype._undestroy = z.undestroy, ye.prototype._destroy = function(M, U) {
    U(M);
  }, ye.prototype[N.captureRejectionSymbol] = function(M) {
    this.destroy(M);
  };
  let mt;
  function it() {
    return mt === void 0 && (mt = {}), mt;
  }
  return ye.fromWeb = function(M, U) {
    return it().newStreamWritableFromWritableStream(M, U);
  }, ye.toWeb = function(M) {
    return it().newWritableStreamFromStreamWritable(M);
  }, Wi;
}
var ji, ns;
function Q_() {
  if (ns)
    return ji;
  ns = 1;
  const r = mr, a = tr, {
    isReadable: o,
    isWritable: l,
    isIterable: m,
    isNodeStream: w,
    isReadableNodeStream: v,
    isWritableNodeStream: b,
    isDuplexNodeStream: P
  } = Zt, L = rr, {
    AbortError: N,
    codes: { ERR_INVALID_ARG_TYPE: H, ERR_INVALID_RETURN_VALUE: re }
  } = Et, { destroyer: z } = Or, G = Ht(), ve = Jn(), { createDeferredPromise: ce } = Xt, ue = Pl, Q = globalThis.Blob || a.Blob, Ce = typeof Q < "u" ? function(k) {
    return k instanceof Q;
  } : function(k) {
    return !1;
  }, Ge = globalThis.AbortController || wa().AbortController, { FunctionPrototypeCall: ge } = dt;
  class Fe extends G {
    constructor(k) {
      super(k), k?.readable === !1 && (this._readableState.readable = !1, this._readableState.ended = !0, this._readableState.endEmitted = !0), k?.writable === !1 && (this._writableState.writable = !1, this._writableState.ending = !0, this._writableState.ended = !0, this._writableState.finished = !0);
    }
  }
  ji = function Me(k, Y) {
    if (P(k))
      return k;
    if (v(k))
      return _e({
        readable: k
      });
    if (b(k))
      return _e({
        writable: k
      });
    if (w(k))
      return _e({
        writable: !1,
        readable: !1
      });
    if (typeof k == "function") {
      const { value: Te, write: De, final: ye, destroy: Ke } = he(k);
      if (m(Te))
        return ue(Fe, Te, {
          // TODO (ronag): highWaterMark?
          objectMode: !0,
          write: De,
          final: ye,
          destroy: Ke
        });
      const et = Te?.then;
      if (typeof et == "function") {
        let Oe;
        const ht = ge(
          et,
          Te,
          (ne) => {
            if (ne != null)
              throw new re("nully", "body", ne);
          },
          (ne) => {
            z(Oe, ne);
          }
        );
        return Oe = new Fe({
          // TODO (ronag): highWaterMark?
          objectMode: !0,
          readable: !1,
          write: De,
          final(ne) {
            ye(async () => {
              try {
                await ht, r.nextTick(ne, null);
              } catch (me) {
                r.nextTick(ne, me);
              }
            });
          },
          destroy: Ke
        });
      }
      throw new re("Iterable, AsyncIterable or AsyncFunction", Y, Te);
    }
    if (Ce(k))
      return Me(k.arrayBuffer());
    if (m(k))
      return ue(Fe, k, {
        // TODO (ronag): highWaterMark?
        objectMode: !0,
        writable: !1
      });
    if (typeof k?.writable == "object" || typeof k?.readable == "object") {
      const Te = k != null && k.readable ? v(k?.readable) ? k?.readable : Me(k.readable) : void 0, De = k != null && k.writable ? b(k?.writable) ? k?.writable : Me(k.writable) : void 0;
      return _e({
        readable: Te,
        writable: De
      });
    }
    const We = k?.then;
    if (typeof We == "function") {
      let Te;
      return ge(
        We,
        k,
        (De) => {
          De != null && Te.push(De), Te.push(null);
        },
        (De) => {
          z(Te, De);
        }
      ), Te = new Fe({
        objectMode: !0,
        writable: !1,
        read() {
        }
      });
    }
    throw new H(
      Y,
      [
        "Blob",
        "ReadableStream",
        "WritableStream",
        "Stream",
        "Iterable",
        "AsyncIterable",
        "Function",
        "{ readable, writable } pair",
        "Promise"
      ],
      k
    );
  };
  function he(Me) {
    let { promise: k, resolve: Y } = ce();
    const We = new Ge(), Te = We.signal;
    return {
      value: Me(
        async function* () {
          for (; ; ) {
            const ye = k;
            k = null;
            const { chunk: Ke, done: et, cb: Oe } = await ye;
            if (r.nextTick(Oe), et)
              return;
            if (Te.aborted)
              throw new N(void 0, {
                cause: Te.reason
              });
            ({ promise: k, resolve: Y } = ce()), yield Ke;
          }
        }(),
        {
          signal: Te
        }
      ),
      write(ye, Ke, et) {
        const Oe = Y;
        Y = null, Oe({
          chunk: ye,
          done: !1,
          cb: et
        });
      },
      final(ye) {
        const Ke = Y;
        Y = null, Ke({
          done: !0,
          cb: ye
        });
      },
      destroy(ye, Ke) {
        We.abort(), Ke(ye);
      }
    };
  }
  function _e(Me) {
    const k = Me.readable && typeof Me.readable.read != "function" ? ve.wrap(Me.readable) : Me.readable, Y = Me.writable;
    let We = !!o(k), Te = !!l(Y), De, ye, Ke, et, Oe;
    function ht(ne) {
      const me = et;
      et = null, me ? me(ne) : ne && Oe.destroy(ne);
    }
    return Oe = new Fe({
      // TODO (ronag): highWaterMark?
      readableObjectMode: !!(k != null && k.readableObjectMode),
      writableObjectMode: !!(Y != null && Y.writableObjectMode),
      readable: We,
      writable: Te
    }), Te && (L(Y, (ne) => {
      Te = !1, ne && z(k, ne), ht(ne);
    }), Oe._write = function(ne, me, Ie) {
      Y.write(ne, me) ? Ie() : De = Ie;
    }, Oe._final = function(ne) {
      Y.end(), ye = ne;
    }, Y.on("drain", function() {
      if (De) {
        const ne = De;
        De = null, ne();
      }
    }), Y.on("finish", function() {
      if (ye) {
        const ne = ye;
        ye = null, ne();
      }
    })), We && (L(k, (ne) => {
      We = !1, ne && z(k, ne), ht(ne);
    }), k.on("readable", function() {
      if (Ke) {
        const ne = Ke;
        Ke = null, ne();
      }
    }), k.on("end", function() {
      Oe.push(null);
    }), Oe._read = function() {
      for (; ; ) {
        const ne = k.read();
        if (ne === null) {
          Ke = Oe._read;
          return;
        }
        if (!Oe.push(ne))
          return;
      }
    }), Oe._destroy = function(ne, me) {
      !ne && et !== null && (ne = new N()), Ke = null, De = null, ye = null, et === null ? me(ne) : (et = me, z(Y, ne), z(k, ne));
    }, Oe;
  }
  return ji;
}
var Gi, is;
function Ht() {
  if (is)
    return Gi;
  is = 1;
  const {
    ObjectDefineProperties: r,
    ObjectGetOwnPropertyDescriptor: a,
    ObjectKeys: o,
    ObjectSetPrototypeOf: l
  } = dt;
  Gi = v;
  const m = Jn(), w = Dl();
  l(v.prototype, m.prototype), l(v, m);
  {
    const N = o(w.prototype);
    for (let H = 0; H < N.length; H++) {
      const re = N[H];
      v.prototype[re] || (v.prototype[re] = w.prototype[re]);
    }
  }
  function v(N) {
    if (!(this instanceof v))
      return new v(N);
    m.call(this, N), w.call(this, N), N ? (this.allowHalfOpen = N.allowHalfOpen !== !1, N.readable === !1 && (this._readableState.readable = !1, this._readableState.ended = !0, this._readableState.endEmitted = !0), N.writable === !1 && (this._writableState.writable = !1, this._writableState.ending = !0, this._writableState.ended = !0, this._writableState.finished = !0)) : this.allowHalfOpen = !0;
  }
  r(v.prototype, {
    writable: {
      __proto__: null,
      ...a(w.prototype, "writable")
    },
    writableHighWaterMark: {
      __proto__: null,
      ...a(w.prototype, "writableHighWaterMark")
    },
    writableObjectMode: {
      __proto__: null,
      ...a(w.prototype, "writableObjectMode")
    },
    writableBuffer: {
      __proto__: null,
      ...a(w.prototype, "writableBuffer")
    },
    writableLength: {
      __proto__: null,
      ...a(w.prototype, "writableLength")
    },
    writableFinished: {
      __proto__: null,
      ...a(w.prototype, "writableFinished")
    },
    writableCorked: {
      __proto__: null,
      ...a(w.prototype, "writableCorked")
    },
    writableEnded: {
      __proto__: null,
      ...a(w.prototype, "writableEnded")
    },
    writableNeedDrain: {
      __proto__: null,
      ...a(w.prototype, "writableNeedDrain")
    },
    destroyed: {
      __proto__: null,
      get() {
        return this._readableState === void 0 || this._writableState === void 0 ? !1 : this._readableState.destroyed && this._writableState.destroyed;
      },
      set(N) {
        this._readableState && this._writableState && (this._readableState.destroyed = N, this._writableState.destroyed = N);
      }
    }
  });
  let b;
  function P() {
    return b === void 0 && (b = {}), b;
  }
  v.fromWeb = function(N, H) {
    return P().newStreamDuplexFromReadableWritablePair(N, H);
  }, v.toWeb = function(N) {
    return P().newReadableWritablePairFromDuplex(N);
  };
  let L;
  return v.from = function(N) {
    return L || (L = Q_()), L(N, "body");
  }, Gi;
}
const { ObjectSetPrototypeOf: Ll, Symbol: J_ } = dt;
var Bl = Kt;
const { ERR_METHOD_NOT_IMPLEMENTED: eb } = Et.codes, Pa = Ht(), { getHighWaterMark: tb } = Ia;
Ll(Kt.prototype, Pa.prototype);
Ll(Kt, Pa);
const Kr = J_("kCallback");
function Kt(r) {
  if (!(this instanceof Kt))
    return new Kt(r);
  const a = r ? tb(this, r, "readableHighWaterMark", !0) : null;
  a === 0 && (r = {
    ...r,
    highWaterMark: null,
    readableHighWaterMark: a,
    // TODO (ronag): 0 is not optimal since we have
    // a "bug" where we check needDrain before calling _write and not after.
    // Refs: https://github.com/nodejs/node/pull/32887
    // Refs: https://github.com/nodejs/node/pull/35941
    writableHighWaterMark: r.writableHighWaterMark || 0
  }), Pa.call(this, r), this._readableState.sync = !1, this[Kr] = null, r && (typeof r.transform == "function" && (this._transform = r.transform), typeof r.flush == "function" && (this._flush = r.flush)), this.on("prefinish", rb);
}
function da(r) {
  typeof this._flush == "function" && !this.destroyed ? this._flush((a, o) => {
    if (a) {
      r ? r(a) : this.destroy(a);
      return;
    }
    o != null && this.push(o), this.push(null), r && r();
  }) : (this.push(null), r && r());
}
function rb() {
  this._final !== da && da.call(this);
}
Kt.prototype._final = da;
Kt.prototype._transform = function(r, a, o) {
  throw new eb("_transform()");
};
Kt.prototype._write = function(r, a, o) {
  const l = this._readableState, m = this._writableState, w = l.length;
  this._transform(r, a, (v, b) => {
    if (v) {
      o(v);
      return;
    }
    b != null && this.push(b), m.ended || // Backwards compat.
    w === l.length || // Backwards compat.
    l.length < l.highWaterMark ? o() : this[Kr] = o;
  });
};
Kt.prototype._read = function() {
  if (this[Kr]) {
    const r = this[Kr];
    this[Kr] = null, r();
  }
};
const { ObjectSetPrototypeOf: Ml } = dt;
var Ol = Br;
const Da = Bl;
Ml(Br.prototype, Da.prototype);
Ml(Br, Da);
function Br(r) {
  if (!(this instanceof Br))
    return new Br(r);
  Da.call(this, r);
}
Br.prototype._transform = function(r, a, o) {
  o(null, r);
};
const Hr = mr, { ArrayIsArray: nb, Promise: ib, SymbolAsyncIterator: ab } = dt, Nn = rr, { once: ob } = Xt, sb = Or, as = Ht(), {
  aggregateTwoErrors: lb,
  codes: {
    ERR_INVALID_ARG_TYPE: ha,
    ERR_INVALID_RETURN_VALUE: Vi,
    ERR_MISSING_ARGS: ub,
    ERR_STREAM_DESTROYED: fb,
    ERR_STREAM_PREMATURE_CLOSE: cb
  },
  AbortError: db
} = Et, { validateFunction: hb, validateAbortSignal: pb } = Vn, {
  isIterable: cr,
  isReadable: zi,
  isReadableNodeStream: Bn,
  isNodeStream: os,
  isTransformStream: Ir,
  isWebStream: _b,
  isReadableStream: Hi,
  isReadableEnded: bb
} = Zt, mb = globalThis.AbortController || wa().AbortController;
let Ki, Xi;
function ss(r, a, o) {
  let l = !1;
  r.on("close", () => {
    l = !0;
  });
  const m = Nn(
    r,
    {
      readable: a,
      writable: o
    },
    (w) => {
      l = !w;
    }
  );
  return {
    destroy: (w) => {
      l || (l = !0, sb.destroyer(r, w || new fb("pipe")));
    },
    cleanup: m
  };
}
function gb(r) {
  return hb(r[r.length - 1], "streams[stream.length - 1]"), r.pop();
}
function Yi(r) {
  if (cr(r))
    return r;
  if (Bn(r))
    return yb(r);
  throw new ha("val", ["Readable", "Iterable", "AsyncIterable"], r);
}
async function* yb(r) {
  Xi || (Xi = Jn()), yield* Xi.prototype[ab].call(r);
}
async function In(r, a, o, { end: l }) {
  let m, w = null;
  const v = (L) => {
    if (L && (m = L), w) {
      const N = w;
      w = null, N();
    }
  }, b = () => new ib((L, N) => {
    m ? N(m) : w = () => {
      m ? N(m) : L();
    };
  });
  a.on("drain", v);
  const P = Nn(
    a,
    {
      readable: !1
    },
    v
  );
  try {
    a.writableNeedDrain && await b();
    for await (const L of r)
      a.write(L) || await b();
    l && a.end(), await b(), o();
  } catch (L) {
    o(m !== L ? lb(m, L) : L);
  } finally {
    P(), a.off("drain", v);
  }
}
async function Zi(r, a, o, { end: l }) {
  Ir(a) && (a = a.writable);
  const m = a.getWriter();
  try {
    for await (const w of r)
      await m.ready, m.write(w).catch(() => {
      });
    await m.ready, l && await m.close(), o();
  } catch (w) {
    try {
      await m.abort(w), o(w);
    } catch (v) {
      o(v);
    }
  }
}
function vb(...r) {
  return Nl(r, ob(gb(r)));
}
function Nl(r, a, o) {
  if (r.length === 1 && nb(r[0]) && (r = r[0]), r.length < 2)
    throw new ub("streams");
  const l = new mb(), m = l.signal, w = o?.signal, v = [];
  pb(w, "options.signal");
  function b() {
    z(new db());
  }
  w?.addEventListener("abort", b);
  let P, L;
  const N = [];
  let H = 0;
  function re(ue) {
    z(ue, --H === 0);
  }
  function z(ue, Q) {
    if (ue && (!P || P.code === "ERR_STREAM_PREMATURE_CLOSE") && (P = ue), !(!P && !Q)) {
      for (; N.length; )
        N.shift()(P);
      w?.removeEventListener("abort", b), l.abort(), Q && (P || v.forEach((Ce) => Ce()), Hr.nextTick(a, P, L));
    }
  }
  let G;
  for (let ue = 0; ue < r.length; ue++) {
    const Q = r[ue], Ce = ue < r.length - 1, Ge = ue > 0, ge = Ce || o?.end !== !1, Fe = ue === r.length - 1;
    if (os(Q)) {
      let he = function(_e) {
        _e && _e.name !== "AbortError" && _e.code !== "ERR_STREAM_PREMATURE_CLOSE" && re(_e);
      };
      if (ge) {
        const { destroy: _e, cleanup: Me } = ss(Q, Ce, Ge);
        N.push(_e), zi(Q) && Fe && v.push(Me);
      }
      Q.on("error", he), zi(Q) && Fe && v.push(() => {
        Q.removeListener("error", he);
      });
    }
    if (ue === 0)
      if (typeof Q == "function") {
        if (G = Q({
          signal: m
        }), !cr(G))
          throw new Vi("Iterable, AsyncIterable or Stream", "source", G);
      } else
        cr(Q) || Bn(Q) || Ir(Q) ? G = Q : G = as.from(Q);
    else if (typeof Q == "function") {
      if (Ir(G)) {
        var ve;
        G = Yi((ve = G) === null || ve === void 0 ? void 0 : ve.readable);
      } else
        G = Yi(G);
      if (G = Q(G, {
        signal: m
      }), Ce) {
        if (!cr(G, !0))
          throw new Vi("AsyncIterable", `transform[${ue - 1}]`, G);
      } else {
        var ce;
        Ki || (Ki = Ol);
        const he = new Ki({
          objectMode: !0
        }), _e = (ce = G) === null || ce === void 0 ? void 0 : ce.then;
        if (typeof _e == "function")
          H++, _e.call(
            G,
            (Y) => {
              L = Y, Y != null && he.write(Y), ge && he.end(), Hr.nextTick(re);
            },
            (Y) => {
              he.destroy(Y), Hr.nextTick(re, Y);
            }
          );
        else if (cr(G, !0))
          H++, In(G, he, re, {
            end: ge
          });
        else if (Hi(G) || Ir(G)) {
          const Y = G.readable || G;
          H++, In(Y, he, re, {
            end: ge
          });
        } else
          throw new Vi("AsyncIterable or Promise", "destination", G);
        G = he;
        const { destroy: Me, cleanup: k } = ss(G, !1, !0);
        N.push(Me), Fe && v.push(k);
      }
    } else if (os(Q)) {
      if (Bn(G)) {
        H += 2;
        const he = wb(G, Q, re, {
          end: ge
        });
        zi(Q) && Fe && v.push(he);
      } else if (Ir(G) || Hi(G)) {
        const he = G.readable || G;
        H++, In(he, Q, re, {
          end: ge
        });
      } else if (cr(G))
        H++, In(G, Q, re, {
          end: ge
        });
      else
        throw new ha(
          "val",
          ["Readable", "Iterable", "AsyncIterable", "ReadableStream", "TransformStream"],
          G
        );
      G = Q;
    } else if (_b(Q)) {
      if (Bn(G))
        H++, Zi(Yi(G), Q, re, {
          end: ge
        });
      else if (Hi(G) || cr(G))
        H++, Zi(G, Q, re, {
          end: ge
        });
      else if (Ir(G))
        H++, Zi(G.readable, Q, re, {
          end: ge
        });
      else
        throw new ha(
          "val",
          ["Readable", "Iterable", "AsyncIterable", "ReadableStream", "TransformStream"],
          G
        );
      G = Q;
    } else
      G = as.from(Q);
  }
  return (m != null && m.aborted || w != null && w.aborted) && Hr.nextTick(b), G;
}
function wb(r, a, o, { end: l }) {
  let m = !1;
  if (a.on("close", () => {
    m || o(new cb());
  }), r.pipe(a, {
    end: !1
  }), l) {
    let w = function() {
      m = !0, a.end();
    };
    bb(r) ? Hr.nextTick(w) : r.once("end", w);
  } else
    o();
  return Nn(
    r,
    {
      readable: !0,
      writable: !1
    },
    (w) => {
      const v = r._readableState;
      w && w.code === "ERR_STREAM_PREMATURE_CLOSE" && v && v.ended && !v.errored && !v.errorEmitted ? r.once("end", o).once("error", o) : o(w);
    }
  ), Nn(
    a,
    {
      readable: !1,
      writable: !0
    },
    o
  );
}
var La = {
  pipelineImpl: Nl,
  pipeline: vb
};
const { pipeline: Eb } = La, kn = Ht(), { destroyer: xb } = Or, {
  isNodeStream: Pn,
  isReadable: ls,
  isWritable: us,
  isWebStream: qi,
  isTransformStream: fr,
  isWritableStream: fs,
  isReadableStream: cs
} = Zt, {
  AbortError: Sb,
  codes: { ERR_INVALID_ARG_VALUE: ds, ERR_MISSING_ARGS: Tb }
} = Et, Cb = rr;
var Ul = function(...a) {
  if (a.length === 0)
    throw new Tb("streams");
  if (a.length === 1)
    return kn.from(a[0]);
  const o = [...a];
  if (typeof a[0] == "function" && (a[0] = kn.from(a[0])), typeof a[a.length - 1] == "function") {
    const z = a.length - 1;
    a[z] = kn.from(a[z]);
  }
  for (let z = 0; z < a.length; ++z)
    if (!(!Pn(a[z]) && !qi(a[z]))) {
      if (z < a.length - 1 && !(ls(a[z]) || cs(a[z]) || fr(a[z])))
        throw new ds(`streams[${z}]`, o[z], "must be readable");
      if (z > 0 && !(us(a[z]) || fs(a[z]) || fr(a[z])))
        throw new ds(`streams[${z}]`, o[z], "must be writable");
    }
  let l, m, w, v, b;
  function P(z) {
    const G = v;
    v = null, G ? G(z) : z ? b.destroy(z) : !re && !H && b.destroy();
  }
  const L = a[0], N = Eb(a, P), H = !!(us(L) || fs(L) || fr(L)), re = !!(ls(N) || cs(N) || fr(N));
  if (b = new kn({
    // TODO (ronag): highWaterMark?
    writableObjectMode: !!(L != null && L.writableObjectMode),
    readableObjectMode: !!(N != null && N.writableObjectMode),
    writable: H,
    readable: re
  }), H) {
    if (Pn(L))
      b._write = function(G, ve, ce) {
        L.write(G, ve) ? ce() : l = ce;
      }, b._final = function(G) {
        L.end(), m = G;
      }, L.on("drain", function() {
        if (l) {
          const G = l;
          l = null, G();
        }
      });
    else if (qi(L)) {
      const ve = (fr(L) ? L.writable : L).getWriter();
      b._write = async function(ce, ue, Q) {
        try {
          await ve.ready, ve.write(ce).catch(() => {
          }), Q();
        } catch (Ce) {
          Q(Ce);
        }
      }, b._final = async function(ce) {
        try {
          await ve.ready, ve.close().catch(() => {
          }), m = ce;
        } catch (ue) {
          ce(ue);
        }
      };
    }
    const z = fr(N) ? N.readable : N;
    Cb(z, () => {
      if (m) {
        const G = m;
        m = null, G();
      }
    });
  }
  if (re) {
    if (Pn(N))
      N.on("readable", function() {
        if (w) {
          const z = w;
          w = null, z();
        }
      }), N.on("end", function() {
        b.push(null);
      }), b._read = function() {
        for (; ; ) {
          const z = N.read();
          if (z === null) {
            w = b._read;
            return;
          }
          if (!b.push(z))
            return;
        }
      };
    else if (qi(N)) {
      const G = (fr(N) ? N.readable : N).getReader();
      b._read = async function() {
        for (; ; )
          try {
            const { value: ve, done: ce } = await G.read();
            if (!b.push(ve))
              return;
            if (ce) {
              b.push(null);
              return;
            }
          } catch {
            return;
          }
      };
    }
  }
  return b._destroy = function(z, G) {
    !z && v !== null && (z = new Sb()), w = null, l = null, m = null, v === null ? G(z) : (v = G, Pn(N) && xb(N, z));
  }, b;
};
const $l = globalThis.AbortController || wa().AbortController, {
  codes: { ERR_INVALID_ARG_VALUE: Fb, ERR_INVALID_ARG_TYPE: nn, ERR_MISSING_ARGS: Rb, ERR_OUT_OF_RANGE: Ab },
  AbortError: Ut
} = Et, { validateAbortSignal: gr, validateInteger: Ib, validateObject: yr } = Vn, kb = dt.Symbol("kWeak"), { finished: Pb } = rr, Db = Ul, { addAbortSignalNoValidate: Lb } = Qn, { isWritable: Bb, isNodeStream: Mb } = Zt, {
  ArrayPrototypePush: Ob,
  MathFloor: Nb,
  Number: Ub,
  NumberIsNaN: $b,
  Promise: hs,
  PromiseReject: ps,
  PromisePrototypeThen: Wb,
  Symbol: Wl
} = dt, Un = Wl("kEmpty"), _s = Wl("kEof");
function jb(r, a) {
  if (a != null && yr(a, "options"), a?.signal != null && gr(a.signal, "options.signal"), Mb(r) && !Bb(r))
    throw new Fb("stream", r, "must be writable");
  const o = Db(this, r);
  return a != null && a.signal && Lb(a.signal, o), o;
}
function ei(r, a) {
  if (typeof r != "function")
    throw new nn("fn", ["Function", "AsyncFunction"], r);
  a != null && yr(a, "options"), a?.signal != null && gr(a.signal, "options.signal");
  let o = 1;
  return a?.concurrency != null && (o = Nb(a.concurrency)), Ib(o, "concurrency", 1), async function* () {
    var m, w;
    const v = new $l(), b = this, P = [], L = v.signal, N = {
      signal: L
    }, H = () => v.abort();
    a != null && (m = a.signal) !== null && m !== void 0 && m.aborted && H(), a == null || (w = a.signal) === null || w === void 0 || w.addEventListener("abort", H);
    let re, z, G = !1;
    function ve() {
      G = !0;
    }
    async function ce() {
      try {
        for await (let Ce of b) {
          var ue;
          if (G)
            return;
          if (L.aborted)
            throw new Ut();
          try {
            Ce = r(Ce, N);
          } catch (Ge) {
            Ce = ps(Ge);
          }
          Ce !== Un && (typeof ((ue = Ce) === null || ue === void 0 ? void 0 : ue.catch) == "function" && Ce.catch(ve), P.push(Ce), re && (re(), re = null), !G && P.length && P.length >= o && await new hs((Ge) => {
            z = Ge;
          }));
        }
        P.push(_s);
      } catch (Ce) {
        const Ge = ps(Ce);
        Wb(Ge, void 0, ve), P.push(Ge);
      } finally {
        var Q;
        G = !0, re && (re(), re = null), a == null || (Q = a.signal) === null || Q === void 0 || Q.removeEventListener("abort", H);
      }
    }
    ce();
    try {
      for (; ; ) {
        for (; P.length > 0; ) {
          const ue = await P[0];
          if (ue === _s)
            return;
          if (L.aborted)
            throw new Ut();
          ue !== Un && (yield ue), P.shift(), z && (z(), z = null);
        }
        await new hs((ue) => {
          re = ue;
        });
      }
    } finally {
      v.abort(), G = !0, z && (z(), z = null);
    }
  }.call(this);
}
function Gb(r = void 0) {
  return r != null && yr(r, "options"), r?.signal != null && gr(r.signal, "options.signal"), async function* () {
    let o = 0;
    for await (const m of this) {
      var l;
      if (r != null && (l = r.signal) !== null && l !== void 0 && l.aborted)
        throw new Ut({
          cause: r.signal.reason
        });
      yield [o++, m];
    }
  }.call(this);
}
async function jl(r, a = void 0) {
  for await (const o of Ba.call(this, r, a))
    return !0;
  return !1;
}
async function Vb(r, a = void 0) {
  if (typeof r != "function")
    throw new nn("fn", ["Function", "AsyncFunction"], r);
  return !await jl.call(
    this,
    async (...o) => !await r(...o),
    a
  );
}
async function zb(r, a) {
  for await (const o of Ba.call(this, r, a))
    return o;
}
async function Hb(r, a) {
  if (typeof r != "function")
    throw new nn("fn", ["Function", "AsyncFunction"], r);
  async function o(l, m) {
    return await r(l, m), Un;
  }
  for await (const l of ei.call(this, o, a))
    ;
}
function Ba(r, a) {
  if (typeof r != "function")
    throw new nn("fn", ["Function", "AsyncFunction"], r);
  async function o(l, m) {
    return await r(l, m) ? l : Un;
  }
  return ei.call(this, o, a);
}
class Kb extends Rb {
  constructor() {
    super("reduce"), this.message = "Reduce of an empty stream requires an initial value";
  }
}
async function Xb(r, a, o) {
  var l;
  if (typeof r != "function")
    throw new nn("reducer", ["Function", "AsyncFunction"], r);
  o != null && yr(o, "options"), o?.signal != null && gr(o.signal, "options.signal");
  let m = arguments.length > 1;
  if (o != null && (l = o.signal) !== null && l !== void 0 && l.aborted) {
    const L = new Ut(void 0, {
      cause: o.signal.reason
    });
    throw this.once("error", () => {
    }), await Pb(this.destroy(L)), L;
  }
  const w = new $l(), v = w.signal;
  if (o != null && o.signal) {
    const L = {
      once: !0,
      [kb]: this
    };
    o.signal.addEventListener("abort", () => w.abort(), L);
  }
  let b = !1;
  try {
    for await (const L of this) {
      var P;
      if (b = !0, o != null && (P = o.signal) !== null && P !== void 0 && P.aborted)
        throw new Ut();
      m ? a = await r(a, L, {
        signal: v
      }) : (a = L, m = !0);
    }
    if (!b && !m)
      throw new Kb();
  } finally {
    w.abort();
  }
  return a;
}
async function Yb(r) {
  r != null && yr(r, "options"), r?.signal != null && gr(r.signal, "options.signal");
  const a = [];
  for await (const l of this) {
    var o;
    if (r != null && (o = r.signal) !== null && o !== void 0 && o.aborted)
      throw new Ut(void 0, {
        cause: r.signal.reason
      });
    Ob(a, l);
  }
  return a;
}
function Zb(r, a) {
  const o = ei.call(this, r, a);
  return async function* () {
    for await (const m of o)
      yield* m;
  }.call(this);
}
function Gl(r) {
  if (r = Ub(r), $b(r))
    return 0;
  if (r < 0)
    throw new Ab("number", ">= 0", r);
  return r;
}
function qb(r, a = void 0) {
  return a != null && yr(a, "options"), a?.signal != null && gr(a.signal, "options.signal"), r = Gl(r), async function* () {
    var l;
    if (a != null && (l = a.signal) !== null && l !== void 0 && l.aborted)
      throw new Ut();
    for await (const w of this) {
      var m;
      if (a != null && (m = a.signal) !== null && m !== void 0 && m.aborted)
        throw new Ut();
      r-- <= 0 && (yield w);
    }
  }.call(this);
}
function Qb(r, a = void 0) {
  return a != null && yr(a, "options"), a?.signal != null && gr(a.signal, "options.signal"), r = Gl(r), async function* () {
    var l;
    if (a != null && (l = a.signal) !== null && l !== void 0 && l.aborted)
      throw new Ut();
    for await (const w of this) {
      var m;
      if (a != null && (m = a.signal) !== null && m !== void 0 && m.aborted)
        throw new Ut();
      if (r-- > 0)
        yield w;
      else
        return;
    }
  }.call(this);
}
va.streamReturningOperators = {
  asIndexedPairs: Gb,
  drop: qb,
  filter: Ba,
  flatMap: Zb,
  map: ei,
  take: Qb,
  compose: jb
};
va.promiseReturningOperators = {
  every: Vb,
  forEach: Hb,
  reduce: Xb,
  toArray: Yb,
  some: jl,
  find: zb
};
var Qi, bs;
function Vl() {
  if (bs)
    return Qi;
  bs = 1;
  const { ArrayPrototypePop: r, Promise: a } = dt, { isIterable: o, isNodeStream: l, isWebStream: m } = Zt, { pipelineImpl: w } = La, { finished: v } = rr;
  zl();
  function b(...P) {
    return new a((L, N) => {
      let H, re;
      const z = P[P.length - 1];
      if (z && typeof z == "object" && !l(z) && !o(z) && !m(z)) {
        const G = r(P);
        H = G.signal, re = G.end;
      }
      w(
        P,
        (G, ve) => {
          G ? N(G) : L(ve);
        },
        {
          signal: H,
          end: re
        }
      );
    });
  }
  return Qi = {
    finished: v,
    pipeline: b
  }, Qi;
}
var ms;
function zl() {
  if (ms)
    return Li.exports;
  ms = 1;
  const { Buffer: r } = tr, { ObjectDefineProperty: a, ObjectKeys: o, ReflectApply: l } = dt, {
    promisify: { custom: m }
  } = Xt, { streamReturningOperators: w, promiseReturningOperators: v } = va, {
    codes: { ERR_ILLEGAL_CONSTRUCTOR: b }
  } = Et, P = Ul, { pipeline: L } = La, { destroyer: N } = Or, H = rr, re = Vl(), z = Zt, G = Li.exports = Aa.Stream;
  G.isDisturbed = z.isDisturbed, G.isErrored = z.isErrored, G.isReadable = z.isReadable, G.Readable = Jn();
  for (const ce of o(w)) {
    let Q = function(...Ce) {
      if (new.target)
        throw b();
      return G.Readable.from(l(ue, this, Ce));
    };
    const ue = w[ce];
    a(Q, "name", {
      __proto__: null,
      value: ue.name
    }), a(Q, "length", {
      __proto__: null,
      value: ue.length
    }), a(G.Readable.prototype, ce, {
      __proto__: null,
      value: Q,
      enumerable: !1,
      configurable: !0,
      writable: !0
    });
  }
  for (const ce of o(v)) {
    let Q = function(...Ce) {
      if (new.target)
        throw b();
      return l(ue, this, Ce);
    };
    const ue = v[ce];
    a(Q, "name", {
      __proto__: null,
      value: ue.name
    }), a(Q, "length", {
      __proto__: null,
      value: ue.length
    }), a(G.Readable.prototype, ce, {
      __proto__: null,
      value: Q,
      enumerable: !1,
      configurable: !0,
      writable: !0
    });
  }
  G.Writable = Dl(), G.Duplex = Ht(), G.Transform = Bl, G.PassThrough = Ol, G.pipeline = L;
  const { addAbortSignal: ve } = Qn;
  return G.addAbortSignal = ve, G.finished = H, G.destroy = N, G.compose = P, a(G, "promises", {
    __proto__: null,
    configurable: !0,
    enumerable: !0,
    get() {
      return re;
    }
  }), a(L, m, {
    __proto__: null,
    enumerable: !0,
    get() {
      return re.pipeline;
    }
  }), a(H, m, {
    __proto__: null,
    enumerable: !0,
    get() {
      return re.finished;
    }
  }), G.Stream = G, G._isUint8Array = function(ue) {
    return ue instanceof Uint8Array;
  }, G._uint8ArrayToBuffer = function(ue) {
    return r.from(ue.buffer, ue.byteOffset, ue.byteLength);
  }, Li.exports;
}
(function(r) {
  const a = zl(), o = Vl(), l = a.Readable.destroy;
  r.exports = a.Readable, r.exports._uint8ArrayToBuffer = a._uint8ArrayToBuffer, r.exports._isUint8Array = a._isUint8Array, r.exports.isDisturbed = a.isDisturbed, r.exports.isErrored = a.isErrored, r.exports.isReadable = a.isReadable, r.exports.Readable = a.Readable, r.exports.Writable = a.Writable, r.exports.Duplex = a.Duplex, r.exports.Transform = a.Transform, r.exports.PassThrough = a.PassThrough, r.exports.addAbortSignal = a.addAbortSignal, r.exports.finished = a.finished, r.exports.destroy = a.destroy, r.exports.destroy = l, r.exports.pipeline = a.pipeline, r.exports.compose = a.compose, Object.defineProperty(a, "promises", {
    configurable: !0,
    enumerable: !0,
    get() {
      return o;
    }
  }), r.exports.Stream = a.Stream, r.exports.default = r.exports;
})(Ws);
var Ma = Ws.exports;
class Jb {
  constructor(a) {
    te(this, "_module");
    this._module = a;
  }
  allocate(a) {
    const o = this._module.canvas.getContext("webgl2"), l = o.createTexture();
    o.bindTexture(o.TEXTURE_2D, l), o.texParameteri(o.TEXTURE_2D, o.TEXTURE_MIN_FILTER, o.NEAREST), o.texParameteri(o.TEXTURE_2D, o.TEXTURE_MAG_FILTER, o.LINEAR), a && o.texImage2D(o.TEXTURE_2D, 0, o.RGBA, o.RGBA, o.UNSIGNED_BYTE, a), o.bindTexture(o.TEXTURE_2D, null);
    const m = this._module.GL.getNewId(this._module.GL.textures);
    return this._module.GL.textures[m] = l, { id: m };
  }
  release(a) {
    const o = typeof a == "number" ? a : a.id;
    this._module.canvas.getContext("webgl2").deleteTexture(this._module.GL.textures[o]), this._module.GL.textures[o] = null;
  }
}
class em {
  constructor(a) {
    te(this, "_module");
    this._module = a;
  }
  allocate(a) {
    const o = this._module._malloc(a);
    return {
      buffer: () => this._module.HEAPU8.buffer,
      byteOffset: o,
      byteLength: a
    };
  }
  release(a) {
    const o = typeof a == "number" ? a : a.byteOffset;
    this._module._free(o);
  }
}
async function Hl(r, a) {
  let o = new em(r), l = new Jb(r);
  const m = { width: a.displayWidth, height: a.displayHeight }, w = o.allocate(a.allocationSize({ rect: m })), v = a instanceof Jr ? w : new DataView(w.buffer(), w.byteOffset, w.byteLength), b = a instanceof Jr ? a.texture ? l.allocate(a.texture).id : 0 : (
    // TODO
    // @ts-ignore
    l.allocate(a).id
  ), P = a.horizontalFlip, L = (re) => {
    switch (re) {
      case 0:
        return r.CameraOrientation.DEG_0;
      case 90:
        return r.CameraOrientation.DEG_90;
      case 180:
        return r.CameraOrientation.DEG_180;
      case 270:
        return r.CameraOrientation.DEG_270;
    }
  }, N = L(a.orientation), H = L(a.textureOrientation);
  switch (a.format) {
    case "RGB":
    case "RGBA":
    case "BGR":
    case "BGRA":
      const re = a.format;
      return a.copyTo(v).then(
        () => r.FrameData.makeFromBpc8(
          b,
          H,
          w.byteOffset,
          () => {
            o.release(w), l.release(b);
          },
          m.width,
          m.height,
          N,
          r.PixelFormat[re],
          P,
          0
        )
      );
    case "NV12":
      return a.copyTo(v).then(
        (z) => r.FrameData.makeFromYuvNV12(
          b,
          H,
          w.byteOffset + z[0].offset,
          w.byteOffset + z[1].offset,
          () => {
            o.release(w), l.release(b);
          },
          m.width,
          m.height,
          N,
          P,
          0
        )
      );
    case "I420":
      return a.copyTo(v).then(
        (z) => r.FrameData.makeFromYuvI420(
          b,
          H,
          w.byteOffset + z[0].offset,
          w.byteOffset + z[1].offset,
          w.byteOffset + z[2].offset,
          () => {
            o.release(w), l.release(b);
          },
          m.width,
          m.height,
          N,
          P,
          0
        )
      );
    default:
      throw new Error("Unknown video frame format");
  }
}
const hr = class hr extends en {
  constructor(o, l) {
    super();
    te(this, "readable");
    te(this, "_sdk");
    te(this, "fps", 30);
    this._sdk = o, this.readable = new Ma.Readable({
      read: async () => {
        const m = ma(hr.PRODUCED_EVENT), { done: w, value: v } = await l.next(this.fps), b = ga(m);
        if (w) {
          this.readable.push(null), this.dispatchEvent(new CustomEvent(hr.EMPTIED_EVENT));
          return;
        }
        if (this.readable.destroyed) {
          v.close();
          return;
        }
        const P = v, L = Hl(this._sdk, P);
        this.readable.push({ frame: P, frameDataPromise: L }), this.dispatchEvent(new CustomEvent(hr.PRODUCED_EVENT, { detail: b }));
      },
      objectMode: !0,
      highWaterMark: 1
    });
  }
  pipe(o) {
    return this.readable.pipe(o);
  }
  unpipe() {
    return this.readable.unpipe();
  }
  destroy() {
    this.removeAllEventListeners(), this.readable.unpipe(), this.readable.destroy();
  }
};
te(hr, "EMPTIED_EVENT", "emptied"), te(hr, "PRODUCED_EVENT", "produced");
let dr = hr;
const Zr = class Zr extends en {
  constructor(o, l, m, w) {
    super();
    te(this, "_sdk");
    te(this, "_effectPlayer");
    te(this, "_processor");
    te(this, "_lastFrame", null);
    te(this, "transform");
    this._sdk = o, this._effectPlayer = l;
    const v = this._sdk.ProcessorConfiguration.create();
    switch (m) {
      case "image":
        v.setUseOfflineMode(!0), v.setUseFutureFilter(!1), v.setUseFutureInterpolate(!1);
        break;
      case "video":
        v.setUseOfflineMode(!1), v.setUseFutureFilter(!1), v.setUseFutureInterpolate(!1);
        break;
      case "stream":
      default:
        v.setUseOfflineMode(!1), v.setUseFutureFilter(w.useFutureFilter), v.setUseFutureInterpolate(w.useFutureInterpolate);
        break;
    }
    this._processor = m === "image" ? this._sdk.FrameProcessor.createPhotoProcessor(v) : this._sdk.FrameProcessor.createRealtimeProcessor(
      this._sdk.RealtimeProcessorMode.SYNC,
      v
    ), v.delete(), this._effectPlayer.setFrameProcessor(this._processor), this.transform = new Ma.Transform({
      transform: async ({ frame: b, frameDataPromise: P }, L, N) => {
        this._lastFrame?.close(), this._lastFrame = b;
        const H = await P;
        if (this.transform.destroyed) {
          H.delete();
          return;
        }
        const re = this._process(H);
        this.transform.push({
          frame: {
            width: b.displayWidth,
            height: b.displayHeight,
            orientation: b.orientation,
            frameTimestamp: b.frameTimestamp
          },
          result: re
        }), N();
      },
      flush: (b) => {
      },
      objectMode: !0,
      highWaterMark: 1
    });
  }
  _process(o) {
    const l = ma(Zr.PROCESSED_EVENT), m = (this._processor.push(o), this._processor.pop()), w = ga(l);
    return o.delete(), this.dispatchEvent(new CustomEvent(Zr.PROCESSED_EVENT, { detail: w })), m;
  }
  async rerun() {
    if (!this._lastFrame || this.transform.destroyed)
      return !1;
    const o = {
      width: this._lastFrame.displayWidth,
      height: this._lastFrame.displayHeight,
      orientation: this._lastFrame.orientation,
      frameTimestamp: this._lastFrame.frameTimestamp
    }, l = await Hl(this._sdk, this._lastFrame);
    if (this.transform.destroyed)
      return l.delete(), !1;
    const m = this._process(l);
    return this.transform.push({
      frame: o,
      result: m
    }), !0;
  }
  pipe(o) {
    return this.transform.pipe(o);
  }
  unpipe() {
    return this.transform.unpipe();
  }
  destroy() {
    this.removeAllEventListeners(), this._processor.delete(), this._lastFrame && (this._lastFrame.close(), this._lastFrame = null), this.transform.unpipe(), this.transform.destroy();
  }
};
te(Zr, "PROCESSED_EVENT", "processed");
let Xr = Zr;
const tm = typeof devicePixelRatio < "u" ? devicePixelRatio : 1, qr = class qr extends en {
  constructor(o, l, m = tm) {
    super();
    te(this, "writable");
    te(this, "fps", 30);
    te(this, "_sdk");
    te(this, "_effectPlayer");
    te(this, "_effectManager");
    te(this, "_lastResult", null);
    te(this, "_preferences");
    te(this, "_width", 0);
    te(this, "_height", 0);
    te(this, "_then", 0);
    this._sdk = o, this._effectPlayer = l, this._effectManager = l.effectManager(), this._preferences = { devicePixelRatio: m }, this.writable = new Ma.Writable({
      write: async (w, v, b) => {
        this._lastResult?.result.delete(), this._lastResult = w, typeof document < "u" && await new Promise(Qr), this._render(w), b();
      },
      objectMode: !0
    });
  }
  get frameSize() {
    return {
      width: this._width,
      height: this._height
    };
  }
  get renderSize() {
    return {
      width: this._sdk.canvas.width,
      height: this._sdk.canvas.height
    };
  }
  updateSurfaceSize() {
    this._width = this._height = 0;
  }
  _render({ frame: o, result: l }) {
    if (l.isDeleted())
      return;
    const m = l.frameData, { width: w, height: v } = (() => o.orientation == 90 || o.orientation == 270 ? { width: o.height, height: o.width } : { width: o.width, height: o.height })();
    if (this._width !== w || this._height !== v) {
      this._width = w, this._height = v;
      const { newWidth: N, newHeight: H } = rm(
        w,
        v,
        this._preferences.devicePixelRatio
      );
      this._sdk.setCanvasSize(N, H), this._effectManager.setEffectSize(N, H), this._effectPlayer.surfaceChanged(N, H);
    }
    const b = ma(qr.RENDERED_EVENT);
    this._effectPlayer.drawWithExternalFrameData(m), m.delete();
    const P = o.frameTimestamp, L = ga(b);
    this._sdk.ctx.bindFramebuffer(this._sdk.ctx.READ_FRAMEBUFFER, null), this.dispatchEvent(
      new CustomEvent(qr.RENDERED_EVENT, { detail: { ...L, frameTimestamp: P } })
    );
  }
  async rerun() {
    if (!this._lastResult)
      return !1;
    let o = 0;
    const l = this._then, m = 1e3 / this.fps, w = 0.1 * m;
    for (; (o = await new Promise(Qr)) - l < m - w; )
      ;
    return this._then = o, this._render(this._lastResult), !0;
  }
  destroy() {
    this.removeAllEventListeners(), this._effectManager.delete(), this._lastResult && (this._lastResult.result.delete(), this._lastResult = null), this.writable.end(), this.writable.destroy();
  }
};
te(qr, "RENDERED_EVENT", "rendered");
let Yr = qr;
function rm(r, a, o) {
  if (!("screen" in globalThis))
    return { newWidth: r * o, newHeight: a * o };
  const l = Math.round(self.devicePixelRatio), [m, w] = [screen.width * l, screen.height * l], v = Math.max(1, m / r), b = Math.max(1, w / a), P = Math.max(v, b);
  o = Math.min(o, P);
  const L = r * o, N = a * o;
  return { newWidth: L, newHeight: N };
}
const er = class er extends en {
  constructor(o, l, m) {
    super();
    te(this, "_sdk");
    te(this, "_effectPlayer");
    te(this, "_state", gt.Paused);
    te(this, "_producer");
    te(this, "_processor");
    te(this, "_renderer");
    te(this, "_preferences", {
      fps: 30,
      idleOnEmpty: !0,
      useFutureFilter: !0,
      useFutureInterpolate: !1
    });
    this._sdk = o, this._effectPlayer = l, this._preferences.useFutureFilter = m.useFutureFilter, this._preferences.useFutureInterpolate = m.useFutureInterpolate, this._producer = new dr(o, /* @__PURE__ */ async function* () {
    }()), this._processor = new Xr(
      o,
      l,
      "stream",
      this._preferences
    ), this._renderer = new Yr(o, l, m.devicePixelRatio), this._renderer.addEventListener(
      Yr.RENDERED_EVENT,
      ({ detail: w }) => this.dispatchEvent(new CustomEvent(er.FRAME_RENDERED_EVENT, { detail: w }))
    );
  }
  get state() {
    return this._state;
  }
  get frameSize() {
    return this._renderer.frameSize;
  }
  get preferences() {
    return this._preferences;
  }
  /** Changes the pipeline frames generator */
  use(o, l) {
    const m = this._sdk, w = this._effectPlayer;
    this._producer.destroy(), this._processor.destroy(), this._producer = new dr(m, o[Symbol.asyncIterator](l)), this._producer.addEventListener(
      dr.PRODUCED_EVENT,
      ({ detail: v }) => this.dispatchEvent(new CustomEvent(er.FRAME_RECEIVED_EVENT, { detail: v }))
    ), this._processor = new Xr(
      m,
      w,
      o.kind,
      this._preferences
    ), this._processor.addEventListener(
      Xr.PROCESSED_EVENT,
      ({ detail: v }) => this.dispatchEvent(new CustomEvent(er.FRAME_PROCESSED_EVENT, { detail: v }))
    ), this._producer.addEventListener(dr.EMPTIED_EVENT, () => this._state = gt.Idle, {
      once: !0
    }), this._producer.addEventListener(
      dr.EMPTIED_EVENT,
      () => {
        this._renderer.addEventListener(
          Yr.RENDERED_EVENT,
          async () => {
            for (; this._state === gt.Idle && !this._preferences.idleOnEmpty; )
              if (!await this._renderer.rerun())
                return;
          },
          { once: !0 }
        );
      },
      { once: !0 }
    ), this._state === gt.Idle && (this._state = gt.Running), this._state === gt.Running && this._producer.pipe(this._processor.transform).pipe(this._renderer.writable);
  }
  /** Runs loop of processing of input frames as well as rendering */
  run({ fps: o = this._preferences.fps, idleOnEmpty: l = !0 }) {
    Object.assign(this._preferences, { fps: o, idleOnEmpty: l }), this._producer.fps = o, this._renderer.fps = o, !(this._state === gt.Running || this._state === gt.Idle) && (this._producer.pipe(this._processor.transform).pipe(this._renderer.writable), this._state = gt.Running);
  }
  /** Runs on-off re-run of the last processing and rendering */
  pause() {
    this._state !== gt.Paused && (this._producer.unpipe(), this._processor.unpipe(), this._state = gt.Paused);
  }
  /** Runs on-off re-run of the last rendering */
  async rerun() {
    this._state === gt.Idle && await this._processor.rerun();
  }
  /** Pauses input‘s frames retrieval, processing and rendering */
  async rerender() {
    this._state === gt.Idle && await this._renderer.rerun();
  }
  /** Cleans up the pipeline resources like received frames, allocated memory and gl resources */
  destroy() {
    this.pause(), this._producer.destroy(), this._processor.destroy(), this._renderer.destroy();
  }
  updateSurfaceSize() {
    this._renderer.updateSurfaceSize();
  }
};
te(er, "FRAME_RECEIVED_EVENT", "framereceived"), te(er, "FRAME_PROCESSED_EVENT", "frameprocessed"), te(er, "FRAME_RENDERED_EVENT", "framerendered");
let kr = er;
class nm {
  /** @internal */
  constructor(a) {
    te(this, "_fd");
    te(this, "_cache", /* @__PURE__ */ new Map());
    this._fd = a;
  }
  get(a) {
    if (Array.isArray(a))
      return a.map((v) => this.get(v));
    const o = a.split("."), l = o.length;
    let m = l, w = this._fd;
    for (let v = !1; !v && m > 0; --m) {
      const b = o.slice(0, m).join(".");
      this._cache.has(b) && (v = !0, w = this._cache.get(b), ++m);
    }
    for (; w != null && m < l; ++m) {
      const v = o[m];
      let b = w[v];
      if (typeof b > "u") {
        const L = "get" + v[0].toUpperCase() + v.slice(1);
        b = w[L];
      }
      if (typeof b > "u" && Ao(w)) {
        const L = parseInt(v);
        isNaN(L) || (b = w.get(L));
      }
      if (typeof b == "function")
        try {
          b = b.apply(w);
        } catch {
          b = void 0;
        }
      const P = o.slice(0, m + 1).join(".");
      if (a === P && Ao(b)) {
        const L = b;
        b = new Array(L.size());
        for (let N = 0, H = L.size(); N < H; ++N)
          b[N] = L.get(N);
      }
      this._cache.set(P, w = b);
    }
    return m === l ? w : void 0;
  }
  /** @hidden */
  addTimestampUs(a) {
    this._fd.addTimestampUs(a);
  }
}
class gs {
  constructor(a) {
    te(this, "_module");
    this._module = a;
  }
  exists(a) {
    try {
      return this._module.FS.lstat(a), !0;
    } catch (o) {
      if (o.errno === 44 || o.code === "ENOENT")
        return !1;
      throw o;
    }
  }
  writeFile(a, o) {
    const l = a.split("/");
    l[0] === "" && l.shift(), l.length > 1 && l.reduce((m, w) => (this.exists(m) || this._module.FS.mkdir(m), `${m}/${w}`)), !(a.endsWith("/") && o.length === 0) && this._module.FS.writeFile(a, o);
  }
}
var im = Object.defineProperty, am = Object.getOwnPropertyDescriptor, om = (r, a, o, l) => {
  for (var m = l > 1 ? void 0 : l ? am(a, o) : a, w = r.length - 1, v; w >= 0; w--)
    (v = r[w]) && (m = (l ? v(a, o, m) : v(m)) || m);
  return l && m && im(a, o, m), m;
};
const sm = {
  useFutureFilter: !0,
  useFutureInterpolate: !1,
  enableAudio: !0,
  logger: console
};
var ut;
const Kl = (ut = class extends en {
  constructor(o, l = {}) {
    super();
    te(this, "_sdk");
    te(this, "_effectPlayer");
    te(this, "_effectManager");
    te(this, "_pipeline");
    te(this, "_input", null);
    te(this, "_inputOptions");
    te(this, "_preferences");
    this._sdk = o, this._preferences = {
      ...sm,
      ...l
    };
    const m = this._sdk.EffectPlayerConfiguration.create(
      this._sdk.canvas.width,
      this._sdk.canvas.height
    );
    m.setAudioEnabled(this._preferences.enableAudio), this._effectPlayer = this._sdk.EffectPlayer.create(m), m.delete(), this._effectManager = this._effectPlayer.effectManager(), this._effectPlayer.surfaceCreated(this._sdk.canvas.width, this._sdk.canvas.height), this._effectPlayer.addFrameDataListenerOverrided((w) => {
      this.dispatchEvent(
        new CustomEvent(ut.FRAME_DATA_EVENT, { detail: new nm(w) })
      );
    }), this._effectManager.addEffectActivatedListener(() => {
      const w = this._effectManager.current();
      this.dispatchEvent(new CustomEvent(ut.EFFECT_ACTIVATED_EVENT, { detail: w }));
    }), this._effectManager.addEffectEventListener(async (w) => {
      w === yp && (await new Promise((v) => Cs(v)), this._pipeline.rerun());
    }), this._pipeline = new kr(
      this._sdk,
      this._effectPlayer,
      this._preferences
    ), this._pipeline.addEventListener(
      kr.FRAME_RECEIVED_EVENT,
      ({ detail: w }) => this.dispatchEvent(new CustomEvent(ut.FRAME_RECEIVED_EVENT, { detail: w }))
    ), this._pipeline.addEventListener(
      kr.FRAME_PROCESSED_EVENT,
      ({ detail: w }) => this.dispatchEvent(new CustomEvent(ut.FRAME_PROCESSED_EVENT, { detail: w }))
    ), this._pipeline.addEventListener(
      kr.FRAME_RENDERED_EVENT,
      ({ detail: w }) => this.dispatchEvent(new CustomEvent(ut.FRAME_RENDERED_EVENT, { detail: w }))
    ), this.canvas.addEventListener("webglcontextlost", async (w) => {
      w.preventDefault(), this._effectPlayer.playbackStop(), this.pause(), this._effectPlayer.surfaceDestroyed();
    }), this.canvas.addEventListener("webglcontextrestored", () => {
      $s(this._sdk.ctx), this._effectPlayer.surfaceCreated(this._sdk.canvas.width, this._sdk.canvas.height), this._pipeline.updateSurfaceSize(), this.play(), this._effectPlayer.playbackPlay();
    }), this.setVolume(0);
  }
  /**
   * Creates {@link Player} instance.
   *
   * See {@link SDKOptions} and {@link PlayerOptions} for all the possible parameters.
   *
   * @example
   * ```ts
   * const player = await Player.create({ clientToken: "xxx-xxx-xxx", devicePixelRatio: 1 })
   * ```
   */
  static async create(o) {
    const l = await vp(o);
    return new this(l, o);
  }
  /**
   * Underlying HTMLCanvasElement
   * @internal
   */
  get canvas() {
    return this._sdk.canvas;
  }
  /**
   * The size of the last rendered frame.
   *
   * May be bigger then {@link Player.canvas} size. See {@link calculateSurfaceSize}
   * @internal
   */
  get frameSize() {
    return this._pipeline.frameSize;
  }
  /** @internal */
  get preferences() {
    return {
      ...this._preferences,
      pauseOnEmpty: this._pipeline.preferences.idleOnEmpty
    };
  }
  get isPlaying() {
    return this._pipeline.state === gt.Running;
  }
  /**
   * Uses the input as frames source
   * @example
   * ```ts
   * player.use(new Webcam())
   * ```
   */
  use(o, l) {
    this._input = o, this._inputOptions = l, this._pipeline.use(o, l);
  }
  /**
   * Adds additional modules like `face_tracker`, `background` and {@link Module | many others} to the Player and makes them available for effects
   * @example
   * ```ts
   * const frx = new Module("/path/to/face_tracker.zip")
   *
   * await player.addModule(frx)
   * ```
   */
  async addModule(...o) {
    await Promise.all(o.map((l) => l._bind({ FS: new gs(this._sdk) })));
  }
  /**
   * Applies an effect to input
   * @example
   * ```ts
   * const octopus = new Effect("/path/to/Octopus.zip")
   *
   * await player.applyEffect(octopus)
   * ```
   */
  async applyEffect(o) {
    const l = this, m = o.name;
    return await o._bind({
      FS: new gs(this._sdk),
      evalJs: this._evalJs.bind(this),
      callJsMethod: this._callJsMethod.bind(this)
    }), new Promise((w) => {
      this.addEventListener(ut.EFFECT_ACTIVATED_EVENT, v, { once: !0 }), this.addEventListener(ut.EFFECT_ACTIVATED_EVENT, b);
      try {
        this._effectManager.load(m);
      } catch (P) {
        this.removeEventListener(ut.EFFECT_ACTIVATED_EVENT, v), this.removeEventListener(ut.EFFECT_ACTIVATED_EVENT, b), o._unbind(), this.clearEffect(), this._preferences.logger.warn?.("The effect was force cleared due to the exception:"), this._preferences.logger.error?.(P);
      }
      function v({ detail: P }) {
        w(P);
      }
      function b({ detail: P }) {
        P.url() !== `/${m}/` && (l.removeEventListener(ut.EFFECT_ACTIVATED_EVENT, b), o._unbind());
      }
    });
  }
  /** Clears effect applied to input */
  async clearEffect() {
    return new Promise((o) => {
      this.addEventListener(ut.EFFECT_ACTIVATED_EVENT, () => o(), { once: !0 }), this._effectManager.load("");
    });
  }
  callJsMethod(o, l = "") {
    return this._callJsMethod(o, l);
  }
  /** Sets effect volume from 0 to 1 */
  setVolume(o) {
    this._effectManager.setEffectVolume(o), this.dispatchEvent(new CustomEvent("volumechange", { detail: o }));
  }
  /**
   * Starts input processing.
   *
   * Accepts playback options object with optional `fps` and `pauseOnEmpty` keys.
   *
   * @example
   * ```ts
   * /// The `fps` playback option persists between invocations:
   *
   * const desiredFps = 25
   *
   * player.play({ fps: desiredFps })
   * player.play() // same as passing `{ fps: desiredFps }`
   * ```
   * @example
   * ```ts
   * /// The `pauseOnEmpty` playback option resets to `true` between invocations:
   *
   * await player.use(new Image(file))
   * player.applyEffect(new Effect("path/to/Spider.zip")) // an effect with animations
   *
   * player.play({ pauseOnEmpty: false })
   * player.play() // same as passing `{ pauseOnEmpty: true }`
   * ```
   */
  play(o = {}) {
    this._input && this.use(this._input, this._inputOptions), this._pipeline.run({
      fps: o.fps,
      idleOnEmpty: o.pauseOnEmpty
    });
  }
  /** Stops input processing */
  pause() {
    this._pipeline.pause();
  }
  /** Destroys the {@link Player} instance, clears all the resources used */
  async destroy() {
    this.pause(), this.removeAllEventListeners(), await this.clearEffect(), this._pipeline.destroy(), this._effectPlayer.surfaceDestroyed(), this._effectManager.delete(), this._effectPlayer.delete();
    for (const o in this)
      o.startsWith("_") && Object.defineProperty(this, o, {
        get() {
          throw new Error("The player is destroyed.");
        },
        set() {
          throw new Error("The player is destroyed.");
        }
      });
  }
  async _evalJs(o) {
    return new Promise(async (l) => {
      const m = this._effectManager.current().evalJsSync(o);
      await this._pipeline.rerender(), l(m);
    });
  }
  /** @deprecated */
  async _callJsMethod(o, l = "") {
    this._effectManager.current().callJsMethod(o, l), await this._pipeline.rerender();
  }
}, /**
 * Triggered when a frame is received from the specified {@link Input}
 * @event
 */
te(ut, "FRAME_RECEIVED_EVENT", "framereceived"), /**
 * Triggered when a frame is processed by underlying neural networks
 * @event
 */
te(ut, "FRAME_PROCESSED_EVENT", "frameprocessed"), /**
 * Triggered when a frame is rendered
 * @event */
te(ut, "FRAME_RENDERED_EVENT", "framerendered"), /**
 * Triggered when a new {@link FrameData} is ready
 * @example
 * ```ts
 * player.addEventListener("framedata", ({ detail: frameData }) => {
 *   const hasFace = frameData.get("frxRecognitionResult.faces.0.hasFace")
 *   if (!hasFace) return
 *
 *   const landmarks = frameData.get("frxRecognitionResult.faces.0.landmarks")
 *   console.log(landmarks)
 * })
 * ```
 * @event
 */
te(ut, "FRAME_DATA_EVENT", "framedata"), /**
 * Triggered when an {@link Effect} is activated
 *
 * Note: By default the {@link Player} starts with an "empty" {@link Effect} applied
 * which does nothing but rendering
 *
 * @event
 */
te(ut, "EFFECT_ACTIVATED_EVENT", "effectactivated"), ut);
om([
  Fs("Please, use Effect.evalJs() instead.")
], Kl.prototype, "callJsMethod", 1);
let Am = Kl;
const ti = (r) => {
  if (!(r && "canvas" in r))
    throw new Error(
      `The "player" must be a Player instance, but "${r}" is received. Make sure you haven't forgot to place "await" before Player.create() call.`
    );
}, pa = /* @__PURE__ */ new WeakMap(), lm = (r, a) => {
  ti(r);
  const o = typeof a == "string" ? document.querySelector(a) : a;
  if (!(o instanceof HTMLElement))
    throw new Error("Target container is not a DOM element");
  if (o instanceof HTMLMediaElement || o instanceof HTMLCanvasElement)
    throw new Error("Target container must be a plain html element like `div`");
  pa.set(o, r), o.appendChild(r.canvas);
  const { pauseOnEmpty: l } = r.preferences;
  r.play({ pauseOnEmpty: l });
}, um = (r) => {
  const a = typeof r == "string" ? document.querySelector(r) : r;
  if (!(a instanceof HTMLElement))
    throw new Error("Target container is not a DOM element");
  const o = pa.get(a);
  o && a.removeChild(o.canvas), pa.delete(a);
}, Im = { render: lm, unmount: um };
class km {
  constructor(a) {
    te(this, "_player");
    ti(a), this._player = a;
  }
  /**
   * @param settings - Output photo settings
   * @returns Snapshot of the current {@link Player} state
   */
  async takePhoto(a) {
    const o = this._player.canvas, { width: l, height: m } = this._player.frameSize, w = fm(o, a?.width ?? l, a?.height ?? m);
    return await new Promise(
      (v, b) => w.toBlob(
        (P) => P ? v(P) : b(new Error("Unexpected error: Unable to create Blob")),
        a?.type ?? "image/jpeg",
        a?.quality
      )
    );
  }
}
const fm = (r, a = r.width, o = r.height) => {
  if (a !== r.width || o !== r.height) {
    const m = cm(a, o);
    return m.getContext("2d").drawImage(r, 0, 0, m.width, m.height), m;
  }
  return r;
}, cm = (r, a) => {
  let o;
  return Rs ? (o = new OffscreenCanvas(r, a), o.toBlob = function(l, m, w) {
    this.convertToBlob({ type: m, quality: w }).then(l).catch((v) => l(null));
  }) : (o = document.createElement("canvas"), o.width = r, o.height = a), o;
}, dm = typeof MediaStream < "u" ? MediaStream : class {
  constructor() {
    throw new Error("The environment does not support MediaStream API");
  }
}, Pr = class Pr extends dm {
  constructor(a) {
    ti(a), super();
    const o = Pr.cache.get(a);
    if (!o || !o.active) {
      let l = a.canvas;
      if (((l.getContext("webgl2") || l.getContext("webgl")).getContextAttributes() || {}).alpha) {
        const v = l, b = (l = document.createElement("canvas")).getContext("2d", {
          alpha: !1
        });
        a.addEventListener("framerendered", () => {
          b.canvas.width = v.width, b.canvas.height = v.height, b.drawImage(v, 0, 0, v.width, v.height);
        });
      }
      l.captureStream().getTracks().forEach((v) => this.addTrack(v)), Pr.cache.set(a, this);
    }
    return Pr.cache.get(a);
  }
  /**
   * @returns
   * Video {@link https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack | MediaStreamTrack}
   * of given index from {@link https://developer.mozilla.org/en-US/docs/Web/API/MediaStream/getVideoTracks | MediaStream.getVideoTracks()} list
   */
  getVideoTrack(a = 0) {
    return this.getVideoTracks()[a];
  }
  /**
   * @returns
   * Audio {@link https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack | MediaStreamTrack}
   * of given index from {@link https://developer.mozilla.org/en-US/docs/Web/API/MediaStream/getAudioTracks | MediaStream.getAudioTracks()} list
   */
  getAudioTrack(a = 0) {
    return this.getAudioTracks()[a];
  }
  /** Stops the capture */
  stop() {
    this.getTracks().forEach((a) => a.stop());
  }
};
te(Pr, "cache", /* @__PURE__ */ new WeakMap());
let ys = Pr;
const hm = typeof MediaRecorder < "u" ? MediaRecorder : class {
  constructor() {
    throw new Error("The environment does not support MediaRecorder API");
  }
};
class Pm extends hm {
  constructor(a, o) {
    ti(a);
    const l = a.canvas.captureStream();
    super(l, o);
  }
  /**
   * Stops video recording
   * @returns The recorder video
   */
  async stop() {
    return new Promise((a, o) => {
      const l = (w) => {
        super.removeEventListener("dataavailable", l), super.removeEventListener("error", m), a(w.data);
      }, m = (w) => {
        super.removeEventListener("dataavailable", l), super.removeEventListener("error", m), o(w);
      };
      super.addEventListener("dataavailable", l), super.addEventListener("error", m), super.stop();
    });
  }
}
const Dm = "1.18.2-1-g8dbd691d3a";
export {
  Im as Dom,
  tp as Effect,
  gs as FS,
  nm as FrameData,
  Bh as Image,
  km as ImageCapture,
  ki as MediaStream,
  ys as MediaStreamCapture,
  Em as Module,
  Am as Player,
  gm as ReadableStream,
  Dm as VERSION,
  Gh as Video,
  Pm as VideoRecorder,
  vm as Webcam,
  vp as createSDK,
  sm as defaultPlayerOptions,
  ea as defaultVideoConstraints,
  jh as defaultVideoOptions,
  Th as isBrowserSupported,
  sp as isSimdSupported,
  _m as timers,
  wm as utils
};
