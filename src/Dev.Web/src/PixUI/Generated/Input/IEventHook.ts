import * as PixUI from '@/PixUI'

export interface IEventHook {
    PreviewEvent(type: PixUI.EventType, e: Nullable<any>): EventPreviewResult;
}

export enum EventPreviewResult {
    /// <summary>
    /// The message is not processed.
    /// </summary>
    NotProcessed = 0,

    /// <summary>
    /// The message is processed.
    /// </summary>
    Processed = 1,

    /// <summary>
    /// No dispatch of the message is allowed.
    /// </summary>
    NoDispatch = EventPreviewResult.Processed << 1,

    /// <summary>
    /// No further delegation to other listeners is desired.
    /// </summary>
    NoContinue = EventPreviewResult.NoDispatch << 1,

    /// <summary>
    /// Processed and Dispatched flags
    /// </summary>
    ProcessedNoDispatch = EventPreviewResult.Processed | EventPreviewResult.NoDispatch,

    /// <summary>
    /// All flags are set
    /// </summary>
    All = EventPreviewResult.Processed | EventPreviewResult.NoDispatch | EventPreviewResult.NoContinue
}
