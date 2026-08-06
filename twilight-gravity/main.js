document.addEventListener('DOMContentLoaded', () => {
    // 0. Preloader Failsafe Logic — Ensures website always opens instantly
    const preloader = document.getElementById('preloader');
    if (preloader) {
        const removePreloader = () => {
            preloader.classList.add('fade-out');
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 400);
        };

        if (document.readyState === 'complete') {
            removePreloader();
        } else {
            window.addEventListener('load', removePreloader, { once: true });
            setTimeout(removePreloader, 1000); // 1-second failsafe guarantee
        }
    }

    // Clean Subdirectory URL Path Routing for Mobile & Desktop (/home, /experience, /youtube, /ytdownloader, /streamvault, /contact, /stats, /feedback)
    const currentPath = window.location.pathname.replace('/', '').toLowerCase();
    const validSections = ['home', 'experience', 'youtube', 'ytdownloader', 'streamvault', 'contact', 'stats', 'feedback'];

    const openStreamVaultModal = () => {
        const modal = document.getElementById('streamvault-modal');
        const hamburger = document.getElementById('hamburger');
        const mobileMenu = document.getElementById('mobile-menu');

        // Close mobile menu drawer if open
        if (hamburger && hamburger.classList.contains('active')) {
            hamburger.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
        }
        if (mobileMenu && mobileMenu.classList.contains('open')) {
            mobileMenu.classList.remove('open');
        }

        if (modal) {
            hideResultCard();
            modal.classList.add('active');
            document.body.classList.add('modal-open');
            document.body.style.overflow = 'hidden';
            // Switch page title to YT Downloader when modal opens
            document.title = 'Amit Kushwaha - YT Video Downloader';

            // Auto-focus input box on desktop devices only (prevents unwanted mobile virtual keyboard popup)
            const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth <= 768);
            if (!isTouchDevice) {
                setTimeout(() => {
                    const videoUrlInput = document.getElementById('video-url');
                    if (videoUrlInput) {
                        videoUrlInput.focus();
                        try {
                            videoUrlInput.setSelectionRange(videoUrlInput.value.length, videoUrlInput.value.length);
                        } catch (e) {}
                    }
                }, 300);
            }
        }
    };

    const closeStreamVaultModal = () => {
        const modal = document.getElementById('streamvault-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            // Restore portfolio title when modal closes
            document.title = 'Amit Kushwaha';
            if (window.location.protocol.startsWith('http') && (window.location.pathname.includes('ytdownloader') || window.location.pathname.includes('streamvault'))) {
                window.history.pushState({}, document.title, '/home');
            }
        }
    };

    if (currentPath && validSections.includes(currentPath)) {
        if (currentPath === 'feedback') {
            setTimeout(() => {
                const feedbackModal = document.getElementById('feedback-modal');
                if (feedbackModal) {
                    feedbackModal.classList.add('active');
                    document.body.classList.add('modal-open');
                }
            }, 600);
        } else if (currentPath === 'ytdownloader' || currentPath === 'streamvault') {
            setTimeout(openStreamVaultModal, 400);
        } else {
            setTimeout(() => {
                const target = document.getElementById(currentPath);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }, 600);
        }
    }

    // Dropdown Toggle Handler (Supports Mobile Touch & Desktop Click)
    document.querySelectorAll('.nav-dropdown-toggle').forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const dropdownItem = toggle.closest('.nav-item-dropdown');
            if (dropdownItem) {
                dropdownItem.classList.toggle('active');
            }
        });
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-item-dropdown')) {
            document.querySelectorAll('.nav-item-dropdown.active').forEach(item => item.classList.remove('active'));
        }
    });

    // Intercept nav link clicks (#home, #experience, /home, /youtube, /ytdownloader, /streamvault etc.)
    document.querySelectorAll('a[href^="#"], a[href^="/"]').forEach(link => {
        const href = link.getAttribute('href');
        if (!href || href === '/' || href === '#') return;
        const section = href.replace('/', '').replace('#', '');
        const validSections = ['home', 'experience', 'youtube', 'ytdownloader', 'streamvault', 'contact', 'stats'];
        if (validSections.includes(section)) {
            link.addEventListener('click', e => {
                e.preventDefault();
                if (section === 'ytdownloader' || section === 'streamvault') {
                    openStreamVaultModal();
                    if (window.location.protocol.startsWith('http')) {
                        window.history.pushState({}, document.title, '/ytdownloader');
                    }
                } else {
                    const target = document.getElementById(section);
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth' });
                        if (window.location.protocol.startsWith('http')) {
                            window.history.pushState({}, document.title, '/' + section);
                        }
                    }
                }
            });
        }
    });

    // Mobile Sidebar "More" Accordion Toggle Handler
    const mobileMoreToggle = document.getElementById('mobile-more-toggle');
    const mobileMoreSubmenu = document.getElementById('mobile-more-submenu');

    if (mobileMoreToggle && mobileMoreSubmenu) {
        mobileMoreToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            mobileMoreSubmenu.classList.toggle('hidden');
            const parent = mobileMoreToggle.closest('.mobile-dropdown-item');
            if (parent) parent.classList.toggle('open');
        });
    }

    // Dedicated Click Handlers ONLY for YT Video Downloader links
    document.querySelectorAll('a[href*="ytdownloader"], a[href*="streamvault"], .mobile-streamvault-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            openStreamVaultModal();
            if (window.location.protocol.startsWith('http')) {
                window.history.pushState({}, document.title, '/ytdownloader');
            }
        });
    });

    // StreamVault Modal Close Listener
    const closeSvBtn = document.getElementById('close-streamvault-btn');
    const svModal = document.getElementById('streamvault-modal');
    if (closeSvBtn) closeSvBtn.addEventListener('click', closeStreamVaultModal);
    if (svModal) {
        svModal.addEventListener('click', e => {
            if (e.target === svModal) closeStreamVaultModal();
        });
    }

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeStreamVaultModal();
    });

    // Custom Cursor Logic — Desktop Only (Completely hidden on all touch/mobile devices)
    const cursor = document.getElementById('custom-cursor');
    const isMobileDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth <= 768);

    if (cursor) {
        if (isMobileDevice) {
            // Completely disable cursor on mobile — hide it immediately
            cursor.style.display = 'none';
            cursor.style.visibility = 'hidden';
            cursor.style.opacity = '0';
            cursor.style.pointerEvents = 'none';
        } else {
            let cursorX = window.innerWidth / 2;
            let cursorY = window.innerHeight / 2;
            let isCursorMoving = false;

            const renderCursor = () => {
                cursor.style.transform = `translate(${cursorX - 10}px, ${cursorY - 10}px)`;
                isCursorMoving = false;
            };

            const updateCursorPos = (x, y) => {
                cursorX = x;
                cursorY = y;
                if (!isCursorMoving) {
                    isCursorMoving = true;
                    requestAnimationFrame(renderCursor);
                }
            };

            // Desktop mouse tracking only — no touch events on cursor
            document.addEventListener('mousemove', e => updateCursorPos(e.clientX, e.clientY));

            // Hover effects — desktop only
            document.addEventListener('mouseover', e => {
                if (e.target.closest('a, button, input, textarea, select, .chip, .sv-chip, .btn, .sv-btn-primary, .sv-btn-secondary, .download-btn, .sv-close-btn, .magnetic-element')) {
                    cursor.classList.add('hover');
                }
            });

            document.addEventListener('mouseout', e => {
                if (e.target.closest('a, button, input, textarea, select, .chip, .sv-chip, .btn, .sv-btn-primary, .sv-btn-secondary, .download-btn, .sv-close-btn, .magnetic-element')) {
                    cursor.classList.remove('hover');
                }
            });
        }
    }

    // Haptic Feedback Logic
    document.addEventListener('click', e => {
        if (e.target.closest('a, button, input, textarea')) {
            if (navigator.vibrate) {
                navigator.vibrate(10);
            }
        }
    });

    // Advanced Magnetic Button Physics
    const advancedMagneticElements = document.querySelectorAll('.btn, .glass-card, .hamburger');
    advancedMagneticElements.forEach(btn => {
        let magneticX = 0; let magneticY = 0;
        let isMagneticMoving = false;

        const renderMagnetic = () => {
            btn.style.transform = `translate(${magneticX * 0.3}px, ${magneticY * 0.3}px)`;
            btn.style.transition = 'transform 0.1s ease-out';
            isMagneticMoving = false;
        };

        btn.addEventListener('mousemove', (e) => {
            // Disable background magnetic effects if a modal is open 
            if (document.body.classList.contains('modal-open')) return;

            const rect = btn.getBoundingClientRect();
            // Calculate distance from center of element to mouse
            magneticX = e.clientX - rect.left - rect.width / 2;
            magneticY = e.clientY - rect.top - rect.height / 2;

            if (!isMagneticMoving) {
                isMagneticMoving = true;
                requestAnimationFrame(renderMagnetic);
            }
        });

        btn.addEventListener('mouseleave', () => {
            // Snap back to original position cleanly without queueing
            requestAnimationFrame(() => {
                btn.style.transform = `translate(0px, 0px)`;
                btn.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)';
            });
        });
    });

    // Page Transition Logic
    const transitionOverlay = document.createElement('div');
    transitionOverlay.className = 'page-transition-overlay';
    document.body.appendChild(transitionOverlay);

    document.querySelectorAll('a[href^="http"]').forEach(link => {
        // Only apply to external links to keep local hashtag scrolling smooth
        link.addEventListener('click', e => {
            const targetUrl = link.getAttribute('href');
            // If it is the magic button, let its own animation handle it
            if (link.classList.contains('yt-subscribe')) return;

            e.preventDefault();
            transitionOverlay.classList.add('active');

            setTimeout(() => {
                window.location.href = targetUrl;
            }, 600); // Matches CSS transition duration

            // Extreme Failsafe: If the page hasn't unloaded after 2 seconds, remove the overlay
            // This catches edge cases where the browser blocks the navigation or opens it in a new tab silently
            setTimeout(() => {
                transitionOverlay.classList.remove('active');
            }, 2000);
        });
    });

    // Fix bfcache (Back-Forward Cache) issue where overlay stays stuck when pressing back button
    window.addEventListener('pageshow', (e) => {
        // Always try to remove it when the page is shown, regardless of bfcache status
        transitionOverlay.classList.remove('active');
    });

    // Secondary iOS/Safari Mobile Failsafe: Clear overlay when tab becomes visible again
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            transitionOverlay.classList.remove('active');
        }
    });

    // 1. Theme Toggle Logic
    const themeToggle = document.getElementById('theme-toggle');

    const setTheme = (theme, saveToStorage = true) => {
        document.documentElement.setAttribute('data-theme', theme);

        // Force webkit scrollbar repaint by toggling an explicit class
        if (theme === 'light') {
            document.documentElement.classList.add('light-scrollbar');
        } else {
            document.documentElement.classList.remove('light-scrollbar');
        }

        if (saveToStorage) {
            // User manually chose - save both the theme AND mark as a manual override
            localStorage.setItem('theme', theme);
            localStorage.setItem('theme_override', 'true');
        }
    };

    // Listen for real-time system theme changes
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
        // Only auto-switch if the user has NOT explicitly set a manual preference
        const isUserOverride = localStorage.getItem('theme_override') === 'true';
        if (!isUserOverride) {
            setTheme(e.matches ? 'light' : 'dark', false);
        }
    });

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            // Read exactly what the blocking script in index.html set the theme to
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            setTheme(newTheme, true);
        });
    }

    // 2. Navbar Scroll Effect
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Show Feedback Button only when Contact section is visible
    const floatingFeedbackBtn = document.getElementById('open-feedback-btn');
    const contactSection = document.getElementById('contact');
    if (floatingFeedbackBtn && contactSection) {
        const feedbackBtnObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    floatingFeedbackBtn.style.opacity = '0.92';
                    floatingFeedbackBtn.style.pointerEvents = 'auto';
                } else {
                    floatingFeedbackBtn.style.opacity = '0';
                    floatingFeedbackBtn.style.pointerEvents = 'none';
                }
            });
        }, { threshold: 0.1 });
        feedbackBtnObserver.observe(contactSection);
    }

    // 3. ScrollSpy & Mobile Menu Logic
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-links a');
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');

    // Toggle mobile menu
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            mobileMenu.classList.toggle('open');
            const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
            hamburger.setAttribute('aria-expanded', !isExpanded);

            // Lock body scroll when overlay is open
            document.body.style.overflow = hamburger.classList.contains('active') ? 'hidden' : '';
        });
    }

    // Close mobile menu on clicking a link
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (hamburger.classList.contains('active')) {
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('open');
                hamburger.setAttribute('aria-expanded', 'false');
                if (!document.body.classList.contains('modal-open')) {
                    document.body.style.overflow = '';
                }
            }
        });
    });

    // Active Link Highlighting (both desktop and mobile)
    const allNavLinks = [...navLinks, ...mobileNavLinks];

    window.addEventListener('scroll', () => {
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        allNavLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current) && current !== '') {
                link.classList.add('active');
            }
        });

        if (current && window.location.protocol.startsWith('http') && !document.body.classList.contains('modal-open')) {
            const cleanUrl = '/' + current;
            if (window.location.pathname !== cleanUrl) {
                window.history.replaceState({}, document.title, cleanUrl);
            }
        }
    });

    // 4. Intersection Observer for Scroll Animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const animationType = element.getAttribute('data-animation');

                // Remove hidden class and add animation class
                element.classList.remove('hidden');

                if (animationType === 'fade-up') {
                    element.classList.add('animate-fade-up');
                } else if (animationType === 'fade-in') {
                    element.classList.add('animate-fade-in');
                } else if (animationType === 'zoom-in') {
                    element.classList.add('animate-zoom-in');
                } else if (animationType === 'fade-up-stagger') {
                    // Add a slight delay based on the element's position among siblings
                    const siblings = Array.from(element.parentElement.children).filter(el => el.getAttribute('data-animation') === 'fade-up-stagger');
                    const index = siblings.indexOf(element);
                    element.style.animationDelay = `${index * 0.15}s`;
                    element.classList.add('animate-fade-up');
                }

                observer.unobserve(element);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.hidden');
    animatedElements.forEach(el => observer.observe(el));

    // 5. YouTube Subscribe Button — Direct Channel Link
    const ytSubscribeButton = document.getElementById('yt-subscribe-btn') || document.querySelector('.yt-subscribe-btn');
    if (ytSubscribeButton) {
        ytSubscribeButton.addEventListener('click', function (e) {
            e.preventDefault();
            window.open('https://youtube.com/@amitkushwaha0018', '_blank', 'noopener,noreferrer');
        });
    }

    // 6. Magnetic Hover Effect (Premium 3D Interaction)
    const magneticElements = document.querySelectorAll('.btn-primary, .timeline-content, .blob-container, .stat-card');

    // Add base utility class to all target elements
    magneticElements.forEach(el => el.classList.add('magnetic-element'));

    magneticElements.forEach(element => {
        element.addEventListener('mousemove', (e) => {
            const rect = element.getBoundingClientRect();

            // Calculate mouse position relative to the element (from -1 to 1)
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;

            // Multiplier for the intensity of the tilt (adjust for dramatic vs subtle)
            const multiplier = 25;

            // Apply 3D rotation based on mouse position
            element.style.transform = `perspective(1000px) rotateX(${-y * multiplier}deg) rotateY(${x * multiplier}deg) scale3d(1.05, 1.05, 1.05)`;
            element.style.boxShadow = `${-x * 20}px ${-y * 20}px 30px rgba(99, 102, 241, 0.2)`;
        });

        element.addEventListener('mouseleave', () => {
            // Reset to natural state gracefully
            element.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            element.style.boxShadow = '';

            // If it's the hero visual blob, bring back its natural hover scale
            if (element.classList.contains('blob-container')) {
                element.style.transform = '';
            }
        });
    });

    // 7. Fetch YouTube Videos using Data API v3
    const ytChannelId = 'UCUisfQ3CLN_7sFl7kMtTD9g'; // Based on @amitkushwaha0018
    const apiKey = 'AIzaSyCYe6pPDE_tbum_qSIP3xij7oO2dVZrVf0'; // User API Key
    const shortsContainer = document.getElementById('youtube-shorts-container');
    const videosContainer = document.getElementById('youtube-videos-container');

    if (shortsContainer && videosContainer) {
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${ytChannelId}&part=snippet,id&order=date&maxResults=30&type=video`;

        fetch(searchUrl)
            .then(response => response.json())
            .then(searchData => {
                if (!searchData.items || searchData.items.length === 0) {
                    shortsContainer.innerHTML = '<p style="color: var(--text-secondary); text-align: center; width: 100%; padding: 3rem 0;">No shorts available yet.</p>';
                    return null;
                }

                const videoIds = searchData.items.map(item => item.id.videoId).join(',');
                const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?key=${apiKey}&id=${videoIds}&part=contentDetails,snippet,statistics`;

                return fetch(detailsUrl);
            })
            .then(response => {
                if (!response) return null;
                return response.json();
            })
            .then(detailsData => {
                if (!detailsData || !detailsData.items) return;

                shortsContainer.innerHTML = ''; // Clear placeholders
                videosContainer.innerHTML = '';

                let shortsCount = 0;
                let videosCount = 0;

                detailsData.items.forEach(video => {
                    const durationStr = video.contentDetails ? video.contentDetails.duration : '';

                    // Robust ISO 8601 duration parsing (PT1M30S -> 90s, PT3M5S -> 185s)
                    let totalSeconds = 0;
                    const matchPattern = durationStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
                    if (matchPattern) {
                        const h = parseInt(matchPattern[1] || 0);
                        const m = parseInt(matchPattern[2] || 0);
                        const s = parseInt(matchPattern[3] || 0);
                        totalSeconds = (h * 3600) + (m * 60) + s;
                    }

                    const title = video.snippet ? video.snippet.title : '';
                    const desc = (video.snippet && video.snippet.description) ? video.snippet.description.toLowerCase() : '';
                    const lowerTitle = title.toLowerCase();

                    // STRICT Shorts check: <= 180s (3 mins) OR title/desc includes #shorts / #short
                    const isShort = (totalSeconds > 0 && totalSeconds <= 180) || 
                                    lowerTitle.includes('#shorts') || 
                                    lowerTitle.includes('#short') || 
                                    desc.includes('#shorts') || 
                                    desc.includes('#short');

                    // STRICT Long-form check: Must be > 180s AND NOT marked as short
                    const isLongForm = (totalSeconds > 180) && !lowerTitle.includes('#shorts') && !desc.includes('#shorts');

                    const pubDate = new Date(video.snippet.publishedAt);
                    const date = `${String(pubDate.getDate()).padStart(2, '0')}/${String(pubDate.getMonth() + 1).padStart(2, '0')}/${pubDate.getFullYear()}`;
                    const videoId = video.id;
                    const thumbnailUrl = video.snippet.thumbnails.high ? video.snippet.thumbnails.high.url : video.snippet.thumbnails.default.url;

                    if (isShort && shortsCount < 6) {
                        const videoCard = document.createElement('a');
                        videoCard.target = '_blank';
                        videoCard.rel = 'noopener noreferrer';
                        videoCard.className = 'video-wrapper glass-card';
                        videoCard.style.textDecoration = 'none';
                        videoCard.style.display = 'block';
                        videoCard.style.overflow = 'hidden';
                        videoCard.href = `https://www.youtube.com/shorts/${videoId}`;
                        const rawViews = parseInt(video.statistics ? video.statistics.viewCount : 0);
                        const formattedViews = rawViews.toLocaleString('en-IN');
                        videoCard.innerHTML = `
                            <div class="video-thumbnail" style="position: relative; padding-bottom: 177.77%; height: 0; overflow: hidden; background: #000;">
                                <img src="${thumbnailUrl}" alt="${title}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;">
                                <div class="play-overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s; color: white;">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                                </div>
                            </div>
                            <div class="video-info" style="padding: 1.25rem;">
                                <h3 style="color: var(--text-primary); font-size: 1.05rem; margin: 0 0 0.5rem 0; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${title}</h3>
                                <div class="video-live-views" style="margin-bottom: 0.25rem; font-size: 0.85rem; font-weight: 600; color: var(--text-secondary);">
                                    <span>${formattedViews} views</span>
                                </div>
                                <p style="color: var(--text-secondary); font-size: 0.85rem; margin: 0;">${date}</p>
                            </div>
                        `;
                        videoCard.addEventListener('mouseenter', () => { videoCard.querySelector('.play-overlay').style.opacity = '1'; });
                        videoCard.addEventListener('mouseleave', () => { videoCard.querySelector('.play-overlay').style.opacity = '0'; });
                        shortsContainer.appendChild(videoCard);
                        shortsCount++;
                    } else if (isLongForm && videosCount < 3) {
                        const videoCard = document.createElement('a');
                        videoCard.target = '_blank';
                        videoCard.rel = 'noopener noreferrer';
                        videoCard.className = 'video-wrapper glass-card widescreen';
                        videoCard.style.textDecoration = 'none';
                        videoCard.style.display = 'block';
                        videoCard.style.overflow = 'hidden';
                        videoCard.href = `https://www.youtube.com/watch?v=${videoId}`;
                        const rawViews = parseInt(video.statistics ? video.statistics.viewCount : 0);
                        const formattedViews = rawViews.toLocaleString('en-IN');
                        videoCard.innerHTML = `
                            <div class="video-thumbnail" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; background: #000;">
                                <img src="${thumbnailUrl}" alt="${title}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;">
                                <div class="play-overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s; color: white;">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                                </div>
                            </div>
                            <div class="video-info" style="padding: 1.25rem;">
                                <h3 style="color: var(--text-primary); font-size: 1.05rem; margin: 0 0 0.5rem 0; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${title}</h3>
                                <div class="video-live-views" style="margin-bottom: 0.25rem; font-size: 0.85rem; font-weight: 600; color: var(--text-secondary);">
                                    <span>${formattedViews} views</span>
                                </div>
                                <p style="color: var(--text-secondary); font-size: 0.85rem; margin: 0;">${date}</p>
                            </div>
                        `;
                        videoCard.addEventListener('mouseenter', () => { videoCard.querySelector('.play-overlay').style.opacity = '1'; });
                        videoCard.addEventListener('mouseleave', () => { videoCard.querySelector('.play-overlay').style.opacity = '0'; });
                        videosContainer.appendChild(videoCard);
                        videosCount++;
                    }
                });

                // Add Empty states if count is 0
                if (shortsCount === 0) {
                    shortsContainer.innerHTML = '<p style="color: var(--text-secondary); text-align: center; width: 100%; padding: 3rem 0;">No short videos available.</p>';
                }
                if (videosCount === 0) {
                    videosContainer.innerHTML = `
                        <div class="video-wrapper widescreen glass-card" style="display: flex; align-items: center; justify-content: center; min-height: 250px;">
                            <p style="color: var(--text-secondary); text-align: center; margin: 0;">No long-form videos available yet.</p>
                        </div>
                    `;
                }
            })
            .catch(error => {
                console.error('Error fetching YouTube Data API:', error);
                shortsContainer.innerHTML = '<p style="color: var(--text-secondary); text-align: center; width: 100%; padding: 3rem 0;">Error loading videos.</p>';
            });
    }

    // 8. True Per-Digit Mechanical Odometer Engine (Only changing digit animates & turns green/red)
    const statsSection = document.querySelector('.stats-grid');
    if (statsSection) {
        const liveSubOdometer = document.getElementById('live-sub-odometer');
        const liveViewsOdometer = document.getElementById('live-views-odometer');
        const videoCountCounter = document.getElementById('video-count-counter');

        let lastSubCount = 1315;
        let lastViewCount = 16458;
        let isInitialRollComplete = false;

        const fmt = (n) => n.toLocaleString('en-IN');

        const renderFormattedOdometer = (el, str) => {
            if (!el) return;
            el.innerHTML = '';
            for (let i = 0; i < str.length; i++) {
                const char = str[i];
                if (/\d/.test(char)) {
                    el.innerHTML += `<span class="odo-digit-wrap"><span class="odo-digit-inner">${char}</span></span>`;
                } else {
                    el.innerHTML += `<span class="odo-char">${char}</span>`;
                }
            }
        };

        const updateOdometerPerDigit = (el, oldVal, newVal) => {
            if (!el) return;
            const oldStr = fmt(oldVal);
            const newStr = fmt(newVal);
            const isIncrease = newVal > oldVal;

            if (oldStr.length !== newStr.length || el.children.length === 0) {
                renderFormattedOdometer(el, newStr);
                return;
            }

            // Whole Number Color Flash (Green on Up / Red on Down)
            const colorClass = isIncrease ? 'count-up-green' : 'count-down-red';
            el.classList.remove('count-up-green', 'count-down-red');
            void el.offsetWidth; // Reflow
            el.classList.add(colorClass);

            const children = Array.from(el.children);
            for (let i = 0; i < newStr.length; i++) {
                const oldChar = oldStr[i];
                const newChar = newStr[i];
                const child = children[i];

                // ONLY THE CHANGING DIGIT GETS THE MECHANICAL ROLL ANIMATION!
                if (child && oldChar !== newChar && /\d/.test(newChar)) {
                    const rollClass = isIncrease ? 'changing-digit-up' : 'changing-digit-down';
                    child.className = `odo-digit-wrap ${rollClass}`;
                    child.innerHTML = `<span class="odo-digit-inner">${newChar}</span>`;
                }
            }

            // After 1.2s, revert whole number & digits back to normal state
            setTimeout(() => {
                if (el) el.classList.remove('count-up-green', 'count-down-red');
                if (el) {
                    Array.from(el.children).forEach(child => {
                        if (child) child.className = 'odo-digit-wrap';
                    });
                }
            }, 1250);
        };

        const rollFromZero = (el, targetVal) => {
            if (!el || !targetVal) return;
            let currentVal = 0;
            const duration = 1400;
            const startTime = performance.now();

            const step = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeProgress = 1 - Math.pow(1 - progress, 3);
                currentVal = Math.floor(easeProgress * targetVal);
                renderFormattedOdometer(el, fmt(currentVal));

                if (progress < 1) {
                    requestAnimationFrame(step);
                } else {
                    renderFormattedOdometer(el, fmt(targetVal));
                }
            };
            requestAnimationFrame(step);
        };

        const fetchStudioRealtimeStats = async () => {
            try {
                const response = await fetch('/api/studio-realtime');
                const data = await response.json();

                if (data && data.success) {
                    const realSubs = data.subscriberCount || 1315;
                    const realViews = data.viewCount || 16458;
                    const realVideos = data.videoCount || 30;

                    if (!isInitialRollComplete) {
                        isInitialRollComplete = true;
                        lastSubCount = realSubs;
                        lastViewCount = realViews;

                        rollFromZero(liveSubOdometer, realSubs);
                        rollFromZero(liveViewsOdometer, realViews);
                        rollFromZero(videoCountCounter, realVideos);
                        return;
                    }

                    if (liveSubOdometer && lastSubCount !== null && realSubs !== lastSubCount) {
                        updateOdometerPerDigit(liveSubOdometer, lastSubCount, realSubs);
                        lastSubCount = realSubs;
                    }

                    if (liveViewsOdometer && lastViewCount !== null && realViews !== lastViewCount) {
                        updateOdometerPerDigit(liveViewsOdometer, lastViewCount, realViews);
                        lastViewCount = realViews;
                    }

                    if (videoCountCounter) {
                        videoCountCounter.textContent = fmt(realVideos);
                    }
                }
            } catch (error) {
                console.error('Error fetching YouTube Studio stats:', error);
                if (!isInitialRollComplete) {
                    isInitialRollComplete = true;
                    rollFromZero(liveSubOdometer, 1315);
                    rollFromZero(liveViewsOdometer, 16458);
                    rollFromZero(videoCountCounter, 30);
                }
            }
        };

        const statsObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    fetchStudioRealtimeStats();
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.05 });

        statsObserver.observe(statsSection);

        // Poll YouTube Studio API endpoint strictly every 3 seconds for real-time changes ONLY
        setInterval(fetchStudioRealtimeStats, 3000);
    }

    // 9. Scroll to Top Button
    const scrollTopBtn = document.getElementById('scroll-top');
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            // Show button after scrolling down 400px
            if (window.scrollY > 400) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        });

        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // 10. Content Protection (Anti-Copy / Anti-Download)
    // Disable right-click context menu
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });

    // Disable common keyboard shortcuts for copying and inspecting
    document.addEventListener('keydown', (e) => {
        // Prevent F12 (Dev Tools)
        if (e.key === 'F12') {
            e.preventDefault();
        }

        // Prevent Ctrl/Cmd + combinations
        if (e.ctrlKey || e.metaKey) {
            // Prevent Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (Dev Tools)
            if (e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) {
                e.preventDefault();
            }
            // Prevent Ctrl+U (View Source)
            if (e.key === 'U' || e.key === 'u') {
                e.preventDefault();
            }
            // Prevent Ctrl+S (Save Page)
            if (e.key === 'S' || e.key === 's') {
                e.preventDefault();
            }
            // Prevent Ctrl+C (Copy)
            if (e.key === 'C' || e.key === 'c') {
                e.preventDefault();
            }
            // Prevent Ctrl+P (Print)
            if (e.key === 'P' || e.key === 'p') {
                e.preventDefault();
            }
        }
    });

    // Prevent image dragging via JS as an extra layer
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('dragstart', (e) => {
            e.preventDefault();
        });
    });

    // 11. Dynamic Time-Based Greeting
    const greetingElement = document.getElementById('dynamic-greeting');
    if (greetingElement) {
        const hour = new Date().getHours();
        let greeting = "Hello";

        if (hour >= 5 && hour < 12) {
            greeting = "Good Morning";
        } else if (hour >= 12 && hour < 17) {
            greeting = "Good Afternoon";
        } else if (hour >= 17 && hour < 22) {
            greeting = "Good Evening";
        } else {
            greeting = "Good Night";
        }

        greetingElement.textContent = `${greeting}, I'm`;
    }

    // 11.5 Dynamic Live Festival Greetings (Powered by Public Holiday API & Auto-Images)
    const initFestivals = async () => {
        const today = new Date();
        const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
        const currentDate = String(today.getDate()).padStart(2, '0');
        const currentYear = today.getFullYear();
        // Fallback test mode: const dateKey = "02-26"; 
        const dateKey = `${currentMonth}-${currentDate}`;

        // Generate 3 unique, distinct, highly relevant icons using Bing Image Search Thumbnail API by accepting 3 different queries
        const getIcons = (q1, q2, q3) => {
            return [
                `https://tse1.mm.bing.net/th?q=${encodeURIComponent(q1)}&w=100&h=100&c=7&rs=1&p=0`,
                `https://tse2.mm.bing.net/th?q=${encodeURIComponent(q2)}&w=100&h=100&c=7&rs=1&p=0`,
                `https://tse3.mm.bing.net/th?q=${encodeURIComponent(q3)}&w=100&h=100&c=7&rs=1&p=0`
            ];
        };

        // Fetch a premium cinematic banner photo for the popup
        const getBanner = (kw) => {
            const cleanKw = encodeURIComponent(kw + " high quality");
            return `https://tse4.mm.bing.net/th?q=${cleanKw}&w=600&h=400&c=7&rs=1&p=0`;
        };

        // ===================================================================
        // DYNAMIC FESTIVAL DATE DETECTION
        // Fetches this year's Indian festival dates from calendar-bharat API
        // so dates never need to be manually updated again.
        // ===================================================================

        // Maps festival names (from API) to our visual & animation config
        const festivalConfig = {
            // Key = lowercase, partial name to match against API festival names
            "holi": { name: "Holi", text: "Happy Holi!", icons: getIcons("Holi red pink powder hands", "Holi gulal thali plate", "Holi water balloons colors"), banner: getBanner("Holi festival colorful powder celebration") },
            "diwali": { name: "Diwali", text: "Happy Diwali!", icons: getIcons("Diwali burning diya clay", "Diwali firecrackers night sky", "Diwali rangoli colors design"), banner: getBanner("Diwali beautiful glowing diyas celebration") },
            "deepawali": { name: "Diwali", text: "Happy Diwali!", icons: getIcons("Diwali burning diya clay", "Diwali firecrackers night sky", "Diwali rangoli colors design"), banner: getBanner("Diwali beautiful glowing diyas celebration") },
            "republic day": { name: "Republic Day", text: "Happy Republic Day!", icons: getIcons("India Gate Delhi parade", "Indian flag waving close up", "Republic day tricolor balloons"), banner: getBanner("India Republic Day celebration parade flag") },
            "independence day": { name: "Independence Day", text: "Happy Independence Day!", icons: getIcons("Red fort august 15 flag", "Indian flag waving sky", "Independence day troops march"), banner: getBanner("India Independence Day Flag highly detailed") },
            "makar sankranti": { name: "Makar Sankranti", text: "Happy Makar Sankranti!", icons: getIcons("Makar Sankranti colorful kites", "Tilgul sweets plate", "Kite flying boy silhouette"), banner: getBanner("Makar Sankranti kite flying festival") },
            "pongal": { name: "Makar Sankranti", text: "Happy Pongal!", icons: getIcons("Pongal festival pot kolam", "Sugarcane rice festival", "Pongal rangoli south india"), banner: getBanner("Pongal harvest festival celebration") },
            "raksha bandhan": { name: "Raksha Bandhan", text: "Happy Raksha Bandhan!", icons: getIcons("Raksha bandhan beautiful rakhi thread", "Brother sister rakhi tie", "Rakhi pooja thali sweets"), banner: getBanner("Raksha Bandhan premium rakhi") },
            "rakhi": { name: "Raksha Bandhan", text: "Happy Rakhi!", icons: getIcons("Raksha bandhan beautiful rakhi thread", "Brother sister rakhi tie", "Rakhi pooja thali sweets"), banner: getBanner("Raksha Bandhan premium rakhi") },
            "christmas": { name: "Christmas", text: "Merry Christmas!", icons: getIcons("Christmas decorated pine tree", "Santa claus gifts bag", "Christmas glowing balls ornaments"), banner: getBanner("Christmas tree festive background") },
            "new year": { name: "New Year", text: "Happy New Year!", icons: getIcons("New year countdown clock", "New year fireworks sky", "New year celebration balloons"), banner: getBanner("New Year Fireworks celebration") },
            "lohri": { name: "Lohri", text: "Happy Lohri!", icons: getIcons("Lohri bonfire night punjab", "Lohri popcorn revdi sesame", "Lohri dhol folk dance"), banner: getBanner("Lohri festival bonfire celebrates") },
            "navratri": { name: "Navratri", text: "Happy Navratri!", icons: getIcons("Navratri garba dance girls", "Navratri goddess durga idol", "Navratri dandiya sticks colorful"), banner: getBanner("Navratri garba festival celebration") },
            "ganesh": { name: "Ganesh Chaturthi", text: "Happy Ganesh Chaturthi!", icons: getIcons("Ganesh idol clay vibrant", "Ganesh chaturthi procession visharjan", "Modak sweet offering"), banner: getBanner("Ganesh Chaturthi festival celebration") },
            "eid": { name: "Eid", text: "Eid Mubarak!", icons: getIcons("Eid mubarak crescent moon lantern", "Eid celebration family together", "Eid seviyan kheer"), banner: getBanner("Eid celebration festival") },
            "guru nanak": { name: "Guru Nanak Jayanti", text: "Happy Gurpurab!", icons: getIcons("Guru Nanak Jayanti golden temple", "Gurpurab candles lantern", "Sikh Waheguru prayer diyas"), banner: getBanner("Gurpurab golden temple celebration") },
        };

        // Helper: find a matching festival config from an API event name
        const matchFestival = (eventName) => {
            const lower = eventName.toLowerCase();
            for (const key in festivalConfig) {
                if (lower.includes(key)) return festivalConfig[key];
            }
            return null;
        };

        let activeFestival = null;

        try {
            // Fetch this year's Indian calendar data from calendar-bharat (free, no API key needed)
            const apiUrl = `https://jayantur13.github.io/calendar-bharat/calendar/${currentYear}.json`;
            const response = await fetch(apiUrl);
            if (response.ok) {
                const data = await response.json();
                const yearData = data[String(currentYear)];

                // Walk through every month's entries looking for today's date
                if (yearData) {
                    outer: for (const monthKey in yearData) {
                        const month = yearData[monthKey];
                        for (const dateLabel in month) {
                            // dateLabel is like "March 4, 2026, Wednesday"
                            const entryDate = new Date(dateLabel.split(',').slice(0, 2).join(','));
                            const entryMonth = String(entryDate.getMonth() + 1).padStart(2, '0');
                            const entryDay = String(entryDate.getDate()).padStart(2, '0');
                            if (`${entryMonth}-${entryDay}` === dateKey) {
                                const eventName = month[dateLabel].event;
                                const match = matchFestival(eventName);
                                if (match) {
                                    activeFestival = match;
                                    break outer;
                                }
                            }
                        }
                    }
                }
            }
        } catch (err) {
            // API unavailable â€” silently ignore, no festival shown today
            console.warn('[Festival] Could not fetch calendar data:', err);
        }


        if (activeFestival) {
            // 1. Override the Hero Text Greeting (Replaces "Good morning")
            if (greetingElement) {
                // Remove raw text textContent, setup HTML to inline an image next to the text
                greetingElement.innerHTML = `<span style="display: inline-flex; align-items: center; gap: 10px;">
                    ${activeFestival.text} 
                    <img src="${activeFestival.icons[0]}" alt="Festival Icon" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 2px solid var(--accent-color); filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.4)); animation: pulse 3s infinite;">
                </span>`;

                // Add a subtle celebratory glow and brand color to the text
                greetingElement.style.color = 'var(--accent-color)';
                greetingElement.style.fontWeight = '700';
                greetingElement.style.textShadow = '0 0 15px rgba(99, 102, 241, 0.4)';

                // Re-inject the static "I'm" below the festival greeting so the layout doesn't break
                const imSpan = document.createElement('span');
                imSpan.style.color = 'var(--text-primary)';
                imSpan.style.fontWeight = '400';
                imSpan.style.textShadow = 'none';
                imSpan.style.marginLeft = '12px';
                imSpan.textContent = "I'm";
                greetingElement.querySelector('span').appendChild(imSpan);
            }

            // 2. Inject 3 distinct Navbar Icons next to the theme toggle
            const navActions = document.querySelector('.nav-actions');
            const themeToggle = document.getElementById('theme-toggle');

            if (navActions && themeToggle) {
                const iconContainer = document.createElement('div');
                iconContainer.className = 'festive-nav-container';
                iconContainer.style.cssText = `
                    display: flex;
                    gap: 8px;
                    margin-right: 15px;
                    align-items: center;
                `;

                activeFestival.icons.forEach((iconChar, index) => {
                    const img = document.createElement('img');
                    img.src = iconChar;
                    img.alt = "Festival Element";
                    img.style.cssText = `
                        width: 38px;
                        height: 38px;
                        border-radius: 50%;
                        object-fit: cover;
                        border: 2px solid var(--glass-border);
                        background: var(--bg-secondary);
                        animation: pulse ${2 + (index * 0.5)}s infinite;
                        filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.4));
                        user-select: none;
                    `;
                    iconContainer.appendChild(img);
                });

                navActions.insertBefore(iconContainer, themeToggle);
            }

            // 3. Inject the Premium Glassmorphism Popup Overlay with Dynamic Auto-Image
            // Use Direct Premium Image URL mapped to the specific festival for 100% reliability
            const imageUrl = activeFestival.banner;

            const festiveOverlay = document.createElement('div');
            festiveOverlay.className = 'festive-overlay active';
            festiveOverlay.innerHTML = `
                <div class="festive-card glass-card" style="padding: 0; overflow: hidden; max-width: 400px; position: relative;">
                    <button class="festive-close" id="festive-close" aria-label="Close Greeting" style="position: absolute; top: 10px; right: 10px; z-index: 999; background: rgba(0,0,0,0.6); border: 2px solid rgba(255,255,255,0.2); border-radius: 50%; width: 34px; height: 34px; color: white; cursor: pointer; pointer-events: auto !important; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; transition: all 0.2s ease;">&times;</button>
                    
                    <div style="width: 100%; height: 200px; background-color: var(--bg-tertiary); position: relative;">
                        <!-- The smart image automatically pulled based on the holiday name -->
                        <img src="${imageUrl}" alt="${activeFestival.name} Celebration" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.9;">
                        <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: 50%; background: linear-gradient(to top, var(--bg-secondary) 10%, transparent);"></div>
                    </div>
                    
                    <div style="padding: 2rem;">
                        <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 0.5rem;">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <img src="${activeFestival.icons[1]}" alt="Icon Left" style="width: 35px; height: 35px; border-radius: 50%; object-fit: cover; border: 2px solid var(--accent-color);">
                                <h2 style="margin: 0; color: var(--accent-color);">${activeFestival.text}</h2>
                            </div>
                            <img src="${activeFestival.icons[2]}" alt="Icon Right" style="width: 35px; height: 35px; border-radius: 50%; object-fit: cover; border: 2px solid var(--accent-color);">
                        </div>
                        <p style="color: var(--text-secondary); font-size: 0.95rem;">Wishing you joy, success, and prosperity on this special day!</p>
                    </div>
                </div>
            `;
            document.body.appendChild(festiveOverlay);

            // Close logic for popup
            const closeBtn = document.getElementById('festive-close');

            // Highly Realistic Canvas Particle Simulation Engine (Runs Only on Home Page)
            const launchFestivalAnimations = (festival) => {
                if (!document.getElementById('home')) return; // Strictly only run on home page

                const canvas = document.createElement('canvas');
                canvas.style.position = 'fixed';
                canvas.style.top = '0';
                canvas.style.left = '0';
                canvas.style.width = '100vw';
                canvas.style.height = '100vh';
                canvas.style.pointerEvents = 'none'; // Click through
                canvas.style.zIndex = '9999';
                document.body.appendChild(canvas);

                const ctx = canvas.getContext('2d');
                let width = window.innerWidth;
                let height = window.innerHeight;
                canvas.width = width;
                canvas.height = height;

                let particles = [];
                let animationId;
                let flashAlpha = 0; // For Diwali lighting effect

                // Allow resizing during animation
                window.addEventListener('resize', () => {
                    width = window.innerWidth;
                    height = window.innerHeight;
                    canvas.width = width;
                    canvas.height = height;
                });

                const fName = festival.name;

                if (fName === "Diwali" || fName === "New Year") {
                    // --- REALISTIC FIREWORKS ENGINE ---
                    class Firework {
                        constructor() {
                            this.x = Math.random() * (width * 0.8) + (width * 0.1);
                            this.y = height;
                            this.sx = (Math.random() - 0.5) * 3;
                            this.sy = -(Math.random() * 4 + 10); // Shoot up
                            this.size = 2.5;
                            this.color = `hsl(${Math.random() * 360}, 100%, 60%)`;
                            this.exploded = false;
                            this.particles = [];
                        }
                        update() {
                            if (!this.exploded) {
                                this.x += this.sx;
                                this.y += this.sy;
                                this.sy += 0.15; // Gravity
                                // Trigger explosion near top or randomly
                                if (this.sy >= -1 || this.y < height * 0.2 + Math.random() * 100) {
                                    this.exploded = true;
                                    flashAlpha = 0.6; // Trigger global flash
                                    const particleCount = 80 + Math.random() * 40;
                                    for (let i = 0; i < particleCount; i++) {
                                        this.particles.push(new Particle(this.x, this.y, this.color));
                                    }
                                }
                            } else {
                                for (let i = this.particles.length - 1; i >= 0; i--) {
                                    const p = this.particles[i];
                                    p.update();
                                    if (p.alpha <= 0) this.particles.splice(i, 1);
                                }
                            }
                        }
                        draw() {
                            if (!this.exploded) {
                                ctx.fillStyle = '#FFAA00'; // Rocket trail core
                                ctx.beginPath();
                                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                                ctx.fill();
                            } else {
                                for (const p of this.particles) p.draw();
                            }
                        }
                    }

                    class Particle {
                        constructor(x, y, color) {
                            this.x = x;
                            this.y = y;
                            const angle = Math.random() * Math.PI * 2;
                            const speed = Math.random() * 6 + 1;
                            this.sx = Math.cos(angle) * speed;
                            this.sy = Math.sin(angle) * speed;
                            this.size = Math.random() * 2 + 1;
                            this.baseColor = color;
                            // Randomize particle colors slightly around base spark
                            this.color = Math.random() > 0.8 ? '#FFFFFF' : this.baseColor;
                            this.alpha = 1;
                            this.decay = Math.random() * 0.015 + 0.01;
                            this.friction = 0.95;
                        }
                        update() {
                            this.sx *= this.friction;
                            this.sy *= this.friction;
                            this.sy += 0.05; // Gravity pull on sparks
                            this.x += this.sx;
                            this.y += this.sy;
                            this.alpha -= this.decay;
                        }
                        draw() {
                            ctx.save();
                            ctx.globalAlpha = Math.max(0, this.alpha);
                            ctx.fillStyle = this.color;
                            ctx.shadowBlur = 10;
                            ctx.shadowColor = this.color;
                            ctx.beginPath();
                            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                            ctx.fill();
                            ctx.restore();
                        }
                    }

                    // Launch multiple fireworks staggered
                    for (let i = 0; i < 7; i++) {
                        setTimeout(() => particles.push(new Firework()), i * 600 + Math.random() * 300);
                    }

                    const loop = () => {
                        // Produce trailing effects
                        ctx.globalCompositeOperation = 'destination-out';
                        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                        ctx.fillRect(0, 0, width, height);
                        ctx.globalCompositeOperation = 'lighter';

                        // Draw Atmospheric Flash
                        if (flashAlpha > 0) {
                            ctx.save();
                            ctx.globalAlpha = flashAlpha;
                            ctx.fillStyle = '#FFFFFF';
                            ctx.fillRect(0, 0, width, height);
                            ctx.restore();
                            flashAlpha -= 0.04; // Fade out flash quickly
                        }

                        for (let i = particles.length - 1; i >= 0; i--) {
                            const fw = particles[i];
                            fw.update();
                            fw.draw();
                            if (fw.exploded && fw.particles.length === 0) particles.splice(i, 1);
                        }
                        animationId = requestAnimationFrame(loop);
                    };
                    loop();

                } else if (fName === "Holi") {
                    // --- HYPER-REALISTIC FLYING POWDER / GULAL ENGINE ---
                    class PowderCloud {
                        constructor(x, y, isExplosiveCore) {
                            this.x = x;
                            this.y = y;
                            // Chaotic bursting angles
                            const angle = (Math.random() * Math.PI) + Math.PI; // Upwards semi-circle
                            // Explosive core particles shoot way faster, outer clouds drift
                            const speed = isExplosiveCore ? (Math.random() * 40 + 20) : (Math.random() * 15 + 2);
                            this.sx = Math.cos(angle) * speed;
                            this.sy = Math.sin(angle) * speed;

                            // Wide range of sizes: tiny concentrated powder hits, to massive lingering clouds
                            this.size = isExplosiveCore ? (Math.random() * 10 + 2) : (Math.random() * 40 + 10);
                            this.growthRate = isExplosiveCore ? 0.1 : (Math.random() * 2 + 0.5); // Fast expanding clouds

                            // Vibrant Holi Colors: Pink, Green, Yellow, Blue, Purple
                            const colors = ['255, 0, 85', '0, 255, 102', '255, 221, 0', '0, 187, 255', '170, 0, 255'];
                            this.colorRGB = colors[Math.floor(Math.random() * colors.length)];
                            this.alpha = isExplosiveCore ? 1 : (Math.random() * 0.6 + 0.4); // Core is solid, edges are dusty
                            this.decay = Math.random() * 0.008 + 0.002; // Very slow fade to simulate lingering dust
                            // Extreme friction forces fast stops to simulate air hitting light powder
                            this.friction = isExplosiveCore ? 0.95 : 0.88;
                        }
                        update() {
                            this.x += this.sx;
                            this.y += this.sy;
                            this.sx *= this.friction;
                            this.sy *= this.friction;
                            this.sy += 0.05; // Slight gravity pull down over time
                            this.size += this.growthRate; // Expand realistic cloud outward
                            this.alpha -= this.decay;
                        }
                        draw() {
                            ctx.save();
                            ctx.globalAlpha = Math.max(0, this.alpha);

                            // Draw realistic soft powder puff using radial gradient for a "dusty" edge
                            const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
                            // Super bright core, dissipating outer edge
                            gradient.addColorStop(0, `rgba(${this.colorRGB}, ${this.alpha})`);
                            gradient.addColorStop(0.3, `rgba(${this.colorRGB}, ${this.alpha * 0.8})`);
                            gradient.addColorStop(1, `rgba(${this.colorRGB}, 0)`);

                            ctx.fillStyle = gradient;
                            ctx.beginPath();
                            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                            ctx.fill();
                            ctx.restore();
                        }
                    }

                    // Trigger 5 overlapping chaotic bursts from all over the bottom to simulate a crowd throwing powder
                    const burstLocations = [width * 0.1, width * 0.3, width * 0.5, width * 0.7, width * 0.9];
                    burstLocations.forEach((lx, index) => {
                        setTimeout(() => {
                            // 300 dusty slow clouds
                            for (let i = 0; i < 300; i++) particles.push(new PowderCloud(lx, height + 50, false));
                            // 100 fast explosive core powder clumps
                            for (let j = 0; j < 100; j++) particles.push(new PowderCloud(lx, height + 50, true));
                        }, index * 250); // Rapid stagger bursts
                    });

                    const loop = () => {
                        ctx.clearRect(0, 0, width, height); // No trails for powder
                        ctx.globalCompositeOperation = 'screen'; // Blend colors together vibrantly
                        for (let i = particles.length - 1; i >= 0; i--) {
                            const p = particles[i];
                            p.update();
                            p.draw();
                            if (p.alpha <= 0) particles.splice(i, 1);
                        }
                        animationId = requestAnimationFrame(loop);
                    };
                    loop();

                } else if (fName === "Makar Sankranti") {
                    // --- REALISTIC PAPER KITE ENGINE ---
                    class Kite {
                        constructor() {
                            this.x = Math.random() * width;
                            this.y = height + 100; // Start below screen
                            this.size = Math.random() * 15 + 15;
                            // Bright kite colors
                            const colors = ['#FF3366', '#33CCFF', '#FFCC00', '#99FF33', '#FF6600'];
                            this.color = colors[Math.floor(Math.random() * colors.length)];
                            this.sy = -(Math.random() * 2 + 1.5); // Float up speed varies by kite
                            this.windOffset = Math.random() * 100;
                            this.wobbleSpeed = Math.random() * 0.03 + 0.02;
                            this.tailHistory = []; // Track points for the tail
                        }
                        update() {
                            this.y += this.sy;
                            // Sine wave for wind sway
                            this.x += Math.sin(this.y * this.wobbleSpeed + this.windOffset) * 2;

                            // Track previous positions for the tail
                            this.tailHistory.unshift({ x: this.x, y: this.y });
                            if (this.tailHistory.length > 15) this.tailHistory.pop();
                        }
                        draw() {
                            ctx.save();
                            ctx.translate(this.x, this.y);

                            // Tilt kite based on horizontal sway direction
                            const tilt = Math.cos(this.y * this.wobbleSpeed + this.windOffset) * 0.4;
                            ctx.rotate(tilt);

                            // Draw traditional diamond kite body
                            ctx.fillStyle = this.color;
                            ctx.beginPath();
                            ctx.moveTo(0, -this.size);     // Top tip
                            ctx.lineTo(this.size, 0);      // Right corner
                            ctx.lineTo(0, this.size * 1.5);  // Bottom longer tip
                            ctx.lineTo(-this.size, 0);     // Left corner
                            ctx.closePath();
                            ctx.fill();

                            // Draw central cross sticks
                            ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
                            ctx.lineWidth = 1;
                            ctx.beginPath();
                            ctx.moveTo(0, -this.size);
                            ctx.lineTo(0, this.size * 1.5); // Vertical stick
                            ctx.moveTo(-this.size, 0);
                            // Draw curved horizontal stick
                            ctx.quadraticCurveTo(0, -this.size * 0.3, this.size, 0);
                            ctx.stroke();

                            ctx.restore();

                            // Draw Kite Tail (Trailing behind)
                            if (this.tailHistory.length > 5) {
                                ctx.save();
                                ctx.strokeStyle = '#FFFFFF';
                                ctx.lineWidth = 1;
                                ctx.beginPath();
                                ctx.moveTo(this.tailHistory[0].x, this.tailHistory[0].y + this.size * 1.5);

                                for (let i = 1; i < this.tailHistory.length; i++) {
                                    // Make tail wave opposing the wind slightly
                                    const waveX = this.tailHistory[i].x + Math.sin(i * 0.5) * 5;
                                    ctx.lineTo(waveX, this.tailHistory[i].y + this.size * 1.5 + (i * 4));
                                }
                                ctx.stroke();
                                ctx.restore();
                            }
                        }
                    }

                    // Release 12 kites staggered
                    for (let i = 0; i < 12; i++) {
                        setTimeout(() => particles.push(new Kite()), i * 300);
                    }

                    const loop = () => {
                        ctx.clearRect(0, 0, width, height);
                        for (let i = particles.length - 1; i >= 0; i--) {
                            const p = particles[i];
                            p.update();
                            p.draw();
                            // If it flies high above screen, remove
                            if (p.y < -100) particles.splice(i, 1);
                        }
                        animationId = requestAnimationFrame(loop);
                    };
                    loop();

                } else if (fName === "Christmas") {
                    // --- REALISTIC PARALLAX SNOWFALL ENGINE ---
                    class Snowflake {
                        constructor() {
                            this.x = Math.random() * width;
                            this.y = Math.random() * -height; // Start above screen
                            // Parallax depths (1 is far/slow, 3 is near/fast)
                            this.z = Math.random() * 2 + 1;
                            this.size = this.z * 1.5;
                            this.sy = this.z * 1.2; // Fall faster if closer
                            this.windOffset = Math.random() * Math.PI * 2;
                        }
                        update() {
                            this.y += this.sy;
                            // Gentle sine wave drift based on depth
                            this.x += Math.sin((this.y / 50) + this.windOffset) * (this.z * 0.5);
                        }
                        draw() {
                            ctx.save();
                            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'; // Sharp white
                            // Blur background snow slightly for depth of field
                            if (this.z < 1.5) {
                                ctx.shadowBlur = 3;
                                ctx.shadowColor = 'white';
                                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'; // Faded
                            }
                            ctx.beginPath();
                            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                            ctx.fill();
                            ctx.restore();
                        }
                    }

                    // Heavy snowfall
                    for (let i = 0; i < 300; i++) particles.push(new Snowflake());

                    const loop = () => {
                        ctx.clearRect(0, 0, width, height);
                        for (let i = particles.length - 1; i >= 0; i--) {
                            const p = particles[i];
                            p.update();
                            p.draw();
                            // If snow hits ground, respawn it at the top for continuous flow
                            if (p.y > height + 20) {
                                p.y = -20;
                                p.x = Math.random() * width;
                            }
                        }
                        animationId = requestAnimationFrame(loop);
                    };
                    loop();

                } else if (fName === "Republic Day" || fName === "Independence Day") {
                    // --- REALISTIC TRICOLOR BALLOON & CONFETTI ENGINE ---
                    class TricolorBalloon {
                        constructor() {
                            this.x = Math.random() * width;
                            this.y = height + 100; // Start below screen
                            this.size = Math.random() * 20 + 20; // Balloon size

                            // Indian Flag Colors: Saffron, White, Green
                            const colors = ['#FF9933', '#FFFFFF', '#138808'];
                            this.color = colors[Math.floor(Math.random() * colors.length)];

                            this.sy = -(Math.random() * 2 + 2); // Float up speed varies
                            this.windOffset = Math.random() * 100;
                            this.wobbleSpeed = Math.random() * 0.02 + 0.01;
                        }
                        update() {
                            this.y += this.sy;
                            // Gentle sway
                            this.x += Math.sin(this.y * this.wobbleSpeed + this.windOffset) * 1.5;
                        }
                        draw() {
                            ctx.save();
                            ctx.translate(this.x, this.y);

                            // Draw Balloon String
                            ctx.beginPath();
                            ctx.moveTo(0, this.size);
                            ctx.quadraticCurveTo(5, this.size + 15, -5, this.size + 30);
                            ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
                            ctx.lineWidth = 1;
                            ctx.stroke();

                            // Draw Balloon Body
                            ctx.fillStyle = this.color;
                            ctx.beginPath();
                            // Slightly elongated balloon shape
                            ctx.ellipse(0, 0, this.size * 0.85, this.size, 0, 0, Math.PI * 2);
                            ctx.fill();

                            // Optional: Shiny highlight
                            ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
                            ctx.beginPath();
                            ctx.ellipse(-this.size * 0.3, -this.size * 0.4, this.size * 0.2, this.size * 0.4, Math.PI / 6, 0, Math.PI * 2);
                            ctx.fill();

                            ctx.restore();
                        }
                    }

                    class TricolorConfetti {
                        constructor() {
                            this.x = Math.random() * width;
                            this.y = Math.random() * -height - 100;
                            this.w = Math.random() * 8 + 4;
                            this.h = Math.random() * 12 + 6;
                            this.sx = Math.random() * 2 - 1;
                            this.sy = Math.random() * 2 + 1; // Fall down
                            this.rotX = Math.random() * 360;
                            this.rotY = Math.random() * 360;
                            this.rotZ = Math.random() * 360;
                            const colors = ['#FF9933', '#FFFFFF', '#138808'];
                            this.color = colors[Math.floor(Math.random() * colors.length)];
                        }
                        update() {
                            this.x += this.sx;
                            this.y += this.sy;
                            this.rotX += 5; this.rotY += 5; this.rotZ += 5;
                        }
                        draw() {
                            ctx.save();
                            ctx.translate(this.x, this.y);
                            ctx.rotate(this.rotZ * Math.PI / 180);
                            const scaleX = Math.cos(this.rotX * Math.PI / 180);
                            const scaleY = Math.cos(this.rotY * Math.PI / 180);
                            ctx.scale(scaleX, scaleY);
                            ctx.fillStyle = this.color;
                            ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
                            ctx.restore();
                        }
                    }

                    // Release floating balloons
                    for (let i = 0; i < 20; i++) setTimeout(() => particles.push(new TricolorBalloon()), i * 200);
                    // Add falling confetti
                    for (let i = 0; i < 150; i++) particles.push(new TricolorConfetti());

                    const loop = () => {
                        ctx.clearRect(0, 0, width, height);
                        for (let i = particles.length - 1; i >= 0; i--) {
                            const p = particles[i];
                            p.update();
                            p.draw();
                            if (p instanceof TricolorBalloon && p.y < -100) particles.splice(i, 1);
                            if (p instanceof TricolorConfetti && p.y > height + 20) particles.splice(i, 1);
                        }
                        animationId = requestAnimationFrame(loop);
                    };
                    loop();

                } else if (fName === "Raksha Bandhan") {
                    // --- REALISTIC GOLDEN THREADS & GLOWING SPARKLES ENGINE ---
                    class GoldenThread {
                        constructor() {
                            this.x = Math.random() * width;
                            this.y = Math.random() * -height - 200;
                            this.length = Math.random() * 150 + 50;
                            this.sy = Math.random() * 2 + 3; // Fast fall
                            this.windOffset = Math.random() * Math.PI;
                        }
                        update() {
                            this.y += this.sy;
                            this.x += Math.sin((this.y / 100) + this.windOffset);
                        }
                        draw() {
                            ctx.save();
                            // Glowing golden rod
                            ctx.strokeStyle = '#FFD700'; // Gold
                            ctx.lineWidth = 2;
                            ctx.shadowBlur = 10;
                            ctx.shadowColor = '#FFAA00';

                            ctx.beginPath();
                            ctx.moveTo(this.x, this.y);
                            // Draw thread curving upwards slightly as it falls
                            ctx.quadraticCurveTo(this.x + Math.sin(this.windOffset) * 20, this.y - this.length / 2, this.x, this.y - this.length);
                            ctx.stroke();

                            // Add a 'bead' or 'rakhi center' occasionally 
                            if (this.length > 150) {
                                ctx.fillStyle = '#FF0033'; // Red bead
                                ctx.beginPath();
                                ctx.arc(this.x, this.y - this.length / 2, 5, 0, Math.PI * 2);
                                ctx.fill();
                            }
                            ctx.restore();
                        }
                    }

                    class GlowingSparkle {
                        constructor() {
                            this.x = Math.random() * width;
                            this.y = Math.random() * -height;
                            this.size = Math.random() * 3 + 1;
                            this.sy = Math.random() * 1 + 0.5; // Slow drift
                            this.alpha = Math.random() * 0.5 + 0.5;
                            this.flickerSpeed = Math.random() * 0.1 + 0.05;
                            this.flickerTime = Math.random() * Math.PI * 2;
                        }
                        update() {
                            this.y += this.sy;
                            this.flickerTime += this.flickerSpeed;
                            this.currentAlpha = this.alpha * (0.5 + Math.sin(this.flickerTime) * 0.5); // Pulse alpha
                        }
                        draw() {
                            ctx.save();
                            ctx.fillStyle = `rgba(255, 215, 0, ${this.currentAlpha})`;
                            ctx.shadowBlur = 15;
                            ctx.shadowColor = 'rgba(255, 170, 0, 1)';
                            ctx.beginPath();
                            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                            ctx.fill();
                            ctx.restore();
                        }
                    }

                    for (let i = 0; i < 40; i++) particles.push(new GoldenThread());
                    for (let i = 0; i < 150; i++) particles.push(new GlowingSparkle());

                    const loop = () => {
                        ctx.clearRect(0, 0, width, height);
                        for (let i = particles.length - 1; i >= 0; i--) {
                            const p = particles[i];
                            p.update();
                            p.draw();
                            if (p.y > height + 200) particles.splice(i, 1);
                        }
                        animationId = requestAnimationFrame(loop);
                    };
                    loop();

                } else {
                    // --- HIGH-FIDELITY EVENT CONFETTI ENGINE (For generic / others) ---
                    class Confetti {
                        constructor() {
                            this.x = Math.random() * width;
                            this.y = Math.random() * -height - 100; // Start above screen
                            this.w = Math.random() * 10 + 5;
                            this.h = Math.random() * 14 + 7;
                            this.sx = Math.random() * 2 - 1;
                            this.sy = Math.random() * 3 + 2; // Falling speed
                            this.rotX = Math.random() * 360;
                            this.rotY = Math.random() * 360;
                            this.rotZ = Math.random() * 360;
                            this.rsX = Math.random() * 10 - 5;
                            this.rsY = Math.random() * 10 - 5;
                            this.rsZ = Math.random() * 10 - 5;
                            const colors = ['#FFC700', '#FF0000', '#2E3192', '#41BBC7', '#E84C3D'];
                            this.color = colors[Math.floor(Math.random() * colors.length)];
                        }
                        update() {
                            this.x += this.sx;
                            this.y += this.sy;
                            this.sx += (Math.random() - 0.5) * 0.5; // Flutter in wind
                            // Restrict horizontal speed
                            this.sx = Math.max(-2, Math.min(this.sx, 2));
                            this.rotX += this.rsX;
                            this.rotY += this.rsY;
                            this.rotZ += this.rsZ;
                        }
                        draw() {
                            ctx.save();
                            ctx.translate(this.x, this.y);
                            ctx.rotate(this.rotZ * Math.PI / 180);
                            // Simulate 3D rotation by scaling
                            const scaleX = Math.cos(this.rotX * Math.PI / 180);
                            const scaleY = Math.cos(this.rotY * Math.PI / 180);
                            ctx.scale(scaleX, scaleY);
                            ctx.fillStyle = this.color;
                            ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
                            ctx.restore();
                        }
                    }

                    for (let i = 0; i < 200; i++) particles.push(new Confetti());

                    const loop = () => {
                        ctx.clearRect(0, 0, width, height);
                        for (let i = particles.length - 1; i >= 0; i--) {
                            const p = particles[i];
                            p.update();
                            p.draw();
                            // If it falls below screen, remove
                            if (p.y > height + 20) particles.splice(i, 1);
                        }
                        animationId = requestAnimationFrame(loop);
                    };
                    loop();
                }

                // Autoclear after 8 seconds ensuring clean UI
                setTimeout(() => {
                    cancelAnimationFrame(animationId);
                    canvas.remove();
                }, 8000);
            };

            const closeGreeting = () => {
                festiveOverlay.classList.remove('active');
                setTimeout(() => {
                    festiveOverlay.remove();
                    launchFestivalAnimations(activeFestival);
                }, 500); // Wait for CSS fade out
            };

            closeBtn.addEventListener('click', closeGreeting);

            // Auto-close popup after 10 seconds due to the premium image
            setTimeout(closeGreeting, 10000);
        }
    };

    // Execute the live data fetch safely in the background
    initFestivals();

    // 12. Background Mouse Aura tracking
    const mouseAura = document.getElementById('mouse-aura');
    if (mouseAura) {
        let auraX = window.innerWidth / 2;
        let auraY = window.innerHeight / 2;
        let isAuraMoving = false;

        const renderAura = () => {
            mouseAura.style.left = auraX + 'px';
            mouseAura.style.top = auraY + 'px';
            isAuraMoving = false;
        };

        const updateAuraPos = (x, y) => {
            auraX = x;
            auraY = y;
            if (!isAuraMoving) {
                isAuraMoving = true;
                // Add a slight intentional CSS delay for fluidity rather than JS exact timeout
                setTimeout(() => requestAnimationFrame(renderAura), 30);
            }
        };

        document.addEventListener('mousemove', (e) => updateAuraPos(e.clientX, e.clientY));

        // Add touch support for mobile aura
        document.addEventListener('touchmove', (e) => updateAuraPos(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
    }



    // 14. Scroll Progress Bar
    const scrollProgress = document.getElementById('scroll-progress');
    if (scrollProgress) {
        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            const docHeight = document.body.offsetHeight;
            const winHeight = window.innerHeight;
            const scrollPercent = scrollTop / (docHeight - winHeight);
            scrollProgress.style.width = Math.min(scrollPercent * 100, 100) + '%';
        });
    }

    // Removed dynamic tab title as per request; tab name will strictly stay static.

    // 15. Subtle UI Sound Effects (AudioContext)
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
        let audioCtx;

        function playHoverSound() {
            if (!audioCtx) {
                audioCtx = new AudioContext();
            }
            if (audioCtx.state === 'suspended') audioCtx.resume();

            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.05);

            // Very subtle volume (0.05 max)
            gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.05);
        }

        // Attach to all social links, the subscribe button, and the hello button
        const soundElements = document.querySelectorAll('.social-links a, a.yt-subscribe, a[href^="mailto"]');
        soundElements.forEach(el => {
            el.addEventListener('click', playHoverSound);
        });
    }



    // 17. Security & Anti-Scraping Shield
    // Block Right Click (Context Menu)
    document.addEventListener('contextmenu', e => e.preventDefault());

    // Block Common Developer Keyboard Shortcuts
    document.addEventListener('keydown', e => {
        // F12
        if (e.key === 'F12') {
            e.preventDefault();
        }
        // Ctrl+Shift+I / Cmd+Option+I (DevTools)
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i')) {
            e.preventDefault();
        }
        // Ctrl+Shift+J / Cmd+Option+J (Console)
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'J' || e.key === 'j')) {
            e.preventDefault();
        }
        // Ctrl+U / Cmd+U (View Source)
        if ((e.ctrlKey || e.metaKey) && (e.key === 'U' || e.key === 'u')) {
            e.preventDefault();
        }
        // Ctrl+S / Cmd+S (Save Page)
        if ((e.ctrlKey || e.metaKey) && (e.key === 'S' || e.key === 's')) {
            e.preventDefault();
        }
    });

    // 18. Feedback Modal & FormSubmit API Logic
    const openFeedbackBtn = document.getElementById('open-feedback-btn');
    const closeFeedbackBtn = document.getElementById('close-feedback-btn');
    const feedbackModal = document.getElementById('feedback-modal');
    const feedbackForm = document.getElementById('feedback-form');

    if (openFeedbackBtn && closeFeedbackBtn && feedbackModal && feedbackForm) {

        // Open Modal
        openFeedbackBtn.addEventListener('click', () => {
            feedbackModal.classList.add('active');
            document.body.classList.add('modal-open');
            // Update URL to /feedback like a subdirectory
            history.pushState({ feedback: true }, '', '/feedback');
            const cursor = document.getElementById('custom-cursor');
            if (cursor) cursor.classList.remove('hover');

            // Auto-focus the textarea for immediate typing
            setTimeout(() => document.getElementById('feedback-message').focus(), 100);
        });

        // Close Modal via Button â€” plays closing animation first, then removes active
        const closeModal = () => {
            feedbackModal.classList.add('closing');
            setTimeout(() => {
                feedbackModal.classList.remove('active');
                feedbackModal.classList.remove('closing');
                document.body.classList.remove('modal-open');
                // Restore URL back to original path
                history.pushState({}, '', '/');
            }, 300); // match CSS animation duration
        };
        closeFeedbackBtn.addEventListener('click', closeModal);

        // Close Modal by clicking the blurred background overlay
        feedbackModal.addEventListener('click', (e) => {
            if (e.target === feedbackModal) {
                closeModal();
            }
        });

        // 19. Strict Validation & Background FormSubmit API Delivery
        const nameInput = document.getElementById('feedback-name');
        const titleInput = document.getElementById('feedback-title');
        const messageInput = document.getElementById('feedback-message');
        const inputs = [nameInput, titleInput, messageInput];

        // Clear red error borders as user types
        inputs.forEach(input => {
            if (input) {
                input.addEventListener('input', () => {
                    if (input.value.trim() !== '') {
                        input.style.border = '';
                    }
                });
            }
        });

        feedbackForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = feedbackForm.querySelector('button[type="submit"]');
            const successMsg = document.getElementById('feedback-success');

            const name = nameInput ? nameInput.value.trim() : '';
            const title = titleInput ? titleInput.value.trim() : '';
            const message = messageInput ? messageInput.value.trim() : '';

            let isValid = true;

            // Highlight empty fields with red border and block submission
            if (!name) {
                if (nameInput) nameInput.style.border = '2px solid #EF4444';
                isValid = false;
            }
            if (!title) {
                if (titleInput) titleInput.style.border = '2px solid #EF4444';
                isValid = false;
            }
            if (!message) {
                if (messageInput) messageInput.style.border = '2px solid #EF4444';
                isValid = false;
            }

            if (!isValid) {
                alert('Kripya saari details (Name, Subject, and Message) bharne ke baad hi send karein!');
                return;
            }

            const originalText = submitBtn.innerHTML;
            submitBtn.textContent = 'Sending...';
            submitBtn.style.opacity = '0.7';
            submitBtn.disabled = true;

            try {
                const payload = {
                    access_key: "8249fc4b-f5a7-440f-9319-6943e21f01a4",
                    subject: "New Website Feedback: " + title,
                    name: name,
                    message: message,
                    botcheck: ""
                };

                const response = await fetch("https://api.web3forms.com/submit", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify(payload)
                });

                const result = await response.json();

                if (result.success) {
                    nameInput.value = '';
                    titleInput.value = '';
                    messageInput.value = '';
                    inputs.forEach(inp => inp.style.border = '');
                    successMsg.style.display = 'block';

                    setTimeout(() => {
                        successMsg.style.display = 'none';
                        closeModal();
                    }, 2500);
                } else {
                    alert('Error: ' + (result.message || 'Unknown error. Please try again.'));
                }
            } catch (error) {
                console.error('Feedback Error:', error);
                alert('Error: ' + error.message);
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.style.opacity = '1';
                submitBtn.disabled = false;
            }
        });

    }

    // ==============================================================
    // StreamVault Pro Downloader & Precision Trimmer Logic
    // ==============================================================
    const videoUrlInput = document.getElementById('video-url');
    const clearUrlBtn = document.getElementById('clear-url-btn');
    const fetchBtn = document.getElementById('fetch-btn');

    if (videoUrlInput) {
        const updateClearBtn = () => {
            if (clearUrlBtn && videoUrlInput) {
                if (videoUrlInput.value.trim().length > 0) {
                    clearUrlBtn.classList.remove('hidden');
                    clearUrlBtn.classList.add('active');
                    clearUrlBtn.style.display = 'flex';
                } else {
                    clearUrlBtn.classList.add('hidden');
                    clearUrlBtn.classList.remove('active');
                    clearUrlBtn.style.display = 'none';
                }
            }
        };

        // Run updateClearBtn initially to guarantee hidden on startup
        updateClearBtn();

        videoUrlInput.addEventListener('input', updateClearBtn);
        videoUrlInput.addEventListener('keyup', updateClearBtn);
        videoUrlInput.addEventListener('change', updateClearBtn);
        videoUrlInput.addEventListener('paste', () => setTimeout(updateClearBtn, 50));

        videoUrlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                processUrl();
            }
        });
    }

    if (clearUrlBtn) {
        clearUrlBtn.addEventListener('click', () => {
            if (videoUrlInput) videoUrlInput.value = '';
            clearUrlBtn.classList.add('hidden');
            clearUrlBtn.classList.remove('active');
            clearUrlBtn.style.display = 'none';
            hideResultCard();
            hideStatus();
            currentVideoData = null;
        });
    }

    if (fetchBtn) {
        fetchBtn.addEventListener('click', () => {
            processUrl();
        });
    }

});

// Disable custom cursor on touch devices — runs after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) {
        const cursorEl = document.getElementById('custom-cursor');
        if (cursorEl) cursorEl.style.display = 'none';
    }
});

const isLocalTesting = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('10.') || window.location.hostname.startsWith('192.168.') || window.location.protocol === 'file:';
const API_BASE_URL = isLocalTesting ? (window.location.port ? `${window.location.protocol}//${window.location.hostname}:${window.location.port}` : 'http://127.0.0.1:7777') : 'https://amitkushwaha-streamvault.onrender.com';

let currentVideoData = null;

async function processUrl() {
  const input = document.getElementById('video-url');
  const fetchBtn = document.getElementById('fetch-btn');
  const inputCard = document.querySelector('.sv-input-card');
  const url = input ? input.value.trim() : '';

  if (!url) {
    showStatus('Please enter a YouTube video URL.', 'error');
    return;
  }

  if (!isValidYoutubeUrl(url)) {
    showStatus('Invalid YouTube URL! Please enter a valid youtube.com or youtu.be link.', 'error');
    return;
  }

  // Visual Loading State on Button and Input Card
  if (fetchBtn) {
    fetchBtn.disabled = true;
    fetchBtn.classList.add('loading');
    fetchBtn.innerHTML = `
      <svg class="sv-spin-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
      <span>Fetching Media...</span>
    `;
  }
  if (inputCard) inputCard.classList.add('is-fetching');

  showStatus('⚡ Connecting to YouTube Engine... Extracting 4K Video & MP3 Audio Streams...', 'info', true);
  hideResultCard();

  let data = null;
  let maxRetries = 3;
  let attempt = 0;

  try {
    while (attempt < maxRetries) {
      try {
        if (attempt > 0) {
          showStatus(`🚀 Waking up cloud engine (Attempt ${attempt + 1}/${maxRetries})... Please wait a few seconds...`, 'info', true);
          await new Promise(res => setTimeout(res, 4000));
        }

        const response = await fetch(`${API_BASE_URL}/api/info`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url })
        });

        const rawText = await response.text();
        if (!rawText || rawText.trim() === '') {
          throw new Error('Empty response from server');
        }

        try {
          data = JSON.parse(rawText);
        } catch (parseErr) {
          throw new Error('Invalid response structure');
        }

        if (!response.ok || data.error) {
          showStatus(data.error || 'Failed to fetch video details.', 'error');
          return;
        }

        // Success! Break retry loop
        break;
      } catch (err) {
        attempt++;
        if (attempt >= maxRetries) {
          showStatus(`Connection error: Unable to reach download server. Please check your internet or try again in a few seconds.`, 'error');
          return;
        }
      }
    }

    if (data) {
      currentVideoData = data;
      currentVideoData.original_url = url;
      displayResults(data);
      hideStatus();
    }
  } finally {
    if (fetchBtn) {
      fetchBtn.disabled = false;
      fetchBtn.classList.remove('loading');
      fetchBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
        <span>Fetch Media</span>
      `;
    }
    if (inputCard) inputCard.classList.remove('is-fetching');
  }
}

function displayResults(data) {
  const thumb = document.getElementById('meta-thumb');
  const title = document.getElementById('meta-title');
  const channel = document.getElementById('meta-channel');
  const views = document.getElementById('meta-views');
  const duration = document.getElementById('meta-duration');

  if (views) {
    views.remove();
  }

  if (thumb) {
    let vidId = data.id || data.video_id;
    if (!vidId && data.url) {
      const match = data.url.match(/(?:v=|\/|be\/)([a-zA-Z0-9_-]{11})/);
      if (match) vidId = match[1];
    }

    const fallbackUrls = [];
    if (vidId) {
      fallbackUrls.push(`https://img.youtube.com/vi/${vidId}/hqdefault.jpg`);
      fallbackUrls.push(`https://img.youtube.com/vi/${vidId}/mqdefault.jpg`);
      fallbackUrls.push(`https://img.youtube.com/vi/${vidId}/0.jpg`);
    }
    if (data.thumbnail) {
      fallbackUrls.push(data.thumbnail);
    }
    fallbackUrls.push('https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=80');

    let attemptIdx = 0;
    thumb.onerror = function() {
      attemptIdx++;
      if (attemptIdx < fallbackUrls.length) {
        this.src = fallbackUrls[attemptIdx];
      }
    };
    thumb.src = fallbackUrls[0];
  }
  if (title) title.textContent = data.title;
  if (channel) channel.textContent = data.channel;
  if (duration) duration.textContent = data.duration;

  const trimmerCheck = document.getElementById('enable-trimmer');
  const trimmerControls = document.getElementById('trimmer-controls');
  const trimBadge = document.getElementById('trim-duration-badge');
  const startInput = document.getElementById('trim-start');
  const endInput = document.getElementById('trim-end');
  const labelStart = document.getElementById('label-trim-start');
  const labelEnd = document.getElementById('label-trim-end');

  const isLongVideo = data.duration_sec && data.duration_sec >= 3600;
  const fullDurationStr = formatSecondsToTime(data.duration_sec || 60);

  if (labelStart) labelStart.textContent = isLongVideo ? "▶ Start Timestamp (hh:mm:ss):" : "▶ Start Timestamp (mm:ss):";
  if (labelEnd) labelEnd.textContent = isLongVideo ? "⏹ End Timestamp (hh:mm:ss):" : "⏹ End Timestamp (mm:ss):";

  if (trimmerCheck) trimmerCheck.checked = false;
  if (trimmerControls) trimmerControls.classList.add('hidden');
  if (trimBadge) trimBadge.classList.add('hidden');
  
  if (startInput) {
    startInput.value = "";
    startInput.placeholder = isLongVideo ? "00:00:00 (Start)" : "00:00 (Start)";
  }
  
  if (endInput) {
    endInput.value = "";
    endInput.placeholder = `${fullDurationStr} (Full Video)`;
  }

  renderVideoFormats(data.video_options);
  renderAudioFormats(data.audio_options);

  switchTab('video');

  // Strictly keep progress box hidden until user clicks a download button
  const progressBox = document.getElementById('download-progress-box');
  if (progressBox) {
    progressBox.classList.add('hidden');
    progressBox.style.display = 'none';
  }

  const resultContainer = document.getElementById('result-container');
  if (resultContainer) resultContainer.classList.remove('hidden');
}

function toggleTrimmer() {
  const trimmerCheck = document.getElementById('enable-trimmer');
  const controls = document.getElementById('trimmer-controls');
  const badge = document.getElementById('trim-duration-badge');

  if (trimmerCheck && trimmerCheck.checked) {
    if (controls) controls.classList.remove('hidden');
    if (badge) badge.classList.remove('hidden');
    updateTrimDuration();
  } else {
    if (controls) controls.classList.add('hidden');
    if (badge) badge.classList.add('hidden');
  }
}

function applyPreset(preset) {
  if (!currentVideoData) return;
  const startInput = document.getElementById('trim-start');
  const endInput = document.getElementById('trim-end');
  if (!startInput || !endInput) return;

  const isLongVideo = currentVideoData.duration_sec && currentVideoData.duration_sec >= 3600;

  if (preset === 'reset') {
    startInput.value = "";
    endInput.value = "";
  } else if (typeof preset === 'number') {
    startInput.value = isLongVideo ? "00:00:00" : "00:00";
    const endSec = Math.min(preset, currentVideoData.duration_sec || preset);
    endInput.value = formatSecondsToTime(endSec);
  }
  updateTrimDuration();
}

function updateTrimDuration() {
  const startInput = document.getElementById('trim-start');
  const endInput = document.getElementById('trim-end');
  const badge = document.getElementById('trim-duration-badge');
  if (!startInput || !endInput || !badge) return;

  const rawStart = startInput.value.trim();
  const rawEnd = endInput.value.trim();

  if (rawStart && !isValidTimestampFormat(rawStart)) {
    badge.textContent = '⚠️ Invalid Start Format (Max 2 digits after colon)';
    badge.style.background = 'rgba(239, 68, 68, 0.2)';
    badge.style.borderColor = 'rgba(239, 68, 68, 0.4)';
    badge.style.color = '#ef4444';
    return;
  }

  if (rawEnd && !isValidTimestampFormat(rawEnd)) {
    badge.textContent = '⚠️ Invalid End Format (Max 2 digits after colon)';
    badge.style.background = 'rgba(239, 68, 68, 0.2)';
    badge.style.borderColor = 'rgba(239, 68, 68, 0.4)';
    badge.style.color = '#ef4444';
    return;
  }

  // Default to 0 seconds if start input is empty
  const startSec = rawStart ? timeToSeconds(rawStart) : 0;
  
  // Default to total duration if end input is empty
  const totalDuration = (currentVideoData && currentVideoData.duration_sec) ? currentVideoData.duration_sec : 60;
  const endSec = rawEnd ? timeToSeconds(rawEnd) : totalDuration;

  if (startSec !== null && endSec !== null && endSec > startSec) {
    const diff = endSec - startSec;
    badge.textContent = `✂ Selected Clip: ${formatSecondsToTime(diff)}`;
    badge.style.background = 'rgba(6, 182, 212, 0.2)';
    badge.style.borderColor = 'rgba(6, 182, 212, 0.4)';
    badge.style.color = '#06b6d4';
  } else {
    badge.textContent = '⚠️ Invalid Time Range (Start must be before End)';
    badge.style.background = 'rgba(239, 68, 68, 0.2)';
    badge.style.borderColor = 'rgba(239, 68, 68, 0.4)';
    badge.style.color = '#ef4444';
  }
}

function renderVideoFormats(options) {
  const container = document.getElementById('video-formats');
  if (!container) return;
  container.innerHTML = '';

  if (!options || options.length === 0) {
    container.innerHTML = '<p style="color: #94a3b8; padding: 1rem; text-align: center; grid-column: 1/-1;">No specific video resolutions extracted.</p>';
    return;
  }

  options.forEach((opt) => {
    const card = document.createElement('div');
    card.className = 'glass-card';
    card.style.padding = '1.1rem 1.25rem';
    card.style.display = 'flex';
    card.style.justifyContent = 'space-between';
    card.style.alignItems = 'center';
    card.style.background = 'rgba(15, 23, 42, 0.6)';
    card.style.border = '1px solid rgba(255, 255, 255, 0.1)';
    card.style.borderRadius = '0.85rem';

    const qualityLabel = opt.quality || '720p';
    const resText = opt.resolution || `${qualityLabel} HD`;

    card.innerHTML = `
      <div>
        <div style="font-weight: 700; color: #ffffff; font-size: 1.05rem; display: flex; align-items: center; gap: 0.4rem;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff3366" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 8 6 4-6 4Z"/></svg>
          ${resText}
        </div>
        <div style="font-size: 0.8rem; color: #94a3b8; margin-top: 0.25rem;">Format: MP4 • Size: ${opt.filesize_str || 'Original Quality'}</div>
      </div>
      <button class="sv-btn-primary" style="padding: 0.45rem 1.2rem; font-size: 0.85rem; border-radius: 99px; box-shadow: 0 4px 15px rgba(255, 51, 102, 0.3);">
        Download Video
      </button>
    `;
    const dlBtn = card.querySelector('button');
    dlBtn.addEventListener('click', () => {
      startDownload(opt.format_id || 'best', 'video', qualityLabel, opt.url);
    });
    container.appendChild(card);
  });
}

function renderAudioFormats(options) {
  const container = document.getElementById('audio-formats');
  if (!container) return;
  container.innerHTML = '';

  if (!options || options.length === 0) {
    options = [{ format_id: 'bestaudio/best', quality: '320 kbps', filesize_str: 'High Quality MP3' }];
  }

  options.forEach((opt) => {
    const card = document.createElement('div');
    card.className = 'glass-card';
    card.style.padding = '1.1rem 1.25rem';
    card.style.display = 'flex';
    card.style.justifyContent = 'space-between';
    card.style.alignItems = 'center';
    card.style.background = 'rgba(15, 23, 42, 0.6)';
    card.style.border = '1px solid rgba(255, 255, 255, 0.1)';
    card.style.borderRadius = '0.85rem';

    const qualityLabel = opt.quality || '320 kbps';

    card.innerHTML = `
      <div>
        <div style="font-weight: 700; color: #ffffff; font-size: 1.05rem; display: flex; align-items: center; gap: 0.4rem;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
          MP3 Audio (${qualityLabel})
        </div>
        <div style="font-size: 0.8rem; color: #94a3b8; margin-top: 0.25rem;">Format: MP3 Lossless • Size: ${opt.filesize_str || 'Auto'}</div>
      </div>
      <button class="sv-btn-primary" style="background: linear-gradient(135deg, #06b6d4 0%, #0284c7 100%) !important; padding: 0.45rem 1.2rem; font-size: 0.85rem; border-radius: 99px; box-shadow: 0 4px 15px rgba(6, 182, 212, 0.3);">
        Download MP3
      </button>
    `;
    const dlBtn = card.querySelector('button');
    dlBtn.addEventListener('click', () => {
      startDownload(opt.format_id || 'bestaudio/best', 'audio', qualityLabel, opt.url);
    });
    container.appendChild(card);
  });
}

function switchTab(type) {
  const tabVideo = document.getElementById('tab-video');
  const tabAudio = document.getElementById('tab-audio');
  const videoGrid = document.getElementById('video-formats');
  const audioGrid = document.getElementById('audio-formats');

  if (type === 'video') {
    if (tabVideo) tabVideo.classList.add('active');
    if (tabAudio) tabAudio.classList.remove('active');
    if (videoGrid) { videoGrid.classList.remove('hidden'); videoGrid.style.display = 'grid'; }
    if (audioGrid) { audioGrid.classList.add('hidden'); audioGrid.style.display = 'none'; }
  } else {
    if (tabAudio) tabAudio.classList.add('active');
    if (tabVideo) tabVideo.classList.remove('active');
    if (audioGrid) { audioGrid.classList.remove('hidden'); audioGrid.style.display = 'grid'; }
    if (videoGrid) { videoGrid.classList.add('hidden'); videoGrid.style.display = 'none'; }
  }
}

async function startDownload(formatId, mediaType, quality, streamUrl = null) {
  if (!currentVideoData || !currentVideoData.original_url) {
    showStatus('Invalid download request context. Please re-paste URL.', 'error');
    return;
  }

  const progressBox = document.getElementById('download-progress-box');
  const statusText = document.getElementById('progress-status-text');
  const percentText = document.getElementById('progress-percent');
  const fillBar = document.getElementById('progress-bar-fill');
  const floatingBadge = document.getElementById('progress-floating-badge');

  if (progressBox) {
    progressBox.classList.remove('hidden');
    progressBox.style.display = 'block';
    progressBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  const mediaName = mediaType === 'audio' ? 'MP3 Audio' : 'Video';
  let currentPct = 8;

  function updateUI(pct, statusMsg) {
    const rounded = Math.min(Math.max(Math.round(pct), 5), 100);
    if (fillBar) {
      fillBar.style.width = `${rounded}%`;
      fillBar.style.background = 'linear-gradient(90deg, #ff3366, #ff0055, #7000ff)';
    }
    if (percentText) percentText.textContent = `${rounded}%`;
    if (floatingBadge) {
      floatingBadge.style.left = `${rounded}%`;
      floatingBadge.style.background = 'linear-gradient(135deg, #ff0055 0%, #7000ff 100%)';
      floatingBadge.textContent = `${rounded}%`;
    }
    if (statusText && statusMsg) {
      statusText.style.color = 'var(--text-secondary)';
      statusText.textContent = statusMsg;
    }
  }

  updateUI(currentPct, `⚡ Connecting & Extracting 100% Original ${mediaName} (${quality})...`);

  let startParam = '';
  let endParam = '';
  const trimmerCheck = document.getElementById('enable-trimmer');

  if (trimmerCheck && trimmerCheck.checked) {
    const sVal = document.getElementById('trim-start').value.trim();
    const eVal = document.getElementById('trim-end').value.trim();
    if (sVal) startParam = `&start_time=${encodeURIComponent(sVal)}`;
    if (eVal) endParam = `&end_time=${encodeURIComponent(eVal)}`;
    updateUI(currentPct, `✂ Trimming & extracting custom ${mediaName} clip... Please wait.`);
  }

  const downloadId = 'dl_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const downloadUrl = streamUrl 
    ? `${API_BASE_URL}/api/download?stream_url=${encodeURIComponent(streamUrl)}&filename=${encodeURIComponent(currentVideoData.title + '.' + (mediaType === 'audio' ? 'mp3' : 'mp4'))}&type=${encodeURIComponent(mediaType)}`
    : `${API_BASE_URL}/api/download?url=${encodeURIComponent(currentVideoData.original_url)}&format_id=${encodeURIComponent(formatId || 'best')}&type=${encodeURIComponent(mediaType)}&quality=${encodeURIComponent(quality)}&title=${encodeURIComponent(currentVideoData.title)}&download_id=${downloadId}${startParam}${endParam}`;

  let targetPct = 8;
  let isDone = false;

  // Smooth Interpolated Progress Poller
  const pollInterval = setInterval(async () => {
    if (isDone) return;

    try {
      const pRes = await fetch(`${API_BASE_URL}/api/progress?download_id=${downloadId}`);
      if (pRes.ok) {
        const pData = await pRes.json();
        if (pData && pData.percent !== undefined) {
          if (pData.status === 'downloading') {
            targetPct = Math.max(pData.percent, targetPct);
            const speedStr = pData.speed_str || "3.5 MB/s";
            const dlStr = pData.downloaded_str || "0 MB";
            const totStr = (pData.total_str && pData.total_str !== '0 MB' && pData.total_str !== dlStr) ? ` of ${pData.total_str}` : '';
            
            currentPct = Math.max(currentPct, targetPct);
            const displayPct = Math.round(currentPct);
            const msg = `⚡ Downloading ${mediaName}: ${dlStr}${totStr} (${displayPct}%) • 🚀 Speed: ${speedStr}`;
            updateUI(displayPct, msg);
          } else if (pData.status === 'processing') {
            targetPct = Math.max(targetPct, 85);
            if (currentPct < 95) currentPct += 1.5;
            updateUI(currentPct, `🎬 Trimming & Merging 100% Original Streams... Please wait.`);
          }
        }
      }
    } catch (e) {
      if (currentPct < 90) {
        currentPct += 1;
        updateUI(currentPct, `⚡ Processing ${mediaName}... Please wait.`);
      }
    }
  }, 250);

  try {
    const controller = new AbortController();
    // 8-minute timeout for large video downloads (Render free tier can be slow)
    const timeoutId = setTimeout(() => controller.abort(), 8 * 60 * 1000);
    let res;
    try {
      res = await fetch(downloadUrl, { signal: controller.signal });
      clearTimeout(timeoutId);
    } catch (fetchErr) {
      clearTimeout(timeoutId);
      if (fetchErr.name === 'AbortError') {
        throw new Error('Download timed out. Server may be busy — please try again in a moment.');
      }
      throw fetchErr;
    }
    if (!res.ok) {
      let errMsg = `Server error (Status ${res.status})`;
      try {
        const errData = await res.json();
        if (errData && errData.error) errMsg = errData.error;
      } catch (e) {}
      throw new Error(errMsg);
    }

    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    isDone = true;
    clearInterval(pollInterval);

    const disposition = res.headers.get('Content-Disposition');
    let filename = `${currentVideoData.title}.${mediaType === 'audio' ? 'mp3' : 'mp4'}`;
    if (disposition && disposition.includes('filename=')) {
      filename = disposition.split('filename=')[1].replace(/["']/g, '');
    }

    const saveLinkHtml = `<a href="${blobUrl}" download="${filename.replace(/"/g, '')}" style="color: #4ade80; text-decoration: underline; font-weight: 700; margin-left: 0.4rem;">💾 Click Here to Save File</a>`;
    if (statusText) statusText.innerHTML = `✅ Download Complete! ${saveLinkHtml}`;
    if (fillBar) fillBar.style.width = '100%';
    if (percentText) percentText.textContent = '100%';

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    try { link.click(); } catch(e) {}
    document.body.removeChild(link);

    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
    }, 60000);

  } catch (err) {
    isDone = true;
    clearInterval(pollInterval);
    if (fillBar) {
      fillBar.style.width = '100%';
      fillBar.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
    }
    if (percentText) percentText.textContent = 'Failed';
    if (floatingBadge) {
      floatingBadge.style.left = '100%';
      floatingBadge.style.background = '#ef4444';
      floatingBadge.textContent = '❌ Failed';
    }
    if (statusText) {
      statusText.style.color = '#f87171';
      statusText.innerHTML = `❌ <b>Download Failed:</b> ${err.message || 'Server error'}. Please click Download again to retry.`;
    }
    hideStatus();
  }
}

function isValidYoutubeUrl(url) {
  return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/.test(url);
}

function sanitizeTimeInput(input) {
  if (!input) return;
  let val = input.value;

  // Allow digits and colons only
  val = val.replace(/[^0-9:]/g, '');

  const isLongVideo = currentVideoData && currentVideoData.duration_sec && currentVideoData.duration_sec >= 3600;

  // Auto-insert colons after 2 digits as user types
  const rawDigits = val.replace(/:/g, '');

  if (!val.includes(':')) {
    if (rawDigits.length === 2 && input.value.length === 2) {
      val = rawDigits + ':';
    } else if (rawDigits.length >= 4 && !isLongVideo) {
      val = rawDigits.substring(0, 2) + ':' + rawDigits.substring(2, 4);
    } else if (rawDigits.length >= 6 && isLongVideo) {
      val = rawDigits.substring(0, 2) + ':' + rawDigits.substring(2, 4) + ':' + rawDigits.substring(4, 6);
    }
  }

  // Prevent typing 3 digits after a colon (e.g. ":300" -> ":30", ":023" -> ":02")
  val = val.replace(/(:[0-9]{2})[0-9]+/g, '$1');

  // Cap max length (MM:SS is 5 chars, HH:MM:SS is 8 chars)
  const maxLen = isLongVideo ? 8 : 5;
  if (val.length > maxLen) {
    val = val.substring(0, maxLen);
  }

  if (input.value !== val) {
    input.value = val;
  }
}

function isValidTimestampFormat(str) {
  if (!str) return true;
  const trimmed = str.trim();

  // Single digit or trailing colon is invalid (must use 2 digits e.g. 02:00)
  if (/^\d{1}$/.test(trimmed)) return false;
  if (trimmed.endsWith(':')) return false;

  const parts = trimmed.split(':');
  if (parts.length > 3) return false;

  // 2 parts: MM:SS
  if (parts.length === 2) {
    const [m, s] = parts;
    if (!/^\d{2}$/.test(m) || !/^\d{2}$/.test(s)) return false;
    const secNum = parseInt(s, 10);
    if (isNaN(secNum) || secNum >= 60) return false;
    return true;
  }

  // 3 parts: HH:MM:SS
  if (parts.length === 3) {
    const [h, m, s] = parts;
    if (!/^\d{2}$/.test(h) || !/^\d{2}$/.test(m) || !/^\d{2}$/.test(s)) return false;
    const minNum = parseInt(m, 10);
    const secNum = parseInt(s, 10);
    if (isNaN(minNum) || isNaN(secNum) || minNum >= 60 || secNum >= 60) return false;
    return true;
  }

  return false;
}

function timeToSeconds(str) {
  if (!str) return null;
  let trimmed = str.trim();

  // Auto-convert 4 digits "0130" -> "01:30"
  if (/^\d{4}$/.test(trimmed)) {
    trimmed = trimmed.substring(0, 2) + ':' + trimmed.substring(2, 4);
  }
  // Auto-convert 6 digits "011530" -> "01:15:30"
  else if (/^\d{6}$/.test(trimmed)) {
    trimmed = trimmed.substring(0, 2) + ':' + trimmed.substring(2, 4) + ':' + trimmed.substring(4, 6);
  }

  if (!isValidTimestampFormat(trimmed)) return null;

  const parts = trimmed.split(':');
  try {
    if (parts.length === 3) {
      const h = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      const s = parseInt(parts[2], 10);
      if (m >= 60 || s >= 60) return null;
      return h * 3600 + m * 60 + s;
    }
    if (parts.length === 2) {
      const m = parseInt(parts[0], 10);
      const s = parseInt(parts[1], 10);
      if (s >= 60) return null;
      return m * 60 + s;
    }
    return null;
  } catch (e) {
    return null;
  }
}

function formatSecondsToTime(sec) {
  if (sec === undefined || sec === null || isNaN(sec)) return "00:00";
  const s = Math.floor(sec);
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  const isLong = (currentVideoData && currentVideoData.duration_sec && currentVideoData.duration_sec >= 3600) || hrs > 0;
  
  return isLong 
    ? `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    : `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function showStatus(msg, type = 'info', spinner = false) {
  const banner = document.getElementById('status-banner');
  const msgEl = document.getElementById('status-message');
  if (banner && msgEl) {
    banner.className = `sv-status-banner ${type}`;
    msgEl.textContent = msg;
    banner.classList.remove('hidden');
  }
}

function hideStatus() {
  const banner = document.getElementById('status-banner');
  if (banner) banner.classList.add('hidden');
}

function hideResultCard() {
  const card = document.getElementById('result-container');
  const progressBox = document.getElementById('download-progress-box');
  const statusBanner = document.getElementById('status-banner');
  if (card) card.classList.add('hidden');
  if (progressBox) progressBox.classList.add('hidden');
  if (statusBanner) statusBanner.classList.add('hidden');
}

