import instantiate, { BanubaSDK } from '@banuba/sdk';
export { BanubaSDK } from '@banuba/sdk';
import * as _banuba_sdk__types_sdk from '@banuba/sdk/@types/sdk';

/** Web address or data url */
type Url = string

/**
 * Video playback customization options
 * @category Input
 */
declare type VideoOptions = Partial<Pick<HTMLVideoElement, "loop">>;
declare type VideoSource = globalThis.MediaStream | Blob | Url;

/** @category Input */
declare type ImageSource = Blob | Url;

/*
 * docs/decisions/0002-design-input.md
 * docs/decisions/0003-design-input-processing-strategy.md
 * docs/decisions/0005-add-input-crop-resize.md
 */

/**
 * Interface for {@link Player} input
 * @category Input
 */
interface Input extends AsyncIterable<Frame> {
  /**
   * type of the Input:
   *
   * - "image" - a static image, e.g from File or URL
   * - "video" - a prerecorded video, e.g from File or URL
   * - "stream" - a realtime video, from the browser‘s webcam
   * @internal
   */
  readonly kind: "image" | "video" | "stream"

  /**
   * Yields sequence of {@link Frame | frames}
   * @internal
   */
  [Symbol.asyncIterator](options?: InputOptions): AsyncGenerator<Frame, void, unknown>
}

/**
 * Customizes production of {@link Input} frames
 * @category Input
 */
type InputOptions = {
  /**
   * Mirrors the source frames by X axis
   * @example
   * ```ts
   * player.use(
   *  new MediaStream(
   *    await navigator.mediaDevices.getUserMedia({ video: true }),
   *  ),
   *  {
   *    horizontalFlip: true,
   *  },
   * )
   * ```
   */
  horizontalFlip?: boolean
  /**
   * Crops the source frame
   * @example
   * ```ts
   * player.use(
   *  new Webcam(),
   *  {
   *    // renders square frames
   *    crop: (width, height) => [(width - height) / 2, 0, height, height],
   *  },
   * )
   * ```
   */
  crop?: (
    frameWidth: number,
    frameHeight: number,
  ) => [cropX: number, cropY: number, cropWidth: number, cropHeight: number]
  /**
   * Source orientation counterclockwise (default: 0)
   */
  orientation?: Orientation
  /**
   * Source texture orientation (default: same as orientation)
   */
  textureOrientation?: Orientation
}

/** @internal */
type Orientation = 0 | 90 | 180 | 270

/** @internal */
type VisibleRectLike = { width: number; height: number }

/** @internal */
interface Frame extends Partial<VideoFrame> {
  readonly texture: TexImageSource | null
  readonly displayWidth: number
  readonly displayHeight: number
  readonly format: "RGB" | "RGBA" | "BGR" | "BGRA" | "NV12" | "I420" | null

  /** @internal */
  horizontalFlip: boolean

  /** @internal */
  orientation: Orientation

  /** @internal */
  textureOrientation: Orientation

  /** @internal */
  frameTimestamp: number

  /** @returns The number of bytes required to hold the Frame pixels */
  allocationSize(options?: { rect: VisibleRectLike }): number

  /** Copies the Frame pixels to the destination of the specified width and height */
  copyTo(destination: DataView | ArrayBufferHeap): Promise<PlaneLayout[]>

  /** Releases resources held by the Frame */
  close(): void
}

/** @ignore */
type ArrayBufferHeap = {
  buffer: () => ArrayBufferLike
  byteOffset: number
  byteLength: number
}

/** @internal */
type Source$1 = HTMLImageElement | HTMLVideoElement | HTMLCanvasElement

/** @hidden */
interface AsyncIterable<T, TReturn = void, TNext = unknown> {
  [Symbol.asyncIterator](...args: any[]): AsyncGenerator<T, TReturn, TNext>
}

declare type VisibleRect = {
    x: number;
    y: number;
    width: number;
    height: number;
};
declare type Options = {
    visibleRect?: VisibleRect;
    displayWidth?: number;
    displayHeight?: number;
    horizontalFlip?: boolean;
    orientation?: Orientation;
    textureOrientation?: Orientation;
};
declare class HtmlFrame implements Frame {
    private _source;
    private _visibleRect;
    private _deleter;
    horizontalFlip: boolean;
    orientation: Orientation;
    textureOrientation: Orientation;
    frameTimestamp: number;
    constructor(source: Source$1, options?: Partial<Options>, deleter?: Function | null);
    /** @internal */
    get texture(): TexImageSource | null;
    get displayWidth(): number;
    get displayHeight(): number;
    /** Pixel format of the Frame */
    get format(): "RGB" | "RGBA" | null;
    /** @returns The number of bytes required to hold the Frame pixels */
    allocationSize(): number;
    /** Copies the Frame pixels to the destination */
    copyTo(destination: ArrayBufferHeap): Promise<never[]>;
    /** Releases GPU resources held by the Frame */
    close(): void;
}

declare function createCanvas(width?: number, height?: number): HTMLCanvasElement;

/**
 * {@link Player} input from image
 *
 * Supports the same mime-types as [img.src](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#attr-src)
 *
 * Be aware about image resolution. Huge images (like 4K UHD and more) may cause
 * out of memory application crash. In this case scale or crop the image before processing.
 *
 * @category Input
 */
declare class Image implements Input {
    private readonly _src;
    /** @internal */
    readonly kind = "image";
    /**
     * Creates Image input from the given {@link Url}
     * @example
     * ```ts
     * const photo = new Image("https://placekitten.com/200/300")
     * ```
     */
    constructor(source: Url);
    /**
     * Creates Image input from the given {@link https://developer.mozilla.org/en-US/docs/Web/API/Blob | Blob}
     * @example
     * ```ts
     * const file = $("#file-input").files[0] // File is subclass of Blob
     * const photo = new Image(file)
     * ```
     */
    constructor(source: Blob);
    /** @hidden */
    constructor(source: ImageSource);
    /**
     * Yields a single {@link HtmlFrame | frame}
     * @internal
     */
    [Symbol.asyncIterator](options?: InputOptions): AsyncGenerator<HtmlFrame, void, unknown>;
}

/**
 * {@link Player} input from {@link https://developer.mozilla.org/en-US/docs/Web/API/MediaStream/MediaStream | MediaStream}
 * @category Input
 */
declare class MediaStream$1 implements Input {
    private static readonly cache;
    private _stream;
    /** @internal */
    readonly kind = "stream";
    /**
     * Creates MediaStream input from {@link https://developer.mozilla.org/en-US/docs/Web/API/MediaStream/MediaStream | MediaStream}
     * @example
     * ```ts
     * const stream = new MediaStream(
     *  await navigator.mediaDevices.getUserMedia({ video: true })
     * )
     * ```
     */
    constructor(stream: globalThis.MediaStream);
    /**
     * Yields a sequence of {@link Frame | frames}
     * @internal
     */
    [Symbol.asyncIterator](options?: InputOptions): AsyncGenerator<Frame | HtmlFrame, void, unknown>;
    /** Stops underlying media stream */
    stop(): void;
}

/**
 * {@link Player} input from {@link https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream | ReadableStream}
 * @category Input
 */
declare class ReadableStream implements Input {
    private _readable;
    /** @internal */
    readonly kind = "stream";
    /**
     * Creates ReadableStream input from {@link https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream | ReadableStream}
     */
    constructor(readable: globalThis.ReadableStream);
    /**
     * Yields a sequence of {@link Frame | frames}
     * @internal
     */
    [Symbol.asyncIterator](options?: InputOptions): AsyncGenerator<Frame, void, unknown>;
    /** Stops underlying readable stream */
    stop(): void;
}

/** @category Input */
declare const defaultVideoOptions: {
    readonly loop: false;
};
/**
 * {@link Player} input from video
 *
 * Supports the same mime-types as [video.src](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video#attr-src)
 * @category Input
 */
declare class Video implements Input {
    private readonly _src;
    private readonly _options;
    private _video;
    /** @internal */
    readonly kind = "video";
    /**
     * Creates Video input from the given {@link Url}
     * @example
     * ```ts
     * const video = new Video("https://www.youtube.com/watch?v=sv4EWcMs3xE")
     * ```
     */
    constructor(source: Url, options?: VideoOptions);
    /**
     * Creates Video input from the given {@link https://developer.mozilla.org/en-US/docs/Web/API/Blob | Blob}
     * @example
     * ```ts
     * const file = $("#file-input").files[0] // File is subclass of Blob
     * const video = new Image(file, { loop: true })
     * ```
     */
    constructor(source: Blob, options?: VideoOptions);
    /** @internal */
    constructor(source: globalThis.MediaStream, options?: VideoOptions);
    /** @hidden */
    constructor(source: Url | Blob | globalThis.MediaStream, options?: VideoOptions);
    /**
     * Yields a sequence of {@link HtmlFrame | frames}
     * @internal
     */
    [Symbol.asyncIterator](options?: InputOptions): AsyncGenerator<HtmlFrame, void, unknown>;
    /** Stops underlying video */
    stop(): void;
}

declare type Enhancements = {
    denoise: number;
    exposureCompensation: number;
};

/**
 * Default webcam {@link https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamConstraints/video | video constraints} to apply
 * @category Input
 */
declare const defaultVideoConstraints: {
    readonly facingMode: "user";
    readonly width: {
        readonly min: 640;
        readonly ideal: 1280;
        readonly max: 1920;
    };
    readonly height: {
        readonly min: 480;
        readonly ideal: 720;
        readonly max: 1080;
    };
    readonly resizeMode: {
        readonly ideal: "crop-and-scale";
    };
};
/** @internal */
declare type WebcamPreferences = Enhancements;
/**
 * {@link Player} input from webcam video
 * @category Input
 */
declare class Webcam implements Input {
    private _stream;
    private readonly _constraints;
    private readonly _preferences;
    private _enhancer;
    /** @internal */
    readonly kind = "stream";
    /**
     * @param videoConstraints - constraints to be merged with {@link defaultVideoConstraints}
     * and to be passed to {@link https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia | navigator.mediaDevices.getUserMedia()}
     */
    constructor(videoConstraints?: MediaTrackConstraints);
    /**
     * Specifies if the webcam is currently active.
     *
     * The webcam is considered active if it has been started and has not been stopped afterwards
     */
    get active(): boolean;
    /**
     * @param {number} algorithm - denoise algorithm to use
     *  - Pass false or 0 to disabled denoising
     *  - Pass true or 1 to use FSR algorithm
     *  - Pass 2 to use Bilateral algorithm
     * @internal
     */
    denoise(algorithm: 0 | 1 | 2 | boolean): void;
    /**
     * @param {number} coefficient - exposure compensation coefficient in [0, 2] range
     *  - Pass value less than 1 to increase exposure
     *  - Pass value greater than 1 to reduce exposure
     * See the {@link https://fujifilm-dsc.com/en/manual/x-pro2/images/exp_exposure_480.gif | image} for visual example
     * @internal
     */
    setExposureCompensation(coefficient: WebcamPreferences["exposureCompensation"]): void;
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
    start(): Promise<this>;
    /**
     * Yields a sequence of {@link Frame | frames}
     * @internal
     */
    [Symbol.asyncIterator](options?: InputOptions): AsyncGenerator<Frame | HtmlFrame, void, unknown>;
    /** Turns off webcam */
    stop(): void;
}

/**
 * Not designed for public use, use on your own risk
 * @hidden
 */
declare const utils: {
    createVideoElement: (source: VideoSource, options?: Partial<Pick<HTMLVideoElement, "loop">>) => Promise<HTMLVideoElement>;
    createCanvas: typeof createCanvas;
};

declare type Progress = {
    total: number;
    transferred: number;
};
declare type ProgressListener = (progress: Progress) => void;

declare type LoadOptions = {
    onProgress?: ProgressListener;
};
declare type LoadManyOptions = {
    onProgress?: (index: number, ...params: Parameters<ProgressListener>) => ReturnType<ProgressListener>;
};
declare type LoadableSource = Url | Request | Blob;
declare type Source = LoadableSource | Record<string, Uint8Array>;
declare type FS$1 = {
    /** Writes or overwrites file at `filepath` by specified `data`, creates nested directories if they do not exist */
    writeFile(filepath: string, data: Uint8Array): void;
};

declare type Player$6 = {
    FS: FS$1;
    evalJs: (code: string) => Promise<string>;
    /** @deprecated */
    callJsMethod: (methodName: string, methodJSONParams?: string) => void;
};
/**
 * An AR effect, filter or mask
 * @category Effect
 */
declare class Effect {
    /**
     * Creates an effect by preloading it from {@link Url}
     * @example
     * ```ts
     * const octopus = await Effect.preload("/path/to/Octopus.zip")
     * ```
     * @example
     * ```ts
     * // with a progress listener
     * const onProgress = ({ total, transferred }) => {
     *   console.log(`Effect is loaded on ${100 * transferred / total}%`)
     * }
     * const octopus = await Effect.preload("/path/to/Octopus.zip", { onProgress })
     * ```
     */
    static preload(source: Url, options?: LoadOptions): Promise<Effect>;
    /** @hidden */
    static preload(source: LoadableSource, options?: LoadOptions): Promise<Effect>;
    /**
     * Creates an array of effects by preloading them from a list of {@link Url | Urls}
     * @example
     * ```ts
     * const [octopus, policeman] = await Effect.preload(["effects/Octopus.zip", "effects/Policeman.zip"])
     * ```
     * @example
     * ```ts
     * // with a progress listener
     * const onProgress = (effectIndex, { total, transferred }) => {
     *   console.log(`Effect #${effectIndex} is loaded on ${100 * transferred / total}%`)
     * }
     * const [octopus, policeman] = await Effect.preload(
     *  ["effects/Octopus.zip", "effects/Policeman.zip"],
     *  { onProgress },
     * )
     * ```
     */
    static preload(sources: Url[], options?: LoadOptions): Promise<Effect[]>;
    /** @hidden */
    static preload(sources: LoadableSource[], options?: LoadOptions): Promise<Effect[]>;
    /** @internal */
    readonly name: string;
    private _player;
    private readonly _resource;
    /**
     * Creates an effect from {@link Url}
     * @example
     * ```ts
     * const octopus = new Effect("/path/to/Octopus.zip")
     * ```
     */
    constructor(source: Url);
    /**
     * Creates an effect from {@link https://developer.mozilla.org/en-US/docs/Web/API/Request | Request}
     * @example
     * ```ts
     * const octopus = new Effect(new Request(
     *    "/path/to/Octopus.zip",
     *    { headers: { etag: "\"8b13dff520339ba88a610ceb58d4fa6b\"" } },
     * ))
     * ```
     */
    constructor(source: Request);
    /**
     * Creates an effect from {@link https://developer.mozilla.org/en-US/docs/Web/API/Blob | Blob}
     * @example
     * ```ts
     * const file = $("#file-upload").files[0] // File is subclass of Blob
     * const octopus = new Effect(file)
     * ```
     */
    constructor(source: Blob);
    /** @hidden */
    constructor(source: Source);
    /** Loads the effect data */
    protected _load(options?: LoadOptions): Promise<void>;
    /** Loads the effect data, mounts it to the player‘s file system */
    protected _bind(player: Player$6): Promise<void>;
    /** Unmounts the effect data from the previously specified player‘s file system */
    protected _unbind(): void;
    /** Writes the file into the effect */
    /**
     * @example
     * ```ts
     * const makeup = new Effect("/path/to/Makeup.zip")
     * const filename = "nude_makeup.png"
     * const buffer = await fetch("/path/to/${filename}").then(r => r.arrayBuffer())
     *
     * // ...
     *
     * await makeup.writeFile(filename, buffer)
     * await makeup.evalJs(`Makeup.set("${filename}")`)
     * ```
     */
    writeFile(path: string, array: ArrayLike<number> | ArrayBufferLike): void;
    /**
     * @example
     * ```ts
     * const makeup = new Effect("/path/to/Makeup.zip")
     * const filename = "nude_makeup.png"
     * const file = $("#file-upload").files[0]
     *
     * // ...
     *
     * await makeup.writeFile(filename, file)
     * await makeup.evalJs(`Makeup.set("${filename}")`)
     * ```
     */
    writeFile(path: string, blob: Blob): Promise<void>;
    /**
     * Evaluates JavaScript method in context of the effect.
     *
     * The method won't evaluate if the effect is not applied to a player
     * @deprecated Use {@link Effect.evalJs} instead.
     *
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
     * makeup.callJsMethod("Eyes.color", JSON.stringify(electricBlueColor))
     * ```
     */
    callJsMethod(methodName: string, methodJSONParams?: string): void;
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
    evalJs(code: string): Promise<string | undefined>;
}

declare type Player$5 = {
    FS: FS$1;
};
/**
 * Auxiliary SDK module that enhances the {@link Player} with a feature like:
 * - `face_tracker.zip` - [face tracking](../../../tutorials/capabilities/glossary#frx-face-tracking) module, required for all the effects relying on face position
 * - `background.zip` - [background segmentation](../../../tutorials/capabilities/glossary#background-separation) module, required for all the [Background](../../../effects/prefabs/top_level#background) effects
 * - `hair.zip` - [hair segmentation](../../../tutorials/capabilities/glossary#hair-segmentation) module
 * - `lips.zip` - [lips segmentation](../../../tutorials/capabilities/glossary#lips-segmentation) module
 * - `eyes.zip` - [eyes segmentation](../../../tutorials/capabilities/glossary#eye-segmentation) module
 * - `skin.zip` - [face and neck skin](../../../tutorials/capabilities/glossary#skin-segmentation) segmentation module
 * - `body.zip` - [body segmentation](../../../tutorials/capabilities/glossary#full-body-segmentation) module, opposite to background segmentation
 * - `hands.zip` - [hands segmentation](../../../effects/guides/hand_ar_nails) module
 * @category Player
 */
declare class Module {
    /**
     * Creates a module by preloading it from {@link Url}
     * @example
     * ```ts
     * const frx = await Module.preload("/path/to/face_tracker.zip")
     * ```
     * @example
     * ```ts
     * // with a progress listener
     * const onProgress = ({ total, transferred }) => {
     *   console.log(`Module is loaded on ${100 * transferred / total}%`)
     * }
     * const frx = await Module.preload("/path/to/face_tracker.zip", { onProgress })
     * ```
     */
    static preload(source: Url, options?: LoadOptions): Promise<Module>;
    /** @hidden */
    static preload(source: LoadableSource, options?: LoadOptions): Promise<Module>;
    /**
     * Creates an array of modules by preloading them from a list of {@link Url | Urls}
     * @example
     * ```ts
     * const [frx, background] = await Module.preload(["modules/face_tracker.zip", "modules/background.zip"])
     * ```
     * @example
     * ```ts
     * // with a progress listener
     * const onProgress = (effectIndex, { total, transferred }) => {
     *   console.log(`Module #${effectIndex} is loaded on ${100 * transferred / total}%`)
     * }
     * const [frx, background] = await Module.preload(
     *  ["effects/face_tracker.zip", "effects/background.zip"],
     *  { onProgress },
     * )
     * ```
     */
    static preload(sources: Url[], options?: LoadOptions): Promise<Module[]>;
    /** @hidden */
    static preload(sources: LoadableSource[], options?: LoadOptions): Promise<Module[]>;
    private readonly _resource;
    /**
     * Creates a module from {@link Url}
     * @example
     * ```ts
     * const frx = new Module("/path/to/face_tracker.zip.zip")
     * ```
     */
    constructor(source: Url);
    /**
     * Creates a module from {@link https://developer.mozilla.org/en-US/docs/Web/API/Request | Request}
     * @example
     * ```ts
     * const frx = new Module(new Request(
     *    "/path/to/face_tracker.zip",
     *    { headers: { etag: "\"a610ceb58d4fa6b8b13dff520339ba88\"" } },
     * ))
     * ```
     */
    constructor(source: Request);
    /**
     * Creates a module from {@link https://developer.mozilla.org/en-US/docs/Web/API/Blob | Blob}
     * @example
     * ```ts
     * const file = $("#file-upload").files[0] // File is subclass of Blob
     * const frx = new Module(file)
     * ```
     */
    constructor(source: Blob);
    /** @hidden */
    constructor(source: Source);
    /** Loads the module data */
    protected _load(options?: LoadOptions): Promise<void>;
    /** Loads the module data, mounts it to the player's file system */
    protected _bind(player: Player$5): Promise<void>;
}

interface Logger {
    debug?(...data: any[]): void;
    info?(...data: any[]): void;
    warn?(...data: any[]): void;
    error?(...data: any[]): void;
}

/**
 * An utility function to determine SIMD support by the browser.
 *
 * See the {https://docs.banuba.com/far-sdk/tutorials/development/guides/optimization#speed-up-webar-sdk-on-modern-browsers | Speed up WebAR SDK for modern browsers} guide for details
 */
declare const isSimdSupported: () => Promise<boolean>;
declare type BanubaSDKBinary = "BanubaSDK.data" | "BanubaSDK.wasm" | "BanubaSDK.simd.wasm";
declare type BanubaSDKBinaryFileLocator = string | ((fileName: BanubaSDKBinary) => string) | Record<BanubaSDKBinary, string> | Record<Exclude<BanubaSDKBinary, "BanubaSDK.simd.wasm">, string>;

declare type SDK = Awaited<ReturnType<typeof instantiate>>;
declare type SDKOptions = {
    /** Banuba Client token */
    clientToken: string;
    /**
     * Ordinary you won't use the option
     *
     * Overrides internal `canvas` element used for WebGL rendering
     * @default HTMLCanvasElement
     */
    canvas?: HTMLCanvasElement;
    /**
     * Where to find `.wasm` and `.data` files relative to the page running the script
     * @example
     * ```ts
     * const player = await Player.create({
     *    clientToken: "xxx-xxx-xxx",
     *    locateFile: "static/webar/",
     * })
     * ```
     * @example
     * ```ts
     * const player = await Player.create({
     *    clientToken: "xxx-xxx-xxx",
     *    locateFile: (fileName) => "static/webar/" + fileName,
     * })
     * ```
     * @example
     * ```ts
     * const player = await Player.create({
     *    clientToken: "xxx-xxx-xxx",
     *    locateFile: {
     *      "BanubaSDK.data": "static/webar/BanubaSDK.data",
     *      "BanubaSDK.wasm": "static/webar/BanubaSDK.wasm",
     *      "BanubaSDK.simd.wasm": "static/webar/BanubaSDK.simd.wasm", // .simd.wasm is optional
     *   },
     * })
     * ```
     */
    locateFile?: BanubaSDKBinaryFileLocator;
    /**
     * A custom logger instance, pass `{}` to suppress all outputs
     * @default { warn: console.warn, error: console.error }
     */
    logger?: Logger;
};
/** @internal */
declare function createSDK({ clientToken, locateFile: fileLocator, canvas, logger, ...rest }: SDKOptions): Promise<EmscriptenModuleOptions & EmscriptenModule & typeof _banuba_sdk__types_sdk>;

declare const requestAnimationFrame: (callback: FrameRequestCallback) => number;
declare const setTimeout: (callback: (...args: any[]) => void, timeout?: number) => number;
declare const nextTick: (callback: () => void) => Promise<void>;
declare const timers: {
    requestAnimationFrame: (callback: FrameRequestCallback) => number;
    setTimeout: (callback: (...args: any[]) => void, timeout?: number) => number;
};

declare const index_requestAnimationFrame: typeof requestAnimationFrame;
declare const index_setTimeout: typeof setTimeout;
declare const index_nextTick: typeof nextTick;
declare const index_timers: typeof timers;
declare namespace index {
  export {
    index_requestAnimationFrame as requestAnimationFrame,
    index_setTimeout as setTimeout,
    index_nextTick as nextTick,
    index_timers as timers,
  };
}

/** @internal */
declare namespace EventEmitter {
    type EventMap = Record<string, any>;
    type EventKey<T extends EventMap> = string & keyof T;
    type EventListener<T> = (event: CustomEvent<T>) => void;
}
/** @internal */
declare class EventEmitter<M extends EventEmitter.EventMap> {
    private _emitter;
    addEventListener<E extends EventEmitter.EventKey<M>>(event: E, listener: EventEmitter.EventListener<M[E]>, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<E extends EventEmitter.EventKey<M>>(event: E, listener: EventEmitter.EventListener<M[E]>, options?: boolean | EventListenerOptions): void;
    dispatchEvent<E extends CustomEvent<M[keyof M]>>(event: E): boolean;
    removeAllEventListeners(): void;
}

/** An utility function to determine if the current browser is capable of running WebAR SDK */
declare const isBrowserSupported: () => boolean;

/** @category Player */
declare class FrameData {
    private readonly _fd;
    private readonly _cache;
    /** @internal */
    constructor(fd: BanubaSDK.FrameData);
    /**
     * @example
     * ```ts
     * // Requires an effect with FaceTracking feature enabled to be fulfilled
     * // @type {boolean | undefined}
     * const isFace0Detected = frameData.get("frxRecognitionResult.faces.0.hasFace")
     * // Requires an effect with FaceTracking feature enabled to be fulfilled
     * // @type {number[] | undefined}
     * const face0Landmarks = frameData.get("frxRecognitionResult.faces.0.landmarks")
     * // Requires an effect with Ruler feature enabled to be fulfilled
     * // @type {number | undefined}
     * const distanceToFace = frameData.get("ruler")
     * ```
     */
    get<T extends Path>(path: T): any;
    /**
     * @example
     * ```ts
     * // Array of nose landmarks (positions 28, 29, 30, 31)
     * // Requires an effect with FaceTracking enabled to be fulfilled
     * // @type {[number, number, number, number] | undefined}
     * const face0NoseLandmarks = frameData.get([28, 29, 30, 31].map((idx) => `frxRecognitionResult.faces.0.landmarks.${idx}`))
     * ```
     */
    get<T extends Path>(paths: T[]): any[];
    /** @hidden */
    addTimestampUs(timestamp: number): void;
}
declare type Path = `fullImgTransform` | `fullImgTransform.${Matrix3x3Index}` | `frxRecognitionResult` | `frxRecognitionResult.faces` | `frxRecognitionResult.faces.${FaceIndex}${FRXFacePaths}` | `frxRecognitionResult.texCoords` | `frxRecognitionResult.texCoords.${number}` | `frxRecognitionResult.triangles` | `frxRecognitionResult.triangles.${number}` | `frxRecognitionResult.transform.basisTransform` | `frxRecognitionResult.transform.basisTransform.${Matrix3x3Index}` | `frxRecognitionResult.transform.fullRoi${Rect}` | `isWearGlasses` | `ruler` | `lightCorrection` | `background${NNPaths}` | `hair${NNPaths}` | `skin${NNPaths}` | `lips${NNPaths}` | `body${NNPaths}` | `lipsShine${NNPaths}` | `lipsShine.vMin` | `lipsShine.vMax` | `eyes${EyesNNPaths}` | `face${NNPaths}` | `faceSkin${NNPaths}`;
declare type Matrix3x3Index = ComputeRange<9>[number];
declare type Matrix4x4Index = ComputeRange<16>[number];
declare type FaceIndex = ComputeRange<10>[number];
declare type LandmarkIndex = ComputeRange<136>[number];
declare type LatentIndex = ComputeRange<36>[number];
declare type FRXFacePaths = `` | `.landmarks` | `.landmarks.${LandmarkIndex}` | `.latents` | `.latents.${LatentIndex}` | `.vertices` | `.vertices.${number}` | `.cameraPosition` | `.cameraPosition.modelViewM` | `.cameraPosition.modelViewM.${Matrix4x4Index}` | `.cameraPosition.projectionM` | `.cameraPosition.projectionM.${Matrix4x4Index}` | `.hasFace` | `.faceRect${Rect}`;
declare type Rect = `` | `.x` | `.y` | `.w` | `.h`;
declare type EyesNNPaths = `` | `.iris` | `.iris.${"left" | "right"}${NNPaths}` | `.corneosclera` | `.corneosclera.${"left" | "right"}${NNPaths}` | `.pupil` | `.pupil.${"left" | "right"}${NNPaths}`;
declare type NNPaths = `` | `.meta` | `.meta${NNMetaPaths}`;
declare type NNMetaPaths = `` | `.width` | `.height` | `.channel` | `.inverse` | `.basisTransform` | `.basisTransform.${number}`;
declare type ComputeRange<N extends number, Result extends Array<unknown> = []> = Result["length"] extends N ? Result : ComputeRange<N, [...Result, Result["length"]]>;

/** High-level FS API over Emscripten‘s low-level {@link https://emscripten.org/docs/api_reference/Filesystem-API.html#id2 | FS API} */
declare class FS {
    private readonly _module;
    constructor(module: FS["_module"]);
    exists(path: string): boolean;
    writeFile(path: string, data: Uint8Array): void;
}

/** @category Player */
declare type PlayerOptions = {
    /**
     * Ordinary you won't use the option
     *
     * Overrides `devicePixelRatio` used for proper rendering on HiDPI devices
     * @default `window.devicePixelRatio`
     */
    devicePixelRatio?: number;
    /**
     * Use future frame to filtrate prediction, improves stability, adds processed frame inconsistency
     * @default true
     */
    useFutureFilter?: boolean;
    /**
     * Use future frame to interpolate prediction, improves performance, adds processed frame inconsistency
     * @default false
     */
    useFutureInterpolate?: boolean;
    /**
     * A custom logger instance, pass `{}` to suppress all outputs
     * @default `window.console`
     * @example
     * ```ts
     * // suppressing `info` and `debug` messages, displaying only `error` and `warn` ones
     * Player.create({
     *   logger {
     *    error: console.error.bind(console),
     *    warn: console.warn.bind(console),
     *   },
     *   // ... other options
     * })
     * ```
     */
    logger?: Logger;
    enableAudio?: boolean;
};
/** @category Player */
declare type PlaybackOptions = {
    /**
     * Maximum render FPS
     * @default 30
     */
    fps?: number;
    /**
     * Should the player pause rendering when the input under processing has emptied.
     * Pass `false` to force the player to continue rendering even after the input has emptied.
     * @default true
     */
    pauseOnEmpty?: boolean;
};

/** @category Player */
declare const defaultPlayerOptions: {
    readonly useFutureFilter: true;
    readonly useFutureInterpolate: false;
    readonly enableAudio: true;
    readonly logger: Console;
};
/** @category Player */
declare type PlayerEventMap = {
    [Player$4.FRAME_RECEIVED_EVENT]: {
        averagedDuration: number;
        instantDuration: number;
    };
    [Player$4.FRAME_PROCESSED_EVENT]: {
        averagedDuration: number;
        instantDuration: number;
    };
    [Player$4.FRAME_RENDERED_EVENT]: {
        averagedDuration: number;
        instantDuration: number;
        frameTimestamp: number;
    };
    [Player$4.FRAME_DATA_EVENT]: FrameData;
    [Player$4.EFFECT_ACTIVATED_EVENT]: BanubaSDK.Effect;
    /** @hidden */
    ["volumechange"]: number;
};
/**
 * High level API over compiled Banuba SDK
 * @category Player
 */
declare class Player$4 extends EventEmitter<PlayerEventMap> {
    /**
     * Triggered when a frame is received from the specified {@link Input}
     * @event
     */
    static readonly FRAME_RECEIVED_EVENT = "framereceived";
    /**
     * Triggered when a frame is processed by underlying neural networks
     * @event
     */
    static readonly FRAME_PROCESSED_EVENT = "frameprocessed";
    /**
     * Triggered when a frame is rendered
     * @event */
    static readonly FRAME_RENDERED_EVENT = "framerendered";
    /**
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
    static readonly FRAME_DATA_EVENT = "framedata";
    /**
     * Triggered when an {@link Effect} is activated
     *
     * Note: By default the {@link Player} starts with an "empty" {@link Effect} applied
     * which does nothing but rendering
     *
     * @event
     */
    static readonly EFFECT_ACTIVATED_EVENT = "effectactivated";
    private readonly _sdk;
    private readonly _effectPlayer;
    private readonly _effectManager;
    private readonly _pipeline;
    private _input;
    private _inputOptions;
    private readonly _preferences;
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
    static create(options: SDKOptions & PlayerOptions): Promise<Player$4>;
    protected constructor(sdk: SDK, options?: PlayerOptions);
    /**
     * Underlying HTMLCanvasElement
     * @internal
     */
    get canvas(): HTMLCanvasElement;
    /**
     * The size of the last rendered frame.
     *
     * May be bigger then {@link Player.canvas} size. See {@link calculateSurfaceSize}
     * @internal
     */
    get frameSize(): {
        width: number;
        height: number;
    };
    /** @internal */
    get preferences(): {
        pauseOnEmpty: boolean;
        logger: Logger;
        useFutureFilter: boolean;
        useFutureInterpolate: boolean;
        enableAudio: boolean;
    };
    get isPlaying(): boolean;
    /**
     * Uses the input as frames source
     * @example
     * ```ts
     * player.use(new Webcam())
     * ```
     */
    use(input: Input, options?: InputOptions): void;
    /**
     * Adds additional modules like `face_tracker`, `background` and {@link Module | many others} to the Player and makes them available for effects
     * @example
     * ```ts
     * const frx = new Module("/path/to/face_tracker.zip")
     *
     * await player.addModule(frx)
     * ```
     */
    addModule(...modules: Module[]): Promise<void>;
    /**
     * Applies an effect to input
     * @example
     * ```ts
     * const octopus = new Effect("/path/to/Octopus.zip")
     *
     * await player.applyEffect(octopus)
     * ```
     */
    applyEffect(effect: Effect): Promise<BanubaSDK.Effect>;
    /** Clears effect applied to input */
    clearEffect(): Promise<void>;
    /**
     * Evaluates JavaScript in context of applied effect.
     *
     * @deprecated Use {@link Effect.evalJs} instead.
     */
    callJsMethod(methodName: string, methodJSONParams?: string): Promise<void>;
    /** Sets effect volume from 0 to 1 */
    setVolume(level: number): void;
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
    play(options?: PlaybackOptions): void;
    /** Stops input processing */
    pause(): void;
    /** Destroys the {@link Player} instance, clears all the resources used */
    destroy(): Promise<void>;
    protected _evalJs(code: string): Promise<string>;
    /** @deprecated */
    protected _callJsMethod(methodName: string, methodJSONParams?: string): Promise<void>;
}
interface Player$4 {
    /** @internal */
    removeAllEventListeners(): void;
    /** @internal */
    dispatchEvent(...args: Parameters<EventEmitter<PlayerEventMap>["dispatchEvent"]>): boolean;
}

declare type Player$3 = Pick<Player$4, "preferences" | "canvas" | "play">;
/** @category Output */
declare const Dom: {
    readonly render: (player: Player$3, container: HTMLElement | string) => void;
    readonly unmount: (container: HTMLElement | string) => void;
};

declare type Player$2 = Pick<Player$4, "canvas" | "frameSize">;
/**
 * Output photo settings
 * @category Output
 */
declare type PhotoSettings = {
    /**
     * Output photo width
     * @default {@link Player}'s input frame width
     */
    width?: number;
    /**
     * Output photo height
     * @default {@link Player}'s input frame height
     */
    height?: number;
    /**
     * Output photo mime-type
     *
     * The mime-type support is platform specific,
     * e.g. "image/webp" is not supported on Safari 15.2.
     * See [toBlob](https://caniuse.com/?search=toBlob) and [toBlob type](https://caniuse.com/mdn-api_htmlcanvaselement_toblob_type_parameter_webp) for details.
     * @default "image/jpeg"
     */
    type?: "image/png" | "image/jpeg" | "image/webp";
    /**
     * Output photo quality
     *
     * The quality support is platform specific,
     * e.g. Safari 15.2 does not support the setting.
     * See [toBlob](https://caniuse.com/?search=toBlob) and [toBlob quality](https://caniuse.com/mdn-api_htmlcanvaselement_toblob_quality_parameter) for mor details.
     * @default 0.92 for "image/jpeg"
     * @default 0.8 for "image/webp"
     */
    quality?: number;
};
/**
 * {@link Player} output to image
 * @category Output
 */
declare class ImageCapture {
    private readonly _player;
    constructor(player: Player$2);
    /**
     * @param settings - Output photo settings
     * @returns Snapshot of the current {@link Player} state
     */
    takePhoto(settings?: PhotoSettings): Promise<Blob>;
}

declare type Player$1 = Pick<Player$4, "canvas" | "addEventListener">;
declare const MediaStreamSSR: {
    new (): MediaStream;
    new (stream: MediaStream): MediaStream;
    new (tracks: MediaStreamTrack[]): MediaStream;
    prototype: MediaStream;
};
/**
 * {@link Player} output to {@link https://developer.mozilla.org/en-US/docs/Web/API/MediaStream/MediaStream | MediaStream}
 *
 * Commonly used for integration with third parties (e.g WebRTC video call SDK)
 *
 * ⚠️ The functionality might not be working on iOS Safari
 *
 * Track {@link https://bugs.webkit.org/show_bug.cgi?id=181663 | the corresponding issue on Webkit Bug Tracker} for a resolution status
 *
 * @category Output
 */
declare class MediaStreamCapture extends MediaStreamSSR {
    private static readonly cache;
    constructor(player: Player$1);
    /**
     * @returns
     * Video {@link https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack | MediaStreamTrack}
     * of given index from {@link https://developer.mozilla.org/en-US/docs/Web/API/MediaStream/getVideoTracks | MediaStream.getVideoTracks()} list
     */
    getVideoTrack(index?: number): MediaStreamVideoTrack;
    /**
     * @returns
     * Audio {@link https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack | MediaStreamTrack}
     * of given index from {@link https://developer.mozilla.org/en-US/docs/Web/API/MediaStream/getAudioTracks | MediaStream.getAudioTracks()} list
     */
    getAudioTrack(index?: number): MediaStreamAudioTrack;
    /** Stops the capture */
    stop(): void;
}

declare type Player = Pick<Player$4, "canvas">;
declare const MediaRecorderSSR: {
    new (stream: MediaStream, options?: MediaRecorderOptions | undefined): MediaRecorder;
    prototype: MediaRecorder;
    isTypeSupported(type: string): boolean;
};
interface VideoRecorder extends MediaRecorder {
    /** Start video recording */
    start(): void;
    /** Pauses video recording */
    pause(): void;
    /** Resumes video recording after a pause */
    resume(): void;
}
/**
 * {@link Player} output to video
 *
 * ⚠️ The {@link VideoRecorder} works only on the {@link https://caniuse.com/?search=mediarecorder | platforms which supports MediaRecorder API}.
 *
 * @category Output
 */
declare class VideoRecorder extends MediaRecorderSSR {
    constructor(player: Player, options: MediaRecorderOptions);
    /**
     * Stops video recording
     * @returns The recorder video
     */
    stop(): Promise<Blob>;
}

/**
 * Reference for high-level Banuba WebAR SDK.
 *
 *
 * ```ts
 * import { Webcam, Player, Module, Effect, Dom } from "/BanubaSDK.js"
 *
 * const run = async () => {
 *   const player = await Player.create({ clientToken: "xxx-xxx-xxx" })
 *   await player.addModule(new Module("face_tracker.zip"))
 *
 *   player.use(new Webcam())
 *   player.applyEffect(new Effect("Octopus.zip"))
 *   player.play()
 *
 *   Dom.render(player, "#webar-app")
 * }
 *
 * run()
 * ```
 *
 * Visit the [Banuba Web AR Overview](../../tutorials/development/installation) to learn the basics.
 *
 * Check out the [Getting started guide](../../tutorials/development/basic_integration?platform=web) and [Tutorials](../../) for code examples and integration receipts.
 *
 * @module
 */

/**
 * Current Banuba WebAR SDK version in use
 * @example
 * ```ts
 * "1.5.0"
 * ```
 */
declare const VERSION: string;

export { BanubaSDKBinary, BanubaSDKBinaryFileLocator, Dom, Effect, EventEmitter, FS, Frame, FrameData, Image, ImageCapture, ImageSource, Input, InputOptions, LoadManyOptions, LoadOptions, Logger, MediaStream$1 as MediaStream, MediaStreamCapture, Module, Orientation, PhotoSettings, PlaybackOptions, Player$4 as Player, PlayerEventMap, PlayerOptions, Progress, ProgressListener, ReadableStream, SDKOptions, Url, VERSION, Video, VideoOptions, VideoRecorder, Webcam, WebcamPreferences, createSDK, defaultPlayerOptions, defaultVideoConstraints, defaultVideoOptions, isBrowserSupported, isSimdSupported, index as timers, utils };
