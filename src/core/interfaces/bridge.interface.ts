import { ILesson } from './lesson.interface';

export type BridgeMessageType = 'init' | 'lesson' | 'playback';

export type BridgeSubType =
  | 'none'
  | 'video'
  | 'videoImg'
  | 'qcm'
  | 'tapRythm'
  | 'midiFile'
  | string;

/**
 * Navigation flags added by Flutter to the lesson data.
 * Mirror of LessonBridgePayload in webview_bridge_models.dart.
 */
export interface LessonBridgeData {
  isStart?: boolean;
  isEnd?: boolean;
}

export interface FlutterToAngularMessage {
  type: BridgeMessageType;
  subType: BridgeSubType;
  data: ILesson & LessonBridgeData;
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
