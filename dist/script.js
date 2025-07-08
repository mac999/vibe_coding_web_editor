class WebEditor {
    constructor() {
        this.currentTheme = 'system';
        this.searchMatches = [];
        this.currentSearchIndex = -1;
        this.editor = this.getElement('editor');
        this.searchBar = this.getElement('searchBar');
        this.searchInput = this.getElement('searchInput');
        this.searchCount = this.getElement('searchCount');
        this.cursorPos = this.getElement('cursorPos');
        this.charCount = this.getElement('charCount');
        this.themeStatus = this.getElement('themeStatus');
        this.themeIcon = this.getElement('themeIcon');
        this.fileInput = this.getElement('fileInput');
        this.initializeEventListeners();
        this.initializeTheme();
        this.updateStatusBar();
        this.setupDropdowns();
    }
    getElement(id) {
        const element = document.getElementById(id);
        if (!element) {
            throw new Error(`Element with id "${id}" not found`);
        }
        return element;
    }
    setupDropdowns() {
        const dropdownTriggers = document.querySelectorAll('.dropdown-trigger');
        dropdownTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                const dropdown = trigger.closest('.dropdown');
                if (!dropdown)
                    return;
                const menu = dropdown.querySelector('.dropdown-menu');
                if (!menu)
                    return;
                this.closeAllDropdowns();
                menu.classList.toggle('show');
            });
        });
        document.addEventListener('click', (e) => {
            const target = e.target;
            if (!target.closest('.dropdown')) {
                this.closeAllDropdowns();
            }
        });
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                this.closeAllDropdowns();
            });
        });
    }
    closeAllDropdowns() {
        const dropdownMenus = document.querySelectorAll('.dropdown-menu');
        dropdownMenus.forEach(menu => {
            menu.classList.remove('show');
        });
    }
    initializeEventListeners() {
        this.getElement('newBtn').addEventListener('click', () => this.newDocument());
        this.getElement('openBtn').addEventListener('click', () => this.openFile());
        this.getElement('saveBtn').addEventListener('click', () => this.saveFile());
        this.getElement('undoBtn').addEventListener('click', () => this.undo());
        this.getElement('redoBtn').addEventListener('click', () => this.redo());
        this.getElement('cutBtn').addEventListener('click', () => this.cut());
        this.getElement('copyBtn').addEventListener('click', () => this.copy());
        this.getElement('pasteBtn').addEventListener('click', () => this.paste());
        this.getElement('searchBtn').addEventListener('click', () => this.toggleSearch());
        this.getElement('systemThemeBtn').addEventListener('click', () => this.setTheme('system'));
        this.getElement('lightThemeBtn').addEventListener('click', () => this.setTheme('light'));
        this.getElement('darkThemeBtn').addEventListener('click', () => this.setTheme('dark'));
        this.getElement('searchCloseBtn').addEventListener('click', () => this.closeSearch());
        this.searchInput.addEventListener('input', (e) => {
            const target = e.target;
            this.performSearch(target.value);
        });
        this.getElement('searchPrevBtn').addEventListener('click', () => this.searchPrevious());
        this.getElement('searchNextBtn').addEventListener('click', () => this.searchNext());
        this.editor.addEventListener('input', () => this.updateStatusBar());
        this.editor.addEventListener('keyup', () => this.updateStatusBar());
        this.editor.addEventListener('click', () => this.updateStatusBar());
        this.editor.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.fileInput.addEventListener('change', (e) => this.handleFileLoad(e));
        document.addEventListener('keydown', (e) => this.handleGlobalKeyDown(e));
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', () => {
            if (this.currentTheme === 'system') {
                this.applySystemTheme();
            }
        });
    }
    initializeTheme() {
        const savedTheme = localStorage.getItem('webeditor-theme');
        if (savedTheme && ['system', 'light', 'dark'].includes(savedTheme)) {
            this.currentTheme = savedTheme;
        }
        this.applyTheme();
    }
    newDocument() {
        if (this.editor.value.trim() && !confirm('현재 내용이 사라집니다. 계속하시겠습니까?')) {
            return;
        }
        this.editor.value = '';
        this.updateStatusBar();
        this.editor.focus();
    }
    openFile() {
        this.fileInput.click();
    }
    handleFileLoad(event) {
        const target = event.target;
        const file = target.files?.[0];
        if (!file)
            return;
        if (file.type !== 'text/plain' && !file.name.endsWith('.txt')) {
            alert('텍스트 파일(.txt)만 지원됩니다.');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target?.result) {
                this.editor.value = e.target.result;
                this.updateStatusBar();
                this.editor.focus();
            }
        };
        reader.readAsText(file, 'UTF-8');
        this.fileInput.value = '';
    }
    saveFile() {
        const content = this.editor.value;
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document.txt';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    undo() {
        document.execCommand('undo');
        this.updateStatusBar();
    }
    redo() {
        document.execCommand('redo');
        this.updateStatusBar();
    }
    cut() {
        if (this.editor.selectionStart !== this.editor.selectionEnd) {
            document.execCommand('cut');
            this.updateStatusBar();
        }
    }
    copy() {
        if (this.editor.selectionStart !== this.editor.selectionEnd) {
            document.execCommand('copy');
        }
    }
    async paste() {
        try {
            const text = await navigator.clipboard.readText();
            const start = this.editor.selectionStart;
            const end = this.editor.selectionEnd;
            this.editor.value = this.editor.value.substring(0, start) + text + this.editor.value.substring(end);
            this.editor.selectionStart = this.editor.selectionEnd = start + text.length;
            this.updateStatusBar();
        }
        catch (err) {
            document.execCommand('paste');
            this.updateStatusBar();
        }
    }
    toggleSearch() {
        if (this.searchBar.classList.contains('hidden')) {
            this.searchBar.classList.remove('hidden');
            this.searchInput.focus();
        }
        else {
            this.closeSearch();
        }
    }
    closeSearch() {
        this.searchBar.classList.add('hidden');
        this.clearSearchHighlights();
        this.editor.focus();
    }
    performSearch(query) {
        this.clearSearchHighlights();
        if (!query) {
            this.searchCount.textContent = '';
            return;
        }
        const content = this.editor.value;
        const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        const matches = [...content.matchAll(regex)];
        this.searchMatches = matches.map(match => ({
            index: match.index,
            length: match[0].length
        }));
        if (this.searchMatches.length > 0) {
            this.currentSearchIndex = 0;
            this.scrollToMatch(0);
            this.updateSearchCounter();
        }
        else {
            this.searchCount.textContent = '일치하는 항목 없음';
        }
    }
    clearSearchHighlights() {
        this.searchMatches = [];
        this.currentSearchIndex = -1;
    }
    searchPrevious() {
        if (this.searchMatches.length === 0)
            return;
        this.currentSearchIndex = this.currentSearchIndex > 0
            ? this.currentSearchIndex - 1
            : this.searchMatches.length - 1;
        this.scrollToMatch(this.currentSearchIndex);
        this.updateSearchCounter();
    }
    searchNext() {
        if (this.searchMatches.length === 0)
            return;
        this.currentSearchIndex = this.currentSearchIndex < this.searchMatches.length - 1
            ? this.currentSearchIndex + 1
            : 0;
        this.scrollToMatch(this.currentSearchIndex);
        this.updateSearchCounter();
    }
    updateSearchCounter() {
        if (this.searchMatches.length > 0) {
            this.searchCount.textContent = `${this.currentSearchIndex + 1}/${this.searchMatches.length}`;
        }
    }
    scrollToMatch(index) {
        if (index < 0 || index >= this.searchMatches.length)
            return;
        const match = this.searchMatches[index];
        this.editor.focus();
        this.editor.setSelectionRange(match.index, match.index + match.length);
        const textBeforeMatch = this.editor.value.substring(0, match.index);
        const linesBefore = textBeforeMatch.split('\n').length - 1;
        const lineHeight = 20;
        const scrollTop = linesBefore * lineHeight;
        this.editor.scrollTop = Math.max(0, scrollTop - this.editor.clientHeight / 2);
    }
    setTheme(theme) {
        console.log('Setting theme to:', theme);
        this.currentTheme = theme;
        localStorage.setItem('webeditor-theme', this.currentTheme);
        this.applyTheme();
    }
    applyTheme() {
        const html = document.documentElement;
        console.log('Applying theme:', this.currentTheme);
        switch (this.currentTheme) {
            case 'light':
                html.classList.remove('dark');
                this.themeStatus.textContent = '라이트 모드';
                this.themeIcon.textContent = '☀️';
                break;
            case 'dark':
                html.classList.add('dark');
                this.themeStatus.textContent = '다크 모드';
                this.themeIcon.textContent = '🌙';
                break;
            case 'system':
            default:
                this.applySystemTheme();
                this.themeStatus.textContent = '시스템 테마';
                this.themeIcon.textContent = '🖥️';
                break;
        }
    }
    applySystemTheme() {
        const html = document.documentElement;
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            html.classList.add('dark');
        }
        else {
            html.classList.remove('dark');
        }
    }
    handleGlobalKeyDown(event) {
        if (event.ctrlKey || event.metaKey) {
            switch (event.key.toLowerCase()) {
                case 'n':
                    event.preventDefault();
                    this.newDocument();
                    break;
                case 'o':
                    event.preventDefault();
                    this.openFile();
                    break;
                case 's':
                    event.preventDefault();
                    this.saveFile();
                    break;
                case 'f':
                    event.preventDefault();
                    this.toggleSearch();
                    break;
                case 'z':
                    if (!event.shiftKey) {
                        event.preventDefault();
                        this.undo();
                    }
                    break;
                case 'y':
                    event.preventDefault();
                    this.redo();
                    break;
            }
        }
        if (event.key === 'Escape') {
            if (!this.searchBar.classList.contains('hidden')) {
                this.closeSearch();
            }
            else {
                this.closeAllDropdowns();
            }
        }
    }
    handleKeyDown(event) {
        if (event.key === 'Tab') {
            event.preventDefault();
            const start = this.editor.selectionStart;
            const end = this.editor.selectionEnd;
            this.editor.value = this.editor.value.substring(0, start) +
                '    ' +
                this.editor.value.substring(end);
            this.editor.selectionStart = this.editor.selectionEnd = start + 4;
            this.updateStatusBar();
        }
    }
    updateStatusBar() {
        const text = this.editor.value;
        const cursorPosition = this.editor.selectionStart;
        const textBeforeCursor = text.substring(0, cursorPosition);
        const lines = textBeforeCursor.split('\n');
        const line = lines.length;
        const column = lines[lines.length - 1].length + 1;
        const charCount = text.length;
        this.cursorPos.textContent = `줄: ${line}, 열: ${column}`;
        this.charCount.textContent = `${charCount}자`;
    }
    focus() {
        this.editor.focus();
    }
    getConfig() {
        return {
            theme: this.currentTheme,
            searchMatches: this.searchMatches,
            currentSearchIndex: this.currentSearchIndex
        };
    }
}
document.addEventListener('DOMContentLoaded', () => {
    const webEditor = new WebEditor();
    webEditor.focus();
    window.addEventListener('beforeunload', (e) => {
        const editor = document.getElementById('editor');
        if (editor && editor.value.trim()) {
            e.preventDefault();
            e.returnValue = '';
        }
    });
});
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
            console.log('SW registered: ', registration);
        })
            .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
        });
    });
}
export { WebEditor };
//# sourceMappingURL=script.js.map