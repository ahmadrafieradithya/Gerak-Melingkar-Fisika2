       // Global variables
        let currentSection = 'home';
        let simulationRunning = false;
        let animationId;
        let gameScore = 0;
        let formulaScore = 0;
        let quizScore = 0;
        let currentQuizQuestion = 0;
        let selectedAnswer = null;
        let quizData = [];
        let gameAnswer = 0;
        let currentMode = 'gmb';

        // Quiz questions data
        const quizQuestions = [
            {
                question: "Sebuah benda bermassa 2 kg bergerak melingkar dengan jari-jari 0,5 m dan kecepatan 4 m/s. Berapakah gaya sentripetal yang bekerja pada benda tersebut?",
                options: ["32 N", "64 N", "16 N", "8 N"],
                correct: 1,
                explanation: "Menggunakan rumus F_s = mv²/r = (2)(4²)/0,5 = 64 N",
                difficulty: "mudah"
            },
            {
                question: "Jika kecepatan linear benda yang bergerak melingkar menjadi 2 kali lipat, maka percepatan sentripetalnya akan...",
                options: ["Tetap sama", "Menjadi 2 kali lipat", "Menjadi 4 kali lipat", "Menjadi 1/2 kali"],
                correct: 2,
                explanation: "Karena a_s = v²/r, jika v menjadi 2v, maka a_s menjadi (2v)²/r = 4v²/r = 4 kali lipat",
                difficulty: "sedang"
            },
            {
                question: "Periode gerak melingkar beraturan didefinisikan sebagai...",
                options: ["Waktu untuk menempuh 1/2 putaran", "Waktu untuk menempuh 1 putaran penuh", "Jumlah putaran per detik", "Kecepatan sudut maksimum"],
                correct: 1,
                explanation: "Periode (T) adalah waktu yang diperlukan untuk menempuh satu putaran penuh",
                difficulty: "mudah"
            }
        ];

        // Quick quiz (Kuis Kilat) pool and state
        const quickQuizPool = [
            {
                question: "Jika jari-jari orbit bertambah 2 kali, maka gaya sentripetal akan...",
                options: ["A. Bertambah 2 kali", "B. Berkurang 1/2 kali", "C. Tetap sama", "D. Bertambah 4 kali"],
                correct: 1,
                explanation: "Benar: F = mv²/r, berbanding terbalik dengan r sehingga jika r 2x, F berkurang 1/2x."
            },
            {
                question: "Sebuah benda bergerak dengan v = 4 m/s pada r = 2 m. Berapakah percepatan sentripetal?",
                options: ["A. 4 m/s²", "B. 8 m/s²", "C. 16 m/s²", "D. 2 m/s²"],
                correct: 1,
                explanation: "a = v²/r = 4² / 2 = 16 / 2 = 8 m/s²."
            },
            {
                question: "Periode adalah...",
                options: ["A. Frekuensi per detik", "B. Waktu untuk 1 putaran penuh", "C. Kecepatan sudut", "D. Jari-jari lingkaran"],
                correct: 1,
                explanation: "Periode (T) adalah waktu yang diperlukan untuk satu putaran penuh."
            },
            {
                question: "Rumus kecepatan linear v dalam gerak melingkar adalah...",
                options: ["A. v = ω / r", "B. v = ω r", "C. v = r / ω", "D. v = 2π r²"],
                correct: 1,
                explanation: "v = ω r adalah hubungan antara kecepatan linear dan sudut."
            },
            {
                question: "Jika ω = 2π rad/s dan r = 0.5 m, maka v = ?",
                options: ["A. π m/s", "B. 2π m/s", "C. 1 m/s", "D. 0.5π m/s"],
                correct: 0,
                explanation: "v = ω r = 2π * 0.5 = π m/s."
            },
            {
                question: "Gaya sentripetal bergantung pada...",
                options: ["A. Massa dan percepatan", "B. Hanya massa", "C. Hanya kecepatan", "D. Suhu"],
                correct: 0,
                explanation: "F = m a_c, sehingga bergantung pada massa dan percepatan."
            }
        ];

        let quickAsked = new Set();
        let quickAnsweredCount = 0;
        let quickCorrectCount = 0;
        const quickMax = 5; // jumlah soal yang harus dijawab
        let currentQuickIndex = null;

        // Initialize
        function startApp() {
            const welcome = document.getElementById('welcomeScreen');
            if (welcome) welcome.style.display = 'none';

            // Tampilkan section awal
            if (typeof showSection === 'function') showSection('home');

            // Panggil inisialisasi yang hanya perlu berjalan setelah klik Mulai
            if (typeof initializeSimulation === 'function') initializeSimulation();
            if (typeof newGame === 'function') newGame();

            if (window.MathJax) {
                MathJax.typesetPromise();
            }
        }

        document.addEventListener('DOMContentLoaded', function () {
            showSection('home');
            initializeSimulation();
            newGame();
            loadQuickQuestion();
            if (window.MathJax) {
                MathJax.typesetPromise();
            }
        });

        // Navigation functions
        function showSection(sectionName) {
            // Hide all sections
            const sections = ['home', 'materi', 'simulasi', 'game', 'kuis', 'eksperimen', 'tentang'];
            sections.forEach(section => {
                const element = document.getElementById(section);
                if (element) {
                    element.classList.add('section-hidden');
                }
            });

            // Show selected section
            const targetSection = document.getElementById(sectionName);
            if (targetSection) {
                targetSection.classList.remove('section-hidden');
            }

            // Update navigation
            updateNavigation(sectionName);
            currentSection = sectionName;

            // Re-render MathJax if needed
            if (window.MathJax && sectionName === 'materi') {
                MathJax.typesetPromise();
            }
        }

        function updateNavigation(activeSection) {
            // Update desktop navigation
            const navButtons = document.querySelectorAll('nav button');
            navButtons.forEach(button => {
                button.className = 'nav-item px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100';
            });

            // Set active button
            const activeButton = document.querySelector(`nav button[onclick="showSection('${activeSection}')"]`);
            if (activeButton) {
                activeButton.className = 'nav-item px-4 py-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200';
            }
        }

        function toggleMobileMenu() {
            const mobileMenu = document.getElementById('mobileMenu');
            mobileMenu.classList.toggle('hidden');
        }

        // Materi tab functions
        function showTab(tabName) {
            // Hide all tab contents
            const tabContents = ['konsep-content', 'rumus-content', 'contoh-content'];
            tabContents.forEach(content => {
                const element = document.getElementById(content);
                if (element) {
                    element.classList.add('hidden');
                }
            });

            // Show selected tab content
            const targetContent = document.getElementById(tabName + '-content');
            if (targetContent) {
                targetContent.classList.remove('hidden');
            }

            // Update tab buttons
            const tabButtons = document.querySelectorAll('.tab-button');
            tabButtons.forEach(button => {
                button.className = 'tab-button px-6 py-3 rounded-lg bg-gray-200 text-gray-700 font-semibold';
            });

            const activeTab = document.getElementById('tab-' + tabName);
            if (activeTab) {
                activeTab.className = 'tab-button active px-6 py-3 rounded-lg bg-blue-500 text-white font-semibold';
            }

            // Re-render MathJax for formulas
            if (window.MathJax) {
                MathJax.typesetPromise();
            }
        }

        // Interactive content functions
        function showDefinition() {
            alert('Gerak melingkar adalah gerak suatu benda pada lintasan berbentuk lingkaran dengan jari-jari konstan. Percepatan sentripetal selalu mengarah ke pusat lingkaran dan menyebabkan perubahan arah kecepatan benda. Gaya sentripetal berperan sebagai penyebab munculnya percepatan sentripetal, sehingga benda dapat terus bergerak melingkar.');
        }

        function showExample(type) {
            const examples = {
                'roda': 'Roda kendaraan: Setiap titik pada roda bergerak melingkar saat kendaraan bergerak. Semakin cepat kendaraan, semakin besar kecepatan sudut roda.',
                'kipas': 'Kipas angin: Baling-baling kipas berputar dengan kecepatan sudut konstan, menciptakan aliran udara melalui gerak melingkar.',
                'satelit': 'Orbit satelit: Satelit bergerak mengelilingi Bumi dalam lintasan melingkar atau elips, dengan gaya gravitasi sebagai gaya sentripetal.',
                'jarum': 'Jarum jam: Jarum jam bergerak melingkar dengan periode yang berbeda - jarum detik (60s), menit (3600s), dan jam (43200s).'
            };
            alert(examples[type]);
        }

        function showSolution(problemNum) {
            const solution = document.getElementById('solution-' + problemNum);
            if (solution) {
                solution.classList.toggle('hidden');
                if (window.MathJax) {
                    MathJax.typesetPromise();
                }
            }
        }

        // Simulation functions
        function initializeSimulation() {
            const canvas = document.getElementById('simulationCanvas');
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            let angle = 0;

            function drawSimulation() {
                if (!simulationRunning) return;

                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;
                const radius = parseFloat(document.getElementById('radiusSlider').value) * 80; // Scale for display
                const omega = parseFloat(document.getElementById('omegaSlider').value);

                // Clear canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Draw orbit path
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                ctx.strokeStyle = '#e5e7eb';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.stroke();
                ctx.setLineDash([]);

                // Calculate position
                const x = centerX + radius * Math.cos(angle);
                const y = centerY + radius * Math.sin(angle);

                // Draw center
                ctx.beginPath();
                ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI);
                ctx.fillStyle = '#6366f1';
                ctx.fill();

                // Draw object
                ctx.beginPath();
                ctx.arc(x, y, 12, 0, 2 * Math.PI);
                ctx.fillStyle = '#ef4444';
                ctx.fill();

                // Draw velocity vector
                const velocityScale = 30;
                const vx = -omega * radius * Math.sin(angle) / 80 * velocityScale;
                const vy = omega * radius * Math.cos(angle) / 80 * velocityScale;

                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + vx, y + vy);
                ctx.strokeStyle = '#3b82f6';
                ctx.lineWidth = 3;
                ctx.stroke();

                // Draw centripetal force vector
                const forceScale = 20;
                const fx = -(x - centerX) / radius * forceScale;
                const fy = -(y - centerY) / radius * forceScale;
 
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + fx, y + fy);
                ctx.strokeStyle = '#10b981';
                ctx.lineWidth = 3;
                ctx.stroke();

                // Update angle based on mode
                if (currentMode === 'gmb') {
                    angle += omega * 0.02; // Constant angular velocity
                } else {
                    // GMTB - varying angular velocity
                    const alpha = 0.5; // Angular acceleration
                    omega += alpha * 0.02;
                    angle += omega * 0.02;
                    document.getElementById('omegaSlider').value = omega;
                    document.getElementById('omegaValue').textContent = omega.toFixed(1) + ' rad/s';
                }

                animationId = requestAnimationFrame(drawSimulation);
            }

            drawSimulation();
        }

        function updateSimulation() {
            const mass = parseFloat(document.getElementById('massSlider').value);
            const radius = parseFloat(document.getElementById('radiusSlider').value);
            const omega = parseFloat(document.getElementById('omegaSlider').value);

            // Update display values
            document.getElementById('massValue').textContent = mass.toFixed(1) + ' kg';
            document.getElementById('radiusValue').textContent = radius.toFixed(1) + ' m';
            document.getElementById('omegaValue').textContent = omega.toFixed(1) + ' rad/s';

            // Calculate results
            const velocity = omega * radius;
            const acceleration = omega * omega * radius;
            const force = mass * acceleration;
            const period = 2 * Math.PI / omega;

            // Update result displays
            document.getElementById('velocityResult').textContent = velocity.toFixed(2) + ' m/s';
            document.getElementById('accelerationResult').textContent = acceleration.toFixed(2) + ' m/s²';
            document.getElementById('forceResult').textContent = force.toFixed(2) + ' N';
            document.getElementById('periodResult').textContent = period.toFixed(2) + ' s';
        }

        function toggleSimulation() {
            const button = document.getElementById('playButton');
            if (simulationRunning) {
                simulationRunning = false;
                button.textContent = '▶ Mulai Simulasi';
                button.className = 'w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors';
                if (animationId) {
                    cancelAnimationFrame(animationId);
                }
            } else {
                simulationRunning = true;
                button.textContent = '⏸ Pause Simulasi';
                button.className = 'w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors';
                initializeSimulation();
            }
        }

        function setMode(mode) {
            currentMode = mode;

            // Update button styles
            const gmbButton = document.getElementById('gmbButton');
            const gmtbButton = document.getElementById('gmtbButton');

            if (mode === 'gmb') {
                gmbButton.className = 'bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600';
                gmtbButton.className = 'bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400';
                document.getElementById('modeDescription').textContent = 'Mode GMB: Kecepatan sudut konstan, benda bergerak dengan kecepatan linear tetap.';
            } else {
                gmbButton.className = 'bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400';
                gmtbButton.className = 'bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600';
                document.getElementById('modeDescription').textContent = 'Mode GMTB: Kecepatan sudut berubah (ada percepatan sudut), benda mengalami percepatan tangensial.';
            }
        }

        // Game functions
        function newGame() {
            gameAnswer = Math.random() * 4 + 0.5; // Random omega between 0.5 and 4.5

            // Animate game object
            const gameObject = document.getElementById('gameObject');
            if (gameObject) {
                gameObject.style.animation = `orbit ${2 * Math.PI / gameAnswer}s linear infinite`;
            }

            // Clear previous result
            document.getElementById('gameResult').textContent = '';
            document.getElementById('guessInput').value = '';
        }

        function checkGuess() {
            const guess = parseFloat(document.getElementById('guessInput').value);
            const tolerance = 0.3;
            const resultDiv = document.getElementById('gameResult');

            if (Math.abs(guess - gameAnswer) <= tolerance) {
                resultDiv.textContent = '🎉 Benar! +10 poin';
                resultDiv.className = 'mt-4 text-center font-semibold text-green-300';
                gameScore += 10;
            } else {
                resultDiv.textContent = `❌ Salah! Jawaban: ${gameAnswer.toFixed(1)} rad/s`;
                resultDiv.className = 'mt-4 text-center font-semibold text-red-300';
            }

            document.getElementById('gameScore').textContent = gameScore;
        }

        // Drag and Drop functions
        function allowDrop(ev) {
            ev.preventDefault();
        }

        function drag(ev) {
            ev.dataTransfer.setData("text", ev.target.id);
        }

        function drop(ev) {
            ev.preventDefault();
            const data = ev.dataTransfer.getData("text");
            const draggedElement = document.getElementById(data);
            const dropZone = document.getElementById('dropZone');

            // Clear drop zone and add the formula
            dropZone.innerHTML = '';
            dropZone.appendChild(draggedElement.cloneNode(true));
            dropZone.classList.add('bg-blue-50', 'border-blue-300');
        }

        function checkFormula() {
            const dropZone = document.getElementById('dropZone');
            const droppedFormula = (dropZone.textContent || '').trim();
            const resultDiv = document.getElementById('formulaResult');

            // Normalisasi: hilangkan spasi, ubah superscript ² menjadi ^2, dan bandingkan dalam huruf besar
            const normalize = str => str.replace(/\s+/g, '').replace(/²/g, '^2').toUpperCase();
            const canonical = normalize(droppedFormula);

            // Juga periksa apakah elemen yang dijatuhkan berasal dari pilihan dengan id 'formula2'
            const firstChild = dropZone.firstElementChild;
            const droppedIsFormula2 = firstChild && firstChild.id === 'formula2';

            if (canonical === 'F=MV^2/R' || droppedIsFormula2) {
                resultDiv.textContent = '✅ Benar! Rumus gaya sentripetal yang tepat. +15 poin';
                resultDiv.className = 'text-center font-semibold text-green-600';
                formulaScore += 15;
            } else {
                resultDiv.textContent = '❌ Salah! Gunakan rumus F = mv²/r untuk gaya sentripetal.';
                resultDiv.className = 'text-center font-semibold text-red-600';
            }

            document.getElementById('formulaScore').textContent = formulaScore;
        }

        // Quiz functions
        let selectedQuizAnswer = null;

        function selectAnswer(index) {
            selectedQuizAnswer = index;

            // Update button styles
            const options = document.querySelectorAll('.quiz-option');
            options.forEach((option, i) => {
                if (i === index) {
                    option.className = 'quiz-option w-full text-left p-3 rounded-lg border-2 border-blue-500 bg-blue-50';
                } else {
                    option.className = 'quiz-option w-full text-left p-3 rounded-lg border hover:bg-gray-50';
                }
            });

            // Enable submit button
            document.getElementById('submitQuiz').disabled = false;
            document.getElementById('submitQuiz').className = 'w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600';
        }
        // Load a quick quiz question into the UI (Kuis Kilat)
        function loadQuickQuestion() {
            // If already answered required number, finish
            if (quickAnsweredCount >= quickMax) {
                const feedback = document.getElementById('quizFeedback');
                const feedbackText = document.getElementById('feedbackText');
                const explanationText = document.getElementById('explanationText');
                feedback.classList.remove('hidden');
                feedback.className = 'mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200';
                feedbackText.textContent = 'Kuis Kilat selesai!';
                feedbackText.className = 'font-semibold text-blue-700';
                explanationText.textContent = `Skor akhir: ${quizScore}`;
                document.getElementById('submitQuiz').disabled = true;
                return;
            }

            // Pick a random unused question index
            if (quickAsked.size >= quickQuizPool.length) quickAsked.clear();
            let idx;
            do {
                idx = Math.floor(Math.random() * quickQuizPool.length);
            } while (quickAsked.has(idx) && quickAsked.size < quickQuizPool.length);
            quickAsked.add(idx);
            currentQuickIndex = idx;

            const q = quickQuizPool[idx];
            const qEl = document.getElementById('quizQuestion');
            if (qEl) qEl.textContent = q.question;

            const options = document.querySelectorAll('.quiz-option');
            options.forEach((opt, i) => {
                opt.textContent = q.options[i] || '';
                opt.className = 'quiz-option w-full text-left p-3 rounded-lg border hover:bg-gray-50';
            });

            // Reset UI state
            selectedQuizAnswer = null;
            document.getElementById('submitQuiz').disabled = true;
            document.getElementById('submitQuiz').className = 'w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 disabled:bg-gray-300';
            document.getElementById('quizFeedback').classList.add('hidden');
            document.getElementById('nextQuestion').classList.add('hidden');
            // hide stats while quiz ongoing
            const statsEl = document.getElementById('quickStats');
            if (statsEl) statsEl.classList.add('hidden');
        }

        function submitQuiz() {
            // Quick quiz submit: evaluate current quick question
            const feedback = document.getElementById('quizFeedback');
            const feedbackText = document.getElementById('feedbackText');
            const explanationText = document.getElementById('explanationText');

            if (currentQuickIndex === null) return;

            const q = quickQuizPool[currentQuickIndex];
            feedback.classList.remove('hidden');

            if (selectedQuizAnswer === q.correct) {
                feedback.className = 'mt-4 p-3 rounded-lg bg-green-100 border border-green-300';
                feedbackText.textContent = '✅ Jawaban Benar!';
                feedbackText.className = 'font-semibold text-green-700';
                explanationText.textContent = q.explanation || 'Benar.';
                quizScore += 5;
                quickCorrectCount++;
            } else {
                feedback.className = 'mt-4 p-3 rounded-lg bg-red-100 border border-red-300';
                feedbackText.textContent = '❌ Jawaban Salah';
                feedbackText.className = 'font-semibold text-red-700';
                explanationText.textContent = q.explanation || ('Jawaban yang benar adalah ' + q.options[q.correct]);
            }

            quickAnsweredCount++;
            document.getElementById('quizScore').textContent = quizScore;
            document.getElementById('submitQuiz').disabled = true;

            // Tampilkan tombol manual untuk ke soal berikutnya jika belum mencapai batas
            if (quickAnsweredCount < quickMax) {
                const nextBtn = document.getElementById('nextQuestion');
                nextBtn.classList.remove('hidden');
                nextBtn.disabled = false;
                nextBtn.className = 'w-full mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600';
            } else {
                // final state: tunjukkan ringkasan akhir di feedback
                // show statistics panel
                showQuickStats();
                const fb = document.getElementById('quizFeedback');
                const fbText = document.getElementById('feedbackText');
                fb.classList.remove('hidden');
                fb.className = 'mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200';
                fbText.textContent = 'Kuis Kilat selesai! Lihat statistik di bawah.';
                fbText.className = 'font-semibold text-blue-700';
                const nextBtn = document.getElementById('nextQuestion');
                nextBtn.classList.add('hidden');
                nextBtn.disabled = true;
            }
        }

        function nextQuestion() {
            // Keep compatibility: manual next will load another quick question
            document.getElementById('quizFeedback').classList.add('hidden');
            document.getElementById('nextQuestion').classList.add('hidden');
            selectedQuizAnswer = null;
            loadQuickQuestion();
        }

        // Show quick quiz statistics in the UI
        function showQuickStats() {
            const statsEl = document.getElementById('quickStats');
            if (!statsEl) return;
            const answered = quickAnsweredCount;
            const correct = quickCorrectCount;
            const wrong = Math.max(0, answered - correct);
            const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0;
            const points = quizScore;

            document.getElementById('statAnswered').textContent = answered;
            document.getElementById('statCorrect').textContent = correct;
            document.getElementById('statWrong').textContent = wrong;
            document.getElementById('statAccuracy').textContent = accuracy + '%';
            document.getElementById('statPoints').textContent = points;

            statsEl.classList.remove('hidden');
        }

        // Main Quiz functions
        let selectedMainAnswer = null;
        let currentMainQuestion = 0;
        let mainQuizScore = 0;
        let correctAnswers = 0;
        let mainQuizHistory = []; // store {index, question, chosenIndex, chosenText, correctIndex, correctText, correct, points}
        let quizTimer;
        let timeLeft = 300; // 5 minutes

        function selectMainAnswer(index) {
            selectedMainAnswer = index;

            // Update button styles
            const options = document.querySelectorAll('.main-quiz-option');
            options.forEach((option, i) => {
                if (i === index) {
                    option.className = 'main-quiz-option w-full text-left p-4 rounded-lg border-2 border-red-500 bg-red-50 transition-colors';
                } else {
                    option.className = 'main-quiz-option w-full text-left p-4 rounded-lg border-2 border-gray-200 hover:border-red-300 hover:bg-red-50 transition-colors';
                }
            });

            // Enable submit button
            document.getElementById('submitMainQuiz').disabled = false;
            document.getElementById('submitMainQuiz').className = 'bg-red-500 text-white py-3 px-6 rounded-lg hover:bg-red-600 font-semibold';
        }

        function submitMainQuiz() {
            const feedback = document.getElementById('mainQuizFeedback');
            const feedbackText = document.getElementById('mainFeedbackText');
            const explanationText = document.getElementById('mainExplanationText');
            const feedbackIcon = document.getElementById('feedbackIcon');

            feedback.classList.remove('hidden');

            if (selectedMainAnswer === 1) { // Correct answer is B (64 N)
                feedback.className = 'mt-6 p-4 rounded-lg bg-green-100 border border-green-300';
                feedbackIcon.className = 'flex-shrink-0 w-6 h-6 rounded-full bg-green-500';
                feedbackIcon.innerHTML = '✓';
                feedbackText.textContent = '🎉 Jawaban Benar!';
                feedbackText.className = 'font-semibold mb-2 text-green-700';
                explanationText.textContent = 'Excellent! Anda menggunakan rumus yang tepat dan perhitungan yang benar.';
                mainQuizScore += 10;
                correctAnswers++;
            } else {
                feedback.className = 'mt-6 p-4 rounded-lg bg-red-100 border border-red-300';
                feedbackIcon.className = 'flex-shrink-0 w-6 h-6 rounded-full bg-red-500';
                feedbackIcon.innerHTML = '✗';
                feedbackText.textContent = '❌ Jawaban Kurang Tepat';
                feedbackText.className = 'font-semibold mb-2 text-red-700';
                explanationText.textContent = 'Jawaban yang benar adalah B (64 N). Mari pelajari penyelesaiannya:';
            }

            document.getElementById('currentScore').textContent = mainQuizScore;
            document.getElementById('nextMainQuestion').classList.remove('hidden');
            document.getElementById('submitMainQuiz').disabled = true;

            // Re-render MathJax for formula
            if (window.MathJax) {
                MathJax.typesetPromise();
            }
        }

        function nextMainQuestion() {
            currentMainQuestion++;

            if (currentMainQuestion >= 10) {
                showQuizResults();
                return;
            }

            // Update progress
            const progress = ((currentMainQuestion + 1) / 10) * 100;
            document.getElementById('progressBar').style.width = progress + '%';
            document.getElementById('currentQuestionNum').textContent = currentMainQuestion + 1;

            // Reset UI
            document.getElementById('mainQuizFeedback').classList.add('hidden');
            document.getElementById('nextMainQuestion').classList.add('hidden');
            document.getElementById('submitMainQuiz').disabled = true;
            document.getElementById('submitMainQuiz').className = 'bg-red-500 text-white py-3 px-6 rounded-lg hover:bg-red-600 font-semibold disabled:bg-gray-300';

            // Reset option styles
            const options = document.querySelectorAll('.main-quiz-option');
            options.forEach(option => {
                option.className = 'main-quiz-option w-full text-left p-4 rounded-lg border-2 border-gray-200 hover:border-red-300 hover:bg-red-50 transition-colors';
            });

            selectedMainAnswer = null;

            // Load next question (simplified - could be expanded with more questions)
            loadNextQuestion();
        }

        // ...existing code...
        // Main quiz data (ganti daftar soal utama)
        // ...existing code...
         const mainQuizData = [
            {
                question: "1.\nSebuah benda bergerak melingkar dengan jari-jari 0,6 m dan periode 0,4 s.\nBerapakah kecepatan linear benda tersebut?",
                options: ["A. 3,14 m/s", "B. 4,71 m/s", "C. 9,42 m/s", "D. 2,51 m/s"],
                correct: 2,
                note: "v = 2πr / T = 2π·0.6 / 0.4 = 3π ≈ 9.42 m/s",
                difficulty: "Mudah"
            },
            {
                question: "2.\nSebuah kipas angin memiliki frekuensi 5 Hz. Berapakah kecepatan sudutnya?",
                options: ["A. 10 rad/s", "B. 5π rad/s (≈15.71 rad/s)", "C. 31.42 rad/s", "D. 20π rad/s (≈62.83 rad/s)"],
                correct: 2,
                note: "ω = 2π f = 2π · 5 = 10π rad/s ≈ 31.42 rad/s",
                difficulty: "Mudah"
            },
            {
                question: "3.\nBenda bergerak dengan kecepatan 12 m/s pada lintasan melingkar berjari-jari 3 m.\nBerapakah percepatan sentripetal benda?",
                options: ["A. 36 m/s²", "B. 48 m/s²", "C. 12 m/s²", "D. 24 m/s²"],
                correct: 1,
                note: "a_c = v² / r = 12² / 3 = 144 / 3 = 48 m/s²",
                difficulty: "Sedang"
            },
            {
                question: "4.\nSebuah benda bermassa 4 kg bergerak dengan kecepatan 10 m/s pada lintasan berjari-jari 5 m.\nGaya sentripetal yang bekerja pada benda adalah…",
                options: ["A. 20 N", "B. 40 N", "C. 80 N", "D. 100 N"],
                correct: 2,
                note: "F_s = m v² / r = 4·100 / 5 = 400 / 5 = 80 N",
                difficulty: "Sedang"
            },
            {
                question: "5.\nSebuah benda memiliki kecepatan sudut 15 rad/s dan radius 0,2 m. Hitung kecepatan linearnya.",
                options: ["A. 2 m/s", "B. 3 m/s", "C. 3.0 m/s", "D. 4 m/s"],
                correct: 1,
                note: "v = ω r = 15 · 0.2 = 3 m/s",
                difficulty: "Sedang"
            },
            {
                question: "6.\nKecepatan sudut suatu benda berubah dari 4 rad/s menjadi 10 rad/s dalam 3 detik. Hitung percepatan sudutnya.",
                options: ["A. 3 rad/s²", "B. 2 rad/s²", "C. 1 rad/s²", "D. 6 rad/s²"],
                correct: 1,
                note: "α = (ω₂ − ω₁) / t = (10 − 4) / 3 = 2 rad/s²",
                difficulty: "Mudah"
            },
            {
                question: "7.\nJika percepatan sudut suatu roda adalah 5 rad/s² dan jari-jarinya 0,4 m, maka percepatan tangensialnya adalah…",
                options: ["A. 1 m/s²", "B. 2 m/s²", "C. 0,5 m/s²", "D. 4 m/s²"],
                correct: 1,
                note: "a_t = α · r = 5 · 0.4 = 2 m/s²",
                difficulty: "Sedang"
            },
            {
                question: "8.\nSebuah benda memiliki kecepatan awal 3 rad/s dan percepatan sudut 1 rad/s². Berapakah sudut yang ditempuh selama 5 detik?",
                options: ["A. 20 rad", "B. 27.5 rad", "C. 12.5 rad", "D. 17.5 rad"],
                correct: 1,
                note: "θ = ω₀ t + ½ α t² = 3·5 + 0.5·1·5² = 15 + 12.5 = 27.5 rad",
                difficulty: "Sedang"
            },
            {
                question: "9.\nSuatu benda memiliki percepatan sentripetal 16 m/s² dan percepatan tangensial 12 m/s². Berapakah percepatan totalnya?",
                options: ["A. 20 m/s²", "B. 25 m/s²", "C. 28 m/s²", "D. 16 m/s²"],
                correct: 0,
                note: "a_total = √(a_s² + a_t²) = √(16² + 12²) = √400 = 20 m/s²",
                difficulty: "Sulit"
            },
            {
                question: "10.\nBenda berputar dengan kecepatan sudut awal 6 rad/s dan percepatan sudut 2 rad/s². Jika sudut yang ditempuh 30 rad, berapa kecepatan sudut akhirnya?",
                options: ["A. 10 rad/s", "B. 12 rad/s", "C. 14 rad/s", "D. 20 rad/s"],
                correct: 1,
                note: "ω² = ω₀² + 2 α θ ⇒ ω = √(6² + 2·2·30) = √156 ≈ 12.49 ≈ 12 rad/s",
                difficulty: "Sulit"
            }
        ];
        // ...existing code...

        // Tambahkan array rumus & langkah sebelum loadNextQuestion
        const mainFormulas = [
            "\\[v = \\frac{2\\pi r}{T}\\]",                          // Soal 1
            "\\[\\omega = 2\\pi f\\]",                               // Soal 2
            "\\[a_s = \\frac{v^2}{r}\\]",                            // Soal 3
            "\\[F_s = \\frac{m v^2}{r}\\]",                          // Soal 4
            "\\[v = \\omega r\\]",                                   // Soal 5
            "\\[\\alpha = \\frac{\\Delta\\omega}{\\Delta t}\\]",     // Soal 6
            "\\[a_t = \\alpha r\\]",                                 // Soal 7
            "\\[\\theta = \\omega_0 t + \\tfrac{1}{2}\\alpha t^2\\]",// Soal 8
            "\\[a_{\\text{total}} = \\sqrt{a_s^2 + a_t^2}\\]",       // Soal 9
            "\\[\\omega_t^2 = \\omega_0^2 + 2\\alpha\\theta\\]"      // Soal 10
        ];

        const mainFormulaSteps = [
            "v = 2πr / T → v = 2π·0.6 / 0.4 = 3π ≈ 9.42 m/s.",
            "ω = 2π f → ω = 2π·5 = 10π ≈ 31.42 rad/s.",
            "a_s = v² / r → a_s = 12² / 3 = 144 / 3 = 48 m/s².",
            "F_s = m v² / r → F_s = 4·10² / 5 = 400 / 5 = 80 N.",
            "v = ω r → v = 15 · 0.2 = 3 m/s.",
            "α = Δω / Δt → α = (10 − 4) / 3 = 2 rad/s².",
            "a_t = α r → a_t = 5 · 0.4 = 2 m/s².",
            "θ = ω₀ t + ½ α t² → θ = 3·5 + 0.5·1·5² = 15 + 12.5 = 27.5 rad.",
            "a_total = √(a_s² + a_t²) → √(16² + 12²) = √400 = 20 m/s².",
            "ω_t² = ω₀² + 2αθ → ω = √(6² + 2·2·30) = √156 ≈ 12.49 rad/s."
        ];


        // Replace loadNextQuestion()
        function loadNextQuestion() {
            if (!mainQuizData || mainQuizData.length === 0) return;
            const totalEl = document.getElementById('totalQuestions');
            if (totalEl) totalEl.textContent = mainQuizData.length;

            if (currentMainQuestion < mainQuizData.length) {
                const q = mainQuizData[currentMainQuestion];
                const qEl = document.getElementById('mainQuizQuestion');
                if (qEl) qEl.textContent = q.question;

                // set options text
                const options = document.querySelectorAll('.main-quiz-option');
                options.forEach((opt, i) => {
                    if (q.options[i]) opt.textContent = q.options[i];
                });

                // update difficulty and question counter
                const diffEl = document.getElementById('difficultyLevel');
                if (diffEl) diffEl.textContent = q.difficulty || '';
                const curEl = document.getElementById('currentQuestionNum');
                if (curEl) curEl.textContent = (currentMainQuestion + 1).toString();

                // hide/clear formula explanation for new question
                const formulaExplanation = document.getElementById('formulaExplanation');
                const formulaContent = document.getElementById('formulaContent');
                const formulaSteps = document.getElementById('formulaSteps');
                if (formulaExplanation) {
                    formulaExplanation.classList.add('hidden');
                    if (formulaContent) formulaContent.textContent = '';
                    if (formulaSteps) formulaSteps.textContent = '';
                }
            } else {
                showQuizResults();
            }
        }

        // ...existing code...
        function renderFormulaForQuestion(index) {
            const formulaEl = document.getElementById('formulaContent');
            const stepsEl = document.getElementById('formulaSteps');
            const formulaBox = document.getElementById('formulaExplanation');
            if (!formulaEl || !stepsEl || !formulaBox) return;

            // pastikan array tersedia dan index valid
            const total = Array.isArray(mainFormulas) ? mainFormulas.length : 0;
            const idx = (typeof index === 'number' && total > 0) ? Math.max(0, Math.min(index, total - 1)) : 0;

            const formulaText = mainFormulas[idx] || '—';
            const stepsText = mainFormulaSteps[idx] || '';

            // tampilkan rumus (teks LaTeX) dan langkah
            formulaEl.textContent = formulaText;
            stepsEl.innerHTML = stepsText;
            formulaBox.classList.remove('hidden');

            // render MathJax jika tersedia
            if (window.MathJax && typeof MathJax.typesetPromise === 'function') {
                MathJax.typesetPromise([formulaEl]).catch(() => { });
            }
        }
        // ...existing code...

        // Replace submitMainQuiz()
        function submitMainQuiz() {
            const feedback = document.getElementById('mainQuizFeedback');
            const feedbackText = document.getElementById('mainFeedbackText');
            const explanationText = document.getElementById('mainExplanationText');
            const feedbackIcon = document.getElementById('feedbackIcon');

            feedback.classList.remove('hidden');

            const q = mainQuizData[currentMainQuestion];
            const correctIndex = q ? q.correct : 0;
            const pointsAwarded = (selectedMainAnswer === correctIndex) ? 10 : 0;

            if (selectedMainAnswer === correctIndex) {
                feedback.className = 'mt-6 p-4 rounded-lg bg-green-100 border border-green-300';
                feedbackIcon.className = 'flex-shrink-0 w-6 h-6 rounded-full bg-green-500';
                feedbackIcon.innerHTML = '✓';
                feedbackText.textContent = '🎉 Jawaban Benar!';
                feedbackText.className = 'font-semibold mb-2 text-green-700';
                explanationText.textContent = q.note || 'Perhitungan benar.';
                mainQuizScore += pointsAwarded;
                correctAnswers++;
            } else {
                feedback.className = 'mt-6 p-4 rounded-lg bg-red-100 border border-red-300';
                feedbackIcon.className = 'flex-shrink-0 w-6 h-6 rounded-full bg-red-500';
                feedbackIcon.innerHTML = '✗';
                feedbackText.textContent = '❌ Jawaban Kurang Tepat';
                feedbackText.className = 'font-semibold mb-2 text-red-700';
                explanationText.textContent = 'Jawaban yang benar adalah ' + q.options[q.correct] + '. Lihat rumus dan langkah di bawah.';
            }

            // record history for this question
            try {
                mainQuizHistory.push({
                    index: currentMainQuestion,
                    question: q.question || '',
                    chosenIndex: selectedMainAnswer,
                    chosenText: q.options[selectedMainAnswer] || '',
                    correctIndex: q.correct,
                    correctText: q.options[q.correct] || '',
                    correct: selectedMainAnswer === q.correct,
                    points: pointsAwarded
                });
            } catch (e) {
                // ignore
            }

            // show formula & steps for current question
            renderFormulaForQuestion(currentMainQuestion);

            document.getElementById('currentScore').textContent = mainQuizScore;
            document.getElementById('nextMainQuestion').classList.remove('hidden');
            document.getElementById('submitMainQuiz').disabled = true;
            if (window.MathJax) MathJax.typesetPromise();
        }
        // ...existing code...
        // Update startQuiz() to load first question and set totals
        function startQuiz() {
            document.getElementById('startQuizScreen').style.display = 'none';
            document.getElementById('quizContainer').style.display = 'block';
            timeLeft = 300;
            startQuizTimer();

            // reset indices and UI
            currentMainQuestion = 0;
            mainQuizScore = 0;
            correctAnswers = 0;
            document.getElementById('currentScore').textContent = '0';
            document.getElementById('progressBar').style.width = '10%';
            loadNextQuestion();
        }

        // Update restartQuiz() to reset and load first question
        function restartQuiz() {
            currentMainQuestion = 0;
            mainQuizScore = 0;
            correctAnswers = 0;
            mainQuizHistory = [];
            timeLeft = 300;

            document.getElementById('quizContainer').classList.remove('hidden');
            document.getElementById('quizResults').classList.add('hidden');
            document.getElementById('progressBar').style.width = '10%';
            document.getElementById('currentQuestionNum').textContent = '1';
            document.getElementById('currentScore').textContent = '0';

            // restart timer and load first question
            if (quizTimer) clearInterval(quizTimer);
            startQuizTimer();
            loadNextQuestion();
        }
        // ...existing code...

        function startQuizTimer() {
            quizTimer = setInterval(() => {
                timeLeft--;
                const minutes = Math.floor(timeLeft / 60);
                const seconds = timeLeft % 60;
                document.getElementById('timer').textContent =
                    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

                if (timeLeft <= 0) {
                    clearInterval(quizTimer);
                    showQuizResults();
                }
            }, 1000);
        }

        // Show final results for the main quiz (Kuis Adaptif)
        function showQuizResults() {
            // Stop timer
            if (quizTimer) {
                clearInterval(quizTimer);
                quizTimer = null;
            }

            // Compute accuracy using number of answered questions (history)
            const answered = Array.isArray(mainQuizHistory) ? mainQuizHistory.length : 0;
            const total = answered > 0 ? answered : (Array.isArray(mainQuizData) ? mainQuizData.length : 10);
            const correct = typeof correctAnswers === 'number' ? correctAnswers : 0;
            const accuracyRaw = total > 0 ? (correct / total) * 100 : 0;
            const accuracy = Number(accuracyRaw.toFixed(1)); // one decimal place

            // Fill result elements in HTML
            const finalScoreEl = document.getElementById('finalScore');
            const correctEl = document.getElementById('correctAnswers');
            const accuracyEl = document.getElementById('accuracyPercentage');

            if (finalScoreEl) finalScoreEl.textContent = String(mainQuizScore);
            if (correctEl) correctEl.textContent = String(correct);
            if (accuracyEl) accuracyEl.textContent = String(accuracy) + '%';

            // Render history list
            const historyList = document.getElementById('quizHistoryList');
            const historyBox = document.getElementById('quizHistory');
            if (historyList && historyBox) {
                historyList.innerHTML = '';
                mainQuizHistory.forEach((h, i) => {
                    const item = document.createElement('div');
                    item.className = 'p-3 border rounded-lg bg-gray-50';
                    const qnum = document.createElement('div');
                    qnum.className = 'font-semibold';
                    qnum.textContent = `Soal ${i+1}: ${h.question.split('\n')[0] || ''}`;
                    const chosen = document.createElement('div');
                    chosen.innerHTML = `<span class="font-medium">Pilihan Anda:</span> ${h.chosenText || '-'} ${h.correct ? '<span class="text-green-600 font-semibold">(Benar)</span>' : '<span class="text-red-600 font-semibold">(Salah)</span>'}`;
                    const correctText = document.createElement('div');
                    correctText.innerHTML = `<span class="font-medium">Jawaban Benar:</span> ${h.correctText || '-'}`;
                    const points = document.createElement('div');
                    points.className = 'text-sm text-gray-600';
                    points.textContent = `Poin: ${h.points}`;

                    item.appendChild(qnum);
                    item.appendChild(chosen);
                    item.appendChild(correctText);
                    item.appendChild(points);
                    historyList.appendChild(item);
                });

                historyBox.classList.remove('hidden');
            }

            // Toggle UI: hide quiz container, show results
            const quizContainer = document.getElementById('quizContainer');
            const resultsContainer = document.getElementById('quizResults');
            if (quizContainer) quizContainer.style.display = 'none';
            if (resultsContainer) resultsContainer.classList.remove('hidden');
        }

        // Start quiz timer when page loads
        // document.addEventListener('DOMContentLoaded', function () {
        //     startQuizTimer();
        // });

        // Experiment functions
        function calculateExperiment() {
            const radius = parseFloat(document.getElementById('expRadius').value);
            const revolutions = parseFloat(document.getElementById('expRevolutions').value);
            const time = parseFloat(document.getElementById('expTime').value);
            const mass = parseFloat(document.getElementById('expMass').value);

            if (!radius || !revolutions || !time || !mass) {
                alert('Mohon isi semua data eksperimen!');
                return;
            }

            // Calculations
            const period = time / revolutions;
            const omega = 2 * Math.PI / period;
            const velocity = omega * radius;
            const acceleration = omega * omega * radius;
            const force = mass * acceleration;

            // Display results
            document.getElementById('expPeriod').textContent = period.toFixed(2);
            document.getElementById('expOmega').textContent = omega.toFixed(2);
            document.getElementById('expVelocity').textContent = velocity.toFixed(2);
            document.getElementById('expAcceleration').textContent = acceleration.toFixed(2);
            document.getElementById('expForce').textContent = force.toFixed(2);

            document.getElementById('experimentResults').classList.remove('hidden');
        }

        function calculateSatellite() {
            const altitude = parseFloat(document.getElementById('satAltitude').value);
            const mass = parseFloat(document.getElementById('satMass').value);

            if (!altitude || !mass) {
                alert('Mohon isi data satelit!');
                return;
            }

            // Constants
            const earthRadius = 6371; // km
            const earthMass = 5.97e24; // kg
            const G = 6.67e-11; // N⋅m²/kg²

            // Calculations
            const orbitRadius = earthRadius + altitude;
            const velocity = Math.sqrt(G * earthMass / (orbitRadius * 1000)) / 1000; // km/s
            const period = 2 * Math.PI * orbitRadius / velocity / 60; // minutes
            const acceleration = velocity * velocity * 1000 / (orbitRadius * 1000); // m/s²
            const force = mass * acceleration;

            // Display results
            document.getElementById('satRadius').textContent = orbitRadius.toFixed(0);
            document.getElementById('satVelocity').textContent = velocity.toFixed(2);
            document.getElementById('satPeriod').textContent = period.toFixed(0);
            document.getElementById('satAcceleration').textContent = acceleration.toFixed(2);
            document.getElementById('satForce').textContent = force.toFixed(0);

            document.getElementById('satelliteResults').classList.remove('hidden');
        }

        function calculateFerrisWheel() {
            const radius = parseFloat(document.getElementById('wheelRadius').value);
            const period = parseFloat(document.getElementById('wheelPeriod').value) * 60; // convert to seconds
            const mass = parseFloat(document.getElementById('passengerMass').value);
            const height = parseFloat(document.getElementById('wheelHeight').value);

            if (!radius || !period || !mass || !height) {
                alert('Mohon isi semua data bianglala!');
                return;
            }

            // Calculations
            const omega = 2 * Math.PI / period;
            const velocity = omega * radius;
            const acceleration = omega * omega * radius;
            const force = mass * acceleration;
            const g = 9.8; // m/s²
            const weightTop = mass * (g - acceleration);
            const weightBottom = mass * (g + acceleration);

            // Display results
            document.getElementById('wheelVelocity').textContent = velocity.toFixed(2);
            document.getElementById('wheelOmega').textContent = omega.toFixed(4);
            document.getElementById('wheelAcceleration').textContent = acceleration.toFixed(3);
            document.getElementById('wheelForce').textContent = force.toFixed(2);
            document.getElementById('wheelWeightTop').textContent = weightTop.toFixed(1);
            document.getElementById('wheelWeightBottom').textContent = weightBottom.toFixed(1);

            document.getElementById('ferrisResults').classList.remove('hidden');
        }

        // Initialize simulation when page loads
        document.addEventListener('DOMContentLoaded', function () {
            updateSimulation();
        });
   