import { QueueSongOperation } from "./QueueSongOperation";

export interface QueueSongResult {
    status: QueueSongOperation;
    position?: number;
}
