document.getElementById('add_congress_lobby').addEventListener('submit', function (e) {
    e.preventDefault();
    const form = e.target;
    const data = new URLSearchParams(new FormData(form));

    fetch(form.action, {
        method: 'POST',
        body: data
    })
    .then(response => response.json())
    .then(newData => {
        const table = document.getElementById('money-taken-table').getElementsByTagName('tbody')[0];
        table.innerHTML = '';
        newData.forEach(item => {
            const row = table.insertRow(-1);
            row.id = `money-taken-${item.cid}-${item.lid}`;
            row.innerHTML = `
                <td>${item.congress_member}</td>
                <td>${item.Lobby}</td>
                <td>${item.lobby_contributions}</td>
                <td>
                    <button onclick="deleteCongressLobby(this, ${item.cid},${item.lid})">Delete</button>
                </td>
                <td>
                    <a href='#' onclick='javascript: alert("You can implement it just like the Add form.")'>Update</a>
                </td>
            `;
        });
        form.reset();
    })
    .catch(error => console.error('Error:', error));
});

function deleteCongressLobby(button, cid, lid) {
    const row = button.closest('tr');
    fetch(`/money-taken/lid/${lid}/congress/${cid}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            row.remove();
        }
    })
    .catch(error => console.error('Error:', error));
}
