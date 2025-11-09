// SISTEMA DE NOTAS RÁPIDAS - Otimizado にゃん~
const Notes = {
    notes: [],
    currentNote: null,
    searchQuery: '',
    modalOpen: false,
    
    // Cores para os cards
    colors: [
        'from-yellow-100 to-orange-100 border-yellow-300',
        'from-blue-100 to-cyan-100 border-blue-300',
        'from-green-100 to-emerald-100 border-green-300',
        'from-purple-100 to-pink-100 border-purple-300',
        'from-red-100 to-rose-100 border-red-300'
    ],
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    render() {
        this.loadNotes();
        
        return `
            <div class="max-w-6xl mx-auto">
                ${this.renderHeader()}
                ${this.renderActionBar()}
                ${this.renderNotesList()}
                ${this.renderModal()}
            </div>
        `;
    },
    
    renderHeader() {
        return `
            <div class="text-center mb-8">
                <div class="inline-block mb-4">
                    <div class="text-7xl animate-bounce-slow">📝</div>
                </div>
                <h1 class="text-5xl font-black mb-3 bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                    Notas Rápidas
                </h1>
                <p class="text-gray-600 text-lg font-semibold">Organize suas ideias e pensamentos にゃん~</p>
            </div>
        `;
    },
    
    renderActionBar() {
        return `
            <div class="bg-white rounded-2xl shadow-2xl p-6 mb-6">
                ${this.renderSearchBox()}
                ${this.renderStats()}
            </div>
        `;
    },
    
    renderSearchBox() {
        return `
            <div class="mb-3">
                <div class="flex gap-2">
                    <input type="text" 
                           id="notes-search"
                           value="${this.escapeHtml(this.searchQuery)}"
                           placeholder="🔍 Buscar notas..."
                           oninput="Notes.search(this.value)"
                           class="flex-1 px-6 py-4 border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-4 focus:ring-yellow-200 outline-none transition-all text-lg">
                    <button onclick="Notes.openCreateModal()" 
                            class="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 whitespace-nowrap">
                        <span class="text-2xl">+</span>
                        <span>Nova Nota</span>
                    </button>
                </div>
            </div>
        `;
    },
    
    renderStats() {
        return `
            <div class="flex gap-4 mt-4 pt-4 border-t-2 border-gray-200">
                <div class="flex items-center gap-2 text-gray-600">
                    <span class="text-2xl">📄</span>
                    <span class="font-semibold">${this.notes.length} nota${this.notes.length !== 1 ? 's' : ''}</span>
                </div>
                ${this.notes.length > 0 ? `
                    <button onclick="Notes.clearAll()" 
                            class="ml-auto text-red-600 hover:text-red-800 font-bold text-sm transition-all">
                        🗑️ Limpar Tudo
                    </button>
                ` : ''}
            </div>
        `;
    },
    
    renderNotesList() {
        const filteredNotes = this.getFilteredNotes();
        
        if (filteredNotes.length === 0) {
            return this.renderEmptyState();
        }
        
        return `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${filteredNotes.map(note => this.renderNoteCard(note)).join('')}
            </div>
        `;
    },
    
    renderEmptyState() {
        return `
            <div class="bg-white rounded-2xl shadow-2xl p-16 text-center">
                <div class="text-8xl mb-6 opacity-50">📝</div>
                <h3 class="text-3xl font-bold text-gray-800 mb-3">
                    ${this.searchQuery ? 'Nenhuma nota encontrada' : 'Nenhuma nota ainda'}
                </h3>
                <p class="text-gray-600 mb-6">
                    ${this.searchQuery ? 'Tente outro termo de busca' : 'Comece criando sua primeira nota!'}
                </p>
                ${!this.searchQuery ? `
                    <button onclick="Notes.openCreateModal()" 
                            class="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all">
                        ✏️ Criar Primeira Nota
                    </button>
                ` : ''}
            </div>
        `;
    },
    
    renderNoteCard(note) {
        const colorIndex = Math.abs(note.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % this.colors.length;
        const colorClass = this.colors[colorIndex];
        
        return `
            <div class="bg-gradient-to-br ${colorClass} rounded-2xl p-6 shadow-lg border-2 transform hover:scale-105 hover:shadow-2xl transition-all group">
                ${this.renderNoteHeader(note)}
                ${this.renderNoteContent(note)}
                ${this.renderNoteFooter(note)}
            </div>
        `;
    },
    
    renderNoteHeader(note) {
        return `
            <div class="flex items-start justify-between mb-4">
                <div class="text-4xl">${note.pinned ? '📌' : '📄'}</div>
                <div class="flex gap-2">
                    <button onclick="Notes.togglePin('${note.id}')" 
                            class="p-2 hover:bg-white/50 rounded-lg transition-all"
                            title="${note.pinned ? 'Desafixar' : 'Fixar'}">
                        ${note.pinned ? '📍' : '📌'}
                    </button>
                    <button onclick="Notes.openEditModal('${note.id}')" 
                            class="p-2 hover:bg-white/50 rounded-lg transition-all"
                            title="Editar">
                        ✏️
                    </button>
                    <button onclick="Notes.deleteNote('${note.id}')" 
                            class="p-2 hover:bg-red-200 rounded-lg transition-all"
                            title="Excluir">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    },
    
    renderNoteContent(note) {
        return `
            <h3 class="font-bold text-xl text-gray-800 mb-2 line-clamp-2">
                ${this.escapeHtml(note.title) || 'Sem título'}
            </h3>
            <p class="text-gray-700 text-sm line-clamp-4 mb-4">
                ${this.escapeHtml(note.content)}
            </p>
        `;
    },
    
    renderNoteFooter(note) {
        return `
            <div class="flex items-center justify-between pt-4 border-t-2 border-gray-300">
                <span class="text-xs text-gray-600 font-semibold">
                    ${this.formatDate(note.created)}
                </span>
                <span class="text-xs text-gray-600">
                    ${note.content.length} caracteres
                </span>
            </div>
        `;
    },
    
    renderModal() {
        if (!this.modalOpen) return '';
        
        const isEdit = this.currentNote !== null;
        const title = isEdit ? this.currentNote.title : '';
        const content = isEdit ? this.currentNote.content : '';
        
        return `
            <div id="notes-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onclick="if(event.target.id === 'notes-modal') Notes.closeModal()">
                <div class="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    ${this.renderModalHeader(isEdit)}
                    ${this.renderModalForm(title, content, isEdit)}
                </div>
            </div>
        `;
    },
    
    renderModalHeader(isEdit) {
        return `
            <div class="bg-gradient-to-r from-yellow-500 to-orange-600 p-6 rounded-t-3xl text-white sticky top-0 z-10">
                <div class="flex items-center justify-between">
                    <h2 class="text-3xl font-black">${isEdit ? '✏️ Editar Nota' : '📝 Nova Nota'}</h2>
                    <button onclick="Notes.closeModal()" 
                            class="text-white hover:bg-white/20 p-2 rounded-lg transition-all">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    },
    
    renderModalForm(title, content, isEdit) {
        return `
            <form onsubmit="Notes.saveNote(event); return false;" class="p-6 space-y-6">
                <div>
                    <label class="block text-gray-800 font-bold mb-3 text-lg">📌 Título</label>
                    <input type="text" 
                           id="note-title"
                           value="${this.escapeHtml(title)}"
                           placeholder="Digite o título da nota..."
                           required
                           class="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-4 focus:ring-yellow-200 outline-none transition-all text-lg font-semibold">
                </div>
                
                <div>
                    <label class="block text-gray-800 font-bold mb-3 text-lg">✏️ Conteúdo</label>
                    <textarea id="note-content"
                              placeholder="Digite o conteúdo da nota..."
                              required
                              rows="8"
                              class="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-4 focus:ring-yellow-200 outline-none transition-all text-lg resize-none">${this.escapeHtml(content)}</textarea>
                </div>
                
                <div class="flex gap-3">
                    <button type="button" 
                            onclick="Notes.closeModal()"
                            class="flex-1 px-6 py-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-bold text-lg transition-all">
                        ❌ Cancelar
                    </button>
                    <button type="submit"
                            class="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all">
                        ✅ ${isEdit ? 'Salvar' : 'Criar'}
                    </button>
                </div>
            </form>
        `;
    },
    
    openCreateModal() {
        this.currentNote = null;
        this.modalOpen = true;
        Router.render();
        setTimeout(() => document.getElementById('note-title')?.focus(), 100);
    },
    
    openEditModal(id) {
        this.currentNote = this.notes.find(n => n.id === id);
        if (!this.currentNote) return;
        
        this.modalOpen = true;
        Router.render();
        setTimeout(() => document.getElementById('note-title')?.focus(), 100);
    },
    
    closeModal() {
        this.modalOpen = false;
        this.currentNote = null;
        Router.render();
    },
    
    saveNote(event) {
        event.preventDefault();
        
        const titleInput = document.getElementById('note-title');
        const contentInput = document.getElementById('note-content');
        
        if (!titleInput || !contentInput) return;
        
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();
        
        if (!title || !content) {
            Utils.showNotification('⚠️ Preencha todos os campos', 'warning');
            return;
        }
        
        if (this.currentNote) {
            this.updateNote(title, content);
        } else {
            this.createNote(title, content);
        }
        
        this.saveNotes();
        this.closeModal();
    },
    
    createNote(title, content) {
        const note = {
            id: Utils.generateId(),
            title,
            content,
            created: Date.now(),
            updated: Date.now(),
            pinned: false
        };
        this.notes.unshift(note);
        Utils.showNotification('✅ Nota criada! にゃん~', 'success');
    },
    
    updateNote(title, content) {
        const index = this.notes.findIndex(n => n.id === this.currentNote.id);
        if (index !== -1) {
            this.notes[index] = {
                ...this.notes[index],
                title,
                content,
                updated: Date.now()
            };
            Utils.showNotification('✅ Nota atualizada! にゃん~', 'success');
        }
    },
    
    deleteNote(id) {
        if (!confirm('🗑️ Deseja realmente excluir esta nota?')) return;
        
        this.notes = this.notes.filter(n => n.id !== id);
        this.saveNotes();
        Utils.showNotification('🗑️ Nota excluída! にゃん~', 'info');
        Router.render();
    },
    
    togglePin(id) {
        const note = this.notes.find(n => n.id === id);
        if (!note) return;
        
        note.pinned = !note.pinned;
        this.sortNotes();
        this.saveNotes();
        Utils.showNotification(note.pinned ? '📌 Nota fixada!' : '📍 Nota desafixada!', 'success');
        Router.render();
    },
    
    sortNotes() {
        this.notes.sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return b.created - a.created;
        });
    },
    
    search(query) {
        this.searchQuery = query.toLowerCase();
        Router.render();
    },
    
    getFilteredNotes() {
        if (!this.searchQuery) return this.notes;
        
        return this.notes.filter(note => 
            note.title.toLowerCase().includes(this.searchQuery) ||
            note.content.toLowerCase().includes(this.searchQuery)
        );
    },
    
    clearAll() {
        if (!confirm('⚠️ Isso irá excluir TODAS as notas!\n\nDeseja continuar?')) return;
        
        this.notes = [];
        this.saveNotes();
        Utils.showNotification('🗑️ Todas as notas foram excluídas! にゃん~', 'info');
        Router.render();
    },
    
    formatDate(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Agora mesmo';
        if (diff < 3600000) return `${Math.floor(diff / 60000)} min atrás`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h atrás`;
        
        return date.toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    loadNotes() {
        this.notes = Utils.loadData('notes') || [];
    },
    
    saveNotes() {
        Utils.saveData('notes', this.notes);
    },
    
    init() {
        this.loadNotes();
        this.modalOpen = false;
        console.log('📝 Notas carregadas:', this.notes.length);
    }
};

window.Notes = Notes;