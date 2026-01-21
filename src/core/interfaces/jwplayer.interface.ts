export interface IJWPlayerOptions {
  // Content
  file?: string;
  playlist?: string | JWPlaylistItem[];
  playlistIndex?: number;

  // Authentication
  key?: string;

  // Appearance
  aspectratio?: string;
  controls?: boolean;
  displaydescription?: boolean;
  displayHeading?: boolean;
  displayPlaybackLabel?: boolean;
  displaytitle?: boolean;
  height?: number | string;
  width?: number | string;
  horizontalVolumeSlider?: boolean;
  livePause?: boolean;
  nextUpDisplay?: boolean;
  qualityLabels?: JWQualityLabel[];
  renderCaptionsNatively?: boolean;
  stretching?: 'uniform' | 'exactfit' | 'fill' | 'none';

  // Behavior
  aboutlink?: string;
  abouttext?: string;
  allowFullscreen?: boolean;
  autostart?: boolean | 'viewable';
  defaultBandwidthEstimate?: number;
  fullscreenOrientationLock?: 'landscape' | 'none' | 'portrait';
  generateSEOMetadata?: boolean;
  liveSyncDuration?: number;
  mute?: boolean;
  nextupoffset?: number | string;
  pipIcon?: 'enabled' | 'disabled';
  playbackRateControls?: boolean;
  playbackRates?: number[];
  repeat?: boolean;

  // Rendering
  base?: string;
  hlsjsdefault?: boolean;
  liveTimeout?: number;
  loadAndParseHlsMetadata?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
  showUIWhen?: 'onReady' | 'onContent';

  // Nested configs
  logo?: JWPlayerLogo;
  captions?: JWPlayerCaptions;
  skin?: JWPlayerSkin;
  advertising?: JWPlayerAdvertising;
}

export interface JWPlaylistItem {
  file?: string;
  image?: string;
  title?: string;
  description?: string;
  mediaid?: string;
  sources?: JWSource[];
  tracks?: JWTrack[];
}

export interface JWSource {
  file: string;
  type?: string;
  label?: string;
  default?: boolean;
}

export interface JWTrack {
  file: string;
  kind?: 'captions' | 'chapters' | 'thumbnails';
  label?: string;
  default?: boolean;
}

export interface JWPlayerLogo {
  file?: string;
  hide?: boolean;
  link?: string;
  margin?: string | number;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export interface JWPlayerCaptions {
  color?: string;
  fontSize?: number;
  fontFamily?: string;
  fontOpacity?: number;
  backgroundColor?: string;
  backgroundOpacity?: number;
  edgeStyle?: 'none' | 'dropshadow' | 'raised' | 'depressed' | 'uniform';
  windowColor?: string;
  windowOpacity?: number;
}

export interface JWPlayerSkin {
  name?: string;
  active?: string;
  inactive?: string;
  background?: string;
}

export interface JWPlayerAdvertising {
  client?: 'vast' | 'googima';
  tag?: string;
  schedule?: Record<string, JWAdBreak>;
}

export interface JWAdBreak {
  tag: string;
  offset?: string | number;
}

export interface JWQualityLabel {
  bandwidth: number;
  label: string;
}

export interface JWPlayerState {
  position: number;
  duration: number;
  viewable: number;
  volume: number;
  mute: boolean;
  playbackRate: number;
}

export interface JWPlayerEventParams {
  position?: number;
  duration?: number;
  viewable?: number;
  volume?: number;
  mute?: boolean;
  playbackRate?: number;
  oldstate?: string;
  newstate?: string;
  type?: string;
  width?: number;
  height?: number;
}

export type JWPlayerEventCallback = (params: JWPlayerEventParams) => void;

export interface JWPlayerInstance {
  setup(config: IJWPlayerOptions): JWPlayerInstance;
  load(playlist: string | JWPlaylistItem[]): void;
  play(): void;
  pause(): void;
  stop(): void;
  seek(position: number): void;
  setVolume(volume: number): void;
  setMute(mute: boolean): void;
  setPlaybackRate(rate: number): void;
  getPosition(): number;
  getDuration(): number;
  getVolume(): number;
  getMute(): boolean;
  getPlaybackRate(): number;
  getState(): 'idle' | 'buffering' | 'playing' | 'paused' | 'complete';
  getPlaylist(): JWPlaylistItem[];
  getPlaylistIndex(): number;
  setCaptions(options: Partial<JWPlayerCaptions>): void;
  remove(): void;
  resize(width: number | string, height: number | string): void;
  on(event: JWPlayerEvent, callback: JWPlayerEventCallback): JWPlayerInstance;
  off(event: JWPlayerEvent): JWPlayerInstance;
  once(event: JWPlayerEvent, callback: JWPlayerEventCallback): JWPlayerInstance;
}

export type JWPlayerEvent =
  | 'ready'
  | 'play'
  | 'pause'
  | 'buffer'
  | 'idle'
  | 'complete'
  | 'error'
  | 'seek'
  | 'seeked'
  | 'time'
  | 'firstFrame'
  | 'volume'
  | 'mute'
  | 'playbackRateChanged'
  | 'resize'
  | 'fullscreen'
  | 'playlistItem'
  | 'playlistComplete';

export type JWPlayerFactory = (elementId: string) => JWPlayerInstance;

declare global {
  interface Window {
    jwplayer: JWPlayerFactory;
  }
}
