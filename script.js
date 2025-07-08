// 웹 기반 텍스트 편집기 - 메인 JavaScript 파일

class WebEditor {
    constructor() {
        this.editor = document.getElementById('editor');
        this.searchBar = document.getElementById('searchBar');
        this.searchInput = document.getElementById('searchInput');
        this.searchCount = document.getElementById('searchCount');
        this.cursorPos = document.getElementById('cursorPos');
        this.charCount = document.getElementById('charCount');
        this.themeStatus = document.getElementById('themeStatus');
        this.themeIcon = document.getElementById('themeIcon');
        this.fileInput = document.getElementById('fileInput');
        
        this.currentTheme = 'system'; // 'system', 'light', 'dark'
        this.searchMatches = [];
        this.currentSearchIndex = -1;
        this.originalText = '';
        
        this.initializeEventListeners();
        this.initializeTheme();
        this.updateStatusBar();
        this.setupDropdowns();
    }

    setupDropdowns() {
        // 드롭다운 토글 이벤트
        const dropdownTriggers = document.querySelectorAll('.dropdown-trigger');
        dropdownTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                const dropdown = trigger.closest('.dropdown');
                const menu = dropdown.querySelector('.dropdown-menu');
                
                // 다른 메뉴들 닫기
                this.closeAllDropdowns();
                
                // 현재 메뉴 토글
                menu.classList.toggle('show');
            });
        });

        // 문서 클릭 시 모든 드롭다운 닫기
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dropdown')) {
                this.closeAllDropdowns();
            }
        });

        // 메뉴 아이템 클릭 시 드롭다운 닫기
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
        // 파일 메뉴
        document.getElementById('newBtn').addEventListener('click', () => this.newDocument());
        document.getElementById('openBtn').addEventListener('click', () => this.openFile());
        document.getElementById('saveBtn').addEventListener('click', () => this.saveFile());
        
        // 편집 메뉴
        document.getElementById('undoBtn').addEventListener('click', () => this.undo());
        document.getElementById('redoBtn').addEventListener('click', () => this.redo());
        document.getElementById('cutBtn').addEventListener('click', () => this.cut());
        document.getElementById('copyBtn').addEventListener('click', () => this.copy());
        document.getElementById('pasteBtn').addEventListener('click', () => this.paste());
        document.getElementById('searchBtn').addEventListener('click', () => this.toggleSearch());
        
        // 테마 메뉴
        document.getElementById('systemThemeBtn').addEventListener('click', () => this.setTheme('system'));
        document.getElementById('lightThemeBtn').addEventListener('click', () => this.setTheme('light'));
        document.getElementById('darkThemeBtn').addEventListener('click', () => this.setTheme('dark'));
        
        // 검색 관련
        document.getElementById('searchCloseBtn').addEventListener('click', () => this.closeSearch());
        document.getElementById('searchInput').addEventListener('input', (e) => this.performSearch(e.target.value));
        document.getElementById('searchPrevBtn').addEventListener('click', () => this.searchPrevious());
        document.getElementById('searchNextBtn').addEventListener('click', () => this.searchNext());
        
        // 에디터 관련
        this.editor.addEventListener('input', () => this.updateStatusBar());
        this.editor.addEventListener('keyup', () => this.updateStatusBar());
        this.editor.addEventListener('click', () => this.updateStatusBar());
        this.editor.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // 파일 입력
        this.fileInput.addEventListener('change', (e) => this.handleFileLoad(e));
        
        // 전역 키보드 단축키
        document.addEventListener('keydown', (e) => this.handleGlobalKeyDown(e));
        
        // 시스템 테마 변경 감지
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

    // 새 문서 생성
    newDocument() {
        if (this.editor.value.trim() && !confirm('현재 내용이 사라집니다. 계속하시겠습니까?')) {
            return;
        }
        this.editor.value = '';
        this.updateStatusBar();
        this.editor.focus();
    }

    // 파일 열기
    openFile() {
        this.fileInput.click();
    }

    // 파일 로드 처리
    handleFileLoad(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        if (file.type !== 'text/plain' && !file.name.endsWith('.txt')) {
            alert('텍스트 파일(.txt)만 지원됩니다.');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            this.editor.value = e.target.result;
            this.updateStatusBar();
            this.editor.focus();
        };
        reader.readAsText(file, 'UTF-8');
        
        // 파일 입력 초기화
        this.fileInput.value = '';
    }

    // 파일 저장
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

    // 편집 기능들
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
        } catch (err) {
            // 클립보드 API가 지원되지 않는 경우 기본 붙여넣기 사용
            document.execCommand('paste');
            this.updateStatusBar();
        }
    }

    // 검색 토글
    toggleSearch() {
        if (this.searchBar.classList.contains('hidden')) {
            this.searchBar.classList.remove('hidden');
            this.searchInput.focus();
        } else {
            this.closeSearch();
        }
    }

    // 검색 닫기
    closeSearch() {
        this.searchBar.classList.add('hidden');
        this.clearSearchHighlights();
        this.editor.focus();
    }

    // 검색 수행
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
        } else {
            this.searchCount.textContent = '일치하는 항목 없음';
        }
    }

    // 검색 하이라이트 제거
    clearSearchHighlights() {
        this.searchMatches = [];
        this.currentSearchIndex = -1;
    }

    // 이전 검색 결과로 이동
    searchPrevious() {
        if (this.searchMatches.length === 0) return;
        
        this.currentSearchIndex = this.currentSearchIndex > 0 
            ? this.currentSearchIndex - 1 
            : this.searchMatches.length - 1;
        
        this.scrollToMatch(this.currentSearchIndex);
        this.updateSearchCounter();
    }

    // 다음 검색 결과로 이동
    searchNext() {
        if (this.searchMatches.length === 0) return;
        
        this.currentSearchIndex = this.currentSearchIndex < this.searchMatches.length - 1 
            ? this.currentSearchIndex + 1 
            : 0;
        
        this.scrollToMatch(this.currentSearchIndex);
        this.updateSearchCounter();
    }

    // 검색 카운터 업데이트
    updateSearchCounter() {
        if (this.searchMatches.length > 0) {
            this.searchCount.textContent = `${this.currentSearchIndex + 1}/${this.searchMatches.length}`;
        }
    }

    // 검색 결과로 스크롤
    scrollToMatch(index) {
        if (index < 0 || index >= this.searchMatches.length) return;
        
        const match = this.searchMatches[index];
        this.editor.focus();
        this.editor.setSelectionRange(match.index, match.index + match.length);
        
        // 스크롤 위치 조정
        const textBeforeMatch = this.editor.value.substring(0, match.index);
        const linesBefore = textBeforeMatch.split('\n').length - 1;
        const lineHeight = 20;
        const scrollTop = linesBefore * lineHeight;
        this.editor.scrollTop = Math.max(0, scrollTop - this.editor.clientHeight / 2);
    }

    // 테마 설정
    setTheme(theme) {
        console.log('Setting theme to:', theme); // 디버깅용
        this.currentTheme = theme;
        localStorage.setItem('webeditor-theme', this.currentTheme);
        this.applyTheme();
    }

    // 테마 적용
    applyTheme() {
        const html = document.documentElement;
        console.log('Applying theme:', this.currentTheme); // 디버깅용
        
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

    // 시스템 테마 적용
    applySystemTheme() {
        const html = document.documentElement;
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (prefersDark) {
            html.classList.add('dark');
        } else {
            html.classList.remove('dark');
        }
    }

    // 키보드 단축키 처리
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
        
        // ESC 키로 검색 닫기
        if (event.key === 'Escape') {
            if (!this.searchBar.classList.contains('hidden')) {
                this.closeSearch();
            } else {
                this.closeAllDropdowns();
            }
        }
    }

    // 에디터 키 이벤트 처리
    handleKeyDown(event) {
        // Tab 키 처리 (4칸 들여쓰기)
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

    // 상태 표시줄 업데이트
    updateStatusBar() {
        const text = this.editor.value;
        const cursorPosition = this.editor.selectionStart;
        
        // 커서 위치 계산
        const textBeforeCursor = text.substring(0, cursorPosition);
        const lines = textBeforeCursor.split('\n');
        const line = lines.length;
        const column = lines[lines.length - 1].length + 1;
        
        // 문자 수 계산
        const charCount = text.length;
        
        // 상태 표시줄 업데이트
        this.cursorPos.textContent = `줄: ${line}, 열: ${column}`;
        this.charCount.textContent = `${charCount}자`;
    }

    // 에디터 포커스
    focus() {
        this.editor.focus();
    }
}

// 애플리케이션 초기화
document.addEventListener('DOMContentLoaded', () => {
    const webEditor = new WebEditor();
    
    // 페이지 로드 시 에디터에 포커스
    webEditor.focus();
    
    // 페이지 벗어나기 전 경고 (내용이 있는 경우)
    window.addEventListener('beforeunload', (e) => {
        if (webEditor.editor.value.trim()) {
            e.preventDefault();
            e.returnValue = '';
        }
    });
});

// 서비스 워커 등록 (PWA 지원)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
