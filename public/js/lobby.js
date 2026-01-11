document.getElementById('addlobby').addEventListener('submit', function (e) {
    e.preventDefault();
    const form = e.target;
    const data = new URLSearchParams(new FormData(form));

    fetch(form.action, {
        method: 'POST',
        body: data
    })
    .then(response => response.json())
    .then(newLobby => {
        const table = document.getElementById('lobby-table');
        const row = table.insertRow(-1);
        row.id = `lobby-${newLobby.id}`;
        row.innerHTML = `
            <td>${newLobby.name}</td>
            <td>${newLobby.money}</td>
            <td>${newLobby.bill_endorsed}</td>
            <td>
                <button onclick="deleteLobby(this, ${newLobby.id})">Delete</button>
            </td>
            <td>
                <a href="/lobby/${newLobby.id}">Update</a>
            </td>
        `;
        form.reset();
    })
    .catch(error => console.error('Error:', error));
});

function deleteLobby(button, id) {
    const row = button.closest('tr');
    fetch(`/lobby/${id}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            row.remove();
        }
    })
    .catch(error => console.error('Error:', error));
}
