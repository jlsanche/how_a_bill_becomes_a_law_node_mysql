document.getElementById('add_bill').addEventListener('submit', function (e) {
    e.preventDefault();
    const form = e.target;
    const data = new URLSearchParams(new FormData(form));

    fetch(form.action, {
        method: 'POST',
        body: data
    })
    .then(response => response.json())
    .then(newBill => {
        const table = document.getElementById('bill-table');
        const row = table.insertRow(-1);
        row.id = `bill-${newBill.id}`;
        row.innerHTML = `
            <td>${newBill.name}</td>
            <td>${newBill.description}</td>
            <td>${newBill.passed}</td>
            <td>
                <button onclick="deleteBill(this, ${newBill.id})">Delete</button>
            </td>
            <td>
                <a href="/bill/${newBill.id}">Update</a>
            </td>
        `;
        form.reset();
    })
    .catch(error => console.error('Error:', error));
});

function deleteBill(button, id) {
    const row = button.closest('tr');
    fetch(`/bill/${id}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            row.remove();
        }
    })
    .catch(error => console.error('Error:', error));
}
