/**
 * Celebration Modal Controller
 * Atoms-style full-screen celebration after habit completion
 */

class CelebrationModal {
    constructor() {
        this.modal = null;
        this.isShowing = false;
        this.userEnabled = localStorage.getItem('celebrations_enabled') !== 'false';
    }

    async show(habitData) {
        if (!this.userEnabled || this.isShowing) return;
        this.isShowing = true;

        // Trigger haptic feedback
        if (window.haptics) {
            window.haptics.modalAppear();
        }

        // Create modal DOM
        this.modal = this.createModal(habitData);
        document.body.appendChild(this.modal);

        // Trigger animations
        requestAnimationFrame(() => {
            this.animateModal(habitData);
        });

        // Auto-dismiss after 3 seconds
        setTimeout(() => this.close(), 3000);
    }

    createModal(habitData) {
        const modal = document.createElement('div');
        modal.className = 'celebration-modal';

        const milestone = this.getMilestone(habitData.streak);
        const isMilestone = milestone !== null;

        modal.innerHTML = `
            <div class="celebration-overlay"></div>
            <div class="celebration-content">
                <h2 class="celebration-title">Habit completed!</h2>

                <div class="celebration-ring-container">
                    <svg viewBox="0 0 200 200" class="celebration-ring-svg">
                        <defs>
                            <linearGradient id="celebration-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style="stop-color: ${this.extractGradientStart(habitData.gradient)}"/>
                                <stop offset="100%" style="stop-color: ${this.extractGradientEnd(habitData.gradient)}"/>
                            </linearGradient>
                        </defs>
                        <circle
                            cx="100"
                            cy="100"
                            r="80"
                            fill="none"
                            stroke="rgba(255,255,255,0.1)"
                            stroke-width="12"
                        />
                        <circle
                            class="celebration-ring-progress"
                            cx="100"
                            cy="100"
                            r="80"
                            fill="none"
                            stroke="url(#celebration-gradient)"
                            stroke-width="12"
                            stroke-linecap="round"
                            transform="rotate(-90 100 100)"
                        />
                    </svg>
                    <div class="celebration-center">
                        <div class="celebration-icon" style="background: ${habitData.gradient};">
                            <div class="celebration-emoji">${habitData.icon}</div>
                            <div class="celebration-number">${habitData.reps}</div>
                        </div>
                    </div>
                </div>

                ${isMilestone ? `
                <div class="celebration-milestone">
                    <h3>${milestone.title}</h3>
                    <p>Congrats! You have earned <strong>${milestone.badge}</strong></p>
                </div>
                ` : ''}

                <div class="celebration-actions">
                    <button class="celebration-btn-secondary" onclick="window.celebrationModal.close()">
                        Back to Home
                    </button>
                </div>
            </div>
        `;

        return modal;
    }

    animateModal(habitData) {
        // Modal fade in happens via CSS animation
        const ring = this.modal.querySelector('.celebration-ring-progress');
        const icon = this.modal.querySelector('.celebration-icon');
        const milestone = this.modal.querySelector('.celebration-milestone');

        // Calculate circumference for stroke-dasharray
        const radius = 80;
        const circumference = 2 * Math.PI * radius;

        ring.style.strokeDasharray = circumference;
        ring.style.strokeDashoffset = circumference;

        // Animate ring fill
        setTimeout(() => {
            ring.style.transition = 'stroke-dashoffset 600ms cubic-bezier(0.4, 0, 0.2, 1)';
            ring.style.strokeDashoffset = '0';
        }, 100);

        // Scale in center icon
        setTimeout(() => {
            icon.style.animation = 'celebrationIconPop 400ms cubic-bezier(0.4, 0, 0.2, 1) forwards';
        }, 200);

        // Slide up milestone message
        if (milestone) {
            setTimeout(() => {
                milestone.style.animation = 'celebrationSlideUp 400ms cubic-bezier(0.4, 0, 0.2, 1) forwards';

                // Trigger milestone haptic
                const milestoneData = this.getMilestone(habitData.streak);
                if (milestoneData && window.haptics) {
                    window.haptics.milestone();
                }
            }, 400);
        }
    }

    close() {
        if (!this.modal) return;

        this.modal.classList.add('closing');
        setTimeout(() => {
            if (this.modal && this.modal.parentNode) {
                this.modal.remove();
            }
            this.modal = null;
            this.isShowing = false;
        }, 200);
    }

    setEnabled(enabled) {
        this.userEnabled = enabled;
        localStorage.setItem('celebrations_enabled', enabled);
    }

    isEnabled() {
        return this.userEnabled;
    }

    getMilestone(streak) {
        const milestones = {
            1: { title: '1st Step to Greatness!', badge: '1 Rep Milestone' },
            7: { title: '7-Day Warrior!', badge: 'Week Streak' },
            14: { title: '2-Week Champion!', badge: 'Fortnight Streak' },
            30: { title: 'Monthly Master!', badge: '30-Day Streak' },
            60: { title: '60-Day Legend!', badge: '2-Month Streak' },
            100: { title: 'Century Achiever!', badge: '100-Day Streak' }
        };

        return milestones[streak] || null;
    }

    extractGradientStart(gradient) {
        // Extract first color from gradient string
        const match = gradient.match(/#[A-Fa-f0-9]{6}/);
        return match ? match[0] : '#FFD166';
    }

    extractGradientEnd(gradient) {
        // Extract last color from gradient string
        const matches = gradient.match(/#[A-Fa-f0-9]{6}/g);
        return matches && matches.length > 1 ? matches[1] : '#FF9B42';
    }
}

// Export as singleton
window.celebrationModal = new CelebrationModal();
