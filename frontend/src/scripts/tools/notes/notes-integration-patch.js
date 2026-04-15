
(function patchNotes() {

    const tryPatch = () => {
        if (!window.Notes) { setTimeout(tryPatch, 500); return; }
        if (window.Notes.__integrationPatched) return;
        window.Notes.__integrationPatched = true;

        const origFooter = Notes.renderNoteFooter.bind(Notes);
        Notes.renderNoteFooter = function(note) {
            const original = origFooter(note);
            const btn = window.Integrations?.renderNoteToTaskBtn?.(note.id) || '';

            return original.replace(
                /<\/div>\s*$/,
                `<div style="margin-top:0.5rem;">${btn}</div></div>`
            );
        };

        const origCreate = Notes.createNote.bind(Notes);
        Notes.createNote = function(title, content) {
            origCreate(title, content);
            const notes   = window.Utils?.loadData('notes') || [];
            const newNote = notes[0];
            if (newNote) {
                window.ProfileV2?.recordActivity('note_created', { title: newNote.title });
                window.Integrations?.onNoteCreated?.(newNote);
            }
        };

        const origUpdate = Notes.updateNote.bind(Notes);
        Notes.updateNote = function(title, content) {
            origUpdate(title, content);
            window.ProfileV2?.recordActivity('note_updated', { title });
        };

    };

    setTimeout(tryPatch, 600);
})();
