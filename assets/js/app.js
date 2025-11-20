import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Auth State Listener
// We use a timeout to ensure window.auth is initialized from firebase-config.js
setTimeout(() => {
    if (window.auth) {
        onAuthStateChanged(window.auth, (user) => {
            if (user) {
                window.currentUser = user;
                console.log('Signed in with user ID:', user.uid);
                const authOverlay = document.getElementById('authOverlay');
                const appContainer = document.getElementById('appContainer');
                if (authOverlay) authOverlay.classList.remove('show');
                if (appContainer) appContainer.classList.add('show');

                if (window.loadAllData) window.loadAllData();
            } else {
                window.currentUser = null;
                console.log('User is signed out');
                const authOverlay = document.getElementById('authOverlay');
                const appContainer = document.getElementById('appContainer');
                if (authOverlay) authOverlay.classList.add('show');
                if (appContainer) appContainer.classList.remove('show');

                if (window.clearLocalData) window.clearLocalData();
            }
        });
    } else {
        console.error("window.auth not initialized!");
    }
}, 100);

window.handleLoginClick = function () {
    // This function is now shared for Login and Sign Up
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const button = document.getElementById('authButton');
    const errorEl = document.getElementById('authError');

    if (!email || password.length < 6) {
        errorEl.textContent = 'Please enter a valid email and a password (min. 6 chars).';
        errorEl.style.display = 'block';
        return;
    }

    errorEl.style.display = 'none';
    button.disabled = true;

    if (window.isLoginMode) {
        // --- Sign In ---
        button.textContent = 'Signing In...';
        window.fb.signInWithEmailAndPassword(window.auth, email, password)
            .then((userCredential) => {
                // Signed in, onAuthStateChanged will handle the rest
                console.log('User signed in:', userCredential.user.uid);
            })
            .catch((error) => {
                errorEl.textContent = error.message;
                errorEl.style.display = 'block';
            })
            .finally(() => {
                button.disabled = false;
                button.textContent = 'Sign In';
            });
    } else {
        // --- Sign Up ---
        button.textContent = 'Creating Account...';
        window.fb.createUserWithEmailAndPassword(window.auth, email, password)
            .then((userCredential) => {
                // Signed up, onAuthStateChanged will handle the rest
                console.log('User created:', userCredential.user.uid);
            })
            .catch((error) => {
                errorEl.textContent = error.message;
                errorEl.style.display = 'block';
            })
            .finally(() => {
                button.disabled = false;
                button.textContent = 'Sign Up';
            });
    }
}

window.handleSignOut = function () {
    window.fb.signOut(window.auth).catch((error) => {
        console.error('Sign out error:', error);
    });
}

window.isLoginMode = true;
window.toggleAuthMode = function () {
    window.isLoginMode = !window.isLoginMode;
    const button = document.getElementById('authButton');
    const toggle = document.getElementById('authToggle');
    const subtitle = document.getElementById('authSubtitle');

    if (window.isLoginMode) {
        button.textContent = 'Sign In';
        toggle.textContent = 'Need an account? Sign Up';
        subtitle.textContent = 'Sign in to sync your habits';
    } else {
        button.textContent = 'Sign Up';
        toggle.textContent = 'Have an account? Sign In';
        subtitle.textContent = 'Create an account to get started';
    }
    document.getElementById('authError').style.display = 'none';
}
// === GLOBAL APP STATE ===
let habitData = {}; // { "2025-11-06": { "habitId1": true } }
let habits = [];    // [ { id: "...", name: "...", icon: "..." } ]
let currentViewDate = new Date();

const habitSuggestions = [
    { name: "Read 10 pages", icon: "📚", why: "become more knowledgeable" },
    { name: "Go for a walk", icon: "🚶", why: "improve my health" },
    { name: "Drink 8 glasses of water", icon: "💧", why: "stay hydrated" },
    { name: "Meditate for 5 minutes", icon: "🧘", why: "clear my mind" },
    { name: "Write in a journal", icon: "✍️", why: "practice gratitude" },
    { name: "No social media before 9 AM", icon: "📱", why: "start the day focused" },
    { name: "Practice a new skill", icon: "💡", why: "grow my abilities" },
];

// REFINEMENT: Principle #8 - Motivational Quotes
// REFINEMENT: Principle #8 - Motivational Quotes
let motivationalQuotes = []; // Will be loaded from JSON
let quoteSource = "James Clear"; // Default source
let todayQuote = "Loading motivation...";

async function loadQuotes() {
    try {
        const response = await fetch('assets/data/quotes.json');
        if (!response.ok) throw new Error('Failed to load quotes');

        const data = await response.json();

        // Handle new format with categories
        if (data.categories) {
            quoteSource = data.source || "James Clear";
            motivationalQuotes = [];

            // Flatten all categories into one array
            Object.values(data.categories).forEach(category => {
                if (Array.isArray(category.quotes)) {
                    motivationalQuotes.push(...category.quotes);
                }
            });
        } else if (Array.isArray(data)) {
            // Handle legacy array format
            motivationalQuotes = data;
        }

        window.displayQuote(); // Refresh quote after loading
    } catch (error) {
        console.error('Error loading quotes:', error);
        // Fallback quotes if fetch fails
        motivationalQuotes = [
            "The secret of getting ahead is getting started.",
            "Motivation is what gets you started. Habit is what keeps you going."
        ];
        window.displayQuote();
    }
}

// Load quotes on startup
loadQuotes();

// Colors from your principles
const habitColors = [
    '#EA4335', '#FBBC04', '#34A853', '#1A73E8', '#673AB7',
    '#E91E63', '#009688', '#FF9800', '#607D8B', '#795548'
];

// PHASE 2: Gradient palette for icon badges
const habitGradients = [
    'linear-gradient(135deg, #FFD166 0%, #FF9B42 100%)', // Warm yellow-orange
    'linear-gradient(135deg, #FF6B6B 0%, #FF4757 100%)', // Coral-red
    'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)', // Soft purple
    'linear-gradient(135deg, #4ECDC4 0%, #06B6D4 100%)', // Cyan-turquoise
    'linear-gradient(135deg, #6EE7B7 0%, #10B981 100%)', // Fresh green
    'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', // Amber
    'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)', // Pink
    'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)', // Deep purple
];

// === UTILITY FUNCTIONS ===

function getUserId() {
    if (window.currentUser) {
        return window.currentUser.uid;
    }
    return null;
}

function getDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function showSnackbar(message, isError = false) {
    const snackbar = document.getElementById('snackbar');
    const icon = document.getElementById('snackbarIcon');

    document.getElementById('snackbarText').textContent = message;

    if (isError) {
        icon.textContent = 'error';
        icon.style.color = 'var(--color-error)';
    } else {
        icon.textContent = 'check_circle';
        icon.style.color = 'var(--color-success)';
    }

    snackbar.classList.add('show');
    setTimeout(() => {
        snackbar.classList.remove('show');
    }, 3000);
}

function updateSyncStatus(status) {
    const syncStatus = document.getElementById('syncStatus');
    if (!syncStatus) return;
    const icon = syncStatus.querySelector('.material-symbols-outlined');

    if (status === 'syncing') {
        syncStatus.classList.add('syncing');
        icon.textContent = 'sync';
        syncStatus.title = 'Syncing...';
    } else if (status === 'synced') {
        syncStatus.classList.remove('syncing');
        icon.textContent = 'cloud_done';
        syncStatus.title = 'Synced';
    } else if (status === 'error') {
        syncStatus.classList.remove('syncing');
        icon.textContent = 'cloud_off';
        syncStatus.title = 'Sync Error';
    }
}

function clearAllData() {
    habits = [];
    habitData = {};
    currentViewDate = new Date();
    window.renderHabits();
    window.updateDisplay();
}

window.clearLocalData = function () {
    // Called on sign-out
    habits = [];
    habitData = {};
    localStorage.removeItem('habitTrackerHabits');
    localStorage.removeItem('habitTrackerData');
    window.renderHabits();
    window.updateDisplay();
}

function isWeekday(date) {
    const day = date.getDay();
    return day >= 1 && day <= 5; // Monday=1, Friday=5
}

// === ATOMS-INSPIRED UI COMPONENTS ===

// Render horizontal date strip (7-day week view)
window.renderDateStrip = function () {
    const dateStrip = document.getElementById('dateStrip');
    const weekRangeEl = document.getElementById('weekRange');
    const nextWeekBtn = document.getElementById('nextWeekBtn');

    if (!dateStrip) return;

    dateStrip.innerHTML = '';
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day
    const todayStr = getDateString(today);
    const currentStr = getDateString(currentViewDate);

    // Get the week containing currentViewDate
    const startOfWeek = new Date(currentViewDate);
    startOfWeek.setDate(currentViewDate.getDate() - currentViewDate.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday

    // Update Week Range Text (e.g., "Nov 9-15")
    if (weekRangeEl) {
        const startMonth = startOfWeek.toLocaleDateString('en-US', { month: 'short' });
        const endMonth = endOfWeek.toLocaleDateString('en-US', { month: 'short' });
        const startDay = startOfWeek.getDate();
        const endDay = endOfWeek.getDate();

        if (startMonth === endMonth) {
            weekRangeEl.textContent = `${startMonth} ${startDay}–${endDay}`;
        } else {
            weekRangeEl.textContent = `${startMonth} ${startDay} – ${endMonth} ${endDay}`;
        }
    }

    // Disable Next Week button if we are in the current week or future
    if (nextWeekBtn) {
        // If end of week is today or in future, disable next week
        nextWeekBtn.disabled = endOfWeek >= today;
    }

    for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        date.setHours(0, 0, 0, 0); // Normalize to start of day
        const dateStr = getDateString(date);

        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayName = dayNames[date.getDay()];
        const dayNumber = date.getDate();

        const isToday = dateStr === todayStr;
        const isSelected = dateStr === currentStr;
        const isFuture = date > today; // Check if date is in the future

        const dateItem = document.createElement('div');
        dateItem.className = 'date-item';

        // Only allow clicking on past dates and today
        if (!isFuture) {
            dateItem.onclick = () => {
                currentViewDate = new Date(date);
                window.renderDateStrip();
                window.updateDisplay();
            };
        } else {
            dateItem.classList.add('disabled');
            dateItem.style.cursor = 'not-allowed';
            dateItem.style.opacity = '0.4';
        }

        let numberClass = 'date-number';
        if (isSelected && !isFuture) numberClass += ' selected';
        if (isToday) numberClass += ' today';
        if (isFuture) numberClass += ' future';

        dateItem.innerHTML = `
            <div class="date-day">${dayName}</div>
            <div class="${numberClass}">${dayNumber}</div>
        `;

        dateStrip.appendChild(dateItem);
    }
}

// Navigate weeks
window.changeWeek = function (offset) {
    const newDate = new Date(currentViewDate);
    newDate.setDate(currentViewDate.getDate() + (offset * 7));

    // Don't allow going to future weeks if it results in a date beyond today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // If going forward, check if we exceed today
    if (offset > 0) {
        // If current date is already today, don't move
        if (currentViewDate >= today) return;

        // If new date is in future, cap at today
        if (newDate > today) {
            currentViewDate = new Date(today);
        } else {
            currentViewDate = newDate;
        }
    } else {
        currentViewDate = newDate;
    }

    window.renderDateStrip();
    window.updateDisplay();
}

// Go to today
window.goToToday = function () {
    currentViewDate = new Date();
    window.renderDateStrip();
    window.updateDisplay();
}

// Render concentric rings (limit to 5 habits)
window.renderConcentricRings = function () {
    const svg = document.getElementById('concentricRings');
    const centerText = document.getElementById('ringsCenterText');
    if (!svg || !centerText) return;

    // Clear existing rings
    svg.innerHTML = '';

    // Get top 5 habits by streak or creation order
    const topHabits = habits.slice(0, 5);
    const dateStr = getDateString(currentViewDate);
    const dayData = habitData[dateStr] || {};

    let completedCount = 0;
    let totalCount = 0;

    topHabits.forEach((habit, index) => {
        const isApplicable = !(habit.schedule === 'weekdays' && !isWeekday(currentViewDate));
        if (!isApplicable) return;

        totalCount++;
        const isCompleted = dayData[habit.id] || false;
        if (isCompleted) completedCount++;

        // Calculate ring parameters
        const radius = 90 - (index * 15); // Decreasing radius for each ring
        const circumference = 2 * Math.PI * radius;
        const progress = isCompleted ? 1 : 0;
        const dashOffset = circumference * (1 - progress);

        // Create gradient for this ring
        const gradientId = `gradient-${habit.id}`;
        const defs = svg.querySelector('defs') || document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        if (!svg.querySelector('defs')) svg.appendChild(defs);

        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        gradient.setAttribute('id', gradientId);
        gradient.setAttribute('x1', '0%');
        gradient.setAttribute('y1', '0%');
        gradient.setAttribute('x2', '100%');
        gradient.setAttribute('y2', '100%');

        const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop1.setAttribute('offset', '0%');
        stop1.setAttribute('stop-color', habit.color || '#1A73E8');

        const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop2.setAttribute('offset', '100%');
        stop2.setAttribute('stop-color', habit.color || '#1A73E8');
        stop2.setAttribute('stop-opacity', '0.7');

        gradient.appendChild(stop1);
        gradient.appendChild(stop2);
        defs.appendChild(gradient);

        // Create ring path
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('class', 'ring-path');
        circle.setAttribute('cx', '100');
        circle.setAttribute('cy', '100');
        circle.setAttribute('r', radius);
        circle.setAttribute('stroke', `url(#${gradientId})`);
        circle.setAttribute('stroke-dasharray', circumference);
        circle.setAttribute('stroke-dashoffset', dashOffset);
        circle.setAttribute('transform', 'rotate(-90 100 100)');

        svg.appendChild(circle);
    });

    // Update center text
    centerText.textContent = `${completedCount}/${totalCount}`;
}

// Display motivational quote
window.displayQuote = function () {
    const quoteText = document.getElementById('quoteText');
    const quoteAuthor = document.getElementById('quoteAuthor');
    if (!quoteText || !quoteAuthor) return;

    if (motivationalQuotes.length === 0) {
        quoteText.textContent = "Loading motivation...";
        return;
    }

    // Use today's date as seed for consistent daily quote
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
    const quoteIndex = dayOfYear % motivationalQuotes.length;
    const quote = motivationalQuotes[quoteIndex];

    // Handle both string (new format) and object (legacy) formats
    if (typeof quote === 'string') {
        quoteText.textContent = `"${quote}"`;
        quoteAuthor.textContent = `— ${quoteSource}`;
    } else {
        quoteText.textContent = `"${quote.text}"`;
        quoteAuthor.textContent = `— ${quote.author}`;
    }

    // Update global todayQuote for microcopy use
    todayQuote = typeof quote === 'string' ? quote : quote.text;
}

// === DATA LOADING & SAVING ===

window.loadAllData = async function () {
    // This is the main entry point after login
    const userId = getUserId();
    if (!userId) return;

    try {
        // 1. Load habits config
        await window.loadHabits();

        // 2. Load habit data (check-ins)
        await window.loadHabitData();

        // 3. Setup realtime listeners
        window.setupRealtimeSync();

        // 4. Update UI
        window.renderHabits();
        window.updateDisplay();

    } catch (error) {
        console.error("Error loading all data:", error);
        showSnackbar("Error loading data. Please refresh.", true);
    }
}

window.loadHabits = async function () {
    // Load the list of habits (name, icon, etc.)
    const userId = getUserId();
    if (!userId) return;

    // Try local cache first
    const localHabits = localStorage.getItem('habitTrackerHabits');
    if (localHabits) {
        habits = JSON.parse(localHabits);
        window.renderHabits(); // Render quickly from cache
    }

    if (window.firebaseEnabled) {
        try {
            console.log('Loading habits from Firebase...');
            // Path: /users/{userId}/userHabits/{habitDocId}
            const q = window.fb.query(window.fb.collection(window.db, 'users', userId, 'userHabits'));
            const querySnapshot = await window.fb.getDocs(q);

            if (querySnapshot.empty && habits.length === 0) {
                // User has no habits and no local habits.
                console.log('No habits found. User is new.');
                habits = [];
            } else if (!querySnapshot.empty) {
                let newHabits = [];
                querySnapshot.forEach((doc) => {
                    newHabits.push({ id: doc.id, ...doc.data() });
                });
                habits = newHabits;
                console.log('Habits loaded from Firebase:', habits);
            }

            // Save to local storage and render
            window.saveHabitsLocal();
            window.renderHabits();

        } catch (error) {
            console.error("Error loading habits from Firebase:", error);
            showSnackbar("Error loading your habits.", true);
        }
    }
}

window.loadHabitData = async function () {
    // Load the check-in data (dates)
    const userId = getUserId();
    if (!userId) return;

    // Try local cache first
    const localData = localStorage.getItem('habitTrackerData');
    if (localData) {
        habitData = JSON.parse(localData);
        window.updateDisplay(); // Render quickly
    }

    if (window.firebaseEnabled) {
        try {
            console.log('Loading habit data from Firebase...');
            // Path: /users/{userId}/habitData/{dateString}
            const q = window.fb.query(window.fb.collection(window.db, 'users', userId, 'habitData'));
            const querySnapshot = await window.fb.getDocs(q);

            if (!querySnapshot.empty) {
                querySnapshot.forEach((doc) => {
                    habitData[doc.id] = doc.data();
                });
                console.log('Habit data loaded from Firebase');
            }

            window.saveHabitDataLocal();
            window.updateDisplay();

        } catch (error) {
            console.error("Error loading from Firebase:", error);
        }
    }
}

window.saveHabitsLocal = function () {
    // Sort by creation time before saving
    habits.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
    localStorage.setItem('habitTrackerHabits', JSON.stringify(habits));
}

window.saveHabitDataLocal = function () {
    localStorage.setItem('habitTrackerData', JSON.stringify(habitData));
}

// === REALTIME SYNC ===

window.setupRealtimeSync = function () {
    const userId = getUserId();
    if (!window.firebaseEnabled || !userId) {
        return;
    }

    // 1. Listen for changes to the list of habits
    try {
        const habitsRef = window.fb.collection(window.db, 'users', userId, 'userHabits');
        window.fb.onSnapshot(habitsRef, (snapshot) => {
            let newHabits = [];
            snapshot.forEach(doc => {
                newHabits.push({ id: doc.id, ...doc.data() });
            });
            // Sort by creation time
            newHabits.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
            habits = newHabits;

            window.saveHabitsLocal();
            window.renderHabits();
            window.updateDisplay();
            console.log('Realtime: Habits list synced.');
        });
    } catch (error) {
        console.error("Error setting up habits listener:", error);
    }

    // 2. Listen for changes to the check-in data
    try {
        const dataRef = window.fb.collection(window.db, 'users', userId, 'habitData');
        window.fb.onSnapshot(dataRef, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added' || change.type === 'modified') {
                    const dateStr = change.doc.id;
                    const data = change.doc.data();
                    habitData[dateStr] = data;
                    console.log(`Realtime: Synced data for ${dateStr}`);
                }
                // Note: Deletions not handled, as we don't delete date docs
            });
            window.saveHabitDataLocal();
            window.updateDisplay();
        });
    } catch (error) {
        console.error("Error setting up habit data listener:", error);
    }
}

// === HABIT CRUD FUNCTIONS ===

window.openHabitModal = function (habitId = null) {
    const modal = document.getElementById('habitModal');
    const title = document.getElementById('habitModalTitle');
    const form = document.getElementById('habitForm');

    // Reset form
    form.reset();
    document.getElementById('habitIdInput').value = '';

    // Clear existing 'selected' swatches
    document.querySelectorAll('.color-swatch.selected').forEach(sw => sw.classList.remove('selected'));

    if (habitId) {
        // --- Edit Mode ---
        const habit = habits.find(h => h.id === habitId);
        if (habit) {
            title.textContent = 'Edit Habit';
            document.getElementById('habitIdInput').value = habit.id;
            document.getElementById('habitName').value = habit.name;
            document.getElementById('habitIcon').value = habit.icon;
            document.getElementById('habitSchedule').value = habit.schedule;
            document.getElementById('habitWhy').value = habit.why || '';

            // Select color
            const swatch = document.querySelector(`.color-swatch[data-color="${habit.color}"]`);
            if (swatch) {
                swatch.classList.add('selected');
            }
        }
    } else {
        // --- Add Mode ---
        title.textContent = 'Add New Habit';

        // Set placeholders as suggestions
        const suggestion = habitSuggestions[Math.floor(Math.random() * habitSuggestions.length)];
        document.getElementById('habitName').placeholder = suggestion.name;
        document.getElementById('habitIcon').placeholder = suggestion.icon;
        document.getElementById('habitWhy').placeholder = suggestion.why || 'learn a new skill';

        // Select first color by default
        document.querySelector('.color-swatch').classList.add('selected');
    }

    modal.classList.add('show');
}

window.closeHabitModal = function () {
    document.getElementById('habitModal').classList.remove('show');
}

window.saveHabit = async function () {
    const userId = getUserId();
    if (!userId) return;

    const id = document.getElementById('habitIdInput').value;
    const name = document.getElementById('habitName').value;
    const icon = document.getElementById('habitIcon').value;
    const schedule = document.getElementById('habitSchedule').value;
    const why = document.getElementById('habitWhy').value; // Get the "why"
    const selectedColor = document.querySelector('.color-swatch.selected');

    if (!name || !icon || !selectedColor) {
        showSnackbar("Please fill out all fields.", true);
        return;
    }

    const color = selectedColor.dataset.color;

    const habitData = {
        name,
        icon,
        schedule,
        color,
        why: why || '', // Save the "why"
        createdAt: window.fb.serverTimestamp() // Add/update server timestamp
    };

    if (id) {
        // --- Update existing habit ---
        try {
            const habitRef = window.fb.doc(window.db, 'users', userId, 'userHabits', id);
            await window.fb.setDoc(habitRef, habitData, { merge: true }); // Use setDoc with merge
            showSnackbar("Habit updated!");
        } catch (error) {
            console.error("Error updating habit:", error);
            showSnackbar("Error updating habit.", true);
        }
    } else {
        // --- Add new habit ---
        try {
            const habitRef = window.fb.collection(window.db, 'users', userId, 'userHabits');
            await window.fb.addDoc(habitRef, habitData);
            showSnackbar("Habit added!");
        } catch (error) {
            console.error("Error adding habit:", error);
            showSnackbar("Error adding habit.", true);
        }
    }

    closeHabitModal();
    // Realtime listener will handle the UI update
}

window.deleteHabit = async function (habitId, habitName) {
    const userId = getUserId();
    if (!userId) return;

    if (!confirm(`Are you sure you want to delete "${habitName}"?\n\nThis will NOT delete your past check-in history for this habit.`)) {
        return;
    }

    try {
        const habitRef = window.fb.doc(window.db, 'users', userId, 'userHabits', habitId);
        await window.fb.deleteDoc(habitRef);
        showSnackbar("Habit deleted!");
    } catch (error) {
        console.error("Error deleting habit:", error);
        showSnackbar("Error deleting habit.", true);
    }
    // Realtime listener will handle UI update
}

// === MAIN APP LOGIC ===

window.renderHabits = function () {
    const list = document.getElementById('habitsList');
    if (!list) return;

    // Clear list but preserve empty state
    const emptyState = document.getElementById('emptyState');
    list.innerHTML = '';
    list.appendChild(emptyState);

    if (habits.length === 0) {
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    habits.forEach((habit, index) => {
        const scheduleText = habit.schedule === 'weekdays' ? 'Weekdays' : 'Daily';

        // Calculate current streak for this habit
        const currentStreak = calculateStreak(habit.id);

        // Get gradient for this habit (cycle through gradients if more habits than gradients)
        const gradientIndex = index % habitGradients.length;
        const gradient = habitGradients[gradientIndex];

        const card = document.createElement('div');
        card.className = 'habit-card';
        card.style = `--habit-color: ${habit.color}; --habit-gradient: ${gradient};`;
        card.id = `card-${habit.id}`; // Add ID for flash animation

        // PHASE 2.2: Full card tap instead of clicking card for heatmap
        // Click menu button for dropdown, otherwise toggle completion
        card.onclick = (e) => {
            // Don't toggle if clicking menu button
            if (e.target.closest('.habit-menu')) {
                return;
            }
            // PHASE 2.2: Toggle habit completion with full card tap
            handleHabitTap(habit.id);
        };

        let whyHtml = habit.why ? `<div class="habit-why">...so I can ${habit.why}</div>` : '';

        card.innerHTML = `
            <div class="habit-icon-badge" style="background: ${gradient};">
                <div class="habit-icon-emoji">${habit.icon}</div>
                <div class="habit-streak-number">${currentStreak}</div>
            </div>
            <div class="habit-content">
                <div class="habit-name">${habit.name}</div>
                <div class="habit-schedule">${scheduleText}</div>
                ${whyHtml}
            </div>
            <div class="habit-menu dropdown">
                <button class="icon-button state-layer-secondary" onclick="toggleDropdown(event, '${habit.id}'); event.stopPropagation();">
                    <span class="material-symbols-outlined">more_vert</span>
                </button>
                <div class="dropdown-content" id="dropdown-${habit.id}">
                    <button class="dropdown-item state-layer-secondary" onclick="openHeatmapModal(event, '${habit.id}', '${habit.name}', '${habit.color}'); event.stopPropagation();">
                        <span class="material-symbols-outlined">insights</span>
                        View Details
                    </button>
                    <button class="dropdown-item state-layer-secondary" onclick="openHabitModal('${habit.id}'); event.stopPropagation();">
                        <span class="material-symbols-outlined">edit</span>
                        Edit
                    </button>
                    <button class="dropdown-item delete state-layer-secondary" onclick="deleteHabit('${habit.id}', '${habit.name.replace(/'/g, "\\'")}'); event.stopPropagation();">
                        <span class="material-symbols-outlined">delete</span>
                        Delete
                    </button>
                </div>
            </div>
            <!-- Hidden checkbox for state tracking -->
            <input type="checkbox" class="habit-checkbox" id="habit-${habit.id}" data-habit-id="${habit.id}" style="display: none;">
            <!-- REFINEMENT: Principle 3 - Progress Bar -->
            <div class="habit-progress-bar-container">
                <div class="habit-progress-bar" id="progress-${habit.id}" style="background-color: ${habit.color};"></div>
            </div>
        `;

        list.appendChild(card);
    });

    // After rendering, update progress bars
    updateAllProgressBars();
}

window.toggleDropdown = function (event, habitId) {
    event.stopPropagation(); // Prevent card click

    // Close all other dropdowns
    document.querySelectorAll('.dropdown-content.show').forEach(openDropdown => {
        if (openDropdown.id !== `dropdown-${habitId}`) {
            openDropdown.classList.remove('show');
        }
    });

    // Toggle the clicked one
    const dropdown = document.getElementById(`dropdown-${habitId}`);
    dropdown.classList.toggle('show');
}

// Close dropdowns if clicking outside
window.addEventListener('click', function (event) {
    if (!event.target.closest('.dropdown')) {
        document.querySelectorAll('.dropdown-content.show').forEach(openDropdown => {
            openDropdown.classList.remove('show');
        });
    }
});


// PHASE 2.2: Handle full card tap interaction
window.handleHabitTap = async function (habitId) {
    const card = document.getElementById(`card-${habitId}`);
    const checkbox = document.getElementById(`habit-${habitId}`);
    const habit = habits.find(h => h.id === habitId);

    if (!habit || !card || !checkbox) return;

    const wasCompleted = checkbox.checked;
    const willBeCompleted = !wasCompleted;

    // Toggle the checkbox
    checkbox.checked = willBeCompleted;

    if (willBeCompleted) {
        // === COMPLETING A HABIT ===

        // 1. IMMEDIATE HAPTIC FEEDBACK (Atoms-style)
        if (window.haptics) {
            window.haptics.tapComplete();
        }

        // 2. CARD FILL ANIMATION
        const gradientIndex = habits.indexOf(habit) % habitGradients.length;
        const gradient = habitGradients[gradientIndex];
        card.style.setProperty('--fill-color', gradient);
        card.classList.add('filling');

        // Remove filling class after animation
        setTimeout(() => {
            card.classList.remove('filling');
        }, 400);

        // 3. Add completed class for checkmark
        card.classList.add('completed');

        // 4. Update habit data
        await updateHabitData(habitId);

        // 5. Calculate current streak for celebration
        const currentStreak = calculateStreak(habitId);
        const completionCount = getHabitCompletionCount(habitId);

        // 6. SHOW CELEBRATION MODAL (after card fill animation)
        setTimeout(() => {
            if (window.celebrationModal) {
                window.celebrationModal.show({
                    name: habit.name,
                    icon: habit.icon,
                    gradient: gradient,
                    streak: currentStreak,
                    reps: completionCount
                });
            }
        }, 300);

        // 7. Check for milestone haptic
        const milestones = [1, 7, 14, 30, 60, 100];
        if (milestones.includes(currentStreak) && window.haptics) {
            setTimeout(() => window.haptics.milestone(), 1000);
        }

        // 8. Check if all habits complete
        setTimeout(() => {
            if (checkAllHabitsComplete() && window.haptics) {
                window.haptics.allComplete();
            }
        }, 1400);

    } else {
        // === UNCOMPLETING A HABIT ===

        // 1. Undo haptic
        if (window.haptics) {
            window.haptics.undo();
        }

        // 2. Press animation
        card.style.transform = 'scale(0.98)';
        setTimeout(() => card.style.transform = 'scale(1)', 150);

        // 3. Remove completed class
        card.classList.remove('completed');

        // 4. Update habit data
        await updateHabitData(habitId);
    }
};

// Helper function to check if all habits are complete
function checkAllHabitsComplete() {
    const dateStr = getDateString(currentViewDate);
    const dayData = habitData[dateStr] || {};

    for (const habit of habits) {
        const isApplicable = !(habit.schedule === 'weekdays' && !isWeekday(currentViewDate));
        if (isApplicable && !dayData[habit.id]) {
            return false;
        }
    }

    return habits.length > 0;
}

// Helper function to get total completion count for a habit
function getHabitCompletionCount(habitId) {
    let count = 0;
    for (const dateStr in habitData) {
        if (habitData[dateStr][habitId]) {
            count++;
        }
    }
    return count;
}

window.updateHabitData = async function (habitId) {
    const dateStr = getDateString(currentViewDate);
    const checkbox = document.getElementById(`habit-${habitId}`);

    // Get current data for the day
    let dayData = habitData[dateStr] || {};

    // Update the specific habit
    dayData[habitId] = checkbox.checked;

    // Put it back into the main data object
    habitData[dateStr] = dayData;

    // Save locally
    window.saveHabitDataLocal();

    // --- REFINEMENTS: Principle 1 & 7 ---
    // 1. Pop the progress ring
    const ring = document.querySelector('.progress-ring-container');
    if (ring) {
        ring.classList.add('pop');
        ring.addEventListener('animationend', () => ring.classList.remove('pop'), { once: true });
    }

    // 2. Flash the habit card
    const card = document.getElementById(`card-${habitId}`);
    if (card && checkbox.checked) { // Only flash on completion
        card.classList.add('flash');
        card.addEventListener('animationend', () => card.classList.remove('flash'), { once: true });
    }
    // --- End Refinements ---

    // Save to Firebase
    const userId = getUserId();
    if (window.firebaseEnabled && userId) {
        try {
            updateSyncStatus('syncing');
            // Path: /users/{userId}/habitData/{dateString}
            const dateRef = window.fb.doc(window.db, 'users', userId, 'habitData', dateStr);
            await window.fb.setDoc(dateRef, dayData, { merge: true }); // Use setDoc with merge
            updateSyncStatus('synced');
        } catch (error) {
            console.error('Error saving to Firebase:', error);
            updateSyncStatus('error');
        }
    }

    window.updateDisplay();
    checkForCelebration();
}

window.checkForCelebration = function () {
    const dateStr = getDateString(currentViewDate);
    const today = getDateString(new Date());

    if (dateStr !== today) return;

    const dayData = habitData[dateStr] || {};
    let allComplete = habits.length > 0; // Assume complete, then check

    for (const habit of habits) {
        const isApplicable = !(habit.schedule === 'weekdays' && !isWeekday(currentViewDate));
        if (isApplicable && !dayData[habit.id]) {
            allComplete = false;
            break;
        }
    }

    if (allComplete) {
        showCelebration();
    }
}

function showCelebration() {
    const celebration = document.getElementById('celebration');
    celebration.classList.add('show');

    // REFINEMENT: Principle 7 - Run Confetti
    runCelebrationConfetti();

    setTimeout(() => {
        celebration.classList.remove('show');
    }, 3000);
}

// REFINEMENT: Principle 7 - Confetti Function
function runCelebrationConfetti() {
    const container = document.getElementById('confettiContainer');
    container.innerHTML = ''; // Clear old confetti
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = `${Math.random() * 100}vw`;
        confetti.style.backgroundColor = habitColors[Math.floor(Math.random() * habitColors.length)];
        confetti.style.animationDuration = `${2 + Math.random() * 2}s`;
        confetti.style.animationDelay = `${Math.random() * 0.5}s`;
        container.appendChild(confetti);
    }

    // Clear confetti elements after animation
    setTimeout(() => {
        container.innerHTML = '';
    }, 5000);
}

window.updateDisplay = function () {
    const dateStr = getDateString(currentViewDate);
    const today = getDateString(new Date());

    // === ATOMS-INSPIRED UI UPDATES ===
    // Render new components
    window.renderDateStrip();
    window.renderConcentricRings();
    window.displayQuote();

    // Update date display (for old components, if still present)
    const currentDateEl = document.getElementById('currentDate');
    if (currentDateEl) {
        const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
        currentDateEl.textContent = currentViewDate.toLocaleDateString('en-US', options);
    }

    // Disable next day button for future dates
    const nextDayBtn = document.getElementById('nextDayBtn');
    if (nextDayBtn) nextDayBtn.disabled = dateStr >= today;

    // Update checkboxes and habit cards
    const dayData = habitData[dateStr] || {};
    let todayComplete = 0;
    let totalHabitsToday = 0;

    habits.forEach(habit => {
        const checkbox = document.getElementById(`habit-${habit.id}`);
        if (!checkbox) return; // Habit may not be rendered yet

        const habitCard = checkbox.closest('.habit-card');
        const isApplicable = !(habit.schedule === 'weekdays' && !isWeekday(currentViewDate));

        if (isApplicable) {
            checkbox.disabled = false;
            checkbox.checked = dayData[habit.id] || false;
            habitCard.style.opacity = '1';
            totalHabitsToday++;

            if (checkbox.checked) {
                todayComplete++;
                habitCard.classList.add('completed');
            } else {
                habitCard.classList.remove('completed');
            }
        } else {
            // Not applicable (e.g., weekday habit on weekend)
            checkbox.disabled = true;
            checkbox.checked = false;
            habitCard.style.opacity = '0.5';
            habitCard.classList.remove('completed');
        }
    });

    // --- REFINEMENT: Principle #3 - Microcopy Feedback ---
    const subtextEl = document.getElementById('dateSubtext');
    if (subtextEl) {
        if (dateStr === today) {
            if (totalHabitsToday === 0) {
                subtextEl.textContent = "Add a habit to get started!";
            } else if (todayComplete === 0) {
                subtextEl.textContent = todayQuote; // Show quote
            } else if (todayComplete === 1 && totalHabitsToday > 1) {
                subtextEl.textContent = "You're off to a great start!";
            } else if (todayComplete > 1 && todayComplete < totalHabitsToday) {
                subtextEl.textContent = "Keep up the great work!";
            } else if (todayComplete === totalHabitsToday) {
                subtextEl.textContent = "All done! You crushed it today! 🎉";
            }
        } else if (dateStr < today) {
            subtextEl.textContent = 'Past day - Reviewing your progress';
        } else {
            subtextEl.textContent = 'Future day - Plan ahead!';
        }
    }
    // --- End Refinement ---

    // Update progress ring (old component)
    updateProgressRing(todayComplete, totalHabitsToday);

    // Update stats
    const weekProgressEl = document.getElementById('weekProgress');
    const totalCheckinsEl = document.getElementById('totalCheckins');
    const bestStreakEl = document.getElementById('bestStreak');
    const avgCompletionEl = document.getElementById('avgCompletion');

    if (weekProgressEl) weekProgressEl.textContent = calculateWeekProgress() + '%';
    if (totalCheckinsEl) totalCheckinsEl.textContent = calculateTotalCheckins();
    if (bestStreakEl) bestStreakEl.textContent = calculateBestStreak();
    if (avgCompletionEl) avgCompletionEl.textContent = calculateAvgCompletion() + '%';

    // REFINEMENT: Principle 3 - Update all progress bars
    updateAllProgressBars();

    // Update analytics
    if (typeof updateAllAnalytics === 'function') {
        updateAllAnalytics();
    }
}

// REFINEMENT: Principle 3 - Function to update all bars
function updateAllProgressBars() {
    habits.forEach(habit => {
        const rate = calculateCompletionRate(habit.id);
        const progressBar = document.getElementById(`progress-${habit.id}`);
        if (progressBar) {
            progressBar.style.width = `${rate}%`;
        }
    });
}

function updateProgressRing(completed, total) {
    const circle = document.getElementById('progressCircle');
    const text = document.getElementById('progressText');
    if (!circle || !text) return;

    const radius = 52;
    const circumference = 2 * Math.PI * radius;

    const progress = total > 0 ? (completed / total) : 0;
    const offset = circumference - (progress * circumference);

    circle.style.strokeDashoffset = offset;
    text.textContent = `${completed}/${total}`;
}

function getOldestDataDate() {
    const dates = Object.keys(habitData);
    if (dates.length === 0) {
        return new Date();
    }
    dates.sort();
    return new Date(dates[0]);
}

function calculateStreak(habitId) {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return 0;

    let streak = 0;
    let checkDate = new Date();

    for (let i = 0; i < 365; i++) { // Check up to 1 year back
        const isApplicable = !(habit.schedule === 'weekdays' && !isWeekday(checkDate));
        const dateStr = getDateString(checkDate);
        const dayData = habitData[dateStr] || {};

        if (isApplicable) {
            if (dayData[habit.id]) {
                streak++;
            } else if (i > 0) {
                // Missed an applicable day that wasn't today
                break;
            } else if (i === 0 && !dayData[habit.id]) {
                // Not done today, streak is 0
            }
        }
        // If not applicable, streak continues

        checkDate.setDate(checkDate.getDate() - 1);
    }

    return streak;
}

function calculateCompletionRate(habitId) {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return 0;

    const startDate = getOldestDataDate();
    const today = new Date();
    let totalDays = 0;
    let completedDays = 0;

    let checkDate = new Date(startDate);
    while (checkDate <= today) {
        const isApplicable = !(habit.schedule === 'weekdays' && !isWeekday(checkDate));

        if (isApplicable) {
            totalDays++;
            const dateStr = getDateString(checkDate);
            const dayData = habitData[dateStr] || {};
            if (dayData[habit.id]) {
                completedDays++;
            }
        }

        checkDate.setDate(checkDate.getDate() + 1);
    }

    return totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
}

function calculateWeekProgress() {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Get last Sunday

    let totalPossible = 0;
    let totalCompleted = 0;

    for (let i = 0; i < 7; i++) {
        const checkDate = new Date(weekStart);
        checkDate.setDate(weekStart.getDate() + i);

        if (checkDate > today) break;

        const dateStr = getDateString(checkDate);
        const dayData = habitData[dateStr] || {};

        habits.forEach(habit => {
            const isApplicable = !(habit.schedule === 'weekdays' && !isWeekday(checkDate));
            if (isApplicable) {
                totalPossible++;
                if (dayData[habit.id]) {
                    totalCompleted++;
                }
            }
        });
    }

    return totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
}

function calculateTotalCheckins() {
    let total = 0;
    Object.values(habitData).forEach(dayData => {
        Object.values(dayData).forEach(checked => {
            if (checked) total++;
        });
    });
    return total;
}

function calculateBestStreak() {
    // This is a placeholder. A real "best streak" requires iterating all time.
    // For now, return the best "current" streak.
    let bestStreak = 0;
    habits.forEach(habit => {
        const streak = calculateStreak(habit.id);
        if (streak > bestStreak) {
            bestStreak = streak;
        }
    });
    return bestStreak;
}

function calculateAvgCompletion() {
    if (habits.length === 0) return 0;
    let total = 0;

    habits.forEach(habit => {
        total += calculateCompletionRate(habit.id);
    });

    return Math.round(total / habits.length);
}

window.changeDate = function (days) {
    currentViewDate.setDate(currentViewDate.getDate() + days);
    window.updateDisplay();
}

window.goToToday = function () {
    currentViewDate = new Date();
    window.updateDisplay();
    showSnackbar('Back to today! 📅');
}

window.exportToCSV = function () {
    let csv = 'Date,';
    habits.forEach(habit => {
        csv += `"${habit.name.replace(/"/g, '""')}",`;
    });
    csv = csv.slice(0, -1) + '\n'; // Remove last comma

    const startDate = getOldestDataDate();
    const endDate = new Date();

    let checkDate = new Date(startDate);
    while (checkDate <= endDate) {
        const dateStr = getDateString(checkDate);
        const dayData = habitData[dateStr] || {};

        csv += `${dateStr},`;
        habits.forEach(habit => {
            csv += `${dayData[habit.id] ? 'Yes' : 'No'},`;
        });
        csv = csv.slice(0, -1) + '\n';

        checkDate.setDate(checkDate.getDate() + 1);
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habit-tracker-${getDateString(new Date())}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    showSnackbar('CSV downloaded successfully! 💾');
}

// === HEATMAP LOGIC ===

window.openHeatmapModal = function (event, habitId, habitName, habitColor) {
    // Stop if clicking checkbox or menu
    if (event.target.matches('.habit-checkbox') || event.target.closest('.habit-menu')) {
        return;
    }

    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    document.getElementById('heatmapTitle').textContent = `${habit.icon} ${habit.name}`;

    // Update legend color
    document.getElementById('heatmapLegendColor').style.backgroundColor = habitColor;

    // Generate grid
    generateHeatmapGrid(habit);

    // Show modal
    document.getElementById('heatmapModal').classList.add('show');
}

window.closeHeatmapModal = function () {
    document.getElementById('heatmapModal').classList.remove('show');
}

window.generateHeatmapGrid = function (habit) {
    const grid = document.getElementById('heatmapGrid');
    grid.innerHTML = '';

    const numWeeks = 26; // 6 months
    const today = new Date();

    // Find the Sunday of this week
    let startDate = new Date();
    startDate.setDate(today.getDate() - today.getDay());

    // Go back numWeeks
    startDate.setDate(startDate.getDate() - (numWeeks - 1) * 7);

    let checkDate = new Date(startDate);

    for (let i = 0; i < numWeeks * 7; i++) {
        const day = document.createElement('div');
        day.className = 'heatmap-day';

        const dateStr = getDateString(checkDate);

        if (checkDate > today) {
            day.classList.add('na'); // Future date
        } else {
            const dayData = habitData[dateStr] || {};
            const isApplicable = !(habit.schedule === 'weekdays' && !isWeekday(checkDate));

            if (!isApplicable) {
                day.classList.add('na'); // Not applicable
            } else if (dayData[habit.id]) {
                day.classList.add('filled'); // Completed
                day.style.backgroundColor = habit.color;
            } else {
                day.classList.add('missed'); // Missed
            }
        }

        if (dateStr === getDateString(today)) {
            day.classList.add('today');
        }

        day.title = checkDate.toLocaleDateString();
        grid.appendChild(day);

        checkDate.setDate(checkDate.getDate() + 1);
    }
}


// === INITIALIZE ===

function populateColorPicker() {
    const picker = document.getElementById('colorPicker');
    picker.innerHTML = ''; // Clear first
    habitColors.forEach(color => {
        const swatch = document.createElement('div');
        swatch.className = 'color-swatch';
        swatch.dataset.color = color;
        swatch.style.backgroundColor = color;
        swatch.onclick = () => {
            document.querySelectorAll('.color-swatch.selected').forEach(s => s.classList.remove('selected'));
            swatch.classList.add('selected');
        };
        picker.appendChild(swatch);
    });
}

// REFINEMENT: Principle #2 - Dynamic App Bar
window.addEventListener('scroll', () => {
    const appBar = document.getElementById('appBar');
    if (!appBar) return;
    if (window.scrollY > 10) {
        appBar.classList.add('scrolled');
    } else {
        appBar.classList.remove('scrolled');
    }
});

// REFINEMENT: Principle #7 - Dark Mode Toggle
window.toggleDarkMode = function () {
    const body = document.body;
    body.classList.toggle('dark-mode');

    // Save preference
    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
}

function applyInitialTheme() {
    const savedTheme = localStorage.getItem('theme');
    // Check for saved theme OR system preference
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

// Initialize on page load
function init() {
    // Auth is handled by onAuthStateChanged
    applyInitialTheme();
    populateColorPicker();
    goToToday(); // Sets initial date and calls updateDisplay
}
// ==========================================
// ANALYTICS FUNCTIONS
// ==========================================

// Chart instances (global to allow updates)
let sevenDayTrendChart = null;
let todayDonutChart = null;
let monthlyPerformanceChart = null;
let thirtyDayTrendChart = null;
let streakTimelineChart = null;
let bestDaysChart = null;
let headToHeadChart = null;

// Current analytics tab
let currentAnalyticsTab = 'overview';

/**
 * Switch between analytics tabs
 */
window.switchAnalyticsTab = function (tabName) {
    currentAnalyticsTab = tabName;

    // Update tab buttons
    document.querySelectorAll('.analytics-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.closest('.analytics-tab').classList.add('active');

    // Update content sections
    document.querySelectorAll('.analytics-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-content`).classList.add('active');

    // Refresh data for the selected tab
    updateAnalyticsTab(tabName);
}

/**
 * Update analytics for a specific tab
 */
function updateAnalyticsTab(tabName) {
    switch (tabName) {
        case 'overview':
            updateOverviewTab();
            break;
        case 'heatmap':
            updateEnhancedHeatmap();
            break;
        case 'trends':
            updateTrendsTab();
            break;
        case 'insights':
            updateInsightsTab();
            break;
        case 'compare':
            updateCompareTab();
            break;
    }
}

/**
 * Calculate best streak for a habit (all time)
 */
function calculateBestStreakAllTime(habitId) {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return 0;

    let maxStreak = 0;
    let currentStreak = 0;

    // Get all dates from oldest data to today
    const startDate = getOldestDataDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const dayData = habitData[dateStr] || {};

        if (dayData[habitId]) {
            currentStreak++;
            maxStreak = Math.max(maxStreak, currentStreak);
        } else {
            currentStreak = 0;
        }
    }

    return maxStreak;
}

/**
 * Calculate current month progress percentage
 */
function calculateMonthProgress() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = now.getDate();

    let totalPossible = 0;
    let totalCompleted = 0;

    habits.forEach(habit => {
        for (let day = 1; day <= today; day++) {
            const dateStr = new Date(year, month, day).toISOString().split('T')[0];
            totalPossible++;
            if (habitData[dateStr] && habitData[dateStr][habit.id]) {
                totalCompleted++;
            }
        }
    });

    return totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
}

/**
 * Calculate consistency score (0-100) based on completion patterns
 */
function calculateConsistencyScore() {
    if (habits.length === 0) return 0;

    const last30Days = [];
    const today = new Date();

    for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        last30Days.push(date.toISOString().split('T')[0]);
    }

    let totalScore = 0;

    habits.forEach(habit => {
        let completedDays = 0;
        last30Days.forEach(dateStr => {
            if (habitData[dateStr] && habitData[dateStr][habit.id]) {
                completedDays++;
            }
        });
        totalScore += (completedDays / 30) * 100;
    });

    return Math.round(totalScore / habits.length);
}

/**
 * Get day of week analysis
 */
function getDayOfWeekData() {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];
    const dayTotals = [0, 0, 0, 0, 0, 0, 0];

    const last90Days = [];
    const today = new Date();

    for (let i = 0; i < 90; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        last90Days.push(date);
    }

    habits.forEach(habit => {
        last90Days.forEach(date => {
            const dayOfWeek = date.getDay();
            const dateStr = date.toISOString().split('T')[0];
            dayTotals[dayOfWeek]++;
            if (habitData[dateStr] && habitData[dateStr][habit.id]) {
                dayCounts[dayOfWeek]++;
            }
        });
    });

    const percentages = dayCounts.map((count, index) =>
        dayTotals[index] > 0 ? Math.round((count / dayTotals[index]) * 100) : 0
    );

    return { dayNames, percentages };
}

/**
 * Calculate completion rate for a habit over specified days
 */
function calculatePeriodRate(habitId, days) {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return 0;

    let completed = 0;
    const today = new Date();

    for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        if (habitData[dateStr] && habitData[dateStr][habit.id]) {
            completed++;
        }
    }

    return Math.round((completed / days) * 100);
}

/**
 * Update Overview Tab
 */
function updateOverviewTab() {
    // Mini stats
    const activeHabits = habits.length;
    const todayDateStr = getDateString(new Date());
    const todayCompleted = habits.filter(h => habitData[todayDateStr] && habitData[todayDateStr][h.id]).length;
    const todayRate = activeHabits > 0 ? Math.round((todayCompleted / activeHabits) * 100) : 0;
    const currentStreak = calculateCurrentStreak();
    const monthProgress = calculateMonthProgress();
    const consistencyScore = calculateConsistencyScore();

    document.getElementById('miniTotalHabits').textContent = activeHabits;
    document.getElementById('miniTodayCompleted').textContent = todayCompleted;
    document.getElementById('miniTodayRate').textContent = `${todayRate}%`;
    document.getElementById('miniCurrentStreak').textContent = currentStreak;
    document.getElementById('miniMonthProgress').textContent = `${monthProgress}%`;
    document.getElementById('miniConsistency').textContent = `${consistencyScore}%`;

    // Initialize charts
    initSevenDayTrendChart();
    initTodayDonutChart();
    initMonthlyPerformanceChart();
}

/**
 * Calculate current streak (consecutive days with at least one habit completed)
 */
function calculateCurrentStreak() {
    if (habits.length === 0) return 0;

    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 365; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        let dayHasCompletion = false;
        for (const habit of habits) {
            if (habitData[dateStr] && habitData[dateStr][habit.id]) {
                dayHasCompletion = true;
                break;
            }
        }

        if (dayHasCompletion) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
}

/**
 * Initialize 7-Day Trend Chart
 */
function initSevenDayTrendChart() {
    const ctx = document.getElementById('sevenDayTrendChart');
    if (!ctx) return;

    const labels = [];
    const data = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));

        let dayCompleted = 0;
        habits.forEach(habit => {
            if (habitData[dateStr] && habitData[dateStr][habit.id]) {
                dayCompleted++;
            }
        });

        data.push(dayCompleted);
    }

    if (sevenDayTrendChart) {
        sevenDayTrendChart.destroy();
    }

    sevenDayTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Habits Completed',
                data: data,
                borderColor: 'rgb(103, 80, 164)',
                backgroundColor: 'rgba(103, 80, 164, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointBackgroundColor: 'rgb(103, 80, 164)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}

/**
 * Initialize Today's Completion Donut Chart
 */
function initTodayDonutChart() {
    const ctx = document.getElementById('todayDonutChart');
    if (!ctx) return;

    const todayDateStr = getDateString(new Date());
    const completed = habits.filter(h => habitData[todayDateStr] && habitData[todayDateStr][h.id]).length;
    const pending = habits.length - completed;

    if (todayDonutChart) {
        todayDonutChart.destroy();
    }

    todayDonutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'Pending'],
            datasets: [{
                data: [completed, pending],
                backgroundColor: ['rgb(103, 80, 164)', 'rgba(103, 80, 164, 0.2)'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

/**
 * Initialize Monthly Performance Chart (6 months)
 */
function initMonthlyPerformanceChart() {
    const ctx = document.getElementById('monthlyPerformanceChart');
    if (!ctx) return;

    const labels = [];
    const data = [];
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        labels.push(date.toLocaleDateString('en-US', { month: 'short' }));

        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        let monthTotal = 0;
        let monthCompleted = 0;

        habits.forEach(habit => {
            for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = new Date(year, month, day).toISOString().split('T')[0];
                monthTotal++;
                if (habitData[dateStr] && habitData[dateStr][habit.id]) {
                    monthCompleted++;
                }
            }
        });

        const percentage = monthTotal > 0 ? Math.round((monthCompleted / monthTotal) * 100) : 0;
        data.push(percentage);
    }

    if (monthlyPerformanceChart) {
        monthlyPerformanceChart.destroy();
    }

    monthlyPerformanceChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Completion %',
                data: data,
                backgroundColor: 'rgb(103, 80, 164)',
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function (value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

/**
 * Update Enhanced Heatmap
 */
function updateEnhancedHeatmap() {
    const periodFilter = document.getElementById('heatmapPeriodFilter').value;
    const habitFilter = document.getElementById('heatmapHabitFilter').value;
    const grid = document.getElementById('enhancedHeatmapGrid');

    if (!grid) return;

    // Update habit filter dropdown
    const habitSelect = document.getElementById('heatmapHabitFilter');
    habitSelect.innerHTML = '<option value="all">All Habits</option>';
    habits.forEach(habit => {
        const option = document.createElement('option');
        option.value = habit.id;
        option.textContent = habit.name;
        habitSelect.appendChild(option);
    });

    // Calculate date range
    const months = parseInt(periodFilter);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate start date (beginning of week that contains the date X months ago)
    const startDate = new Date(today);
    startDate.setMonth(startDate.getMonth() - months);
    // Go back to Sunday of that week
    startDate.setDate(startDate.getDate() - startDate.getDay());

    // Generate heatmap
    grid.innerHTML = '';

    // Create container
    const container = document.createElement('div');
    container.style.cssText = 'display: flex; gap: 8px; overflow-x: auto; padding: 8px 0;';

    // Day labels column
    const dayLabelsCol = document.createElement('div');
    dayLabelsCol.style.cssText = 'display: flex; flex-direction: column; gap: 3px; padding-top: 20px;';
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach((day, index) => {
        const label = document.createElement('div');
        label.textContent = index % 2 === 1 ? day : ''; // Show only Mon, Wed, Fri
        label.style.cssText = 'height: 14px; font-size: 9px; line-height: 14px; color: var(--color-on-surface-variant); text-align: right; padding-right: 4px; width: 30px;';
        dayLabelsCol.appendChild(label);
    });
    container.appendChild(dayLabelsCol);

    // Weeks container
    const weeksContainer = document.createElement('div');
    weeksContainer.style.cssText = 'display: flex; gap: 3px;';

    // Calculate number of weeks
    const totalDays = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24)) + 1;
    const numWeeks = Math.ceil(totalDays / 7);

    // Generate weeks
    for (let week = 0; week < numWeeks; week++) {
        const weekCol = document.createElement('div');
        weekCol.style.cssText = 'display: flex; flex-direction: column; gap: 3px;';

        // Month label (show at start of month)
        const firstDayOfWeek = new Date(startDate);
        firstDayOfWeek.setDate(startDate.getDate() + (week * 7));

        const monthLabel = document.createElement('div');
        monthLabel.style.cssText = 'height: 15px; font-size: 9px; color: var(--color-on-surface-variant); text-align: left; margin-bottom: 2px;';

        // Show month label if it's the first week or if month changed
        if (week === 0 || firstDayOfWeek.getDate() <= 7) {
            monthLabel.textContent = firstDayOfWeek.toLocaleDateString('en-US', { month: 'short' });
        }
        weekCol.appendChild(monthLabel);

        // Generate 7 days for this week
        for (let day = 0; day < 7; day++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + (week * 7) + day);

            const dayEl = document.createElement('div');
            dayEl.style.cssText = 'width: 14px; height: 14px; border-radius: 2px; cursor: pointer; transition: all 0.2s;';

            // Skip if beyond today
            if (currentDate > today) {
                dayEl.style.background = 'transparent';
                weekCol.appendChild(dayEl);
                continue;
            }

            const dateStr = currentDate.toISOString().split('T')[0];
            let completedCount = 0;
            let totalCount = 0;

            if (habitFilter === 'all') {
                totalCount = habits.length;
                habits.forEach(habit => {
                    if (habitData[dateStr] && habitData[dateStr][habit.id]) {
                        completedCount++;
                    }
                });
            } else {
                const habit = habits.find(h => h.id === habitFilter);
                if (habit) {
                    totalCount = 1;
                    if (habitData[dateStr] && habitData[dateStr][habit.id]) {
                        completedCount = 1;
                    }
                }
            }

            const percentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

            // Set color based on percentage
            if (percentage === 0) {
                dayEl.style.background = 'var(--color-surface-tone-3)';
            } else if (percentage <= 25) {
                dayEl.style.background = 'rgba(103, 80, 164, 0.3)';
            } else if (percentage <= 50) {
                dayEl.style.background = 'rgba(103, 80, 164, 0.5)';
            } else if (percentage <= 75) {
                dayEl.style.background = 'rgba(103, 80, 164, 0.75)';
            } else {
                dayEl.style.background = 'rgb(103, 80, 164)';
            }

            // Tooltip
            dayEl.title = `${currentDate.toLocaleDateString()}: ${completedCount}/${totalCount} (${Math.round(percentage)}%)`;

            // Hover effect
            dayEl.onmouseenter = function () {
                this.style.transform = 'scale(1.3)';
                this.style.zIndex = '10';
                this.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
            };
            dayEl.onmouseleave = function () {
                this.style.transform = 'scale(1)';
                this.style.zIndex = '1';
                this.style.boxShadow = 'none';
            };

            weekCol.appendChild(dayEl);
        }

        weeksContainer.appendChild(weekCol);
    }

    container.appendChild(weeksContainer);
    grid.appendChild(container);
}

/**
 * Update Trends Tab
 */
function updateTrendsTab() {
    initThirtyDayTrendChart();
    initStreakTimelineChart();
}

/**
 * Initialize 30-Day Completion Trend Chart
 */
function initThirtyDayTrendChart() {
    const ctx = document.getElementById('thirtyDayTrendChart');
    if (!ctx) return;

    const labels = [];
    const data = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        if (i % 5 === 0) {
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        } else {
            labels.push('');
        }

        let dayCompleted = 0;
        habits.forEach(habit => {
            if (habitData[dateStr] && habitData[dateStr][habit.id]) {
                dayCompleted++;
            }
        });

        const percentage = habits.length > 0 ? Math.round((dayCompleted / habits.length) * 100) : 0;
        data.push(percentage);
    }

    if (thirtyDayTrendChart) {
        thirtyDayTrendChart.destroy();
    }

    thirtyDayTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Completion %',
                data: data,
                borderColor: 'rgb(103, 80, 164)',
                backgroundColor: 'rgba(103, 80, 164, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 3,
                pointBackgroundColor: 'rgb(103, 80, 164)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function (value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

/**
 * Initialize Streak Timeline Chart
 */
function initStreakTimelineChart() {
    const ctx = document.getElementById('streakTimelineChart');
    if (!ctx) return;

    const labels = [];
    const currentStreaks = [];
    const bestStreaks = [];

    habits.slice(0, 8).forEach(habit => {
        labels.push(habit.name.length > 15 ? habit.name.substring(0, 15) + '...' : habit.name);

        // Calculate current streak
        let currentStreak = 0;
        const today = new Date();
        for (let i = 0; i < 365; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            if (habitData[dateStr] && habitData[dateStr][habit.id]) {
                currentStreak++;
            } else {
                break;
            }
        }
        currentStreaks.push(currentStreak);

        // Calculate best streak
        const bestStreak = calculateBestStreakAllTime(habit.id);
        bestStreaks.push(bestStreak);
    });

    if (streakTimelineChart) {
        streakTimelineChart.destroy();
    }

    streakTimelineChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Current Streak',
                    data: currentStreaks,
                    backgroundColor: 'rgb(103, 80, 164)',
                    borderRadius: 6
                },
                {
                    label: 'Best Streak',
                    data: bestStreaks,
                    backgroundColor: 'rgba(103, 80, 164, 0.4)',
                    borderRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}

/**
 * Update Insights Tab
 */
function updateInsightsTab() {
    generateTopPerformers();
    generateNeedsAttention();
    initBestDaysChart();
    generatePatternRecognition();
}

/**
 * Generate Top Performers
 */
function generateTopPerformers() {
    const container = document.getElementById('topPerformersContainer');
    if (!container) return;

    container.innerHTML = '';

    if (habits.length === 0) {
        container.innerHTML = '<p style="color: var(--color-on-surface-variant); text-align: center;">No habits tracked yet</p>';
        return;
    }

    // Calculate 30-day completion rates
    const habitScores = habits.map(habit => {
        const rate = calculatePeriodRate(habit.id, 30);
        return { habit, rate };
    });

    // Sort by rate
    habitScores.sort((a, b) => b.rate - a.rate);

    // Top 3
    habitScores.slice(0, 3).forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'insight-card';
        card.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                <span class="material-symbols-outlined" style="font-size: 32px; color: ${index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32'};">
                    ${index === 0 ? 'workspace_premium' : 'emoji_events'}
                </span>
                <div style="flex: 1;">
                    <div style="font-weight: 600; font-size: 16px;">${item.habit.name}</div>
                    <div style="color: var(--color-on-surface-variant); font-size: 14px;">30-day completion: ${item.rate}%</div>
                </div>
            </div>
            <div style="background: var(--color-surface-tone-3); height: 8px; border-radius: 4px; overflow: hidden;">
                <div style="background: rgb(103, 80, 164); height: 100%; width: ${item.rate}%; transition: width 0.3s;"></div>
            </div>
        `;
        container.appendChild(card);
    });
}

/**
 * Generate Needs Attention List
 */
function generateNeedsAttention() {
    const container = document.getElementById('needsAttentionContainer');
    if (!container) return;

    container.innerHTML = '';

    if (habits.length === 0) {
        container.innerHTML = '<p style="color: var(--color-on-surface-variant); text-align: center;">No habits tracked yet</p>';
        return;
    }

    // Calculate 7-day completion rates
    const habitScores = habits.map(habit => {
        const rate = calculatePeriodRate(habit.id, 7);
        return { habit, rate };
    });

    // Sort by rate (ascending)
    habitScores.sort((a, b) => a.rate - b.rate);

    // Bottom 3
    habitScores.slice(0, 3).forEach(item => {
        const card = document.createElement('div');
        card.className = 'insight-card';
        card.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                <span class="material-symbols-outlined" style="font-size: 32px; color: var(--color-error);">
                    error
                </span>
                <div style="flex: 1;">
                    <div style="font-weight: 600; font-size: 16px;">${item.habit.name}</div>
                    <div style="color: var(--color-on-surface-variant); font-size: 14px;">Only ${item.rate}% completion this week</div>
                </div>
            </div>
            <div style="background: var(--color-surface-tone-3); height: 8px; border-radius: 4px; overflow: hidden;">
                <div style="background: var(--color-error); height: 100%; width: ${item.rate}%; transition: width 0.3s;"></div>
            </div>
        `;
        container.appendChild(card);
    });
}

/**
 * Initialize Best Days Chart
 */
function initBestDaysChart() {
    const ctx = document.getElementById('bestDaysChart');
    if (!ctx) return;

    const { dayNames, percentages } = getDayOfWeekData();

    if (bestDaysChart) {
        bestDaysChart.destroy();
    }

    bestDaysChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dayNames,
            datasets: [{
                label: 'Completion %',
                data: percentages,
                backgroundColor: 'rgb(103, 80, 164)',
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function (value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

/**
 * Generate Pattern Recognition
 */
function generatePatternRecognition() {
    const container = document.getElementById('patternRecognitionContainer');
    if (!container) return;

    container.innerHTML = '';

    if (habits.length === 0) {
        container.innerHTML = '<p style="color: var(--color-on-surface-variant); text-align: center;">No habits tracked yet</p>';
        return;
    }

    const { dayNames, percentages } = getDayOfWeekData();

    // Find best and worst days
    const maxIndex = percentages.indexOf(Math.max(...percentages));
    const minIndex = percentages.indexOf(Math.min(...percentages));

    // Best day pattern
    const bestCard = document.createElement('div');
    bestCard.className = 'insight-card';
    bestCard.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <span class="material-symbols-outlined" style="font-size: 32px; color: rgb(103, 80, 164);">
                trending_up
            </span>
            <div>
                <div style="font-weight: 600; font-size: 16px;">Best Day</div>
                <div style="color: var(--color-on-surface-variant); font-size: 14px;">
                    ${dayNames[maxIndex]} - ${percentages[maxIndex]}% completion rate
                </div>
            </div>
        </div>
    `;
    container.appendChild(bestCard);

    // Worst day pattern
    const worstCard = document.createElement('div');
    worstCard.className = 'insight-card';
    worstCard.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <span class="material-symbols-outlined" style="font-size: 32px; color: var(--color-error);">
                trending_down
            </span>
            <div>
                <div style="font-weight: 600; font-size: 16px;">Needs Improvement</div>
                <div style="color: var(--color-on-surface-variant); font-size: 14px;">
                    ${dayNames[minIndex]} - ${percentages[minIndex]}% completion rate
                </div>
            </div>
        </div>
    `;
    container.appendChild(worstCard);

    // Consistency pattern
    const consistencyScore = calculateConsistencyScore();
    const consistencyCard = document.createElement('div');
    consistencyCard.className = 'insight-card';
    const consistencyLevel = consistencyScore >= 80 ? 'Excellent' : consistencyScore >= 60 ? 'Good' : consistencyScore >= 40 ? 'Fair' : 'Needs Work';
    const consistencyColor = consistencyScore >= 80 ? 'rgb(103, 80, 164)' : consistencyScore >= 60 ? '#4CAF50' : consistencyScore >= 40 ? '#FF9800' : 'var(--color-error)';

    consistencyCard.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <span class="material-symbols-outlined" style="font-size: 32px; color: ${consistencyColor};">
                insights
            </span>
            <div>
                <div style="font-weight: 600; font-size: 16px;">Consistency Level</div>
                <div style="color: var(--color-on-surface-variant); font-size: 14px;">
                    ${consistencyLevel} - ${consistencyScore}% over last 30 days
                </div>
            </div>
        </div>
    `;
    container.appendChild(consistencyCard);
}

/**
 * Update Compare Tab
 */
function updateCompareTab() {
    populateComparisonTable();
    initHeadToHeadChart();
}

/**
 * Populate Comparison Table
 */
function populateComparisonTable() {
    const tbody = document.querySelector('#comparisonTable tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    habits.forEach(habit => {
        const rate7 = calculatePeriodRate(habit.id, 7);
        const rate30 = calculatePeriodRate(habit.id, 30);
        const bestStreak = calculateBestStreakAllTime(habit.id);

        // Current streak
        let currentStreak = 0;
        const today = new Date();
        for (let i = 0; i < 365; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            if (habitData[dateStr] && habitData[dateStr][habit.id]) {
                currentStreak++;
            } else {
                break;
            }
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="font-weight: 600;">${habit.name}</td>
            <td>${rate7}%</td>
            <td>${rate30}%</td>
            <td>${currentStreak}</td>
            <td>${bestStreak}</td>
        `;
        tbody.appendChild(row);
    });
}

/**
 * Initialize Head-to-Head Comparison Chart
 */
function initHeadToHeadChart() {
    const ctx = document.getElementById('headToHeadChart');
    if (!ctx) return;

    const select1 = document.getElementById('compareHabit1');
    const select2 = document.getElementById('compareHabit2');

    // Populate selects
    select1.innerHTML = '';
    select2.innerHTML = '';

    habits.forEach((habit, index) => {
        const option1 = document.createElement('option');
        option1.value = habit.id;
        option1.textContent = habit.name;
        if (index === 0) option1.selected = true;
        select1.appendChild(option1);

        const option2 = document.createElement('option');
        option2.value = habit.id;
        option2.textContent = habit.name;
        if (index === 1 || (index === 0 && habits.length === 1)) option2.selected = true;
        select2.appendChild(option2);
    });

    // Draw chart
    drawHeadToHeadChart();
}

/**
 * Draw Head-to-Head Chart
 */
function drawHeadToHeadChart() {
    const ctx = document.getElementById('headToHeadChart');
    if (!ctx) return;

    const select1 = document.getElementById('compareHabit1');
    const select2 = document.getElementById('compareHabit2');

    const habit1 = habits.find(h => h.id === select1.value);
    const habit2 = habits.find(h => h.id === select2.value);

    if (!habit1 || !habit2) return;

    const labels = [];
    const data1 = [];
    const data2 = [];
    const today = new Date();

    for (let i = 13; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        data1.push(habitData[dateStr] && habitData[dateStr][habit1.id] ? 1 : 0);
        data2.push(habitData[dateStr] && habitData[dateStr][habit2.id] ? 1 : 0);
    }

    if (headToHeadChart) {
        headToHeadChart.destroy();
    }

    headToHeadChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: habit1.name,
                    data: data1,
                    borderColor: 'rgb(103, 80, 164)',
                    backgroundColor: 'rgba(103, 80, 164, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointBackgroundColor: 'rgb(103, 80, 164)'
                },
                {
                    label: habit2.name,
                    data: data2,
                    borderColor: 'rgb(233, 30, 99)',
                    backgroundColor: 'rgba(233, 30, 99, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointBackgroundColor: 'rgb(233, 30, 99)'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 1,
                    ticks: {
                        stepSize: 1,
                        callback: function (value) {
                            return value === 1 ? 'Done' : 'Not Done';
                        }
                    }
                }
            }
        }
    });
}

/**
 * Update all analytics
 */
function updateAllAnalytics() {
    if (currentAnalyticsTab) {
        updateAnalyticsTab(currentAnalyticsTab);
    }
}

// Add event listeners for filters
document.addEventListener('DOMContentLoaded', function () {
    const heatmapPeriodFilter = document.getElementById('heatmapPeriodFilter');
    const heatmapHabitFilter = document.getElementById('heatmapHabitFilter');
    const compareHabit1 = document.getElementById('compareHabit1');
    const compareHabit2 = document.getElementById('compareHabit2');

    if (heatmapPeriodFilter) {
        heatmapPeriodFilter.addEventListener('change', updateEnhancedHeatmap);
    }
    if (heatmapHabitFilter) {
        heatmapHabitFilter.addEventListener('change', updateEnhancedHeatmap);
    }
    if (compareHabit1) {
        compareHabit1.addEventListener('change', drawHeadToHeadChart);
    }
    if (compareHabit2) {
        compareHabit2.addEventListener('change', drawHeadToHeadChart);
    }
});

// ==========================================
// 3-TAB NAVIGATION SYSTEM
// ==========================================

/**
 * Switch between tabs: habits, analytics, profile
 */
window.switchTab = function (tabName) {
    // Update nav button states
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    // Update tab content visibility
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}-tab`);
    });

    // Load data when switching to analytics
    if (tabName === 'analytics') {
        // Analytics data will be loaded here in next phase
        console.log('Analytics tab activated');
    }

    // Save current tab to localStorage
    localStorage.setItem('currentTab', tabName);
};

// Restore last active tab on page load
window.addEventListener('DOMContentLoaded', () => {
    const lastTab = localStorage.getItem('currentTab') || 'habits';
    if (lastTab !== 'habits') {
        switchTab(lastTab);
    }
});

// ========================================
// ANALYTICS TAB: Sub-tab Switching
// ========================================
window.switchAnalyticsSubTab = function (subtabName) {
    // Update sub-tab button states
    document.querySelectorAll('.sub-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.subtab === subtabName);
    });

    // Update sub-tab content visibility
    document.querySelectorAll('.sub-tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `${subtabName}-subtab`);
    });

    // Load data when switching to progress sub-tab
    if (subtabName === 'progress') {
        renderProgressView();
    }
};

// ========================================
// ANALYTICS TAB: Progress/Milestones Toggle
// ========================================
window.switchProgressView = function (viewName) {
    // Update toggle button states
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === viewName);
    });

    // Update view visibility
    document.querySelectorAll('.progress-view').forEach(view => {
        view.classList.toggle('active', view.id === `${viewName}-view`);
    });

    // Render appropriate content
    if (viewName === 'milestones') {
        renderMilestoneCards();
    }
};

// ========================================
// ANALYTICS TAB: Calculate Total Reps
// ========================================
function calculateTotalReps() {
    let total = 0;
    for (const dateStr in habitData) {
        for (const habitId in habitData[dateStr]) {
            if (habitData[dateStr][habitId]) {
                total++;
            }
        }
    }
    return total;
}

// ========================================
// ANALYTICS TAB: Render Progress View
// ========================================
function renderProgressView() {
    const totalReps = calculateTotalReps();

    // Update total reps number
    const totalRepsNumber = document.getElementById('totalRepsNumber');
    if (totalRepsNumber) {
        totalRepsNumber.textContent = totalReps.toLocaleString();
    }

    // Update votes message
    const votesCount = document.getElementById('votesCount');
    if (votesCount) {
        votesCount.textContent = totalReps.toLocaleString();
    }

    // Render breakdown bar and stats list
    renderHabitBreakdownBar();
    renderHabitStatsList();
}

// ========================================
// ANALYTICS TAB: Render Habit Breakdown Bar
// ========================================
function renderHabitBreakdownBar() {
    const breakdownBar = document.getElementById('habitBreakdownBar');
    if (!breakdownBar) return;

    // Calculate reps per habit
    const habitReps = {};
    let totalReps = 0;

    for (const dateStr in habitData) {
        for (const habitId in habitData[dateStr]) {
            if (habitData[dateStr][habitId]) {
                habitReps[habitId] = (habitReps[habitId] || 0) + 1;
                totalReps++;
            }
        }
    }

    // If no data, show empty state
    if (totalReps === 0) {
        breakdownBar.innerHTML = '<div style="text-align: center; padding: 16px; color: var(--color-on-surface-variant);">No habit data yet</div>';
        return;
    }

    // Create segments
    let html = '';
    habits.forEach((habit, index) => {
        const reps = habitReps[habit.id] || 0;
        if (reps === 0) return;

        const percentage = (reps / totalReps) * 100;
        const gradient = habitGradients[index % habitGradients.length];

        html += `
            <div class="bar-segment"
                 style="width: ${percentage}%; background: ${gradient};"
                 title="${habit.name}: ${reps} reps (${percentage.toFixed(1)}%)">
            </div>
        `;
    });

    breakdownBar.innerHTML = html;
}

// ========================================
// ANALYTICS TAB: Render Habit Stats List
// ========================================
function renderHabitStatsList() {
    const statsList = document.getElementById('habitStatsList');
    if (!statsList) return;

    // Calculate reps per habit
    const habitReps = {};
    let totalReps = 0;

    for (const dateStr in habitData) {
        for (const habitId in habitData[dateStr]) {
            if (habitData[dateStr][habitId]) {
                habitReps[habitId] = (habitReps[habitId] || 0) + 1;
                totalReps++;
            }
        }
    }

    // If no data, show empty state
    if (totalReps === 0) {
        statsList.innerHTML = '<div style="text-align: center; padding: 32px; color: var(--color-on-surface-variant);">No habit data yet</div>';
        return;
    }

    // Sort habits by reps (descending)
    const sortedHabits = habits
        .map((habit, index) => ({
            habit,
            reps: habitReps[habit.id] || 0,
            gradient: habitGradients[index % habitGradients.length]
        }))
        .filter(item => item.reps > 0)
        .sort((a, b) => b.reps - a.reps);

    // Create stat items
    let html = '';
    sortedHabits.forEach(item => {
        const percentage = ((item.reps / totalReps) * 100).toFixed(1);

        html += `
            <div class="habit-stat-item">
                <div class="habit-stat-left">
                    <div class="habit-stat-icon" style="background: ${item.gradient};">
                        ${item.habit.icon}
                    </div>
                    <div class="habit-stat-info">
                        <h4 class="habit-stat-name">${item.habit.name}</h4>
                        <p class="habit-stat-percentage">${percentage}% of total</p>
                    </div>
                </div>
                <div class="habit-stat-count">${item.reps}</div>
            </div>
        `;
    });

    statsList.innerHTML = html;
}

// ========================================
// ANALYTICS TAB: Render Milestone Cards
// ========================================
function renderMilestoneCards() {
    const container = document.getElementById('milestoneCardsContainer');
    if (!container) return;

    // Calculate reps per habit
    const habitReps = {};
    for (const dateStr in habitData) {
        for (const habitId in habitData[dateStr]) {
            if (habitData[dateStr][habitId]) {
                habitReps[habitId] = (habitReps[habitId] || 0) + 1;
            }
        }
    }

    // If no data, show empty state
    if (Object.keys(habitReps).length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 32px; color: var(--color-on-surface-variant);">Complete habits to unlock milestones!</div>';
        return;
    }

    // Generate milestone cards for each habit
    let html = '';
    habits.forEach((habit, index) => {
        const reps = habitReps[habit.id] || 0;
        if (reps === 0) return;

        const gradient = habitGradients[index % habitGradients.length];
        const badges = generateMilestoneBadges(reps);

        html += `
            <div class="milestone-card">
                <div class="milestone-header">
                    <div class="milestone-icon" style="background: ${gradient};">
                        ${habit.icon}
                    </div>
                    <div class="milestone-title">
                        <h3>${habit.name}</h3>
                        <p>${reps} total reps</p>
                    </div>
                </div>
                <div class="milestone-badges">
                    ${badges}
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// ========================================
// ANALYTICS TAB: Generate Milestone Badges
// ========================================
function generateMilestoneBadges(reps) {
    const milestones = [
        { count: 1, icon: '🎯', label: '1st Rep' },
        { count: 7, icon: '🔥', label: '7 Days' },
        { count: 14, icon: '💪', label: '2 Weeks' },
        { count: 30, icon: '⭐', label: '30 Days' },
        { count: 60, icon: '👑', label: '2 Months' },
        { count: 100, icon: '💎', label: '100 Days' },
        { count: 365, icon: '🏆', label: '1 Year' }
    ];

    let html = '';
    milestones.forEach(milestone => {
        const earned = reps >= milestone.count;
        const className = earned ? 'badge-icon earned' : 'badge-icon locked';

        html += `
            <div class="${className}" title="${milestone.label}${earned ? ' - Earned!' : ' - Locked'}">
                <span>${milestone.icon}</span>
                <span class="badge-count">${milestone.count}</span>
            </div>
        `;
    });

    return html;
}

// Update switchTab to render progress when switching to analytics
const originalSwitchTab = window.switchTab;
window.switchTab = function (tabName) {
    originalSwitchTab(tabName);

    // Render progress view when switching to analytics tab
    if (tabName === 'analytics') {
        renderProgressView();
    }

    // Render profile when switching to profile tab
    if (tabName === 'profile') {
        renderProfile();
    }
};

// ========================================
// PROFILE TAB: Render Profile Data
// ========================================
function renderProfile() {
    // Get user info from Firebase auth
    if (auth.currentUser) {
        const displayName = auth.currentUser.displayName || 'User';
        const email = auth.currentUser.email || 'user@example.com';
        const avatar = displayName.charAt(0).toUpperCase();

        document.getElementById('profileName').textContent = displayName;
        document.getElementById('profileEmail').textContent = email;
        document.getElementById('profileAvatar').textContent = avatar;
    }

    // Calculate stats
    const totalHabits = habits.length;
    const totalReps = calculateTotalReps();
    const bestStreak = calculateBestStreak();

    document.getElementById('profileTotalHabits').textContent = totalHabits;
    document.getElementById('profileTotalReps').textContent = totalReps;
    document.getElementById('profileBestStreak').textContent = bestStreak;

    // Update toggle states
    updateProfileToggles();
}

// ========================================
// PROFILE TAB: Calculate Best Streak
// ========================================
function calculateBestStreak() {
    let bestStreak = 0;

    habits.forEach(habit => {
        const streak = getHabitCompletionCount(habit.id);
        if (streak > bestStreak) {
            bestStreak = streak;
        }
    });

    return bestStreak;
}

// ========================================
// PROFILE TAB: Update Toggle States
// ========================================
function updateProfileToggles() {
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    const isDarkMode = document.body.classList.contains('dark-mode');
    if (themeToggle) {
        themeToggle.classList.toggle('active', isDarkMode);
    }

    // Haptics toggle
    const hapticsToggle = document.getElementById('hapticsToggle');
    if (hapticsToggle && window.haptics) {
        hapticsToggle.classList.toggle('active', window.haptics.isEnabled());
    }

    // Celebrations toggle
    const celebrationsToggle = document.getElementById('celebrationsToggle');
    if (celebrationsToggle && window.celebrationModal) {
        celebrationsToggle.classList.toggle('active', window.celebrationModal.isEnabled());
    }
}

// ========================================
// PROFILE TAB: Toggle Theme
// ========================================
window.toggleTheme = function () {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');

    // Update toggle UI
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.classList.toggle('active', isDarkMode);
    }

    // Trigger haptic feedback
    if (window.haptics) {
        window.haptics.tapComplete();
    }
};

// ========================================
// PROFILE TAB: Toggle Haptics
// ========================================
window.toggleHaptics = function () {
    if (!window.haptics) return;

    const newState = !window.haptics.isEnabled();
    window.haptics.setEnabled(newState);

    // Update toggle UI
    const hapticsToggle = document.getElementById('hapticsToggle');
    if (hapticsToggle) {
        hapticsToggle.classList.toggle('active', newState);
    }

    // Trigger haptic feedback if enabling
    if (newState) {
        window.haptics.tapComplete();
    }
};

// ========================================
// PROFILE TAB: Toggle Celebrations
// ========================================
window.toggleCelebrations = function () {
    if (!window.celebrationModal) return;

    const newState = !window.celebrationModal.isEnabled();
    window.celebrationModal.setEnabled(newState);

    // Update toggle UI
    const celebrationsToggle = document.getElementById('celebrationsToggle');
    if (celebrationsToggle) {
        celebrationsToggle.classList.toggle('active', newState);
    }

    // Trigger haptic feedback
    if (window.haptics) {
        window.haptics.tapComplete();
    }
};

// ========================================
// PROFILE TAB: Handle Logout
// ========================================
window.handleLogout = async function () {
    if (!confirm('Are you sure you want to log out?')) {
        return;
    }

    try {
        await signOut(auth);
        // Redirect to login (auth state change listener will handle UI update)
        window.location.reload();
    } catch (error) {
        console.error('Error signing out:', error);
        alert('Failed to log out. Please try again.');
    }
};

init();
