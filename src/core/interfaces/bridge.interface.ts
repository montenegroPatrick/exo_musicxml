export type BridgeMessageType = 'init' | 'lesson' | 'playback';

export type BridgeSubType =
  | 'none'
  | 'video'
  | 'videoImg'
  | 'qcm'
  | 'tapRythm'
  | 'midiFile'
  | string;

export interface FlutterToAngularMessage {
  type: BridgeMessageType;
  subType: BridgeSubType;
  data: any;
  token: string;
}

export type BridgeAction =
  | 'next'
  | 'prev'
  | 'goTo'
  | 'finished'
  | 'progress'
  | 'init';

export interface AngularToFlutterMessage {
  action: BridgeAction;
  data?: any;
}
