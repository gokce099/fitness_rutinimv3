// Ultra Modern Fitness App - JavaScript with Mobile Support
let currentWorkoutDay = 1;
let workoutCycleResetTimer = null;
let profilePhotos = [
    'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
];
let currentPhotoIndex = 0;

// Mobile Menu Functions
function toggleMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.mobile-overlay');
    
    sidebar.classList.toggle('mobile-open');
    overlay.classList.toggle('active');
}

function closeMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.mobile-overlay');
    
    sidebar.classList.remove('mobile-open');
    overlay.classList.remove('active');
}

// Close mobile menu when clicking on navigation links
function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Show selected section
    document.getElementById(sectionName).classList.add('active');
    
    // Update active nav link
    const navLinks = document.querySelectorAll('.sidebar nav a');
    navLinks.forEach(link => link.classList.remove('active'));
    event.target.classList.add('active');
    
    // Close mobile menu
    closeMobileMenu();
    
    // Load section-specific data
    if (sectionName === 'nutrition') {
        displayNutritionHistory();
    } else if (sectionName === 'history') {
        displayWorkoutHistory();
    } else if (sectionName === 'water-history') {
        displayWaterHistory();
    } else if (sectionName === 'step-history') {
        displayStepHistory();
    } else if (sectionName === 'progress') {
        displayProgressHistory();
        updateProgressChart();
    } else if (sectionName === 'dashboard') {
        updateDashboard();
        updateDashboardChart();
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Set current date
    const today = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    document.getElementById('currentDate').textContent = today.toLocaleDateString('tr-TR', options);
    
    // Load saved data
    loadSavedData();
    
    // Initialize workout program
    initializeWorkoutProgram();
    
    // Initialize food database
    initializeFoodDatabase();
    
    // Update dashboard
    updateDashboard();
    
    // Initialize charts
    updateDashboardChart();
    updateProgressChart();
    
    // Set today's date for progress form
    document.getElementById('progressDate').valueAsDate = new Date();
    
    // Load user name
    const savedUserName = localStorage.getItem('userName');
    if (savedUserName) {
        document.getElementById('userName').textContent = savedUserName;
    }
    
    // Load profile photo
    const savedPhotoIndex = localStorage.getItem('profilePhotoIndex');
    if (savedPhotoIndex) {
        currentPhotoIndex = parseInt(savedPhotoIndex);
        document.getElementById('profileImage').src = profilePhotos[currentPhotoIndex];
    }
    
    // Load workout cycle state
    loadWorkoutCycleState();
}

// Profile photo management
function changeProfilePhoto() {
    currentPhotoIndex = (currentPhotoIndex + 1) % profilePhotos.length;
    document.getElementById('profileImage').src = profilePhotos[currentPhotoIndex];
    localStorage.setItem('profilePhotoIndex', currentPhotoIndex.toString());
}

// User name editing
function editUserName() {
    const currentName = document.getElementById('userName').textContent;
    const newName = prompt('Yeni kullanıcı adınızı girin:', currentName);
    
    if (newName && newName.trim() !== '') {
        document.getElementById('userName').textContent = newName.trim();
        localStorage.setItem('userName', newName.trim());
        showNotification('Kullanıcı adı güncellendi!');
    }
}

// Data management
function loadSavedData() {
    // Load daily data
    const today = new Date().toDateString();
    const dailyData = JSON.parse(localStorage.getItem(`dailyData_${today}`)) || {
        caloriesBurned: 0,
        caloriesEaten: 0,
        stepsTaken: 0,
        waterDrank: 0
    };
    
    // Update dashboard values
    document.getElementById('caloriesBurnedValue').textContent = dailyData.caloriesBurned;
    document.getElementById('caloriesEatenValue').textContent = dailyData.caloriesEaten;
    document.getElementById('stepsTakenValue').textContent = dailyData.stepsTaken.toLocaleString();
    document.getElementById('waterDrankValue').textContent = dailyData.waterDrank.toFixed(1) + ' L';
    
    // Update progress bars
    updateProgressBars();
}

function saveDailyData() {
    const today = new Date().toDateString();
    const dailyData = {
        caloriesBurned: parseInt(document.getElementById('caloriesBurnedValue').textContent),
        caloriesEaten: parseInt(document.getElementById('caloriesEatenValue').textContent),
        stepsTaken: parseInt(document.getElementById('stepsTakenValue').textContent.replace(/,/g, '')),
        waterDrank: parseFloat(document.getElementById('waterDrankValue').textContent)
    };
    
    localStorage.setItem(`dailyData_${today}`, JSON.stringify(dailyData));
}

// Dashboard functions
function addSteps() {
    const stepsInput = document.getElementById('stepsInput');
    const steps = parseInt(stepsInput.value);
    
    if (steps && steps > 0) {
        const currentSteps = parseInt(document.getElementById('stepsTakenValue').textContent.replace(/,/g, ''));
        const newSteps = currentSteps + steps;
        
        document.getElementById('stepsTakenValue').textContent = newSteps.toLocaleString();
        
        // Calculate calories burned from steps (approximately 0.04 calories per step)
        const caloriesFromSteps = Math.round(steps * 0.04);
        const currentCalories = parseInt(document.getElementById('caloriesBurnedValue').textContent);
        document.getElementById('caloriesBurnedValue').textContent = currentCalories + caloriesFromSteps;
        
        // Save to history
        saveStepHistory(steps, caloriesFromSteps);
        
        stepsInput.value = '';
        updateProgressBars();
        saveDailyData();
        showNotification(`${steps.toLocaleString()} adım eklendi! ${caloriesFromSteps} kalori yakıldı.`);
    }
}

function addWater() {
    const waterInput = document.getElementById('waterInput');
    const water = parseFloat(waterInput.value);
    
    if (water && water > 0) {
        const currentWater = parseFloat(document.getElementById('waterDrankValue').textContent);
        const newWater = currentWater + water;
        
        document.getElementById('waterDrankValue').textContent = newWater.toFixed(1) + ' L';
        
        // Save to history
        saveWaterHistory(water);
        
        waterInput.value = '';
        updateProgressBars();
        saveDailyData();
        showNotification(`${water} L su eklendi!`);
    }
}

function updateProgressBars() {
    // Calories burned progress (target: 1000)
    const caloriesBurned = parseInt(document.getElementById('caloriesBurnedValue').textContent);
    const burnedProgress = Math.min((caloriesBurned / 1000) * 100, 100);
    document.getElementById('burnedProgress').style.width = burnedProgress + '%';
    
    // Calories eaten progress (target: 1500)
    const caloriesEaten = parseInt(document.getElementById('caloriesEatenValue').textContent);
    const eatenProgress = Math.min((caloriesEaten / 1500) * 100, 100);
    document.getElementById('eatenProgress').style.width = eatenProgress + '%';
    
    // Steps progress (target: 15000)
    const stepsTaken = parseInt(document.getElementById('stepsTakenValue').textContent.replace(/,/g, ''));
    const stepsProgress = Math.min((stepsTaken / 15000) * 100, 100);
    document.getElementById('stepsProgress').style.width = stepsProgress + '%';
    
    // Water progress (target: 3L)
    const waterDrank = parseFloat(document.getElementById('waterDrankValue').textContent);
    const waterProgress = Math.min((waterDrank / 3) * 100, 100);
    document.getElementById('waterProgress').style.width = waterProgress + '%';
}

function updateDashboard() {
    loadSavedData();
    updateProgressBars();
}

// Workout program
function initializeWorkoutProgram() {
    const workoutProgram = [
        {
            day: 1,
            name: "Göğüs & Triceps",
            image: "https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop",
            exercises: [
                { name: "Bench Press", sets: 3, reps: 15, weight: 0 },
                { name: "Incline Dumbbell Press", sets: 3, reps: 15, weight: 0 },
                { name: "Chest Fly", sets: 3, reps: 15, weight: 0 },
                { name: "Push-ups", sets: 3, reps: 15, weight: 0 },
                { name: "Triceps Dips", sets: 3, reps: 15, weight: 0 },
                { name: "Triceps Pushdown", sets: 3, reps: 15, weight: 0 },
                { name: "Overhead Triceps Extension", sets: 3, reps: 15, weight: 0 },
                { name: "Close-Grip Push-ups", sets: 3, reps: 15, weight: 0 },
                { name: "Diamond Push-ups", sets: 3, reps: 15, weight: 0 },
                { name: "Chest Press Machine", sets: 3, reps: 15, weight: 0 },
                { name: "Eliptik Bisiklet", sets: 1, reps: "dakika", weight: 0, isCardio: true }
            ]
        },
        {
            day: 2,
            name: "Sırt & Biceps",
            image: "https://images.pexels.com/photos/1431282/pexels-photo-1431282.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop",
            exercises: [
                { name: "Pull-ups", sets: 3, reps: 15, weight: 0 },
                { name: "Lat Pulldown", sets: 3, reps: 15, weight: 0 },
                { name: "Barbell Rows", sets: 3, reps: 15, weight: 0 },
                { name: "Seated Cable Rows", sets: 3, reps: 15, weight: 0 },
                { name: "T-Bar Rows", sets: 3, reps: 15, weight: 0 },
                { name: "Biceps Curls", sets: 3, reps: 15, weight: 0 },
                { name: "Hammer Curls", sets: 3, reps: 15, weight: 0 },
                { name: "Preacher Curls", sets: 3, reps: 15, weight: 0 },
                { name: "Cable Biceps Curls", sets: 3, reps: 15, weight: 0 },
                { name: "Reverse Curls", sets: 3, reps: 15, weight: 0 },
                { name: "Eliptik Bisiklet", sets: 1, reps: "dakika", weight: 0, isCardio: true }
            ]
        },
        {
            day: 3,
            name: "Bacak & Omuz",
            image: "https://images.pexels.com/photos/1552106/pexels-photo-1552106.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop",
            exercises: [
                { name: "Squats", sets: 3, reps: 15, weight: 0 },
                { name: "Leg Press", sets: 3, reps: 15, weight: 0 },
                { name: "Lunges", sets: 3, reps: 15, weight: 0 },
                { name: "Leg Curls", sets: 3, reps: 15, weight: 0 },
                { name: "Calf Raises", sets: 3, reps: 15, weight: 0 },
                { name: "Shoulder Press", sets: 3, reps: 15, weight: 0 },
                { name: "Lateral Raises", sets: 3, reps: 15, weight: 0 },
                { name: "Front Raises", sets: 3, reps: 15, weight: 0 },
                { name: "Rear Delt Fly", sets: 3, reps: 15, weight: 0 },
                { name: "Shrugs", sets: 3, reps: 15, weight: 0 },
                { name: "Eliptik Bisiklet", sets: 1, reps: "dakika", weight: 0, isCardio: true }
            ]
        },
        {
            day: 4,
            name: "Kardiyo & Abs",
            image: "https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop",
            exercises: [
                { name: "Treadmill", sets: 1, reps: "dakika", weight: 0, isCardio: true },
                { name: "Eliptik Bisiklet", sets: 1, reps: "dakika", weight: 0, isCardio: true },
                { name: "Stationary Bike", sets: 1, reps: "dakika", weight: 0, isCardio: true },
                { name: "Crunches", sets: 3, reps: 15, weight: 0 },
                { name: "Plank", sets: 3, reps: "saniye", weight: 0 },
                { name: "Russian Twists", sets: 3, reps: 15, weight: 0 },
                { name: "Leg Raises", sets: 3, reps: 15, weight: 0 },
                { name: "Mountain Climbers", sets: 3, reps: 15, weight: 0 },
                { name: "Bicycle Crunches", sets: 3, reps: 15, weight: 0 },
                { name: "Dead Bug", sets: 3, reps: 15, weight: 0 },
                { name: "Side Plank", sets: 3, reps: "saniye", weight: 0 }
            ]
        }
    ];
    
    displayWorkoutProgram(workoutProgram);
}

function displayWorkoutProgram(program) {
    const accordion = document.getElementById('workoutAccordion');
    accordion.innerHTML = '';
    
    program.forEach((workout, index) => {
        const isCurrentDay = (index + 1) === currentWorkoutDay;
        const workoutState = getWorkoutState(workout.day);
        const isCompleted = workoutState.completed;
        
        const workoutCard = document.createElement('div');
        workoutCard.className = `workout-day-card ${isCompleted ? 'completed' : ''}`;
        
        const completedExercises = workoutState.exercises.filter(ex => ex.completed).length;
        const totalExercises = workout.exercises.length;
        const progressPercentage = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;
        
        workoutCard.innerHTML = `
            <div class="workout-day-header" onclick="toggleWorkoutDay(${index})">
                <div class="workout-day-image">
                    <img src="${workout.image}" alt="${workout.name}">
                </div>
                <div class="workout-day-overlay">
                    <div class="workout-day-title">
                        <h3>${workout.name}</h3>
                        <p>${workout.exercises.length} Hareket</p>
                    </div>
                    <div class="progress-circle" style="background: conic-gradient(#69f0ae ${progressPercentage * 3.6}deg, rgba(255,255,255,0.1) ${progressPercentage * 3.6}deg)">
                        <span>${progressPercentage}%</span>
                    </div>
                </div>
            </div>
            <div class="workout-day-content" id="workout-content-${index}">
                ${generateExerciseList(workout.exercises, workout.day)}
                <div class="add-exercise-section">
                    <div class="add-exercise-form">
                        <input type="text" id="newExercise-${workout.day}" placeholder="Yeni hareket ekle...">
                        <button class="add-exercise-btn" onclick="addCustomExercise(${workout.day})">
                            <i class="fas fa-plus"></i> Ekle
                        </button>
                    </div>
                </div>
                <div class="finish-workout-section">
                    <button class="finish-workout-btn" onclick="finishWorkout(${workout.day})">
                        <i class="fas fa-check"></i> Antrenmanı Tamamla
                    </button>
                </div>
            </div>
        `;
        
        accordion.appendChild(workoutCard);
    });
}

function generateExerciseList(exercises, day) {
    const workoutState = getWorkoutState(day);
    
    return exercises.map((exercise, index) => {
        const exerciseState = workoutState.exercises[index] || { completed: false, weight: 0 };
        const isCardio = exercise.isCardio;
        const weightLabel = isCardio ? 'dakika' : 'kg';
        const repsText = exercise.reps === 'dakika' ? 'dakika' : exercise.reps === 'saniye' ? 'saniye' : `${exercise.reps} tekrar`;
        
        return `
            <div class="exercise-item-modern">
                <div class="exercise-checkbox">
                    <input type="checkbox" id="exercise-${day}-${index}" 
                           ${exerciseState.completed ? 'checked' : ''} 
                           onchange="toggleExercise(${day}, ${index})">
                </div>
                <div class="exercise-info">
                    <div class="exercise-name" onclick="showExerciseModal('${exercise.name}')">
                        ${exercise.name}
                    </div>
                    <div class="exercise-details">
                        ${exercise.sets} set × ${repsText}
                    </div>
                </div>
                <input type="number" class="weight-input" 
                       placeholder="${weightLabel}" 
                       value="${exerciseState.weight || ''}"
                       onchange="updateExerciseWeight(${day}, ${index}, this.value)">
            </div>
        `;
    }).join('');
}

function toggleWorkoutDay(index) {
    const content = document.getElementById(`workout-content-${index}`);
    const isActive = content.classList.contains('active');
    
    // Close all workout contents
    document.querySelectorAll('.workout-day-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Toggle current content
    if (!isActive) {
        content.classList.add('active');
    }
}

function toggleExercise(day, exerciseIndex) {
    const checkbox = document.getElementById(`exercise-${day}-${exerciseIndex}`);
    const workoutState = getWorkoutState(day);
    
    if (!workoutState.exercises[exerciseIndex]) {
        workoutState.exercises[exerciseIndex] = { completed: false, weight: 0 };
    }
    
    workoutState.exercises[exerciseIndex].completed = checkbox.checked;
    saveWorkoutState(day, workoutState);
    
    // Update progress circle
    updateWorkoutProgress(day);
    
    // Calculate calories if exercise is completed
    if (checkbox.checked) {
        const caloriesBurned = calculateExerciseCalories();
        const currentCalories = parseInt(document.getElementById('caloriesBurnedValue').textContent);
        document.getElementById('caloriesBurnedValue').textContent = currentCalories + caloriesBurned;
        updateProgressBars();
        saveDailyData();
    }
}

function updateExerciseWeight(day, exerciseIndex, weight) {
    const workoutState = getWorkoutState(day);
    
    if (!workoutState.exercises[exerciseIndex]) {
        workoutState.exercises[exerciseIndex] = { completed: false, weight: 0 };
    }
    
    workoutState.exercises[exerciseIndex].weight = parseFloat(weight) || 0;
    saveWorkoutState(day, workoutState);
}

function updateWorkoutProgress(day) {
    const workoutState = getWorkoutState(day);
    const totalExercises = document.querySelectorAll(`input[id^="exercise-${day}-"]`).length;
    const completedExercises = workoutState.exercises.filter(ex => ex.completed).length;
    const progressPercentage = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;
    
    // Find and update the progress circle for this day
    const workoutCards = document.querySelectorAll('.workout-day-card');
    const currentCard = workoutCards[day - 1];
    if (currentCard) {
        const progressCircle = currentCard.querySelector('.progress-circle');
        const progressSpan = progressCircle.querySelector('span');
        
        progressCircle.style.background = `conic-gradient(#69f0ae ${progressPercentage * 3.6}deg, rgba(255,255,255,0.1) ${progressPercentage * 3.6}deg)`;
        progressSpan.textContent = `${progressPercentage}%`;
    }
}

function addCustomExercise(day) {
    const input = document.getElementById(`newExercise-${day}`);
    const exerciseName = input.value.trim();
    
    if (exerciseName) {
        // Add to workout state
        const workoutState = getWorkoutState(day);
        const newExercise = {
            name: exerciseName,
            sets: 3,
            reps: 15,
            weight: 0,
            completed: false
        };
        
        // Add to exercises array in localStorage
        const customExercises = JSON.parse(localStorage.getItem(`customExercises_${day}`)) || [];
        customExercises.push(newExercise);
        localStorage.setItem(`customExercises_${day}`, JSON.stringify(customExercises));
        
        input.value = '';
        
        // Refresh workout display
        initializeWorkoutProgram();
        showNotification('Yeni hareket eklendi!');
    }
}

function finishWorkout(day) {
    const workoutState = getWorkoutState(day);
    workoutState.completed = true;
    workoutState.completedDate = new Date().toISOString();
    saveWorkoutState(day, workoutState);
    
    // Save workout to history
    saveWorkoutHistory(day, workoutState);
    
    // Mark workout card as completed
    const workoutCards = document.querySelectorAll('.workout-day-card');
    const currentCard = workoutCards[day - 1];
    if (currentCard) {
        currentCard.classList.add('completed');
    }
    
    // Check if this is day 3 and start reset timer
    if (day === 3) {
        startWorkoutCycleResetTimer();
    }
    
    showNotification(`${day}. gün antrenmanı tamamlandı!`);
}

function startWorkoutCycleResetTimer() {
    // Clear existing timer
    if (workoutCycleResetTimer) {
        clearTimeout(workoutCycleResetTimer);
    }
    
    // Set 1 hour timer (3600000 ms)
    workoutCycleResetTimer = setTimeout(() => {
        resetWorkoutCycle();
    }, 3600000); // 1 hour
    
    // Save timer state
    const timerState = {
        startTime: Date.now(),
        duration: 3600000
    };
    localStorage.setItem('workoutCycleTimer', JSON.stringify(timerState));
    
    showNotification('3 günlük döngü tamamlandı! 1 saat sonra sıfırlanacak.');
}

function resetWorkoutCycle() {
    // Reset workout states for days 1-3
    for (let day = 1; day <= 3; day++) {
        localStorage.removeItem(`workoutState_${day}`);
    }
    
    // Reset current workout day
    currentWorkoutDay = 1;
    localStorage.setItem('currentWorkoutDay', '1');
    
    // Clear timer
    localStorage.removeItem('workoutCycleTimer');
    workoutCycleResetTimer = null;
    
    // Refresh workout display
    initializeWorkoutProgram();
    
    showNotification('Antrenman döngüsü sıfırlandı! Yeni döngü başlıyor.');
}

function loadWorkoutCycleState() {
    // Load current workout day
    const savedDay = localStorage.getItem('currentWorkoutDay');
    if (savedDay) {
        currentWorkoutDay = parseInt(savedDay);
    }
    
    // Check if there's an active timer
    const timerState = localStorage.getItem('workoutCycleTimer');
    if (timerState) {
        const timer = JSON.parse(timerState);
        const elapsed = Date.now() - timer.startTime;
        const remaining = timer.duration - elapsed;
        
        if (remaining > 0) {
            // Timer is still active
            workoutCycleResetTimer = setTimeout(() => {
                resetWorkoutCycle();
            }, remaining);
        } else {
            // Timer has expired, reset immediately
            resetWorkoutCycle();
        }
    }
}

function getWorkoutState(day) {
    const saved = localStorage.getItem(`workoutState_${day}`);
    if (saved) {
        return JSON.parse(saved);
    }
    
    // Return default state
    return {
        completed: false,
        exercises: []
    };
}

function saveWorkoutState(day, state) {
    localStorage.setItem(`workoutState_${day}`, JSON.stringify(state));
}

function calculateExerciseCalories() {
    // Approximate calories burned per exercise (varies by intensity)
    return Math.floor(Math.random() * 15) + 10; // 10-25 calories per exercise
}

// Exercise modal
function showExerciseModal(exerciseName) {
    // Create modal HTML
    const modal = document.createElement('div');
    modal.className = 'exercise-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${exerciseName}</h3>
                <button class="close-btn" onclick="closeExerciseModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="exercise-gif">
                    <img src="https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop" alt="${exerciseName}">
                </div>
                <div class="exercise-description">
                    <h4>Nasıl Yapılır?</h4>
                    <p>Bu hareket için doğru form ve teknik çok önemlidir. Hareketi yavaş ve kontrollü bir şekilde yapın. Nefes alış verişinize dikkat edin ve kaslarınızı hissedin.</p>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Show modal with animation
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

function closeExerciseModal() {
    const modal = document.querySelector('.exercise-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 300);
    }
}

// Nutrition functions
function initializeFoodDatabase() {
    const foodDatabase = {
        "Tavuk Göğsü": { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
        "Pirinç": { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
        "Brokoli": { calories: 34, protein: 2.8, carbs: 7, fat: 0.4 },
        "Yumurta": { calories: 155, protein: 13, carbs: 1.1, fat: 11 },
        "Avokado": { calories: 160, protein: 2, carbs: 9, fat: 15 },
        "Somon": { calories: 208, protein: 20, carbs: 0, fat: 12 },
        "Kinoa": { calories: 120, protein: 4.4, carbs: 22, fat: 1.9 },
        "Badem": { calories: 579, protein: 21, carbs: 22, fat: 50 },
        "Yoğurt": { calories: 59, protein: 10, carbs: 3.6, fat: 0.4 },
        "Muz": { calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
        "Elma": { calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
        "Ekmek": { calories: 265, protein: 9, carbs: 49, fat: 3.2 },
        "Makarna": { calories: 131, protein: 5, carbs: 25, fat: 1.1 },
        "Peynir": { calories: 113, protein: 7, carbs: 1, fat: 9 },
        "Süt": { calories: 42, protein: 3.4, carbs: 5, fat: 1 }
    };
    
    // Populate datalist
    const datalist = document.getElementById('foodNames');
    datalist.innerHTML = '';
    
    Object.keys(foodDatabase).forEach(food => {
        const option = document.createElement('option');
        option.value = food;
        datalist.appendChild(option);
    });
    
    // Store in localStorage for easy access
    localStorage.setItem('foodDatabase', JSON.stringify(foodDatabase));
}

// Form submissions
document.getElementById('foodForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const category = document.getElementById('foodCategory').value;
    const foodName = document.getElementById('foodName').value;
    const grams = parseFloat(document.getElementById('foodGram').value);
    
    if (category && foodName && grams) {
        addFood(category, foodName, grams);
        this.reset();
    }
});

function addFood(category, foodName, grams) {
    const foodDatabase = JSON.parse(localStorage.getItem('foodDatabase')) || {};
    const foodData = foodDatabase[foodName] || { calories: 100, protein: 5, carbs: 15, fat: 3 };
    
    // Calculate nutrition based on grams
    const multiplier = grams / 100;
    const nutrition = {
        calories: Math.round(foodData.calories * multiplier),
        protein: Math.round(foodData.protein * multiplier * 10) / 10,
        carbs: Math.round(foodData.carbs * multiplier * 10) / 10,
        fat: Math.round(foodData.fat * multiplier * 10) / 10
    };
    
    // Save to today's nutrition
    const today = new Date().toDateString();
    const todayNutrition = JSON.parse(localStorage.getItem(`nutrition_${today}`)) || [];
    
    const foodEntry = {
        category,
        name: foodName,
        grams,
        nutrition,
        time: new Date().toLocaleTimeString('tr-TR')
    };
    
    todayNutrition.push(foodEntry);
    localStorage.setItem(`nutrition_${today}`, JSON.stringify(todayNutrition));
    
    // Update calories eaten
    const currentCalories = parseInt(document.getElementById('caloriesEatenValue').textContent);
    document.getElementById('caloriesEatenValue').textContent = currentCalories + nutrition.calories;
    
    updateProgressBars();
    saveDailyData();
    displayNutritionHistory();
    showNotification(`${foodName} eklendi! ${nutrition.calories} kalori`);
}

function displayNutritionHistory() {
    const nutritionReport = document.getElementById('nutritionReport');
    const today = new Date().toDateString();
    const todayNutrition = JSON.parse(localStorage.getItem(`nutrition_${today}`)) || [];
    
    if (todayNutrition.length === 0) {
        nutritionReport.innerHTML = '<p>Bugün henüz besin eklenmemiş.</p>';
        return;
    }
    
    // Group by category
    const categories = {};
    let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
    
    todayNutrition.forEach(food => {
        if (!categories[food.category]) {
            categories[food.category] = [];
        }
        categories[food.category].push(food);
        
        totalCalories += food.nutrition.calories;
        totalProtein += food.nutrition.protein;
        totalCarbs += food.nutrition.carbs;
        totalFat += food.nutrition.fat;
    });
    
    let html = '';
    
    Object.keys(categories).forEach(category => {
        html += `<h5>${category}</h5><ul>`;
        categories[category].forEach((food, index) => {
            html += `
                <li>
                    <div class="food-item-details">
                        <div class="food-name">${food.name} (${food.grams}g) - ${food.time}</div>
                        <div class="food-macros">
                            <span class="calories">${food.nutrition.calories} kcal</span>
                            <span class="protein">P: ${food.nutrition.protein}g</span>
                            <span class="carbs">K: ${food.nutrition.carbs}g</span>
                            <span class="fat">Y: ${food.nutrition.fat}g</span>
                        </div>
                    </div>
                    <button class="remove-food-btn" onclick="removeFood('${category}', ${index})">Sil</button>
                </li>
            `;
        });
        html += '</ul>';
    });
    
    // Add daily totals
    html += `
        <div class="daily-totals">
            <div class="total-item">
                <span class="total-label">Toplam Kalori:</span>
                <span class="total-value">${totalCalories} kcal</span>
            </div>
            <div class="total-item">
                <span class="total-label">Toplam Protein:</span>
                <span class="total-value">${totalProtein.toFixed(1)}g</span>
            </div>
            <div class="total-item">
                <span class="total-label">Toplam Karbonhidrat:</span>
                <span class="total-value">${totalCarbs.toFixed(1)}g</span>
            </div>
            <div class="total-item">
                <span class="total-label">Toplam Yağ:</span>
                <span class="total-value">${totalFat.toFixed(1)}g</span>
            </div>
        </div>
    `;
    
    nutritionReport.innerHTML = html;
}

function removeFood(category, index) {
    const today = new Date().toDateString();
    const todayNutrition = JSON.parse(localStorage.getItem(`nutrition_${today}`)) || [];
    
    // Find and remove the food item
    const categoryItems = todayNutrition.filter(food => food.category === category);
    const foodToRemove = categoryItems[index];
    
    if (foodToRemove) {
        // Remove calories from daily total
        const currentCalories = parseInt(document.getElementById('caloriesEatenValue').textContent);
        document.getElementById('caloriesEatenValue').textContent = Math.max(0, currentCalories - foodToRemove.nutrition.calories);
        
        // Remove from array
        const foodIndex = todayNutrition.indexOf(foodToRemove);
        todayNutrition.splice(foodIndex, 1);
        
        localStorage.setItem(`nutrition_${today}`, JSON.stringify(todayNutrition));
        
        updateProgressBars();
        saveDailyData();
        displayNutritionHistory();
        showNotification('Besin silindi!');
    }
}

// Progress tracking
document.getElementById('progressForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const date = document.getElementById('progressDate').value;
    const weight = parseFloat(document.getElementById('weight').value);
    const chest = parseFloat(document.getElementById('chest').value);
    const waist = parseFloat(document.getElementById('waist').value);
    const biceps = parseFloat(document.getElementById('biceps').value);
    const shoulder = parseFloat(document.getElementById('shoulder').value);
    const leg = parseFloat(document.getElementById('leg').value);
    
    if (date && weight && chest && waist && biceps && shoulder && leg) {
        const progressEntry = {
            date,
            weight,
            chest,
            waist,
            biceps,
            shoulder,
            leg,
            timestamp: new Date().toISOString()
        };
        
        // Save progress
        const allProgress = JSON.parse(localStorage.getItem('progressHistory')) || [];
        
        // Remove existing entry for the same date
        const filteredProgress = allProgress.filter(entry => entry.date !== date);
        filteredProgress.push(progressEntry);
        
        // Sort by date
        filteredProgress.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        localStorage.setItem('progressHistory', JSON.stringify(filteredProgress));
        
        displayProgressHistory();
        updateProgressChart();
        showNotification('Gelişim kaydı eklendi!');
        this.reset();
        document.getElementById('progressDate').valueAsDate = new Date();
    }
});

function displayProgressHistory() {
    const progressList = document.getElementById('progressList');
    const allProgress = JSON.parse(localStorage.getItem('progressHistory')) || [];
    
    if (allProgress.length === 0) {
        progressList.innerHTML = '<p>Henüz gelişim kaydı eklenmemiş.</p>';
        return;
    }
    
    let html = '<ul>';
    allProgress.reverse().forEach(entry => {
        html += `
            <li>
                <strong>${new Date(entry.date).toLocaleDateString('tr-TR')}</strong><br>
                Kilo: ${entry.weight}kg, Göğüs: ${entry.chest}cm, Bel: ${entry.waist}cm<br>
                Kol: ${entry.biceps}cm, Omuz: ${entry.shoulder}cm, Bacak: ${entry.leg}cm
            </li>
        `;
    });
    html += '</ul>';
    
    progressList.innerHTML = html;
}

// History functions
function saveWorkoutHistory(day, workoutState) {
    const today = new Date().toDateString();
    const workoutHistory = JSON.parse(localStorage.getItem('workoutHistory')) || [];
    
    const workoutEntry = {
        date: today,
        day: day,
        exercises: workoutState.exercises,
        completedDate: workoutState.completedDate
    };
    
    workoutHistory.push(workoutEntry);
    localStorage.setItem('workoutHistory', JSON.stringify(workoutHistory));
}

function saveStepHistory(steps, calories) {
    const today = new Date().toDateString();
    const stepHistory = JSON.parse(localStorage.getItem('stepHistory')) || [];
    
    const stepEntry = {
        date: today,
        steps: steps,
        calories: calories,
        time: new Date().toLocaleTimeString('tr-TR')
    };
    
    stepHistory.push(stepEntry);
    localStorage.setItem('stepHistory', JSON.stringify(stepHistory));
}

function saveWaterHistory(amount) {
    const today = new Date().toDateString();
    const waterHistory = JSON.parse(localStorage.getItem('waterHistory')) || [];
    
    const waterEntry = {
        date: today,
        amount: amount,
        time: new Date().toLocaleTimeString('tr-TR')
    };
    
    waterHistory.push(waterEntry);
    localStorage.setItem('waterHistory', JSON.stringify(waterHistory));
}

function displayWorkoutHistory() {
    const historyList = document.getElementById('historyList');
    const workoutHistory = JSON.parse(localStorage.getItem('workoutHistory')) || [];
    
    if (workoutHistory.length === 0) {
        historyList.innerHTML = '<p>Henüz antrenman geçmişi yok.</p>';
        return;
    }
    
    // Group by date
    const groupedHistory = {};
    workoutHistory.forEach(workout => {
        if (!groupedHistory[workout.date]) {
            groupedHistory[workout.date] = [];
        }
        groupedHistory[workout.date].push(workout);
    });
    
    let html = '';
    Object.keys(groupedHistory).reverse().forEach(date => {
        html += `
            <div class="history-day-card">
                <div class="history-day-header" onclick="toggleHistoryDay('${date}')">
                    <div class="history-date">
                        <h4>${new Date(date).toLocaleDateString('tr-TR')}</h4>
                        <p>${groupedHistory[date].length} antrenman</p>
                    </div>
                    <div class="history-arrow">
                        <i class="fas fa-chevron-down"></i>
                    </div>
                </div>
                <div class="history-day-content" id="history-${date}">
                    ${groupedHistory[date].map(workout => `
                        <div class="workout-detail">
                            <h5>Gün ${workout.day} Antrenmanı</h5>
                            <p>Tamamlanma: ${new Date(workout.completedDate).toLocaleString('tr-TR')}</p>
                            <div class="exercise-list">
                                <h6>Yapılan Hareketler:</h6>
                                <ul>
                                    ${workout.exercises.filter(ex => ex.completed).map(ex => 
                                        `<li>${ex.name || 'Hareket'} - ${ex.weight || 0}kg</li>`
                                    ).join('')}
                                </ul>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });
    
    historyList.innerHTML = html;
}

function displayWaterHistory() {
    const waterHistoryList = document.getElementById('waterHistoryList');
    const waterHistory = JSON.parse(localStorage.getItem('waterHistory')) || [];
    
    if (waterHistory.length === 0) {
        waterHistoryList.innerHTML = '<p>Henüz su geçmişi yok.</p>';
        return;
    }
    
    // Group by date
    const groupedHistory = {};
    waterHistory.forEach(entry => {
        if (!groupedHistory[entry.date]) {
            groupedHistory[entry.date] = [];
        }
        groupedHistory[entry.date].push(entry);
    });
    
    let html = '';
    Object.keys(groupedHistory).reverse().forEach(date => {
        const dayTotal = groupedHistory[date].reduce((sum, entry) => sum + entry.amount, 0);
        
        html += `
            <div class="water-day-card">
                <div class="water-day-header" onclick="toggleWaterDay('${date}')">
                    <div class="water-date">
                        <h4>${new Date(date).toLocaleDateString('tr-TR')}</h4>
                        <p>Toplam: ${dayTotal.toFixed(1)}L</p>
                    </div>
                    <div class="water-arrow">
                        <i class="fas fa-chevron-down"></i>
                    </div>
                </div>
                <div class="water-day-content" id="water-${date}">
                    <ul>
                        ${groupedHistory[date].map(entry => 
                            `<li>${entry.time} -  ${entry.amount}L su içildi</li>`
                        ).join('')}
                    </ul>
                </div>
            </div>
        `;
    });
    
    waterHistoryList.innerHTML = html;
}

function displayStepHistory() {
    const stepHistoryList = document.getElementById('stepHistoryList');
    const stepHistory = JSON.parse(localStorage.getItem('stepHistory')) || [];
    
    if (stepHistory.length === 0) {
        stepHistoryList.innerHTML = '<p>Henüz adım geçmişi yok.</p>';
        return;
    }
    
    // Group by date
    const groupedHistory = {};
    stepHistory.forEach(entry => {
        if (!groupedHistory[entry.date]) {
            groupedHistory[entry.date] = [];
        }
        groupedHistory[entry.date].push(entry);
    });
    
    let html = '';
    Object.keys(groupedHistory).reverse().forEach(date => {
        const dayTotalSteps = groupedHistory[date].reduce((sum, entry) => sum + entry.steps, 0);
        const dayTotalCalories = groupedHistory[date].reduce((sum, entry) => sum + entry.calories, 0);
        
        html += `
            <div class="step-day-card">
                <div class="step-day-header" onclick="toggleStepDay('${date}')">
                    <div class="step-date">
                        <h4>${new Date(date).toLocaleDateString('tr-TR')}</h4>
                        <p>Toplam: ${dayTotalSteps.toLocaleString()} adım, ${dayTotalCalories} kalori</p>
                    </div>
                    <div class="step-arrow">
                        <i class="fas fa-chevron-down"></i>
                    </div>
                </div>
                <div class="step-day-content" id="step-${date}">
                    <ul>
                        ${groupedHistory[date].map(entry => 
                            `<li>${entry.time} - ${entry.steps.toLocaleString()} adım (+${entry.calories} kalori)</li>`
                        ).join('')}
                    </ul>
                </div>
            </div>
        `;
    });
    
    stepHistoryList.innerHTML = html;
}

// Toggle functions for history accordions
function toggleHistoryDay(date) {
    const content = document.getElementById(`history-${date}`);
    const arrow = content.parentElement.querySelector('.history-arrow i');
    
    content.classList.toggle('active');
    arrow.classList.toggle('rotated');
}

function toggleWaterDay(date) {
    const content = document.getElementById(`water-${date}`);
    const arrow = content.parentElement.querySelector('.water-arrow i');
    
    content.classList.toggle('active');
    arrow.classList.toggle('rotated');
}

function toggleStepDay(date) {
    const content = document.getElementById(`step-${date}`);
    const arrow = content.parentElement.querySelector('.step-arrow i');
    
    content.classList.toggle('active');
    arrow.classList.toggle('rotated');
}

// Calorie breakdown modals
function showCaloriesBurnedBreakdown() {
    const modal = document.createElement('div');
    modal.className = 'calorie-modal';
    
    const totalBurned = parseInt(document.getElementById('caloriesBurnedValue').textContent);
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Yakılan Kalori Detayı</h3>
                <button class="close-btn" onclick="closeCalorieModal()">&times;</button>
            </div>
            <div class="modal-body">
                <h4>Toplam Yakılan: ${totalBurned} kalori</h4>
                <p>Bu kaloriler şu aktivitelerden geldi:</p>
                <ul>
                    <li>Antrenman hareketleri: ~${Math.round(totalBurned * 0.7)} kalori</li>
                    <li>Adım atma: ~${Math.round(totalBurned * 0.3)} kalori</li>
                </ul>
                <p><small>* Kalori hesaplamaları yaklaşık değerlerdir.</small></p>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
}

function showCaloriesEatenBreakdown() {
    const modal = document.createElement('div');
    modal.className = 'calorie-modal';
    
    const totalEaten = parseInt(document.getElementById('caloriesEatenValue').textContent);
    const today = new Date().toDateString();
    const todayNutrition = JSON.parse(localStorage.getItem(`nutrition_${today}`)) || [];
    
    let breakdown = '<ul>';
    if (todayNutrition.length > 0) {
        const categories = {};
        todayNutrition.forEach(food => {
            if (!categories[food.category]) {
                categories[food.category] = 0;
            }
            categories[food.category] += food.nutrition.calories;
        });
        
        Object.keys(categories).forEach(category => {
            breakdown += `<li>${category}: ${categories[category]} kalori</li>`;
        });
    } else {
        breakdown += '<li>Henüz besin eklenmemiş</li>';
    }
    breakdown += '</ul>';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Alınan Kalori Detayı</h3>
                <button class="close-btn" onclick="closeCalorieModal()">&times;</button>
            </div>
            <div class="modal-body">
                <h4>Toplam Alınan: ${totalEaten} kalori</h4>
                <p>Bu kaloriler şu kategorilerden geldi:</p>
                ${breakdown}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
}

function closeCalorieModal() {
    const modal = document.querySelector('.calorie-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => document.body.removeChild(modal), 300);
    }
}

// Chart functions
function updateDashboardChart() {
    const ctx = document.getElementById('dashboardChart').getContext('2d');
    
    // Get last 7 days data
    const last7Days = [];
    const caloriesData = [];
    const stepsData = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toDateString();
        
        last7Days.push(date.toLocaleDateString('tr-TR', { weekday: 'short' }));
        
        const dailyData = JSON.parse(localStorage.getItem(`dailyData_${dateString}`)) || {
            caloriesBurned: 0,
            stepsTaken: 0
        };
        
        caloriesData.push(dailyData.caloriesBurned);
        stepsData.push(Math.round(dailyData.stepsTaken / 1000)); // Steps in thousands
    }
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: last7Days,
            datasets: [{
                label: 'Yakılan Kalori',
                data: caloriesData,
                borderColor: '#64ffda',
                backgroundColor: 'rgba(100, 255, 218, 0.1)',
                tension: 0.4,
                fill: true
            }, {
                label: 'Adım (x1000)',
                data: stepsData,
                borderColor: '#bb86fc',
                backgroundColor: 'rgba(187, 134, 252, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: '#ffffff'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#b8c5d6'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    ticks: {
                        color: '#b8c5d6'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

function updateProgressChart() {
    const ctx = document.getElementById('progressChart').getContext('2d');
    const allProgress = JSON.parse(localStorage.getItem('progressHistory')) || [];
    
    if (allProgress.length === 0) {
        return;
    }
    
    const dates = allProgress.map(entry => new Date(entry.date).toLocaleDateString('tr-TR'));
    const weights = allProgress.map(entry => entry.weight);
    const chests = allProgress.map(entry => entry.chest);
    const waists = allProgress.map(entry => entry.waist);
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Kilo (kg)',
                data: weights,
                borderColor: '#ff6b9d',
                backgroundColor: 'rgba(255, 107, 157, 0.1)',
                tension: 0.4
            }, {
                label: 'Göğüs (cm)',
                data: chests,
                borderColor: '#64ffda',
                backgroundColor: 'rgba(100, 255, 218, 0.1)',
                tension: 0.4
            }, {
                label: 'Bel (cm)',
                data: waists,
                borderColor: '#69f0ae',
                backgroundColor: 'rgba(105, 240, 174, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: '#ffffff'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#b8c5d6'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    ticks: {
                        color: '#b8c5d6'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

// Notification system
function showNotification(message) {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create new notification
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Close mobile menu when clicking outside
document.addEventListener('click', function(e) {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.querySelector('.mobile-menu-toggle');
    
    if (window.innerWidth <= 768 && 
        !sidebar.contains(e.target) && 
        !toggle.contains(e.target) && 
        sidebar.classList.contains('mobile-open')) {
        closeMobileMenu();
    }
});

// Handle window resize
window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
        // Desktop view - ensure sidebar is visible and mobile menu is closed
        const sidebar = document.getElementById('sidebar');
        const overlay = document.querySelector('.mobile-overlay');
        
        sidebar.classList.remove('mobile-open');
        overlay.classList.remove('active');
    }
});
