// services/transcribeResponse.js

// Class representing a single transcription cue.
class TranscriptionCue {
    constructor(start, end, transcription) {
        this.start = start;
        this.end = end;
        this.transcription = transcription;
    }
}

// Class for the transcription response containing a list of cues.
class TranscribeResponse {
    constructor(transcriptions = []) {
        this.transcriptions = transcriptions;
    }

    // Adds a new cue to the list.
    addCue(cue) {
        this.transcriptions.push(cue);
    }

    // Returns a JSON-friendly representation.
    toJSON() {
        return {
            transcriptions: this.transcriptions.map(cue => ({
                start: cue.start,
                end: cue.end,
                transcription: cue.transcription
            }))
        };
    }
}

module.exports = { TranscriptionCue, TranscribeResponse };
