let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let total = parseFloat(localStorage.getItem("total")) || 0;
let totalBudget = 0;

document.getElementById("totalBudget").addEventListener("input", function() {
    totalBudget = parseFloat(this.value) || 0;
    updateRemaining();
});

function addExpense() {
    const category = document.getElementById("category").value.trim();
    const note = document.getElementById("note").value.trim();
    const amount = parseFloat(document.getElementById("amount").value);
    const date = new Date().toISOString().split("T")[0];

    if(category === "" || isNaN(amount) || amount <= 0) {
        alert("Please enter valid category and amount!");
        return;
    }

    const expense = { date, category, note, amount };
    expenses.push(expense);
    total += amount;

    saveData();
    displayExpenses();
    document.getElementById("category").value = "";
    document.getElementById("note").value = "";
    document.getElementById("amount").value = "";
}

function displayExpenses() {
    const tbody = document.querySelector("#expenseTable tbody");
    tbody.innerHTML = "";

    const filterType = document.getElementById("filterType").value;
    const today = new Date().toISOString().split("T")[0];
    const currentMonth = today.slice(0,7);

    expenses.forEach((exp, index) => {
        if(filterType === "daily" && exp.date !== today) return;
        if(filterType === "monthly" && !exp.date.startsWith(currentMonth)) return;

        const row = document.createElement("tr");

        // Color coding for essential (bijli, doodh, rent) vs optional
        let colorStyle = "#fff";
        const essential = ["bijli", "doodh", "rent"];
        if(essential.some(e => exp.category.toLowerCase().includes(e))) colorStyle = "#ffe6e6";
        else colorStyle = "#e6ffe6";

        row.style.backgroundColor = colorStyle;

        row.innerHTML = `
            <td>${exp.date}</td>
            <td>${exp.category}</td>
            <td>${exp.note}</td>
            <td class="editable" data-index="${index}">${exp.amount}</td>
            <td>
                <button onclick="deleteExpense(${index})">❌</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    enableEditing();
    updateTotal();
    updateRemaining();
    updateMonthlySummary();
}

function enableEditing() {
    document.querySelectorAll(".editable").forEach(cell => {
        cell.addEventListener("dblclick", function() {
            const index = this.getAttribute("data-index");
            const newAmount = prompt("Enter new amount:", expenses[index].amount);
            if(newAmount && !isNaN(newAmount)) {
                total -= expenses[index].amount;
                expenses[index].amount = parseFloat(newAmount);
                total += parseFloat(newAmount);
                saveData();
                displayExpenses();
            }
        });
    });
}

function deleteExpense(index) {
    total -= expenses[index].amount;
    expenses.splice(index,1);
    saveData();
    displayExpenses();
}

function resetAll() {
    if(confirm("Kya aap sab data delete karna chahte hain?")) {
        expenses = [];
        total = 0;
        saveData();
        displayExpenses();
    }
}

function updateTotal() {
    document.getElementById("totalAmount").textContent = total;
}

function updateRemaining() {
    let remaining = totalBudget - total;
    const remElem = document.getElementById("remainingAmount");
    remElem.textContent = remaining >= 0 ? remaining : 0;
    remElem.style.color = remaining < 0 ? "#dc3545" : "#007bff";
}

function saveData() {
    localStorage.setItem("expenses", JSON.stringify(expenses));
    localStorage.setItem("total", total);
}

// Monthly Summary
function updateMonthlySummary() {
    const tbody = document.querySelector("#summaryTable tbody");
    tbody.innerHTML = "";
    const summary = {};
    expenses.forEach(exp => {
        if(summary[exp.category]) summary[exp.category] += exp.amount;
        else summary[exp.category] = exp.amount;
    });
    for(let cat in summary){
        const row = document.createElement("tr");
        row.innerHTML = `<td>${cat}</td><td>${summary[cat]}</td>`;
        tbody.appendChild(row);
    }
}

// Initial display
displayExpenses();
