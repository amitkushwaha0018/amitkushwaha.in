document.addEventListener('DOMContentLoaded', () => {
    // 0. Preloader Logic
    const preloader = document.getElementById('preloader');
    if (preloader) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                preloader.classList.add('fade-out');
                setTimeout(() => {
                    preloader.style.display = 'none';
                }, 500);
            }, 800);
        });
    }

    // Auto-open Feedback Modal if URL has ?feedback=open
    // (Triggered when someone visits www.amit-kushwaha.in/feedback)
    if (window.location.search.includes('feedback=open')) {
        // Clean the URL so ?feedback=open doesn't show in address bar
        window.history.replaceState({}, document.title, window.location.pathname);
        // Wait for page to fully load, then open the modal
        setTimeout(() => {
            const feedbackModal = document.getElementById('feedback-modal');
            if (feedbackModal) {
                feedbackModal.classList.add('active');
                document.body.classList.add('modal-open');
            }
        }, 1200);
    }

    // Clean URL section routing (?section=home â†’ scroll + replaceState to /home)
    const urlParams = new URLSearchParams(window.location.search);
    const sectionParam = urlParams.get('section');

    if (sectionParam) {
        const validSections = ['home', 'experience', 'youtube', 'contact', 'stats'];
        if (validSections.includes(sectionParam)) {
            // Clean the URL immediately to just /sectionname
            window.history.replaceState({}, document.title, '/' + sectionParam);

            // Wait for preloader to finish, then aggressively scroll
            setTimeout(() => {
                const target = document.getElementById(sectionParam);
                if (target) {
                    // Try smooth scroll first
                    target.scrollIntoView({ behavior: 'smooth' });
                    // Failsafe jump if browser interrupts
                    setTimeout(() => {
                        if (Math.abs(window.scrollY - target.offsetTop) > 100) {
                            window.scrollTo({ top: target.offsetTop - 80, behavior: 'auto' });
                        }
                    }, 500);
                }
            }, 850); // Just after the 800ms preloader
        }
    }

    // Intercept nav link clicks (/home, /experience etc.) â€” smooth scroll + clean URL
    document.querySelectorAll('a[href^="/"]').forEach(link => {
        const path = link.getAttribute('href'); // e.g. "/home"
        const section = path.replace('/', '');   // e.g. "home"
        const validSections = ['home', 'experience', 'youtube', 'contact', 'stats'];
        if (validSections.includes(section)) {
            link.addEventListener('click', e => {
                e.preventDefault();
                const target = document.getElementById(section);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                    window.history.pushState({}, document.title, '/' + section);
                }
            });
        }
    });

    // Custom Cursor Logic
    const cursor = document.getElementById('custom-cursor');
    if (cursor) {
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

        document.addEventListener('mousemove', e => updateCursorPos(e.clientX, e.clientY));
        document.addEventListener('touchmove', e => updateCursorPos(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
        document.addEventListener('touchstart', e => updateCursorPos(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
    }

    // Hover & Haptic Feedback Logic
    const interactiveElements = document.querySelectorAll('a, button, .magnetic-element, input, textarea');
    interactiveElements.forEach(el => {

        // Add hover effect to custom cursor if it exists AND modal is not open
        if (cursor) {
            el.addEventListener('mouseenter', () => {
                if (!document.body.classList.contains('modal-open')) {
                    cursor.classList.add('hover');
                }
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('hover');
            });
        }

        // Add mobile haptic feedback on click (10ms micro-vibration)
        el.addEventListener('click', () => {
            if (navigator.vibrate) {
                navigator.vibrate(10);
            }
        });
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
                document.body.style.overflow = '';
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

    // 5. YouTube Subscribe Button â€” Effects
    // 5. YouTube Subscribe Button — Inner Shine Effect
    const ytSubscribeButton = document.querySelector('.yt-subscribe');
    if (ytSubscribeButton) {

        // Basic Navigation Handling
        ytSubscribeButton.addEventListener('click', function (e) {
            e.preventDefault();
            const targetUrl = this.getAttribute('href');
            // Give a tiny delay for immediate visual feedback before redirect
            setTimeout(() => { window.location.href = targetUrl; }, 150);
        });

        // Trigger rainbow shadow when scrolling to it
        const launchHighlight = (btn) => {
            btn.classList.add('inner-highlight');
            // Remove after exactly 10 seconds as requested
            setTimeout(() => btn.classList.remove('inner-highlight'), 10000);
        };

        const subscribeObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    launchHighlight(ytSubscribeButton);
                    subscribeObserver.unobserve(ytSubscribeButton);
                }
            });
        }, { threshold: 0.5 });

        subscribeObserver.observe(ytSubscribeButton);
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
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${ytChannelId}&part=snippet,id&order=date&maxResults=10&type=video`;

        fetch(searchUrl)
            .then(response => response.json())
            .then(searchData => {
                if (!searchData.items || searchData.items.length === 0) {
                    shortsContainer.innerHTML = '<p style="color: var(--text-secondary); text-align: center; width: 100%; padding: 3rem 0;">No shorts available yet.</p>';
                    return null;
                }

                const videoIds = searchData.items.map(item => item.id.videoId).join(',');
                const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?key=${apiKey}&id=${videoIds}&part=contentDetails,snippet`;

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
                    const durationStr = video.contentDetails.duration;

                    // Robust ISO 8601 duration parsing
                    let totalSeconds = 0;
                    const matchPattern = durationStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
                    if (matchPattern) {
                        const h = parseInt(matchPattern[1] || 0);
                        const m = parseInt(matchPattern[2] || 0);
                        const s = parseInt(matchPattern[3] || 0);
                        totalSeconds = (h * 3600) + (m * 60) + s;
                    }

                    const title = video.snippet.title;
                    const desc = video.snippet.description ? video.snippet.description.toLowerCase() : '';

                    // Mark as short if <= 65 seconds (covers YT's 1s padding) OR explicitly tagged
                    let isShort = (totalSeconds <= 65) || title.toLowerCase().includes('#shorts') || desc.includes('#shorts');

                    const pubDate = new Date(video.snippet.publishedAt);
                    const date = `${String(pubDate.getDate()).padStart(2, '0')}/${String(pubDate.getMonth() + 1).padStart(2, '0')}/${pubDate.getFullYear()}`;
                    const videoId = video.id;
                    const thumbnailUrl = video.snippet.thumbnails.high ? video.snippet.thumbnails.high.url : video.snippet.thumbnails.default.url;

                    const videoCard = document.createElement('a');
                    videoCard.target = '_blank';
                    videoCard.rel = 'noopener noreferrer';
                    videoCard.className = 'video-wrapper glass-card';
                    videoCard.style.textDecoration = 'none';
                    videoCard.style.display = 'block';
                    videoCard.style.overflow = 'hidden';

                    if (isShort && shortsCount < 5) {
                        videoCard.href = `https://www.youtube.com/shorts/${videoId}`;
                        videoCard.innerHTML = `
                            <div class="video-thumbnail" style="position: relative; padding-bottom: 177.77%; height: 0; overflow: hidden; background: #000;">
                                <img src="${thumbnailUrl}" alt="${title}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;">
                                <div class="play-overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s; color: white;">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                                </div>
                            </div>
                            <div class="video-info" style="padding: 1.25rem;">
                                <h3 style="color: var(--text-primary); font-size: 1.05rem; margin: 0 0 0.5rem 0; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${title}</h3>
                                <p style="color: var(--text-secondary); font-size: 0.85rem; margin: 0;">${date}</p>
                            </div>
                        `;
                        // Add hover effect
                        videoCard.addEventListener('mouseenter', () => { videoCard.querySelector('.play-overlay').style.opacity = '1'; });
                        videoCard.addEventListener('mouseleave', () => { videoCard.querySelector('.play-overlay').style.opacity = '0'; });
                        shortsContainer.appendChild(videoCard);
                        shortsCount++;
                    } else if (!isShort && videosCount < 3) {
                        videoCard.href = `https://www.youtube.com/watch?v=${videoId}`;
                        videoCard.classList.add('widescreen');
                        videoCard.innerHTML = `
                            <div class="video-thumbnail" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; background: #000;">
                                <img src="${thumbnailUrl}" alt="${title}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;">
                                <div class="play-overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s; color: white;">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                                </div>
                            </div>
                            <div class="video-info" style="padding: 1.25rem;">
                                <h3 style="color: var(--text-primary); font-size: 1.05rem; margin: 0 0 0.5rem 0; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${title}</h3>
                                <p style="color: var(--text-secondary); font-size: 0.85rem; margin: 0;">${date}</p>
                            </div>
                        `;
                        // Add hover effect
                        videoCard.addEventListener('mouseenter', () => { videoCard.querySelector('.play-overlay').style.opacity = '1'; });
                        videoCard.addEventListener('mouseleave', () => { videoCard.querySelector('.play-overlay').style.opacity = '0'; });
                        videosContainer.appendChild(videoCard);
                        videosCount++;
                    }
                });

                // Add Empty states if neither found
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

    // 8. Animated Statistics Counter (Live API Fetch)
    const statsSection = document.querySelector('.stats-grid');
    if (statsSection) {
        const counters = document.querySelectorAll('.counter');
        const ytChannelIdStats = 'UCUisfQ3CLN_7sFl7kMtTD9g'; // User's Channel ID
        const apiKeyStats = 'AIzaSyCYe6pPDE_tbum_qSIP3xij7oO2dVZrVf0'; // User API Key

        // Track last known values for change detection
        let lastSubs = 0, lastViews = 0;

        const fmt = (n) => n.toLocaleString('en-IN');

        const animateTo = (el, from, to) => {
            if (!el || from === to) return;
            const diff = to - from;
            const steps = 30;
            let step = 0;
            const interval = setInterval(() => {
                step++;
                const val = Math.round(from + (diff * step / steps));
                el.textContent = fmt(val);
                if (step >= steps) {
                    clearInterval(interval);
                    el.textContent = fmt(to);
                    el.classList.remove('tick-pop');
                    void el.offsetWidth;
                    el.classList.add('tick-pop');
                }
            }, 30);
        };

        const fetchLiveStats = async () => {
            try {
                const response = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${ytChannelIdStats}&key=${apiKeyStats}`);
                const data = await response.json();

                if (data && data.items && data.items.length > 0) {
                    const stats = data.items[0].statistics;

                    // Update stats section counters with real YouTube data
                    counters[0].setAttribute('data-target', stats.subscriberCount || 0);
                    counters[1].setAttribute('data-target', stats.viewCount || 0);
                    counters[2].setAttribute('data-target', stats.videoCount || 0);
                }
            } catch (error) {
                console.error('Error fetching YouTube stats:', error);
            }
        };

        // Fetch once on load (Standard API sync, no live Social Blade polling)
        fetchLiveStats();


        const speed = 150; // Delay smoother 

        const animateCounters = () => {
            counters.forEach((counter, index) => {
                const updateCount = () => {
                    const target = +counter.getAttribute('data-target');
                    if (!counter.countValue) counter.countValue = 0;

                    // Prevent dividing by zero if target is 0
                    if (target === 0) {
                        counter.innerText = '0';
                        return;
                    }

                    // Dynamically set speed: Fast for Subs/Views, much slower for Videos (index 2)
                    const currentSpeedDelay = index === 2 ? 800 : speed;

                    // Ensure the speed is at least 1, otherwise small numbers won't animate
                    const curSpeed = Math.max(target / currentSpeedDelay, 1);

                    if (counter.countValue < target) {
                        counter.countValue = Math.ceil(counter.countValue + curSpeed);
                        if (counter.countValue > target) counter.countValue = target;

                        if (target >= 1000000) {
                            counter.innerText = (counter.countValue / 1000000).toFixed(1) + 'M+';
                        } else if (target >= 1000) {
                            counter.innerText = (counter.countValue / 1000).toFixed(1) + 'K+';
                        } else {
                            counter.innerText = counter.countValue;
                        }

                        requestAnimationFrame(updateCount);
                    } else {
                        if (target >= 1000000) {
                            counter.innerText = (target / 1000000).toFixed(1) + 'M+';
                        } else if (target >= 1000) {
                            counter.innerText = (target / 1000).toFixed(1) + 'K+';
                        } else {
                            counter.innerText = target;
                        }
                    }
                };
                updateCount();
            });
        };

        const statsObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Fetch live data first, THEN animate
                    fetchLiveStats().then(() => {
                        animateCounters();
                    });
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        statsObserver.observe(statsSection);
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

        // 19. Background FormSubmit API Delivery
        feedbackForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nameInput = document.getElementById('feedback-name');
            const titleInput = document.getElementById('feedback-title');
            const messageInput = document.getElementById('feedback-message');
            const submitBtn = feedbackForm.querySelector('button[type="submit"]');
            const successMsg = document.getElementById('feedback-success');

            const name = nameInput.value.trim();
            const title = titleInput.value.trim();
            const message = messageInput.value.trim();

            if (!name || !title || !message) return;

            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.style.opacity = '0.7';
            submitBtn.disabled = true;

            try {
                // Web3Forms API - Manually built payload for reliability
                const payload = {
                    access_key: "8249fc4b-f5a7-440f-9319-6943e21f01a4",
                    subject: "New Portfolio Feedback: " + title,
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
                submitBtn.textContent = originalText;
                submitBtn.style.opacity = '1';
                submitBtn.disabled = false;
            }
        });

    }

});

