document.getElementById('add_congress_member').addEventListener('submit', function (e) {
    e.preventDefault();
    const form = e.target;
    const data = new URLSearchParams(new FormData(form));

    fetch(form.action, {
        method: 'POST',
        body: data
    })
    .then(response => response.json())
    .then(newMember => {
        const table = document.getElementById('congress-table');
        const row = table.insertRow(-1);
        row.id = `congress-${newMember.id}`;
        row.innerHTML = `
            <td>${newMember.name}</td>
            <td>
                <button onclick="deleteMember(this, ${newMember.id})">Delete</button>
            </td>
            <td>
                <a href="/congress/${newMember.id}">Update</a>
            </td>
        `;
        form.reset();
    })
    .catch(error => console.error('Error:', error));
});

function deleteMember(button, id) {
    const row = button.closest('tr');
    fetch(`/congress/${id}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            row.remove();
        }
    })
    .catch(error => console.error('Error:', error));
}
