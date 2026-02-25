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

    // Custom Cursor Logic
    const cursor = document.getElementById('custom-cursor');
    if (cursor) {
        document.addEventListener('mousemove', e => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });

        // Add touch support for mobile
        document.addEventListener('touchmove', e => {
            cursor.style.left = e.touches[0].clientX + 'px';
            cursor.style.top = e.touches[0].clientY + 'px';
        }, { passive: true });

        document.addEventListener('touchstart', e => {
            cursor.style.left = e.touches[0].clientX + 'px';
            cursor.style.top = e.touches[0].clientY + 'px';
        }, { passive: true });

        // Add hover effect to all links, buttons, and magnetic elements
        const interactiveElements = document.querySelectorAll('a, button, .magnetic-element');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
        });
    }

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
        });
    });

    // 1. Theme Toggle Logic
    const themeToggle = document.getElementById('theme-toggle');

    const setTheme = (theme, saveToStorage = true) => {
        document.documentElement.setAttribute('data-theme', theme);
        if (saveToStorage) {
            localStorage.setItem('theme', theme);
        }
    };

    // Listen for real-time system theme changes
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
        // Only auto-switch if the user hasn't explicitly saved a manual preference
        if (!localStorage.getItem('theme')) {
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
        });
    }

    // Close mobile menu on clicking a link
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (hamburger.classList.contains('active')) {
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('open');
                hamburger.setAttribute('aria-expanded', 'false');
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

    // 5. YouTube Subscribe Button Magic Animation
    const ytSubscribeButton = document.querySelector('.yt-subscribe');
    if (ytSubscribeButton) {
        ytSubscribeButton.addEventListener('click', function (e) {
            e.preventDefault(); // Stop immediate navigation to let animation play

            const targetUrl = this.getAttribute('href');

            // Remove the class if it already exists to allow re-triggering
            this.classList.remove('animate-magic');

            // Trigger a reflow
            void this.offsetWidth;

            // Add the animation class
            this.classList.add('animate-magic');

            // Generate playful sparkles
            for (let i = 0; i < 36; i++) {
                const sparkle = document.createElement('span');
                sparkle.classList.add('btn-sparkle');

                // Randomize trajectory (wider spread)
                const tx = (Math.random() - 0.5) * 250; // Horizontal spread
                const ty = (Math.random() - 0.5) * 250; // Vertical spread
                sparkle.style.setProperty('--tx', `${tx}px`);
                sparkle.style.setProperty('--ty', `${ty}px`);

                this.appendChild(sparkle);

                // Clean up the DOM element after animation completes
                setTimeout(() => sparkle.remove(), 700);
            }

            // Wait for 600ms before navigating
            setTimeout(() => {
                // Open in the current tab instead of _blank
                window.location.href = targetUrl;
            }, 600);
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

                    // Simple ISO 8601 duration parsing for Shorts (under 61 seconds)
                    let isShort = false;
                    if (durationStr.includes('M') && !durationStr.includes('H')) {
                        const minutes = parseInt(durationStr.match(/PT(\d+)M/)?.[1] || 0);
                        if (minutes === 0 || (minutes === 1 && !durationStr.includes('S'))) {
                            isShort = true;
                        }
                    } else if (!durationStr.includes('M') && !durationStr.includes('H')) {
                        isShort = true;
                    }

                    const title = video.snippet.title;
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

        const fetchLiveStats = async () => {
            try {
                const response = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${ytChannelIdStats}&key=${apiKeyStats}`);
                const data = await response.json();

                if (data && data.items && data.items.length > 0) {
                    const stats = data.items[0].statistics;

                    // Update the data-target attributes with real live data
                    counters[0].setAttribute('data-target', stats.subscriberCount || 0);
                    counters[1].setAttribute('data-target', stats.viewCount || 0);
                    counters[2].setAttribute('data-target', stats.videoCount || 0);
                }
            } catch (error) {
                console.error('Error fetching live YouTube stats:', error);
            }
        };

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

    // 12. Background Mouse Aura tracking
    const mouseAura = document.getElementById('mouse-aura');
    if (mouseAura) {
        document.addEventListener('mousemove', (e) => {
            // Add a slight delay/smoothness to the aura compared to the sharp custom cursor
            setTimeout(() => {
                mouseAura.style.left = e.clientX + 'px';
                mouseAura.style.top = e.clientY + 'px';
            }, 50);
        });

        // Add touch support for mobile aura
        document.addEventListener('touchmove', (e) => {
            setTimeout(() => {
                mouseAura.style.left = e.touches[0].clientX + 'px';
                mouseAura.style.top = e.touches[0].clientY + 'px';
            }, 50);
        }, { passive: true });
    }

    // 13. Mobile Gyroscope 3D Parallax Effect
    // This taps into the physical phone hardware to tilt cards when the phone is tilted

    // Function to attach gyroscope listener
    const enableGyroParallax = () => {
        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', (event) => {
                const gamma = event.gamma;
                const beta = event.beta;

                if (gamma !== null && beta !== null) {
                    const clampedGamma = Math.min(Math.max(gamma, -25), 25);
                    const relativeBeta = beta - 45;
                    const clampedBeta = Math.min(Math.max(relativeBeta, -25), 25);

                    const tiltX = -(clampedBeta / 25) * 10;
                    const tiltY = (clampedGamma / 25) * 10;
                    const moveX = (clampedGamma / 25) * -15;
                    const moveY = (clampedBeta / 25) * -15;

                    requestAnimationFrame(() => {
                        // 1. Tilt Foreground Cards
                        const cards = document.querySelectorAll('.glass-card');
                        cards.forEach(card => {
                            card.style.transform = `perspective(1000px) translate3d(${moveX}px, ${moveY}px, 0) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
                            card.style.transition = 'transform 0.1s ease-out';
                        });

                        // 2. Parallax Background Aura (moves opposite and larger distance)
                        const aura = document.getElementById('mouse-aura');
                        if (aura) {
                            // Multiply the move distance to simulate it being further away in the background
                            aura.style.transform = `translate(-50%, -50%) translate3d(${moveX * -3}px, ${moveY * -3}px, 0)`;
                        }
                    });
                }
            });
        }
    };

    // iOS 13+ requires explicit permission for DeviceOrientation, which must be triggered by a user gesture.
    // We attach it to the first interaction (like clicking anywhere on the document)
    let gyroEnabled = false;
    document.body.addEventListener('click', () => {
        if (!gyroEnabled && typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        enableGyroParallax();
                        gyroEnabled = true;
                    }
                })
                .catch(console.error);
        } else if (!gyroEnabled) {
            // Non-iOS 13+ devices (Android, older iOS) don't need permission, enable immediately
            enableGyroParallax();
            gyroEnabled = true;
        }
    }, { once: true }); // We only need to request this on the very first tap

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

    // 14. Dynamic Tab Title ("Come Back!")
    let originalTitle = document.title;
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
            document.title = "👋 Come back soon!";
        } else {
            document.title = originalTitle;
        }
    });

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
});
