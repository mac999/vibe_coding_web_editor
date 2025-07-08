// 서비스 워커 - 오프라인 지원 및 캐싱

const CACHE_NAME = 'web-editor-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/script.js',
    '/manifest.json',
    'https://cdn.tailwindcss.com'
];

// 설치 이벤트
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('캐시 열림');
                return cache.addAll(urlsToCache);
            })
    );
});

// 활성화 이벤트
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('이전 캐시 삭제:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// 페치 이벤트
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // 캐시에 있으면 캐시에서 반환
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});
