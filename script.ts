// 웹 기반 텍스트 편집기 - TypeScript 파일

// 타입 정의
type Theme = 'system' | 'light' | 'dark';

interface SearchMatch {
    index: number;
    length: number;
}

interface WebEditorConfig {
    theme: Theme;
    searchMatches: SearchMatch[];
    currentSearchIndex: number;
}

// 웹 편집기 클래스
class WebEditor {
    private readonly editor: HTMLTextAreaElement;
    private readonly searchBar: HTMLElement;
    private readonly searchInput: HTMLInputElement;
    private readonly searchCount: HTMLElement;
    private readonly cursorPos: HTMLElement;
    private readonly charCount: HTMLElement;
    private readonly themeStatus: HTMLElement;
    private readonly themeIcon: HTMLElement;
    private readonly fileInput: HTMLInputElement;
    
    private currentTheme: Theme = 'system';
    private searchMatches: SearchMatch[] = [];
    private currentSearchIndex: number = -1;
    
    constructor() {
        // DOM 요소 초기화 및 타입 확인
        this.editor = this.getElement<HTMLTextAreaElement>('editor');
        this.searchBar = this.getElement<HTMLElement>('searchBar');
        this.searchInput = this.getElement<HTMLInputElement>('searchInput');
        this.searchCount = this.getElement<HTMLElement>('searchCount');
        this.cursorPos = this.getElement<HTMLElement>('cursorPos');
        this.charCount = this.getElement<HTMLElement>('charCount');
        this.themeStatus = this.getElement<HTMLElement>('themeStatus');
        this.themeIcon = this.getElement<HTMLElement>('themeIcon');
        this.fileInput = this.getElement<HTMLInputElement>('fileInput');
        
        this.initializeEventListeners();
        this.initializeTheme();
        this.updateStatusBar();
        this.setupDropdowns();
    }

    private getElement<T extends HTMLElement>(id: string): T {
        const element = document.getElementById(id) as T;
        if (!element) {
            throw new Error(`Element with id "${id}" not found`);
        }
        return element;
    }

    private setupDropdowns(): void {
        // 드롭다운 토글 이벤트
        const dropdownTriggers = document.querySelectorAll<HTMLElement>('.dropdown-trigger');
        dropdownTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e: Event) => {
                e.stopPropagation();
                const dropdown = trigger.closest('.dropdown') as HTMLElement;
                if (!dropdown) return;
                
                const menu = dropdown.querySelector('.dropdown-menu') as HTMLElement;
                if (!menu) return;
                
                // 다른 메뉴들 닫기
                this.closeAllDropdowns();
                
                // 현재 메뉴 토글
                menu.classList.toggle('show');
            });
        });

        // 문서 클릭 시 모든 드롭다운 닫기
        document.addEventListener('click', (e: Event) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.dropdown')) {
                this.closeAllDropdowns();
            }
        });

        // 메뉴 아이템 클릭 시 드롭다운 닫기
        const menuItems = document.querySelectorAll<HTMLElement>('.menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                this.closeAllDropdowns();
            });
        });
    }

    private closeAllDropdowns(): void {
        const dropdownMenus = document.querySelectorAll<HTMLElement>('.dropdown-menu');
        dropdownMenus.forEach(menu => {
            menu.classList.remove('show');
        });
    }

    private initializeEventListeners(): void {
        // 파일 메뉴
        this.getElement<HTMLButtonElement>('newBtn').addEventListener('click', () => this.newDocument());
        this.getElement<HTMLButtonElement>('openBtn').addEventListener('click', () => this.openFile());
        this.getElement<HTMLButtonElement>('saveBtn').addEventListener('click', () => this.saveFile());
        
        // 편집 메뉴
        this.getElement<HTMLButtonElement>('undoBtn').addEventListener('click', () => this.undo());
        this.getElement<HTMLButtonElement>('redoBtn').addEventListener('click', () => this.redo());
        this.getElement<HTMLButtonElement>('cutBtn').addEventListener('click', () => this.cut());
        this.getElement<HTMLButtonElement>('copyBtn').addEventListener('click', () => this.copy());
        this.getElement<HTMLButtonElement>('pasteBtn').addEventListener('click', () => this.paste());
        this.getElement<HTMLButtonElement>('searchBtn').addEventListener('click', () => this.toggleSearch());
        
        // 테마 메뉴
        this.getElement<HTMLButtonElement>('systemThemeBtn').addEventListener('click', () => this.setTheme('system'));
        this.getElement<HTMLButtonElement>('lightThemeBtn').addEventListener('click', () => this.setTheme('light'));
        this.getElement<HTMLButtonElement>('darkThemeBtn').addEventListener('click', () => this.setTheme('dark'));
        
        // 검색 관련
        this.getElement<HTMLButtonElement>('searchCloseBtn').addEventListener('click', () => this.closeSearch());
        this.searchInput.addEventListener('input', (e: Event) => {
            const target = e.target as HTMLInputElement;
            this.performSearch(target.value);
        });
        this.getElement<HTMLButtonElement>('searchPrevBtn').addEventListener('click', () => this.searchPrevious());
        this.getElement<HTMLButtonElement>('searchNextBtn').addEventListener('click', () => this.searchNext());
        
        // 에디터 관련
        this.editor.addEventListener('input', () => this.updateStatusBar());
        this.editor.addEventListener('keyup', () => this.updateStatusBar());
        this.editor.addEventListener('click', () => this.updateStatusBar());
        this.editor.addEventListener('keydown', (e: KeyboardEvent) => this.handleKeyDown(e));
        
        // 파일 입력
        this.fileInput.addEventListener('change', (e: Event) => this.handleFileLoad(e));
        
        // 전역 키보드 단축키
        document.addEventListener('keydown', (e: KeyboardEvent) => this.handleGlobalKeyDown(e));
        
        // 시스템 테마 변경 감지
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', () => {
            if (this.currentTheme === 'system') {
                this.applySystemTheme();
            }
        });
    }

    private initializeTheme(): void {
        const savedTheme = localStorage.getItem('webeditor-theme') as Theme;
        if (savedTheme && ['system', 'light', 'dark'].includes(savedTheme)) {
            this.currentTheme = savedTheme;
        }
        this.applyTheme();
    }

    // 새 문서 생성
    public newDocument(): void {
        if (this.editor.value.trim() && !confirm('현재 내용이 사라집니다. 계속하시겠습니까?')) {
            return;
        }
        this.editor.value = '';
        this.updateStatusBar();
        this.editor.focus();
    }

    // 파일 열기
    public openFile(): void {
        this.fileInput.click();
    }

    // 파일 로드 처리
    private handleFileLoad(event: Event): void {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        if (!file) return;
        
        if (file.type !== 'text/plain' && !file.name.endsWith('.txt')) {
            alert('텍스트 파일(.txt)만 지원됩니다.');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
            if (e.target?.result) {
                this.editor.value = e.target.result as string;
                this.updateStatusBar();
                this.editor.focus();
            }
        };
        reader.readAsText(file, 'UTF-8');
        
        // 파일 입력 초기화
        this.fileInput.value = '';
    }

    // 파일 저장
    public saveFile(): void {
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
    public undo(): void {
        document.execCommand('undo');
        this.updateStatusBar();
    }

    public redo(): void {
        document.execCommand('redo');
        this.updateStatusBar();
    }

    public cut(): void {
        if (this.editor.selectionStart !== this.editor.selectionEnd) {
            document.execCommand('cut');
            this.updateStatusBar();
        }
    }

    public copy(): void {
        if (this.editor.selectionStart !== this.editor.selectionEnd) {
            document.execCommand('copy');
        }
    }

    public async paste(): Promise<void> {
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
    public toggleSearch(): void {
        if (this.searchBar.classList.contains('hidden')) {
            this.searchBar.classList.remove('hidden');
            this.searchInput.focus();
        } else {
            this.closeSearch();
        }
    }

    // 검색 닫기
    public closeSearch(): void {
        this.searchBar.classList.add('hidden');
        this.clearSearchHighlights();
        this.editor.focus();
    }

    // 검색 수행
    private performSearch(query: string): void {
        this.clearSearchHighlights();
        
        if (!query) {
            this.searchCount.textContent = '';
            return;
        }
        
        const content = this.editor.value;
        const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        const matches = [...content.matchAll(regex)];
        
        this.searchMatches = matches.map(match => ({
            index: match.index!,
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
    private clearSearchHighlights(): void {
        this.searchMatches = [];
        this.currentSearchIndex = -1;
    }

    // 이전 검색 결과로 이동
    public searchPrevious(): void {
        if (this.searchMatches.length === 0) return;
        
        this.currentSearchIndex = this.currentSearchIndex > 0 
            ? this.currentSearchIndex - 1 
            : this.searchMatches.length - 1;
        
        this.scrollToMatch(this.currentSearchIndex);
        this.updateSearchCounter();
    }

    // 다음 검색 결과로 이동
    public searchNext(): void {
        if (this.searchMatches.length === 0) return;
        
        this.currentSearchIndex = this.currentSearchIndex < this.searchMatches.length - 1 
            ? this.currentSearchIndex + 1 
            : 0;
        
        this.scrollToMatch(this.currentSearchIndex);
        this.updateSearchCounter();
    }

    // 검색 카운터 업데이트
    private updateSearchCounter(): void {
        if (this.searchMatches.length > 0) {
            this.searchCount.textContent = `${this.currentSearchIndex + 1}/${this.searchMatches.length}`;
        }
    }

    // 검색 결과로 스크롤
    private scrollToMatch(index: number): void {
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
    public setTheme(theme: Theme): void {
        console.log('Setting theme to:', theme);
        this.currentTheme = theme;
        localStorage.setItem('webeditor-theme', this.currentTheme);
        this.applyTheme();
    }

    // 테마 적용
    private applyTheme(): void {
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

    // 시스템 테마 적용
    private applySystemTheme(): void {
        const html = document.documentElement;
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (prefersDark) {
            html.classList.add('dark');
        } else {
            html.classList.remove('dark');
        }
    }

    // 키보드 단축키 처리
    private handleGlobalKeyDown(event: KeyboardEvent): void {
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
    private handleKeyDown(event: KeyboardEvent): void {
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
    private updateStatusBar(): void {
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
    public focus(): void {
        this.editor.focus();
    }

    // 현재 설정 가져오기
    public getConfig(): WebEditorConfig {
        return {
            theme: this.currentTheme,
            searchMatches: this.searchMatches,
            currentSearchIndex: this.currentSearchIndex
        };
    }
}

// 애플리케이션 초기화
document.addEventListener('DOMContentLoaded', () => {
    const webEditor = new WebEditor();
    
    // 페이지 로드 시 에디터에 포커스
    webEditor.focus();
    
    // 페이지 벗어나기 전 경고 (내용이 있는 경우)
    window.addEventListener('beforeunload', (e: BeforeUnloadEvent) => {
        const editor = document.getElementById('editor') as HTMLTextAreaElement;
        if (editor && editor.value.trim()) {
            e.preventDefault();
            e.returnValue = '';
        }
    });
});

// 서비스 워커 등록 (PWA 지원)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration: ServiceWorkerRegistration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError: any) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// 타입 정의 파일을 위한 내보내기
export { WebEditor, type Theme, type SearchMatch, type WebEditorConfig };

// 전역 타입 정의

declare global {
    interface Window {
        WebEditor: typeof import('./script').WebEditor;
    }
}

// 모듈 확장을 위한 빈 내보내기
export {};