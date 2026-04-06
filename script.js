let a = ''
let b = ''
let selectedOperator = null
let result = ''

const outputElement = document.getElementById('result')

function onButtonDiggitClick(digit) {
    let currentValue = (!selectedOperator) ? a : b;

    if (currentValue === '0' && digit === '0') return;

    if (currentValue === '0' && digit !== '.') {
        currentValue = digit;
    }

    if (currentValue === '0' && digit === '.') {
        currentValue = '0.';
    }
    else {
        if (currentValue.length >= 11) return;

        if ((digit !== '.') || (digit === '.' && !currentValue.includes(digit))) {
            currentValue += digit;
        }
    }

    if (!selectedOperator) {
        a = currentValue;
        outputElement.innerHTML = a;
    }
    else {
        b = currentValue;
        outputElement.innerHTML = b;
    }

}

const digitsId = ['btn_1', 'btn_2', 'btn_3', 'btn_4', 'btn_5', 'btn_6', 'btn_7', 'btn_8', 'btn_9', 'btn_0', 'btn_decimal'];
digitsId.forEach(function(id) {
    const button = document.getElementById(id);
    button.onclick = function() {
        const digitValue = button.innerHTML;
        onButtonDiggitClick(digitValue);
    }
});

document.getElementById('btn_add').onclick = function() {
    if (a==='') return;
    selectedOperator = '+';
};

document.getElementById('btn_minus').onclick = function() {
    if (a==='') return;
    selectedOperator = '-';
};

document.getElementById('btn_multiply').onclick = function() {
    if (a==='') return;
    selectedOperator = 'x';
};

document.getElementById('btn_divide').onclick = function() {
    if (a==='') return;
    selectedOperator = '/';
};

document.getElementById('btn_on_clear').onclick = function() {
    a = '';
    b = '';
    selectedOperator = null;
    result = '';
    outputElement.innerHTML = '0';
};

document.getElementById('btn_equals').onclick = function() {
    if (a=== '' || b === '' || !selectedOperator) return;

    switch (selectedOperator) {
        case '+':
            result = (+a) + (+b);
            break;
        case '-':
            result = (+a) - (+b);
            break;
        case 'x':
            result = (+a) * (+b);
            break;
        case '/':
            result = (+a) / (+b);
            break;
    }

    let resultString = result.toString();

    if (result.toString().length > 12) {
        resultString = result.toExponential(5);
    }
    a = resultString;
    b = '';
    selectedOperator = null;

    outputElement.innerHTML = a;
};
