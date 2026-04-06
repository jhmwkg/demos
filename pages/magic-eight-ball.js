/**
 * pages/magic-eight-ball.js
 *
 * A fun, interactive Magic Eight Ball demo.
 */

export function render(container) {
  container.innerHTML = `
    <div class="container py-5 text-center">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-5">
          <h2 class="mb-4 fw-bold">Magic Eight Ball</h2>
          <p class="text-muted mb-4">Ask a yes-or-no question and seek the wisdom of the ball.</p>
          
          <div id="eight-ball-container" class="mb-5 position-relative mx-auto" style="width: 250px; height: 250px; cursor: pointer;">
            <!-- Outer Ball -->
            <div class="rounded-circle bg-dark shadow-lg d-flex align-items-center justify-content-center" 
                 style="width: 100%; height: 100%; border: 5px solid #222;">
              <!-- Inner Circle -->
              <div id="eight-ball-inner" class="rounded-circle bg-primary d-flex align-items-center justify-content-center p-3 text-white text-center shadow-inner" 
                   style="width: 130px; height: 130px; border: 10px solid rgba(0,0,0,0.1); transition: all 0.5s ease-out; opacity: 1;">
                <div id="eight-ball-answer" class="fw-bold fs-5" style="line-height: 1.2;">
                  8
                </div>
              </div>
            </div>
            <!-- Decorative reflection -->
            <div class="position-absolute rounded-circle bg-white opacity-10" 
                 style="width: 60px; height: 30px; top: 30px; left: 60px; transform: rotate(-30deg);"></div>
          </div>
          
          <div class="input-group mb-3 shadow-sm">
            <input type="text" id="question-input" class="form-control" placeholder="Type your question here..." aria-label="Question">
            <button class="btn btn-primary px-4" type="button" id="shake-btn">Shake the Ball</button>
          </div>
          
          <div class="mt-4">
            <a href="#home" class="btn btn-outline-secondary btn-sm">
              <i class="bi bi-arrow-left me-1"></i> Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  `;

  init();
}

function init() {
  const shakeBtn = document.getElementById('shake-btn');
  const questionInput = document.getElementById('question-input');
  const ballInner = document.getElementById('eight-ball-inner');
  const ballAnswer = document.getElementById('eight-ball-answer');
  const ballContainer = document.getElementById('eight-ball-container');

  const answers = [
    "It is certain.",
    "It is decidedly so.",
    "Without a doubt.",
    "Yes, definitely.",
    "You may rely on it.",
    "As I see it, yes.",
    "Most likely.",
    "Outlook good.",
    "Yes.",
    "Signs point to yes.",
    "Reply hazy, try again.",
    "Ask again later.",
    "Better not tell you now.",
    "Cannot predict now.",
    "Concentrate and ask again.",
    "Don't count on it.",
    "My reply is no.",
    "My sources say no.",
    "Outlook not so good.",
    "Very doubtful."
  ];

  const shake = () => {
    // Add shake animation (using Bootstrap utility classes or manual transform)
    ballContainer.classList.add('shake-anim');
    ballInner.style.opacity = '0';
    
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * answers.length);
      ballAnswer.textContent = answers[randomIndex];
      ballInner.style.opacity = '1';
      ballContainer.classList.remove('shake-anim');
      questionInput.value = '';
    }, 600);
  };

  shakeBtn.addEventListener('click', shake);
  ballContainer.addEventListener('click', shake);
  
  // Enter key support
  questionInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') shake();
  });

  // Inject animation style if not present
  if (!document.getElementById('eight-ball-styles')) {
    const style = document.createElement('style');
    style.id = 'eight-ball-styles';
    style.innerHTML = `
      @keyframes shake {
        0% { transform: translate(1px, 1px) rotate(0deg); }
        10% { transform: translate(-1px, -2px) rotate(-1deg); }
        20% { transform: translate(-3px, 0px) rotate(1deg); }
        30% { transform: translate(3px, 2px) rotate(0deg); }
        40% { transform: translate(1px, -1px) rotate(1deg); }
        50% { transform: translate(-1px, 2px) rotate(-1deg); }
        60% { transform: translate(-3px, 1px) rotate(0deg); }
        70% { transform: translate(3px, 1px) rotate(-1deg); }
        80% { transform: translate(-1px, -1px) rotate(1deg); }
        90% { transform: translate(1px, 2px) rotate(0deg); }
        100% { transform: translate(1px, -2px) rotate(-1deg); }
      }
      .shake-anim {
        animation: shake 0.5s;
        animation-iteration-count: 1;
      }
    `;
    document.head.appendChild(style);
  }
}
