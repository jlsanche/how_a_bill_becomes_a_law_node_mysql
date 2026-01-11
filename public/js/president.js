document.getElementById('add_president').addEventListener('submit', function (e) {
    e.preventDefault();
    const form = e.target;
    const data = new URLSearchParams(new FormData(form));

    fetch(form.action, {
        method: 'POST',
        body: data
    })
    .then(response => response.json())
    .then(newPresident => {
        const table = document.getElementById('president-table');
        const row = table.insertRow(-1);
        row.id = `president-${newPresident.id}`;
        row.innerHTML = `
            <td>${newPresident.name}</td>
            <td>${newPresident.bill_on_desk}</td>
            <td></td>
            <td></td>
            <td>${newPresident.signed}</td>
            <td>
                <button onclick="deletePresident(this, ${newPresident.id})">Delete</button>
            </td>
            <td>
                <a href="/president/${newPresident.id}">Change President's decision</a>
            </td>
        `;
        form.reset();
    })
    .catch(error => console.error('Error:', error));
});

function deletePresident(button, id) {
    const row = button.closest('tr');
    fetch(`/president/${id}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            row.remove();
        }
    })
    .catch(error => console.error('Error:', error));
}
