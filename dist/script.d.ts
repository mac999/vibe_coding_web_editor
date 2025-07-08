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
declare class WebEditor {
    private readonly editor;
    private readonly searchBar;
    private readonly searchInput;
    private readonly searchCount;
    private readonly cursorPos;
    private readonly charCount;
    private readonly themeStatus;
    private readonly themeIcon;
    private readonly fileInput;
    private currentTheme;
    private searchMatches;
    private currentSearchIndex;
    constructor();
    private getElement;
    private setupDropdowns;
    private closeAllDropdowns;
    private initializeEventListeners;
    private initializeTheme;
    newDocument(): void;
    openFile(): void;
    private handleFileLoad;
    saveFile(): void;
    undo(): void;
    redo(): void;
    cut(): void;
    copy(): void;
    paste(): Promise<void>;
    toggleSearch(): void;
    closeSearch(): void;
    private performSearch;
    private clearSearchHighlights;
    searchPrevious(): void;
    searchNext(): void;
    private updateSearchCounter;
    private scrollToMatch;
    setTheme(theme: Theme): void;
    private applyTheme;
    private applySystemTheme;
    private handleGlobalKeyDown;
    private handleKeyDown;
    private updateStatusBar;
    focus(): void;
    getConfig(): WebEditorConfig;
}
export { WebEditor, type Theme, type SearchMatch, type WebEditorConfig };
declare global {
    interface Window {
        WebEditor: typeof import('./script').WebEditor;
    }
}
export {};
//# sourceMappingURL=script.d.ts.map