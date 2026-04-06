/**
 * pages/calculator.js
 *
 * A basic arithmetic calculator.
 */

export function render(container) {
  let displayValue = '0';
  let firstOperand = null;
  let operator = null;
  let waitingForSecondOperand = false;

  const updateDisplay = () => {
    const display = container.querySelector('.calculator-screen');
    if (display) {
      display.value = displayValue;
    }
  };

  const inputDigit = (digit) => {
    if (waitingForSecondOperand === true) {
      displayValue = digit;
      waitingForSecondOperand = false;
    } else {
      displayValue = displayValue === '0' ? digit : displayValue + digit;
    }
    updateDisplay();
  };

  const inputDecimal = (dot) => {
    if (waitingForSecondOperand === true) {
      displayValue = '0.';
      waitingForSecondOperand = false;
      updateDisplay();
      return;
    }

    if (!displayValue.includes(dot)) {
      displayValue += dot;
    }
    updateDisplay();
  };

  const handleOperator = (nextOperator) => {
    const inputValue = parseFloat(displayValue);

    if (operator && waitingForSecondOperand) {
      operator = nextOperator;
      return;
    }

    if (firstOperand === null && !isNaN(inputValue)) {
      firstOperand = inputValue;
    } else if (operator) {
      const result = calculate(firstOperand, inputValue, operator);
      displayValue = `${parseFloat(result.toFixed(7))}`;
      firstOperand = result;
    }

    waitingForSecondOperand = true;
    operator = nextOperator;
    updateDisplay();
  };

  const calculate = (first, second, op) => {
    if (op === '+') return first + second;
    if (op === '-') return first - second;
    if (op === '*') return first * second;
    if (op === '/') return first / second;
    return second;
  };

  const resetCalculator = () => {
    displayValue = '0';
    firstOperand = null;
    operator = null;
    waitingForSecondOperand = false;
    updateDisplay();
  };

  container.innerHTML = `
    <style>
      .calculator-card { max-width: 320px; margin: 2rem auto; }
      .calculator-screen {
        width: 100%;
        height: 60px;
        border: none;
        background-color: #252525;
        color: #fff;
        text-align: right;
        padding-right: 20px;
        padding-left: 10px;
        font-size: 2.5rem;
        border-radius: 4px 4px 0 0;
      }
      .calculator-keys {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        grid-gap: 1px;
        background-color: #ddd;
        border-radius: 0 0 4px 4px;
        overflow: hidden;
      }
      .calculator-keys button {
        height: 60px;
        background-color: #fff;
        border: none;
        font-size: 1.2rem;
        transition: background-color 0.1s;
      }
      .calculator-keys button:hover { background-color: #f0f0f0; }
      .calculator-keys button:active { background-color: #e0e0e0; }
      .operator { color: #fff; background-color: #ff9500 !important; }
      .operator:hover { background-color: #e68600 !important; }
      .all-clear { color: #fff; background-color: #ff3b30 !important; }
      .equal-sign { color: #fff; background-color: #34c759 !important; grid-column-end: span 2; }
    </style>

    <div class="calculator-card card shadow-lg border-0">
      <div class="card-body p-0">
        <input type="text" class="calculator-screen" value="0" disabled />
        <div class="calculator-keys">
          <button type="button" class="operator" value="+">+</button>
          <button type="button" class="operator" value="-">-</button>
          <button type="button" class="operator" value="*">&times;</button>
          <button type="button" class="operator" value="/">&divide;</button>

          <button type="button" value="7">7</button>
          <button type="button" value="8">8</button>
          <button type="button" value="9">9</button>

          <button type="button" value="4">4</button>
          <button type="button" value="5">5</button>
          <button type="button" value="6">6</button>

          <button type="button" value="1">1</button>
          <button type="button" value="2">2</button>
          <button type="button" value="3">3</button>

          <button type="button" value="0">0</button>
          <button type="button" class="decimal" value=".">.</button>
          <button type="button" class="all-clear" value="all-clear">AC</button>

          <button type="button" class="equal-sign" value="=">=</button>
        </div>
      </div>
    </div>
  `;

  container.querySelector('.calculator-keys').addEventListener('click', (event) => {
    const { target } = event;
    if (!target.matches('button')) return;

    if (target.classList.contains('operator')) {
      handleOperator(target.value);
      return;
    }

    if (target.classList.contains('decimal')) {
      inputDecimal(target.value);
      return;
    }

    if (target.classList.contains('all-clear')) {
      resetCalculator();
      return;
    }

    if (target.classList.contains('equal-sign')) {
      handleOperator('=');
      return;
    }

    inputDigit(target.value);
  });
}
