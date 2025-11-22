/**
 * Haptic Feedback Controller
 * Atoms-style vibration patterns for habit completion
 */

class HapticController {
    constructor() {
        this.enabled = 'vibrate' in navigator;
        this.lastVibration = 0;
        this.userEnabled = localStorage.getItem('haptics_enabled') !== 'false';
    }

    canVibrate() {
        const now = Date.now();
        if (!this.enabled || !this.userEnabled) return false;
        // Prevent rapid-fire vibrations (100ms cooldown)
        if (now - this.lastVibration < 100) return false;
        this.lastVibration = now;
        return true;
    }

    tapComplete() {
        if (this.canVibrate()) {
            navigator.vibrate(25);
        }
    }

    modalAppear() {
        if (this.canVibrate()) {
            navigator.vibrate(10);
        }
    }

    milestone() {
        if (this.canVibrate()) {
            navigator.vibrate([30, 50, 40]);
        }
    }

    allComplete() {
        if (this.canVibrate()) {
            navigator.vibrate([20, 30, 20, 30, 30]);
        }
    }

    undo() {
        if (this.canVibrate()) {
            navigator.vibrate(15);
        }
    }

    setEnabled(enabled) {
        this.userEnabled = enabled;
        localStorage.setItem('haptics_enabled', enabled);
    }

    isEnabled() {
        return this.enabled && this.userEnabled;
    }
}

// Export as singleton
window.haptics = new HapticController();
